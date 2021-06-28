//==============================================================================
/**
@file		powerAction.js
@brief		Nanoleaf Plugin
@copyright	(c) 2021, fSoft, Ltd.
			This source code is licensed under the MIT-style license found in the LICENSE file.
**/
//==============================================================================

// Prototype which represents a power action
function PowerAction(inContext, inSettings) {
	// Init PowerAction
	var instance = this;
	// Inherit from Action
	Action.call(this, inContext, inSettings);
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
			log('plugin/powerAction.js line 26: No controller configured');
			showAlert(inContext);
			return;
		}
		if (window.controllerCache == null) {
			log('plugin/powerAction.js line 31: No controller in cache');
			showAlert(inContext);
			return;
		}
		// Find the configured controller
		var nanoKey = '"' + inSettings.nanoController + '"';
		var nanoSN = inSettings.nanoController;
		var NF = window.controllerCache[nanoKey];
		var targetState = inState + 1;
		if (targetState > 1) {
			targetState = 0;
		}
		if (inUserDesiredState !== undefined) {
			targetState = inUserDesiredState;
		}

		// Set state
		NF.setPower(targetState, function (success, error) {
			if (success) {
				setActionState(inContext, targetState);
				var targetValue = (targetState * 1);
				var nanoKey = '"' + inSettings.nanoController + '"';
				var nanoSN = inSettings.nanoController;
				window.controllerCache[nanoKey].getInfo().state.on = targetValue;
			} else {
				log(error);
				setActionState(inContext, inState);
				showAlert(inContext);
			}
		});
	};

	// Private function to set the state
	function updateState() {
		// Get the settings and the context
		var settings = instance.getSettings();
		var context = instance.getContext();
		// Check if any controller is configured
		if (!('nanoController' in settings)) {
			return;
		}
		if (window.controllerCache == null) {
			return;
		}
		// Find the configured controller
		var nanoKey = '"' + inSettings.nanoController + '"';
		var nanoSN = inSettings.nanoController;
		var NF = window.controllerCache[nanoKey];
		var nanoInfo = NF.getInfo();
		// Set the target state
		var targetState = (nanoInfo.state.on.value ? 1 : 0);
		// Set the new action state
		setActionState(context, targetState);
	}

	// Private function to set the state
	function setActionState(inContext, targetState) {
		setState(inContext, targetState);
	}
}
