//==============================================================================
/**
@file		setup main.js
@brief		Nanoleaf Plugin
@copyright	(c) 2021, fSoft, Ltd.
			This source code is licensed under the MIT-style license found in the LICENSE file.
**/
//==============================================================================

// Global setup settings

setupWindow = window.window;
setupWindow.localization = null;
setupWindow.localIP;

// Global variables containting the IP addresses to discovered controllers
setupWindow.settings = {};
setupWindow.nanoHaveIPs = [];
setupWindow.nanoNeedIPs = [];
setupWindow.nanoControllerIPs = [];

function closeSetup() {
	setupWindow.close();
}

function exitSetup() {
	window.opener.document.getElementById('controller-select').value = 'blank-controller';
	setupWindow.close();
}

/*
function getLocal//IP() {
	return new Promise(function (resolve, reject) {
		// https://www.c-sharpcorner.com/blogs/getting-client-ip-address-or-local-ip-address-in-javascript
		var RTCPeerConnection = / *setupWindow.RTCPeerConnection ||* / setupWindow.webkitRTCPeerConnection || setupWindow.mozRTCPeerConnection;

		if (!RTCPeerConnection) {
			reject('Unable to discover controllers because Local Host IP is unavailable.');
		}

		var rtc = new RTCPeerConnection({
			iceServers: []
		})

		if (1 || setupWindow.mozRTCPeerConnection) {
			rtc.createDataChannel('', {
				reliable: false
			});
		}

		rtc.createOffer(function (offerDesc) {
			rtc.setLocalDescription(offerDesc);
		}, function (e) {
			//log("offer failed: " + e);
		});

		rtc.onicecandidate = function (evt) {
			if (evt.candidate) {
				var local//IP = grepSDP("a=" + evt.candidate.candidate);
				resolve(local//IP);
			} else {
				var local//IP = '';
				resolve(local//IP);
			}
		};
	});
};

function grepSDP(sdp) {
	return new Promise(resolve => {
		local//IP = '';
		sdp.split('\r\n').forEach(function (line) {
			if (~line.indexOf("a=candidate")) {
				var parts = line.split(' '), addr = parts[4], type = parts[7];
				if (type === 'host') {
					local//IP = addr;
				}
			} else if (~line.indexOf("c=")) {
				var parts = line.split(' '), addr = parts[2];
				local//IP = addr;
			}
		});
		var ipformat = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
		if (local//IP.match(ipformat)) {
			resolve(local//IP);
		} else {
			local//IP = 'error';
			resolve(local//IP);
		}
	});
}
*/

// Global function to set the status bar to the correct view
function setStatusBar(view) {
	// Remove active status from all status cells
	var statusCells = document.getElementsByClassName('status-cell');
	Array.from(statusCells).forEach(function (cell) {
		cell.classList.remove('active');
	});
	// Set it only to the current one
	document.getElementById('status-' + view).classList.add('active');
}

// Main function run after the page is fully loaded
setupWindow.onload = async function () { // Bind Enter and ESC keys
	document.addEventListener('keydown', function (e) {
		var key = e.which || e.keyCode;
		if (key === 13) {
			var event = new CustomEvent('enterPressed');
			document.dispatchEvent(event);
		} else if (key === 27) {
			var event = new CustomEvent('escPressed');
			document.dispatchEvent(event);
		}
	});

	// Get the host local IP
	// local//IP = await getLocal//IP();
	localIP = '';
	// Get the url parameter
	var url = new URL(setupWindow.location.href);
	var language = url.searchParams.get('language');
	setupWindow.nanoControllerIPs = JSON.parse(url.searchParams.get('nanoControllerIPs'));
	// Load the localizations
	getLocalization(language, function (inStatus, inLocalization) {
		if (inStatus) {
			// Save the localizations globally
			setupWindow.localization = inLocalization['Setup'];
			// Show the intro view
			loadIntroView();
		} else {
			document.getElementById('content').innerHTML = '<p>' + inLocalization + '</p>';
		}
	});
};
