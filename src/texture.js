/**
 * file: texture.js
 * description: A drawable texture class.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";
const Point = require('./point');
const PintarConsole = require('./console');


/**
 * A drawable texture.
 */
class Texture
{
    /**
     * Create the texture.
     * @param {*} imageOrSize Can be Image instance, URI to load image from, or point to create empty texture with image of given size.
     * @param {Function} onLoaded Callback to call when image is successfully loaded.
     */
    constructor(imageOrSize, onLoaded)
    {
        // if we got image instance..
        if (imageOrSize instanceof Image) {

            // store image
            PintarConsole.log("Create new texture from existing image:", (imageOrSize.src || imageOrSize).toString().substring(0, 32));
            this.image = imageOrSize;

            // if ready, call init and callback
            if (this.image.width) {
                if (onLoaded) { onLoaded.call(this.image); }
            }
            // if not ready, set onload callback
            else {
                this.image.onload = onLoaded;
            }
        }

        // if we got a string, load image from URI
        else if (typeof imageOrSize === 'string' || imageOrSize instanceof String) {
            PintarConsole.log("Create new texture from image URI:", imageOrSize);
            this.image = new Image();
            this.image.onload = onLoaded;
            this.image.src = imageOrSize;
        }

        // if got point, create empty image with given size
        else if (imageOrSize instanceof Point) {
            PintarConsole.log("Create new texture from empty image with size:", imageOrSize);
            this.image = new Image(imageOrSize.x, imageOrSize.y);
            if (onLoaded) { onLoaded(); }
        }

        // invalid type?
        else {
            throw new PintarConsole.Error("Invalid param for texture creation; Should either be Image, string, or Point!");
        }
    }

    /**
     * Return if texture's image is loaded / ready.
     */
    get isReady() 
    {
        return this.image && this.image.width != 0;
    }

    /**
     * Get texture width.
     */
    get width()
    {
        return this.image.width;
    }

    /**
     * Get texture height.
     */
    get height()
    {
        return this.image.height;
    }
    
}

// export Texture
module.exports = Texture;