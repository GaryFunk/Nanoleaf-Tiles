//==============================================================================
/**
@file		colorAction.js
@brief		Nanoleaf Plugin
@copyright	(c) 2021, fSoft, Ltd.
			This source code is licensed under the MIT-style license found in the LICENSE file.
**/
//==============================================================================

// Prototype which represents a color action
function ColorAction(inContext, inSettings, inState) {
	// Init ColorAction
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
			log("plugin/colorAction.js: No controller configured");
			showAlert(inContext);
			return;
		}
		if (window.nanoControllerCache == null) {
			log("plugin/colorAction.js: No controller in cache");
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
			let keyTitle;

			// Set the value to send to the Nanoleaf controller
			setValues["color"] = inSettings.color;

			// Set state
			NF.setColor(setValues, (success, message, result) => {
				if (success) {
					// Update the cache
					window.nanoControllerCache[nanoKey].setInfo(result, function (success) {});

					// Get current info from the controller
					let nanoInfo = NF.getInfo();

					// Get the Buttons that need the update
					var theButtons = window.buttons[inSettings.nanoController].filter(x => x.command === "color" || x.command === "effect");

					// Update the Buttons and Keys that need the new value
					for (let button of theButtons) {
						setActionState(button.context, 1);
					}

					// Set the state of the button pressed
					setActionState(inContext, 0);
					instance.updateCrap("brightness", inSettings.nanoController, 0, NF.getInfo());
				} else {
					log(`plugin/colorAction.js NF.setColor: ${message}`);
					setActionState(inContext, keyState, keyTitle);
					showAlert(inContext);
				}
			});
		} catch(e) {
			log(`plugin/colorAction.js onKeyUp: ${e}`);
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
		if (inSettings.color === undefined) {
			inSettings.color = inSettings.value;
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
			let keyTitle; // = `${inSettings.color}`;

			// Set the new action state
			buildImage(inContext, inSettings.color);
			setActionState(inContext, keyState, keyTitle);
			return keyState;
		} catch(e) {
			log(`plugin/colorAction.js getCurrentState(): ${e}`);
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

	// Private function to set the button icon
	function buildImage(inContext, inColor) {
		let canvas = null;
		let img = null;
		let ctx = null;
		let inImage = null;
		canvas = document.getElementById("iconCanvas0");
		img = document.getElementById("icon0");
		ctx = canvas.getContext("2d");
		ctx.canvas.width = 72;
		ctx.canvas.height = 72;
		ctx.drawImage(img, 0, 0);
		ctx.fillStyle = inColor;
		ctx.fillRect(0, 53, 72, 17);
		inImage = canvas.toDataURL();
		setImage(inContext, inImage, 0);

		canvas = null;
		img = null;
		ctx = null;
		inImage = null;
		canvas = document.getElementById("iconCanvas1");
		img = document.getElementById("icon1");
		ctx = canvas.getContext("2d");
		ctx.canvas.width = 72;
		ctx.canvas.height = 72;
		ctx.drawImage(img, 0, 0);
		ctx.fillStyle = inColor;
		ctx.fillRect(0, 60, 72, 10);
		inImage = canvas.toDataURL();
		setImage(inContext, inImage, 1);
	}
}
