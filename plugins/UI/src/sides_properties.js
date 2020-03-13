/**
 * file: sides.js
 * description: Implement a data structure for sides.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";
const getValueAndType = require('./utils').getValueAndType;

/**
 * Implement a simple data structure to hold value for all sides - top, left, bottom, right.
 */
class SidesProperties
{
    /**
     * Create the sides data.
     */
    constructor(left, right, top, bottom)
    {
        this.left = left || 0;
        this.right = right || 0;
        this.top = top || 0;
        this.bottom = bottom || 0;
        this.leftMode = this.rightMode = this.topMode = this.bottomMode = 'px';
    }

    /**
     * Set values.
     */
    set(left, right, top, bottom)
    {
        this.left = left;
        this.right = right;
        this.top = top;
        this.bottom = bottom;
    }

    /**
     * Get left value.
     */
    get left()
    {
        return this._left;
    }

    /**
     * Get right value.
     */
    get right()
    {
        return this._right;
    }

    /**
     * Get top value.
     */
    get top()
    {
        return this._top;
    }

    /**
     * Get bottom value.
     */
    get bottom()
    {
        return this._bottom;
    }

    /**
     * Set left value,
     */
    set left(value)
    {
        var valueSplit = getValueAndType(value);
        this._left = valueSplit.value;
        this.leftMode = this.leftMode || valueSplit.mode;
    }

    /**
     * Set right value.
     */
    set right(value)
    {
        var valueSplit = getValueAndType(value);
        this._right = valueSplit.value;
        this.rightMode = this.rightMode || valueSplit.mode;
    }

    /**
     * Set top value.
     */
    set top(value)
    {
        var valueSplit = getValueAndType(value);
        this._top = valueSplit.value;
        this.topMode = this.topMode || valueSplit.mode;
    }

    /**
     * Set bottom value.
     */
    set bottom(value)
    {
        var valueSplit = getValueAndType(value);
        this._bottom = valueSplit.value;
        this.bottomMode = this.bottomMode || valueSplit.mode;
    }

    /**
     * Return if equal another value.
     */
    equals(other)
    {
        return this.left === other.left && this.right === other.right && this.top === other.top && this.bottom === other.bottom &&
                this.leftMode === other.leftMode && this.rightMode === other.rightMode && this.topMode === other.topMode && this.bottomMode === other.bottomMode;
    }

    /**
     * Clone and return sides data.
     */
    clone()
    {
        var ret = new SidesProperties(this.left, this.right, this.top, this.bottom);
        ret.leftMode = this.leftMode;
        ret.rightMode = this.rightMode;
        ret.topMode = this.topMode;
        ret.bottomMode = this.bottomMode;
        return ret;
    }
}


module.exports = SidesProperties;