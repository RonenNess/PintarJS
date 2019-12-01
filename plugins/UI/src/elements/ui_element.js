/**
 * file: ui_element.js
 * description: Base UI element class.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";
const PintarJS = require('../pintar');
const Anchors = require('../anchors');
const SizeModes = require('../size_modes');
const Sides = require('../sides_properties');
const UIPoint = require('../ui_point');
const Cursors = require('../cursor_types');

/**
 * State of a UI element.
 */
class UIElementState
{
    constructor()
    {
        this.mouseHover = false;
        this.mouseDown = false;
    }

    clone()
    {
        var ret = new UIElementState();
        ret.mouseHover = this.mouseHover;
        ret.mouseDown = this.mouseDown;
        return ret;
    }
}


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
        // set all basic properties
        this.offset = UIPoint.zero();
        this.size = new UIPoint(100, 'px', 100, 'px');
        this.anchor = Anchors.Auto;
        this.scale = 1;
        this.margin = new Sides(5, 5, 5, 5);
        this.ignoreParentPadding = false;
        this.cursor = this._defaultCursor;
        this._state = new UIElementState();
        this._prevState = new UIElementState();
        this.__parent = null;

        // set default interactive mode
        this.interactive = this.isNaturallyInteractive;

        // callbacks users can register to
        // every callback is called with (this, inputManager)
        this.onMouseEnter = null;
        this.onMouseLeave = null;
        this.whileMouseHover = null;
        this.onMousePressed = null;
        this.onMouseReleased = null;
        this.whileMouseDown = null;
        this.afterValueChanged = null;
    }

    /**
     * Copy state from another UI element.
     * When copying state, update will not calculate new state, the other element will determine it for us.
     * Events will still trigger.
     * @param {*} other Other element to copy state from, or null to cancel state sharing.
     */
    _copyStateFrom(other)
    {
        this.__copyStateFrom = other;
    }

    /**
     * Set base element theme-related options.
     * @param {Object} options.
     */
    setBaseOptions(options)
    {
        this.scale = options.scale || this.scale;
        this.margin = (options.margin || this.margin).clone();
        this.anchor = options.anchor || this.anchor;
        this.cursor = options.cursor || this.cursor;
    }

    /**
     * Default cursor type for this element.
     */
    get _defaultCursor()
    {
        return Cursors.Default;
    }

    /**
     * Get element type name.
     */
    get elementTypeName()
    {
        return this.constructor.name;
    }

    /**
     * Get options for object type and skin from theme.
     * @param {Object} theme Theme object.
     * @param {String} skin Skin to use for this specific element (or 'default' if not defined).
     * @param {Object} override Optional dictionary of values to override theme's defaults.
     */
    getOptionsFromTheme(theme, skin, override)
    {
        // get class name
        var elementName = this.elementTypeName;

        // get element definition from theme
        var options = theme[elementName];
        if (!options) {
            throw new Error("Missing definition for object type '" + elementName + "' in UI theme!");
        }

        // get skin type (or default)
        skin = skin || 'default';
        options = options[skin];
        if (!options) {
            throw new Error("Missing definition for object type '" + elementName + "' and skin '" + skin + "' in UI theme!");
        }

        // apply override values
        if (override) 
        {
            var temp = {};
            for (var key in options) {
                temp[key] = options[key];
            }
            for (var key in override) {
                temp[key] = override[key];
            }
            options = temp;
        }

        // do inheritance
        if (options.extends) 
        {
            var temp = {};
            var base = theme[elementName][options.extends];
            for (var key in base) {
                temp[key] = base[key];
            }
            for (var key in options) {
                temp[key] = options[key];
            }
            options = temp;
        }

        // validate required options
        var required = this.requiredOptions;
        for (var i = 0; i < required.length; ++i) {
            if (!(required[i] in options)) {
                throw new Error("Missing mandatory option '" + required[i] + "' in element type '" + elementName + "' options!");
            }
        }

        // success - return element options
        return options;
    }

    /**
     * Get required options for this element type.
     */
    get requiredOptions()
    {
        return [];
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
     * Convert a single value to absolute value in pixels.
     */
    _convertVal(val, parentSize, mode)
    {
        switch (mode)
        {
            case undefined:
            case SizeModes.Pixels:
                var scale = this.absoluteScale;
                return Math.ceil(val * scale);

            case SizeModes.Percents:
                return Math.ceil((val / 100.0) * parentSize);

            default:
                throw new Error("Invalid size mode!");
        }
    }

    /**
     * Convert size value to absolute pixels. 
     */
    _convertSize(val)
    {
        var parentSize = (val.xMode == SizeModes.Percents || val.yMode == SizeModes.Percents) ? this.getParentInternalBoundingBox().getSize() : {x:0, y:0};
        return new PintarJS.Point(this._convertVal(val.x, parentSize.x, val.xMode), this._convertVal(val.y, parentSize.y, val.yMode));
    }

    /**
     * Convert size value to absolute pixels. 
     */
    _convertSides(val)
    {
        var ret = val.clone();
        var parentSize = (ret.leftMode == SizeModes.Percents || ret.rightMode == SizeModes.Percents || ret.topMode == SizeModes.Percents || ret.bottomMode == SizeModes.Percents) ? 
            this.getParentInternalBoundingBox().getSize() : {x:0, y:0};
        ret.left = this._convertVal(ret.left, parentSize.x, ret.leftMode);
        ret.right = this._convertVal(ret.right, parentSize.x, ret.rightMode);
        ret.top = this._convertVal(ret.top, parentSize.y, ret.topMode);
        ret.bottom = this._convertVal(ret.bottom, parentSize.y, ret.bottomMode);
        return ret;
    }

    /**
     * Get size in pixels.
     */
    getSizeInPixels()
    {
        return this._convertSize(this.size);
    }

    /**
     * Get offset in pixels.
     */
    getOffsetInPixels()
    {
        return this._convertSize(this.offset);
    }

    /**
     * Return the parent container, if have one.
     */
    get parent()
    {
        return this.__parent;
    }

    /**
     * Get if this element is interactive by default.
     * Elements that are not interactive will not trigger events or run the update loop.
     */
    get isNaturallyInteractive()
    {
        return false;
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
     * Trigger registered events based on current state and previous state.
     */
    _triggerEvents(input)
    {
        // trigger callbacks
        if (!this._prevState.mouseHover && this._state.mouseHover) { this._onMouseEnter(input); }
        if (this._prevState.mouseHover && !this._state.mouseHover) { this._onMouseLeave(input); }
        if (this._state.mouseHover) { this._whileMouseHover(input); }
        if (!this._prevState.mouseDown && this._state.mouseDown) { this._onMousePressed(input); }
        if (this._prevState.mouseDown && !this._state.mouseDown && this._state.mouseHover) { this._onMouseReleased(input); }
        if (this._state.mouseDown) { this._whileMouseDown(input); }
        
        // trigger value changed events
        var newVal = this._getValue();
        if (newVal !== this._prevVal) {
            this._afterValueChanged(input);
            this._prevVal = newVal;
        }

        // set new previous state
        this._prevState = this._state.clone();
    }

    /**
     * Called when mouse enter element.
     */
    _onMouseEnter(input)
    {
        if (this.onMouseEnter) { this.onMouseEnter(this, input); }
    }

    /**
     * Called when mouse leave element.
     */
    _onMouseLeave(input)
    {
        if (this.onMouseLeave) { this.onMouseLeave(this, input); }
    }

    /**
     * Called while mouse hover on element.
     */
    _whileMouseHover(input)
    {
        if (this.whileMouseHover) { this.whileMouseHover(this, input); }
    }

    /**
     * Called when mouse is pressed on element.
     */
    _onMousePressed(input)
    {
        if (this.onMousePressed) { this.onMousePressed(this, input); }
    }

    /**
     * Called when mouse is released on element.
     */
    _onMouseReleased(input)
    {
        if (this.onMouseReleased) { this.onMouseReleased(this, input); }
    }

    /**
     * Called while mouse is down over element.
     */
    _whileMouseDown(input)
    {
        if (this.whileMouseDown) { this.whileMouseDown(this, input); }
    }

    /**
     * Called after this element's value was changed, for elements that have values.
     */
    _afterValueChanged(input)
    {
        if (this.afterValueChanged) { this.afterValueChanged(this, input); }
    }

    /**
     * For elements that have a changeable value, this returns the current valut for internal usage.
     */
    _getValue()
    {
        return undefined;
    }

    /**
     * Update the UI element.
     * @param {InputManager} input A class that implements the 'InputManager' API.
     * @param {UIElementState} forceState If provided, this element will copy this state, no questions asked.
     */
    update(input, forceState)
    {
        // not interactive? skip
        if (!this.interactive) {
            return;
        }

        // if copying another element's state, skip
        if (this.__copyStateFrom || forceState) {
            this._state = forceState ? forceState.clone() : this.__copyStateFrom._state.clone();
            this._triggerEvents(input);
            return;
        }

        // get dest rect
        var dest = this.getBoundingBox();

        // check if mouse hover
        var mousePos = input.mousePosition;
        this._state.mouseHover = mousePos.x >= dest.left && mousePos.x <= dest.right && mousePos.y >= dest.top && mousePos.y <= dest.bottom;
        
        // if mouse hover, update cursor
        if (this._state.mouseHover) {
            input.setCursor(this.cursor);
        }

        // check if mouse is down on element
        this._state.mouseDown = this._state.mouseHover && input.leftMouseDown;

        // trigger events based on new state
        this._triggerEvents(input);
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
    getParentInternalBoundingBox()
    {
        if (!this.parent) {
            throw new Error("Missing parent element! Did you forget to create a UI root and add elements to it?");
        }
        return this.ignoreParentPadding ? this.parent.getBoundingBox() : this.parent.getInternalBoundingBox();
    } 

    /**
     * Get absolute top-left position for a given parent internal rectangle, size in pixels, and anchor.
     */
    getDestTopLeftPositionForRect(parentRect, selfSize, anchor, offset)
    {
        // to return
        var ret = new PintarJS.Point(0, 0);

        // set offset factor based on anchor
        var offsetFactor = new PintarJS.Point(1, 1);
        
        // set position based on anchor
        switch (anchor)
        {
            case Anchors.TopLeft:
            case Anchors.Auto:          // note: auto and auto-inline behave just like top-left because offset is set by the parent container.
            case Anchors.AutoInline:
                ret.set(parentRect.x, parentRect.y);
                break;

            case Anchors.TopCenter:
                ret.set((parentRect.x + (parentRect.width / 2)) - (selfSize.x / 2), parentRect.y);
                break;

            case Anchors.TopRight:
                ret.set(parentRect.right - selfSize.x, parentRect.y)
                offsetFactor.x = -1;
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
                offsetFactor.x = -1;
                break;

            case Anchors.BottomLeft:
                ret.x = parentRect.x;
                ret.y = parentRect.bottom - selfSize.y;
                offsetFactor.y = -1;
                break;

            case Anchors.BottomCenter:
                ret.x = parentRect.x + (parentRect.width / 2) - (selfSize.x / 2);
                ret.y = parentRect.bottom - selfSize.y;
                offsetFactor.y = -1;
                break;

            case Anchors.BottomRight:
                ret.x = parentRect.right - selfSize.x;
                ret.y = parentRect.bottom - selfSize.y;
                offsetFactor.x = -1;
                offsetFactor.y = -1;
                break;       
        }
        
        // add self position and return
        if (offset) {
            ret = ret.add(offset.mul(offsetFactor));
        }
        ret.x = Math.floor(ret.x);
        ret.y = Math.floor(ret.y);
        return ret;
    }

    /**
     * Get absolute top-left drawing position.
     * @returns {PintarJS.Point} Element top-left position.
     */
    getDestTopLeftPosition()
    {
        // special case - absolute
        if (this.anchor === Anchors.Fixed)
        {
            return this.offset.clone();
        }

        // get parent bounding box
        var parentRect = this.getParentInternalBoundingBox();
        var selfSize = this.getSizeInPixels();
        var offset = this.getOffsetInPixels();
        

        // check if we can use cache
        if (this.__cachedTopLeftPos &&
            this.anchor === this.__lastAnchor &&
            selfSize.equals(this.__lastSize || PintarJS.Point.zero()) &&
            offset.equals(this.__lastOffset || PintarJS.Point.zero()) &&
            parentRect.equals(this.__lastParentRect || new PintarJS.Rectangle()))
            {
                return this.__cachedTopLeftPos;
            }
        
        // get position based on anchor
        var ret = this.getDestTopLeftPositionForRect(parentRect, selfSize, this.anchor, offset);

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