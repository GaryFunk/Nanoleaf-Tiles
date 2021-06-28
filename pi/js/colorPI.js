//==============================================================================
/**
@file		colorPI.js
@brief		Nanoleaf Plugin
@copyright	(c) 2021, fSoft, Ltd.
			This source code is licensed under the MIT-style license found in the LICENSE file.
**/
//==============================================================================

function ColorPI(inContext, inLanguage, inStreamDeckVersion, inPluginVersion) {
	// Init ColorPI
	var instance = this;

	// Inherit from PI
	PI.call(this, inContext, inLanguage, inStreamDeckVersion, inPluginVersion);

	// Before overwriting parent method, save a copy of it
	var piLocalize = this.localize;

	if (settings.color == undefined) {
		settings.color = '#FFFFFF';
	}

	// Add full color picker or only temperature slider
	var colorPicker = "<div type='color' class='sdpi-item'><div class='sdpi-item-label' id='color-label'>" + instance.localization['Color'] + "</div><input type='color' class='sdpi-item-value' id='color-inputPicker' value='" + settings.color + "'><input type='text' style='font-size: 10pt' class='sdpi-item-value' id='color-inputText' value='" + settings.color + "'></div>";
	document.getElementById('placeholder').innerHTML = colorPicker;

	// Localize the UI
	this.localize = function () {
		// Call PIs localize method
		piLocalize.call(instance);
		// Localize the color label
		document.getElementById('color-label').innerHTML = instance.localization['Color'];
	};

	// Initialize the tooltips
	initToolTips();

	// Add event listener
	document.getElementById('color-inputPicker').addEventListener('change', colorChanged);
	document.getElementById('color-inputText').addEventListener('change', colorChanged);

	// Color changed
	function colorChanged(inEvent) {
		// Get the new color settings
		settings.color = inEvent.target.value;
		instance.saveSettings();
		document.getElementById('color-inputPicker').value = settings.color;
		document.getElementById('color-inputText').value = settings.color.toUpperCase();
		// Inform the plugin that a new color is set
		instance.sendToPlugin({ 'piEvent': 'valueChanged' });
	}
}
