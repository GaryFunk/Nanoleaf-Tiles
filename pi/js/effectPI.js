//==============================================================================
/**
@file		effectPI.js
@brief		Nanoleaf Plugin
@copyright	(c) 2021, fSoft, Ltd.
			This source code is licensed under the MIT-style license found in the LICENSE file.
**/
//==============================================================================

function EffectPI(inContext, inLanguage, inStreamDeckVersion, inPluginVersion) {
	// Init EffectPI
	var instance = this;

	// Inherit from PI
	PI.call(this, inContext, inLanguage, inStreamDeckVersion, inPluginVersion);

	// Before overwriting parrent method, save a copy of it
	var piLocalize = this.localize;

	window.settings.command = 'effect';

	// Add options to placeholder
	var effectSelect = "<div class='sdpi-item'><div class='sdpi-item-label' id='effect-label'></div id='effect-select'><select class='sdpi-item-value select' id='effect-select'><option id='no-effect' value='no-effect'></option></select></div>";
	document.getElementById('placeholder').innerHTML = effectSelect;

	// Localize the UI
	this.localize = function () {
		// Call PIs localize method
		piLocalize.call(instance);
		// Localize the effect select
		document.getElementById('effect-label').innerHTML = instance.localization['Effect'];
		document.getElementById('no-effect').innerHTML = instance.localization['NoEffect'];
	};

	// Initialize the tooltips
	initToolTips();

	// Add event listener
	document.getElementById('effect-select').addEventListener('change', valueChanged);

	// Effect changed
	function valueChanged(inEvent) {
		if (inEvent.target.value === 'no-effect') {
			return;
		}
		// Save the new effect settings
		window.settings.value = inEvent.target.value;
		instance.saveSettings();
		// Inform the plugin that a new effect is set
		instance.sendToPlugin({'piEvent': 'valueChanged', 'settings': {'command': window.settings.command, 'nanoController': window.settings.nanoController, 'value': inEvent.target.value}});
	}
}
