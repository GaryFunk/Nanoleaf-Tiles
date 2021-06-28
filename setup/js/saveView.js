//==============================================================================
/**
@file		saveView.js
@brief		Nanoleaf Plugin
@copyright	(c) 2021, fSoft, Ltd.
			This source code is licensed under the MIT-style license found in the LICENSE file.
**/
//==============================================================================

// Load the Save View
function loadSaveView() {
	// Init loadSaveView
	var instance = this;
	// Set the status bar
	setStatusBar('save');
	// Fill the header
	document.getElementById('header').innerHTML = localization['Header'];
	// Fill the title
	document.getElementById('title').innerHTML = localization['Save']['Title'];
	// Fill the content area
	var content = "<p>" + localization['Save']['Description'] + "</p><div class='button' id='exit'>" + localization['Save']['Exit'] + "</div>";
	document.getElementById('content').innerHTML = content;
	// Add event listener exit
	document.getElementById('exit').addEventListener('click', exit);
	document.addEventListener('enterPressed', exit);
	// Save the controller
	var detail = {
		'detail': {
			'nanoIP': nanoIP,
			'nanoName': nanoName,
			'nanoSN': nanoSN,
			'nanoToken': nanoToken
		}
	};
	var event = new CustomEvent('saveNanoController', detail);
	window.opener.document.dispatchEvent(event);

	// Close this window
	function exit() {
		window.close();
	}
}
