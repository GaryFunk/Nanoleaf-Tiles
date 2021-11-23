<svg fill="none" viewBox="0 0 800 400" width="800" height="400" xmlns="http://www.w3.org/2000/svg">
	<foreignObject width="100%" height="100%">
		<div xmlns="http://www.w3.org/1999/xhtml">
			<style>
				@keyframes rotate {
					0% {
						transform: rotate(3deg);
					}
					100% {
						transform: rotate(-3deg);
					}
				}

				@keyframes gradientBackground {
					0% {
						background-position: 0% 50%;
					}
					50% {
						background-position: 100% 50%;
					}
					100% {
						background-position: 0% 50%;
					}
				}

				@keyframes fadeIn {
					0% {
						opacity: 0;
					}
					66% {
						opacity: 0;
					}
					100% {
						opacity: 1;
					}
				}

				.container {
					font-family:
						system-ui,
						-apple-system,
						'Segoe UI',
						Roboto,
						Helvetica,
						Arial,
						sans-serif,
						'Apple Color Emoji',
						'Segoe UI Emoji';
					display: flex;
					flex-direction: column;
					align-items: center;
					justify-content: center;
					margin: 0;
					width: 100%;
					height: 400px;
					background: linear-gradient(-45deg, #fc5c7d, #6a82fb, #05dfd7);
					background-size: 600% 400%;
					animation: gradientBackground 10s ease infinite;
					border-radius: 10px;
					color: white;
					text-align: center;
				}

				h1 {
					font-size: 50px;
					line-height: 1.3;
					letter-spacing: 5px;
					text-transform: uppercase;
					text-shadow:
						0 1px 0 #efefef,
						0 2px 0 #efefef,
						0 3px 0 #efefef,
						0 4px 0 #efefef,
						0 12px 5px rgba(0, 0, 0, 0.1);
					animation: rotate ease-in-out 1s infinite alternate;
				}

				p {
					font-size: 20px;
					text-shadow: 0 1px 0 #efefef;
					animation: 5s ease 0s normal forwards 1 fadeIn;
				}
			</style>
			<div class="container">
<!-- start of text -->
<h1>Nanoleaf Tiles</h1>
<ul>
A Nanoleaf controller written in JavaScript for the Elgato Stream Deck devices.<br />
</ul>

<h3 style="color: #D00000;">Overview</h3>
<ul>
Control Nanoleaf Panels, Canvas, Lines and Shapes Tiles from your Stream Deck.
Toggle the controller tiles on or off; increase, decrease or set the brightness level; set the tiles color or apply one of the special effects.
Use the Stream Deck 'Multi Action' to send actions to several controllers.
Use 'Folders' to group actions per Nanoleaf controller.
Buttons across devices are kept in sync.
Suggestions and comments, good or bad, are always welcome.<br />
</ul>

<h3>What's New</h3>
<ul>
Version 1.3 - 11/08/2021<br />
Added Brightness Increase and Brightness Decrease buttons.
Added additional localization files in English (de, en, es, fr, ja, ko and zh_CN).
Added code to update like buttons across Stream Deck hardware.
Added new icons for Brightness, Color and Effect where the multi-color icon indicates last pushed.
Changed Brightness to set a static value.
Pay attention as to how the button icons update.<br />
</ul>

<h3>Helpful Links</h3>
<ul>
README: https://github.com/GaryFunk/Nanoleaf-Tiles/blob/main/README.md<br />
</ul>

<h3>Information</h3>
<ul>
Compatibility: Stream Deck 5.0.0 and later, Windows 10 and later, macOS 10.11 and later.<br />
Languages: English, German. Translation needed for: Chinese, French, Japanese, Korean, Spanish.<br />
</ul>

<h3>Support Links</h3>
<ul>
Issues:  https://github.com/GaryFunk/Nanoleaf-Tiles/issues<br />
Discord: https://discord.gg/gQ4kKVCc<br />
</ul>

<h3>Known Issues</h3>
<ul>
No known issues in this release.<br />
</ul>

<h3>Notes</h3>
<ul>
On the Property Inspector, leave the Title blank except for Color which you will enter the name of the color.<br />
The Stream Deck will indicate the status of the controller by dislaying a colored (non-green) icon.<br />
</ul>

<h3>Credits</h3>
<ul>
Alerts provided by Sweet Alert https://sweetalert.js.org/<br />
</ul>

<h3>Donations</h3>
<ul>
@Backslasher: https://discordapp.com/users/277603804399140865/<br />
</ul>

<h3>Special Thanks</h3>
<ul>
@BarRaider https://discordapp.com/users/270832792802164736/ - Plugin hosting and advice.<br />
@Backslasher https://discordapp.com/users/277603804399140865/ - German translation.<br />
</ul>

<h3>Previous Releases</h3>

<h3>v1.2</h3>
<ul>
Brightness supports a custom value.<br />
Long press on Brightness sets it to 100.<br />
Fixed: Label on all Effect buttons was set to current Effect.<br />
</ul>

<h3>v1.1</h3>
<ul>
Controller setup rewritten and optimized.<br />
Property Inspector main code rewritten.<br />
Plugin code rewritten.<br />
Unused code removed.<br />
Bug fixes and more bug fixes.<br />
</ul>

<h3>v1.0</h3>
<ul>
Initial release.<br />
This is my first Stream Deck plugin.<br />
</ul>
<!-- end of test -->
			</div>
		</div>
	</foreignObject>
</svg>
