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

	window.settings.command = "color";
	if (window.settings.color == undefined) {
		window.settings.color = "#FFFFFF";
	}

	if (window.settings.value !== undefined) {
		window.settings.color = window.settings.value;
		delete window.settings.value;
		document.addEventListener("call_valueChanged", valueChanged);
		let detail = {"color": window.settings.color};
		let details = { detail };
		document.value = window.settings.color;
		let myEvent = new CustomEvent("call_valueChanged", details);
		sleep(50).then(() => {
			document.dispatchEvent(myEvent);
		})
	}

	// Add color picker to placeholder
	let colorPicker = `<div type="color" class="sdpi-item"><div class="sdpi-item-label" id="color-label">${instance.localization["Color"]}</div><input type="color" class="sdpi-item-value" id="color-inputPicker" value="${window.settings.color}"><input type="text" style="font-size: 10pt" class="sdpi-item-value" id="color-inputText" value="${window.settings.color}"></div>`;
	document.getElementById("placeholder").innerHTML = colorPicker;

	// Localize the UI
	this.localize = function () {
		// Call PIs localize method
		piLocalize.call(instance);
		// Localize the color label
		document.getElementById("color-label").innerHTML = instance.localization["Color"];
	};

	sleep(50).then(() => {
		buildImage(inContext, window.settings.color);
	});

	// Initialize the tooltips
	initToolTips();

	// Add event listener
	document.getElementById("color-inputPicker").addEventListener("change", valueChanged);
	document.getElementById("color-inputText").addEventListener("change", valueChanged);

	// Color changed
	function valueChanged(inEvent) {
		// Get the new color settings
		window.settings.color = inEvent.target.value.toUpperCase();
		instance.saveSettings();
		document.getElementById("color-inputPicker").value = window.settings.color;
		document.getElementById("color-inputText").value = window.settings.color;
		buildImage(inContext, window.settings.color);
		// Inform the plugin that a new color is set
		instance.sendToPlugin({ "piEvent": "valueChanged" });
	}

	function buildImage(inContext, inColor) {
		let canvas = null;
		let img = null;
		let ctx = null;
		let dataURL = null;

		canvas = document.getElementById("iconCanvas0");
		img = document.getElementById("icon0");
		ctx = canvas.getContext("2d");
		ctx.canvas.width = 72;
		ctx.canvas.height = 72;
		ctx.drawImage(img, 0, 0);
		ctx.fillStyle = inColor;
		ctx.fillRect(0, 50, 72, 17);
		inImage = canvas.toDataURL();
		instance.sendToPlugin({"piEvent": "setImage", "inContext": inContext, "inImage": inImage, "inState": 0});

		canvas = null;
		img = null;
		ctx = null;
		dataURL = null;
		canvas = document.getElementById("iconCanvas1");
		img = document.getElementById("icon1");
		ctx = canvas.getContext("2d");
		ctx.canvas.width = 72;
		ctx.canvas.height = 72;
		ctx.drawImage(img, 0, 0);
		ctx.fillStyle = inColor;
		ctx.fillRect(0, 57, 72, 10);
		inImage = canvas.toDataURL();
		instance.sendToPlugin({"piEvent": "setImage", "inContext": inContext, "inImage": inImage, "inState": 1});
	}
}
