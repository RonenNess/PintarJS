/**
 * file: text_sprite.js
 * description: A drawable text sprite.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";
const Renderable = require('./renderable');
const Point = require('./point');
const Color = require('./color');
const BlendModes = require('./blend_modes');


/**
 * A drawable text instance.
 */
class TextSprite extends Renderable
{
    /**
     * Create the text sprite.
     * @param {String} text Text to draw.
     * @param {PintarJS.Point} position Text position.
     * @param {*} options Additional params.
     */
    constructor(text, position, options)
    {
        options = options || {};
        super(position || Point.zero(), options.color || TextSprite.defaults.color, options.blendMode || TextSprite.defaults.blendMode);
        this.text = text;
        this.font = options.font || TextSprite.defaults.font;
        this.fontSize = options.fontSize || TextSprite.defaults.fontSize;
        this.alignment = options.alignment || TextSprite.defaults.alignment;
        this.strokeWidth = options.strokeWidth || TextSprite.defaults.strokeWidth;
        this.maxWidth = null;
        this.strokeColor = (options.strokeColor || TextSprite.defaults.strokeColor).clone();
    }

    /**
     * Set text.
     */
    set text(val)
    {
        this._text = val;
        this._textLines = val.split('\n');
    }

    /**
     * Get text.
     */
    get text()
    {
        return this._text;
    }

    /**
     * Get font size and type as string.
     */
    get fontPropertyAsString()
    {
        if (!this._fontString) {
            this._fontString = Math.ceil(this.fontSize) + "px " + this.font;
        }
        return this._fontString;
    }

    /**
     * Set font.
     */
    set font(val)
    {
        this._font = val;
        this._fontString = null;
    }

    /**
     * Get font.
     */
    get font()
    {
        return this._font;
    }

    /**
     * Set font size.
     */
    set fontSize(val)
    {
        this._fontSize = val;
        this._fontString = null;
    }

    /**
     * Get font.
     */
    get fontSize()
    {
        return this._fontSize;
    }

    /**
     * Set text line height. If not set or null, will use font size.
     */
    set lineHeight(val)
    {
        this._lineHeight = val;
    }

    get lineHeight()
    {
        return this._lineHeight || (this.fontSize + 1);
    }

    /**
     * Get text as an array of lines.
     */
    get textLines()
    {
        return this._textLines;
    }
 
    /**
     * Return a clone of this text sprite.
     */
    clone()
    {
        var ret = new TextSprite(this.text);
        ret._lineHeight = this._lineHeight;
        ret.position = this.position.clone();
        ret.font = this.font;
        ret.fontSize = this.fontSize;
        ret.color = this.color.clone();
        ret.alignment = this.alignment;
        ret.strokeWidth = this.strokeWidth;
        ret.maxWidth = this.maxWidth;
        ret.strokeColor = this.strokeColor.clone();
        return ret;
    }
}

/**
 * Alignment types enums.
 */
TextSprite._Alignments = {
    Left: "left",
    Right: "right",
    Center: "center",
}

// default values
TextSprite.defaults = {
    font: "Arial",                              // default font to use when drawing text
    fontSize: 30,                               // default font size
    color: Color.black(),                       // default text color
    alignment: TextSprite._Alignments.Left,     // default text alignment
    strokeWidth: 0,                             // default text stroke width
    strokeColor: Color.transparent(),           // default text stroke color
    blendMode: BlendModes.AlphaBlend,           // default blending mode
};

// export TextSprite
module.exports = TextSprite;