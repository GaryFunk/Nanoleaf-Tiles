//==============================================================================
/**
@file		main.js
@brief		Nanoleaf Plugin
@copyright	(c) 2021, fSoft, Ltd.
			This source code is licensed under the MIT-style license found in the LICENSE file.
**/
//==============================================================================

// Global web socket
window.websocket = null;
// Global Plugin settings
window.nanoControllerCache = {status: ""};
window.nanoControllers = {};
window.nanoIP = null;
window.nanoToken = null;

window.nanoControllerIPs = [];
window.getGlobal = true;
window.hasGlobal = false;
window.buttons = {};
window.buttonsCache = [];

// Setup the websocket and handle communication
function connectElgatoStreamDeckSocket(inPort, inUUID, inRegisterEvent, inInfo) {
	// Create array of currently used actions
	var actions = {};
	var buttonLongpressTimeouts = new Map();

	// Open the web socket to Stream Deck
	// Use 127.0.0.1 because Windows needs 300ms to resolve localhost
	window.websocket = new WebSocket('ws://127.0.0.1:' + inPort);

	// Websocket is closed
	window.websocket.onclose = function (evt) {
		var reason = WebsocketError(evt);
		log('Websocket closed: ' + reason);
	};

	// Websocket received a message
	window.websocket.onerror = function (evt) {
		log('Websocket error: ' + evt + ' ' + evt.data);
	};

	// Web socked received a message
	window.websocket.onmessage = function (inEvent) {
		// Parse parameter from string to object
		var jsonObj = JSON.parse(inEvent.data);
		var event = jsonObj['event'];
		var action = jsonObj['action'];
		var context = jsonObj['context'];
		var jsonPayload = jsonObj['payload'];
		var settings;
		var timerLP;
		// Events
		switch (event) {
			case 'keyDown':
				timerLP = setTimeout(longPress, 600, context);
				buttonLongpressTimeouts.set(context, timerLP)
				settings = jsonPayload['settings'];
				break;
			case 'keyUp':
				settings = jsonPayload['settings'];
console.log(settings);
				timerLP = buttonLongpressTimeouts.get(context);
				if (timerLP) {
					clearTimeout(timerLP);
					buttonLongpressTimeouts.delete(context)
				}
				var coordinates = jsonPayload['coordinates'];
				var userDesiredState = settings['userDesiredState'];
				delete settings['userDesiredState'];
				saveSettings(action, context, settings);
				var state = jsonPayload['state'];

				// Send onKeyUp event to actions
				if (context in actions) {
					var nanoController = actions[context].getSettings().nanoController;
					actions[context].onKeyUp(context, settings, coordinates, userDesiredState, state);
				}
				break;
			case 'willAppear':
				if (window.hasGlobal) {
					var state = null;
					settings = jsonPayload['settings'];
					if (!('nanoController' in settings)) {
						return;
					}

					if (typeof jsonPayload['state'] !== 'undefined') {
						state = jsonPayload['state'];
					}

					if (!(settings.nanoController in window.buttons)) {
						window.buttons[settings.nanoController] = [];
					}

					if (!(window.buttons[settings.nanoController].find(x => x.context === context))) {
						var data = {"command": settings.command, "context": context};
						window.buttons[settings.nanoController].push(data);
					}

					// Add current instance if not in actions array
					if (!(context in actions)) {
						// Add current instance to array
						if (action === 'com.fsoft.nanoleaf.power') {
							actions[context] = new PowerAction(context, settings, state);
						} else if (action === 'com.fsoft.nanoleaf.brightness' || action === 'com.fsoft.nanoleaf.brightnessd' || action === 'com.fsoft.nanoleaf.brightnessi') {
							actions[context] = new BrightnessAction(context, settings, state);
						} else if (action === 'com.fsoft.nanoleaf.color') {
							actions[context] = new ColorAction(context, settings, state);
						} else if (action === 'com.fsoft.nanoleaf.effect') {
							actions[context] = new EffectAction(context, settings, state);
						}
					}
				} else {
					window.buttonsCache.push(jsonObj);
				}
				break;
			case 'willDisappear':
				// Remove current instance from array
				if (context in actions) {
					delete actions[context];
				}
				break;
			case 'didReceiveGlobalSettings':
				// Set global settings
				if (jsonPayload['settings']['nanoControllers'] !== undefined) {
					window.nanoControllers = jsonPayload['settings']['nanoControllers'];
					// If at least one controller is configured build the nanoControllerCache
					if (Object.keys(window.nanoControllers).length > 0 && window.nanoControllerCache['status'] == "") {
						// Refresh the cache
						Nanoleaf.buildcache( function () {
							window.hasGlobal = true;
							if (window.buttonsCache.length > 0) {
								_buttonsCache();
							}
						});
					}
				}
				break;
			case 'didReceiveSettings':
				settings = jsonPayload['settings'];
				// Set settings
				if (context in actions) {
					actions[context].setSettings(settings);
				}
				// Refresh the cache
				break;
			case 'propertyInspectorDidAppear':
				// Send cache to PI
				var payLoad = {};
				payLoad.settings = window.nanoControllers;
				sendToPropertyInspector(action, context, payLoad);
				break;
			case 'propertyInspectorDidDisappear':
				// Send data from PI and process it here as necessary
				break;
			case 'sendToPlugin':
				var piEvent = jsonPayload['piEvent'];
				if (piEvent === 'newController') {
					window.nanoControllerCache['status'] = "";
					requestGlobalSettings(inUUID);
				} else if (piEvent === 'valueChanged') {
					// Send manual onKeyUp event to action
					if (context in actions) {
						actions[context].onKeyUp(context);
					}
				} else if (piEvent === 'buttonChanged') {
					window.buttonsCache.push(jsonObj);
					_buttonsCache();
				}
				break;
			case 'systemDidWakeUp':
				// Request the global settings of the plugin
				requestGlobalSettings(inUUID);
				break;
			case 'deviceDidConnect':
				// Request the global settings of the plugin
				if (window.getGlobal) {
					requestGlobalSettings(inUUID);
					window.getGlobal = false;
				}
				break;
			case 'deviceDidDisconnect':
				// Request the global settings of the plugin
				if (!window.getGlobal) {
					requestGlobalSettings(inUUID);
				}
				window.getGlobal = true;
				break;
			default:
				log('plugin/main.js line 192 uncaught event: ' + event);
		}

		function longPress(context) {
			var timerLP = buttonLongpressTimeouts.get(context);
			clearTimeout(timerLP);
			buttonLongpressTimeouts.delete(context)
			if (action === 'com.fsoft.nanoleaf.brightness' || action === 'com.fsoft.nanoleaf.brightnessd' || action === 'com.fsoft.nanoleaf.brightnessi') {
				if (settings.transition == 'increase') {
					settings["userDesiredState"] = "100";
					saveSettings(action, context, settings);
				} else if (settings.transition == 'decrease') {
					settings["userDesiredState"] = "0";
					saveSettings(action, context, settings);
				}
			}
		}
	};

	// Web socket is connected
	window.websocket.onopen = function () {
		// Register plugin to Stream Deck
		registerPluginOrPI(inRegisterEvent, inUUID);
		// Request the global settings of the plugin
		requestGlobalSettings(inUUID);
		window.getGlobal = false;

	};

	function getKeyByValue(object, value) {
		return Object.keys(object).find(key => object[key] === value);
	}

	function _buttonsCache() {
		let bTemp = window.buttonsCache;
		while (bTemp.length > 0) {
			var jsonObj = bTemp.pop();
			var action = jsonObj['action'];
			var context = jsonObj['context'];
			var jsonPayload = jsonObj['payload'];
			var state = null;
			var settings = jsonPayload['settings'];
			if (typeof jsonPayload['state'] !== 'undefined') {
				state = jsonPayload['state'];
			}
			if (!(settings.nanoController in window.buttons)) {
				window.buttons[settings.nanoController] = [];
			}
			if (!(window.buttons[settings.nanoController].find(x => x.context === context))) {
				var data = {"command": settings.command, "context": context};
				window.buttons[settings.nanoController].push(data);
			}
			// Add current instance if not in actions array
			if (!(context in actions)) {
				// Add current instance to array
				if (action === 'com.fsoft.nanoleaf.power') {
					actions[context] = new PowerAction(context, settings, state);
				} else if (action === 'com.fsoft.nanoleaf.brightness' || action === 'com.fsoft.nanoleaf.brightnessd' || action === 'com.fsoft.nanoleaf.brightnessi') {
					actions[context] = new BrightnessAction(context, settings, state);
				} else if (action === 'com.fsoft.nanoleaf.color') {
					actions[context] = new ColorAction(context, settings, state);
				} else if (action === 'com.fsoft.nanoleaf.effect') {
					actions[context] = new EffectAction(context, settings, state);
				}
			}
		}
	}
}
