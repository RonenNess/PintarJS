/**
 * file: sprite.js
 * description: A UI sprite.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";
const PintarJS = require('../pintar');
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
        var texture = this.__getFromOptions(options, 'texture');
        var textureScale = this.__getFromOptions(options, 'textureScale', 1);
        var sourceRect = this.__getFromOptions(options, 'sourceRect');

        // make sure texture scale comes with source rect
        if (options.textureScale && !sourceRect) {
            throw new Error("When providing 'textureScale' option for UI Sprite you must also provide the sourceRect option!");
        }
        
        // create underlying sprite
        this._sprite = new PintarJS.Sprite(texture);
        if (sourceRect) { 
            this._sprite.sourceRectangle = sourceRect; 
            this.size.x = sourceRect.width * textureScale;
            this.size.y = sourceRect.height * textureScale;
        }
    }

    /**
     * Set texture.
     */
    set texture(val)
    {
        this._sprite.texture = val;
    }

    /**
     * Get texture.
     */
    get texture()
    {
        return this._sprite.texture;
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
        return this._sprite.color;
    }

    /**
     * Set sprite color.
     */
    set color(val)
    {
        this._sprite.color = val;
    }

    /**
     * Get brightness factor.
     */
    get brightness()
    {
        return this._sprite.brightness;
    }

    /**
     * Set brightness factor.
     */
    set brightness(val)
    {
        this._sprite.brightness = val;
    }

    /**
     * Get source rectangle.
     */
    get sourceRectangle()
    {
        return this._sprite.sourceRectangle;
    }

    /**
     * Set source rectangle.
     */
    set sourceRectangle(val)
    {
        this._sprite.sourceRectangle = val;
    }

    /**
     * Draw the UI element.
     * @param {*} pintar Pintar instance to draw this element on.
     */
    drawImp(pintar, boundingBoxOverride)
    {
        // get drawing position and size and draw element
        var destRect = boundingBoxOverride || this.getBoundingBox();
        this._sprite.size.set(destRect.width, destRect.height);
        this._sprite.position.set(destRect.x, destRect.y);
        pintar.drawSprite(this._sprite);
    }
}


// export sprite
module.exports = Sprite;