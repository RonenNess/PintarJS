const Rectangle = require("./rectangle");
const Renderable = require("./renderable");

/**
 * Implement a simple 2d Rectangle with color.
 */
class ColoredRectangle extends Renderable
{
    /**
     * Create the rectangle.
     * @param {PintarJS.Point} position Rectangle top-left position.
     * @param {PintarJS.Point} size Rectangle size.
     * @param {PintarJS.Color} color Rectangle color.
     * @param {PintarJS.BlendModes} blendMode Blend mode to draw this rect with.
     * @param {Boolean} filled Is this rectangle filled or just outline.
     * @param {Number} strokeWidth Lines width.
     */
    constructor(position, size, color, blendMode, filled, strokeWidth)
    {
        super(position, color, blendMode);
        this.size = size;
        this.filled = Boolean(filled);
        this.pixelScale = strokeWidth || 1;
    }

    /**
     * Return this shape as a regular rectangle.
     */
    getAsRect()
    {
        return new Rectangle(this.position.x, this.position.y, this.size.x, this.size.y);
    }

    /**
     * Get width.
     */
    get width()
    {
        return this.size.x;
    }

    /**
     * Get height.
     */
    get height()
    {
        return this.size.y;
    }

    /**
     * Set width.
     */
    set width(val)
    {
        this.size.x = val;
    }

    /**
     * Set height.
     */
    set height(val)
    {
        this.size.y = val;
    }
}

// export Colored Rect
module.exports = ColoredRectangle;