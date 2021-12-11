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
	document.getElementById("controller-select").addEventListener("change", controllerChanged);
	document.addEventListener("saveNanoController", saveNanoControllerCallback);

	// Load the localizations
	getLocalization(inLanguage, function (inStatus, inLocalization) {
		if (inStatus) {
			// Save public localization
			instance.localization = inLocalization["PI"];
			// Localize the PI
			instance.localize();
		} else {
			//log(inLocalization);
			let inData = {};
			inData["piEvent"] = "log";
			inData["message"] = inLocalization;
			instance.sendToPlugin(inData);
		}
	});

	const _deleteController = function () {
		event.preventDefault();
		deleteController(window.settings.nanoController, inContext);
	}

	/*
	// The beforeunload event is fired, before the view disappears
	window.addEventListener("beforeunload", function (e) {
		e.preventDefault();
		sendValueToPlugin(getAction(), inContext, "propertyInspectorWillDisappear", "property_inspector");
		// Do not set a returnValue to the event, otherwise Chromium with throw an error.
	});

	// The pagehide event is fired, when the view disappears
	window.addEventListener("pagehide", function (event) {
		sendValueToPlugin(getAction(), inContext, "propertyInspectorPagehide", "property_inspector");
	});

	// The unload event is fired, when the PI will finally disappears
	window.addEventListener("unload", function (event) {
		sendValueToPlugin(getAction(), inContext, "propertyInspectorDisconnected", "property_inspector");
	});
	*/

	// Localize the UI
	this.localize = function () {
		// Check if localizations were loaded
		if (instance.localization == null) {
			return;
		}
		// Localize the controller select
		document.getElementById("controller-label").innerHTML = instance.localization["Controller"];
		document.getElementById("add-controller").innerHTML = "- - " + instance.localization["AddController"] + " - -";
		document.getElementById("delete-controller-label").innerHTML = instance.localization["DeleteController"];
		document.getElementById("controller-delete-message").innerHTML = instance.localization["DeleteMessage"];
	};

	// Show all authorized controllers
	this.loadControllers = async function () {
		await Nanoleaf.buildcache( function () {});
		// Remove previously shown controllers
		// window.nanoControllers = document.getElementsByClassName("nanoControllers");
		while (window.nanoControllers.length > 0) {
			window.nanoControllers[0].parentNode.removeChild(window.nanoControllers[0]);
		}
		// Check for active controllers
		if (Object.keys(window.nanoControllers).length > 0) {
			document.getElementById("blank-controller").innerHTML =  "- - " + instance.localization["SelectController"] + " - -";
			// Sort the controllers alphabetically
			let controllerIDsSorted = Object.keys(window.nanoControllers).sort(function (a, b) {
				return window.nanoControllers[a].nanoName.localeCompare(window.nanoControllers[b].nanoName);
			});

			// Set the controller options length to 2 because the
			let options = document.getElementById("controller-select");
			options.length = 2;
			// Add the controllers
			controllerIDsSorted.forEach(function (inControllerID) {
				// Add the controller name to the option
				let option = `<option id="${inControllerID}" value="${inControllerID}" class="nanoControllers">${window.nanoControllers[inControllerID].nanoName}</option>`;
				document.getElementById("controller-select").insertAdjacentHTML("beforeend", option);
			});
			// Check if the controller is configured
			if (window.settings.nanoController === undefined) {
				document.getElementById("controller-select").value = "blank-controller";
			} else {
				// Select the currently configured controller
				document.getElementById("controller-select").value = window.settings.nanoController;

				// Add event listener to remove controller
				document.getElementById("controller-delete").addEventListener("click", _deleteController);
			}
			if (instance instanceof PowerPI) {

			} else if (instance instanceof BrightPI) {

//			} else if (instance instanceof BrightColorPI) {

			} else if (instance instanceof ColorPI) {

			} else if (instance instanceof EffectPI) {
				if (window.settings.nanoController !== undefined) {
					loadEffects();
				}
			}
		} else {
			// Show the "No Controllers" option
			document.getElementById("blank-controller").innerHTML =  "- - " + instance.localization["NoController"] + " - -";
		}
		// Show PI
		document.getElementById("pi").style.display = "block";
	}

	// Public function to save the settings
	this.saveSettings = function () {
		saveSettings(getAction(), inContext, window.settings);
	}

	// Public function to send data to the plugin
	this.sendToPlugin = function (inData) {
		sendToPlugin(getAction(), inContext, inData);
	}

	// Public function to set the image
//	this.setImage = function (inContext, inImage, inState) {
//		setImage(inContext, inImage, inState);
//	}

	// Controller select changed
	function controllerChanged(inEvent) {
		if (inEvent.target.value === "add-controller") {
			// Select the first in case user cancels the setup
			document.getElementById("controller-select").value = "add-controller";
			document.getElementById("controller-delete").removeEventListener("click", _deleteController);
			// Open setup window
			setupWindow = window.open(`../setup/index.html?language=${inLanguage}&nanoControllerIPs=${JSON.stringify(window.nanoControllerIPs)}`, "setup");
		} else if (inEvent.target.value === "blank-controller") {
			// If no controller was selected, do nothing
			document.getElementById("controller-select").value = "blank-controller";
			document.getElementById("controller-delete").removeEventListener("click", _deleteController);
		} else {
			window.settings.nanoController = inEvent.target.value;
			instance.saveSettings();
			instance.loadControllers();
			let inData = {};
			inData["piEvent"] = "buttonChanged";
			inData["settings"] = window.settings;
			inData["state"] = true;
			instance.sendToPlugin(inData);
		}
		if (instance instanceof EffectPI) {
			loadEffects();
		}
	}

	// Private function to return the action identifier
	function getAction() {
		let action;
		// Find out type of action
		if (instance instanceof PowerPI) {
			action = "com.fsoft.nanoleaf.power";
		} else if (instance instanceof BrightPI) {
			action = "com.fsoft.nanoleaf.brightness";
//		} else if (instance instanceof BrightColorPI) {
//			action = "com.fsoft.nanoleaf.brightcolor";
		} else if (instance instanceof ColorPI) {
			action = "com.fsoft.nanoleaf.color";
		} else if (instance instanceof EffectPI) {
			action = "com.fsoft.nanoleaf.effect";
		}
		return action;
	}

	function loadEffects() {
		let nanoKey = `"${window.settings.nanoController}"`;
		let NF = window.nanoControllerCache[nanoKey];
		try {
			if (NF === undefined) {
				document.getElementById("controller-select").value = "no-controller";
				sleep(50).then(() => {
					document.getElementById("controller-select").value = window.settings.nanoController;
					instance.loadControllers();
				})
				return;
			}
			// Get effectList
			let data = NF.getInfo();
			let effectsList = data.effects.effectsList;
			if (effectsList.length > 0) {
				let options = document.getElementById("effect-select");
				options.length = 0;
				for (index in effectsList) {
					let selected = false;
					if (effectsList[index] == window.settings.select) {
						selected = true;
					}
					options[options.length] = new Option(effectsList[index], effectsList[index], selected, selected);
				}
			}
		} catch(e) {
			let inData = {};
			inData["piEvent"] = "log";
			inData["message"] = `error pi/pi.js loadEffects(): ${e}`;
			instance.sendToPlugin(inData);
		}
	}

	// Remove the token and save the global settings.
	function deleteController(controllerID, inContext) {
		let nanoIP = window.nanoControllers[controllerID]["nanoIP"];
		for( let i = 0; i < window.nanoControllerIPs.length; i++){
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
		window.nanoControllers[inEvent.detail.nanoSN] = { "nanoIP": inEvent.detail.nanoIP, "nanoName": inEvent.detail.nanoName, "nanoSN": inEvent.detail.nanoSN,  "nanoToken": inEvent.detail.nanoToken };
		globalSettings.nanoControllers = window.nanoControllers;
		saveGlobalSettings(inContext);
		// Set controller to the newly added controller
		window.settings.nanoController = inEvent.detail.nanoSN;
		instance.saveSettings();
		instance.loadControllers();
		instance.sendToPlugin({"piEvent": "newController"});
	}
}

const sleep = (milliseconds) => {
	return new Promise(resolve => setTimeout(resolve, milliseconds))
}
