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
	updateState();
	// Public function called on key up event
	this.onKeyUp = function (inContext, inSettings, inCoordinates, inUserDesiredState, inState) {
		// If onKeyUp was triggered manually, load settings
		if (inSettings === undefined) {
			inSettings = instance.getSettings();
		}
		// Check if any controller is configured
		if (!('nanoController' in inSettings)) {
			log('plugin/colorAction.js line 26 No controller configured');
			showAlert(inContext);
			return;
		}
		if (window.nanoControllerCache == null) {
			log('plugin/colorAction.js line 31 No controller in cache');
			showAlert(inContext);
			return;
		}

		// Find the configured controller
		var nanoKey = '"' + inSettings.nanoController + '"';
		var NF = window.nanoControllerCache[nanoKey];
		var targetState = 1;

		// Set the target value
		var targetValue = inSettings.value;

		// Set state
		NF.setColor(targetState, targetValue, function (success, message, value) {
			if (success) {
				// Add loop here to update the other buttons
				var theButtons = window.buttons[inSettings.nanoController].filter(x => x.command === 'color' || x.command === 'effect');
				for (let button of theButtons) {
					setState(button.context, !targetState);
				}

				// Set the new color
				setActionState(inContext, targetState, targetValue);
				instance.updateCrap('brightness', inSettings.nanoController, targetState, NF.getInfo());
			} else {
				log('plugin/colorAction.js line 57: ' + message);
				setActionState(inContext, targetState, targetValue);
				showAlert(inContext);
			}
		});
	};

	// Private function to set the defaults
	function updateState() {
		// Get the settings and the context
		var settings = instance.getSettings();
		var context = instance.getContext();
		var state = instance.getState();
		// Check if any controller is configured
		if (!('nanoController' in settings)) {
			return;
		}
		if (window.nanoControllerCache == null) {
			return;
		}
		// Find the configured controller
		var nanoKey = '"' + inSettings.nanoController + '"';
		var NF = window.nanoControllerCache[nanoKey];
		try {
			var nanoInfo = NF.getInfo();
			// Set the target state
			var targetState = state;
			// Set the target value
			var targetValue = settings.value;
			// Set the new action state
			setActionState(context, targetState, targetValue);
		} catch(e) {
			log('plugin/colorAction.js line 89: ' + e);
		}
	}

	// Private function to set the state
	function setActionState(inContext, targetState, targetValue) {
		setState(inContext, targetState);
		setTitle(inContext, targetValue);
	}
}
