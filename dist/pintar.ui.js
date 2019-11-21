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
},{"./anchors":1,"./pintar":5,"./sides":7,"./size_modes":8,"./ui_element":9}],3:[function(require,module,exports){
var UI = {
    UIElement: require('./ui_element'),
    ProgressBar: require('./progress_bar'),
    InputManager: require('./input_manager'),
    Container: require('./container'),
    Anchors: require('./anchors'),
    SizeModes: require('./size_modes'),
};
const pintar = require('./pintar');
pintar.UI = UI;
module.exports = UI;
},{"./anchors":1,"./container":2,"./input_manager":4,"./pintar":5,"./progress_bar":6,"./size_modes":8,"./ui_element":9}],4:[function(require,module,exports){
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

    /**
     * Update the UI element.
     */
    update(input)
    {
    }
}

module.exports = ProgressBar; 
},{"./pintar":5,"./ui_element":9}],7:[function(require,module,exports){
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
     * Convert size value to absolute pixels. 
     */
    _convertSize(val, mode)
    {
        switch (mode)
        {
            case SizeModes.Pixels:
                return val.clone();

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
                return val.clone();

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
        var size = this.size;
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

module.exports = UIElement; 
},{"./anchors":1,"./pintar":5,"./sides":7,"./size_modes":8}]},{},[3])(3)
});
