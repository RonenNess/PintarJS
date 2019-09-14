/**
 * file: webgl.js
 * description: Implement webgl renderer.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";
const Point = require('../../point');
const Rectangle = require('../../rectangle');
const Texture = require('./../../texture');
const PintarConsole = require('./../../console');


// default ascii characters to generate font textures
const defaultAsciiChars = " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_`abcdefghijklmnopqrstuvwxyz{|}~ ¡¢£¤¥¦§¨©ª«¬­®¯°±²³´µ¶·¸¹º»¼½¾";

// return the closest power-of-two value to a given number
function makePowerTwo(val)
{
    var ret = 2;
    while (ret < val) {
        ret = ret * 2;
        if (ret >= val) { return ret; }
    }
    return ret;
}

/**
 * Class to convert a font and a set of characters into a texture, so it can be later rendered as sprites.
 * This technique is often known as "bitmap font rendering".
 */
class FontTexture
{ 
    /**
     * Create the font texture.
     * @param {String} fontName Font name to create texture for (default to 'Ariel').
     * @param {Number} fontSize Font size to use when creating texture (default to 30). Bigger size = better text quality, but more memory consumption.
     * @param {String} charsSet String with all the characters to generate (default to whole ASCII range). If you try to render a character that's not in this string, it will draw 'missingCharPlaceholder' instead.
     * @param {Number} maxTextureWidth Max texture width (default to 2048). 
     * @param {Char} missingCharPlaceholder Character to use when trying to render a missing character (defaults to '?').
     */
    constructor(fontName, fontSize, charsSet, maxTextureWidth, missingCharPlaceholder) 
    {
        // set default missing char placeholder + store it
        missingCharPlaceholder = (missingCharPlaceholder || '?')[0];
        this._placeholderChar = missingCharPlaceholder;

        // default max texture size
        maxTextureWidth = maxTextureWidth || 2048;

        // default chars set
        charsSet = charsSet || defaultAsciiChars;

        // make sure charSet got the placeholder char
        if (charsSet.indexOf(missingCharPlaceholder) === -1) {
            charsSet += missingCharPlaceholder;
        }

        // calc estimated size of a single character in texture
        var estimatedCharSizeInTexture = new Point(Math.round(fontSize * 1.15), Math.round(fontSize * 1.25));

        // calc texture size
        var charsPerRow = Math.floor(maxTextureWidth / estimatedCharSizeInTexture.x);
        var textureWidth = Math.min(charsSet.length * estimatedCharSizeInTexture.x, maxTextureWidth);
        var textureHeight = Math.ceil(charsSet.length / charsPerRow) * estimatedCharSizeInTexture.y;

        // make width and height powers of two
        if (FontTexture.enforceValidTexureSize) {
            textureWidth = makePowerTwo(textureWidth);
            textureHeight = makePowerTwo(textureHeight);
        }

        // a dictionary to store the source rect of every character
        this._sourceRects = {};

        // create a canvas to generate the texture on
        var canvas = document.createElement('canvas');
        canvas.width = textureWidth;
        canvas.height = textureHeight;
        var ctx = canvas.getContext('2d');

        // store font size
        this.fontSize = fontSize || 30;

        // set font and white color
        ctx.font = this.fontSize.toString() + 'px ' + (fontName || 'Ariel');
        ctx.fillStyle = '#ffffffff';

        PintarConsole.debug("Generate Font Texture:", ctx.font, "Chars set: ", charsSet, " Texture size: ", textureWidth, textureHeight);

        // draw the font texture
        var x = 0; var y = 0;
        for (var i = 0; i < charsSet.length; ++i) {
            
            // get actual width of current character
            var currChar = charsSet[i];
            var currCharWidth = ctx.measureText(currChar).width;

            // check if need to break line down in texture
            if (x + currCharWidth > textureWidth) {
                y += estimatedCharSizeInTexture.y + 6;
                x = 0;
            }

            // calc source rect
            var sourceRect = new Rectangle(x, y, currCharWidth, estimatedCharSizeInTexture.y);
            this._sourceRects[currChar] = sourceRect;

            // draw character
            ctx.fillText(currChar, x, y + fontSize);

            // move to next spot in texture
            x += currCharWidth + 6;
        }

        // convert canvas to texture
        var img = new Image();
        img.src = canvas.toDataURL("image/png");
        this._texture = new Texture(img, null);
    }

    /**
     * Get texture instance of this font texture.
     */
    get texture()
    {
        return this._texture;
    }

    /**
     * Get the source rect of a character.
     */
    getSourceRect(char)
    {
        return this._sourceRects[char] || this._sourceRects[this._placeholderChar];
    }
}

// should we enforce power of 2?
FontTexture.enforceValidTexureSize = true;

// export the font texture class
module.exports = FontTexture;