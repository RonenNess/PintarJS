/**
 * file: horizontal_line.js
 * description: Implement a horizontal line element.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";
const UIElement = require('./ui_element');
const PintarJS = require('../pintar');
const SizeModes = require('../size_modes');


/**
 * Implement a horizontal line element.
 */
class HorizontalLine extends UIElement
{
    /**
     * Create a horizontal line element.
     * @param {Object} theme
     * @param {PintarJS.Texture} theme.HorizontalLine[skin].texture Texture to use.
     * @param {PintarJS.Rectangle} theme.HorizontalLine[skin].middleSourceRect The source rect of the line center part (repeating).
     * @param {PintarJS.Rectangle} theme.HorizontalLine[skin].startEdgeSourceRect The source rect of the line left side edge.
     * @param {PintarJS.Rectangle} theme.HorizontalLine[skin].endEdgeSourceRect The source rect of the line right side edge.
     * @param {Number} theme.HorizontalLine[skin].textureScale (Optional) Texture scale for horizontal line. 
     */
    constructor(theme, skin, override)
    {
        super();

        // get options from theme and skin type
        var options = this.getOptionsFromTheme(theme, skin, override);
        this.setBaseOptions(options);
        
        // by default horizontal lines take full width
        this.size.x = 100;
        this.size.xMode = SizeModes.Percents;

        // get texture scale
        var textureScale = (options.textureScale || 1);

        // set height
        this.size.y = options.middleSourceRect.height * textureScale;
        this.size.yMode = SizeModes.Pixels;

        // create left-side edge
        var leftSideSourceRect = options.startEdgeSourceRect;
        if (leftSideSourceRect)
        {
            this._leftEdgeSprite = new PintarJS.Sprite(options.texture);
            this._leftEdgeSprite.sourceRectangle = leftSideSourceRect;
            this._leftEdgeSprite.size.set(leftSideSourceRect.width * textureScale, leftSideSourceRect.height * textureScale);
        }
        // create right-side edge
        var rightSideSourceRect = options.endEdgeSourceRect;
        if (rightSideSourceRect)
        {
            this._rightEdgeSprite = new PintarJS.Sprite(options.texture);
            this._rightEdgeSprite.sourceRectangle = rightSideSourceRect;
            this._rightEdgeSprite.size.set(rightSideSourceRect.width * textureScale, rightSideSourceRect.height * textureScale);
        }
        // create center part
        this._middleSprite = new PintarJS.Sprite(options.texture);
        this._textureScale = options.textureScale;
        this._middleSourceRect = options.middleSourceRect;
    }

    /**
     * Get required options for this element type.
     */
    get requiredOptions()
    {
        return ["texture", "middleSourceRect"];
    }

    /**
     * Draw the UI element.
     */
    draw(pintar)
    {
        // get dest rect
        var destRect = this.getBoundingBox();

        // width left to draw for center part
        var widthLeft = destRect.width;
        var offsetX = 0;

        // draw left edge
        if (this._leftEdgeSprite)
        {
            this._leftEdgeSprite.position.set(destRect.x, destRect.y);
            pintar.drawSprite(this._leftEdgeSprite);
            widthLeft -= this._leftEdgeSprite.size.x;
            offsetX += this._leftEdgeSprite.size.x;
        }
        // draw right edge
        if (this._rightEdgeSprite)
        {
            this._rightEdgeSprite.position.set(destRect.right - this._rightEdgeSprite.width, destRect.y);
            pintar.drawSprite(this._rightEdgeSprite);
            widthLeft -= this._rightEdgeSprite.size.x;
        }

        // draw center parts
        if (this._middleSprite)
        {
            // reset middle part properties
            this._middleSprite.sourceRectangle = this._middleSourceRect.clone();
            this._middleSprite.size.set(this._middleSourceRect.width * this._textureScale, this._middleSourceRect.height * this._textureScale);

            // draw middle parts
            while (widthLeft > 0)
            {
                this._middleSprite.position.set(destRect.x + offsetX, destRect.y);
                if (this._middleSprite.size.x > widthLeft)
                {
                    var toCut = this._middleSprite.size.x - widthLeft;
                    this._middleSprite.size.x -= toCut;
                    this._middleSprite.sourceRectangle.width -= toCut / this._textureScale;
                }
                pintar.drawSprite(this._middleSprite);
                widthLeft -= this._middleSprite.size.x;
                offsetX += this._middleSprite.size.x;
            }
        }
    }
}

module.exports = HorizontalLine; 