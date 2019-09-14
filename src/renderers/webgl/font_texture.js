/**
 * file: webgl.js
 * description: Implement webgl renderer.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";
const Point = require('../../point');
const Rectangle = require('../../rectangle');
const PintarConsole = require('./../../console');

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

        // default chars set
        if (!charsSet) {
            charsSet = "";
            for (var i = 0; i <= 255; ++i) {
                charsSet += String.fromCharCode(i);
            }
        }

        // make sure charSet got the placeholder char
        if (charsSet.indexOf(missingCharPlaceholder) === -1) {
            charsSet += missingCharPlaceholder;
        }

        // calc estimated size of a single character in texture
        var estimatedCharSizeInTexture = new Point(Math.round(fontSize * 1.35), Math.round(fontSize * 1.35));

        // calc texture size
        var charsPerRow = Math.floor(maxTextureWidth / estimatedCharSizeInTexture.x);
        var textureWidth = Math.min(charsSet.length * estimatedCharSizeInTexture.x, maxTextureWidth);
        var textureHeight = Math.ceil(charsSet.length / charsPerRow) * estimatedCharSizeInTexture.y;

        // a dictionary to store the source rect of every character
        this._sourceRects = {};

        // create a canvas to generate the texture on
        var canvas = document.createElement('canvas');
        canvas.width = textureWidth;
        canvas.height = textureHeight;
        var ctx = canvas.getContext('2d');

        // set font and white color
        ctx.font = (fontSize || 30).toString() + 'px ' + (fontName || 'Ariel');
        ctx.fillStyle = '#ffffffff';

        PintarConsole.debug("Generate Font Texture:", ctx.font, "Chars set: ", charsSet, " Texture size: ", textureWidth, textureHeight);

        // draw the font texture
        var x = 0; var y = 0;
        for (var i = 0; i < charsSet.length; ++i) {
            
            // get actual width of current character
            var currChar = charsSet[i];
            var currCharWidth = ctx.measureText(currChar.text).width;

            // check if need to break line down in texture
            if (x + currCharWidth > textureWidth) {
                y += estimatedCharSizeInTexture.y;
                x = 0;
            }

            // calc source rect
            var sourceRect = new Rectangle(x, y, currCharWidth, estimatedCharSizeInTexture.y);
            this._sourceRects[currChar] = sourceRect;

            // draw character
            ctx.fillText(currChar, x, y + fontSize);

            // move to next spot in texture
            x += currCharWidth;
        }

        // convert canvas to texture
        var img = new Image();
        img.src = canvas.toDataURL("image/png");
        this._texture = new Texture(img, onReady);
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

// export the font texture class
module.exports = FontTexture;