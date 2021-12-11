//==============================================================================
/**
@file		main.js
@brief		Nanoleaf Plugin
@copyright	(c) 2021, fSoft, Ltd.
			This source code is licensed under the MIT-style license found in the LICENSE file.
**/
//==============================================================================

// Global web socket
websocket = null;
// Global Plugin settings
window.buttons = {};
window.buttonsCache = [];
window.getGlobal = true;
window.hasGlobal = false;

window.nanoControllerCache = {status: ""};
window.nanoControllerIPs = [];
window.nanoControllers = {};
window.nanoIP = null;
window.nanoToken = null;

// Setup the websocket and handle communication
function connectElgatoStreamDeckSocket(inPort, inUUID, inRegisterEvent, inInfo) {
	// Create array of currently used actions
	var actions = {};
	var buttonLongPressTimeouts = new Map();

	// Open the web socket to Stream Deck
	// Use 127.0.0.1 because Windows needs 300ms to resolve localhost
	websocket = new WebSocket(`ws://127.0.0.1:${inPort}`);

	// Websocket is closed
	websocket.onclose = function (evt) {
		let reason = WebsocketError(evt);
		log(`Websocket closed: ${reason}`);
	};

	// Websocket received a message
	websocket.onerror = function (evt) {
		log(`Websocket error: ${evt} ${evt.data}`);
	};

	// Web socket is connected
	websocket.onopen = function () {
		// Register plugin to Stream Deck
		registerPluginOrPI(inRegisterEvent, inUUID);
		// Request the global settings of the plugin
		requestGlobalSettings(inUUID);
		window.getGlobal = false;
	};

	// Web socked received a message
	websocket.onmessage = function (inEvent) {
		// Parse parameter from string to object
		let jsonObj = JSON.parse(inEvent.data);
		let event = jsonObj["event"];
		let action = jsonObj["action"];
		let context = jsonObj["context"];
		let jsonPayload = jsonObj["payload"];
		let settings;
		let timerLP;
		// Events
		switch (event) {
			case "keyDown":
				timerLP = setTimeout(longPress, 600, context);
				buttonLongPressTimeouts.set(context, timerLP)
				settings = jsonPayload["settings"];
				break;
			case "keyUp":
				settings = jsonPayload["settings"];
				timerLP = buttonLongPressTimeouts.get(context);
				if (timerLP) {
					clearTimeout(timerLP);
					buttonLongPressTimeouts.delete(context)
				}
				let coordinates = jsonPayload["coordinates"];
				let state = jsonPayload["state"];
				let userDesiredState = jsonPayload["userDesiredState"];

				// Send onKeyUp event to actions
				if (context in actions) {
					// let nanoController = actions[context].getSettings().nanoController;
					actions[context].onKeyUp(context, settings, coordinates, userDesiredState, state);
				}
				break;
			case "willAppear":
				if (window.hasGlobal) {
					let state = null;
					let data = null;
					settings = jsonPayload["settings"];
					if (!("nanoController" in settings)) {
						return;
					}

					if (typeof jsonPayload["state"] !== undefined) {
						state = jsonPayload["state"];
					}

					if (!(settings.nanoController in window.buttons)) {
						window.buttons[settings.nanoController] = [];
					}

					let index = window.buttons[settings.nanoController].findIndex(x => x.context === context);
					if  (index === -1) {
						setButtons(settings, context, index);
					}

					// Add current instance if not in actions array
					if (!(context in actions)) {
						setActions(action, context, settings, state);
					}
				} else {
					window.buttonsCache.push(jsonObj);
				}
				break;
			case "willDisappear":
				// Remove current instance from array
				if (context in actions) {
					delete actions[context];
				}
				break;
			case "didReceiveGlobalSettings":
				// Set global settings
				if (jsonPayload["settings"]["nanoControllers"] !== undefined) {
					window.nanoControllers = jsonPayload["settings"]["nanoControllers"];
					// If at least one controller is configured build the nanoControllerCache
					if (Object.keys(window.nanoControllers).length > 0 && window.nanoControllerCache["status"] == "") {
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
			case "didReceiveSettings":
				settings = jsonPayload["settings"];
				// Set settings
				if (context in actions) {
					actions[context].setSettings(settings);
				}
				// Refresh the cache
				break;
			case "propertyInspectorDidAppear":
				// Send cache to PI
				let payLoad = {};
				payLoad.settings = window.nanoControllers;
				sendToPropertyInspector(action, context, payLoad);
				break;
			case "propertyInspectorDidDisappear":
				// Send data from PI and process it here as necessary
				break;
			case "sendToPlugin":
				let piEvent = jsonPayload["piEvent"];
				if (piEvent === "newController") {
					window.nanoControllerCache["status"] = "";
					requestGlobalSettings(inUUID);
				} else if (piEvent === "valueChanged") {
					settings = jsonPayload["settings"];
					// Set settings
					if (context in actions) {
						actions[context].setSettings(settings);
					}
					// Send manual onKeyUp event to action
					if (context in actions) {
						actions[context].onKeyUp(context, settings);
					}
				} else if (piEvent === "buttonChanged") {
					window.buttonsCache.push(jsonObj);
					_buttonsCache();
				} else if (piEvent === "setImage") {
					setImage(context, jsonPayload["inImage"], jsonPayload["inState"]);
				} else if (piEvent === "log") {
					log(jsonPayload["message"]);
					_buttonsCache();
				}
				break;
			case "systemDidWakeUp":
				// Request the global settings of the plugin
				requestGlobalSettings(inUUID);
				break;
			case "deviceDidConnect":
				// Request the global settings of the plugin
				if (window.getGlobal) {
					requestGlobalSettings(inUUID);
					window.getGlobal = false;
				}
				break;
			case "deviceDidDisconnect":
				// Request the global settings of the plugin
				if (!window.getGlobal) {
					requestGlobalSettings(inUUID);
				}
				window.getGlobal = true;
				break;
			case "titleParametersDidChange":
				break;
			default:
				log(`plugin/main.js onmessage() uncaught event: ${event}`);
		}

		function longPress(context) {
			let timerLP = buttonLongPressTimeouts.get(context);
			clearTimeout(timerLP);
			buttonLongPressTimeouts.delete(context);
			let inAction = action.split(".");
			switch (inAction[3]) {
				case "brightnessd":
				case "brightnessi":
/*
// Need to fix this soon
// This is a Value, not a State
					if (settings.transition == "increase") {
						jsonPayload["userDesiredState"] = "100";
						saveSettings(action, context, settings);
					} else if (settings.transition == "decrease") {
						jsonPayload["userDesiredState"] = "0";
						saveSettings(action, context, settings);
					}
*/
					break;
			}
		}
	};

	function setActions(action, context, settings, state) {
		let inAction = action.split(".");
		switch (inAction[3]) {
			case "brightness":
			case "brightnessd":
			case "brightnessi":
				actions[context] = new BrightAction(context, settings, state);
				break;
			case "brightcolor":
				actions[context] = new BrightColorAction(context, settings, state);
				break;
			case "color":
				actions[context] = new ColorAction(context, settings, state);
				break;
			case "effect":
				actions[context] = new EffectAction(context, settings, state);
				break;
			case "power":
				actions[context] = new PowerAction(context, settings, state);
				break;
			default:
				log(`plugin/main.js setActions() uncaught action: ${action}`);
		}
	}


	function getKeyByValue(object, value) {
		return Object.keys(object).find(key => object[key] === value);
	}

	function _buttonsCache() {
		let bTemp = window.buttonsCache;
		while (bTemp.length > 0) {
			let jsonObj = bTemp.pop();
			let action = jsonObj["action"];
			let context = jsonObj["context"];
			let jsonPayload = jsonObj["payload"];
			let state = null;
			let settings = jsonPayload["settings"];
			if (typeof jsonPayload["state"] !== undefined) {
				state = jsonPayload["state"];
			}
			if (!(settings.nanoController in window.buttons)) {
				window.buttons[settings.nanoController] = [];
			}
			let index = window.buttons[settings.nanoController].findIndex(x => x.context === context);
			if  (index === -1) {
				setButtons(settings, context, index);
			}
			// Add current instance if not in actions array
			if (!(context in actions)) {
				setActions(action, context, settings, state);
			}
		}
	}
}

function setButtons(settings, context, index) {
	let data;
	switch (settings.command) {
		case "brightness":
			data = {"command": settings.command, "context": context, "transition": settings.transition, "brightness": settings.brightness, "duration": settings.duration};
			break;
		case "brightcolor":
			data = {"command": settings.command, "context": context, "transition": settings.transition, "brightness": settings.brightness, "duration": settings.duration, "color": settings.color};
			break;
		case "color":
			data = {"command": settings.command, "context": context, "transition": settings.transition, "color": settings.color};
			break;
		case "effect":
			data = {"command": settings.command, "context": context, "transition": settings.transition, "select": settings.select};
			break;
		case "power":
			data = {"command": settings.command, "context": context, "transition": settings.transition, "on": settings.on};
			break;
		default:
			data = {};
			log(`plugin/main.js setButtons() uncaught command: ${settings.command}`);
	}
	if (index === -1) {
		window.buttons[settings.nanoController].push(data);
	} else {
		window.buttons[settings.nanoController][index] = data;
	}
}
