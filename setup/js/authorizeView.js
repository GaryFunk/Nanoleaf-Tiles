//==============================================================================
/**
@file		authorizeView.js
@brief		Nanoleaf Plugin
@copyright	(c) 2021, fSoft, Ltd.
			This source code is licensed under the MIT-style license found in the LICENSE file.
**/
//==============================================================================

// Load the Authorize View
function loadAuthorizeView() {
	// Time used to automatically authorize controllers
	var autoCycleCount = 2;
	// Define local timer
	var timer = null;
	// Set the status bar
	setStatusBar('authorize');
	// Fill the header
	document.getElementById('header').innerHTML = localization['Header'];
	// Fill the title
	document.getElementById('title').innerHTML = localization['Authorize']['Title'];
	// Fill the content area
	var content = "<p>" + localization['Authorize']['Description'] + "</p></div><div id='controls'></div>";
	document.getElementById('content').innerHTML = content;

	// Start the authorization
	autoCycle();

	// For n seconds try to connect to the controller automatically
	function autoCycle() {
		// Define local timer counter
		var cycleCounter = 0;
		// Start a new timer to auto connect to the controller
		timer = setInterval(function () {
			if (cycleCounter < autoCycleCount) { // Try to connect for n seconds
				getAuthToken();
				cycleCounter++;
			} else { // If auto connect was not successful for n times, stop auto connecting and show controls
				// Stop the timer
				clearInterval(timer);
				timer = null;
				// Show manual user controls instead
				var controls = "<div class='button' id='retry'>" + localization['Authorize']['Retry'] + "</div><div class='button-transparent' id='cancel'>" + localization['Authorize']['Cancel'] + "</div>";
				document.getElementById('controls').innerHTML = controls;
				// Add event listener retry
				document.getElementById('retry').addEventListener('click', retry);
				document.addEventListener('enterPressed', retry);
				// Add event listener cancel
				document.getElementById('cancel').addEventListener('click', cancel);
				document.addEventListener('escPressed', cancel);
			}
		}, 1000)
	}

	// Try to authorize with all discovered controllers
	function getAuthToken() {
		nanoNeedIPs.forEach(function (item, index, object) {
			nanoIP = item;
			Nanoleaf.getauth( async function (status, data) {
				if (status) { // Authorization was successful
					nanoToken = data;
					result = await Nanoleaf.getinfo();
					if (result[0]) { // Authorization was successful
						var data = result[1];
						nanoName = data['name'];
						nanoSN = data['serialNo'];
						object.splice(index, 1);
						// Show the save view
						unloadAuthorizeView();
						loadSaveView();
					}
				}
			});
		});
	}

	// Retry authorize by reloading the view
	function retry() {
		unloadAuthorizeView();
		loadAuthorizeView();
	}

	// Close the window
	function cancel() {
		window.close();
	}

	// Unload view
	function unloadAuthorizeView() {
		// Stop the timer
		clearInterval(timer);
		timer = null;
		// Remove event listener
		document.removeEventListener('escPressed', retry);
		document.removeEventListener('enterPressed', cancel);
	}
}
