//==============================================================================
/**
@file		saveView.js
@brief		Nanoleaf Plugin
@copyright	(c) 2021, fSoft, Ltd.
			This source code is licensed under the MIT-style license found in the LICENSE file.
**/
//==============================================================================

// Load the Save View
function loadSaveView(detail) {
	// Init loadSaveView
	var content = "";
	// Set the status bar
	setStatusBar('save');
	// Fill the header
	document.getElementById('header').innerHTML = localization['Header'];
	// Fill the title
	document.getElementById('title').innerHTML = localization['Save']['Title'];
	// Fill the content area
	content = "<p>" + localization['Save']['Description'] + "</p><div class='button' id='exit'>" + localization['Save']['Exit'] + "</div>";
	document.getElementById('content').innerHTML = content;
	// Add event listener exit
	document.getElementById('exit').addEventListener('click', exit);
	document.addEventListener('enterPressed', exit);
	// Save the controller
	var details = { detail };
	var event = new CustomEvent('saveNanoController', details);
	window.opener.document.dispatchEvent(event);

	// Close this window
	function exit() {
		exitSetup();
	}
}
