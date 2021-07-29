//==============================================================================
/**
@file		introView.js
@brief		Nanoleaf Plugin
@copyright	(c) 2021, fSoft, Ltd.
			This source code is licensed under the MIT-style license found in the LICENSE file.
**/
//==============================================================================

// Load the Intro View
function loadIntroView() {
	// local variables
	var content = "";

	// Set the status bar
	setStatusBar('intro');
	// Fill the header
	document.getElementById('header').innerHTML = localization['Header'];
	// Fill the title
	document.getElementById('title').innerHTML = localization['Intro']['Title'];
	// Fill the content area
	content = "<p>" + localization['Intro']['Description'] + "</p><br />";
	if (localIP == 'error') {
		content += "<p>" + localization['Intro']['NoIPaddress'] + "</p>";
	} else {
		content += "<div class='button button-green' id='continue'>" + localization['Intro']['Continue'] + "</div>";
		content += "<p>" + localization['Intro']['Or'] + "</p>";
	}
	content += "<div class='button button-green' id='localip'>" + localization['Intro']['IPaddress'] + "</div><p><input id='ipaddress' value=''></p><br />";
	content += "<div class='button button-red' id='exit'>" + localization['Intro']['Exit'] + "</div>";

	document.getElementById('content').innerHTML = content;
	// Add event listener continueSearch
	if (localIP !== 'error') {
		document.getElementById('continue').addEventListener('click', continueSearch);
		document.addEventListener('enterPressed', continueSearch);
	}
	// Add event listener ipaddress
	document.getElementById("localip").addEventListener("click", function (event){event.preventDefault(); checkIP(document.getElementById("ipaddress"));});
	// Add event listener exit
	document.getElementById('exit').addEventListener('click', exit);
	document.addEventListener('escPressed', exit);

	// Check the validity of the entered IP address
	function checkIP(theIP) {
        var ipformat = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        if (theIP.value.match(ipformat)) {
			localIP = theIP.value;
            continueSearch();
            return true;
        } else {
			swal("Please enter a valid IP Address", "Such as 192.168.2.2", "error");
            return false;
    	}
	}

	// Load the search view
	function continueSearch() {
		unloadIntroView();
		loadSearchView();
	}

	// Load the search view
	function continueSearchIP(localIP) {
		unloadIntroView();
		loadSearchView(localIP);
	}

	// Close the setupWindow
	function exit() {
		exitSetup();
	}

	// Unload view
	function unloadIntroView() {
		// Remove event listener
		document.removeEventListener('enterPressed', continueSearch);
		document.removeEventListener('escPressed', exit);
	}
}
