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
     */
    constructor(fromPoint, toPoint, color, blendMode)
    {
        super(fromPoint, color, blendMode);
        this.toPosition = toPoint;
    }
}

// export Colored line
module.exports = ColoredLine;