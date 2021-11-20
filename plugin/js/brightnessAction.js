//==============================================================================
/**
@file		brightnessAction.js
@brief		Nanoleaf Plugin
@copyright	(c) 2021, fSoft, Ltd.
			This source code is licensed under the MIT-style license found in the LICENSE file.
**/
//==============================================================================

// Prototype which represents a brightness action
function BrightnessAction(inContext, inSettings, inState) {
	// Init BrightnessAction
	var instance = this;
	// Inherit from Action
	Action.call(this, inContext, inSettings, inState);
	// Update the state
	updateState();
	// Public function called on key up event
	this.onKeyUp = function (inContext, inSettings, inCoordinates, inUserDesiredState, inState) {
		// If onKeyUp was triggered manually, load settings
		if (inSettings === undefined) {
			inSettings = instance.getSettings();
		}
		// Check if any controller is configured
		if (!('nanoController' in inSettings)) {
			log('plugin/brightnessAction.js line 26 No controller configured');
			showAlert(inContext);
			return;
		}
		if (window.nanoControllerCache == null) {
			log('plugin/brightnessAction.js line 31 No controller in cache');
			showAlert(inContext);
			return;
		}
		// Find the configured controller
		try {
			var nanoKey = '"' + inSettings.nanoController + '"';
			var NF = window.nanoControllerCache[nanoKey];
			var targetState = 1;

			// Set the target value
			var targetValue = setTargetValue(NF, inSettings, inUserDesiredState);
			let targetDuration = 0;

			// Set state
			NF.setBrightness(targetState, targetValue, targetDuration, function (success, message, value) {
				if (success) {
					// Add loop here to update the other buttons
					let theButtons = window.buttons[inSettings.nanoController].filter(x => x.command === 'brightness');
					for (let button of theButtons) {
						if (button.transition === "set") {
							setActionState(button.context, !targetState, "-" + button.value + "-");
						} else {
							setActionState(button.context, !targetState, targetValue);
						}
					}

					// Set the new brightness
					if (inSettings.transition === "set") {
						setActionState(inContext, targetState, "-" + targetValue + "-");
					} else {
						setActionState(inContext, targetState, targetValue);
					}
					instance.updateCrap('power', inSettings.nanoController, targetState, NF.getInfo());
				} else {
					log('plugin/brightnessAction.js line 66: ' + message);
					setActionState(inContext, targetState, targetValue);
					showAlert(inContext);
				}
			});
		} catch(e) {
			log('plugin/brightnessAction.js line 72: ' + e);
		}
	};

	// Private function to set the state
	function updateState() {
		// Get the settings and the context
		let settings = instance.getSettings();
		let context = instance.getContext();
		let state = instance.getState();
		// Check if any controller is configured
		if (!('nanoController' in settings)) {
			return;
		}
		if (window.nanoControllerCache == null) {
			return;
		}
		// Find the configured controller
		let nanoKey = '"' + inSettings.nanoController + '"';
		var NF = window.nanoControllerCache[nanoKey];
		try {
			let nanoInfo = NF.getInfo();
			// Set the target state and value
			let targetState = state;
			let targetValue;
			// Set the target value
			if (settings.transition === 'set') {
				targetValue = '-' + settings.value + '-';
			} else {
				targetValue = parseInt(nanoInfo.state.brightness.value);
			}
			// Set the new action state
			setActionState(context, targetState, targetValue);
		} catch(e) {
			log('plugin/brightnessAction.js line 106: ' + e);
		}
	}

	// Private function to set the state
	function setActionState(inContext, targetState, targetValue) {
		setState(inContext, targetState);
		setTitle(inContext, targetValue);
	}

	// Set the targetValue
	function setTargetValue(NF, inSettings, inUserDesiredState) {
		var setValue = parseInt(inSettings.value);
		var nanoInfo = NF.getInfo();
		var currentValue = parseInt(nanoInfo.state.brightness.value);
		if (inUserDesiredState !== undefined) {
			targetValue = inUserDesiredState;
		} else if (inSettings.transition == 'increase') {
			if (currentValue == 100) {
				//targetValue = setValue;
			} else {
				targetValue = (currentValue + setValue > 100 ? 100 : currentValue + setValue);
			}
		} else if (inSettings.transition == 'decrease') {
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
