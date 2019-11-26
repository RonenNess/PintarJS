/**
 * file: horizontal_line.js
 * description: Implement a horizontal line element.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";
const UIElement = require('./ui_element');
const PintarJS = require('./pintar');
const SizeModes = require('./size_modes');


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
     * @param {PintarJS.Rectangle} theme.HorizontalLine[skin].leftEdgeSourceRect The source rect of the line left side edge.
     * @param {PintarJS.Rectangle} theme.HorizontalLine[skin].rightEdgeSourceRect The source rect of the line right side edge.
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
        var leftSideSourceRect = options.leftEdgeSourceRect;
        if (leftSideSourceRect)
        {
            this.leftEdgeSprite = new PintarJS.Sprite(options.texture);
            this.leftEdgeSprite.sourceRectangle = leftSideSourceRect;
            this.leftEdgeSprite.size.set(leftSideSourceRect.width * textureScale, leftSideSourceRect.height * textureScale);
        }
        // create right-side edge
        var rightSideSourceRect = options.rightEdgeSourceRect;
        if (rightSideSourceRect)
        {
            this.rightEdgeSprite = new PintarJS.Sprite(options.texture);
            this.rightEdgeSprite.sourceRectangle = rightSideSourceRect;
            this.rightEdgeSprite.size.set(rightSideSourceRect.width * textureScale, rightSideSourceRect.height * textureScale);
        }
        // create center part
        this.middleSprite = new PintarJS.Sprite(options.texture);
        this.middleSprite.sourceRectangle = options.middleSourceRect;
        this.middleSprite.size.set(options.middleSourceRect.width * textureScale, options.middleSourceRect.height * textureScale);
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

        // draw left edge
        if (this.leftEdgeSprite)
        {
            this.leftEdgeSprite.position.set(destRect.x, destRect.y);
            pintar.drawSprite(this.leftEdgeSprite);
        }
        // draw right edge
        if (this.rightEdgeSprite)
        {
            this.rightEdgeSprite.position.set(destRect.right - this.rightEdgeSprite.width, destRect.y);
            pintar.drawSprite(this.rightEdgeSprite);
        }
    }
}

module.exports = HorizontalLine; 