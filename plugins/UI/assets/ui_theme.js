window._getPintarUITheme = function(assetsRoot) {

	// load ui texture
	var uiTexture = new PintarJS.Texture(assetsRoot + "/ui.png");

	// add style tag to define the font
	var css = '@font-face { ' +
	'	font-family: "ui-font"; ' +
	'	src: url("' + assetsRoot + '/FFFFORWA.TTF");' +
	'}',
	head = document.head || document.getElementsByTagName('head')[0],
	style = document.createElement('style');
	head.appendChild(style);
	style.type = 'text/css';
	if (style.styleSheet) {
		style.styleSheet.cssText = css;
	} else {
		style.appendChild(document.createTextNode(css));
	}


	// global texture scale
	const textureScale = 5;
	var fontsScale = textureScale / 5;

	// font name to use
	var fontName = "ui-font";

	// define the UI theme
	var UI_THEME = 
		  {
			// define cursors
			Cursor:
			{
			  // default cursors skin
			  default: 
			  {
				texture: uiTexture,
				textureScale: textureScale,
				defaultSourceRect: new PintarJS.Rectangle(65, 3, 8, 8),
				pointerSourceRect: new PintarJS.Rectangle(65 + 8 + 1, 3, 8, 8),
				pointerDownSourceRect: new PintarJS.Rectangle(65 + 16 + 2, 3, 8, 8),
			  }
			},

			// define panel types
			Panel: 
			{
			  // default panel
			  default: 
			  {
				texture: uiTexture,
				externalSourceRect: new PintarJS.Rectangle(0, 32, 64, 64),
				internalSourceRect: new PintarJS.Rectangle(5, 37, 54, 54),
				textureScale: textureScale,
				fillMode: PintarJS.UI.SlicedSprite.FillModes.Tiled,
				fillColor: PintarJS.Color.white(),
				frameColor: PintarJS.Color.white(),
				padding: new PintarJS.UI.SidesProperties(30, 30, 30, 30),
			  }
			},

			// define horizontal lines
			HorizontalLine:
			{
			  // default horizontal line
			  default: 
			  {
				texture: uiTexture,
				textureScale: textureScale,
				startEdgeSourceRect: new PintarJS.Rectangle(64, 0, 2, 2),
				endEdgeSourceRect: new PintarJS.Rectangle(94, 0, 2, 2),
				middleSourceRect: new PintarJS.Rectangle(66, 0, 28, 2),
				margin: new PintarJS.UI.SidesProperties(5, 5, 5, 20),
			  },
			},
			
			// define slider types
			Slider:
			{
			  // default slider
			  default: 
			  {
				texture: uiTexture,
				textureScale: textureScale,
				startEdgeSourceRect: new PintarJS.Rectangle(64, 64, 5, 8),
				middleSourceRect: new PintarJS.Rectangle(69, 64, 22, 8),
				endEdgeSourceRect: new PintarJS.Rectangle(91, 64, 5, 8),
				handleSourceRect: new PintarJS.Rectangle(64, 73, 5, 8),
				direction: "horizontal",
			  },

			  // fancy slider
			  fancy: 
			  {
				texture: uiTexture,
				textureScale: textureScale,
				startEdgeSourceRect: new PintarJS.Rectangle(96, 64, 16, 16),
				middleSourceRect: new PintarJS.Rectangle(96, 48, 16, 16),
				endEdgeSourceRect: new PintarJS.Rectangle(112, 64, 16, 16),
				handleSourceRect: new PintarJS.Rectangle(78, 73, 7, 8),
				handleOffset: new PintarJS.Point(0, 4 * textureScale),
				direction: "horizontal",
			  },

			  // horizontal scrollbar
			  horizontalScrollbar: 
			  {
				texture: uiTexture,
				textureScale: textureScale,
				startEdgeSourceRect: new PintarJS.Rectangle(96, 0, 16, 16),
				middleSourceRect: new PintarJS.Rectangle(96, 48, 16, 16),
				endEdgeSourceRect: new PintarJS.Rectangle(96, 16, 16, 16),
				handleSourceRect: new PintarJS.Rectangle(112, 48, 16, 16),
				direction: "horizontal",
			  },

			  // vertical scrollbar
			  VerticalScrollbar: 
			  {
				texture: uiTexture,
				textureScale: textureScale,
				startEdgeSourceRect: new PintarJS.Rectangle(112, 0, 16, 16),
				middleSourceRect: new PintarJS.Rectangle(112, 16, 16, 16),
				endEdgeSourceRect: new PintarJS.Rectangle(112, 32, 16, 16),
				handleSourceRect: new PintarJS.Rectangle(112, 48, 16, 16),
				direction: "vertical",
			  },
			},

			// define progressbars
			ProgressBar: 
			{
			  // default progressbar
			  default: 
			  {
				texture: uiTexture,
				fillExternalSourceRect: new PintarJS.Rectangle(2, 13, 60, 4),
				fillInternalSourceRect: new PintarJS.Rectangle(4, 14, 56, 2),
				backgroundExternalSourceRect: new PintarJS.Rectangle(0, 0, 64, 10),
				backgroundInternalSourceRect: new PintarJS.Rectangle(4, 4, 56, 2),
				foregroundExternalSourceRect: new PintarJS.Rectangle(0, 20, 64, 10),
				foregroundInternalSourceRect: new PintarJS.Rectangle(4, 24, 56, 2),
				fillOffset: new PintarJS.Point(2 * textureScale, 3 * textureScale),
				textureScale: textureScale,
				fillColor: PintarJS.Color.red(),
				backgroundColor: PintarJS.Color.white(),
				valueSetWidth: true,
				valueSetHeight: false,
				animationSpeed: 1,
			  },

			  // hp orb
			  orb: 
			  {
				texture: uiTexture,
				fillSourceRect: new PintarJS.Rectangle(32, 96, 32, 32),
				backgroundSourceRect: new PintarJS.Rectangle(0, 96, 32, 32),
				foregroundSourceRect: new PintarJS.Rectangle(64, 96, 32, 32),
				fillOffset: new PintarJS.Point(0, 0),
				textureScale: textureScale,
				fillColor: PintarJS.Color.red(),
				backgroundColor: PintarJS.Color.white(),
				valueSetWidth: false,
				valueSetHeight: true,
				fillAnchor: "BottomCenter",
				animationSpeed: 1,
			  },

			  // vertical bar
			  vertical: 
			  {
				texture: uiTexture,
				fillExternalSourceRect: new PintarJS.Rectangle(116, 105, 8, 14),
				fillInternalSourceRect: new PintarJS.Rectangle(116+2, 105+1, 8-4, 14-2),
				backgroundExternalSourceRect: new PintarJS.Rectangle(96, 96, 16, 32),
				backgroundInternalSourceRect: new PintarJS.Rectangle(96+4, 96+9, 16-8, 32-18),
				fillOffset: new PintarJS.Point(0, 9 * textureScale),
				textureScale: textureScale,
				fillColor: PintarJS.Color.green(),
				backgroundColor: PintarJS.Color.white(),
				valueSetWidth: false,
				valueSetHeight: true,
				height: 200,
				fillAnchor: "BottomCenter",
				animationSpeed: 1,
			  }
			},

			// define paragraphs
			Paragraph: 
			{
			  // default paragraph
			  default: 
			  {
				font: fontName,
				fontSize: 12 * fontsScale,
				fillColor: PintarJS.Color.white(),
				strokeColor: PintarJS.Color.black(),
				strokeWidth: 6,
				useStyleCommands: true,
				margin: new PintarJS.UI.SidesProperties(10, 8, 10, 8),
			  },

			  // paragraph for buttons
			  buttons: 
			  {
				font: fontName,
				fontSize: 16 * fontsScale,
				fillColor: PintarJS.Color.white(),
				strokeColor: PintarJS.Color.black(),
				strokeWidth: 6,
				useStyleCommands: true,
				margin: new PintarJS.UI.SidesProperties(10, 8, 10, 8),
			  },

			  // paragraph for buttons hover
			  buttonsHover: 
			  {
				font: fontName,
				fontSize: 16 * fontsScale,
				fillColor: PintarJS.Color.white(),
				strokeColor: PintarJS.Color.fromHex("#d27d2c"),
				strokeWidth: 6,
				useStyleCommands: true,
				margin: new PintarJS.UI.SidesProperties(10, 8, 10, 8),
			  },

			  // paragraph for buttons down
			  buttonsDown: 
			  {
				font: fontName,
				fontSize: 16 * fontsScale,
				fillColor: new PintarJS.Color(0.9, 0.9, 0.9, 1),
				strokeColor: PintarJS.Color.black(),
				strokeWidth: 6,
				useStyleCommands: true,
				margin: new PintarJS.UI.SidesProperties(10, 8, 10, 8),
			  },

			  // headers
			  header: 
			  {
				font: fontName,
				fontSize: 18 * fontsScale,
				fillColor: PintarJS.Color.yellow(),
				strokeColor: PintarJS.Color.black(),
				strokeWidth: 8,
				useStyleCommands: false,
				margin: new PintarJS.UI.SidesProperties(8, 8, 12, 0),
			  },

			  // small paragraph
			  small: 
			  {
				font: fontName,
				fontSize: 9,
				fillColor: new PintarJS.Color(0.8, 0.8, 0.8, 1),
				strokeColor: PintarJS.Color.black(),
				strokeWidth: 5,
				useStyleCommands: true,
				margin: new PintarJS.UI.SidesProperties(10, 8, 10, 8),
			  },
			},

			// Button
			Button: 
			{
			  // default button
			  default: 
			  {
				texture: uiTexture,
				externalSourceRect: new PintarJS.Rectangle(64, 16, 32, 16),
				internalSourceRect: new PintarJS.Rectangle(64 + 5, 16 + 5, 32 - 10, 16 - 10),
				mouseDownExternalSourceRect: new PintarJS.Rectangle(64, 32, 32, 16),
				mouseDownInternalSourceRect: new PintarJS.Rectangle(64 + 5, 32 + 5, 32 - 10, 16 - 10),
				mouseHoverExternalSourceRect: new PintarJS.Rectangle(64, 48, 32, 16),
				mouseHoverInternalSourceRect: new PintarJS.Rectangle(64 + 5, 48 + 5, 32 - 10, 16 - 10),
				paragraphSkin: "buttons",
				mouseHoverParagraphSkin: "buttonsHover",
				mouseDownParagraphSkin: "buttonsDown",
				textureScale: textureScale,   
			  },

			  // toggle button
			  toggle: 
			  {
				extends: 'default',
				toggleMode: true,
			  },

			  // a button that is just text
			  textOnly: 
			  {
				texture: uiTexture,
				paragraphSkin: "buttons",
				mouseHoverParagraphSkin: "buttonsHover",
				mouseDownParagraphSkin: "buttonsDown",
				textureScale: textureScale,
				heightInPixels: 60,
			  }
			}
	  };
	return UI_THEME;
}