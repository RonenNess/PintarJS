/**
 * file: webgl.js
 * description: Implement webgl renderer.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";
const WebGlBase = require('../webgl');
const PintarConsole = require('../../console');
const CanvasRenderer = require('../canvas');
const Color = require('../../color');

/**
 * Implement a hybrid class that uses web-GL for rendering and an overlay canvas renderer just for text drawing.
 * This is older technology and obselete, but can be useful if you need a lot of different, constantly changing texts, which will consume
 * a lot of memory with the regular WebGL renderer.
 */
class WebGlHybridRenderer extends WebGlBase
{
    /**
     * Init renderer.
     */
    _init(canvas)
    {
        // call parent init
        super._init(canvas);

        // create the overlay canvas
        this._initOverlayCanvas();
    }

    /**
     * Create the overlay canvas for text rendering.
     */
    _initOverlayCanvas()
    {
        PintarConsole.debug("Create internal canvas renderer to use as overlay layer for text..");
        var canvas = this._canvas;
        this._overlayCanvas = document.createElement('canvas');
        this._overlayCanvas.id = "pintarjs-webgl-overlay-canvas";
        this._overlayCanvasRender = new CanvasRenderer();
        this._overlayCanvasRender._init(this._overlayCanvas);
        this._updateOverlayCanvas();
        canvas.parentNode.insertBefore(this._overlayCanvas, canvas.nextSibling);
        PintarConsole.debug("Done creating canvas renderer.");
    }

    /**
     * Update the overlay canvas position and size.
     */
    _updateOverlayCanvas()
    {
        // adjust canvas width and height
        if (this._overlayCanvas.width != this._canvas.width) { this._overlayCanvas.width = this._canvas.width; }
        if (this._overlayCanvas.height != this._canvas.height) { this._overlayCanvas.height = this._canvas.height; }
        
        // get bounding rect, and if nothing changed - skip
        var rect = this._canvas.getBoundingClientRect();
        if (this._lastBounding && 
            (this._lastBounding.left === rect.left && this._lastBounding.right === rect.right && this._lastBounding.top === rect.top && this._lastBounding.bottom === rect.bottom)) {
            return;
        }
        this._lastBounding = rect;
        
        // set overlay canvas bounding rect        
        this._overlayCanvas.style.position = "fixed";
        this._overlayCanvas.style.zIndex = this._canvas.style.zIndex + 1;
        this._overlayCanvas.style.display = "block";
        this._overlayCanvas.style.left = rect.left + "px";
        this._overlayCanvas.style.right = rect.right + "px";
        this._overlayCanvas.style.top = rect.top + "px";
        this._overlayCanvas.style.bottom = rect.bottom + "px";
        this._overlayCanvas.style.width = this._canvas.style.width;
        this._overlayCanvas.style.height = this._canvas.style.height;
    }

    /**
     * Start a rendering frame.
     */
    startFrame()
    {
        // call base start frame
        super.startFrame();

        // update the overlay canvas position and size
        this._updateOverlayCanvas();
    }

    /**
     * Clear screen or part of it.
     * For more info check out renderer.js.
     */
    clear(color, rect)
    {
        // clear the overlay canvas
        this._overlayCanvasRender.clear(new Color(0, 0, 0, 0));

        // clear base renderer
        super.clear(color, rect);
    }
    
    /**
     * Set viewport.
     */
    setViewport(viewport)
    {
        this._overlayCanvasRender.setViewport(viewport);
        super.setViewport(viewport);
    }

    /**
     * Draw text using the overlay canvas renderer.
     * For more info check out renderer.js.
     */
    drawText(textSprite) 
    { 
        this._overlayCanvasRender.drawText(textSprite);
    }
}

// export WebGlHybridRenderer
module.exports = WebGlHybridRenderer;