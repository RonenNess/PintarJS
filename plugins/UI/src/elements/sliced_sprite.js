/**
 * file: sliced_sprite.js
 * description: A sliced sprite.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";
const PintarJS = require('../pintar');
const UIElement = require('./ui_element');


/**
 * A drawable sprite that is sliced into 9-slices.
 * For more info, read about 9-slice scaling / 9-slice grid in general.
 */
class SlicedSprite extends UIElement
{
    /**
     * Create a sliced sprite element.
     * @param {Object} theme
     * @param {PintarJS.Texture} theme.texture Texture to use.
     * @param {PintarJS.Rectangle} theme.externalSourceRect The entire source rect, including frame and fill.
     * @param {PintarJS.Rectangle} theme.internalSourceRect The internal source rect, must be contained inside the whole source rect.
     * @param {Number} theme.textureScale (Optional) frame and fill texture scale.
     * @param {SlicedSprite.FillModes} theme.fillMode (Optional) How to handle fill part.
     * @param {PintarJS.Color} theme.fillColor (Optional) Fill color.
     * @param {PintarJS.Color} theme.frameColor (Optional) Frame color.
     * @param {String} skin Element skin to use from theme.
     * @param {Object} override Optional override options (can override any of the theme properties listed above).
     */
    constructor(theme, skin, override)
    {
        super();

        // get options from theme and skin type
        var options = this.getOptionsFromTheme(theme, skin, override);
        this.setBaseOptions(options);

        // extract params
        var texture = this.__getFromOptions(options, 'texture');
        var textureScale = this.__getFromOptions(options, 'textureScale', 1);
        var wholeSourceRect = this._externalSourceRect = this.__getFromOptions(options, 'externalSourceRect');
        var fillSourceRect = this._internalSourceRect = this.__getFromOptions(options, 'internalSourceRect');
        var fillMode = this.__getFromOptions(options, 'fillMode', SlicedSprite.FillModes.Tiled);
       
        // calculate frame source rects
        this._leftFrameSourceRect = new PintarJS.Rectangle(wholeSourceRect.x, fillSourceRect.y, fillSourceRect.x - wholeSourceRect.x, fillSourceRect.height);
        this._rightFrameSourceRect = new PintarJS.Rectangle(fillSourceRect.right, fillSourceRect.y, wholeSourceRect.right - fillSourceRect.right, fillSourceRect.height);
        this._topFrameSourceRect = new PintarJS.Rectangle(fillSourceRect.x, wholeSourceRect.y, fillSourceRect.width, fillSourceRect.y - wholeSourceRect.y);
        this._bottomFrameSourceRect = new PintarJS.Rectangle(fillSourceRect.x, fillSourceRect.bottom, fillSourceRect.width, wholeSourceRect.bottom - fillSourceRect.bottom);

        // calculate frame corners rects
        this._topLeftFrameCornerSourceRect = new PintarJS.Rectangle(wholeSourceRect.x, wholeSourceRect.y, fillSourceRect.x - wholeSourceRect.x, fillSourceRect.y - wholeSourceRect.y);
        this._topRightFrameCornerSourceRect = new PintarJS.Rectangle(fillSourceRect.right, wholeSourceRect.y, wholeSourceRect.right - fillSourceRect.right, fillSourceRect.y - wholeSourceRect.y);
        this._bottomLeftFrameCornerSourceRect = new PintarJS.Rectangle(wholeSourceRect.x, fillSourceRect.bottom, fillSourceRect.x - wholeSourceRect.x, wholeSourceRect.bottom - fillSourceRect.bottom);
        this._bottomRightFrameCornerSourceRect = new PintarJS.Rectangle(fillSourceRect.right, fillSourceRect.bottom, wholeSourceRect.right - fillSourceRect.right, wholeSourceRect.bottom - fillSourceRect.bottom);

        // create sprites
        this._topFrameSprite = new PintarJS.Sprite(texture);
        this._bottomFrameSprite = new PintarJS.Sprite(texture);
        this._leftFrameSprite = new PintarJS.Sprite(texture);
        this._rightFrameSprite = new PintarJS.Sprite(texture);
        this._topLeftCornerFrameSprite = new PintarJS.Sprite(texture);
        this._bottomLeftCornerFrameSprite = new PintarJS.Sprite(texture);
        this._topRightCornerFrameSprite = new PintarJS.Sprite(texture);
        this._bottomRightCornerFrameSprite = new PintarJS.Sprite(texture);
        this._fillSprite = new PintarJS.Sprite(texture);

        // set default colors
        this.fillColor = this.__getFromOptions(options, 'fillColor', PintarJS.Color.white());
        this.frameColor = this.__getFromOptions(options, 'frameColor', PintarJS.Color.white());

        // store frame scale
        this.frameScale = textureScale;
        this.fillScale = textureScale;

        // set default blend mode
        this.blendMode = PintarJS.BlendModes.AlphaBlend;

        // store fill mode
        this.fillMode = fillMode || SlicedSprite.FillModes.Tiled;
    }

    /**
     * Get required options for this element type.
     */
    get requiredOptions()
    {
        return ['texture', 'externalSourceRect', 'internalSourceRect'];
    }

    /**
     * Get the external source rect of this sliced sprite.
     */
    get sourceRectangle()
    {
        return this._externalSourceRect;
    }

    /**
     * Set color for both fill and frame.
     */
    set color(color)
    {
        this.fillColor = color.clone();
        this.frameColor = color.clone();
    }

    /**
     * Draw the UI element.
     * @param {*} pintar Pintar instance to draw this element on.
     */
    drawImp(pintar)
    {
        // get drawing position and size
        var destRect = this.getBoundingBox();
        
        // get scale and adjust position to centerize sprite
        var scaleFactor = this.absoluteScale;
        var frameScale = scaleFactor * this.frameScale;

        // get position
        var position = destRect.getPosition();
        destRect.width -= this._bottomRightFrameCornerSourceRect.width * frameScale;
        destRect.height -= this._bottomRightFrameCornerSourceRect.height * frameScale;

        // draw frames part
        if (destRect.width > 0 && destRect.height > 0) 
        {
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
                sprite.blendMode = this.blendMode;
                sprite.position.y += extraY;
                sprite.position.x += this._topLeftFrameCornerSourceRect.width * frameScale;
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
                            sprite.sourceRectangle.width -= Math.floor(toCut * (sprite.sourceRectangle.width / sprite.width));
                            sprite.width -= toCut;
                        }
                    }

                    // draw frame part
                    pintar.drawSprite(sprite);
                    sprite.position.x += sprite.width;    
                }
            }

            // draw top and bottom frames
            drawTopAndBottomFrames(this._topFrameSprite, this._topFrameSourceRect, 0);
            drawTopAndBottomFrames(this._bottomFrameSprite, this._bottomFrameSourceRect, destRect.height);

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
                sprite.blendMode = this.blendMode;
                sprite.position.x += extraX;
                sprite.position.y += this._topLeftFrameCornerSourceRect.height * frameScale;
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
                            sprite.sourceRectangle.height -= Math.floor(toCut * (sprite.sourceRectangle.height / sprite.height));
                            sprite.height -= toCut;
                        }
                    }

                    // draw frame part
                    pintar.drawSprite(sprite);
                    sprite.position.y += sprite.height;    
                }
            }

            // draw top and bottom frames
            drawLeftAndRightFrames(this._leftFrameSprite, this._leftFrameSourceRect, 0);
            drawLeftAndRightFrames(this._rightFrameSprite, this._rightFrameSourceRect, destRect.width);

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
                sprite.blendMode = this.blendMode;
                sprite.position.x += posx;
                sprite.position.y += posy;
                sprite.width = sprite.sourceRectangle.width * frameScale;
                sprite.height = sprite.sourceRectangle.height * frameScale;
                sprite.color = this.frameColor;

                // draw sprite corner
                pintar.drawSprite(sprite);
            }

            // draw corners
            drawFramesCorner(this._topLeftCornerFrameSprite, this._topLeftFrameCornerSourceRect, 0, 0);
            drawFramesCorner(this._topRightCornerFrameSprite, this._topRightFrameCornerSourceRect, destRect.width, 0);
            drawFramesCorner(this._bottomLeftCornerFrameSprite, this._bottomLeftFrameCornerSourceRect, 0, destRect.height);
            drawFramesCorner(this._bottomRightCornerFrameSprite, this._bottomRightFrameCornerSourceRect, destRect.width, destRect.height);
        }

        // draw fill
        if (this._internalSourceRect.width && this._internalSourceRect.height)
        {
            // prepare fill sprite properties
            var sprite = this._fillSprite;     
            sprite.origin = PintarJS.Point.zero();
            sprite.position = position.clone();
            sprite.blendMode = this.blendMode;
            sprite.position.x += this._topLeftCornerFrameSprite.width;
            sprite.position.y += this._topLeftCornerFrameSprite.height;
            sprite.width = destRect.width - this._bottomLeftCornerFrameSprite.width;
            sprite.height = destRect.height - this._bottomLeftCornerFrameSprite.height;
            sprite.color = this.fillColor;

            // draw fill - stretch mode
            if (this.fillMode === SlicedSprite.FillModes.Stretch) 
            {
                sprite.sourceRectangle = this._internalSourceRect.clone();
                pintar.drawSprite(sprite);
            }
            // draw fill - tiling
            else if (this.fillMode === SlicedSprite.FillModes.Tiled) 
            {
                // setup starting params
                var fillScale = scaleFactor * this.fillScale; 
                var fillSize = new PintarJS.Point(Math.max(this._internalSourceRect.width * fillScale, 1), Math.max(this._internalSourceRect.height * fillScale, 1));
                sprite.size = fillSize.clone();
                var startPosition = sprite.position.clone();

                // iterate columns
                for (var i = 0; i < destRect.width / fillSize.x; ++i)
                {
                    // reset source rect
                    sprite.sourceRectangle = this._internalSourceRect.clone();

                    // set width and position x
                    sprite.size.x = fillSize.x;
                    sprite.position.x = startPosition.x + sprite.width * i;

                    // check if should finish
                    if (sprite.position.x >= this._rightFrameSprite.position.x) {
                        break;
                    }

                    // check if need to trim width
                    var spriteRight = sprite.position.x + sprite.size.x;
                    if (spriteRight > this._rightFrameSprite.position.x)
                    {
                        var toCut = spriteRight - this._rightFrameSprite.position.x;
                        if (toCut > 0) {
                            sprite.sourceRectangle.width -= Math.floor(toCut * (sprite.sourceRectangle.width / sprite.width));
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
                        if (sprite.position.y >= this._bottomFrameSprite.position.y) {
                            break;
                        }

                        // check if need to trim height
                        var spriteBottom = sprite.position.y + sprite.size.y;
                        if (spriteBottom > this._bottomFrameSprite.position.y)
                        {
                            var toCut = spriteBottom - this._bottomFrameSprite.position.y;
                            if (toCut > 0) {
                                sprite.sourceRectangle.height -= Math.floor(toCut * (sprite.sourceRectangle.height / sprite.height));
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
            // draw fill - no fill
            else if (this.fillMode === SlicedSprite.FillModes.None) 
            {
            }
            // unknown mode.
            else
            {
                throw new Error("Invalid fill mode!");
            }
        }
    }
}

// set fill modes
SlicedSprite.FillModes = 
{
    Tiled: 1,
    Stretch: 2,
    None: 3,
};

// export SlicedSprite
module.exports = SlicedSprite;