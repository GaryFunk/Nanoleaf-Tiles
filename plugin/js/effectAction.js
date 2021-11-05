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
	updateState();
	// Public function called on key up event
	this.onKeyUp = function (inContext, inSettings, inCoordinates, inUserDesiredState, inState) {
		// If onKeyUp was triggered manually, load settings
		if (inSettings === undefined) {
			inSettings = instance.getSettings();
		}
		// Check if any controller is configured
		if (!('nanoController' in inSettings)) {
			log('plugin/effectAction.js line 26 No controller configured');
			showAlert(inContext);
			return;
		}
		if (window.nanoControllerCache == null) {
			log('plugin/effectAction.js line 31 No controller in cache');
			showAlert(inContext);
			return;
		}

		// Find the configured controller
		try {
			var nanoKey = '"' + inSettings.nanoController + '"';
			var NF = window.nanoControllerCache[nanoKey];
			var targetState = 1;

			// Set the target value
			var targetValue = inSettings.value;

			// Set state
			NF.setEffect(targetState, targetValue, function (success, message, value) {
				if (success) {
					// Add loop here to update the other buttons
					var theButtons = window.buttons[inSettings.nanoController].filter(x => x.command === 'color' || x.command === 'effect');
					for (let button of theButtons) {
						setState(button.context, !targetState);
					}

					// Set the new effect
					setActionState(inContext, targetState, targetValue);
					instance.updateCrap('brightness', inSettings.nanoController, targetState, NF.getInfo());
				} else {
					log('plugin/effectAction.js line 58: ' + message);
					setActionState(inContext, targetState, targetValue);
					showAlert(inContext);
				}
			});
		} catch(e) {
			log('plugin/effectAction.js line 64: ' + e);
		}
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
		try {
			var nanoKey = '"' + inSettings.nanoController + '"';
			var NF = window.nanoControllerCache[nanoKey];
			var nanoInfo = NF.getInfo();
			// Set the target state
			var targetState = state;
			// Set the target value
			var targetValue = settings.value;
			// Set the new action state
			setActionState(context, targetState, targetValue);
		} catch(e) {
			log('plugin/effectAction.js line 93: ' + e);
		}
	}

	// Private function to set the state
	function setActionState(inContext, targetState, targetValue) {
		if (targetValue !== undefined) {
			var newTitle = targetValue.split(" ");
			for (let i = 0; i < newTitle.length -1; i++) {
				newTitle[i] = newTitle[i] + "\n";
			}
			newTitle = newTitle.join("");
		} else {
			newTitle = "";
		}
		setState(inContext, targetState);
		setTitle(inContext, newTitle);
	}
}
