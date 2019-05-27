/**
 * file: viewport.js
 * description: Viewport to define rendering region and offset.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";
const Point = require('./point');


/**
 * Implement a rendering viewport class.
 */
class Viewport
{
    /**
     * Create the Viewport.
     * @param {PintarJS.Point} offset Viewport offset.
     * @param {PintarJS.Rectangle} drawingRegion Viewport drawing region (can be null if you don't want to limit drawing region).
     */
    constructor(offset, drawingRegion)
    {
        this.offset = offset ? offset.clone() : Point.zero();
        this.drawingRegion = drawingRegion ? drawingRegion.clone() : null;
    }

    /**
     * Return a clone of this Viewport.
     */
    clone()
    {
        return new Viewport(this.offset, this.drawingRegion);
    }
    
    /**
     * Check if equal to another Viewport.
     * @param {PintarJS.Point} other Other point to compare to.
     */
    equals(other)
    {
        return other && this.offset.equals(other.offset) && this.drawingRegion.equals(other.drawingRegion);
    }
}

// export Viewport
module.exports = Viewport;