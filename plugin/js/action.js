//==============================================================================
/**
@file		action.js
@brief		Nanoleaf Plugin
@copyright	(c) 2021, fSoft, Ltd.
			This source code is licensed under the MIT-style license found in the LICENSE file.
**/
//==============================================================================

// Protype which represents an action
function Action(inContext, inSettings, inState) {
	// Init Action
	var instance = this;
	var context = inContext;
	var settings = inSettings;
	var state = inState;

	// Set the default values
	setDefaults();

	// Public function returning the context
	this.getContext = function () {
		return context;
	};
	// Public function returning the settings
	this.getState = function () {
		return state;
	};
	// Public function returning the settings
	this.getSettings = function () {
		return settings;
	};
	// Public function to save the settings
	this.saveSettings = function (settings) {
		saveSettings(getAction(), inContext, settings);
	}
	// Public function for settings the settings
	this.setSettings = function (inSettings) {
		settings = inSettings;
	};
	this.updateCrap = function (crap, nanoController, targetState, info) {
		// call
		let theButtons;
		switch (crap) {
			case "brightness":
				theButtons = window.buttons[nanoController].filter(x => x.command === "brightness");
				for (let button of theButtons) {
					if (button.transition === "set") {
						setTitle(button.context, "-" + button.brightness + "-");
					} else {
						setTitle(button.context, info.state.brightness.value);
					}
				}
			case "power":
				let powerState;
				let powerValue;
				// Set the power button to on
				theButtons = window.buttons[nanoController].filter(x => x.command === "power");
				if (info.state.on.value == false) {
					powerState = 1;
					powerValue = "Off";
				} else {
					powerState = 0;
					powerValue = "On";
				}
				for (let button of theButtons) {
					setState(button.context, powerState);
					setTitle(button.context, powerValue);
				}
				break;
		}
	}

	// Private function to set the defaults
	function setDefaults(inCallback) {
		// If at least one controller is authorized
		if (Object.keys(window.nanoControllers).length === 0) {
			// If a callback function was given
			if (inCallback !== undefined) {
				// Execute the callback function
				inCallback();
			}
			return;
		}
		// If the controller is set for this action
		if (!("nanoController" in settings)) {
			// Sort the controllers alphabetically
			let controllerIDsSorted = Object.keys(window.nanoControllers).sort(function (a, b) {
				return window.nanoControllers[a].nanoName.localeCompare(window.nanoControllers[b].nanoName);
			});
			// Save the settings
			saveSettings(getAction(), inContext, settings, state);
		}
		// If a callback function was given
		if (inCallback !== undefined) {
			// Execute the callback function
			inCallback();
		}
	}

	// Private function to return the action identifier
	function getAction() {
		let action;
		// Find out type of action
		if (instance instanceof PowerAction) {
			action = "com.fsoft.nanoleaf.power";
		} else if (instance instanceof BrightAction) {
			action = "com.fsoft.nanoleaf.bright";
		} else if (instance instanceof BrightColorAction) {
			action = "com.fsoft.nanoleaf.brightcolor";
		} else if (instance instanceof ColorAction) {
			action = "com.fsoft.nanoleaf.color";
		} else if (instance instanceof EffectAction) {
			action = "com.fsoft.nanoleaf.effect";
		}
		return action;
	}
}

const sleep = (milliseconds) => {
	return new Promise(resolve => setTimeout(resolve, milliseconds))
}
