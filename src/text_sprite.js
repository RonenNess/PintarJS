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
        super(
            position || Point.zero(), 
            options.color || TextSprite.defaults.color, 
            options.blendMode !== undefined ? options.blendMode : TextSprite.defaults.blendMode);
        this._version = 0;
        this.text = text;
        this.font = this.__getFromOptions(options, 'font', TextSprite.defaults.font);
        this.fontSize = this.__getFromOptions(options, 'fontSize', TextSprite.defaults.fontSize);
        this.alignment = this.__getFromOptions(options, 'alignment', TextSprite.defaults.alignment);
        this.strokeWidth = this.__getFromOptions(options, 'strokeWidth', TextSprite.defaults.strokeWidth);
        this.strokeColor = this.__getFromOptions(options, 'strokeColor', TextSprite.defaults.strokeColor);
        this.useStyleCommands = TextSprite.defaults.useStyleCommands;
        this.extraLineHeight = TextSprite.defaults.extraLineHeight;
        this.tracking = TextSprite.defaults.tracking;
        this.sourceFontSize = options.sourceFontSize || 0;
        this.maxWidth = null;
        
        // optional offset to add on Y axis based on actual line height
        this.lineHeightOffsetFactor = TextSprite.defaults.lineHeightOffsetFactor;

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
     * Get extra line height.
     */
    get extraLineHeight()
    {
        return this._extraLineHeight;
    }

    /**
     * Set extra line height.
     */
    set extraLineHeight(value)
    {
        if (this._extraLineHeight !== value) {
            this._extraLineHeight = value;
            this._cachedLinesAndCommands = null;
        }
    }
    
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
        if (this._alignment !== val) {
            this._alignment = val;
            this._version++;
        }
    }

    /**
     * Get alignment.
     */
    get alignment()
    {
        return this._alignment;
    }

    /**
     * Set if to use style commands.
     */
    set useStyleCommands(val)
    {
        if (this._useStyleCommands !== val) {
            this._useStyleCommands = val;
            this._cachedLinesAndCommands = null;
        }
    }

    /**
     * Get if using style commands.
     */
    get useStyleCommands()
    {
        return this._useStyleCommands;
    }

    /**
     * Set stroke color.
     */
    set strokeColor(val)
    {
        if (this._strokeColor !== val) {
            this._strokeColor = val;
            this._version++;
        }
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
        if (this._maxWidth !== val) {
            this._maxWidth = val;
            this._resetCachedValues();
        }
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
        if (this._strokeWidth !== val) {
            this._strokeWidth = val;
            this._resetCachedValues();
        }
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
        if (this._text !== val) {
            this._text = val;
            this._resetCachedValues();
        }
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
        if (this._font !== val) {
            this._font = val;
            this._resetCachedValues(true);
        }
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
        if (this._fontSize !== val) {
            this._fontSize = val;
            this._resetCachedValues(true);
        }
    }

    /**
     * Reset internally cached stuff.
     */
    _resetCachedValues(includeFontString)
    {
        if (includeFontString) this._fontString = null;
        this._cachedLinesAndCommands = null;
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
     * Get if this text sprite requires accurate font size from source font texture.
     */
    get sourceFontSize()
    {
        return this._sourceFontSize;
    }

    /**
     * Set if this text sprite requires accurate font size from source font texture.
     */
    set sourceFontSize(value)
    {
        if (this._sourceFontSize !== value) {
            this._sourceFontSize = value;
            this._resetCachedValues(true);
        }
    }

    /**
     * Get the actual width, in pixels, of this text sprite.
     * Note: if need to calculate / update, this will call getProcessedTextAndCommands() internally.
     */
    get calculatedWidth()
    {
        if (!this._cachedLinesAndCommands) { this.getProcessedTextAndCommands(); }
        return this._calculatedWidth || 0;
    }

    /**
     * Get the actual height, in pixels, of a single line in this text sprite.
     * Note: if need to calculate / update, this will call getProcessedTextAndCommands() internally.
     */
    get calculatedLineHeight()
    {
        if (!this._cachedLinesAndCommands) { this.getProcessedTextAndCommands(); }
        return this._calculatedLineHeight || 0;
    }

    /**
     * Get the actual height, in pixels, of this text sprite.
     * Note: if need to calculate / update, this will call getProcessedTextAndCommands() internally.
     */
    get calculatedHeight()
    {
        if (!this._cachedLinesAndCommands) { this.getProcessedTextAndCommands(); }
        return this._calculatedHeight || 0;
    }

    /**
     * Get text as an array of lines after breaking them based on maxWidth + list of style commands.
     */
    getProcessedTextAndCommands()
    {
        // got cached? return it
        if (this._cachedLinesAndCommands) {
            return this._cachedLinesAndCommands;
        }

        // get the size, in pixels, of a specific character.
        var charsSizeCache = {};
        var getCharSize = (char) => 
        {
            // if in cache return it
            if (char in charsSizeCache) {
                return charsSizeCache[char];
            }

            // calc actual size
            var width = TextSprite.measureTextWidth(this.font, this.fontSize, char);
            var height = TextSprite.measureTextHeight(this.font, this.fontSize, char);
            var ret = {
                base: new Point(width, height), 
                absoluteDistance: new Point(width + this.tracking , height),
                width: width > 0 ? (width + this.tracking) : 0,
            };
            charsSizeCache[char] = ret;
            return ret;
        }

        // ret list + method to finish line
        var ret = [];
        var currLine = {styleCommands: {}, text: "", sizes: [], totalWidth: 0};
        var endLine = () => 
        {    
            // sanity
            if (currLine.sizes.length != currLine.text.length) {
                throw new Error("Internal error!");
            }

            // update width
            this._calculatedWidth = Math.max(this._calculatedWidth, currLine.totalWidth);

            // push line data
            ret.push(currLine);
            currLine = {styleCommands: {}, text: "", sizes: [], totalWidth: 0};

            // update height
            this._calculatedHeight += this._calculatedLineHeight;
        }

        // method to get value part of the command
        var getValuePart = (j) => 
        {
            var closingIndex = this._text.substr(j, 64).indexOf('}}');
            if (closingIndex === -1) { 
                throw new PintarConsole.Error("Invalid broken style command: '" + this._text.substr(j - 3, 10) + "'!");
            }
            return this._text.substring(j + 5, j + closingIndex);
        };

        // parse color value for style command
        var parseColor = (colorVal) => 
        {
            if (colorVal[0] === '#') {
                return Color.fromHex(colorVal);
            }
            return Color[colorVal]();
        }

        // current offset X, to add line breaks
        var strokeWidth = this.strokeWidth;

        // reset actual heights
        this._calculatedHeight = this._calculatedLineHeight = 0;

        // reset actual width
        this._calculatedWidth = 0;

        // parse lines and style commands
        for (var j = 0; j < this._text.length; ++j) 
        {
            // check if its a style command
            if (this.useStyleCommands) 
            {
                var styleCommandKey = currLine.text.length;
                while (this._text[j] == '{' && this._text[j + 1] == '{') 
                {
                    // create list for style commands
                    currLine.styleCommands[styleCommandKey] = currLine.styleCommands[styleCommandKey] || [];

                    // reset command
                    if (this._text.substr(j, "{{res}}".length) === "{{res}}") 
                    {
                        currLine.styleCommands[styleCommandKey].push({'type': 'reset'});
                        strokeWidth = this.strokeWidth;
                        j += "{{res}}".length;
                    }
                    else
                    {
                        // get command part
                        var command = this._text.substr(j, "{{xx:".length);

                        // get style value part and advance index
                        var styleVal = getValuePart(j);
                        j += styleVal.length + 2 + 5;

                        // is it front color?
                        if (command == "{{fc:") {
                            var val = parseColor(styleVal);
                            currLine.styleCommands[styleCommandKey].push({'type': 'fc', 'val': val});
                        }
                        // is it stroke color?
                        else if (command == "{{sc:") {
                            var val = parseColor(styleVal);
                            currLine.styleCommands[styleCommandKey].push({'type': 'sc', 'val': val});
                        }
                        // is it stroke color?
                        else if (command == "{{sw:") {
                            var val = parseInt(styleVal);
                            strokeWidth = val;
                            currLine.styleCommands[styleCommandKey].push({'type': 'sw', 'val': val});
                        }
                    } 
                }
            }

            // get current character and add to line
            var char = this._text[j];
            if (char === undefined) {
                continue;
            }

            // get current char width and add to sizes array
            var currCharSize = getCharSize(char, strokeWidth);

            // calculate line height
            if (!this._calculatedLineHeight) {
                this._calculatedLineHeight = currCharSize.absoluteDistance.y + this.extraLineHeight;
            }

            // check if need to break due to exceeding size
            if (this.maxWidth && currLine.totalWidth >= this.maxWidth - currCharSize.absoluteDistance.x) 
            {
                // break line, but store it first
                var prevLine = currLine;
                endLine();

                // if this character was not ideal for break, search for a better character
                if (!TextSprite.charForLineBreak(char))
                {
                    // try to find better index to break
                    var breakIndex = prevLine.text.length - 1;
                    while (breakIndex-- > 1 && !TextSprite.charForLineBreak(prevLine.text[breakIndex])) {}

                    // got a better place to break? migrate character to previous line
                    if (breakIndex > 1) {
                        breakIndex++; // <-- add +1 so it will break *after* the breaking character and not before it
                        for (var _x = breakIndex; _x < prevLine.text.length; ++_x)
                        {
                            var prevSize = prevLine.sizes[_x];
                            currLine.text += prevLine.text[_x];
                            currLine.totalWidth += prevSize.width;
                            prevLine.totalWidth -= prevSize.width;
                            currLine.sizes.push(prevSize);
                        }

                        // migrate style commands
                        for (var key in prevLine.styleCommands) {
                            if (parseInt(key) >= breakIndex) {
                                currLine.styleCommands[currLine.text.length] = prevLine.styleCommands[key];
                                delete prevLine.styleCommands[key];
                            }
                        }

                        // remove text from previous line
                        prevLine.text = prevLine.text.substr(0, breakIndex);
                    }
                }
                
                // if current char is space, no point adding it to start of line after we broke it
                if (char === ' ') { continue; }
            }

            // break line character?
            if (char == '\n') 
            {
                endLine();
            }
            // regular character, add to output line
            else 
            {
                currLine.sizes.push(currCharSize);
                currLine.text += char;
                currLine.totalWidth += currCharSize.width;
            }
        }

        // push last line
        if (currLine.text.length) { 
            endLine(); 
        }

        // store in cache and return
        this._cachedLinesAndCommands = ret;
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
        ret.extraLineHeight = this.extraLineHeight;
        ret.accurateFontSize = this.accurateFontSize;
        return ret;
    }
}

/**
 * Alignment types enums.
 */
TextSprite.Alignments = {
    Left: "left",
    Right: "right",
    Center: "center",
}

// default values
TextSprite.defaults = {
    font: "Arial",                              // default font to use when drawing text.
    fontSize: 30,                               // default font size.
    color: Color.black(),                       // default text color.
    alignment: TextSprite.Alignments.Left,      // default text alignment.
    strokeWidth: 0,                             // default text stroke width.
    strokeColor: Color.transparent(),           // default text stroke color.
    blendMode: BlendModes.AlphaBlend,           // default blending mode.
    useStyleCommands: false,                    // default if sprite texts should use style commands.
    lineHeightOffsetFactor: 0,                  // default offset based on line calculated height.
    tracking: 0,                                // default extra spacing between characters.
    extraLineHeight: 0,                         // default extra line height.
};

/**
 * Get all text without any style commands in it.
 */
TextSprite.getTextWithoutStyleCommands = function(text)
{
    var ret = "";
    var parts = text.split("{{");
    for (var i = 0; i < parts.length; ++i) 
    {
        var currPart = parts[i];
        var currPartOrigin = i === 0 ? currPart : "{{" + currPart;
        var startPart = currPart.substr(0, 3);
        if (startPart !== "fc:" && startPart !== "sc:" && startPart !== "sw:" && startPart !== "res") {
            ret += currPartOrigin;
            continue;
        }

        var closing = currPart.indexOf("}}");
        ret += closing === -1 ? (currPartOrigin) : (currPart.substr(closing + 2));
    }
    return ret;
}

/**
 * Measure font's actual height.
 */
TextSprite.measureTextHeight = function(fontFamily, fontSize, char) 
{
    var text = document.createElement('span');
    text.style.fontFamily = fontFamily;
    text.style.fontSize = fontSize + "px";
    text.style.paddingBottom = text.style.paddingLeft = text.style.paddingTop = text.style.paddingRight = '0px';
    text.style.marginBottom = text.style.marginLeft = text.style.marginTop = text.style.marginRight = '0px';
    text.textContent = char || "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ";
    document.body.appendChild(text);
    var result = text.getBoundingClientRect().height;
    document.body.removeChild(text);
    return Math.ceil(result);
};

/**
 * Measure font's actual width.
 */
TextSprite.measureTextWidth = function(fontFamily, fontSize, char) 
{
    // special case to ignore \r and \n when measuring text width
    if (char === '\n' || char === '\r') { return 0; }

    // measure character width
    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");
    context.font = fontSize.toString() + 'px ' + fontFamily;
    var result = 0;
    var text = char || "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ";
    for (var i = 0; i < text.length; ++i) {
        result = Math.max(result, context.measureText(text[i]).width);
    }
    return Math.ceil(result);
};

/**
 * Get if a given character is fitting for an unexpected line break.
 */
TextSprite.charForLineBreak = function(char)
{
    return ".,:;- \t-+=/\\*&^~".indexOf(char) !== -1;
}

// export TextSprite
module.exports = TextSprite;