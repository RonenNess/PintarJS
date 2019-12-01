/**
 * file: vertical_line.js
 * description: Implement a vertical line element.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";
const UIElement = require('./ui_element');
const PintarJS = require('../pintar');
const SizeModes = require('../size_modes');


/**
 * Implement a vertical line element.
 */
class VerticalLine extends UIElement
{
    /**
     * Create a horizontal line element.
     * @param {Object} theme
     * @param {PintarJS.Texture} theme.VerticalLine[skin].texture Texture to use.
     * @param {PintarJS.Rectangle} theme.VerticalLine[skin].middleSourceRect The source rect of the line center part (repeating).
     * @param {PintarJS.Rectangle} theme.VerticalLine[skin].topEdgeSourceRect The source rect of the line top edge.
     * @param {PintarJS.Rectangle} theme.VerticalLine[skin].bottomEdgeSourceRect The source rect of the line bottom edge.
     * @param {Number} theme.VerticalLine[skin].textureScale (Optional) Texture scale for horizontal line. 
     */
    constructor(theme, skin, override)
    {
        super();

        // get options from theme and skin type
        var options = this.getOptionsFromTheme(theme, skin, override);
        this.setBaseOptions(options);

        // get texture scale
        var textureScale = (options.textureScale || 1);

        // set default width
        this.size.x = options.middleSourceRect.width * textureScale;
        this.size.xMode = SizeModes.Pixels;

        // set default height
        this.size.y = options.middleSourceRect.height * textureScale * 2;
        this.size.yMode = SizeModes.Pixels;

        // create top edge
        var topSideSourceRect = options.topEdgeSourceRect;
        if (topSideSourceRect)
        {
            this._topEdgeSprite = new PintarJS.Sprite(options.texture);
            this._topEdgeSprite.sourceRectangle = topSideSourceRect;
            this._topEdgeSprite.size.set(topSideSourceRect.width * textureScale, topSideSourceRect.height * textureScale);
        }
        // create bottom edge
        var bottomSideSourceRect = options.bottomEdgeSourceRect;
        if (bottomSideSourceRect)
        {
            this._bottomEdgeSprite = new PintarJS.Sprite(options.texture);
            this._bottomEdgeSprite.sourceRectangle = bottomSideSourceRect;
            this._bottomEdgeSprite.size.set(bottomSideSourceRect.width * textureScale, bottomSideSourceRect.height * textureScale);
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

        // height left to draw for center part
        var heightLeft = destRect.height;
        var offsetY = 0;

        // draw top edge
        if (this._topEdgeSprite)
        {
            this._topEdgeSprite.position.set(destRect.x, destRect.y);
            pintar.drawSprite(this._topEdgeSprite);
            heightLeft -= this._topEdgeSprite.size.y;
            offsetY += this._topEdgeSprite.size.y;
        }
        // draw bottom edge
        if (this._bottomEdgeSprite)
        {
            this._bottomEdgeSprite.position.set(destRect.x, destRect.bottom - this._bottomEdgeSprite.height);
            pintar.drawSprite(this._bottomEdgeSprite);
            heightLeft -= this._bottomEdgeSprite.size.y;
        }

        // draw center parts
        if (this._middleSprite)
        {
            // reset middle part properties
            this._middleSprite.sourceRectangle = this._middleSourceRect.clone();
            this._middleSprite.size.set(this._middleSourceRect.width * this._textureScale, this._middleSourceRect.height * this._textureScale);

            // draw middle parts
            while (heightLeft > 0)
            {
                this._middleSprite.position.set(destRect.x, destRect.y + offsetY);
                if (this._middleSprite.size.y > heightLeft)
                {
                    var toCut = this._middleSprite.size.y - heightLeft;
                    this._middleSprite.size.y -= toCut;
                    this._middleSprite.sourceRectangle.height -= toCut / this._textureScale;
                }
                pintar.drawSprite(this._middleSprite);
                heightLeft -= this._middleSprite.size.y;
                offsetY += this._middleSprite.size.y;
            }
        }
    }
}

module.exports = VerticalLine; 