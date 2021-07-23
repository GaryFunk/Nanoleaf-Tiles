//==============================================================================
/**
@file		searchView.js
@brief		Nanoleaf Plugin
@copyright	(c) 2021, fSoft, Ltd.
			This source code is licensed under the MIT-style license found in the LICENSE file.
**/
//==============================================================================

// Load the Search View
function loadSearchView() {
	var theHaveIPs = "";
	var theNeedIPs = "";
	var contentHaveIPs;
	var contentNeedIPs;

	// Delay the result for 30 seconds
	var resultDelay = 2000;
	// Set the status bar
	setStatusBar('search');
	// Fill the header
	document.getElementById('header').innerHTML = localization['Header'];
	// Fill the title
	document.getElementById('title').innerHTML = localization['Search']['Title'];
	// Fill the content area
	var content = "";
	document.getElementById('content').innerHTML = content;
	// Start the Search
	autoSearch();

	// Search for controllers
	function autoSearch() {
		try {
			Nanoleaf.search(function (status, needAuth, haveAuth) {
				if (status) {
					// Nanoleaf Search request was successful
					nanoHaveIPs = haveAuth;
					nanoNeedIPs = needAuth;

					// Delay displaying the result
					setTimeout(function () {
						if (nanoNeedIPs.length === 0) { // No new controller found
							// Fill the title
							document.getElementById('title').innerHTML = localization['Search']['TitleNone'];
							// Fill the content area
							content = "<p>" + localization['Search']['DescriptionNone'] + "</p><div class='button button-blue' id='retry'>" + localization['Search']['Retry'] + "</div><div class='button button-red' id='exit'>" + localization['Search']['Exit'] + "</div>";
							document.getElementById('content').innerHTML = content;
							// Add event listener retry
							document.getElementById('retry').addEventListener('click', retry);
							document.addEventListener('enterPressed', retry);
							// Add event listener exit
							document.getElementById('exit').addEventListener('click', exit);
							document.addEventListener('escPressed', exit);
						} else { // Controller found
							if (nanoNeedIPs.length === 1) { // One new controller found
								// Fill the title
								document.getElementById('title').innerHTML = localization['Search']['TitleOne'];
							} else { // More than one controller found
								// Fill the title
								document.getElementById('title').innerHTML = localization['Search']['TitleMultiple'].replace('{{ number }}', nanoNeedIPs.length);
							}
							nanoHaveIPs.sort((a, b) => {
								const num1 = Number(a.split(".").map((num) => (`000${num}`).slice(-3) ).join(""));
								const num2 = Number(b.split(".").map((num) => (`000${num}`).slice(-3) ).join(""));
								return num1-num2;
							});
							nanoNeedIPs.sort((a, b) => {
								const num1 = Number(a.split(".").map((num) => (`000${num}`).slice(-3) ).join(""));
								const num2 = Number(b.split(".").map((num) => (`000${num}`).slice(-3) ).join(""));
								return num1-num2;
							});
							nanoHaveIPs.forEach(function (item) {
								theHaveIPs += item + " &nbsp; ";
							});
							nanoNeedIPs.forEach(function (item) {
								theNeedIPs += item + " &nbsp; ";
							});
							// Fill the content area
							content = "<p>" + content + "</p><br><br><p style='color: yellow;'>" + localization['Search']['DescriptionFound'] + "</p>";
							content += "<div class='button button-green' id='continue'>" + localization['Search']['Continue'] + "</div><div class='button button-blue' id='retry'>" + localization['Search']['Retry'] + "</div><div class='button button-red' id='exit'>" + localization['Search']['Exit'] + "</div>";
							if (nanoHaveIPs.length > 0) {
								contentHaveIPs = "<p>" + localization['Search']['ControllersAuth'] + "<br>" + theHaveIPs +"</p>";
							} else {
								contentHaveIPs = "<p>" + localization['Search']['ControllersAuth'] + "<br>None Found</p>";
							}
							if (nanoNeedIPs.length > 0) {
								contentNeedIPs = "<p>" + localization['Search']['ControllersNeedAuth'] + "<br>" + theNeedIPs +"</p>";
							} else {
								contentNeedIPs = "<p>" + localization['Search']['ControllersNeedAuth'] + "<br>None Found</p>";
							}
							document.getElementById('contentHaveIPs').innerHTML = contentHaveIPs;
							document.getElementById('contentNeedIPs').innerHTML = contentNeedIPs;
							document.getElementById('content').innerHTML = content;
							// Add event listener continueAuthorize
							document.getElementById('continue').addEventListener('click', continueAuthorize);
							document.addEventListener('enterPressed', continueAuthorize);
							// Add event listener exit
							document.getElementById('exit').addEventListener('click', exit);
							document.addEventListener('escPressed', exit);
							// Add event listener retry
							document.getElementById('retry').addEventListener('click', retry);
						}
					}, resultDelay);
				} else {
					// An error occurred while contacting the Nanoleaf Search service
					document.getElementById('content').innerHTML = '<p>' + data + '</p>';
				}
			});
		} catch(e) {
			// An error occurred while contacting the Nanoleaf Search service
			content = "<p style='color: yellow;'>An error occured while searching with IP:<br>" + localIP + "<br><br>" + e + "</p><div class='button button-blue' id='goback'>" + localization['Search']['GoBack'] + "</div><div class='button button-red' id='exit'>" + localization['Search']['Exit'] + "</div>";
			document.getElementById('content').innerHTML = content;
			// Add event listener retry
			document.getElementById('goback').addEventListener('click', goback);
			document.addEventListener('enterPressed', goback);
			// Add event listener exit
			document.getElementById('exit').addEventListener('click', exit);
		}
	}

	function sortAlphaNum(a, b) {
		var aA = a.replace(reA, "");
		var bA = b.replace(reA, "");
		if (aA === bA) {
			var aN = parseInt(a.replace(reN, ""), 10);
			var bN = parseInt(b.replace(reN, ""), 10);
			return aN === bN ? 0 : aN > bN ? 1 : -1;
		} else {
			return aA > bA ? 1 : -1;
		}
	}

	// Open authorize view
	function continueAuthorize() {
		unloadSearchView();
		loadAuthorizeView();
	}

	// Retry Search by reloading the view
	function retry() {
		unloadSearchView();
		loadSearchView();
	}

	// Retry Search by reloading the view
	function goback() {
		unloadSearchView();
		loadIntroView();
	}

	// exit the window
	function exit() {
		exitSetup();
	}

	// Unload view
	function unloadSearchView() {
		// Remove event listener
		document.removeEventListener('enterPressed', continueAuthorize);
		document.removeEventListener('escPressed', exit);
		document.getElementById('contentHaveIPs').innerHTML = '';
		document.getElementById('contentNeedIPs').innerHTML = '';
	}
}
