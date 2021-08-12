//==============================================================================
/**
@file		colorAction.js
@brief		Nanoleaf Plugin
@copyright	(c) 2021, fSoft, Ltd.
			This source code is licensed under the MIT-style license found in the LICENSE file.
**/
//==============================================================================

// Prototype which represents a color action
function ColorAction(inContext, inSettings) {
	// Init ColorAction
	var instance = this;
	// Inherit from Action
	Action.call(this, inContext, inSettings);
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
			log('plugin/colorAction.js line 26: No controller configured');
			showAlert(inContext);
			return;
		}
		if (window.controllerCache == null) {
			log('plugin/colorAction.js line 31: No controller in cache');
			showAlert(inContext);
			return;
		}
		// Find the configured controller
		var nanoKey = '"' + inSettings.nanoController + '"';
		var nanoSN = inSettings.nanoController;
		var NF = window.controllerCache[nanoKey];
		var targetState = inSettings.color;
		if (inUserDesiredState !== undefined) {
			targetState = inUserDesiredState;
		}
		// Set state
		NF.setColor(targetState, function (success, error) {
			if (success) {
				setActionState(inContext, targetState);
				var targetValue = (targetState * 25);
				var nanoKey = '"' + inSettings.nanoController + '"';
				var nanoSN = inSettings.nanoController;
<<<<<<< Updated upstream
				window.controllerCache[nanoKey].getInfo().state.brightness = targetValue;
=======
				setActionState(inContext, targetState, targetValue);
				window.controllerCache[nanoKey].getInfo().state.ct.value = state.ct.value;   //fix this
				window.controllerCache[nanoKey].getInfo().state.hue.value = state.hue.value;   //fix this
				window.controllerCache[nanoKey].getInfo().state.sat.value = state.sat.value;   //fix this
>>>>>>> Stashed changes
			} else {
				log(error);
				setActionState(inContext, inState);
				showAlert(inContext);
			}
		});
	};




	// Private function to set the defaults
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
		nanoInfo = NF.getInfo();
		// Set the target state
		var targetState = settings.effects;
		// Set the new action state
		setActionState(context, targetState);
	}

	// Private function to set the state
	function setActionState(inContext, targetState) {
		setState(inContext, targetState);
	}
}
