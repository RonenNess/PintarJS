const PintarJS = require("./pintar");

/**
 * Implement a simple 2d pixel with color to draw.
 */
class Pixel
{
    /**
     * A drawable pixel.
     * @param {PintarJS.Point} position Pixel position.
     * @param {PintarJS.Color} color Pixel color.
     * @param {Number} scale Optional scale to make the pixel into a square in a given size.
     */
    constructor(position, color, scale)
    {
        this.position = position;
        this.color = color;
        this.scale = scale || 1;
    }
}

// export Pixel
module.exports = Pixel;