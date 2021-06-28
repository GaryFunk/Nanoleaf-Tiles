//==============================================================================
/**
@file		effectsPI.js
@brief		Nanoleaf Plugin
@copyright	(c) 2021, fSoft, Ltd.
			This source code is licensed under the MIT-style license found in the LICENSE file.
**/
//==============================================================================

function EffectsPI(inContext, inLanguage, inStreamDeckVersion, inPluginVersion) {
	// Init EffectsPI
	var instance = this;

	// Inherit from PI
	PI.call(this, inContext, inLanguage, inStreamDeckVersion, inPluginVersion);

	// Before overwriting parrent method, save a copy of it
	var piLocalize = this.localize;

	// set options to placeholder
	var effectsSelect = "<div class='sdpi-item'><div class='sdpi-item-label' id='effects-label'></div id='effects-select'><select class='sdpi-item-value select' id='effects-select'><option id='no-effects' value='no-effects'></option></select></div>";
	document.getElementById('placeholder').innerHTML = effectsSelect;

	// Localize the UI
	this.localize = function () {
		// Call PIs localize method
		piLocalize.call(instance);
		// Localize the effects select
		document.getElementById('effects-label').innerHTML = instance.localization['Effects'];
		document.getElementById('no-effects').innerHTML = instance.localization['NoEffects'];
	};

	// Initialize the tooltips
	initToolTips();

	// Add event listener
	document.getElementById('effects-select').addEventListener('change', effectsChanged);
	document.getElementById('controller-select').value = settings.nanoController;

	// Effects changed
	function effectsChanged(inEvent) {
		if (inEvent.target.value === 'no-effects') {
			return;
		}
		// Save the new effects settings
		settings.effects = inEvent.target.value;
		instance.saveSettings();
		// Inform the plugin that a new effects is set
		instance.sendToPlugin({'piEvent': 'valueChanged'});
	}
}
