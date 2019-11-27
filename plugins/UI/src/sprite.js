/**
 * file: sprite.js
 * description: A UI sprite.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";
const PintarJS = require('./pintar');
const UIElement = require('./ui_element');


/**
 * A drawable sprite with UI properties.
 */
class Sprite extends UIElement
{
    /**
     * Create a sprite element.
     * @param {Object} options
     * @param {PintarJS.Texture} options.texture Texture to use.
     * @param {PintarJS.Rectangle} options.sourceRect The sprite source rect.
     * @param {Number} options.textureScale (Optional) texture scale.
     * @param {String} skin Element skin to use from theme.
     * @param {Object} override Optional override options (can override any of the theme properties listed above).
     */
    constructor(options, skin, override)
    {
        super();

        // if we got skin, we assume 'options' is actually a theme - used when other elements inherit from us, like in 'panel' case
        if (skin) 
        {
            options = this.getOptionsFromTheme(options, skin, override);
            this.setBaseOptions(options);
        }

        // extract params
        var texture = options.texture;
        var textureScale = options.textureScale || 1;
        var sourceRect = options.sourceRect;

        // make sure texture scale comes with source rect
        if (options.textureScale && !sourceRect) {
            throw new Error("When providing 'textureScale' option for UI Sprite you must also provide the sourceRect option!");
        }
        
        // create underlying sprite
        this.sprite = new PintarJS.Sprite(texture);
        if (sourceRect) { 
            this.sprite.sourceRectangle = sourceRect.clone(); 
            this.size.x = sourceRect.width * textureScale;
            this.size.y = sourceRect.height * textureScale;
        }
    }

    /**
     * Get required options for this element type.
     */
    get requiredOptions()
    {
        return ['texture'];
    }

    /**
     * Get sprite color.
     */
    get color()
    {
        return this.sprite.color;
    }

    /**
     * Set sprite color.
     */
    set color(val)
    {
        this.sprite.color = val;
    }

    /**
     * Draw the UI element.
     * @param {*} pintar Pintar instance to draw this element on.
     */
    draw(pintar)
    {
        // get drawing position and size and draw element
        var destRect = this.getBoundingBox();
        this.sprite.size.set(destRect.width, destRect.height);
        this.sprite.position.set(destRect.x, destRect.y);
        pintar.drawSprite(this.sprite);
    }
}


// export sprite
module.exports = Sprite;