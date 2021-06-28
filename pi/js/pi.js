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
		document.getElementById('no-controllers').innerHTML = instance.localization['NoControllers'];
		document.getElementById('add-controller').innerHTML = instance.localization['AddController'];
	};

	// Show all authorized controllers
	this.loadControllers = async function () {
		// If at least one controller is configured build the controllerCache
		if (Object.keys(window.nanoCache).length > 0) {
			// Refresh the cache
		}
		await Nanoleaf.buildcache();
		// Remove previously shown controllers
		nanoControllers = document.getElementsByClassName('nanoControllers');
		while (nanoControllers.length > 0) {
			nanoControllers[0].parentNode.removeChild(nanoControllers[0]);
		}
		// Check for active controllers
		if (Object.keys(nanoCache).length > 0) {
			// Hide the 'No Controllers' option
			document.getElementById('no-controllers').style.display = 'none';
			// Sort the controllers alphabetically
			var controllerIDsSorted = Object.keys(nanoCache).sort(function (a, b) {
				return nanoCache[a].nanoName.localeCompare(nanoCache[b].nanoName);
			});
			// Add the controllers
			controllerIDsSorted.forEach(function (inControllerID) {
				// Add the controller name to the option
				var option = "<option value='" + inControllerID + "' class='nanoControllers'>" + nanoCache[inControllerID].nanoName + "</option>";
				document.getElementById('no-controllers').insertAdjacentHTML('beforebegin', option);
			});
			// Check if the controller is configured
			if (settings.nanoController !== undefined) {
				// Select the currently configured controller
				document.getElementById('controller-select').value = settings.nanoController;
			}
			if (instance instanceof PowerPI) {

			} else if (instance instanceof BrightnessPI) {

			} else if (instance instanceof ColorPI) {

			} else if (instance instanceof EffectsPI) {
				var nanoKey = '"' + settings.nanoController + '"';
				var nanoSN = settings.nanoController;
				var NF = window.controllerCache[nanoKey];
				try {
					if (NF == undefined) {
						document.getElementById('controller-select').value = 'no-controllers';
						sleep(500).then(() => {
							document.getElementById('controller-select').value = settings.nanoController;
							instance.loadControllers();
						})
					}
					// Get effectsList
					var data = NF.getInfo();
					var effectsList = data.effects.effectsList;
					var effectSelect = data.effects['select'];
					if (effectsList.length > 0) {
						var options = document.getElementById('effects-select');
						options.length = 0;
						for (index in effectsList) {
							var selected = false;
							if (effectsList[index] == effectSelect) {
								selected = true;
							}
							options[options.length] = new Option(effectsList[index], effectsList[index], selected, selected);
						}
					}
				} catch(e) {
					log('error = ', e);
				}
			}
		} else {
			// Show the 'No Controllers' option
			document.getElementById('no-controllers').style.display = 'block';
		}
		// Show PI
		document.getElementById('pi').style.display = 'block';
	}

	// Public function to save the settings
	this.saveSettings = function () {
		saveSettings(getAction(), inContext, settings);
	}

	// Public function to send data to the plugin
	this.sendToPlugin = function (inData) {
		sendToPlugin(getAction(), inContext, inData);
	}

	// Function called on successful controller authorization
	function saveNanoControllerCallback(inEvent) {
		// Set controller to the newly added controller
		settings.nanoController = inEvent.detail.id;
		instance.saveSettings();
		// Check if global settings need to be initialized
		if (window.globalSettings.nanoControllers === undefined) {
			window.globalSettings.nanoControllers = {};
		}
		// Add new controller to the global settings
		window.globalSettings.nanoControllers[inEvent.detail.nanoSN] = { 'nanoIP': inEvent.detail.nanoIP, 'nanoName': inEvent.detail.nanoName, 'nanoSN': inEvent.detail.nanoSN,  'nanoToken': inEvent.detail.nanoToken };
		saveGlobalSettings(inContext);
	}

	// Controller select changed
	function controllerChanged(inEvent) {
		if (inEvent.target.value === 'add') {
			// Open setup window
			window.open('../setup/index.html?language=' + inLanguage + '&nanoCacheIPs=' + JSON.stringify(nanoCacheIPs));
			// Select the first in case user cancels the setup
			document.getElementById('controller-select').selectedIndex = 0;
		} else if (inEvent.target.value === 'no-controllers') {
			// If no controller was selected, do nothing
			document.getElementById('controller-select').value = settings.nanoController;
		} else {
			settings.nanoController = inEvent.target.value;
			instance.saveSettings();
			instance.loadControllers();
		}
	}

	const sleep = (milliseconds) => {
		return new Promise(resolve => setTimeout(resolve, milliseconds))
	}

	// Private function to return the action identifier
	function getAction() {
		var action
		// Find out type of action
		if (instance instanceof PowerPI) {
			action = 'com.fsoft.nanoleaf.power';
		} else if (instance instanceof BrightnessPI) {
			action = 'com.fsoft.nanoleaf.brightness';
		} else if (instance instanceof ColorPI) {
			action = 'com.fsoft.nanoleaf.color';
		} else if (instance instanceof EffectsPI) {
			action = 'com.fsoft.nanoleaf.effects';
		}
		return action;
	}
}
