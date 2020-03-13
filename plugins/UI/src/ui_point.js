/**
 * file: ui_point.js
 * description: A Point for UI elements position and size.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";
const PintarJS = require('./pintar');
const SizeModes = require('./size_modes');
const getValueAndType = require('./utils').getValueAndType;

/**
 * A UI point = regular point + mode.
 */
class UIPoint extends PintarJS.Point
{
    /**
     * Create the UI point.
     */
    constructor(x, modeX, y, modeY)
    {
        super(x, y);
        this.xMode = modeX || SizeModes.Pixels;
        this.yMode = modeY || SizeModes.Pixels;
    }

    /**
     * Get x value.
     */
    get x()
    {
        return this._x;
    }

    /**
     * Get y value.
     */
    get y()
    {
        return this._y;
    }
        
    /**
     * Set x value.
     */
    set x(value)
    {
        var valueSplit = getValueAndType(value);
        this._x = valueSplit.value;
        this.xMode = this.xMode || valueSplit.mode;
    }

    /**
     * Set y value.
     */
    set y(value)
    {
        var valueSplit = getValueAndType(value);
        this._y = valueSplit.value;
        this.yMode = this.yMode || valueSplit.mode;
    }

    /**
     * Return a clone of this point.
     */
    clone()
    {
        return new UIPoint(this.x, this.xMode, this.y, this.yMode);
    }
    
    /**
     * Check if equal to another point.
     * @param {PintarJS.Point} other Other point to compare to.
     */
    equals(other)
    {
        return other && this.x == other.x && this.y == other.y && this.xMode == other.xMode && this.yMode == other.yMode;
    }
}

/**
 * Get point with 0,0 values.
 */
UIPoint.zero = function()
{
    return new UIPoint(0, 'px', 0, 'px');
}

/**
 * Get point with 1,1 values.
 */
UIPoint.one = function()
{
    return new UIPoint(1, 'px', 1, 'px');
}

/**
 * Get point with 0.5,0.5 values.
 */
UIPoint.half = function()
{
    return new UIPoint(0.5, 'px', 0.5, 'px');
}

// export the UI point
module.exports = UIPoint;