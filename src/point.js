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
     * Substract other point from this (does not affect self, return a copy).
     * @param {PintarJS.Point} other Other point to substract.
     */
    sub(other) 
    {
        return new Point(this.x - other.x, this.y - other.y);
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
     * Return a round copy of this point.
     */
    round() 
    {
        return new Point(Math.round(this.x), Math.round(this.y));
    }
    
    /**
     * Return a floored copy of this point.
     */
    floor() 
    {
        return new Point(Math.floor(this.x), Math.floor(this.y));
    }
        
    /**
     * Return a ceiled copy of this point.
     */
    ceil() 
    {
        return new Point(Math.ceil(this.x), Math.ceil(this.y));
    }
    
    /**
     * Return a normalized copy of this point.
     */
    normalize()
    {
        if (this.x == 0 && this.y == 0) { return Point.zero(); }
        var mag = Math.sqrt((this.x * this.x) + (this.y * this.y));
        return new Point(this.x / mag, this.y / mag);
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
        
    /**
     * Calculate distance from another point.
     * @param {PintarJS.Point} other Other point to calculate distance to.
     */
    distance(other)
    {
      var a = this.x - other.x;
      var b = this.y - other.y;
      return Math.sqrt(a*a + b*b);
    }

    /**
     * Convert to string.
     */
    toString() 
    {
        return 'Point(' + this.x + ',' + this.y + ')';
    }

    /**
     * Get magnitude (length).
     */
    getMagnitude() 
    {
        return Math.sqrt((this.x * this.x) + (this.y * this.y));
    }

    /**
     * Return a copy of this point multiplied by a factor.
     */
    scale(fac) 
    {
        return new PintarJS.Point(this.x * fac, this.y * fac);
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

/**
 * Get point from degrees.
 */
Point.fromAngle = function(degrees)
{
    var rads = degrees * (Math.PI / 180);
    return new Point(Math.cos(rads), Math.sin(rads));
}

// lerp two numbers
function lerp(start, end, a)
{
    return ((1-a) * start) + (a * end);
}

/**
 * Lerp between two points.
 */
Point.lerp = function(p1, p2, a)
{
    return new Point(lerp(p1.x, p2.x, a), lerp(p1.y, p2.y, a));
}

/**
 * Get angle between two points.
 */
Point.angleBetween = function(P1, P2) 
{
	var deltaY = P2.y - P1.y,
		deltaX = P2.x - P1.x;
	return Math.atan2(deltaY, deltaX) * (180 / Math.PI);
};


// export Point
module.exports = Point;