//==============================================================================
/**
@file		utils.js
@brief		Nanoleaf Plugin
@copyright	(c) 2019, Corsair Memory, Inc.
			This source code is licensed under the MIT-style license found in the LICENSE file.
**/
//==============================================================================

// Load the localizations
function getLocalization(inLanguage, inCallback) {
	var URL = '../' + inLanguage + '.json';
	var XHR = new XMLHttpRequest();
	XHR.open('GET', URL, true);

	XHR.onload = function () {
		if (XHR.readyState === XMLHttpRequest.DONE) {
			try {
				data = JSON.parse(XHR.responseText);
				var localization = data['Localization'];
				inCallback(true, localization);
			} catch (e) {
				console.warn(e);
				inCallback(false, 'Localizations is not a valid json.');
			}
		} else {
			inCallback(false, 'Could not load the localizations.');
		}
	};

	XHR.onerror = function () {
		inCallback(false, 'An error occurred while loading the localizations.');
	};

	XHR.ontimeout = function () {
		inCallback(false, 'Localization timed out.');
	};

	XHR.send();
}

// Log to the global log file
function log(inMessage) {
	// Log to the developer console
	var time = new Date();
	var timeString = time.toLocaleDateString() + ' ' + time.toLocaleTimeString();
	// Log to the Stream Deck log file
	if (websocket) {
		var json = {
			'event': 'logMessage',
			'payload': {
				'message': inMessage
			}
		};
		window.websocket.send(JSON.stringify(json));
	}
}

// Register the plugin or PI
function registerPluginOrPI(inEvent, inUUID) {
	if (websocket) {
		var json = {
			'event': inEvent,
			'uuid': inUUID
		};
		window.websocket.send(JSON.stringify(json));
	}
}

// Request global settings for the plugin
function requestGlobalSettings(inUUID) {
	if (websocket) {
		var json = {
			'event': 'getGlobalSettings',
			'context': inUUID
		};
		window.websocket.send(JSON.stringify(json));
	}
}

// Save global settings
function saveGlobalSettings(inUUID) {
	if (websocket) {
		const json = {
			'event': 'setGlobalSettings',
			'context': inUUID,
			'payload': window.globalSettings
		};
		window.websocket.send(JSON.stringify(json));
	}
}

// Save settings
function saveSettings(inAction, inUUID, inSettings) {
	if (websocket) {
		const json = {
			'action': inAction,
			'event': 'setSettings',
			'context': inUUID,
			'payload': inSettings
		};
		window.websocket.send(JSON.stringify(json));
	}
}

// Set data to plugin
function sendToPlugin(inAction, inContext, inData) {
	if (websocket) {
		var json = {
			'action': inAction,
			'event': 'sendToPlugin',
			'context': inContext,
			'payload': inData
		};
		window.websocket.send(JSON.stringify(json));
	}
}

// Set data to PI
function sendToPropertyInspector(inAction, inContext, inData) {
	if (websocket) {
		var json = {
			'action': inAction,
			'event': 'sendToPropertyInspector',
			'context': inContext,
			'payload': inData
		};
		window.websocket.send(JSON.stringify(json));
	}
}

// Set the state of a key
function setState(inContext, inState) {
	if (websocket) {
		var json = {
			'event': 'setState',
			'context': inContext,
			'payload': {
				'state': inState
			}
		};
		window.websocket.send(JSON.stringify(json));
	}
}

// Set the title of a key
this.setTitle = function (inContext, inTitle) {
	if (websocket) {
		var json = {
			"event": "setTitle",
			"context": inContext,
			"payload": {
				"title": "" + inTitle,
				"target": 0
			}
		};
		window.websocket.send(JSON.stringify(json));
	}
};

// Show alert icon on the key
function showAlert(inUUID) {
	if (websocket) {
		var json = {
			'event': 'showAlert',
			'context': inUUID
		};
		window.websocket.send(JSON.stringify(json));
	}
}

function WebsocketError(evt) {
	// Websocket closed
	var reason = '';
	if (evt.code === 1000) {
		reason = 'Normal Closure. The purpose for which the connection was established has been fulfilled.';
	} else if (evt.code === 1001) {
		reason = 'Going Away. An endpoint is "going away", such as a server going down or a browser having navigated away from a page.';
	} else if (evt.code === 1002) {
		reason = 'Protocol error. An endpoint is terminating the connection due to a protocol error';
	} else if (evt.code === 1003) {
		reason = "Unsupported Data. An endpoint received a type of data it doesn't support.";
	} else if (evt.code === 1004) {
		reason = '--Reserved--. The specific meaning might be defined in the future.';
	} else if (evt.code === 1005) {
		reason = 'No Status. No status code was actually present.';
	} else if (evt.code === 1006) {
		reason = 'Abnormal Closure. The connection was closed abnormally, e.g., without sending or receiving a Close control frame';
	} else if (evt.code === 1007) {
		reason = 'Invalid frame payload data. The connection was closed, because the received data was not consistent with the type of the message (e.g., non-UTF-8 [http://tools.ietf.org/html/rfc3629]).';
	} else if (evt.code === 1008) {
		reason = 'Policy Violation. The connection was closed, because current message data "violates its policy". This reason is given either if there is no other suitable reason, or if there is a need to hide specific details about the policy.';
	} else if (evt.code === 1009) {
		reason = 'Message Too Big. Connection closed because the message is too big for it to process.';
	} else if (evt.code === 1010) { // Note that this status code is not used by the server, because it can fail the WebSocket handshake instead.
		reason = "Mandatory Ext. Connection is terminated the connection because the server didn't negotiate one or more extensions in the WebSocket handshake. <br /> Mandatory extensions were: " + evt.reason;
	} else if (evt.code === 1011) {
		reason = 'Internl Server Error. Connection closed because it encountered an unexpected condition that prevented it from fulfilling the request.';
	} else if (evt.code === 1015) {
		reason = "TLS Handshake. The connection was closed due to a failure to perform a TLS handshake (e.g., the server certificate can't be verified).";
	} else {
		reason = 'Unknown reason';
	}
	return reason;
}
