(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}(g.PintarJS || (g.PintarJS = {})).UI = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/**
 * file: ancors.js
 * description: Define ancors we can attach elements to.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";

module.exports = {
    TopLeft: 'TopLeft',
    TopCenter: 'TopCenter',
    TopRight: 'TopRight',
    CenterLeft: 'CenterLeft',
    Center: 'Center',
    CenterRight: 'CenterRight',
    BottomLeft: 'BottomLeft',
    BottomCenter: 'BottomCenter',
    BottomCenterRight: 'BottomCenterRight',
    Auto: 'Auto',
    AutoInline: 'AutoInline',
};
},{}],2:[function(require,module,exports){
/**
 * file: container.js
 * description: Implement a container element.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";
const UIElement = require('./ui_element');
const PintarJS = require('./pintar');
const Sides = require('./sides');
const SizeModes = require('./size_modes');
const Anchors = require('./anchors');


/**
 * Implement a container element to hold other elements.
 */
class Container extends UIElement
{
    /**
     * Create a container element.
     */
    constructor()
    {
        super();
        this._children = [];
        this.padding = new Sides(10, 10, 10, 10);
        this.paddingMode = SizeModes.Pixels;
    }

    /**
     * Add a child element.
     * @param {UIElement} element Child element to add.
     */
    addChild(element)
    {
        // sanity check - make sure don't have a parent
        if (element.parent) {
            throw new Error("Element to add already have a parent!");
        }

        // add child
        this._children.push(element);
        element._setParent(this);
    }

    /**
     * Remove an element from this container.
     * @param {UIElement} element Element to remove.
     */
    removeChild(element)
    {
        // sanity check - make sure we are the parent
        if (element.parent !== this) {
            throw new Error("Element to remove does not belong to this container!");
        }

        // remove element
        var index = this._children.indexOf(element);
        if (index !== -1) 
        {
            this._children.splice(index, 1);
            element._setParent(null);
        }
    }

    /**
     * Get this element's internal bounding rectangle, in pixels, with padding.
     */
    getInternalBoundingBox()
    {
        var ret = this.getBoundingBox();
        var padding = this._convertSides(this.padding, this.paddingMode);
        ret.x += padding.left;
        ret.y += padding.top;
        ret.width -= padding.right + padding.left;
        ret.height -= padding.bottom + padding.top;
        return ret;
    }

    /**
     * Draw the UI element.
     */
    draw(pintar)
    {
        // draw children
        for (var i = 0; i < this._children.length; ++i) {
            this._children[i].draw(pintar);
        }
    }

    /**
     * Update the UI element.
     */
    update(input)
    {
        // call base class update
        super.update(input);

        // update children
        var lastElement = null;
        for (var i = 0; i < this._children.length; ++i) 
        {
            // get element
            var element = this._children[i];

            // if auto-inline anchor, arrange it
            var needToSetAuto = false;
            if (element.anchor === Anchors.AutoInline)
            {
                if (lastElement) {
                    element.offset.set(0, lastElement.offset.y + lastElement.size.y);
                    if (element.offset.x > this.size.x) {
                        needToSetAuto = true;
                    }
                }
                else {
                    element.offset.set(0, 0);
                }
            }

            // if auto anchor, arrange it
            if (needToSetAuto || element.anchor === Anchors.Auto)
            {
                if (lastElement) {
                    element.offset.set(0, lastElement.offset.y + lastElement.size.y);
                }
                else {
                    element.offset.set(0, 0);
                }
            }

            // update child element
            element.update(input);
            lastElement = element;
        }
    }
}

module.exports = Container; 
},{"./anchors":1,"./pintar":5,"./sides":7,"./size_modes":8,"./ui_element":10}],3:[function(require,module,exports){
var UI = {
    UIElement: require('./ui_element'),
    ProgressBar: require('./progress_bar'),
    InputManager: require('./input_manager'),
    Container: require('./container'),
    Anchors: require('./anchors'),
    SlicedSprite: require('./sliced_sprite'),
    SizeModes: require('./size_modes'),
};
const pintar = require('./pintar');
pintar.UI = UI;
module.exports = UI;
},{"./anchors":1,"./container":2,"./input_manager":4,"./pintar":5,"./progress_bar":6,"./size_modes":8,"./sliced_sprite":9,"./ui_element":10}],4:[function(require,module,exports){
/**
 * file: input_data.js
 * description: Define the input manager API.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";

/**
 * An API for an object that provide input for the UI.
 */
class InputManager
{
    /**
     * Return mouse position.
     * @returns {PintarJS.Point} Point with {x,y} position.
     */
    get mousePosition()
    {
        throw new Error("Not Implemented!");
    }

    /**
     * Return if left mouse button is down.
     * @returns {Boolean} left mouse button status.
     */
    get isLeftMouseDown()
    {
        throw new Error("Not Implemented!");
    }
    
    /**
     * Return if right mouse button is down.
     * @returns {Boolean} right mouse button status.
     */
    get isRightMouseDown()
    {
        throw new Error("Not Implemented!");
    }
    
    /**
     * Return mouse wheel change.
     * @returns {Number} mouse wheel change, or 0 if not scrolling.
     */
    get mouseWheelChange()
    {
        throw new Error("Not Implemented!");
    }
}

module.exports = InputManager; 
},{}],5:[function(require,module,exports){
var pintar = window.PintarJS || window.pintar;
if (!pintar) { throw new Error("Missing PintarJS main object."); }
module.exports = pintar;
},{}],6:[function(require,module,exports){
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
},{"./pintar":5,"./ui_element":10}],7:[function(require,module,exports){
/**
 * file: sides.js
 * description: Implement a data structure for sides.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";

/**
 * Implement a simple data structure to hold value for all sides - top, left, bottom, right.
 */
class Sides
{
    constructor(left, right, top, bottom)
    {
        this.left = left || 0;
        this.right = right || 0;
        this.top = top || 0;
        this.bottom = bottom || 0;
    }

    set(left, right, top, bottom)
    {
        this.left = left;
        this.right = right;
        this.top = top;
        this.bottom = bottom;
    }

    clone()
    {
        return new Sides(this.left, this.right, this.top, this.bottom);
    }
}


module.exports = Sides;
},{}],8:[function(require,module,exports){
/**
 * file: size_modes.js
 * description: Define size modes we can set.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";

module.exports = {
    Pixels: 'px',
    Percents: '%'
};
},{}],9:[function(require,module,exports){
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
        destRect.x -= this.leftFrameSourceRect.width * frameScale / 2;
        destRect.y -= this.topFrameSourceRect.height * frameScale / 2;

        // get position
        var position = destRect.getPosition();

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
                    if (toCut) {
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
                    if (toCut) {
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

                // check if need to trim width
                var spriteRight = sprite.position.x + sprite.size.x;
                if (spriteRight > destRect.right)
                {
                    var toCut = spriteRight - destRect.right - 2;
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

                    // check if need to trim height
                    var spriteBottom = sprite.position.y + sprite.size.y;
                    if (spriteBottom > destRect.bottom)
                    {
                        var toCut = spriteBottom - destRect.bottom - 2;
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
};

// export SlicedSprite
module.exports = SlicedSprite;
},{"./pintar":5,"./ui_element":10}],10:[function(require,module,exports){
/**
 * file: ui_element.js
 * description: Base UI element class.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";
const PintarJS = require('./pintar');
const Anchors = require('./anchors');
const SizeModes = require('./size_modes');
const Sides = require('./sides');


/**
 * Base UI element.
 */
class UIElement
{
    /**
     * Create the UI element.
     */
    constructor()
    {
        this.offset = PintarJS.Point.zero();
        this.offsetMode = SizeModes.Pixels;
        this.size = new PintarJS.Point(100, 100);
        this.sizeMode = SizeModes.Pixels;
        this.anchor = Anchors.TopLeft;
        this.scale = 1;
        this.__parent = null;
    }

    /**
     * Set the parent of this element (called internally by containers).
     * @param {UIElement} parent Parent to set.
     */
    _setParent(parent)
    {
        this.__parent = parent;
    }

    /**
     * Get absolute scale.
     */
    get absoluteScale()
    {
        return this.scale * UIElement.globalScale;
    }

    /**
     * Convert size value to absolute pixels. 
     */
    _convertSize(val, mode)
    {
        switch (mode)
        {
            case SizeModes.Pixels:
                var ret = val.clone();
                var scale = this.absoluteScale;
                ret.x *= scale;
                ret.y *= scale;
                return ret;

            case SizeModes.Percents:
                var parentSize = this.getParentBoundingBox().size;
                return new PintarJS.Point((val.x / 100.0) * parentSize.x, (val.y / 100.0) * parentSize.y);

            default:
                throw new Error("Invalid size mode!");
        }
    }

    /**
     * Convert size value to absolute pixels. 
     */
    _convertSides(val, mode)
    {
        switch (mode)
        {
            case SizeModes.Pixels:
                var ret = val.clone();
                var scale = this.absoluteScale;
                ret.left *= scale;
                ret.right *= scale;
                ret.top *= scale;
                ret.bottom *= scale;
                return ret;

            case SizeModes.Percents:
                var parentSize = this.getParentBoundingBox().size;
                return new Sides(
                    (val.left / 100.0) * parentSize.x, 
                    (val.right / 100.0) * parentSize.x,
                    (val.top / 100.0) * parentSize.y,
                    (val.bottom / 100.0) * parentSize.y);

            default:
                throw new Error("Invalid size mode!");
        }
    }

    /**
     * Get size in pixels.
     */
    getSizeInPixels()
    {
        return this._convertSize(this.size, this.sizeMode);
    }

    /**
     * Get offset in pixels.
     */
    getOffsetInPixels()
    {
        return this._convertSize(this.offset, this.offsetMode);
    }

    /**
     * Return the parent container, if have one.
     */
    get parent()
    {
        return this.__parent;
    }

    /**
     * Draw the UI element.
     * @param {*} pintar Pintar instance to draw this element on.
     */
    draw(pintar)
    {
        throw new Error("Not Implemented!");
    }

    /**
     * Update the UI element.
     * @param {InputManager} input A class that implements the 'InputManager' API.
     */
    update(input)
    {
        throw new Error("Not Implemented!");
    }

    /**
     * Get this element's bounding rectangle, in pixels.
     * @returns {PintarJS.Rectangle} Bounding box, in pixels.
     */
    getBoundingBox()
    {
        var position = this.getDestTopLeftPosition();
        var size = this.getSizeInPixels();
        return new PintarJS.Rectangle(position.x, position.y, size.x, size.y);
    }

    /**
     * Get this element's internal bounding rectangle, in pixels, with padding.
     * Note: this is just bounding box for most elements, but overrided for containers.
     * @returns {PintarJS.Rectangle} Bounding box, in pixels.
     */
    getInternalBoundingBox()
    {
        return this.getBoundingBox();
    }

    /**
     * Get parent bounding box.
     * @returns {PintarJS.Rectangle} Bounding box, in pixels.
     */
    getParentBoundingBox()
    {
        return this.parent ? this.parent.getInternalBoundingBox() : new PintarJS.Rectangle(0, 0, window.innerWidth, window.innerHeight);
    } 

    /**
     * Get absolute top-left drawing position.
     * @returns {PintarJS.Point} Element top-left position.
     */
    getDestTopLeftPosition()
    {
        // get parent bounding box
        var parentRect = this.getParentBoundingBox();
        var selfSize = this.getSizeInPixels();
        var offset = this.getOffsetInPixels();
        var ret = new PintarJS.Point();

        // check if we can use cache
        if (this.__cachedTopLeftPos &&
            this.anchor === this.__lastAnchor &&
            selfSize.equals(this.__lastSize || PintarJS.Point.zero()) &&
            offset.equals(this.__lastOffset || PintarJS.Point.zero()) &&
            parentRect.equals(this.__lastParentRect || new PintarJS.Rectangle()))
            {
                return this.__cachedTopLeftPos;
            }
        
        // set position based on anchor
        switch (this.anchor)
        {
            case Anchors.TopLeft:
                ret.set(parentRect.x, parentRect.y);
                break;

            case Anchors.TopCenter:
                ret.set((parentRect.x + (parentRect.width / 2)) - (selfSize.x / 2), parentRect.y);
                break;

            case Anchors.TopRight:
                ret.set(parentRect.right - selfSize.x, parentRect.y)
                break;

            case Anchors.CenterLeft:
                ret.x = parentRect.x;
                ret.y = parentRect.y + (parentRect.height / 2) - (selfSize.y / 2);
                break;

            case Anchors.Center:
                ret.x = parentRect.x + (parentRect.width / 2) - (selfSize.x / 2);
                ret.y = parentRect.y + (parentRect.height / 2) - (selfSize.y / 2);
                break;

            case Anchors.CenterRight:
                ret.x = parentRect.right - selfSize.x;
                ret.y = parentRect.y + (parentRect.height / 2) - (selfSize.y / 2);
                break;

            case Anchors.BottomLeft:
                ret.x = parentRect.x;
                ret.y = parentRect.bottom - selfSize.y;
                break;

            case Anchors.BottomCenter:
                ret.x = parentRect.x + (parentRect.width / 2) - (selfSize.x / 2);
                ret.y = parentRect.bottom - selfSize.y;
                break;

            case Anchors.BottomRight:
                ret.x = parentRect.right - selfSize.x;
                ret.y = parentRect.bottom - selfSize.y;
                break;       
        }
        
        // add self position
        ret.x += offset.x;
        ret.y += offset.y;

        // put in cache and return
        this.__cachedTopLeftPos = ret.clone();
        this.__lastAnchor = this.anchor;
        this.__lastSize = selfSize;
        this.__lastOffset = offset;
        this.__lastParentRect = parentRect.clone();
        return ret;
    }

    /**
     * Get element center position.
     * @returns {PintarJS.Point} Element center position.
     */
    getCenterPosition()
    {
        var bb = this.getBoundingBox();
        return bb.getCenter();
    } 
}

// set global scale
UIElement.globalScale = 1;

// export the base UI element object
module.exports = UIElement; 
},{"./anchors":1,"./pintar":5,"./sides":7,"./size_modes":8}]},{},[3])(3)
});
