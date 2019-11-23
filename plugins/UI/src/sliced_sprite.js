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
     * @param {Number} textureScale frame and fill texture scale.
     * @param {SlicedSprite.FillModes} fillMode How to handle fill part.
     */
    constructor(texture, wholeSourceRect, fillSourceRect, textureScale, fillMode)
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

        // calculate frame corners rects
        this.topLeftFrameCornerSourceRect = new PintarJS.Rectangle(wholeSourceRect.x, wholeSourceRect.y, fillSourceRect.x - wholeSourceRect.x, fillSourceRect.y - wholeSourceRect.y);
        this.topRightFrameCornerSourceRect = new PintarJS.Rectangle(fillSourceRect.right, wholeSourceRect.y, wholeSourceRect.right - fillSourceRect.right, fillSourceRect.y - wholeSourceRect.y);
        this.bottomLeftFrameCornerSourceRect = new PintarJS.Rectangle(wholeSourceRect.x, fillSourceRect.bottom, fillSourceRect.x - wholeSourceRect.x, wholeSourceRect.bottom - fillSourceRect.bottom);
        this.bottomRightFrameCornerSourceRect = new PintarJS.Rectangle(fillSourceRect.right, fillSourceRect.bottom, wholeSourceRect.right - fillSourceRect.right, wholeSourceRect.bottom - fillSourceRect.bottom);

        // create sprites
        this.topFrameSprite = new PintarJS.Sprite(texture);
        this.bottomFrameSprite = new PintarJS.Sprite(texture);
        this.leftFrameSprite = new PintarJS.Sprite(texture);
        this.rightFrameSprite = new PintarJS.Sprite(texture);
        this.topLeftCornerFrameSprite = new PintarJS.Sprite(texture);
        this.bottomLeftCornerFrameSprite = new PintarJS.Sprite(texture);
        this.topRightCornerFrameSprite = new PintarJS.Sprite(texture);
        this.bottomRightCornerFrameSprite = new PintarJS.Sprite(texture);
        this.fillSprite = new PintarJS.Sprite(texture);

        // set default colors
        this.fillColor = PintarJS.Color.white();
        this.frameColor = PintarJS.Color.white();

        // store frame scale
        this.frameScale = textureScale || 1;
        this.fillScale = textureScale || 1;

        // store fill mode
        this.fillMode = fillMode || SlicedSprite.FillModes.Tiled;
    }

    /**
     * Draw the UI element.
     * @param {*} pintar Pintar instance to draw this element on.
     */
    draw(pintar)
    {
        // get drawing position and size
        var destRect = this.getBoundingBox();
        
        // get scale and adjust position to centerize sprite
        var scaleFactor = this.absoluteScale;
        var frameScale = scaleFactor * this.frameScale;

        // get position
        var position = destRect.getPosition();
        destRect.width -= this.bottomRightFrameCornerSourceRect.width * frameScale;
        destRect.height -= this.bottomRightFrameCornerSourceRect.height * frameScale;

        // function to draw top / bottom frames
        var drawTopAndBottomFrames = (sprite, sourceRect, extraY) => 
        {
            // skip if not needed
            if (sourceRect.width == 0 || sourceRect.height == 0) {
                return;
            }

            // store original source rect and set starting params
            sprite.sourceRectangle = sourceRect.clone();
            sprite.origin = PintarJS.Point.zero();
            sprite.position = position.clone();
            sprite.position.y += extraY;
            sprite.position.x += this.topLeftFrameCornerSourceRect.width * frameScale;
            sprite.width = sprite.sourceRectangle.width * frameScale;
            sprite.height = sprite.sourceRectangle.height * frameScale;
            sprite.color = this.frameColor;

            // iterate and draw frame
            var exceededRightSide = false;
            while (!exceededRightSide)
            {
                // check if need to trim the sprite / finish drawing
                var spriteRight = (sprite.position.x + sprite.width);
                exceededRightSide = spriteRight >= destRect.right;
                if (exceededRightSide) 
                {
                    var toCut = spriteRight - destRect.right;
                    if (toCut > 0) {
                        sprite.sourceRectangle.width -= Math.round(toCut * (sprite.sourceRectangle.width / sprite.width));
                        sprite.width -= toCut;
                    }
                }

                // draw frame part
                pintar.drawSprite(sprite);
                sprite.position.x += sprite.width;    
            }
        }

        // draw top and bottom frames
        drawTopAndBottomFrames(this.topFrameSprite, this.topFrameSourceRect, 0);
        drawTopAndBottomFrames(this.bottomFrameSprite, this.bottomFrameSourceRect, destRect.height);

        // function to draw left / right frames
        var drawLeftAndRightFrames = (sprite, sourceRect, extraX) => 
        {
            // skip if not needed
            if (sourceRect.width == 0 || sourceRect.height == 0) {
                return;
            }

            // store original source rect and set starting params
            sprite.sourceRectangle = sourceRect.clone();
            sprite.origin = PintarJS.Point.zero();
            sprite.position = position.clone();
            sprite.position.x += extraX;
            sprite.position.y += this.topLeftFrameCornerSourceRect.height * frameScale;
            sprite.width = sprite.sourceRectangle.width * frameScale;
            sprite.height = sprite.sourceRectangle.height * frameScale;
            sprite.color = this.frameColor;

            // iterate and draw frame
            var exceededBottomSide = false;
            while (!exceededBottomSide)
            {
                // check if need to trim the sprite / finish drawing
                var spriteBottom = (sprite.position.y + sprite.height);
                exceededBottomSide = spriteBottom >= destRect.bottom;
                if (exceededBottomSide) 
                {
                    var toCut = spriteBottom - destRect.bottom;
                    if (toCut > 0) {
                        sprite.sourceRectangle.height -= Math.round(toCut * (sprite.sourceRectangle.height / sprite.height));
                        sprite.height -= toCut;
                    }
                }

                // draw frame part
                pintar.drawSprite(sprite);
                sprite.position.y += sprite.height;    
            }
        }

        // draw top and bottom frames
        drawLeftAndRightFrames(this.leftFrameSprite, this.leftFrameSourceRect, 0);
        drawLeftAndRightFrames(this.rightFrameSprite, this.rightFrameSourceRect, destRect.width);

        // function to draw frames corners
        var drawFramesCorner = (sprite, sourceRect, posx, posy) => 
        {
            // skip if not needed
            if (sourceRect.width == 0 || sourceRect.height == 0) {
                return;
            }

            // store original source rect and set starting params
            sprite.sourceRectangle = sourceRect.clone();
            sprite.origin = PintarJS.Point.zero();
            sprite.position = position.clone();
            sprite.position.x += posx;
            sprite.position.y += posy;
            sprite.width = sprite.sourceRectangle.width * frameScale;
            sprite.height = sprite.sourceRectangle.height * frameScale;
            sprite.color = this.frameColor;

            // draw sprite corner
            pintar.drawSprite(sprite);
        }

        // draw corners
        drawFramesCorner(this.topLeftCornerFrameSprite, this.topLeftFrameCornerSourceRect, 0, 0);
        drawFramesCorner(this.topRightCornerFrameSprite, this.topRightFrameCornerSourceRect, destRect.width, 0);
        drawFramesCorner(this.bottomLeftCornerFrameSprite, this.bottomLeftFrameCornerSourceRect, 0, destRect.height);
        drawFramesCorner(this.bottomRightCornerFrameSprite, this.bottomRightFrameCornerSourceRect, destRect.width, destRect.height);

        // prepare fill sprite properties
        var sprite = this.fillSprite;     
        sprite.origin = PintarJS.Point.zero();
        sprite.position = position.clone();
        sprite.position.x += this.topLeftCornerFrameSprite.width;
        sprite.position.y += this.topLeftCornerFrameSprite.height;
        sprite.width = destRect.width - this.bottomLeftCornerFrameSprite.width;
        sprite.height = destRect.height - this.bottomLeftCornerFrameSprite.height;
        sprite.color = this.fillColor;

        // draw fill - stretch mode
        if (this.fillMode === SlicedSprite.FillModes.Stretch) 
        {
            sprite.sourceRectangle = this.fillSourceRect.clone();
            pintar.drawSprite(sprite);
        }
        else if (this.fillMode === SlicedSprite.FillModes.Tiled) 
        {
            // setup starting params
            var fillScale = scaleFactor * this.fillScale; 
            var fillSize = new PintarJS.Point(this.fillSourceRect.width * fillScale, this.fillSourceRect.height * fillScale);
            sprite.size = fillSize.clone();
            var startPosition = sprite.position.clone();

            // iterate columns
            for (var i = 0; i < destRect.width / fillSize.x; ++i)
            {
                // reset source rect
                sprite.sourceRectangle = this.fillSourceRect.clone();

                // set width and position x
                sprite.size.x = fillSize.x;
                sprite.position.x = startPosition.x + sprite.width * i;

                // check if should finish
                if (sprite.position.x >= this.rightFrameSprite.position.x) {
                    break;
                }

                // check if need to trim width
                var spriteRight = sprite.position.x + sprite.size.x;
                if (spriteRight > this.rightFrameSprite.position.x)
                {
                    var toCut = spriteRight - this.rightFrameSprite.position.x;
                    if (toCut > 0) {
                        sprite.sourceRectangle.width -= Math.round(toCut * (sprite.sourceRectangle.width / sprite.width));
                        sprite.width -= toCut;
                    }
                }

                // check if should stop here
                if (sprite.width == 0) {
                    break;
                }

                // iterate rows
                for (var j = 0; j < destRect.height / fillSize.y; ++j)
                {
                    // set height and position y
                    sprite.size.y = fillSize.y;
                    sprite.position.y = startPosition.y + sprite.height * j;

                    // check if should finish
                    if (sprite.position.y >= this.bottomFrameSprite.position.y) {
                        break;
                    }

                    // check if need to trim height
                    var spriteBottom = sprite.position.y + sprite.size.y;
                    if (spriteBottom > this.bottomFrameSprite.position.y)
                    {
                        var toCut = spriteBottom - this.bottomFrameSprite.position.y;
                        if (toCut > 0) {
                            sprite.sourceRectangle.height -= Math.round(toCut * (sprite.sourceRectangle.height / sprite.height));
                            sprite.height -= toCut;
                        }
                    }

                    // check if should stop here
                    if (sprite.height == 0) {
                        break;
                    }

                    // draw sprite
                    pintar.drawSprite(sprite);
                }
            }
        }
        else if (this.fillMode === SlicedSprite.FillModes.None) 
        {
        }
        else
        {
            throw new Error("Invalid fill mode!");
        }
    }
}

// set fill modes
SlicedSprite.FillModes = 
{
    Tiled: 0,
    Stretch: 1,
    None: 2,
};

// export SlicedSprite
module.exports = SlicedSprite;