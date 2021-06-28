//==============================================================================
/**
@file		setup main.js
@brief		Nanoleaf Plugin
@copyright	(c) 2021, fSoft, Ltd.
			This source code is licensed under the MIT-style license found in the LICENSE file.
**/
//==============================================================================

// Global setup settings
window.localization = null;
window.globalSettings = {};
window.localIP = null;
// Global variables containting the IP addresses to discovered controllers
var settings = {};
var nanoHaveIPs = [];
var nanoNeedIPs = [];
var nanoIP = null;
var nanoCacheIPs = [];
var nanoToken = null;
var nanoSN = null;
var nanoName = null;
var nanoCache = {};

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

function grepSDP(sdp) {
	return new Promise(resolve => {
		localIP = '';
		sdp.split('\r\n').forEach(function (line) {
			if (~line.indexOf("a=candidate")) {
				var parts = line.split(' '), addr = parts[4], type = parts[7];
				if (type === 'host') {
					localIP = addr;
				}
			} else if (~line.indexOf("c=")) {
				var parts = line.split(' '), addr = parts[2];
				localIP = addr;
			}
		});
		var ipformat = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
		if (localIP.match(ipformat)) {
			resolve(localIP);
		} else {
			localIP = 'error';
			resolve(localIP);
		}
	});
}

function getLocalIP() {
	return new Promise(function (resolve, reject) {
		// https://www.c-sharpcorner.com/blogs/getting-client-ip-address-or-local-ip-address-in-javascript
		var RTCPeerConnection = /*window.RTCPeerConnection ||*/ window.webkitRTCPeerConnection || window.mozRTCPeerConnection;

		if (!RTCPeerConnection) {
			reject('Unable to discover controllers because Local Host IP is unavailable.');
		}

		var rtc = new RTCPeerConnection({
			iceServers: []
		});

		if (1 || window.mozRTCPeerConnection) {
			rtc.createDataChannel('', {
				reliable: false
			});
		};

		rtc.createOffer(function (offerDesc) {
			rtc.setLocalDescription(offerDesc);
		}, function (e) {
			console.warn("offer failed", e);
		});

		rtc.onicecandidate = function (evt) {
			if (evt.candidate) {
				var localIP = grepSDP("a=" + evt.candidate.candidate);
				resolve(localIP);
			} else {
				var localIP = '';
				resolve(localIP);
			}
		};
	});
}

// Main function run after the page is fully loaded
window.onload = async function () { // Bind Enter and ESC keys
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
	localIP = await getLocalIP();
	// Get the url parameter
	var url = new URL(window.location.href);
	var language = url.searchParams.get('language');
	nanoCacheIPs = JSON.parse(url.searchParams.get('nanoCacheIPs'));

	// Load the localizations
	getLocalization(language, function (inStatus, inLocalization) {
		if (inStatus) {
			// Save the localizations globally
			localization = inLocalization['Setup'];
			// Show the intro view
			loadIntroView();
		} else {
			document.getElementById('content').innerHTML = '<p>' + inLocalization + '</p>';
		}
	});
};
