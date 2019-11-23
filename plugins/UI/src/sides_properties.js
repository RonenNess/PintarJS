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
     * Clone and return sides data.
     */
    clone()
    {
        return new SidesProperties(this.left, this.right, this.top, this.bottom);
    }
}


module.exports = SidesProperties;