//==============================================================================
/**
@file		brightnessPI.js
@brief		Nanoleaf Plugin
@copyright	(c) 2021, fSoft, Ltd.
			This source code is licensed under the MIT-style license found in the LICENSE file.
**/
//==============================================================================

function BrightnessPI(inContext, inLanguage, inStreamDeckVersion, inPluginVersion, action) {
	// Init BrightnessPI
	var instance = this;

	// Inherit from PI
	PI.call(this, inContext, inLanguage, inStreamDeckVersion, inPluginVersion, action);

	// Before overwriting parent method, save a copy of it
	var piLocalize = this.localize;

	if (action === 'com.fsoft.nanoleaf.brightnessd') {
		window.settings.transition = 'decrease';
		if (window.settings.value === undefined) {
			window.settings.value = 15;
		}
	} else if (action === 'com.fsoft.nanoleaf.brightnessi') {
		window.settings.transition = 'increase';
		if (window.settings.value === undefined) {
			window.settings.value = 15;
		}
	} else {
		window.settings.transition = 'set';
		if (window.settings.value === undefined) {
			window.settings.value = 50;
		}
	}
	window.settings.command = 'brightness';

	// Add brightness slider to placeholder
	var brightnessSlider = "<div type='range' class='sdpi-item'><div class='sdpi-item-label' id='brightness-label'>Brightness Change</div><div class='sdpi-item-value'><input class='floating-tooltip' type='range' id='brightness-input' min='1' max='100' value='" + window.settings.value + "'></div></div>";
	document.getElementById('placeholder').innerHTML = brightnessSlider;

	// Localize the UI
	this.localize = function () {
		// Call PIs localize method
		piLocalize.call(instance);
		// Localize the brightness label
		document.getElementById('brightness-label').innerHTML = instance.localization['Brightness'];
	};

	// Initialize the tooltips
	initToolTips();

	// Add event listener
	document.getElementById('brightness-input').addEventListener('change', valueChanged);

	// Brightness changed
	function valueChanged(inEvent) {
		// Save the new brightness settings
		window.settings.value = inEvent.target.value;
		instance.saveSettings();
		// Inform the plugin that a new brightness is set
		instance.sendToPlugin({'piEvent': 'valueChanged', 'settings': {'command': window.settings.command, 'nanoController': window.settings.nanoController, 'transition': window.settings.transition, 'value': inEvent.target.value}});
	}
}
