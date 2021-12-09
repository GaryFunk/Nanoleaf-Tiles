//==============================================================================
/**
@file		powerAction.js
@brief		Nanoleaf Plugin
@copyright	(c) 2021, fSoft, Ltd.
			This source code is licensed under the MIT-style license found in the LICENSE file.
**/
//==============================================================================

// Prototype which represents a power action
function PowerAction(inContext, inSettings, inState) {
	// Init PowerAction
	var instance = this;
	// Inherit from Action
	Action.call(this, inContext, inSettings, inState);
	// Get the Key values
	getCurrentState();
	// Public function called on KeyUp event
	this.onKeyUp = function (inContext, inSettings, inCoordinates, inUserDesiredState, inState) {
		// If onKeyUp was triggered manually, load settings
		if (inSettings === undefined) {
			inSettings = instance.getSettings();
		}

		// Check if any controller is configured
		if (!("nanoController" in inSettings)) {
			log("lugin/powerAction.js: No controller configured");
			showAlert(inContext);
			return;
		}
		if (window.nanoControllerCache == null) {
			log("plugin/powerAction.js: No controller in cache");
			showAlert(inContext);
			return;
		}

		// Find the configured controller
		try {
			let nanoKey = `"${inSettings.nanoController}"`;
			let NF = window.nanoControllerCache[nanoKey];
			let currentState = inState;
			let setValues = {};

			// Set the Key values
			let keyState = (currentState ? 0 : 1);
			if (inUserDesiredState !== undefined) {
				keyState = inUserDesiredState;
			}
			let keyTitle = (keyState ? "Off" : "On");

			// Set the value to send to the Nanoleaf controller
			setValues["on"] = (keyState ? false : true);

			// Set state
			NF.setPower(setValues, (success, message, result) => {
				if (success) {
					// Update the cache
					window.nanoControllerCache[nanoKey].setInfo(result, function (success) { });

					// Get current info from the controller
					let nanoInfo = NF.getInfo();

					// Get the Buttons that need the update
					let theButtons = window.buttons[inSettings.nanoController].filter(x => x.command === "power");

					// Update the Buttons and Keys that need the new state
					for (let [index, button] of theButtons.entries()) {
						window.buttons[inSettings.nanoController][index].on = nanoInfo.state.on.value;
						setActionState(button.context, keyState, keyTitle);
					}
				} else {
					log(`plugin/powerAction.js NF.setPower: ${message}`);
					setActionState(inContext, keyState, keyTitle);
					showAlert(inContext);
				}
			});
		} catch(e) {
			log(`plugin/powerAction.js onKeyUp: ${e}`);
		}
	};

	// Private function to set current values
	function getCurrentState() {
		// Check if any controller is configured
		if (!("nanoController" in inSettings)) {
			return;
		}
		if (window.nanoControllerCache == null) {
			return;
		}

		// To be removed in the future
		if (inSettings.on === undefined) {
			inSettings.on = inSettings.value;
			delete inSettings.value;
			instance.saveSettings(inSettings);
		}

		// Find the configured controller
		try {
			let nanoKey = `"${inSettings.nanoController}"`;
			let NF = window.nanoControllerCache[nanoKey];
			let nanoInfo = NF.getInfo();

			// Set on to value
			let settings = inSettings;
			settings.on = nanoInfo.state.on.value;

			// Set the Buttons that need to be updated
			let index = window.buttons[inSettings.nanoController].findIndex(x => x.context === inContext);
			if (index !== -1) {
				setButtons(settings, inContext, index);
			}

			// Set the Key values
			let keyState = (nanoInfo.state.on.value ? 0 : 1);
			let keyTitle = (nanoInfo.state.on.value ? "On" : "Off");

			// Set the new Action State
			setActionState(inContext, keyState, keyTitle);
			return keyState;
		} catch(e) {
			log(`plugin/powerAction.js getCurrentState(): ${e}`);
		}
	}

	// Private function to set the Key values
	function setActionState(inContext, keyState, keyTitle) {
		setState(inContext, keyState);
		setTitle(inContext, keyTitle);
	}
}
