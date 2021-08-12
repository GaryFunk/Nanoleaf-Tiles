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
	// Set a global variable
	var detail = {};
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
	async function autoCycle() {
		// Define local timer counter
		var cycleCounter = 0;
		var timer = null;
		// Start a new timer to auto connect to the controller
			if (cycleCounter < autoCycleCount) { // Try to connect for n seconds
				await getAuthToken();
				if ('nanoIP' in detail) {
					autoCycleCount = 0;
					clearInterval(timer);
				}
				cycleCounter++;
			} else { // If auto connect was not successful for n times, stop auto connecting and show controls
				// Stop the timer
				clearInterval(timer);
				// Show manual user controls instead
				var controls = "<div class='button' id='retry'>" + localization['Authorize']['Retry'] + "</div><div class='button-transparent' id='exit'>" + localization['Authorize']['Exit'] + "</div>";
				document.getElementById('content').innerHTML = controls;
				// Add event listener retry
				document.getElementById('retry').addEventListener('click', retry);
				document.addEventListener('enterPressed', retry);
				// Add event listener exit
				document.getElementById('exit').addEventListener('click', exit);
				document.addEventListener('escPressed', exit);
			}
	}

	// Retry authorize by reloading the view
	function continueSave() {
		unloadAuthorizeView();
		loadSaveView(detail);
	}

	// Close the window
	function exit() {
		exitSetup();
	}

	// Try to authorize with all discovered controllers
	async function getAuthToken() {
		window.nanoNeedIPs.some(function (item, index, object) {
			var nanoIP = item;
			Nanoleaf.getauth(nanoIP, async function (status, data) {
				if (status) { // Authorization was successful
					var nanoToken = data;
					var result = await Nanoleaf.getinfo(nanoIP, nanoToken);
					if (result[0]) { // Authorization was successful
						// Stop the timer
						clearInterval(timer);
						timer = null;
						var data = result[1];
						detail['nanoIP'] = nanoIP;
						detail['nanoName'] = data['name'];
						detail['nanoSN'] = data['serialNo'];
						detail['nanoToken'] = nanoToken;
						object.splice(index, 1);
						// Show the save view
						wait();
					}
<<<<<<< Updated upstream
=======
				} else {
					console.warn('failed to get item', index);
				}
				if (theCount == window.nanoNeedIPs.length) {
					autoCycle();
>>>>>>> Stashed changes
				}
			});
		});
	}

	// Retry authorize by reloading the view
	function retry() {
		unloadAuthorizeView();
		loadAuthorizeView();
	}

	// Unload view
	function unloadAuthorizeView() {
		// Stop the timer
		clearInterval(timer);
		timer = null;
		// Remove event listener
		document.removeEventListener('escPressed', retry);
		document.removeEventListener('enterPressed', exit);
		document.getElementById('contentHaveIPs').innerHTML = '';
		document.getElementById('contentNeedIPs').innerHTML = '';
	}

	// Wait for input
	function wait() {
		// Show user controls
		var controls = "<div class='button' id='retry'>" + localization['Authorize']['Retry'] + "</div><div class='button-transparent' id='exit'>" + localization['Authorize']['Exit'] + "</div>";
		var contentHaveIPs = "<p>" + localization['Authorize']['ControllerIP'] + ": <span style='color: yellow;'>" + detail['nanoIP'] +"</span></p>";
		contentHaveIPs += "<p>" + localization['Authorize']['ControllerSN'] + ": <span style='color: yellow;'>" + detail['nanoSN'] +"</span></p>";
		var contentNeedIPs = "<p>" + localization['Authorize']['ControllerName'] + ": <span style='color: yellow;'>" + detail['nanoName'] +"<span /></p>";
		contentNeedIPs += "<p>" + localization['Authorize']['ControllerAuth'] + ": <span style='color: yellow;'>" + detail['nanoToken'] +"<span /></p>";
		var content = "<div class='button button-green' id='continue'>" + localization['Authorize']['Continue'] + "</div>";
		document.getElementById('contentHaveIPs').innerHTML = contentHaveIPs;
		document.getElementById('contentNeedIPs').innerHTML = contentNeedIPs;
		document.getElementById('content').innerHTML = content;
		// Add event listener continueSave
		document.getElementById('continue').addEventListener('click', continueSave);
		document.addEventListener('enterPressed', continueSave);
	}
}
