/**
 * file: point.js
 * description: Simple 2d point object.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";


/**
 * Implement a simple 2d Point class.
 */
class Point
{
    /**
     * Create the point.
     * @param {Number} x Point position X.
     * @param {Number} y Point position Y.
     */
    constructor(x, y)
    {
        this.x = x || 0;
        this.y = y || 0;
    }

    /**
     * Set point values.
     * @param {Number} x X value to set or null to leave untouched.
     * @param {Number} y Y value to set or null to leave untouched.
     */
    set(x, y)
    {
        if (x !== null) this.x = x;
        if (y !== null) this.y = y;
    }
    
    /**
     * Copy values from other point into self.
     * @param {PintarJS.Point} other Other point to copy.
     */
    copy(other) 
    {
        this.x = other.x;
        this.y = other.y;
        return this;
    }
    
    /**
     * Add this + other point (does not affect self, return a copy).
     * @param {PintarJS.Point} other Other point to add.
     */
    add(other) 
    {
        return new Point(this.x + other.x, this.y + other.y);
    }
    
    /**
     * Add this / other point (does not affect self, return a copy).
     * @param {PintarJS.Point} other Other point to add.
     */
    div(other) 
    {
        return new Point(this.x / other.x, this.y / other.y);
    }
    
    /**
     * Add this * other point (does not affect self, return a copy).
     * @param {PintarJS.Point} other Other point to add.
     */
    mul(other) 
    {
        return new Point(this.x * other.x, this.y * other.y);
    }
    
    /**
     * Return cross product with another point.
     * @param {PintarJS.Point} other Other point to get cross product with.
     */
    cross(other) 
    {
        return this.x * other.y - this.y * other.x;
    }
    
    /**
     * Return dot product with another point.
     * @param {PintarJS.Point} other Other point to get dot product with.
     */
    dot(other) 
    {
        return this.x * other.x + this.y * other.y;
    }

    /**
     * Return a clone of this point.
     */
    clone()
    {
        return new Point(this.x, this.y);
    }
    
    /**
     * Check if equal to another point.
     * @param {PintarJS.Point} other Other point to compare to.
     */
    equals(other)
    {
        return other && this.x == other.x && this.y == other.y;
    }
}

/**
 * Get point with 0,0 values.
 */
Point.zero = function()
{
    return new Point(0, 0);
}

/**
 * Get point with 1,1 values.
 */
Point.one = function()
{
    return new Point(1, 1);
}

/**
 * Get point with 0.5,0.5 values.
 */
Point.half = function()
{
    return new Point(0.5, 0.5);
}

// export Point
module.exports = Point;