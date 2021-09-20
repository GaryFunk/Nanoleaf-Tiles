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
window.controllerCache = {status: ""};
window.globalSettings = {};
window.nanoIP = null;
window.nanoToken = null;
window.nanoCache = {};
window.nanoCacheIPs = [];
window.dt;
window.startup;
window.getGlobal = true;

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
		console.warn('Websocket closed: ', reason);
	};

	// Websocket received a message
	window.websocket.onerror = function (evt) {
		console.warn('Websocket error', evt, evt.data);
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
				console.log('keyup');
				timerLP = buttonLongpressTimeouts.get(context);
				if (timerLP) {
					clearTimeout(timerLP);
					buttonLongpressTimeouts.delete(context)
				}
				settings = jsonPayload['settings'];
				var coordinates = jsonPayload['coordinates'];
				var userDesiredState = settings['userDesiredState'];
				delete settings['userDesiredState'];
				saveSettings(action, context, settings);
				var state = jsonPayload['state'];
				// Send onKeyUp event to actions
				if (context in actions) {
					var nanoController = actions[context].getSettings().nanoController;
					for (inContext in actions) {
						var setIngs = actions[inContext].getSettings();
						if (setIngs['nanoController'] === nanoController) {
							if (actions[inContext].constructor.name === 'PowerAction' && inContext !== context) {
								var nanoKey = '"' + nanoController + '"';
								var nanoSN = nanoController;
								var NF = window.controllerCache[nanoKey];
								var nanoInfo = NF.getInfo();
								nanoInfo.state.on.value = 1;
								setState(inContext, 1);
								setTitle(inContext, 'On');
							}
						}
					}
					actions[context].onKeyUp(context, settings, coordinates, userDesiredState, state);
				}
				break;
			case 'willAppear':
				settings = jsonPayload['settings'];
				// Add current instance if not in actions array
				if (!(context in actions)) {
					// Add current instance to array
					if (action === 'com.fsoft.nanoleaf.power') {
						actions[context] = new PowerAction(context, settings);
					} else if (action === 'com.fsoft.nanoleaf.brightness') {
						actions[context] = new BrightnessAction(context, settings);
					} else if (action === 'com.fsoft.nanoleaf.color') {
						actions[context] = new ColorAction(context, settings);
					} else if (action === 'com.fsoft.nanoleaf.effects') {
						actions[context] = new EffectsAction(context, settings);
					}
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
				// console.log('didReceiveGlobalSettings');
				// console.log(jsonPayload);
				window.globalSettings = jsonPayload['settings'];
				if (window.globalSettings.nanoControllers !== undefined) {
					window.nanoCache = jsonPayload['settings']['nanoControllers'];
					// If at least one controller is configured build the controllerCache
					if (Object.keys(window.nanoCache).length > 0 && window.controllerCache['status'] == "") {
						// Refresh the cache
						Nanoleaf.buildcache()
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
				payLoad.settings = globalSettings;
				sendToPropertyInspector(action, context, payLoad);
				break;
			case 'sendToPlugin':
				var piEvent = jsonPayload['piEvent'];
				if (piEvent === 'newController') {
					// console.log('sendToPlugin');
					window.controllerCache['status'] = "";
					requestGlobalSettings(inUUID);
				}
				break;
			case 'systemDidWakeUp':
				// Request the global settings of the plugin
				// console.log('systemDidWakeUp');
				requestGlobalSettings(inUUID);
				break;
			case 'deviceDidConnect':
				// Request the global settings of the plugin
				if (window.getGlobal) {
					// console.log('deviceDidConnect');
					requestGlobalSettings(inUUID);
					window.getGlobal = false;
				}
				break;
			case 'deviceDidDisconnect':
				// Request the global settings of the plugin
				if (!window.getGlobal) {
					// console.log('deviceDidConnect');
					requestGlobalSettings(inUUID);
					window.getGlobal = true;
				}
				break;
			default:
				// console.log('event = ', event);
				// console.log('-------------------');
		}

		function longPress(context) {
			console.log('longPress', action);
			var timerLP = buttonLongpressTimeouts.get(context);
			clearTimeout(timerLP);
			buttonLongpressTimeouts.delete(context)
			if (action === 'com.fsoft.nanoleaf.brightness') {
				settings["userDesiredState"] = "100";
				saveSettings(action, context, settings);
			}
		}
	};

	// Web socket is connected
	window.websocket.onopen = function () {
		// Register plugin to Stream Deck
		registerPluginOrPI(inRegisterEvent, inUUID);
		// Request the global settings of the plugin
		requestGlobalSettings(inUUID);
	};

	function getKeyByValue(object, value) {
		return Object.keys(object).find(key => object[key] === value);
	}
}

