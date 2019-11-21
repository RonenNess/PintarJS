/**
 * file: sliced_sprite.js
 * description: A sliced sprite.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";
const PintarJS = require('./pintar');
const UIElement = require('./ui_element');


/**
 * A drawable sprite that is sliced into 9-slices.
 * For more info, read about 9-slice scaling / 9-slice grid.
 */
class SlicedSprite extends UIElement
{
    /**
     * Create a sliced sprite element.
     * @param {*} texture Texture to use (either instance, or URL as string).
     * @param {PintarJS.Rectangle} wholeSourceRect The entire source rect, including frame and fill.
     * @param {PintarJS.Rectangle} fillSourceRect The internal source rect, must be contained inside the whole source rect.
     * @param {Number} frameScale frame scale.
     * @param {SlicedSprite.FillModes} fillMode How to handle fill part.
     */
    constructor(texture, wholeSourceRect, fillSourceRect, frameScale, fillMode)
    {
        super();

        // set texture from string
        if (typeof texture == "string") {
            texture = new PintarJS.Texture(texture);
        }

        // store source rectangles
        this.wholeSourceRect = wholeSourceRect;
        this.fillSourceRect = fillSourceRect;
       
        // calculate frame source rects
        this.leftFrameSourceRect = new PintarJS.Rectangle(wholeSourceRect.x, fillSourceRect.y, fillSourceRect.x - wholeSourceRect.x, fillSourceRect.height);
        this.rightFrameSourceRect = new PintarJS.Rectangle(fillSourceRect.right, fillSourceRect.y, wholeSourceRect.right - fillSourceRect.right, fillSourceRect.height);
        this.topFrameSourceRect = new PintarJS.Rectangle(fillSourceRect.x, wholeSourceRect.y, fillSourceRect.width, fillSourceRect.y - wholeSourceRect.y);
        this.bottomFrameSourceRect = new PintarJS.Rectangle(fillSourceRect.x, fillSourceRect.bottom, fillSourceRect.width, wholeSourceRect.bottom - fillSourceRect.bottom);

        // create sprites
        this.topFrameSprite = new PintarJS.Sprite(texture);
        this.topFrameSprite.sourceRectangle = this.topFrameSourceRect;
        this.topFrameSprite.origin = PintarJS.Point.zero();

        // store frame scale
        this.frameScale = frameScale || 1;

        // store fill mode
        this.fillMode = fillMode || SlicedSprite.FillModes.Stretch;
    }

    /**
     * Draw the UI element.
     * @param {*} pintar Pintar instance to draw this element on.
     */
    draw(pintar)
    {
        // get drawing position and size
        var position = this.getDestTopLeftPosition();
        var size = this.getSizeInPixels();
        var scaleFactor = this.absoluteScale;
        var frameScale = scaleFactor * this.frameScale;

        // draw top frame
        this.topFrameSprite.position = position;
        this.topFrameSprite.width = this.topFrameSprite.sourceRectangle.width * frameScale;
        this.topFrameSprite.height = this.topFrameSprite.sourceRectangle.height * frameScale;
        while (this.topFrameSprite.position.x + this.topFrameSprite.width < position.x + size.x)
        {
            pintar.drawSprite(this.topFrameSprite);
            this.topFrameSprite.position.x += this.topFrameSprite.width;    
        }

        // draw parts
        pintar.drawSprite(this.topFrameSprite);
    }
}

// set fill modes
SlicedSprite.FillModes = 
{
    Stretch: 0,
    Tiled: 1,
};

// export SlicedSprite
module.exports = SlicedSprite;