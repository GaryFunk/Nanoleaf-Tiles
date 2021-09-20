//==============================================================================
/**
@file		effectsAction.js
@brief		Nanoleaf Plugin
@copyright	(c) 2021, fSoft, Ltd.
			This source code is licensed under the MIT-style license found in the LICENSE file.
**/
//==============================================================================

// Prototype which represents a effects action
function EffectsAction(inContext, inSettings) {
	// Init EffectsAction
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
			log('plugin/effectsAction.js line 26: No controller configured');
			showAlert(inContext);
			return;
		}
		if (window.controllerCache == null) {
			log('plugin/effectsAction.js line 31: No controller in cache');
			showAlert(inContext);
			return;
		}
		// Find the configured controller
		var nanoKey = '"' + inSettings.nanoController + '"';
		var nanoSN = inSettings.nanoController;
		var NF = window.controllerCache[nanoKey];
		var nanoInfo = NF.getInfo();
		var targetState = inSettings.effects;
		// Set the target value
		var targetValue = inSettings.effects;
		// Set state
		NF.setEffects(targetState, targetValue, function (success, error) {
			if (success) {
				var nanoKey = '"' + inSettings.nanoController + '"';
				var nanoSN = inSettings.nanoController;
				setActionState(inContext, targetState, targetValue);
				window.controllerCache[nanoKey].getInfo().effects.select = targetValue;
			} else {
				log(error);
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
		// Set the target value
		var targetValue = settings.effects;
		// Set the new action state
		setActionState(context, targetState, targetValue);
	}

	// Private function to set the state
	function setActionState(inContext, targetState, targetValue) {
		setState(inContext, targetState);
		setTitle(inContext, targetValue);
	}
}
