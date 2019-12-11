/**
 * file: paragraph.js
 * description: Implement a paragraph element.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";
const UIElement = require('./ui_element');
const PintarJS = require('../pintar');
const SizeModes = require('../size_modes');


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

        // should we center this paragraph's text vertically?
        this.centerTextVertically = true;

        // create text
        this._textSprite = new PintarJS.TextSprite("");
        this._textSprite.useStyleCommands = Boolean(options.useStyleCommands);
        if (options.font !== undefined) { this._textSprite.font = options.font; }
        if (options.fontSize !== undefined) { this._textSprite.fontSize = options.fontSize; }
        if (options.alignment !== undefined) { this._textSprite.alignment = options.alignment; }
        if (options.fillColor !== undefined) { this._textSprite.color = options.fillColor; }
        if (options.strokeColor !== undefined) { this._textSprite.strokeColor = options.strokeColor; }
        if (options.strokeWidth !== undefined) { this._textSprite.strokeWidth = options.strokeWidth; }

        // if true, set element height automatically from text
        this.autoSetHeight = true;

        // if true, set element width automatically from text
        this.autoSetWidth = false;
    }

    /**
     * Get text.
     */
    get text()
    {
        return this._textSprite.text;
    }

    /**
     * Set text.
     */
    set text(text)
    {
        if (this._textSprite.text !== text) {
            this._textSprite.text = text;
        }
    }

    /**
     * Get text alignment.
     */
    get alignment()
    {
        return this._textSprite.alignment;
    }
    
    /**
     * Set text alignment.
     */
    set alignment(val)
    {
        this._textSprite.alignment = val;
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
    drawImp(pintar)
    {
        // set auto height
        if (this.autoSetHeight) 
        {
            this.size.yMode = SizeModes.Pixels;
            this.size.y = this._textSprite.calculatedHeight;
        }

        // set auto width
        if (this.autoSetWidth) 
        {
            this.size.xMode = SizeModes.Pixels;
            this.size.x = this._textSprite.calculatedWidth;
        }

        // get position and size
        var destRect = this.getBoundingBox();
        var position = destRect.getPosition();

        // adjust vertical position
        if (this.centerTextVertically) {
            this._textSprite.lineHeightOffsetFactor = 1 / 1.25;
        }
        else {
            this._textSprite.lineHeightOffsetFactor = 1 / 2;
        }

        // set text sprite position
        this._textSprite.position = position;

        // set max width
        this._textSprite.maxWidth = (this.enableLineBreaking && !this.autoSetWidth) ? destRect.width : 0;

        // adjust position for alignment
        if (this.alignment == "center") {
            this._textSprite.position.x += destRect.width / 2 + 1;
        }
        if (this.alignment == "right") {
            this._textSprite.position.x += destRect.width;
        }

        // draw text
        pintar.drawText(this._textSprite);
    }

    /**
     * Get this element value.
     */
    _getValue()
    {
        return this.text;
    }
}

module.exports = Paragraph; 