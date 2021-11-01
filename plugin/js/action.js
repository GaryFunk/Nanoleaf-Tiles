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
	// Private variable containing the context of the action
	var context = inContext;
	// Private variable containing the settings of the action
	var settings = inSettings;
	// Private variable containing the state of the action
	var state = inState;

	// var DestinationEnum = Object.freeze({ "HARDWARE_AND_SOFTWARE": 0, "HARDWARE_ONLY": 1, "SOFTWARE_ONLY": 2 })

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
	// Public function for settings the settings
	this.setSettings = function (inSettings) {
		settings = inSettings;
	};

	this.updateCrap = function (crap, nanoController, targetState, info) {
		// call
		var theButtons;
		switch (crap) {
			case 'brightness':
				theButtons = window.buttons[nanoController].filter(x => x.command === 'brightness');
				for (let button of theButtons) {
					if (button.level === "set") {
						setTitle(button.context,  "-" + button.value + "-");
					} else {
						setTitle(button.context, info.state.brightness.value);
					}
				}
			case 'power':
				// Set the power button to on
				theButtons = window.buttons[nanoController].filter(x => x.command === 'power');
				if (info.state.on.value == false) {
					var powerState = 0;
					var powerValue = 'Off';
				} else {
					var powerState = 1;
					var powerValue = 'On';
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
		if (Object.keys(window.nanoControllers).length == 0) {
			// If a callback function was given
			if (inCallback !== undefined) {
				// Execute the callback function
				inCallback();
			}
			return;
		}
		// Find out type of action
		let action;
		if (instance instanceof PowerAction) {
			action = 'com.fsoft.nanoleaf.power';
		} else if (instance instanceof BrightnessAction) {
			action = 'com.fsoft.nanoleaf.brightness';
		} else if (instance instanceof ColorAction) {
			action = 'com.fsoft.nanoleaf.color';
		} else if (instance instanceof EffectAction) {
			action = 'com.fsoft.nanoleaf.effect';
		}
		// If the controller is set for this action
		if (!('nanoController' in settings)) {
			// Sort the controllers alphabetically
			let controllerIDsSorted = Object.keys(window.nanoControllers).sort(function (a, b) {
				return window.nanoControllers[a].nanoName.localeCompare(window.nanoControllers[b].nanoName);
			});
			// Save the settings
			saveSettings(action, inContext, settings, state);
		}
		// If a callback function was given
		if (inCallback !== undefined) {
			// Execute the callback function
			inCallback();
		}
	}
}
