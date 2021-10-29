//==============================================================================
/**
@file		powerAction.js
@brief		Nanoleaf Plugin
@copyright	(c) 2021, fSoft, Ltd.
			This source code is licensed under the MIT-style license found in the LICENSE file.
**/
//==============================================================================

// Prototype which represents a power action
function PowerAction(inContext, inSettings, isState) {
	// Init PowerAction
	var instance = this;
	// Inherit from Action
	Action.call(this, inContext, inSettings, isState);
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
			log('plugin/powerAction.js line 26 No controller configured');
			showAlert(inContext);
			return;
		}
		if (window.nanoControllerCache == null) {
			log('plugin/powerAction.js line 31 No controller in cache');
			showAlert(inContext);
			return;
		}

		// Find the configured controller
		var nanoKey = '"' + inSettings.nanoController + '"';
		var NF = window.nanoControllerCache[nanoKey];
		var nanoInfo = NF.getInfo();

		// Set the target value
		var currentState = (nanoInfo.state.on.value ? 1 : 0);
		var targetState = (currentState ? 0 : 1);
		var targetValue = (targetState ? 'On' : 'Off');

		// Set state
		NF.setPower(targetState, targetValue, function (success, message, value) {
			if (success) {
				// Add loop here to update the other buttons
				var theButtons = window.buttons[inSettings.nanoController].filter(x => x.command === 'power');
				for (let button of theButtons) {
					setActionState(button.context, targetState, targetValue);
				}

				// Set the new power
				// setActionState(inContext, targetState, targetValue);
			} else {
				log(message);
				setActionState(inContext, targetState, targetValue);
				showAlert(inContext);
			}
		});
	};

	// Private function to set the state
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
			var targetState = (nanoInfo.state.on.value ? 1 : 0);
			// Set the target value
			var targetValue = (nanoInfo.state.on.value ? 'On' : 'Off');
			// Set the new action state
			setActionState(context, targetState, targetValue);
		} catch(e) {
			log(e);
		}
	}

	// Private function to set the state
	function setActionState(inContext, targetState, targetValue) {
		setState(inContext, targetState);
		setTitle(inContext, targetValue);
	}
}
