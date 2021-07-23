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

// Setup the websocket and handle communication
function connectElgatoStreamDeckSocket(inPort, inUUID, inRegisterEvent, inInfo) {
	// Create array of currently used actions
	var actions = {};

	// Add event listener
	document.addEventListener('newCacheAvailable', function () {
		// When a new cache is available
		Object.keys(actions).forEach(function (inContext) {
			// Inform all used actions that a new cache is available
			actions[inContext].newCacheAvailable(function () {
				var action;
				// Find out type of action
				if (actions[inContext] instanceof PowerAction) {
					action = 'com.fsoft.nanoleaf.power';
				} else if (actions[inContext] instanceof BrightnessAction) {
					action = 'com.fsoft.nanoleaf.brightness';
				} else if (actions[inContext] instanceof ColorAction) {
					action = 'com.fsoft.nanoleaf.color';
				} else if (actions[inContext] instanceof EffectsAction) {
					action = 'com.fsoft.nanoleaf.effects';
				}
				// Inform PI of new cache
				sendToPropertyInspector(action, inContext, globalSettings);
			});
		});
	}, false);

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
		// Key up event
		if (event === 'keyUp') {
			settings = jsonPayload['settings'];
			var coordinates = jsonPayload['coordinates'];
			var userDesiredState = jsonPayload['userDesiredState'];
			var state = jsonPayload['state'];
			// Send onKeyUp event to actions
			if (context in actions) {
				actions[context].onKeyUp(context, settings, coordinates, userDesiredState, state);
			}
		} else if (event === 'willAppear') {
			settings = jsonPayload['settings'];
			// If this is the first visible action
			if (Object.keys(actions).length === 0) {
				// Start polling
			}
			// Add current instance is not in actions array
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
		} else if (event === 'willDisappear') {
			// Remove current instance from array
			if (context in actions) {
				delete actions[context];
			}
			// If this is the last visible action
			if (Object.keys(actions).length === 0) {
				// Stop polling
			}
		} else if (event === 'didReceiveGlobalSettings') {
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
			// Refresh the cache
		} else if (event === 'propertyInspectorDidAppear') {
			// Send cache to PI
			var payLoad = {};
			payLoad.settings = globalSettings;
			sendToPropertyInspector(action, context, payLoad);
		} else if (event === 'sendToPlugin') {
			var piEvent = jsonPayload['piEvent'];
		}
	};

	// Web socket is connected
	window.websocket.onopen = function () {
		// Register plugin to Stream Deck
		registerPluginOrPI(inRegisterEvent, inUUID);
		// Request the global settings of the plugin
		requestGlobalSettings(inUUID);
	};
}
