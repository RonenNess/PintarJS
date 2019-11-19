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
        // set basics
        options = options || {};
        super(position || Point.zero(), options.color || TextSprite.defaults.color, options.blendMode || TextSprite.defaults.blendMode);
        this._version = 0;
        this.text = text;
        this.font = options.font || TextSprite.defaults.font;
        this.fontSize = options.fontSize || TextSprite.defaults.fontSize;
        this.alignment = options.alignment || TextSprite.defaults.alignment;
        this.strokeWidth = options.strokeWidth || TextSprite.defaults.strokeWidth;
        this.maxWidth = null;
        this.strokeColor = (options.strokeColor || TextSprite.defaults.strokeColor).clone();
        this.useStyleCommands = TextSprite.defaults.useStyleCommands;

        // reset version after init
        this._version = 0;
    }

    /**
     * Get hash code of text
     */
    getHashCode() 
    {
        var text = this.text;
        var hash = 0, i, chr;
        if (text.length === 0) return hash;
        for (i = 0; i < text.length; i++) {
            chr   = text.charCodeAt(i);
            hash  = ((hash << 5) - hash) + chr;
            hash |= 0;
        }
        return hash;
    };
    
    /**
     * Get unique id representing this text sprite and all its properties.
     */
    getUniqueId()
    {
        // take id from cache
        if (this._uniqueId && (this._lastUniqueIdVersion == this._version)) {
            return this._uniqueId;
        }

        // if got here it means we need to generate a new id
        this._uniqueId = this.getHashCode().toString() + this.fontPropertyAsString + this.alignment + this.strokeWidth + this.color.asHex() + this.strokeColor.asHex() + this.maxWidth;
        this._lastUniqueIdVersion = this._version;
        return this._uniqueId;
    }

    /**
     * Set alignment.
     */
    set alignment(val)
    {
        this._alignment = val;
        this._version++;
    }

    /**
     * Get alignment.
     */
    get alignment()
    {
        return this._alignment;
    }

    /**
     * Set stroke color.
     */
    set strokeColor(val)
    {
        this._strokeColor = val;
        this._version++;
    }

    /**
     * Get stroke color.
     */
    get strokeColor()
    {
        return this._strokeColor;
    }

    /**
     * Set max line width.
     */
    set maxWidth(val)
    {
        this._maxWidth = val;
        this._version++;
    }

    /**
     * Get max line width.
     */
    get maxWidth()
    {
        return this._maxWidth;
    }

    /**
     * Set stroke width.
     */
    set strokeWidth(val)
    {
        this._strokeWidth = val;
        this._version++;
    }

    /**
     * Get stroke width.
     */
    get strokeWidth()
    {
        return this._strokeWidth;
    }

    /**
     * Set text.
     */
    set text(val)
    {
        this._text = val;
        this._textLines = val.split('\n');
        this._version++;
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
        this._version++;
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
        this._version++;
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
        this._version++;
    }

    /**
     * Get text line height.
     */
    get lineHeight()
    {
        return this._lineHeight || (Math.ceil(this.fontSize) + 1);
    }

    /**
     * Get text as an array of lines.
     */
    get textLines()
    {
        return this._textLines;
    }

    /**
     * Get all text without any style commands in it.
     */
    getTextWithoutStyleCommands()
    {
        var ret = "";
        var parts = this.text.split("{{");
        for (var i = 0; i < parts.length; ++i) 
        {
            var currPart = parts[i];
            var currPartOrigin = i === 0 ? currPart : "{{" + currPart;
            var startPart = currPart.substr(0, 3);
            if (startPart !== "fc:" && startPart !== "sc:" && startPart !== "sw:") {
                ret += currPartOrigin;
                continue;
            }

            var closing = currPart.indexOf("}}");
            ret += closing === -1 ? (currPartOrigin) : (currPart.substr(closing + 2));
        }
        return ret;
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
    font: "Arial",                              // default font to use when drawing text.
    fontSize: 30,                               // default font size.
    color: Color.black(),                       // default text color.
    alignment: TextSprite._Alignments.Left,     // default text alignment.
    strokeWidth: 0,                             // default text stroke width.
    strokeColor: Color.transparent(),           // default text stroke color.
    blendMode: BlendModes.AlphaBlend,           // default blending mode.
    useStyleCommands: false,                    // default if sprite texts should use style commands.
};

// export TextSprite
module.exports = TextSprite;