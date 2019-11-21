/**
 * file: rect.js
 * description: Simple 2d rectangle object.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";
const Point = require('./point');


/**
 * Implement a simple 2d Rectangle.
 */
class Rectangle
{
    /**
     * Create the Rect.
     * @param {Number} x Rect position X (top left corner).
     * @param {Number} y Rect position Y (top left corner).
     * @param {Number} width Rect width.
     * @param {Number} height Rect height.
     */
    constructor(x, y, width, height)
    {
        this.x = x || 0;
        this.y = y || 0;
        this.width = width;
        this.height = height;
    }

    /**
     * Set rectangle values.
     * @param {Number} x Rectangle x position.
     * @param {Number} y Rectangle y position.
     * @param {Number} width Rectangle width.
     * @param {Number} height Rectangle height.
     */
    set(x, y, width, height)
    {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    /**
     * Get position as point.
     */
    getPosition()
    {
        return new Point(this.x, this.y);
    }
    
    /**
     * Get size as point.
     */
    getSize()
    {
        return new Point(this.width, this.height);
    }
	
	/**
     * Get center position.
     */
    getCenter()
    {
        return new Point(Math.round(this.x + this.width / 2), Math.round(this.y + this.height / 2));
    }

    /**
     * Get left value.
     */
    get left()
    {
        return this.x;
    }

    /**
     * Get right value.
     */
    get right()
    {
        return this.x + this.width;
    }

    /**
     * Get top value.
     */
    get top()
    {
        return this.y;
    }

    /**
     * Get bottom value.
     */
    get bottom()
    {
        return this.y + this.height;
    }

    /**
     * Return a clone of this rectangle.
     */
    clone()
    {
        return new Rectangle(this.x, this.y, this.width, this.height);
    }
        
    /**
     * Check if equal to another rect.
     * @param {PintarJS.Rectangle} other Other rectangle to compare to.
     */
    equals(other)
    {
        return other && this.x == other.x && this.y == other.y && this.width == other.width && this.height == other.height;
    }
}

// export Rect
module.exports = Rectangle;