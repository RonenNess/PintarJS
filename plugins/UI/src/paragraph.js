/**
 * file: paragraph.js
 * description: Implement a paragraph element.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";
const UIElement = require('./ui_element');
const PintarJS = require('./pintar');
const SizeModes = require('./size_modes');


/**
 * Implement a paragraph element.
 */
class Paragraph extends UIElement
{
    /**
     * Create a paragraph element.
     * @param {Object} theme
     * @param {String} theme.Paragraph[skin].font (Optional) Font to use.
     * @param {Number} theme.Paragraph[skin].fontSize (Optional) Font size to use.
     * @param {PintarJS.Color} theme.Paragraph[skin].fillColor (Optional) Text fill color.
     * @param {PintarJS.Color} theme.Paragraph[skin].strokeColor (Optional) Text stroke color.
     * @param {Number} theme.Paragraph[skin].strokeWidth (Optional) Text stroke width.
     * @param {PintarJS.TextAlignment} theme.Paragraph[skin].alignment (Optional) Text alignment.
     * @param {Boolean} theme.Paragraph[skin].useStyleCommands (Optional) Should we enable style commands?
     *  
     */
    constructor(theme, skin, override)
    {
        super();

        // get options from theme and skin type
        var options = this.getOptionsFromTheme(theme, skin, override);
        this.setBaseOptions(options);
        
        // by default paragraphs take full width
        this.size.x = 100;
        this.size.xMode = SizeModes.Percents;

        // limit paragraph text to element width
        this.enableLineBreaking = true;

        // create text
        this.textSprite = new PintarJS.TextSprite("");
        this.textSprite.useStyleCommands = Boolean(options.useStyleCommands);
        if (options.font !== undefined) { this.textSprite.font = options.font; }
        if (options.fontSize !== undefined) { this.textSprite.fontSize = options.fontSize; }
        if (options.alignment !== undefined) { this.textSprite.alignment = options.alignment; }
        if (options.fillColor !== undefined) { this.textSprite.color = options.fillColor; }
        if (options.strokeColor !== undefined) { this.textSprite.strokeColor = options.strokeColor; }
        if (options.strokeWidth !== undefined) { this.textSprite.strokeWidth = options.strokeWidth; }

        // if true, set element height automatically from text
        this.autoSetHeight = true;
    }

    /**
     * Get text.
     */
    get text()
    {
        return this.textSprite.text;
    }

    /**
     * Set text.
     */
    set text(text)
    {
        this.textSprite.text = text;
    }

    /**
     * Get required options for this element type.
     */
    get requiredOptions()
    {
        return [];
    }

    /**
     * Draw the UI element.
     */
    draw(pintar)
    {
        // set position
        var destRect = this.getBoundingBox();
        var position = destRect.getPosition();
        position.y += this.textSprite.fontSize;
        this.textSprite.position = position;

        // set max width
        this.textSprite.maxWidth = this.enableLineBreaking ? destRect.width : 0;

        // draw text
        pintar.drawText(this.textSprite);

        // set auto height
        if (this.autoSetHeight) 
        {
            this.size.yMode = SizeModes.Pixels;
            this.size.y = this.textSprite.calculatedHeight;
        }
    }
}

module.exports = Paragraph; 