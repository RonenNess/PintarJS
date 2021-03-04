const Renderable = require("./renderable");

/**
 * Implement a simple 2d line with color.
 */
class ColoredLine extends Renderable
{
    /**
     * Create the line.
     * @param {PintarJS.Point} fromPoint Line starting point.
     * @param {PintarJS.Point} toPoint Line ending point.
     * @param {PintarJS.Color} color Rectangle color.
     * @param {PintarJS.BlendModes} blendMode Blend mode to draw this rect with.
     * @param {Number} strokeWidth Line width.
     */
    constructor(fromPoint, toPoint, color, blendMode, strokeWidth)
    {
        super(fromPoint, color, blendMode);
        this.toPosition = toPoint;
        this.pixelScale = strokeWidth || 1;
    }
}

// export Colored line
module.exports = ColoredLine;