/**
 * file: progress_bar.js
 * description: Implement a progress bar element.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";
const UIElement = require('./ui_element');
const PintarJS = require('./pintar');

/**
 * Implement a progress bar.
 */
class ProgressBar extends UIElement
{
    /**
     * Create a progress bar element.
     * @param {*} texture Texture to use (either instance, or URL as string).
     * @param {PintarJS.Rectangle} backgroundSourceRect Progressbar background source rect in texture.
     * @param {PintarJS.Rectangle} fillSourceRect Progressbar fill source rect in texture.
     * @param {Number} widthInPixels Progressbar desired width in pixels (will scale based on source rect accordingly).
     * @param {PintarJS.Point} fillOffset Optional offset, in pixels (in texture), of the fill part from the background part.
     */
    constructor(texture, backgroundSourceRect, fillSourceRect, widthInPixels, fillOffset)
    {
        super();

        // set texture from string
        if (typeof texture == "string") {
            texture = new PintarJS.Texture(texture);
        }

        // store fill offset
        this.fillOffset = fillOffset || PintarJS.Point.zero();

        // store source rectangles
        this.backgroundSourceRect = backgroundSourceRect;
        this.fillSourceRect = fillSourceRect;

        // bar background sprite
        this.barBackground = new PintarJS.Sprite(texture);
        this.barBackground.origin.x = 0;
        this.barBackground.sourceRectangle = this.backgroundSourceRect;

        // bar fill sprite
        this.barFill = new PintarJS.Sprite(texture);
        this.barFill.origin.x = 0;

        // set width in pixels
        this.widthInPixels = widthInPixels;

        // set starting value
        this.value = 1;
    }

    /**
     * Set progressbar width in pixels, and scale everything accordingly.
     */
    set widthInPixels(widthInPixels)
    {
        this.scaleFactor = widthInPixels ? widthInPixels / this.backgroundSourceRect.width : this.backgroundSourceRect.width;
        this.size.set(this.backgroundSourceRect.width * this.scaleFactor, this.backgroundSourceRect.height * this.scaleFactor);
    }

    /**
     * Get progressbar fill color.
     */
    get fillColor()
    {
        return this.barFill.color;
    }

    /**
     * Set progressbar fill color.
     */
    set fillColor(color)
    {
        this.barFill.color = color;
    }

    /**
     * Get progressbar fill blend mode.
     */
    get fillBlendMode()
    {
        return this.barFill.blendMode;
    }

    /**
     * Set progressbar fill blend mode.
     */
    set fillBlendMode(blendMode)
    {
        this.barFill.blendMode = blendMode;
    }

    /**
     * Draw the UI element.
     */
    draw(pintar)
    {
        // get absolute scale
        this.widthInPixels = this.getSizeInPixels().x;
        var scale = this.scaleFactor;

        // get drawing position
        var position = this.getDestTopLeftPosition();

        // update elements position
        this.barBackground.position.set(position.x, position.y);
        this.barFill.position.set(position.x + this.fillOffset.x * scale, position.y + this.fillOffset.y * scale);

        // set size
        this.barBackground.size.set(this.size.x, this.size.y);

        // draw background
        pintar.drawSprite(this.barBackground);

        // update and draw fill
        if (this.barFill.width > 0) 
        { 
            this.barFill.size.set(this.fillSourceRect.width * scale * this.value, this.fillSourceRect.height * scale);
            this.barFill.sourceRectangle = this.fillSourceRect.clone();
            this.barFill.sourceRectangle.width *= this.value;
            pintar.drawSprite(this.barFill); 
        }
    }
}

module.exports = ProgressBar; 