//==============================================================================
/**
@file		powerPI.js
@brief		Nanoleaf Plugin
@copyright	(c) 2021, fSoft, Ltd.
			This source code is licensed under the MIT-style license found in the LICENSE file.
**/
//==============================================================================

function PowerPI(inContext, inLanguage, inStreamDeckVersion, inPluginVersion) {
	// Inherit powerPI
	var instance = this;

	// Inherit from PI
	PI.call(this, inContext, inLanguage, inStreamDeckVersion, inPluginVersion);

	// Before overwriting parent method, save a copy of it
	var piLocalize = this.localize;

	window.settings.command = 'power';

	// Localize the UI
	this.localize = function () {
		// Call PIs localize method
		piLocalize.call(instance);
	};

	// Initialize the tooltips
	initToolTips();

	// Brightness changed
	function valueChanged(inEvent) {
		// Save the new brightness settings
		window.settings.value = inEvent.target.value;
		instance.saveSettings();
		// Inform the plugin that a new brightness is set
		instance.sendToPlugin({'piEvent': 'valueChanged'});
	}
}
