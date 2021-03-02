/**
 * file: PintarJS.js
 * description: main class that wraps the API.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";

// require basic stuff
const Point = require('./point');
const Rectangle = require('./rectangle');
const Sprite = require('./sprite');
const TextSprite = require('./text_sprite');
const Color = require('./color');
const Renderers = require('./renderers');
const Texture = require('./texture');
const BlendModes = require('./blend_modes');
const Viewport = require('./viewport');
const PintarConsole = require('./console');

// current version and author
const __version__ = "2.1.0";
const __author__ = "Ronen Ness";

/**
 * Main class that manage rendering.
 * Create an instance of this to start using PintarJS.
 */
class PintarJS
{
    /**
     * Initialize PintarJS.
     * @param {canvas} canvas Main canvas to draw on, or string to query for element.
     *                          If not provided, will query for first 'canvas' we find.
     * @param {PintarJS.Renderer} rendererTypes Renderer type to use (type or instance), or array of renderer types to try.
     */
    constructor(canvas, rendererTypes) 
    {
        // default to query 'canvas'
        canvas = canvas || "canvas";

        // if we got string instead of canvas, use it as query selector
        if (typeof canvas === 'string' || canvas instanceof String) {
            canvas = document.querySelector(canvas);
        }

        // didn't get a valid canvas? exception
        if (!canvas || !canvas.getContext) {
            throw new PintarConsole.Error("Invalid canvas provided!");
        }

        // init message
        PintarConsole.log("Initialize PintarJS on canvas:", canvas);

        // store canvas
        this._canvas = canvas;

        // get default renderer
        rendererTypes = rendererTypes || PintarJS.DefaultRenderers;

        // if got a single type and not array of types, convert to array
        if (!rendererTypes.length) { rendererTypes = [rendererTypes]; }

        // build a list of renderer names
        var rendererTypesStr = []; 
        for (var i = 0; i < rendererTypes.length; ++i) { 
            rendererTypesStr.push(rendererTypes[i].name || rendererTypes[i].constructor.name); 
        }

        // show which renderers we're going to try
        PintarConsole.log("Try to use renderers:", rendererTypesStr);

        // try to init renderers
        for (var i = 0; i < rendererTypes.length; ++i) {

            // get current renderer type
            var renderer = rendererTypes[i];

            // if type, instanciate
            if (typeof renderer === "function") { 
                renderer = new renderer(); 
            }

            // init message
            PintarConsole.log("Initialize renderer:", renderer.name || renderer.constructor.name);

            // try to init
            try {
                renderer._init(canvas);
                this._renderer = renderer;
                this._rendererName = rendererTypesStr[i];
                break;
            }
            catch (err) {
                PintarConsole.warn("Failed to init renderer, try fallback to next type..");
            }
        }    

        // couldn't find any working type?
        if (!this._renderer) {
            throw new PintarConsole.Error("Couldn't find a working renderer to use!");
        }

        // did frame started
        this._frameStarted = false;

        // count current frame delta time and fps
        this._fpsCount = 0;
        this._currFps = 0;
        this._deltaTime = 0;
        this._secondCount = 0;

        // should we match canvas size to its actual area?
        this.matchCanvasSizeToBounds = false;

        // if set, will force canvas width to match this resolution and adjust height atuomatically to maintain correct 1:1 ratio.
        this.fixedResolutionX = null;

        // if set, will force canvas height to match this resolution and adjust width atuomatically to maintain correct 1:1 ratio.
        this.fixedResolutionY = null;

        // default clear color
        this.clearColor = Color.transparent();

        // ready!
        PintarConsole.log("PintarJS ready.");
    }

    /**
     * If the canvas dimentions doesn't fit its actual size on screen, it will scale.
     * Calling this method will make sure that in the event of scaling the rendering will remain "crispy" and
     * won't turn blurry.
     */
    makePixelatedScaling()
    {
        this._canvas.style.cssText +=    
            "image-rendering: optimizeSpeed;"+             // Older versions of FF
            "image-rendering: -moz-crisp-edges;"+          // FF 6.0+
            "image-rendering: -webkit-optimize-contrast;"+ // Webkit (non standard naming)
            "image-rendering: -o-crisp-edges;"+            // OS X & Windows Opera (12.02+)
            "image-rendering: crisp-edges;"+               // Possible future browsers.
            "image-rendering: pixelated;"+                 // Default option
            "-ms-interpolation-mode: nearest-neighbor;";   // IE (non standard naming).
    }

    /**
     * Get active renderer name.
     */
    get rendererName()
    {
        return this._rendererName;
    }

    /**
     * Get canvas instance.
     */
    get canvas()
    {
        return this._canvas;
    }

    /**
     * Adjust the size of the canvas to its direct parent size.
     */
    adjustToParentSize()
    {
        var parentRect = this._canvas.parentElement.getBoundingClientRect();
        this._canvas.width  = parentRect.width;
        this._canvas.height = parentRect.height - this._canvas.offsetTop;
    }

    /**
     * Make the canvas cover fullscreen.
     */
    makeFullscreen()
    {
        this._canvas.style.position = "fixed";
        this._canvas.style.left = "0px";
        this._canvas.style.top = "0px";
        this._canvas.style.right = "0px";
        this._canvas.style.bottom = "0px";
        this._canvas.style.width = "100%";
        this._canvas.style.height = "100%";
        this._canvas.style.display = "block";
        this.matchCanvasSizeToBounds = true;
    }

    /**
     * Start a rendering frame.
     * @param {Boolean} clearCanvas If true, will clear canvas (default to true).
     */
    startFrame(clearCanvas)
    {
        // make sure frame has not started and clear canvas if needed
        if (this._frameStarted) { throw new PintarConsole.Error("'startFrame()' was already called, must call 'endFrame()' before starting a new frame!"); }
        if (clearCanvas || clearCanvas === undefined) { this.clear(); }

        // do size adjustments
        this._doSizeAdjustments();

        // start frame
        this._renderer.startFrame();
        this._frameStarted = true;

        // update delta time
        var currTime = new Date().getTime();
        if (this._lastFrameTime) { 
            this._deltaTime = currTime - this._lastFrameTime;
        }

        // store last frame time
        this._lastFrameTime = currTime;

        // count time until second pass
        this._secondCount += this.deltaTime;
        if (this._secondCount > 1) {
            this._secondCount = this._secondCount % 1;
            this._fpsCount = this._currFps;
            this._currFps = -1;
        }

        // add curr fps count
        this._currFps++;
    }

    /**
     * Do auto size adjustments (resolution, fullscreen, etc).
     */
    _doSizeAdjustments()
    {
        // check if we need to adjust resolution
        if (this.fixedResolutionX || this.fixedResolutionY) {

            // sanity test - make sure didn't set both
            if (this.fixedResolutionX && this.fixedResolutionY) {
                throw new PintarConsole.Error("Cannot set both 'fixedResolutionX' and 'fixedResolutionY', you must chose a single axis to base canvas size on.");
            }

            // get bounding client rect, and current size
            var canvasRect = this._canvas.getBoundingClientRect();
            var currWidth = this._canvas.width;
            var currHeight = this._canvas.height;

            // get desired resolution based on width
            if (this.fixedResolutionX) {
                var scaledFactor = (canvasRect.width / this.fixedResolutionX);
                var desiredWidth = this.fixedResolutionX;
                var desiredHeight = Math.round(canvasRect.height / scaledFactor);
            }
            // get desired resolution based on height
            else if (this.fixedResolutionY) {
                var scaledFactor = (canvasRect.height / this.fixedResolutionY);
                var desiredHeight = this.fixedResolutionY;
                var desiredWidth = Math.round(canvasRect.width / scaledFactor);
            }

            // adjust canvas dimentions
            if (currWidth != desiredWidth) { this._canvas.width = desiredWidth; }
            if (currHeight != desiredHeight) { this._canvas.height = desiredHeight; }
        }
        // match canvas size to bounds
        else if (this.matchCanvasSizeToBounds) {

            // get current bounds and size
            var canvasRect = this._canvas.getBoundingClientRect();
            var currWidth = this._canvas.width;
            var currHeight = this._canvas.height;

            // if need to update canvas dimentions, do it
            if (currWidth != canvasRect.width || currHeight != canvasRect.height) {
                this._canvas.width = canvasRect.width;
                this._canvas.height = canvasRect.height;
            }
        }
    }

    /**
     * Get time passed between last startFrame() and previous startFrame(), in seconds.
     */
    get deltaTime()
    {
        return this._deltaTime / 1000.0;
    }

    /**
     * Get current FPS count.
     * Note: only available after 1 second of running have passed, before that it would just return 0.
     */
    get fpsCount()
    {
        return this._fpsCount;
    }

    /**
     * End a rendering frame.
     */
    endFrame()
    {
        this._renderer.endFrame();
        this._frameStarted = false;
    }

    /**
     * Get the canvas drawing area.
     * @returns {PintarJS.Rectangle} Canvas drawing area.
     */
    get canvasRect()
    {
        return new PintarJS.Rectangle(0, 0, this._canvas.width, this._canvas.height);
    }

    /**
     * Clear the whole canvas or a part of it.
     * @param {PintarJS.Color} color Color to clear screen to.
     * @param {PintarJS.Rectangle} rect Rectangle to clear, or undefined to clear whole canvas.
     */
    clear(color, rect)
    {
        color = color || this.clearColor;
        this._renderer.clear(color, rect);
    }

    /**
     * Set the currently active view port.
     * @param {PintarJS.Viewport} viewport viewport to set.
     */
    setViewport(viewport)
    {
        this._renderer.setViewport(viewport);
    }

    /**
     * Draw text on screen.
     * @param {PintarJS.TextSprite} textSprite Text sprite to draw.
     */
    drawText(textSprite) 
    {      
        if (!this._frameStarted) { throw new PintarConsole.Error("Must call 'startFrame()' before drawing!"); }
        if (!textSprite.text) { return; }
        this._renderer.drawText(textSprite);
    }

    /**
     * Draw a sprite.
     * @param {PintarJS.Sprite} sprite Sprite to draw.
     */
    drawSprite(sprite)
    {
        if (!this._frameStarted) { throw new PintarConsole.Error("Must call 'startFrame()' before drawing!"); }
        this._renderer.drawSprite(sprite);
    }

    /**
     * Draw any object.
     * @param {*} obj Object to draw.
     */
    draw(obj)
    {
        if (obj instanceof Sprite) {
            this.drawSprite(obj);
        }
        else if (obj instanceof TextSprite) {
            this.drawText(obj);
        }
        else {
            throw new PintarConsole.Error("Unknown object type to draw!");
        }
    }
}


// put internal stuff the user should access under the PintarJS class
PintarJS.Point = Point;
PintarJS.Rectangle = Rectangle;
PintarJS.Sprite = Sprite;
PintarJS.TextSprite = TextSprite;
PintarJS.TextAlignment = TextSprite.Alignments;
PintarJS.BlendModes = BlendModes;
PintarJS.Renderers = Renderers;
PintarJS.Color = Color;
PintarJS.DefaultRenderers = [Renderers.WebGL, Renderers.Canvas];
PintarJS.Texture = Texture;
PintarJS.Viewport = Viewport;
PintarJS.silent = PintarConsole.silent;
PintarJS.enableDebugMessages = PintarConsole.enableDebugMessages;

// show version
PintarJS._version = __version__;
PintarJS._author = __author__;
PintarConsole.log("PintarJS v" + __version__ + " ready! 🎨");

// export main module
module.exports = PintarJS;
