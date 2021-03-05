/**
 * file: render_target.js
 * description: A texture you can draw on, and later use as texture.
 * author: Ronen Ness.
 * since: 2021.
 */
"use strict";

const Viewpor = require("./viewport");
const Point = require("./point");
const Rectangle = require("./rectangle");


/**
 * A texture you can render on and later use as regular texture.
 */
class RenderTarget
{
    /**
     * Create the render target.
     * @param {PintarJS.Point} size Render target size.
     * @param {*} data Internal data used by the renderer.
     */
    constructor(size, data)
    {
        this.size = size.clone();
        this._data = data;
    }

    /**
     * Is this a valid render target?
     */
    get isRenderTarget()
    {
        return true;
    }

    /**
     * Get texture width.
     */
    get width()
    {
        return this.size.x;
    }

    /**
     * Get texture height.
     */
    get height()
    {
        return this.size.y;
    }

    /**
     * Get render target viewport.
     */
    get viewport()
    {
        return new Viewport(Point.zero(), new Rectangle(0, 0, this.width, this.height));
    }
    
}

// export render target
module.exports = RenderTarget;