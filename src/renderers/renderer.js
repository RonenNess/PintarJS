/**
 * file: renderer.js
 * description: Define the renderer interface, which is the low-level layer that draw stuff.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";
const PintarConsole = require('./../console');

/**
 * Basic renderer interface.
 */
class Renderer
{
    /**
     * Initialize this renderer from canvas.
     * @param {Canvas} canvas Canvas instance.
     */
    _init(canvas)
    {
        throw new PintarConsole.Error("Not Implemented.");
    }

    /**
     * 
     * @param {PintarJS.Color} color Color to clear screen to.
     * @param {PintarJS.Rect} rect Optional rectangle to clear.
     */
    clear(color, rect)
    {
        throw new PintarConsole.Error("Not Implemented.");
    }

    /**
     * Draw text.
     * @param {PintarJS.TextSprite} textSprite Text sprite to draw.
     */
    drawText(textSprite) 
    {      
        throw new PintarConsole.Error("Not Implemented.");
    }

    /**
     * Draw a sprite.
     * @param {PintarJS.Sprite} sprite Sprite to draw.
     */
    drawSprite(sprite)
    {      
        throw new PintarConsole.Error("Not Implemented.");
    }

    /**
     * Draw a rectangle.
     * @param {PintarJS.ColoredRectangle} coloredRectangle Colored rectangle to draw.
     */
    drawRectangle(coloredRectangle)
    {
        throw new PintarConsole.Error("Not Implemented.");
    }

    /**
     * Draw a single color.
     * @param {PintarJS.Point} position Pixel position.
     * @param {PintarJS.Color} color Pixel color.
     */
    drawPixel(position, color)
    {
        throw new PintarConsole.Error("Not Implemented.");
    }

    /**
     * Draw a line.
     * @param {PintarJS.Point} pointA Line starting point.
     * @param {PintarJS.Point} pointB Line ending point.
     * @param {PintarJS.Color} color Line color.
     */
    drawLine(pointA, pointB, color)
    {
        throw new PintarConsole.Error("Not Implemented.");
    }

    /**
     * Set the currently active viewport.
     * @param {PintarJS.Viewport} viewport Viewport to set.
     */
    setViewport(viewport)
    {
        throw new PintarConsole.Error("Not Implemented.");
    }
    
    /**
     * Start a rendering frame.
     */
    startFrame()
    {
    }

    /**
     * End a rendering frame.
     */
    endFrame()
    {
    }
}

// export Renderer interface
module.exports = Renderer;