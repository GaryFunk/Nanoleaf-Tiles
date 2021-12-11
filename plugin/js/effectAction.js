//==============================================================================
/**
@file		effectAction.js
@brief		Nanoleaf Plugin
@copyright	(c) 2021, fSoft, Ltd.
			This source code is licensed under the MIT-style license found in the LICENSE file.
**/
//==============================================================================

// Prototype which represents an effect action
function EffectAction(inContext, inSettings, inState) {
	// Init EffectAction
	var instance = this;
	// Inherit from Action
	Action.call(this, inContext, inSettings, inState);
	// Set the default values
	getCurrentState();
	// Public function called on key up event
	this.onKeyUp = function (inContext, inSettings, inCoordinates, inUserDesiredState, inState) {
		// If onKeyUp was triggered manually, load settings
		if (inSettings === undefined) {
			inSettings = instance.getSettings();
		}

		// Check if any controller is configured
		if (!("nanoController" in inSettings)) {
			log("plugin/effectAction.js: No controller configured");
			showAlert(inContext);
			return;
		}
		if (window.nanoControllerCache == null) {
			log("plugin/effectAction.js: No controller in cache");
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
			let keyTitle = inSettings.select;

			// Set the value to send to the Nanoleaf controller
			setValues["select"] = keyTitle;

			// Set state
			NF.setEffect(setValues, (success, message, result) => {
				if (success) {
					// Update the cache
					window.nanoControllerCache[nanoKey].setInfo(result, function (success) { });

					// Get current info from the controller
					let nanoInfo = NF.getInfo();

					// Get the Buttons that need the update
					let theButtons = window.buttons[inSettings.nanoController].filter(x => x.command === "color" || x.command === "effect");

					// Update the Buttons and Keys that need the new value
					for (let button of theButtons) {
						setState(button.context, 1);
					}

					// Set the state of the button pressed
					setActionState(inContext, 0, keyTitle);
					instance.updateCrap("effect", inSettings.nanoController, 0, NF.getInfo());
				} else {
					log(`plugin/effectAction.js NF.setEffect: ${message}`);
					setActionState(inContext, keyState, keyTitle);
					showAlert(inContext);
				}
			});
		} catch(e) {
			log(`plugin/effectAction.js onKeyUp: ${e}`);
		}
	};

	// Private function to set the defaults
	function getCurrentState() {
		// Check if any controller is configured
		if (!("nanoController" in inSettings)) {
			return;
		}
		if (window.nanoControllerCache == null) {
			return;
		}

		// To be removed in the future
		if (inSettings.select === undefined) {
			inSettings.select = inSettings.value;
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
			let keyTitle = inSettings.select;

			// Set the new action state
			setActionState(inContext, keyState, keyTitle);
			return keyState;
		} catch(e) {
			log(`plugin/effectAction.js getCurrentState(): ${e}`);
		}
	}

	// Private function to set the Key values
	function setActionState(inContext, keyState, keyTitle) {
		if (keyState !== undefined) {
			setState(inContext, keyState);
		}
		if (keyTitle !== undefined) {
			let newTitle = keyTitle.split(" ");
			for (let i = 0; i < newTitle.length -1; i++) {
				newTitle[i] = newTitle[i] + "\n";
			}
			keyTitle = newTitle.join("");
			setTitle(inContext, keyTitle);
		}
	}
}
