//==============================================================================
/**
@file		pi.js
@brief		Nanoleaf Plugin
@copyright	(c) 2021, fSoft, Ltd.
			This source code is licensed under the MIT-style license found in the LICENSE file.
**/
//==============================================================================

function PI(inContext, inLanguage, inStreamDeckVersion, inPluginVersion) {
	// Init PI
	var instance = this;
	// Public localizations for the UI
	this.localization = {};
	// Add event listener
	document.getElementById('controller-select').addEventListener('change', controllerChanged);
	document.addEventListener('saveNanoController', saveNanoControllerCallback);

	var _deleteController = function () {
		event.preventDefault();
		deleteController(window.settings.nanoController, inContext);
	}
	// The beforeunload event is fired, before the view disappears
	window.addEventListener('beforeunload', function (e) {
		e.preventDefault();
		sendValueToPlugin(getAction(), inContext, 'propertyInspectorWillDisappear', 'property_inspector');
		// Don't set a returnValue to the event, otherwise Chromium with throw an error.
	});

	// The pagehide event is fired, when the view disappears
	window.addEventListener('pagehide', function (event) {
		sendValueToPlugin(getAction(), inContext, 'propertyInspectorPagehide', 'property_inspector');
	});

	// The unload event is fired, when the PI will finally disappears
	window.addEventListener('unload', function (event) {
		sendValueToPlugin(getAction(), inContext, 'propertyInspectorDisconnected', 'property_inspector');
	});

	// Load the localizations
	getLocalization(inLanguage, function (inStatus, inLocalization) {
		if (inStatus) {
			// Save public localization
			instance.localization = inLocalization['PI'];
			// Localize the PI
			instance.localize();
		} else {
			log(inLocalization);
		}
	});

	// Localize the UI
	this.localize = function () {
		// Check if localizations were loaded
		if (instance.localization == null) {
			return;
		}
		// Localize the controller select
		document.getElementById('controller-label').innerHTML = instance.localization['Controller'];
		document.getElementById('add-controller').innerHTML = "- - " + instance.localization['AddController'] + " - -";
		document.getElementById('delete-controller-label').innerHTML = instance.localization['DeleteController'];
		document.getElementById('controller-delete-message').innerHTML = instance.localization['DeleteMessage'];
	};

	// Show all authorized controllers
	this.loadControllers = async function () {
		await Nanoleaf.buildcache();
		// Remove previously shown controllers
		// window.nanoControllers = document.getElementsByClassName('nanoControllers');
		while (window.nanoControllers.length > 0) {
			window.nanoControllers[0].parentNode.removeChild(window.nanoControllers[0]);
		}
		// Check for active controllers
		if (Object.keys(window.nanoControllers).length > 0) {
			document.getElementById('blank-controller').innerHTML =  "- - " + instance.localization['SelectController'] + " - -";
			// Sort the controllers alphabetically
			var controllerIDsSorted = Object.keys(window.nanoControllers).sort(function (a, b) {
				return window.nanoControllers[a].nanoName.localeCompare(window.nanoControllers[b].nanoName);
			});

			// Set the controller options length to 2 because the
			var options = document.getElementById('controller-select');
			options.length = 2;
			// Add the controllers
			controllerIDsSorted.forEach(function (inControllerID) {
				// Add the controller name to the option
				var option = "<option id='" + inControllerID + "' value='" + inControllerID + "' class='nanoControllers'>" + window.nanoControllers[inControllerID].nanoName + "</option>";
				document.getElementById('controller-select').insertAdjacentHTML('beforeend', option);
			});

			// Check if the controller is configured
			if (window.settings.nanoController === undefined) {
				document.getElementById('controller-select').value = "blank-controller";
			} else {
				// Select the currently configured controller
				document.getElementById('controller-select').value = window.settings.nanoController;

				// Add event listener to remove controller
				document.getElementById("controller-delete").addEventListener("click", _deleteController);
			}
			if (instance instanceof PowerPI) {

			} else if (instance instanceof BrightnessPI) {

			} else if (instance instanceof ColorPI) {

			} else if (instance instanceof EffectPI) {
				loadEffects();
			}
		} else {
			// Show the 'No Controllers' option
			document.getElementById('blank-controller').innerHTML =  "- - " + instance.localization['NoController'] + " - -";
		}
		// Show PI
		document.getElementById('pi').style.display = 'block';
	}

	// Public function to save the settings
	this.saveSettings = function () {
		saveSettings(getAction(), inContext, window.settings);
	}

	// Public function to send data to the plugin
	this.sendToPlugin = function (inData) {
		sendToPlugin(getAction(), inContext, inData);
	}

	// Controller select changed
	function controllerChanged(inEvent) {
		if (inEvent.target.value === 'add-controller') {
			// Select the first in case user cancels the setup
			document.getElementById('controller-select').value = 'add-controller';
			document.getElementById("controller-delete").removeEventListener("click", _deleteController);
			// Open setup window
			setupWindow = window.open('../setup/index.html?language=' + inLanguage + '&nanoControllerIPs=' + JSON.stringify(window.nanoControllerIPs));
		} else if (inEvent.target.value === 'blank-controller') {
			// If no controller was selected, do nothing
			document.getElementById('controller-select').value = 'blank-controller';
			document.getElementById("controller-delete").removeEventListener("click", _deleteController);
		} else {
			window.settings.nanoController = inEvent.target.value;
			instance.saveSettings();
			instance.loadControllers();
		}
		if (instance instanceof EffectPI) {
			loadEffects();
		}
	}

	// Private function to return the action identifier
	function getAction() {
		var action;
		// Find out type of action
		if (instance instanceof PowerPI) {
			action = 'com.fsoft.nanoleaf.power';
		} else if (instance instanceof BrightnessPI) {
			action = 'com.fsoft.nanoleaf.brightness';
		} else if (instance instanceof ColorPI) {
			action = 'com.fsoft.nanoleaf.color';
		} else if (instance instanceof EffectPI) {
			action = 'com.fsoft.nanoleaf.effect';
		}
		return action;
	}

	function loadEffects() {
		var nanoKey = '"' + window.settings.nanoController + '"';
		var nanoSN = window.settings.nanoController;
		var NF = window.nanoControllerCache[nanoKey];
		try {
			if (NF == undefined) {
				document.getElementById('controller-select').value = 'no-controller';
				sleep(250).then(() => {
					document.getElementById('controller-select').value = window.settings.nanoController;
					instance.loadControllers();
				})
			}
			// Get effectList
			var data = NF.getInfo();
			var effectsList = data.effects.effectsList;
			var effectSelect = data.effects['select'];
			if (effectsList.length > 0) {
				var options = document.getElementById('effect-select');
				options.length = 0;
				for (index in effectsList) {
					var selected = false;
					if (effectsList[index] == window.settings.value) {
						selected = true;
					}
					options[options.length] = new Option(effectsList[index], effectsList[index], selected, selected);
				}
			}
		} catch(e) {
			log('error = ', e);
		}
	}

	// Remove the token and save the global settings.
	function deleteController(controllerID, inContext) {
		var nanoIP = window.nanoControllers[controllerID]["nanoIP"];
		for( var i = 0; i < window.nanoControllerIPs.length; i++){
 			if ( window.nanoControllerIPs[i] === nanoIP) {
				window.nanoControllerIPs.splice(i, 1);
			}
		}
		delete window.nanoControllers[controllerID];
		delete window.settings;
		globalSettings.nanoControllers = window.nanoControllers;
		saveGlobalSettings(inContext);
	}

	// Function called on successful controller authorization
	function saveNanoControllerCallback(inEvent) {
		// Check if global settings need to be initialized
		if (window.nanoControllers === undefined) {
			window.nanoControllers = {};
		}
		window.nanoControllers[inEvent.detail.nanoSN] = { 'nanoIP': inEvent.detail.nanoIP, 'nanoName': inEvent.detail.nanoName, 'nanoSN': inEvent.detail.nanoSN,  'nanoToken': inEvent.detail.nanoToken };
		globalSettings.nanoControllers = window.nanoControllers;
		saveGlobalSettings(inContext);
		// Set controller to the newly added controller
		window.settings.nanoController = inEvent.detail.nanoSN;
		instance.saveSettings();
		instance.loadControllers();
		sendToPlugin(getAction(), inContext, { 'piEvent': 'newController' });
	}

	const sleep = (milliseconds) => {
		return new Promise(resolve => setTimeout(resolve, milliseconds))
	}
}
