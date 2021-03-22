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
     * Get top-left corner.
     */
    get topLeft()
    {
        return new Point(this.x, this.y);
    }

    /**
     * Get top-right corner.
     */
    get topRight()
    {
        return new Point(this.x + this.width, this.y);
    }
        
    /**
     * Get bottom-left corner.
     */
    get bottomLeft()
    {
        return new Point(this.x, this.y + this.height);
    }

    /**
     * Get bottom-right corner.
     */
    get bottomRight()
    {
        return new Point(this.x + this.width, this.y + this.height);
    }

    /**
     * Convert to string.
     */
    toString() 
    {
        return 'Rectangle(' + this.x + ',' + this.y + ',' + this.width + ',' + this.height + ')';
    }

    /**
     * Check if rectangle contains a point.
     */
    containsPoint(p) 
    {
        return p.x >= this.x && p.x <= this.x + this.width && p.y >= this.y && p.y <= this.y + this.height;
    }

    /**
     * Check if this rectangle collides with another.
     */
    collidesWithOther(other)
    {
        var r1 = this;
        var r2 = other;
        return !(r2.left > r1.right ||
                r2.right < r1.left ||
                r2.top > r1.bottom ||
                r2.bottom < r1.top);
    }

    /**
     * Checks if this rectangle collides with circle.
     */
    collidesWithCircle(center, radius) 
    {
        // first check if circle center is inside the rectangle - easy case
        var rect = this;
        if (rect.containsPoint(center)) {
            return true;
        }

        // get rectangle center
        var rectCenter = rect.getCenter();

        // create a list of lines to check (in the rectangle) based on circle position to rect center
        var lines = [];
        if (rectCenter.x > center.x) {
            lines.push([rect.topLeft, rect.bottomLeft]);
        } else {
            lines.push([rect.topRight, rect.bottomRight]);
        }
        if (rectCenter.y > center.y) {
            lines.push([rect.topLeft, rect.topRight]);
        } else {
            lines.push([rect.bottomLeft, rect.bottomRight]);
        }

        // now check intersection between circle and each of the rectangle lines
        for (var i = 0; i < lines.length; ++i) {
            var disToLine = _engine.managers.xmath.pointLineDistance(center, lines[i][0], lines[i][1]);
            if (disToLine <= radius) {
                return true;
            }
        }

        // no collision..
        return false;
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

/**
 * Build a rectangle from a list of points.
 */
Rectangle.fromPoints = function(points)
{
    var min_x = points[0].x;
    var min_y = points[0].y;
    var max_x = min_x;
    var max_y = min_y;

    for (var i = 1; i < points.length; ++i) {
        min_x = Math.min(min_x, points[i].x);
        min_y = Math.min(min_y, points[i].y);
        max_x = Math.max(max_x, points[i].x);
        max_y = Math.max(max_y, points[i].y);
    }

    return new Rectangle(min_x, min_y, max_x - min_x, max_y - min_y);
}

// export Rect
module.exports = Rectangle;