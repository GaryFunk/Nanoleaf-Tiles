//==============================================================================
/**
@file		pi main.js
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
window.name = "PI";

var setupWindow;

// Setup the websocket and handle communication
function connectElgatoStreamDeckSocket(inPort, inUUID, inRegisterEvent, inInfo, inActionInfo) {
	// Parse parameter from string to object
	var actionInfo = JSON.parse(inActionInfo);
	var info = JSON.parse(inInfo);
	var streamDeckVersion = info['application']['version'];
	var pluginVersion = info['plugin']['version'];
	// Set settings
	settings = actionInfo['payload']['settings'];
	// Retrieve language
	var language = info['application']['language'];
	// Retrieve action identifier
	var action = actionInfo['action'];

	// Open the websocket to Stream Deck
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

	// Websocket received a message
	window.websocket.onmessage = function (inEvent) {
		// Received message from Stream Deck
		var jsonObj = JSON.parse(inEvent.data);
		var event = jsonObj['event'];
		var jsonPayload = jsonObj['payload'];
		var settings;
		if (event === 'didReceiveGlobalSettings') {
			// Set global settings
			window.globalSettings = jsonPayload['settings'];
			if (window.globalSettings.nanoControllers !== undefined) {
				window.nanoCache = jsonPayload['settings']['nanoControllers'];
				// If at least one controller is configured build the controllerCache
				if (Object.keys(window.nanoCache).length > 0 && window.controllerCache['status'] == "") {
					// Refresh the cache
					Nanoleaf.buildcache()
				}
			}
		} else if (event === 'didReceiveSettings') {
			settings = jsonPayload['settings'];
			// Set settings
			if (context in actions) {
				actions[context].setSettings(settings);
			}
		} else if (event === 'sendToPropertyInspector') {
			// Load controllers
			window.globalSettings = jsonPayload['settings'];
			window.nanoCache = jsonPayload['settings']['nanoControllers'];
			if ((window.nanoCache == null) || (window.nanoCache == undefined)) {
				window.nanoCache = {};
			}
			if (Object.keys(window.nanoCache).length > 0 && window.controllerCache['status'] == "") {
				Nanoleaf.buildcache()
				// Refresh the cache
				pi.loadControllers();
			} else {
				pi.loadControllers();
			}
		}
	};

	// WebSocket is connected, send message
	window.websocket.onopen = function () {
		// Register property inspector to Stream Deck
		registerPluginOrPI(inRegisterEvent, inUUID);
		// Request the global settings of the plugin
		requestGlobalSettings(inUUID);
	};

	// Create actions
	var pi;
	if (action === 'com.fsoft.nanoleaf.power') {
		pi = new PowerPI(inUUID, language, streamDeckVersion, pluginVersion);
	} else if (action === 'com.fsoft.nanoleaf.brightness') {
		pi = new BrightnessPI(inUUID, language, streamDeckVersion, pluginVersion);
	} else if (action === 'com.fsoft.nanoleaf.color') {
		pi = new ColorPI(inUUID, language, streamDeckVersion, pluginVersion);
	} else if (action === 'com.fsoft.nanoleaf.effects') {
		pi = new EffectsPI(inUUID, language, streamDeckVersion, pluginVersion);
	}
}
