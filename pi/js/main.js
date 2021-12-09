//==============================================================================
/**
@file		pi main.js
@brief		Nanoleaf Plugin
@copyright	(c) 2021, fSoft, Ltd.
			This source code is licensed under the MIT-style license found in the LICENSE file.
**/
//==============================================================================

// Global web socket
var websocket = null;

// Global Plugin settings
window.name = "PI";
window.nanoControllerCache = {status: ""};
window.nanoControllerIPs = [];
window.nanoControllers = {};
window.nanoIP = null;
window.nanoToken = null;
window.settings = null;

let pi;
let setupWindow;
let globalSettings = {};

// Setup the websocket and handle communication
function connectElgatoStreamDeckSocket(inPort, inUUID, inRegisterEvent, inInfo, inActionInfo) {
	// Create array of currently used actions
	var actions = {};

	// Parse parameter from string to object
	let actionInfo = JSON.parse(inActionInfo);
	let info = JSON.parse(inInfo);
	let streamDeckVersion = info["application"]["version"];
	let pluginVersion = info["plugin"]["version"];

	// Set settings
	settings = actionInfo["payload"]["settings"];

	// Retrieve language
	let language = info["application"]["language"];

	// Retrieve action identifier
	let action = actionInfo["action"];

	// Public function to send data to the plugin
	const SendToPlugin = function (inData) {
		sendToPlugin(action, inUUID, inData);
	}

	// Open the websocket to Stream Deck
	// Use 127.0.0.1 because Windows needs 300ms to resolve localhost
	websocket = new WebSocket(`ws://127.0.0.1:${inPort}`);

	// Websocket is closed
	websocket.onclose = function (evt) {
		let reason = WebsocketError(evt);
		let inData = {};
		inData["piEvent"] = "log";
		inData["message"] = `Websocket closed: ${reason}`;
		SendToPlugin(inData);
	};

	// Websocket received a message
	websocket.onerror = function (evt) {
		let inData = {};
		inData["piEvent"] = "log";
		inData["message"] = `Websocket error: ${evt} ${evt.data}`;
		SendToPlugin(inData);
	};

	// Websocket received a message
	websocket.onmessage = function (inEvent) {
		// Received message from Stream Deck
		let jsonObj = JSON.parse(inEvent.data);
		let event = jsonObj["event"];
		let jsonPayload = jsonObj["payload"];
		let settings;

		// Events
		switch (event) {
			case "didReceiveGlobalSettings":
				// Set global settings
				if (jsonPayload["settings"]["nanoControllers"] !== undefined) {
					window.nanoControllers = jsonPayload["settings"]["nanoControllers"];
					// If at least one controller is configured build the nanoControllerCache
					if (Object.keys(window.nanoControllers).length > 0 && window.nanoControllerCache["status"] == "") {
						// Refresh the cache
						Nanoleaf.buildcache(function () {});
					}
				}
				break;
			case "didReceiveSettings":
				settings = jsonPayload["settings"];
				// Set settings
				if (context in actions) {
					actions[context].setSettings(settings);
				}
				break;
			case "sendToPropertyInspector":
				// Load controllers
				window.nanoControllers = jsonPayload["settings"];
				if ((window.nanoControllers == null) || (window.nanoControllers == undefined)) {
					window.nanoControllers = {};
				}
				if (Object.keys(window.nanoControllers).length > 0 && window.nanoControllerCache["status"] == "") {
					// Refresh the cache
					Nanoleaf.buildcache( function () {});
					pi.loadControllers();
				} else {
					pi.loadControllers();
				}
				break;
			default:
				let inData = {};
				inData["piEvent"] = "log";
				inData["message"] = `pi/main.js line 119 uncaught event: ${event}`;
				SendToPlugin(inData);
		}
	};

	// WebSocket is connected, send message
	websocket.onopen = function () {
		// Register property inspector to Stream Deck
		registerPluginOrPI(inRegisterEvent, inUUID);

		// Request the global settings of the plugin
		requestGlobalSettings(inUUID);
	};

	// Create actions
	if (action === "com.fsoft.nanoleaf.power") {
		pi = new PowerPI(inUUID, language, streamDeckVersion, pluginVersion);
	} else if (action === "com.fsoft.nanoleaf.bright" || action === "com.fsoft.nanoleaf.brightd" || action === "com.fsoft.nanoleaf.brighti") {
		pi = new BrightPI(inUUID, language, streamDeckVersion, pluginVersion, action);
	} else if (action === "com.fsoft.nanoleaf.brightcolor") {
		pi = new BrightColorPI(inUUID, language, streamDeckVersion, pluginVersion);
	} else if (action === "com.fsoft.nanoleaf.color") {
		pi = new ColorPI(inUUID, language, streamDeckVersion, pluginVersion);
	} else if (action === "com.fsoft.nanoleaf.effect") {
		pi = new EffectPI(inUUID, language, streamDeckVersion, pluginVersion);
	}
}
