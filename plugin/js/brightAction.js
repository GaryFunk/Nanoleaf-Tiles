//==============================================================================
/**
@file		brightAction.js
@brief		Nanoleaf Plugin
@copyright	(c) 2021, fSoft, Ltd.
			This source code is licensed under the MIT-style license found in the LICENSE file.
**/
//==============================================================================

// Prototype which represents a brightness action
function BrightAction(inContext, inSettings, inState) {
	// Init BrightAction
	var instance = this;
	// Inherit from Action
	Action.call(this, inContext, inSettings, inState);
	// Update the state
	getCurrentState();
	// Public function called on key up event
	this.onKeyUp = function (inContext, inSettings, inCoordinates, inUserDesiredState, inState) {
		// If onKeyUp was triggered manually, load settings
		if (inSettings === undefined) {
			inSettings = instance.getSettings();
		}

		// Check if any controller is configured
		if (!("nanoController" in inSettings)) {
			log("plugin/brightAction.js: No controller configured");
			showAlert(inContext);
			return;
		}
		if (window.nanoControllerCache == null) {
			log("plugin/brightAction.js: No controller in cache");
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
			let keyState = 0;
			if (inUserDesiredState !== undefined) {
				keyState = inUserDesiredState;
			}
			let keyTitle = setTargetValue(NF, inSettings);

			// Set the value to send to the Nanoleaf controller
			setValues["brightness"] = keyTitle;
			setValues["duration"] = 0;

			// Set state
			NF.setBrightness(setValues, (success, message, result) => {
				if (success) {
					// Update the cache
					window.nanoControllerCache[nanoKey].setInfo(result, function (success) {});

					// Get current info from the controller
					let nanoInfo = NF.getInfo();

					// Get the Buttons that need the update
					let theButtons = window.buttons[inSettings.nanoController].filter(x => x.command === "brightness");

					// Update the Buttons and Keys that need the new value
					for (let [index, button] of theButtons.entries()) {
						if (button.transition === "set") {
							setActionState(button.context, 1);
						} else {
//							window.buttons[inSettings.nanoController][index].brightness = nanoInfo.state.brightness.value;
							setActionState(button.context, 1, keyTitle);
						}
					}

					// Set the state of the button pressed
					if (inSettings.transition === "set") {
						setActionState(inContext, 0);
					} else {
						setActionState(inContext, 0, keyTitle);
					}
					instance.updateCrap("power", inSettings.nanoController, 0, NF.getInfo());
				} else {
					log(`plugin/brightAction.js NF.setBrightness: ${message}`);
					setActionState(inContext, keyState, keyTitle);
					showAlert(inContext);
				}
			});
		} catch(e) {
			log(`plugin/brightAction.js onKeyUp: ${e}`);
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
		if (inSettings.brightness === undefined) {
			inSettings.brightness = inSettings.value;
			delete inSettings.value;
			instance.saveSettings(inSettings);
		}

		// Find the configured controller
		try {
			let nanoKey = `"${inSettings.nanoController}"`;
			let NF = window.nanoControllerCache[nanoKey];
			let nanoInfo = NF.getInfo();

			// Set the Buttons that need to be updated
			let index = window.buttons[inSettings.nanoController].findIndex(x => x.context === inContext);
			if (index !== -1) {
				setButtons(inSettings, inContext, index);
			}

			// Set the Key values
			let keyState = inState;
			let keyTitle;
			if (inSettings.transition === "set") {
				keyTitle = `-${inSettings.brightness}-`;
			} else {
				keyTitle = nanoInfo.state.brightness.value;
			}

			// Set the new action state
			setActionState(inContext, keyState, keyTitle);
			return keyState;
		} catch(e) {
			log(`plugin/brightAction.js getCurrentState(): ${e}`);
		}
	}

	// Private function to set the Key values
	function setActionState(inContext, keyState, keyTitle) {
		if (keyState !== undefined) {
			setState(inContext, keyState);
		}
		if (keyTitle !== undefined) {
			setTitle(inContext, keyTitle);
		}
	}

	// Set the targetValue
	function setTargetValue(NF, inSettings, inUserDesiredValue) {
		let setValue = parseInt(inSettings.brightness);
		let nanoInfo = NF.getInfo();
		let currentValue = parseInt(nanoInfo.state.brightness.value);
		if (inSettings.transition == "increase") {
			if (currentValue == 100) {
				//targetValue = setValue;
			} else {
				targetValue = (currentValue + setValue > 100 ? 100 : currentValue + setValue);
			}
		} else if (inSettings.transition == "decrease") {
			if (currentValue == 0) {
				//targetValue = setValue;
			} else {
				targetValue = (currentValue - setValue < 0 ? 0 : currentValue - setValue);
			}
		} else {
			targetValue = setValue;
		}
		return targetValue;
	}
}
