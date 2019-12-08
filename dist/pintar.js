(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.PintarJS = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/**
 * file: blend_modes.js
 * description: Define blend modes enum.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";


// export blend modes
module.exports = {
    AlphaBlend: "alpha",
    Opaque: "opaque",
    Additive: "additive",
    Multiply: "multiply",
    Subtract: "subtract",
    Screen: "screen",
    Overlay: "overlay",
    DestIn: "dest-in",
    DestOut: "dest-out",
};
},{}],2:[function(require,module,exports){
/**
 * file: color.js
 * description: Color object.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";
const PintarConsole = require('./console');


/**
 * Implement a simple color-holder class.
 */
class Color
{
    /**
     * Create the color.
     * @param {Number} r Color red component.
     * @param {Number} g Color green component.
     * @param {Number} b Color blue component.
     * @param {Number} a Color alpha component.
     */
    constructor(r, g, b, a)
    {
        this.set(r, g, b, a);
    }

    /**
     * Set the color components.
     * @param {Number} r Color red component.
     * @param {Number} g Color green component.
     * @param {Number} b Color blue component.
     * @param {Number} a Color alpha component.
     */
    set(r, g, b, a)
    {
        this._r = r;
        this._g = g;
        this._b = b;
        this._a = a;
        this._asHex = null;
    }

    /**
     * Get r component.
     */
    get r()
    {
        return this._r;
    }

    /**
     * Get g component.
     */
    get g()
    {
        return this._g;
    }

    /**
     * Get b component.
     */
    get b()
    {
        return this._b;
    }
    
    /**
     * Get a component.
     */
    get a()
    {
        return this._a;
    }

    /**
     * Set r component.
     */
    set r(val)
    {
        this._r = val;
        this._asHex = null;
    }

    /**
     * Set g component.
     */
    set g(val)
    {
        this._g = val;
        this._asHex = null;
    }

    /**
     * Set b component.
     */
    set b(val)
    {
        this._b = val;
        this._asHex = null;
    }
    
    /**
     * Set a component.
     */
    set a(val)
    {
        this._a = val;
        this._asHex = null;
    }

    /**
     * Convert a component to hex value.
     * @param {Number} c Value to convert to hex.
     */
    componentToHex(c) 
    {
        var hex = Math.round(c).toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }
     
    /**
     * Convert this color to hex string (starting with '#').
     */
    asHex() 
    {
        if (!this._asHex) {
            this._asHex = "#" + this.componentToHex(this.r * 255) + this.componentToHex(this.g * 255) + this.componentToHex(this.b * 255) + this.componentToHex(this.a * 255);
        }
        return this._asHex;
    }

    /**
     * Get color from hex value.
     * @param {Number} val Number value (hex), as 0xrrggbbaa.
     */
    fromHex(val)
    {
        var val = Color.fromHex(val);
        this.r = val.r;
        this.g = val.g;
        this.b = val.b;
        this.a = val.a;
    }

    /**
     * Get color from decimal value.
     * @param {Number} val Number value (int).
     * @param {Number} includeAlpha If true, will include alpha value.
     */
    fromDecimal(val, includeAlpha)
    {
        if (includeAlpha) { this.a = (val & 0xff) / 255.0; val = val >> 8; }
        this.b = (val & 0xff) / 255.0; val = val >> 8;
        this.g = (val & 0xff) / 255.0; val = val >> 8;
        this.r = (val & 0xff) / 255.0;
    }

    /**
     * Convert this color to decimal number.
     */
    asDecimalRGBA()
    {
      return ((Math.round(this.r * 255) << (8 * 3)) | (Math.round(this.g * 255) << (8 * 2)) | (Math.round(this.b * 255) << (8 * 1)) | (Math.round(this.a * 255)))>>>0;
    }

    /**
     * Convert this color to decimal number.
     */
    asDecimalABGR()
    {
      return ((Math.round(this.a * 255) << (8 * 3)) | (Math.round(this.b * 255) << (8 * 2)) | (Math.round(this.g * 255) << (8 * 1)) | (Math.round(this.r * 255)))>>>0;
    }

    /**
     * Return a clone of this color.
     */
    clone()
    {
        return new Color(this.r, this.g, this.b, this.a);
    }

    /**
     * Get if this color is transparent black.
     */
    get isTransparentBlack()
    {
        return this._r == this._g && this._g == this._b && this._b == this._a && this._a == 0;
    }

    /**
     * Check if equal to another color.
     * @param {PintarJS.Color} other Other color to compare to.
     */
    equals(other)
    {
        return other && this._r == other._r && this._g == other._g && this._b == other._b && this._a == other._a;
    }
}

// table to convert common color names to hex
var colorNameToHex = {"aliceblue":"#f0f8ff","antiquewhite":"#faebd7","aqua":"#00ffff","aquamarine":"#7fffd4","azure":"#f0ffff",
    "beige":"#f5f5dc","bisque":"#ffe4c4","black":"#000000","blanchedalmond":"#ffebcd","blue":"#0000ff","blueviolet":"#8a2be2","brown":"#a52a2a","burlywood":"#deb887",
    "cadetblue":"#5f9ea0","chartreuse":"#7fff00","chocolate":"#d2691e","coral":"#ff7f50","cornflowerblue":"#6495ed","cornsilk":"#fff8dc","crimson":"#dc143c","cyan":"#00ffff",
    "darkblue":"#00008b","darkcyan":"#008b8b","darkgoldenrod":"#b8860b","darkgray":"#a9a9a9","darkgreen":"#006400","darkkhaki":"#bdb76b","darkmagenta":"#8b008b","darkolivegreen":"#556b2f",
    "darkorange":"#ff8c00","darkorchid":"#9932cc","darkred":"#8b0000","darksalmon":"#e9967a","darkseagreen":"#8fbc8f","darkslateblue":"#483d8b","darkslategray":"#2f4f4f","darkturquoise":"#00ced1",
    "darkviolet":"#9400d3","deeppink":"#ff1493","deepskyblue":"#00bfff","dimgray":"#696969","dodgerblue":"#1e90ff",
    "firebrick":"#b22222","floralwhite":"#fffaf0","forestgreen":"#228b22","fuchsia":"#ff00ff",
    "gainsboro":"#dcdcdc","ghostwhite":"#f8f8ff","gold":"#ffd700","goldenrod":"#daa520","gray":"#808080","green":"#008000","greenyellow":"#adff2f",
    "honeydew":"#f0fff0","hotpink":"#ff69b4",
    "indianred ":"#cd5c5c","indigo":"#4b0082","ivory":"#fffff0","khaki":"#f0e68c",
    "lavender":"#e6e6fa","lavenderblush":"#fff0f5","lawngreen":"#7cfc00","lemonchiffon":"#fffacd","lightblue":"#add8e6","lightcoral":"#f08080","lightcyan":"#e0ffff","lightgoldenrodyellow":"#fafad2",
    "lightgrey":"#d3d3d3","lightgreen":"#90ee90","lightpink":"#ffb6c1","lightsalmon":"#ffa07a","lightseagreen":"#20b2aa","lightskyblue":"#87cefa","lightslategray":"#778899","lightsteelblue":"#b0c4de",
    "lightyellow":"#ffffe0","lime":"#00ff00","limegreen":"#32cd32","linen":"#faf0e6",
    "magenta":"#ff00ff","maroon":"#800000","mediumaquamarine":"#66cdaa","mediumblue":"#0000cd","mediumorchid":"#ba55d3","mediumpurple":"#9370d8","mediumseagreen":"#3cb371","mediumslateblue":"#7b68ee",
    "mediumspringgreen":"#00fa9a","mediumturquoise":"#48d1cc","mediumvioletred":"#c71585","midnightblue":"#191970","mintcream":"#f5fffa","mistyrose":"#ffe4e1","moccasin":"#ffe4b5",
    "navajowhite":"#ffdead","navy":"#000080",
    "oldlace":"#fdf5e6","olive":"#808000","olivedrab":"#6b8e23","orange":"#ffa500","orangered":"#ff4500","orchid":"#da70d6",
    "palegoldenrod":"#eee8aa","palegreen":"#98fb98","paleturquoise":"#afeeee","palevioletred":"#d87093","papayawhip":"#ffefd5","peachpuff":"#ffdab9","peru":"#cd853f","pink":"#ffc0cb","plum":"#dda0dd","powderblue":"#b0e0e6","purple":"#800080",
    "rebeccapurple":"#663399","red":"#ff0000","rosybrown":"#bc8f8f","royalblue":"#4169e1",
    "saddlebrown":"#8b4513","salmon":"#fa8072","sandybrown":"#f4a460","seagreen":"#2e8b57","seashell":"#fff5ee","sienna":"#a0522d","silver":"#c0c0c0","skyblue":"#87ceeb","slateblue":"#6a5acd","slategray":"#708090","snow":"#fffafa","springgreen":"#00ff7f","steelblue":"#4682b4",
    "tan":"#d2b48c","teal":"#008080","thistle":"#d8bfd8","tomato":"#ff6347","turquoise":"#40e0d0",
    "violet":"#ee82ee",
    "wheat":"#f5deb3","white":"#ffffff","whitesmoke":"#f5f5f5",
    "yellow":"#ffff00","yellowgreen":"#9acd32"};

// create getter function for all named color
for (var key in colorNameToHex) {
    if (colorNameToHex.hasOwnProperty(key)) {
        var colorValue = hexToColor(colorNameToHex[key]);
        (function(_colValue) {
            Color[key] = function() {
                return _colValue.clone();
            }
        })(colorValue);
    }
}

// add specials
Color.transparent = function() {
    return new Color(0, 0, 0, 0);
}
Color.transwhite = function() {
    return new Color(1, 1, 1, 0);
}

/**
 * Convert Hex value to Color instance.
 * @param {String} hex Hex value to parse.
 */
function hexToColor(hex) 
{
    // expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });
    
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    var components = result ? {
        r: parseInt(result[1], 16) / 255.0,
        g: parseInt(result[2], 16) / 255.0,
        b: parseInt(result[3], 16) / 255.0
    } : null;

    // create Color instance
    if (!components) { throw new PintarConsole.Error("Invalid hex value to parse!"); }
    return new Color(components.r, components.g, components.b, 1);
}

/**
 * Create and return color instance from hex.
 */
Color.fromHex = function(colorHex)
{
	if (typeof colorHex !== 'string' && colorHex[0] != '#') {
        throw new PintarJS.Error("Invalid color format!");
    }
    var parsed = hexToColor(colorHex);
    if (!parsed) { throw new PintarConsole.Error("Invalid hex value to parse!"); }
    return new Color(parsed.r, parsed.g, parsed.b, 1);
}

/**
 * Create and return color instance from decimal.
 */
Color.fromDecimal = function(val)
{
    var ret = new Color();
    ret.fromDecimal(val);
    return ret;
}

// export Color
module.exports = Color;
},{"./console":3}],3:[function(require,module,exports){
/**
 * file: console.js
 * description: For internal errors and logging.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";


/**
 * Implement a simple error throwing and logging.
 * Note: all methods are static.
 */
class Console
{
}

/***
 * Disable all logging and output of PintarJS.
 */
Console.silent = function() {
    Console.debug = Console.log = Console.warn = Console.error = function() {}
};

/**
 * Write a log message.
 */
Console.log = function() {
    var context = "PintarJS | " + (new Date()).toLocaleString() + " |>";
    return Function.prototype.bind.call(console.log, console, context);
}();

/**
 * Write a warning message.
 */
Console.warn = function() {
    var context = "PintarJS | " + (new Date()).toLocaleString() + " | WARNING |>";
    return Function.prototype.bind.call(console.warn || console.log, console, context);
}();

/**
 * Write an error message.
 */
Console.error = function() {
    var context = "PintarJS | " + (new Date()).toLocaleString() + " | ERROR |>";
    return Function.prototype.bind.call(console.error || console.log, console, context);
}();

/**
 * Write a debug message - disabled by default.
 */
Console.debug = function() {
};

/***
 * Enable debug-level messages
 */
Console.enableDebugMessages = function() {
    Console.debug = function() {
        var context = "PintarJS | " + (new Date()).toLocaleString() + " | DEBUG |>";
        return Function.prototype.bind.call(console.debug || console.log, console, context);
    }();
};

/**
 * Create custom PintarJS error type.
 */
class PintarError extends Error 
{
    constructor(message = "", ...args) {
        Console.error("Exception thrown:", message);
        super(message, ...args);
        this.message = "PintarJS Error: " + message;
    }
}

/**
 * Attach error to console.
 */
Console.Error = PintarError;

// export Console
module.exports = Console;
},{}],4:[function(require,module,exports){
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
const __version__ = "2.0.0.2";
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

},{"./blend_modes":1,"./color":2,"./console":3,"./point":5,"./rectangle":6,"./renderers":10,"./sprite":18,"./text_sprite":19,"./texture":20,"./viewport":21}],5:[function(require,module,exports){
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

// export Point
module.exports = Point;
},{}],6:[function(require,module,exports){
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
     * Check if equal to another rect.
     * @param {PintarJS.Rectangle} other Other rectangle to compare to.
     */
    equals(other)
    {
        return other && this.x == other.x && this.y == other.y && this.width == other.width && this.height == other.height;
    }
}

// export Rect
module.exports = Rectangle;
},{"./point":5}],7:[function(require,module,exports){
/**
 * file: renderable.js
 * description: A renderable object base class.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";


/**
 * A base renderable object.
 */
class Renderable
{
    /**
     * Create the Renderable.
     */
    constructor(position, color, blendMode)
    {
        this.position = position.clone();
        this.color = color.clone();
        this.blendMode = blendMode;
    }

    /**
     * Get alpha / opacity.
     */
    get alpha()
    {
        return this.color.a;
    }

    /**
     * Set alpha / opacity.
     */
    set alpha(val)
    {
        this.color.a = val;
    }

    /**
     * Copy base properties from self to target.
     */
    _copyBasics(target)
    {
        target.position = this.position.clone();
        target.color = this.color.clone();
        target.blendMode = this.blendMode;
    }
}

// export Renderable class
module.exports = Renderable;
},{}],8:[function(require,module,exports){
/**
 * file: canvas.js
 * description: Implement canvas renderer.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";
const Renderer = require('./../renderer');
const PintarConsole = require('./../../console');
const Rectangle = require('./../../rectangle');
const BlendModes = require('./../../blend_modes');
const Point = require('./../../point');
const Viewport = require('./../../viewport');
const TextSprite = require('./../../text_sprite');

/**
 * Implement the built-in canvas renderer.
 */
class CanvasRenderer extends Renderer
{
    /**
     * Init renderer.
     */
    _init(canvas)
    {
        PintarConsole.debug("Initialize canvas renderer..");

        // store canvas and get context
        this._canvas = canvas;
        this._ctx = canvas.getContext('2d');
        if (!this._ctx) {
            throw new PintarConsole.Error("Canvas API is not supported or canvas is already used with a different context!");
        }

        // set default viewport
        this.setViewport(null);

        PintarConsole.debug("Canvas renderer ready!");
    }
    
    /**
     * Start a rendering frame.
     */
    startFrame()
    {
        // update viewport clipping
        this.setViewport(this._viewport);
    }

    /**
     * End a rendering frame.
     */
    endFrame()
    {
        this._currFont = "null";
    }

    /**
     * Clear screen or part of it.
     */
    clear(color, rect)
    {
        // default rect
        rect = rect || new Rectangle(0, 0, this._canvas.width, this._canvas.height);

        // clear to color
        if (color && !color.isTransparentBlack)
        {
            this._ctx.fillStyle = color.asHex();
            this._ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
        }
        // clear to transparent
        else
        {
            this._ctx.clearRect(rect.x, rect.y, rect.width, rect.height);
        }
    }

    /**
     * Set viewport
     */
    setViewport(viewport)
    {
        if (viewport) {
            var drawingRegion = viewport.drawingRegion || new Rectangle(0, 0, this._canvas.width, this._canvas.height);
            this._ctx.beginPath();
            this._ctx.rect(drawingRegion.x, drawingRegion.y, drawingRegion.width, drawingRegion.height);
            this._ctx.clip();
            this._lastViewportRegion = drawingRegion.clone();
            this._viewport = viewport;
        }
        else {
            this._ctx.rect(0, 0, this._canvas.width, this._canvas.height);
            this._ctx.clip();
            this._viewport = new Viewport(Point.zero(), null);
        }
    }

    /**
     * Set drawing blend mode.
     * @param {PintarJS.blendMode} blendMode Blend mode to set.
     */
    _setBlendMode(blendMode) 
    {
        if (this._lastBlendMode !== blendMode) {
            switch (blendMode) 
            {
                case BlendModes.AlphaBlend:
                    this._ctx.globalCompositeOperation = "source-over";
                    break;

                case BlendModes.Opaque:
                    this._ctx.globalCompositeOperation = "source-over";
                    break;
                    
                case BlendModes.Additive:
                    this._ctx.globalCompositeOperation = "lighter";
                    break;

                case BlendModes.Multiply:
                    this._ctx.globalCompositeOperation = "multiply";
                    break;

                case BlendModes.Screen:
                    this._ctx.globalCompositeOperation = "screen";
                    break;

                case BlendModes.Overlay:
                    this._ctx.globalCompositeOperation = "overlay";
                    break;

                case BlendModes.Subtract:
                    this._ctx.globalCompositeOperation = "difference";
                    break;

                case BlendModes.DestIn: // while 'destination-in' is supported with canvas, it covers the whole screen (unlike with webgl) so we disable it
                    this._ctx.globalCompositeOperation = "source-over";
                    break;

                case BlendModes.DestOut:
                    this._ctx.globalCompositeOperation = "destination-out";
                    break;
                        
                default:
                    this._ctx.globalCompositeOperation = "source-over";
                    break;
            }

            this._lastBlendMode = blendMode;
        }
    }

    /**
     * Draw text.
     * For more info check out renderer.js.
     */
    drawText(textSprite)
    {  
        // set font and alignment
        var newFont = textSprite.fontPropertyAsString;
        if (this._currFont !== newFont) 
        {
            this._ctx.font = newFont;
            this._currFont = newFont;
        }

        // save ctx before drawing
        this._ctx.save();

        // set blend mode
        this._setBlendMode(textSprite.blendMode);

        // set alignment
        this._ctx.textAlign = textSprite.alignment;

        // get position x and y
        var posX = Math.round(textSprite.position.x - this._viewport.offset.x);
        var posY = Math.round(textSprite.position.y - this._viewport.offset.y);

        // get lines and data
        var linesWithData = textSprite.getProcessedTextAndCommands();
        var lineHeight = textSprite.calculatedLineHeight;
        
        // apply line-height based offset
        if (textSprite.lineHeightOffsetFactor) {
            posY += textSprite.lineHeightOffsetFactor * textSprite.calculatedLineHeight;
        }

        // draw stroke
        if (textSprite.strokeWidth) 
        {
            this._ctx.strokeStyle = textSprite.strokeColor.asHex();
            this._ctx.lineWidth = textSprite.strokeWidth;
            for (var i = 0; i < linesWithData.length; ++i) 
            {
                var line = linesWithData[i].text;
                this._ctx.strokeText(line, posX, posY + i * lineHeight);
            }
        }

        // draw text fill
        if (textSprite.color.a) 
        {
            this._ctx.fillStyle  = textSprite.color.asHex();
            for (var i = 0; i < linesWithData.length; ++i) 
            {
                this._ctx.fillText(linesWithData[i].text, posX, posY + i * lineHeight);
            }
        }
        
        // restore ctx after drawing
        this._ctx.restore();     
    }

    /**
     * Draw a sprite.
     * For more info check out renderer.js.
     */
    drawSprite(sprite) 
    {       
        // save current context state
        this._ctx.save();

        // set blend mode
        this._setBlendMode(sprite.blendMode);

        // set smoothing
        this._ctx.imageSmoothingEnabled = sprite.smoothingEnabled;

        // set alpha
        this._ctx.globalAlpha = sprite.color.a; 

        var width = sprite.width; 
        var height = sprite.height;
        var originWidth = sprite.origin.x * width;
        var originHeight = sprite.origin.y * height;

        // set brightness
        if (this._lastBrightness !== sprite.brightness) {
            this._ctx.filter = "brightness(" + (sprite.brightness * 100.0) + "%)";
            this._lastBrightness = sprite.brightness;
        }

        // set scale, rotation and skew
        if (sprite.rotationRadians !== 0 || sprite.skew.x !== 0 || sprite.skew.y !== 0 || sprite.scale.x !== 1 || sprite.scale.y !== 1) {

            // apply origin
            var origin = new Point(sprite.position.x , sprite.position.y );
            this._ctx.translate(origin.x, origin.y);

            // apply rotation
            if (sprite.rotationRadians != 0) { this._ctx.rotate(sprite.rotationRadians); }

            // apply skew
            if (sprite.skew.x != 0) { this._ctx.transform(1, 0, Math.tan(sprite.skew.x * 0.85), 1, 0, 0); }
            if (sprite.skew.y != 0) { this._ctx.transform(1, Math.tan(sprite.skew.y * 0.85), 0, 1, 0, 0); }
            
            // set scale
            this._ctx.scale(sprite.scale.x, sprite.scale.y);

            // restore original position
            this._ctx.translate(-origin.x - originWidth, -origin.y - originHeight);
        }

        // draw it
        var srcRect = sprite.sourceRectangle;
        this._ctx.drawImage(sprite.texture.image, 
            srcRect.x, srcRect.y, srcRect.width || sprite.texture.width, srcRect.height || sprite.texture.height, 
            sprite.position.x - this._viewport.offset.x, sprite.position.y - this._viewport.offset.y, 
            width, height);
        
        // restore ctx after drawing
        this._ctx.restore();
    }
}

// export CanvasRenderer
module.exports = CanvasRenderer;
},{"./../../blend_modes":1,"./../../console":3,"./../../point":5,"./../../rectangle":6,"./../../text_sprite":19,"./../../viewport":21,"./../renderer":11}],9:[function(require,module,exports){
/**
 * file: index.js
 * description: Index file for canvas renderer.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";

// export the canvas renderer.
module.exports = require('./canvas')
},{"./canvas":8}],10:[function(require,module,exports){
/**
 * file: index.js
 * description: Index file for renderer types.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";

// export built-in renderers
module.exports = {
    Canvas: require('./canvas'),
    WebGL: require('./webgl'),
    WebGLHybrid: require('./webgl/webgl_hybrid'),
};
},{"./canvas":9,"./webgl":13,"./webgl/webgl_hybrid":16}],11:[function(require,module,exports){
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
},{"./../console":3}],12:[function(require,module,exports){
/**
 * file: webgl.js
 * description: Implement webgl renderer.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";
const Point = require('../../point');
const Rectangle = require('../../rectangle');
const Texture = require('./../../texture');
const PintarConsole = require('./../../console');
const TextSprite = require('./../../text_sprite');


// default ascii characters to generate font textures
const defaultAsciiChars = " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_`abcdefghijklmnopqrstuvwxyz{|}~ ¡¢£¤¥¦§¨©ª«¬­®¯°±²³´µ¶·¸¹º»¼½¾";

// return the closest power-of-two value to a given number
function makePowerTwo(val)
{
    var ret = 2;
    while (ret < val) {
        ret = ret * 2;
        if (ret >= val) { return ret; }
    }
    return ret;
}

// measure font's actual height
var measureTextHeight = TextSprite.measureTextHeight;

// measure font's actual width
var measureTextWidth = TextSprite.measureTextWidth;

/**
 * Class to convert a font and a set of characters into a texture, so it can be later rendered as sprites.
 * This technique is often known as "bitmap font rendering".
 */
class FontTexture
{ 
    /**
     * Create the font texture.
     * @param {String} fontName Font name to create texture for (default to 'Ariel').
     * @param {Number} fontSize Font size to use when creating texture (default to 30). Bigger size = better text quality, but more memory consumption.
     * @param {String} charsSet String with all the characters to generate (default to whole ASCII range). If you try to render a character that's not in this string, it will draw 'missingCharPlaceholder' instead.
     * @param {Number} maxTextureWidth Max texture width (default to 2048). 
     * @param {Char} missingCharPlaceholder Character to use when trying to render a missing character (defaults to '?').
     */
    constructor(fontName, fontSize, charsSet, maxTextureWidth, missingCharPlaceholder) 
    {
        // set default missing char placeholder + store it
        missingCharPlaceholder = (missingCharPlaceholder || '?')[0];
        this._placeholderChar = missingCharPlaceholder;

        // default max texture size
        maxTextureWidth = maxTextureWidth || 2048;

        // default chars set
        charsSet = charsSet || defaultAsciiChars;

        // make sure charSet got the placeholder char
        if (charsSet.indexOf(missingCharPlaceholder) === -1) {
            charsSet += missingCharPlaceholder;
        }

        // store font name and size
        this.fontName = (fontName || 'Ariel');
        this.fontSize = fontSize || 30;
        var margin = {x: 10, y: 10};

        // measure font height
        var fontFullName = this.fontSize.toString() + 'px ' + (fontName || 'Ariel');
        var fontHeight = measureTextHeight(this.fontName, this.fontSize);
        var fontWidth = measureTextWidth(this.fontName, this.fontSize);

        // calc estimated size of a single character in texture
        var estimatedCharSizeInTexture = new Point(fontWidth + margin.x * 2, fontHeight + margin.y * 2);

        // calc texture size
        var charsPerRow = Math.floor(maxTextureWidth / estimatedCharSizeInTexture.x);
        var textureWidth = Math.min(charsSet.length * estimatedCharSizeInTexture.x, maxTextureWidth);
        var textureHeight = Math.ceil(charsSet.length / charsPerRow) * (estimatedCharSizeInTexture.y);

        // make width and height powers of two
        if (FontTexture.enforceValidTexureSize) {
            textureWidth = makePowerTwo(textureWidth);
            textureHeight = makePowerTwo(textureHeight);
        }

        // a dictionary to store the source rect of every character
        this._sourceRects = {};

        // create a canvas to generate the texture on
        var canvas = document.createElement('canvas');
        canvas.width = textureWidth;
        canvas.height = textureHeight;
        var ctx = canvas.getContext('2d');

        // set font and white color
        ctx.font = fontFullName;
        ctx.fillStyle = '#ffffffff';

        PintarConsole.debug("Generate Font Texture:", ctx.font, "Chars set: ", charsSet, " Texture size: ", textureWidth, textureHeight);

        // draw the font texture
        var x = 0; var y = 0;
        for (var i = 0; i < charsSet.length; ++i) {
            
            // get actual width of current character
            var currChar = charsSet[i];
            var currCharWidth = Math.ceil(ctx.measureText(currChar).width);

            // check if need to break line down in texture
            if (x + currCharWidth > textureWidth) {
                y += fontHeight + margin.y;
                x = 0;
            }

            // calc source rect
            var sourceRect = new Rectangle(x, y + fontHeight / 4, currCharWidth, fontHeight);
            this._sourceRects[currChar] = sourceRect;

            // draw character
            ctx.fillText(currChar, x, y + fontHeight);

            // move to next spot in texture
            x += currCharWidth + margin.x;
        }

        // convert canvas to texture
        var img = new Image();
        img.src = canvas.toDataURL("image/png");
        this._texture = new Texture(img, null);
    }

    /**
     * Get texture instance of this font texture.
     */
    get texture()
    {
        return this._texture;
    }

    /**
     * Get the source rect of a character.
     */
    getSourceRect(char)
    {
        return this._sourceRects[char] || this._sourceRects[this._placeholderChar];
    }
}

// should we enforce power of 2?
FontTexture.enforceValidTexureSize = true;

// export the font texture class
module.exports = FontTexture;
},{"../../point":5,"../../rectangle":6,"./../../console":3,"./../../text_sprite":19,"./../../texture":20}],13:[function(require,module,exports){
/**
 * file: index.js
 * description: Index file for webgl renderer.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";

// export the webgl renderer.
module.exports = require('./webgl')
},{"./webgl":15}],14:[function(require,module,exports){
/**
 * file: shaders.js
 * description: Create the basic 2d shaders for rendering with webGL.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";

// vertex shader source:
const vsSource = `
// input position and texture coord
attribute vec2 a_position;
attribute vec2 a_texCoord;

// screen resolution to project quad
uniform vec2 u_resolution;

// to set position, size and texture offset from code
// note: u_size only works if quad is made with 0-1 values
uniform vec2 u_offset;
uniform vec2 u_size;
uniform vec2 u_textureOffset;
uniform vec2 u_textureSize;
uniform vec2 u_rotation;
uniform vec2 u_origin;
uniform vec2 u_skew;

// output texture coord
varying vec2 v_texCoord;

// main vertex shader func
void main() 
{
    // apply size and origin
    vec2 position = (a_position * u_size - u_origin * u_size);

    // apply skew
    position.y += u_skew.y * position.x;
    position.x += u_skew.x * position.y;

    // apply rotation and resolution
    position = (vec2(
        position.x * u_rotation.y + position.y * u_rotation.x,
        position.y * u_rotation.y - position.x * u_rotation.x
    ));

    // convert from pixels into 0-2 values
    vec2 zeroToTwo = (position / u_resolution) * 2.0;

    // convert from 0->2 to -1->+1 (clipspace) and invert position y
    vec2 clipSpace = zeroToTwo - 1.0;
    clipSpace.y *= -1.0;

    // set output position
    gl_Position = vec4(clipSpace + ((u_offset * 2.0) / u_resolution), 0, 1);

    // pass the texCoord to the fragment shader
    // The GPU will interpolate this value between points.
    v_texCoord = a_texCoord * u_textureSize + u_textureOffset;
}
`;

// fragment (pixel) shader source:
const fsSource = `
precision mediump float;

// our texture
uniform sampler2D u_image;

// color tint and enhancer
uniform vec4 u_color;
uniform vec4 u_colorBooster;

// the texCoords passed in from the vertex shader.
varying vec2 v_texCoord;

// main fragment shader func
void main() 
{
   gl_FragColor = clamp(texture2D(u_image, v_texCoord) + u_colorBooster, 0.0, 1.0) * u_color;
   gl_FragColor.rgb *= min(gl_FragColor.a, 1.0);
}
`;

// export the shaders code
module.exports = {
    vertex: vsSource,
    fragment: fsSource
}

},{}],15:[function(require,module,exports){
/**
 * file: webgl.js
 * description: Implement webgl renderer.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";
const Renderer = require('./../renderer');
const PintarConsole = require('./../../console');
const Point = require('./../../point');
const Sprite = require('./../../sprite');
const TextSprite = require('./../../text_sprite');
const BlendModes = require('../../blend_modes');
const Viewport = require('./../../viewport');
const Rectangle = require('./../../rectangle');
const Shaders = require('./shaders');
const FontTexture = require('./font_texture');
const WebglUtils = require('./webgl_utils').webglUtils;


// null image to use when trying to render invalid textures, so we won't get annoying webgl warnings
const nullImg = new Image();
nullImg.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFElEQVQYV2NkYGD4z8DAwMAIYwAAExoCAZK/WvgAAAAASUVORK5CYII=";


/**
 * Implement the built-in webGL renderer.
 */
class WebGlRenderer extends Renderer
{
    /**
     * Init renderer.
     */
    _init(canvas)
    {
        PintarConsole.debug("Initialize WebGL renderer..");

        // store canvas and get webgl2 context
        this._canvas = canvas;
        this._gl = canvas.getContext("webgl2", {premultipliedAlpha: true});

        // if couldn't get webgl2, try webgl 1
        if (!this._gl) {
            PintarConsole.warn("Failed to get WebGL v2, fallback to WebGL v1 instead. Some feature may not be available.");
            canvas.getContext("webgl", {premultipliedAlpha: true})
        }

        // failed to get webgl??
        if (!this._gl) {
            throw new PintarConsole.Error("WebGL is not supported or canvas is already used with a different context!");
        }

        // init shaders and internal stuff
        this._initShadersAndBuffers();

        // dictionary to hold generated font textures + default font size
        this.fontTextureDefaultSize = 100;
        this.smoothText = true;
        this._fontTextures = {};

        // ready!
        PintarConsole.debug("WebGL renderer ready!");
    }

    /**
     * Init shaders and buffers to draw stuff, as well as other defaults.
     */
    _initShadersAndBuffers()
    {
        // just a shortcut..
        var gl = this._gl; 
                
        // setup GLSL program
        var program = WebglUtils.createProgramFromSources(gl, [Shaders.vertex, Shaders.fragment], undefined, undefined, (reason) => {
            throw new PintarConsole.Error(reason);
        });
        this._program = program;

        // look up where the vertex data needs to go.
        var positionLocation = gl.getAttribLocation(program, "a_position");
        var texcoordLocation = gl.getAttribLocation(program, "a_texCoord");

        // Create a buffer to put three 2d clip space points in
        var positionBuffer = gl.createBuffer();

        // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        // disable stuff we don't use
        gl.disable(gl.DEPTH_TEST);
        gl.disable(gl.CULL_FACE);
        gl.disable(gl.STENCIL_TEST);

        // Set a rectangle the same size as the image.  
        var setRectangle = function(gl, x, y, width, height) {
            var x1 = x;
            var x2 = x + width;
            var y1 = y;
            var y2 = y + height;
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
                x1, y1,
                x2, y1,
                x1, y2,
                x2, y2,
            ]), gl.STATIC_DRAW);
        }
        setRectangle(gl, 0, 0, 1, 1);

        // provide texture coordinates for the rectangle.
        var texcoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            0.0,  0.0,
            1.0,  0.0,
            0.0,  1.0,
            1.0,  1.0,
        ]), gl.STATIC_DRAW);

        // Tell it to use our program (pair of shaders)
        gl.useProgram(program);

        // Turn on the position attribute
        gl.enableVertexAttribArray(positionLocation);

        // Bind the position buffer.
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        var size = 2;          // 2 components per iteration
        var type = gl.FLOAT;   // the data is 32bit floats
        var normalize = false; // don't normalize the data
        var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        var offset = 0;        // start at the beginning of the buffer
        gl.vertexAttribPointer(
            positionLocation, size, type, normalize, stride, offset);

        // Turn on the teccord attribute
        gl.enableVertexAttribArray(texcoordLocation);

        // Bind the position buffer.
        gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);

        // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        var size = 2;          // 2 components per iteration
        var type = gl.FLOAT;   // the data is 32bit floats
        var normalize = false; // don't normalize the data
        var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        var offset = 0;        // start at the beginning of the buffer
        gl.vertexAttribPointer(
            texcoordLocation, size, type, normalize, stride, offset);

        // init all shader uniforms
        this._uniforms = {
            offset: gl.getUniformLocation(this._program, "u_offset"),
            size: gl.getUniformLocation(this._program, "u_size"),
            skew: gl.getUniformLocation(this._program, "u_skew"),
            textureOffset: gl.getUniformLocation(this._program, "u_textureOffset"),
            textureSize: gl.getUniformLocation(this._program, "u_textureSize"),
            color: gl.getUniformLocation(this._program, "u_color"),
            colorBooster: gl.getUniformLocation(this._program, "u_colorBooster"),
            rotation: gl.getUniformLocation(this._program, "u_rotation"),
            origin: gl.getUniformLocation(this._program, "u_origin"),
        }

        // set default 'last value' so we'll only update them when needed
        for (var key in this._uniforms) {
            if (this._uniforms.hasOwnProperty(key)) {
                this._uniforms[key]._lastVal = {};
            }
        }

        // Update size
        this._onResize();
    }

    /**
     * Called whenever canvas resize to adjust resolution.
     */
    _onResize()
    {
        // set the resolution
        var gl = this._gl;
        var resolutionLocation = gl.getUniformLocation(this._program, "u_resolution");
        gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);
       
        // tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        // store last known size
        this._lastSize = new Point(gl.canvas.width, gl.canvas.height);
    }

    /**
     * Start a rendering frame.
     */
    startFrame()
    {
        // check if need to resize
        if (this._lastSize.x != this._gl.canvas.width || this._lastSize.y != this._gl.canvas.height) 
        {
            this._onResize();
        }

        // clear texture caching
        this._currTexture = null;
        this._lastBlend = null;
        this._smoothing = null;
    }

    /**
     * End a rendering frame.
     */
    endFrame()
    {
    }

    /**
     * Clear screen or part of it.
     * For more info check out renderer.js.
     */
    clear(color, rect)
    {
        // clear whole canvas
        if (!rect) {
            this._gl.clearColor(color.r, color.g, color.b, color.a);
            this._gl.clear(this._gl.COLOR_BUFFER_BIT);
        }
        // clear just a part of canvas based on rect
        else {
            this._gl.enable(this._gl.SCISSOR_TEST);
            this._setScissor(rect);
            this._gl.clearColor(color.r, color.g, color.b, color.a);
            this._gl.clear(this._gl.COLOR_BUFFER_BIT);
            this._gl.disable(this._gl.SCISSOR_TEST);
        }

        // restore viewport
        this.setViewport(this._viewport);
    }

    /**
     * Generate a font texture manually, which will be later used when drawing texts with this font.
     * @param {String} fontName Font name to create texture for (default to 'Ariel').
     * @param {Number} fontSize Font size to use when creating texture (default to 30). Bigger size = better text quality, but more memory consumption.
     * @param {String} charsSet String with all the characters to generate (default to whole ASCII range). If you try to render a character that's not in this string, it will draw 'missingCharPlaceholder' instead.
     * @param {Number} maxTextureWidth Max texture width (default to 2048). 
     * @param {Char} missingCharPlaceholder Character to use when trying to render a missing character (defaults to '?').
     */
    generateFontTexture(fontName, fontSize, charsSet, maxTextureWidth, missingCharPlaceholder) 
    {
        var ret = new FontTexture(fontName, fontSize, charsSet, maxTextureWidth, missingCharPlaceholder);
        this._fontTextures[fontName] = ret;
        return ret;
    }

    /**
     * Get or create a font texture.
     */
    _getOrCreateFontTexture(fontName)
    {
        if (!this._fontTextures[fontName]) {
            this.generateFontTexture(fontName, this.fontTextureDefaultSize);
        }
        return this._fontTextures[fontName];
    }
    
    /**
     * Set viewport.
     */
    setViewport(viewport)
    {   
        if (viewport) {
            var rect = viewport.drawingRegion || new Rectangle(0, 0, this._canvas.width, this._canvas.height);
            this._setScissor(rect);
            this._gl.enable(this._gl.SCISSOR_TEST);
            this._viewport = viewport;
        }
        else {
            this._gl.disable(this._gl.SCISSOR_TEST);
            this._viewport = new Viewport(Point.zero(), null);
        }
    }

    /**
     * Set scissors region.
     */
    _setScissor(rect)
    {
        this._gl.scissor(rect.x, this._canvas.height - rect.y - rect.height, rect.width, rect.height);
    }

    /**
     * Draw text.
     * For more info check out renderer.js.
     */
    drawText(textSprite)
    {
        // get font texture to use
        var fontTexture = this._getOrCreateFontTexture(textSprite.font);

        // create sprite to draw
        var sprite = new Sprite(fontTexture.texture);
        
        // style properties
        var fillColor = null;
        var strokeWidth = null;
        var strokeColor = null;

        // calc ratio between font texture and text sprite size
        var ratio = (textSprite.fontSize / fontTexture.fontSize);

        // get text lines and style commands
        var lines = textSprite.getProcessedTextAndCommands();

        // method to draw text - prepare all params and just wait for the actual drawing, which is via a function
        var drawText = (drawSpriteMethod) => 
        {
            // iterate lines
            for (var i = 0; i < lines.length; ++i) 
            {
                // get current line data
                var line = lines[i];

                // calc offset based on alignment
                var lineWidth = line.totalWidth;
                var offset = 0;
                switch (textSprite.alignment) 
                {
                    case "right":
                        offset -= lineWidth;
                        break;

                    case "center":
                        offset -= lineWidth / 2;
                        break;
                }

                // now actually draw characters
                // note: take text length + 1 to capture style command in end of lines
                for (var j = 0; j < line.text.length + 1; ++j) 
                {
                    // check if we reached a style command
                    if (textSprite.useStyleCommands && line.styleCommands[j]) 
                    {
                        var styleCommands = line.styleCommands[j];
                        for (var _x = 0; _x < styleCommands.length; ++ _x) 
                        {
                            var styleCommand = styleCommands[_x];
                            switch (styleCommand.type)
                            {
                                case "reset":
                                    fillColor = strokeWidth = strokeColor = null;
                                    break;

                                case "fc":
                                    fillColor = styleCommand.val;
                                    break;
                                
                                case "sc":
                                    strokeColor = styleCommand.val;
                                    break;

                                case "sw":
                                    strokeWidth = styleCommand.val;
                                    break;
                            }
                        }
                    }

                    // check if should finish line
                    if (j >= line.text.length) {
                        break;
                    }

                    // get current character
                    var char = line.text[j];

                    // get source rect and size
                    var srcRect = fontTexture.getSourceRect(char);
                    var size = line.sizes[j];

                    // set starting properties
                    if (fillColor === null) { fillColor = textSprite.color; }
                    if (strokeWidth === null) { strokeWidth = textSprite.strokeWidth; }
                    if (strokeColor === null) { strokeColor = textSprite.strokeColor; }

                    // set sprite params
                    sprite.sourceRectangle = srcRect;
                    var posX = textSprite.position.x + offset;
                    var posY = textSprite.position.y + ((i - 0.75) * textSprite.calculatedLineHeight);
                    var position = new Point(posX, posY);
                    sprite.width = size.base.x;
                    sprite.height = size.base.y;
                    sprite.smoothingEnabled = this.smoothText;

                    // apply line-height based offset
                    if (textSprite.lineHeightOffsetFactor) {
                        position.y += textSprite.lineHeightOffsetFactor * textSprite.calculatedLineHeight;
                    }

                    // set sprite position
                    sprite.position.set(position.x, position.y);

                    // actually draw sprite
                    drawSpriteMethod(sprite, position, fillColor, strokeWidth, strokeColor);

                    // update offset
                    offset += size.absoluteDistance.x - 1 * ratio;
                }
            }
        };

        // draw strokes
        drawText((sprite, position, fillColor, strokeWidth, strokeColor) => 
        {
            // get width and height
            var width = sprite.width;
            var height = sprite.height;

            // draw character stroke
            if (strokeWidth > 0 && strokeColor.a > 0) 
            {
                sprite.color = strokeColor;
                for (var sx = -1; sx <= 1; sx++) 
                {
                    for (var sy = -1; sy <= 1; sy++) 
                    {      
                        var centerPart = sx == 0 && sy == 0;
                        var extraWidth = (centerPart ? strokeWidth : 0);
                        var extraHeight = (centerPart ? strokeWidth : 0);
                        sprite.width = width + extraWidth;
                        sprite.height = height + extraHeight;
                        sprite.position.x = position.x + sx * (strokeWidth / 2.5) - extraWidth / 2;
                        sprite.position.y = position.y + sy * (strokeWidth / 2.5) - extraHeight / 2;
                        this.drawSprite(sprite);
                    }   
                }
            }
        });

        // draw text fill
        drawText((sprite, position, fillColor, strokeWidth, strokeColor) => 
        {
            sprite.color = fillColor;
            this.drawSprite(sprite);
        });
    }

    /**
     * Set uniform vec2 value with check if changed.
     */
    _setUniform2(uniform, x, y)
    {
        // only update if values changed
        if (uniform._lastVal.x !== x || uniform._lastVal.y !== y) {
        
            // update cached values
            uniform._lastVal.x = x; 
            uniform._lastVal.y = y;

            // set values
            this._gl.uniform2f(uniform, x, y);
        }
    }

    /**
     * Set uniform vec4 value with check if changed.
     */
    _setUniform4(uniform, x, y, z, w)
    {
        // only update if values changed
        if (uniform._lastVal.x !== x || uniform._lastVal.y !== y || uniform._lastVal.z !== z || uniform._lastVal.w !== w) {
        
            // update cached values
            uniform._lastVal.x = x; 
            uniform._lastVal.y = y;
            uniform._lastVal.z = z;
            uniform._lastVal.w = w;

            // set values
            this._gl.uniform4f(uniform, x, y, z, w);
        }
    }

    /**
     * Set uniform image with check if changed.
     * @param {Texture} texture Texture instance.
     * @param {Number} textureMode Should be either gl.RGBA, gl.RGB or gl.LUMINANCE.
     */
    _setTexture(texture, textureMode)
    {
        var gl = this._gl;

        // get image from texture
        var img = texture.image;

        // if first call, generate gl textures dict
        texture._glTextures = texture._glTextures || {};

        // only update if texture or mode changed
        if ((this._currTexture !== texture) || (this._currTextureMode !== textureMode)) 
        {
            // reset smoothing so we'll set texture params again
            this._smoothing = null;

            // update cached values
            this._currTextureMode = textureMode;
            this._currTexture = texture;
            
            // create a gl texture, if needed (happens once per texture and mode).
            if (!texture._glTextures[textureMode] && img.width && img.height && img.complete) {
                var gltexture = gl.createTexture();
                if (!gltexture) {throw new PintarConsole.Error("Invalid texture! Internal error?");}
                gl.bindTexture(gl.TEXTURE_2D, gltexture);
                gl.texImage2D(gl.TEXTURE_2D, 0, textureMode, img.width, img.height, 0, textureMode, gl.UNSIGNED_BYTE, img);
                gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
                gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );
                texture._glTextures[textureMode] = gltexture;
            }
            // if already got a gl texture, just bind to existing texture
            else {
                var gltexture = texture._glTextures[textureMode];
                gl.bindTexture(gl.TEXTURE_2D, gltexture);
            }
        }
    }

    /**
     * Set uniform image with check if changed.
     */
    _setSmoothingEnabled(smoothing)
    {    
        // if values didn't change, stop here
        if (this._smoothing === smoothing) { return; }
        
        // update cached values
        this._smoothing = smoothing;

        // set values
        var gl = this._gl;
        if (smoothing) {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        } 
        else {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        }
    }

    /**
     * Set blend mode before drawing.
     * @param {PintarJS.BlendModes} blendMode New blend mode to set.
     */
    _setBlendMode(blendMode)
    {
        if (this._lastBlend !== blendMode) {

            // get gl context and set defaults
            var gl = this._gl;
            gl.enable(gl.BLEND);
            gl.blendEquation(gl.FUNC_ADD);

            switch (blendMode) 
            {
                case BlendModes.AlphaBlend:
                    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
                    break;

                case BlendModes.Opaque:
                    gl.disable(gl.BLEND);
                    break;

                case BlendModes.Additive:
                    gl.blendFunc(gl.ONE, gl.ONE);
                    break;
                    
                case BlendModes.Multiply:
                    gl.blendFuncSeparate(gl.DST_COLOR, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
                    break;

                case BlendModes.Screen:
                    gl.blendFuncSeparate(gl.ONE, gl.ONE_MINUS_SRC_COLOR, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
                    break;

                case BlendModes.Subtract:
                    gl.blendFuncSeparate(gl.ONE, gl.ONE, gl.ONE, gl.ONE);
                    gl.blendEquationSeparate(gl.FUNC_REVERSE_SUBTRACT, gl.FUNC_ADD);
                    break;

                case BlendModes.Overlay:
                    if (gl.MAX) {
                        gl.blendEquation(gl.MAX);
                        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
                    } else {
                        gl.blendFunc(gl.ONE, gl.ONE);
                    }
                    break;

                case BlendModes.DestIn:
                    gl.blendFunc(gl.ZERO, gl.SRC_ALPHA);
                    break;

                case BlendModes.DestOut:
                    gl.blendFunc(gl.ZERO, gl.ONE_MINUS_SRC_ALPHA);
                    break;

                default:
                    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
                    break;
            }

            // store last blend mode
            this._lastBlend = blendMode;
        }
    }

    /**
     * Calculate texture mode for a given sprite.
     */
    _calcTextureMode(sprite)
    {
        // by default its rgba
        var textMode = this._gl.RGBA;

        // get if opaque or greyscale
        var opaque = sprite.blendMode == BlendModes.Opaque;
        var greyscale = sprite.greyscale;

        // opaque and greyscale?
        if (opaque && greyscale) {
            textMode = this._gl.LUMINANCE;
        }
        // opaque?
        else if (opaque) {
            textMode = this._gl.RGB;
        }
        // greyscale?
        else if (greyscale) {
            textMode = this._gl.LUMINANCE_ALPHA;
        }

        // return texture mode
        return textMode;
    }

    /**
     * Draw a sprite.
     * For more info check out renderer.js.
     */
    drawSprite(sprite) 
    {
        // if texture is not yet ready, don't render
        if (!sprite.texture.isReady) { return; }

        // set texture
        var textureMode = this._calcTextureMode(sprite);
        this._setTexture(sprite.texture, textureMode);

        // set position and size
        this._gl.uniform2f(this._uniforms.offset, sprite.position.x - this._viewport.offset.x, -sprite.position.y + this._viewport.offset.y);
        this._setUniform2(this._uniforms.size, sprite.width * sprite.scale.x, sprite.height * sprite.scale.y);
        
        // set source rect
        var srcRect = sprite.sourceRectangleRelative;
        this._setUniform2(this._uniforms.textureOffset, srcRect.x, srcRect.y);
        this._setUniform2(this._uniforms.textureSize, srcRect.width, srcRect.height); 

        // set color
        this._setUniform4(this._uniforms.color, sprite.color.r * sprite.brightness, sprite.color.g * sprite.brightness, sprite.color.b * sprite.brightness, sprite.color.a);
        this._setUniform4(this._uniforms.colorBooster, sprite.colorBoost.r, sprite.colorBoost.g, sprite.colorBoost.b, sprite.colorBoost.a);
        
        // set skew
        this._setUniform2(this._uniforms.skew, sprite.skew.x, sprite.skew.y);

        // set rotation
        var rotation = sprite.rotationVector;
        this._setUniform2(this._uniforms.rotation, rotation.x, rotation.y)

        // set origin
        this._setUniform2(this._uniforms.origin, sprite.origin.x, sprite.origin.y)

        // set smoothing mode
        this._setSmoothingEnabled(sprite.smoothingEnabled);

        // set blend mode
        this._setBlendMode(sprite.blendMode);

        // draw the textured quad.
        this._gl.drawArrays(this._gl.TRIANGLE_STRIP, 0, 4);
    }
}

// export WebGlRenderer
module.exports = WebGlRenderer;
},{"../../blend_modes":1,"./../../console":3,"./../../point":5,"./../../rectangle":6,"./../../sprite":18,"./../../text_sprite":19,"./../../viewport":21,"./../renderer":11,"./font_texture":12,"./shaders":14,"./webgl_utils":17}],16:[function(require,module,exports){
/**
 * file: webgl.js
 * description: Implement webgl renderer.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";
const WebGlBase = require('./webgl');
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
},{"../../color":2,"../../console":3,"../canvas":9,"./webgl":15}],17:[function(require,module,exports){
/*
 * Copyright 2012, Gregg Tavares.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Gregg Tavares. nor the names of his
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
 
 // SOURCE: https://webglfundamentals.org

 (function(root, factory) {  // eslint-disable-line
    if (typeof define === 'function' && define.amd) {
      // AMD. Register as an anonymous module.
      define([], function() {
        return factory.call(root);
      });
    } else {
      // Browser globals
      root.webglUtils = factory.call(root);
    }
  }(this, function() {
    "use strict";
  
    var topWindow = this;
  
    /** @module webgl-utils */
  
    function isInIFrame(w) {
      w = w || topWindow;
      return w !== w.top;
    }
  
    if (!isInIFrame()) {
      console.log("%c%s", 'color:blue;font-weight:bold;', 'for more about webgl-utils.js see:');  // eslint-disable-line
      console.log("%c%s", 'color:blue;font-weight:bold;', 'http://webglfundamentals.org/webgl/lessons/webgl-boilerplate.html');  // eslint-disable-line
    }
  
    /**
     * Wrapped logging function.
     * @param {string} msg The message to log.
     */
    function error(msg) {
      if (topWindow.console) {
        if (topWindow.console.error) {
          topWindow.console.error(msg);
        } else if (topWindow.console.log) {
          topWindow.console.log(msg);
        }
      }
    }
  
  
    /**
     * Error Callback
     * @callback ErrorCallback
     * @param {string} msg error message.
     * @memberOf module:webgl-utils
     */
  
  
    /**
     * Loads a shader.
     * @param {WebGLRenderingContext} gl The WebGLRenderingContext to use.
     * @param {string} shaderSource The shader source.
     * @param {number} shaderType The type of shader.
     * @param {module:webgl-utils.ErrorCallback} opt_errorCallback callback for errors.
     * @return {WebGLShader} The created shader.
     */
    function loadShader(gl, shaderSource, shaderType, opt_errorCallback) {
      var errFn = opt_errorCallback || error;
      // Create the shader object
      var shader = gl.createShader(shaderType);
  
      // Load the shader source
      gl.shaderSource(shader, shaderSource);
  
      // Compile the shader
      gl.compileShader(shader);
  
      // Check the compile status
      var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
      if (!compiled) {
        // Something went wrong during compilation; get the error
        var lastError = gl.getShaderInfoLog(shader);
        errFn("*** Error compiling shader '" + shader + "':" + lastError);
        gl.deleteShader(shader);
        return null;
      }
  
      return shader;
    }
  
    /**
     * Creates a program, attaches shaders, binds attrib locations, links the
     * program and calls useProgram.
     * @param {WebGLShader[]} shaders The shaders to attach
     * @param {string[]} [opt_attribs] An array of attribs names. Locations will be assigned by index if not passed in
     * @param {number[]} [opt_locations] The locations for the. A parallel array to opt_attribs letting you assign locations.
     * @param {module:webgl-utils.ErrorCallback} opt_errorCallback callback for errors. By default it just prints an error to the console
     *        on error. If you want something else pass an callback. It's passed an error message.
     * @memberOf module:webgl-utils
     */
    function createProgram(
        gl, shaders, opt_attribs, opt_locations, opt_errorCallback) {
      var errFn = opt_errorCallback || error;
      var program = gl.createProgram();
      shaders.forEach(function(shader) {
        gl.attachShader(program, shader);
      });
      if (opt_attribs) {
        opt_attribs.forEach(function(attrib, ndx) {
          gl.bindAttribLocation(
              program,
              opt_locations ? opt_locations[ndx] : ndx,
              attrib);
        });
      }
      gl.linkProgram(program);
  
      // Check the link status
      var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
      if (!linked) {
          // something went wrong with the link
          var lastError = gl.getProgramInfoLog(program);
          errFn("Error in program linking:" + lastError);
  
          gl.deleteProgram(program);
          return null;
      }
      return program;
    }
  
    /**
     * Loads a shader from a script tag.
     * @param {WebGLRenderingContext} gl The WebGLRenderingContext to use.
     * @param {string} scriptId The id of the script tag.
     * @param {number} opt_shaderType The type of shader. If not passed in it will
     *     be derived from the type of the script tag.
     * @param {module:webgl-utils.ErrorCallback} opt_errorCallback callback for errors.
     * @return {WebGLShader} The created shader.
     */
    function createShaderFromScript(
        gl, scriptId, opt_shaderType, opt_errorCallback) {
      var shaderSource = "";
      var shaderType;
      var shaderScript = document.getElementById(scriptId);
      if (!shaderScript) {
        throw ("*** Error: unknown script element" + scriptId);
      }
      shaderSource = shaderScript.text;
  
      if (!opt_shaderType) {
        if (shaderScript.type === "x-shader/x-vertex") {
          shaderType = gl.VERTEX_SHADER;
        } else if (shaderScript.type === "x-shader/x-fragment") {
          shaderType = gl.FRAGMENT_SHADER;
        } else if (shaderType !== gl.VERTEX_SHADER && shaderType !== gl.FRAGMENT_SHADER) {
          throw ("*** Error: unknown shader type");
        }
      }
  
      return loadShader(
          gl, shaderSource, opt_shaderType ? opt_shaderType : shaderType,
          opt_errorCallback);
    }
  
    var defaultShaderType = [
      "VERTEX_SHADER",
      "FRAGMENT_SHADER",
    ];
  
    /**
     * Creates a program from 2 script tags.
     *
     * @param {WebGLRenderingContext} gl The WebGLRenderingContext
     *        to use.
     * @param {string[]} shaderScriptIds Array of ids of the script
     *        tags for the shaders. The first is assumed to be the
     *        vertex shader, the second the fragment shader.
     * @param {string[]} [opt_attribs] An array of attribs names. Locations will be assigned by index if not passed in
     * @param {number[]} [opt_locations] The locations for the. A parallel array to opt_attribs letting you assign locations.
     * @param {module:webgl-utils.ErrorCallback} opt_errorCallback callback for errors. By default it just prints an error to the console
     *        on error. If you want something else pass an callback. It's passed an error message.
     * @return {WebGLProgram} The created program.
     * @memberOf module:webgl-utils
     */
    function createProgramFromScripts(
        gl, shaderScriptIds, opt_attribs, opt_locations, opt_errorCallback) {
      var shaders = [];
      for (var ii = 0; ii < shaderScriptIds.length; ++ii) {
        shaders.push(createShaderFromScript(
            gl, shaderScriptIds[ii], gl[defaultShaderType[ii]], opt_errorCallback));
      }
      return createProgram(gl, shaders, opt_attribs, opt_locations, opt_errorCallback);
    }
  
    /**
     * Creates a program from 2 sources.
     *
     * @param {WebGLRenderingContext} gl The WebGLRenderingContext
     *        to use.
     * @param {string[]} shaderSourcess Array of sources for the
     *        shaders. The first is assumed to be the vertex shader,
     *        the second the fragment shader.
     * @param {string[]} [opt_attribs] An array of attribs names. Locations will be assigned by index if not passed in
     * @param {number[]} [opt_locations] The locations for the. A parallel array to opt_attribs letting you assign locations.
     * @param {module:webgl-utils.ErrorCallback} opt_errorCallback callback for errors. By default it just prints an error to the console
     *        on error. If you want something else pass an callback. It's passed an error message.
     * @return {WebGLProgram} The created program.
     * @memberOf module:webgl-utils
     */
    function createProgramFromSources(
        gl, shaderSources, opt_attribs, opt_locations, opt_errorCallback) {
      var shaders = [];
      for (var ii = 0; ii < shaderSources.length; ++ii) {
        shaders.push(loadShader(
            gl, shaderSources[ii], gl[defaultShaderType[ii]], opt_errorCallback));
      }
      return createProgram(gl, shaders, opt_attribs, opt_locations, opt_errorCallback);
    }
  
    /**
     * Returns the corresponding bind point for a given sampler type
     */
    function getBindPointForSamplerType(gl, type) {
      if (type === gl.SAMPLER_2D)   return gl.TEXTURE_2D;        // eslint-disable-line
      if (type === gl.SAMPLER_CUBE) return gl.TEXTURE_CUBE_MAP;  // eslint-disable-line
      return undefined;
    }
  
    /**
     * @typedef {Object.<string, function>} Setters
     */
  
    /**
     * Creates setter functions for all uniforms of a shader
     * program.
     *
     * @see {@link module:webgl-utils.setUniforms}
     *
     * @param {WebGLProgram} program the program to create setters for.
     * @returns {Object.<string, function>} an object with a setter by name for each uniform
     * @memberOf module:webgl-utils
     */
    function createUniformSetters(gl, program) {
      var textureUnit = 0;
  
      /**
       * Creates a setter for a uniform of the given program with it's
       * location embedded in the setter.
       * @param {WebGLProgram} program
       * @param {WebGLUniformInfo} uniformInfo
       * @returns {function} the created setter.
       */
      function createUniformSetter(program, uniformInfo) {
        var location = gl.getUniformLocation(program, uniformInfo.name);
        var type = uniformInfo.type;
        // Check if this uniform is an array
        var isArray = (uniformInfo.size > 1 && uniformInfo.name.substr(-3) === "[0]");
        if (type === gl.FLOAT && isArray) {
          return function(v) {
            gl.uniform1fv(location, v);
          };
        }
        if (type === gl.FLOAT) {
          return function(v) {
            gl.uniform1f(location, v);
          };
        }
        if (type === gl.FLOAT_VEC2) {
          return function(v) {
            gl.uniform2fv(location, v);
          };
        }
        if (type === gl.FLOAT_VEC3) {
          return function(v) {
            gl.uniform3fv(location, v);
          };
        }
        if (type === gl.FLOAT_VEC4) {
          return function(v) {
            gl.uniform4fv(location, v);
          };
        }
        if (type === gl.INT && isArray) {
          return function(v) {
            gl.uniform1iv(location, v);
          };
        }
        if (type === gl.INT) {
          return function(v) {
            gl.uniform1i(location, v);
          };
        }
        if (type === gl.INT_VEC2) {
          return function(v) {
            gl.uniform2iv(location, v);
          };
        }
        if (type === gl.INT_VEC3) {
          return function(v) {
            gl.uniform3iv(location, v);
          };
        }
        if (type === gl.INT_VEC4) {
          return function(v) {
            gl.uniform4iv(location, v);
          };
        }
        if (type === gl.BOOL) {
          return function(v) {
            gl.uniform1iv(location, v);
          };
        }
        if (type === gl.BOOL_VEC2) {
          return function(v) {
            gl.uniform2iv(location, v);
          };
        }
        if (type === gl.BOOL_VEC3) {
          return function(v) {
            gl.uniform3iv(location, v);
          };
        }
        if (type === gl.BOOL_VEC4) {
          return function(v) {
            gl.uniform4iv(location, v);
          };
        }
        if (type === gl.FLOAT_MAT2) {
          return function(v) {
            gl.uniformMatrix2fv(location, false, v);
          };
        }
        if (type === gl.FLOAT_MAT3) {
          return function(v) {
            gl.uniformMatrix3fv(location, false, v);
          };
        }
        if (type === gl.FLOAT_MAT4) {
          return function(v) {
            gl.uniformMatrix4fv(location, false, v);
          };
        }
        if ((type === gl.SAMPLER_2D || type === gl.SAMPLER_CUBE) && isArray) {
          var units = [];
          for (var ii = 0; ii < info.size; ++ii) {
            units.push(textureUnit++);
          }
          return function(bindPoint, units) {
            return function(textures) {
              gl.uniform1iv(location, units);
              textures.forEach(function(texture, index) {
                gl.activeTexture(gl.TEXTURE0 + units[index]);
                gl.bindTexture(bindPoint, texture);
              });
            };
          }(getBindPointForSamplerType(gl, type), units);
        }
        if (type === gl.SAMPLER_2D || type === gl.SAMPLER_CUBE) {
          return function(bindPoint, unit) {
            return function(texture) {
              gl.uniform1i(location, unit);
              gl.activeTexture(gl.TEXTURE0 + unit);
              gl.bindTexture(bindPoint, texture);
            };
          }(getBindPointForSamplerType(gl, type), textureUnit++);
        }
        throw ("unknown type: 0x" + type.toString(16)); // we should never get here.
      }
  
      var uniformSetters = { };
      var numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  
      for (var ii = 0; ii < numUniforms; ++ii) {
        var uniformInfo = gl.getActiveUniform(program, ii);
        if (!uniformInfo) {
          break;
        }
        var name = uniformInfo.name;
        // remove the array suffix.
        if (name.substr(-3) === "[0]") {
          name = name.substr(0, name.length - 3);
        }
        var setter = createUniformSetter(program, uniformInfo);
        uniformSetters[name] = setter;
      }
      return uniformSetters;
    }
  
    /**
     * Set uniforms and binds related textures.
     *
     * example:
     *
     *     var programInfo = createProgramInfo(
     *         gl, ["some-vs", "some-fs");
     *
     *     var tex1 = gl.createTexture();
     *     var tex2 = gl.createTexture();
     *
     *     ... assume we setup the textures with data ...
     *
     *     var uniforms = {
     *       u_someSampler: tex1,
     *       u_someOtherSampler: tex2,
     *       u_someColor: [1,0,0,1],
     *       u_somePosition: [0,1,1],
     *       u_someMatrix: [
     *         1,0,0,0,
     *         0,1,0,0,
     *         0,0,1,0,
     *         0,0,0,0,
     *       ],
     *     };
     *
     *     gl.useProgram(program);
     *
     * This will automatically bind the textures AND set the
     * uniforms.
     *
     *     setUniforms(programInfo.uniformSetters, uniforms);
     *
     * For the example above it is equivalent to
     *
     *     var texUnit = 0;
     *     gl.activeTexture(gl.TEXTURE0 + texUnit);
     *     gl.bindTexture(gl.TEXTURE_2D, tex1);
     *     gl.uniform1i(u_someSamplerLocation, texUnit++);
     *     gl.activeTexture(gl.TEXTURE0 + texUnit);
     *     gl.bindTexture(gl.TEXTURE_2D, tex2);
     *     gl.uniform1i(u_someSamplerLocation, texUnit++);
     *     gl.uniform4fv(u_someColorLocation, [1, 0, 0, 1]);
     *     gl.uniform3fv(u_somePositionLocation, [0, 1, 1]);
     *     gl.uniformMatrix4fv(u_someMatrix, false, [
     *         1,0,0,0,
     *         0,1,0,0,
     *         0,0,1,0,
     *         0,0,0,0,
     *       ]);
     *
     * Note it is perfectly reasonable to call `setUniforms` multiple times. For example
     *
     *     var uniforms = {
     *       u_someSampler: tex1,
     *       u_someOtherSampler: tex2,
     *     };
     *
     *     var moreUniforms {
     *       u_someColor: [1,0,0,1],
     *       u_somePosition: [0,1,1],
     *       u_someMatrix: [
     *         1,0,0,0,
     *         0,1,0,0,
     *         0,0,1,0,
     *         0,0,0,0,
     *       ],
     *     };
     *
     *     setUniforms(programInfo.uniformSetters, uniforms);
     *     setUniforms(programInfo.uniformSetters, moreUniforms);
     *
     * @param {Object.<string, function>|module:webgl-utils.ProgramInfo} setters the setters returned from
     *        `createUniformSetters` or a ProgramInfo from {@link module:webgl-utils.createProgramInfo}.
     * @param {Object.<string, value>} an object with values for the
     *        uniforms.
     * @memberOf module:webgl-utils
     */
    function setUniforms(setters, values) {
      setters = setters.uniformSetters || setters;
      Object.keys(values).forEach(function(name) {
        var setter = setters[name];
        if (setter) {
          setter(values[name]);
        }
      });
    }
  
    /**
     * Creates setter functions for all attributes of a shader
     * program. You can pass this to {@link module:webgl-utils.setBuffersAndAttributes} to set all your buffers and attributes.
     *
     * @see {@link module:webgl-utils.setAttributes} for example
     * @param {WebGLProgram} program the program to create setters for.
     * @return {Object.<string, function>} an object with a setter for each attribute by name.
     * @memberOf module:webgl-utils
     */
    function createAttributeSetters(gl, program) {
      var attribSetters = {
      };
  
      function createAttribSetter(index) {
        return function(b) {
            gl.bindBuffer(gl.ARRAY_BUFFER, b.buffer);
            gl.enableVertexAttribArray(index);
            gl.vertexAttribPointer(
                index, b.numComponents || b.size, b.type || gl.FLOAT, b.normalize || false, b.stride || 0, b.offset || 0);
          };
      }
  
      var numAttribs = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
      for (var ii = 0; ii < numAttribs; ++ii) {
        var attribInfo = gl.getActiveAttrib(program, ii);
        if (!attribInfo) {
          break;
        }
        var index = gl.getAttribLocation(program, attribInfo.name);
        attribSetters[attribInfo.name] = createAttribSetter(index);
      }
  
      return attribSetters;
    }
  
    /**
     * Sets attributes and binds buffers (deprecated... use {@link module:webgl-utils.setBuffersAndAttributes})
     *
     * Example:
     *
     *     var program = createProgramFromScripts(
     *         gl, ["some-vs", "some-fs");
     *
     *     var attribSetters = createAttributeSetters(program);
     *
     *     var positionBuffer = gl.createBuffer();
     *     var texcoordBuffer = gl.createBuffer();
     *
     *     var attribs = {
     *       a_position: {buffer: positionBuffer, numComponents: 3},
     *       a_texcoord: {buffer: texcoordBuffer, numComponents: 2},
     *     };
     *
     *     gl.useProgram(program);
     *
     * This will automatically bind the buffers AND set the
     * attributes.
     *
     *     setAttributes(attribSetters, attribs);
     *
     * Properties of attribs. For each attrib you can add
     * properties:
     *
     * *   type: the type of data in the buffer. Default = gl.FLOAT
     * *   normalize: whether or not to normalize the data. Default = false
     * *   stride: the stride. Default = 0
     * *   offset: offset into the buffer. Default = 0
     *
     * For example if you had 3 value float positions, 2 value
     * float texcoord and 4 value uint8 colors you'd setup your
     * attribs like this
     *
     *     var attribs = {
     *       a_position: {buffer: positionBuffer, numComponents: 3},
     *       a_texcoord: {buffer: texcoordBuffer, numComponents: 2},
     *       a_color: {
     *         buffer: colorBuffer,
     *         numComponents: 4,
     *         type: gl.UNSIGNED_BYTE,
     *         normalize: true,
     *       },
     *     };
     *
     * @param {Object.<string, function>|model:webgl-utils.ProgramInfo} setters Attribute setters as returned from createAttributeSetters or a ProgramInfo as returned {@link module:webgl-utils.createProgramInfo}
     * @param {Object.<string, module:webgl-utils.AttribInfo>} attribs AttribInfos mapped by attribute name.
     * @memberOf module:webgl-utils
     * @deprecated use {@link module:webgl-utils.setBuffersAndAttributes}
     */
    function setAttributes(setters, attribs) {
      setters = setters.attribSetters || setters;
      Object.keys(attribs).forEach(function(name) {
        var setter = setters[name];
        if (setter) {
          setter(attribs[name]);
        }
      });
    }
  
    /**
     * Creates a vertex array object and then sets the attributes
     * on it
     *
     * @param {WebGLRenderingContext} gl The WebGLRenderingContext
     *        to use.
     * @param {Object.<string, function>} setters Attribute setters as returned from createAttributeSetters
     * @param {Object.<string, module:webgl-utils.AttribInfo>} attribs AttribInfos mapped by attribute name.
     * @param {WebGLBuffer} [indices] an optional ELEMENT_ARRAY_BUFFER of indices
     */
    function createVAOAndSetAttributes(gl, setters, attribs, indices) {
      var vao = gl.createVertexArray();
      gl.bindVertexArray(vao);
      setAttributes(setters, attribs);
      if (indices) {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices);
      }
      // We unbind this because otherwise any change to ELEMENT_ARRAY_BUFFER
      // like when creating buffers for other stuff will mess up this VAO's binding
      gl.bindVertexArray(null);
      return vao;
    }
  
    /**
     * Creates a vertex array object and then sets the attributes
     * on it
     *
     * @param {WebGLRenderingContext} gl The WebGLRenderingContext
     *        to use.
     * @param {Object.<string, function>| module:webgl-utils.ProgramInfo} programInfo as returned from createProgramInfo or Attribute setters as returned from createAttributeSetters
     * @param {module:webgl-utils:BufferInfo} bufferInfo BufferInfo as returned from createBufferInfoFromArrays etc...
     * @param {WebGLBuffer} [indices] an optional ELEMENT_ARRAY_BUFFER of indices
     */
    function createVAOFromBufferInfo(gl, programInfo, bufferInfo) {
      return createVAOAndSetAttributes(gl, programInfo.attribSetters || programInfo, bufferInfo.attribs, bufferInfo.indices);
    }
  
    /**
     * @typedef {Object} ProgramInfo
     * @property {WebGLProgram} program A shader program
     * @property {Object<string, function>} uniformSetters: object of setters as returned from createUniformSetters,
     * @property {Object<string, function>} attribSetters: object of setters as returned from createAttribSetters,
     * @memberOf module:webgl-utils
     */
  
    /**
     * Creates a ProgramInfo from 2 sources.
     *
     * A ProgramInfo contains
     *
     *     programInfo = {
     *        program: WebGLProgram,
     *        uniformSetters: object of setters as returned from createUniformSetters,
     *        attribSetters: object of setters as returned from createAttribSetters,
     *     }
     *
     * @param {WebGLRenderingContext} gl The WebGLRenderingContext
     *        to use.
     * @param {string[]} shaderSourcess Array of sources for the
     *        shaders or ids. The first is assumed to be the vertex shader,
     *        the second the fragment shader.
     * @param {string[]} [opt_attribs] An array of attribs names. Locations will be assigned by index if not passed in
     * @param {number[]} [opt_locations] The locations for the. A parallel array to opt_attribs letting you assign locations.
     * @param {module:webgl-utils.ErrorCallback} opt_errorCallback callback for errors. By default it just prints an error to the console
     *        on error. If you want something else pass an callback. It's passed an error message.
     * @return {module:webgl-utils.ProgramInfo} The created program.
     * @memberOf module:webgl-utils
     */
    function createProgramInfo(
        gl, shaderSources, opt_attribs, opt_locations, opt_errorCallback) {
      shaderSources = shaderSources.map(function(source) {
        var script = document.getElementById(source);
        return script ? script.text : source;
      });
      var program = webglUtils.createProgramFromSources(gl, shaderSources, opt_attribs, opt_locations, opt_errorCallback);
      if (!program) {
        return null;
      }
      var uniformSetters = createUniformSetters(gl, program);
      var attribSetters = createAttributeSetters(gl, program);
      return {
        program: program,
        uniformSetters: uniformSetters,
        attribSetters: attribSetters,
      };
    }
  
    /**
     * Sets attributes and buffers including the `ELEMENT_ARRAY_BUFFER` if appropriate
     *
     * Example:
     *
     *     var programInfo = createProgramInfo(
     *         gl, ["some-vs", "some-fs");
     *
     *     var arrays = {
     *       position: { numComponents: 3, data: [0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0], },
     *       texcoord: { numComponents: 2, data: [0, 0, 0, 1, 1, 0, 1, 1],                 },
     *     };
     *
     *     var bufferInfo = createBufferInfoFromArrays(gl, arrays);
     *
     *     gl.useProgram(programInfo.program);
     *
     * This will automatically bind the buffers AND set the
     * attributes.
     *
     *     setBuffersAndAttributes(programInfo.attribSetters, bufferInfo);
     *
     * For the example above it is equivilent to
     *
     *     gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
     *     gl.enableVertexAttribArray(a_positionLocation);
     *     gl.vertexAttribPointer(a_positionLocation, 3, gl.FLOAT, false, 0, 0);
     *     gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
     *     gl.enableVertexAttribArray(a_texcoordLocation);
     *     gl.vertexAttribPointer(a_texcoordLocation, 4, gl.FLOAT, false, 0, 0);
     *
     * @param {WebGLRenderingContext} gl A WebGLRenderingContext.
     * @param {Object.<string, function>} setters Attribute setters as returned from `createAttributeSetters`
     * @param {module:webgl-utils.BufferInfo} buffers a BufferInfo as returned from `createBufferInfoFromArrays`.
     * @memberOf module:webgl-utils
     */
    function setBuffersAndAttributes(gl, setters, buffers) {
      setAttributes(setters, buffers.attribs);
      if (buffers.indices) {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
      }
    }
  
    // Add your prefix here.
    var browserPrefixes = [
      "",
      "MOZ_",
      "OP_",
      "WEBKIT_",
    ];
  
    /**
     * Given an extension name like WEBGL_compressed_texture_s3tc
     * returns the supported version extension, like
     * WEBKIT_WEBGL_compressed_teture_s3tc
     * @param {string} name Name of extension to look for
     * @return {WebGLExtension} The extension or undefined if not
     *     found.
     * @memberOf module:webgl-utils
     */
    function getExtensionWithKnownPrefixes(gl, name) {
      for (var ii = 0; ii < browserPrefixes.length; ++ii) {
        var prefixedName = browserPrefixes[ii] + name;
        var ext = gl.getExtension(prefixedName);
        if (ext) {
          return ext;
        }
      }
      return undefined;
    }
  
    /**
     * Resize a canvas to match the size its displayed.
     * @param {HTMLCanvasElement} canvas The canvas to resize.
     * @param {number} [multiplier] amount to multiply by.
     *    Pass in window.devicePixelRatio for native pixels.
     * @return {boolean} true if the canvas was resized.
     * @memberOf module:webgl-utils
     */
    function resizeCanvasToDisplaySize(canvas, multiplier) {
      multiplier = multiplier || 1;
      var width  = canvas.clientWidth  * multiplier | 0;
      var height = canvas.clientHeight * multiplier | 0;
      if (canvas.width !== width ||  canvas.height !== height) {
        canvas.width  = width;
        canvas.height = height;
        return true;
      }
      return false;
    }
  
    // Add `push` to a typed array. It just keeps a 'cursor'
    // and allows use to `push` values into the array so we
    // don't have to manually compute offsets
    function augmentTypedArray(typedArray, numComponents) {
      var cursor = 0;
      typedArray.push = function() {
        for (var ii = 0; ii < arguments.length; ++ii) {
          var value = arguments[ii];
          if (value instanceof Array || (value.buffer && value.buffer instanceof ArrayBuffer)) {
            for (var jj = 0; jj < value.length; ++jj) {
              typedArray[cursor++] = value[jj];
            }
          } else {
            typedArray[cursor++] = value;
          }
        }
      };
      typedArray.reset = function(opt_index) {
        cursor = opt_index || 0;
      };
      typedArray.numComponents = numComponents;
      Object.defineProperty(typedArray, 'numElements', {
        get: function() {
          return this.length / this.numComponents | 0;
        },
      });
      return typedArray;
    }
  
    /**
     * creates a typed array with a `push` function attached
     * so that you can easily *push* values.
     *
     * `push` can take multiple arguments. If an argument is an array each element
     * of the array will be added to the typed array.
     *
     * Example:
     *
     *     var array = createAugmentedTypedArray(3, 2);  // creates a Float32Array with 6 values
     *     array.push(1, 2, 3);
     *     array.push([4, 5, 6]);
     *     // array now contains [1, 2, 3, 4, 5, 6]
     *
     * Also has `numComponents` and `numElements` properties.
     *
     * @param {number} numComponents number of components
     * @param {number} numElements number of elements. The total size of the array will be `numComponents * numElements`.
     * @param {constructor} opt_type A constructor for the type. Default = `Float32Array`.
     * @return {ArrayBuffer} A typed array.
     * @memberOf module:webgl-utils
     */
    function createAugmentedTypedArray(numComponents, numElements, opt_type) {
      var Type = opt_type || Float32Array;
      return augmentTypedArray(new Type(numComponents * numElements), numComponents);
    }
  
    function createBufferFromTypedArray(gl, array, type, drawType) {
      type = type || gl.ARRAY_BUFFER;
      var buffer = gl.createBuffer();
      gl.bindBuffer(type, buffer);
      gl.bufferData(type, array, drawType || gl.STATIC_DRAW);
      return buffer;
    }
  
    function allButIndices(name) {
      return name !== "indices";
    }
  
    function createMapping(obj) {
      var mapping = {};
      Object.keys(obj).filter(allButIndices).forEach(function(key) {
        mapping["a_" + key] = key;
      });
      return mapping;
    }
  
    function getGLTypeForTypedArray(gl, typedArray) {
      if (typedArray instanceof Int8Array)    { return gl.BYTE; }            // eslint-disable-line
      if (typedArray instanceof Uint8Array)   { return gl.UNSIGNED_BYTE; }   // eslint-disable-line
      if (typedArray instanceof Int16Array)   { return gl.SHORT; }           // eslint-disable-line
      if (typedArray instanceof Uint16Array)  { return gl.UNSIGNED_SHORT; }  // eslint-disable-line
      if (typedArray instanceof Int32Array)   { return gl.INT; }             // eslint-disable-line
      if (typedArray instanceof Uint32Array)  { return gl.UNSIGNED_INT; }    // eslint-disable-line
      if (typedArray instanceof Float32Array) { return gl.FLOAT; }           // eslint-disable-line
      throw "unsupported typed array type";
    }
  
    // This is really just a guess. Though I can't really imagine using
    // anything else? Maybe for some compression?
    function getNormalizationForTypedArray(typedArray) {
      if (typedArray instanceof Int8Array)    { return true; }  // eslint-disable-line
      if (typedArray instanceof Uint8Array)   { return true; }  // eslint-disable-line
      return false;
    }
  
    function isArrayBuffer(a) {
      return a.buffer && a.buffer instanceof ArrayBuffer;
    }
  
    function guessNumComponentsFromName(name, length) {
      var numComponents;
      if (name.indexOf("coord") >= 0) {
        numComponents = 2;
      } else if (name.indexOf("color") >= 0) {
        numComponents = 4;
      } else {
        numComponents = 3;  // position, normals, indices ...
      }
  
      if (length % numComponents > 0) {
        throw "can not guess numComponents. You should specify it.";
      }
  
      return numComponents;
    }
  
    function makeTypedArray(array, name) {
      if (isArrayBuffer(array)) {
        return array;
      }
  
      if (array.data && isArrayBuffer(array.data)) {
        return array.data;
      }
  
      if (Array.isArray(array)) {
        array = {
          data: array,
        };
      }
  
      if (!array.numComponents) {
        array.numComponents = guessNumComponentsFromName(name, array.length);
      }
  
      var type = array.type;
      if (!type) {
        if (name === "indices") {
          type = Uint16Array;
        }
      }
      var typedArray = createAugmentedTypedArray(array.numComponents, array.data.length / array.numComponents | 0, type);
      typedArray.push(array.data);
      return typedArray;
    }
  
    /**
     * @typedef {Object} AttribInfo
     * @property {number} [numComponents] the number of components for this attribute.
     * @property {number} [size] the number of components for this attribute.
     * @property {number} [type] the type of the attribute (eg. `gl.FLOAT`, `gl.UNSIGNED_BYTE`, etc...) Default = `gl.FLOAT`
     * @property {boolean} [normalized] whether or not to normalize the data. Default = false
     * @property {number} [offset] offset into buffer in bytes. Default = 0
     * @property {number} [stride] the stride in bytes per element. Default = 0
     * @property {WebGLBuffer} buffer the buffer that contains the data for this attribute
     * @memberOf module:webgl-utils
     */
  
  
    /**
     * Creates a set of attribute data and WebGLBuffers from set of arrays
     *
     * Given
     *
     *      var arrays = {
     *        position: { numComponents: 3, data: [0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0], },
     *        texcoord: { numComponents: 2, data: [0, 0, 0, 1, 1, 0, 1, 1],                 },
     *        normal:   { numComponents: 3, data: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],     },
     *        color:    { numComponents: 4, data: [255, 255, 255, 255, 255, 0, 0, 255, 0, 0, 255, 255], type: Uint8Array, },
     *        indices:  { numComponents: 3, data: [0, 1, 2, 1, 2, 3],                       },
     *      };
     *
     * returns something like
     *
     *      var attribs = {
     *        a_position: { numComponents: 3, type: gl.FLOAT,         normalize: false, buffer: WebGLBuffer, },
     *        a_texcoord: { numComponents: 2, type: gl.FLOAT,         normalize: false, buffer: WebGLBuffer, },
     *        a_normal:   { numComponents: 3, type: gl.FLOAT,         normalize: false, buffer: WebGLBuffer, },
     *        a_color:    { numComponents: 4, type: gl.UNSIGNED_BYTE, normalize: true,  buffer: WebGLBuffer, },
     *      };
     *
     * @param {WebGLRenderingContext} gl The webgl rendering context.
     * @param {Object.<string, array|typedarray>} arrays The arrays
     * @param {Object.<string, string>} [opt_mapping] mapping from attribute name to array name.
     *     if not specified defaults to "a_name" -> "name".
     * @return {Object.<string, module:webgl-utils.AttribInfo>} the attribs
     * @memberOf module:webgl-utils
     */
    function createAttribsFromArrays(gl, arrays, opt_mapping) {
      var mapping = opt_mapping || createMapping(arrays);
      var attribs = {};
      Object.keys(mapping).forEach(function(attribName) {
        var bufferName = mapping[attribName];
        var origArray = arrays[bufferName];
        var array = makeTypedArray(origArray, bufferName);
        attribs[attribName] = {
          buffer:        createBufferFromTypedArray(gl, array),
          numComponents: origArray.numComponents || array.numComponents || guessNumComponentsFromName(bufferName),
          type:          getGLTypeForTypedArray(gl, array),
          normalize:     getNormalizationForTypedArray(array),
        };
      });
      return attribs;
    }
  
    /**
     * tries to get the number of elements from a set of arrays.
     */
    function getNumElementsFromNonIndexedArrays(arrays) {
      var key = Object.keys(arrays)[0];
      var array = arrays[key];
      if (isArrayBuffer(array)) {
        return array.numElements;
      } else {
        return array.data.length / array.numComponents;
      }
    }
  
    /**
     * @typedef {Object} BufferInfo
     * @property {number} numElements The number of elements to pass to `gl.drawArrays` or `gl.drawElements`.
     * @property {WebGLBuffer} [indices] The indices `ELEMENT_ARRAY_BUFFER` if any indices exist.
     * @property {Object.<string, module:webgl-utils.AttribInfo>} attribs The attribs approriate to call `setAttributes`
     * @memberOf module:webgl-utils
     */
  
  
    /**
     * Creates a BufferInfo from an object of arrays.
     *
     * This can be passed to {@link module:webgl-utils.setBuffersAndAttributes} and to
     * {@link module:webgl-utils:drawBufferInfo}.
     *
     * Given an object like
     *
     *     var arrays = {
     *       position: { numComponents: 3, data: [0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0], },
     *       texcoord: { numComponents: 2, data: [0, 0, 0, 1, 1, 0, 1, 1],                 },
     *       normal:   { numComponents: 3, data: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],     },
     *       indices:  { numComponents: 3, data: [0, 1, 2, 1, 2, 3],                       },
     *     };
     *
     *  Creates an BufferInfo like this
     *
     *     bufferInfo = {
     *       numElements: 4,        // or whatever the number of elements is
     *       indices: WebGLBuffer,  // this property will not exist if there are no indices
     *       attribs: {
     *         a_position: { buffer: WebGLBuffer, numComponents: 3, },
     *         a_normal:   { buffer: WebGLBuffer, numComponents: 3, },
     *         a_texcoord: { buffer: WebGLBuffer, numComponents: 2, },
     *       },
     *     };
     *
     *  The properties of arrays can be JavaScript arrays in which case the number of components
     *  will be guessed.
     *
     *     var arrays = {
     *        position: [0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0],
     *        texcoord: [0, 0, 0, 1, 1, 0, 1, 1],
     *        normal:   [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
     *        indices:  [0, 1, 2, 1, 2, 3],
     *     };
     *
     *  They can also by TypedArrays
     *
     *     var arrays = {
     *        position: new Float32Array([0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0]),
     *        texcoord: new Float32Array([0, 0, 0, 1, 1, 0, 1, 1]),
     *        normal:   new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]),
     *        indices:  new Uint16Array([0, 1, 2, 1, 2, 3]),
     *     };
     *
     *  Or augmentedTypedArrays
     *
     *     var positions = createAugmentedTypedArray(3, 4);
     *     var texcoords = createAugmentedTypedArray(2, 4);
     *     var normals   = createAugmentedTypedArray(3, 4);
     *     var indices   = createAugmentedTypedArray(3, 2, Uint16Array);
     *
     *     positions.push([0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0]);
     *     texcoords.push([0, 0, 0, 1, 1, 0, 1, 1]);
     *     normals.push([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]);
     *     indices.push([0, 1, 2, 1, 2, 3]);
     *
     *     var arrays = {
     *        position: positions,
     *        texcoord: texcoords,
     *        normal:   normals,
     *        indices:  indices,
     *     };
     *
     * For the last example it is equivalent to
     *
     *     var bufferInfo = {
     *       attribs: {
     *         a_position: { numComponents: 3, buffer: gl.createBuffer(), },
     *         a_texcoods: { numComponents: 2, buffer: gl.createBuffer(), },
     *         a_normals: { numComponents: 3, buffer: gl.createBuffer(), },
     *       },
     *       indices: gl.createBuffer(),
     *       numElements: 6,
     *     };
     *
     *     gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.attribs.a_position.buffer);
     *     gl.bufferData(gl.ARRAY_BUFFER, arrays.position, gl.STATIC_DRAW);
     *     gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.attribs.a_texcoord.buffer);
     *     gl.bufferData(gl.ARRAY_BUFFER, arrays.texcoord, gl.STATIC_DRAW);
     *     gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.attribs.a_normal.buffer);
     *     gl.bufferData(gl.ARRAY_BUFFER, arrays.normal, gl.STATIC_DRAW);
     *     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bufferInfo.indices);
     *     gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, arrays.indices, gl.STATIC_DRAW);
     *
     * @param {WebGLRenderingContext} gl A WebGLRenderingContext
     * @param {Object.<string, array|object|typedarray>} arrays Your data
     * @param {Object.<string, string>} [opt_mapping] an optional mapping of attribute to array name.
     *    If not passed in it's assumed the array names will be mapped to an attribute
     *    of the same name with "a_" prefixed to it. An other words.
     *
     *        var arrays = {
     *           position: ...,
     *           texcoord: ...,
     *           normal:   ...,
     *           indices:  ...,
     *        };
     *
     *        bufferInfo = createBufferInfoFromArrays(gl, arrays);
     *
     *    Is the same as
     *
     *        var arrays = {
     *           position: ...,
     *           texcoord: ...,
     *           normal:   ...,
     *           indices:  ...,
     *        };
     *
     *        var mapping = {
     *          a_position: "position",
     *          a_texcoord: "texcoord",
     *          a_normal:   "normal",
     *        };
     *
     *        bufferInfo = createBufferInfoFromArrays(gl, arrays, mapping);
     *
     * @return {module:webgl-utils.BufferInfo} A BufferInfo
     * @memberOf module:webgl-utils
     */
    function createBufferInfoFromArrays(gl, arrays, opt_mapping) {
      var bufferInfo = {
        attribs: createAttribsFromArrays(gl, arrays, opt_mapping),
      };
      var indices = arrays.indices;
      if (indices) {
        indices = makeTypedArray(indices, "indices");
        bufferInfo.indices = createBufferFromTypedArray(gl, indices, gl.ELEMENT_ARRAY_BUFFER);
        bufferInfo.numElements = indices.length;
      } else {
        bufferInfo.numElements = getNumElementsFromNonIndexedArrays(arrays);
      }
  
      return bufferInfo;
    }
  
    /**
     * Creates buffers from typed arrays
     *
     * Given something like this
     *
     *     var arrays = {
     *        positions: [1, 2, 3],
     *        normals: [0, 0, 1],
     *     }
     *
     * returns something like
     *
     *     buffers = {
     *       positions: WebGLBuffer,
     *       normals: WebGLBuffer,
     *     }
     *
     * If the buffer is named 'indices' it will be made an ELEMENT_ARRAY_BUFFER.
     *
     * @param {WebGLRenderingContext} gl A WebGLRenderingContext.
     * @param {Object<string, array|typedarray>} arrays
     * @return {Object<string, WebGLBuffer>} returns an object with one WebGLBuffer per array
     * @memberOf module:webgl-utils
     */
    function createBuffersFromArrays(gl, arrays) {
      var buffers = { };
      Object.keys(arrays).forEach(function(key) {
        var type = key === "indices" ? gl.ELEMENT_ARRAY_BUFFER : gl.ARRAY_BUFFER;
        var array = makeTypedArray(arrays[key], name);
        buffers[key] = createBufferFromTypedArray(gl, array, type);
      });
  
      // hrm
      if (arrays.indices) {
        buffers.numElements = arrays.indices.length;
      } else if (arrays.position) {
        buffers.numElements = arrays.position.length / 3;
      }
  
      return buffers;
    }
  
    /**
     * Calls `gl.drawElements` or `gl.drawArrays`, whichever is appropriate
     *
     * normally you'd call `gl.drawElements` or `gl.drawArrays` yourself
     * but calling this means if you switch from indexed data to non-indexed
     * data you don't have to remember to update your draw call.
     *
     * @param {WebGLRenderingContext} gl A WebGLRenderingContext
     * @param {module:webgl-utils.BufferInfo} bufferInfo as returned from createBufferInfoFromArrays
     * @param {enum} [primitiveType] eg (gl.TRIANGLES, gl.LINES, gl.POINTS, gl.TRIANGLE_STRIP, ...)
     * @param {number} [count] An optional count. Defaults to bufferInfo.numElements
     * @param {number} [offset] An optional offset. Defaults to 0.
     * @memberOf module:webgl-utils
     */
    function drawBufferInfo(gl, bufferInfo, primitiveType, count, offset) {
      var indices = bufferInfo.indices;
      primitiveType = primitiveType === undefined ? gl.TRIANGLES : primitiveType;
      var numElements = count === undefined ? bufferInfo.numElements : count;
      offset = offset === undefined ? offset : 0;
      if (indices) {
        gl.drawElements(primitiveType, numElements, gl.UNSIGNED_SHORT, offset);
      } else {
        gl.drawArrays(primitiveType, offset, numElements);
      }
    }
  
    /**
     * @typedef {Object} DrawObject
     * @property {module:webgl-utils.ProgramInfo} programInfo A ProgramInfo as returned from createProgramInfo
     * @property {module:webgl-utils.BufferInfo} bufferInfo A BufferInfo as returned from createBufferInfoFromArrays
     * @property {Object<string, ?>} uniforms The values for the uniforms
     * @memberOf module:webgl-utils
     */
  
    /**
     * Draws a list of objects
     * @param {WebGLRenderingContext} gl A WebGLRenderingContext
     * @param {DrawObject[]} objectsToDraw an array of objects to draw.
     * @memberOf module:webgl-utils
     */
    function drawObjectList(gl, objectsToDraw) {
      var lastUsedProgramInfo = null;
      var lastUsedBufferInfo = null;
  
      objectsToDraw.forEach(function(object) {
        var programInfo = object.programInfo;
        var bufferInfo = object.bufferInfo;
        var bindBuffers = false;
  
        if (programInfo !== lastUsedProgramInfo) {
          lastUsedProgramInfo = programInfo;
          gl.useProgram(programInfo.program);
          bindBuffers = true;
        }
  
        // Setup all the needed attributes.
        if (bindBuffers || bufferInfo !== lastUsedBufferInfo) {
          lastUsedBufferInfo = bufferInfo;
          setBuffersAndAttributes(gl, programInfo.attribSetters, bufferInfo);
        }
  
        // Set the uniforms.
        setUniforms(programInfo.uniformSetters, object.uniforms);
  
        // Draw
        drawBufferInfo(gl, bufferInfo);
      });
    }
  
    var isIE = /*@cc_on!@*/false || !!document.documentMode;
    // Edge 20+
    var isEdge = !isIE && !!window.StyleMedia;
    if (isEdge) {
      // Hack for Edge. Edge's WebGL implmentation is crap still and so they
      // only respond to "experimental-webgl". I don't want to clutter the
      // examples with that so his hack works around it
      HTMLCanvasElement.prototype.getContext = function(origFn) {
        return function() {
          var args = arguments;
          var type = args[0];
          if (type === "webgl") {
            args = [].slice.call(arguments);
            args[0] = "experimental-webgl";
          }
          return origFn.apply(this, args);
        };
      }(HTMLCanvasElement.prototype.getContext);
    }
  
    return {
      createAugmentedTypedArray: createAugmentedTypedArray,
      createAttribsFromArrays: createAttribsFromArrays,
      createBuffersFromArrays: createBuffersFromArrays,
      createBufferInfoFromArrays: createBufferInfoFromArrays,
      createAttributeSetters: createAttributeSetters,
      createProgram: createProgram,
      createProgramFromScripts: createProgramFromScripts,
      createProgramFromSources: createProgramFromSources,
      createProgramInfo: createProgramInfo,
      createUniformSetters: createUniformSetters,
      createVAOAndSetAttributes: createVAOAndSetAttributes,
      createVAOFromBufferInfo: createVAOFromBufferInfo,
      drawBufferInfo: drawBufferInfo,
      drawObjectList: drawObjectList,
      getExtensionWithKnownPrefixes: getExtensionWithKnownPrefixes,
      resizeCanvasToDisplaySize: resizeCanvasToDisplaySize,
      setAttributes: setAttributes,
      setBuffersAndAttributes: setBuffersAndAttributes,
      setUniforms: setUniforms,
    };
  
  }));
  
  
},{}],18:[function(require,module,exports){
/**
 * file: sprite.js
 * description: A drawable sprite.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";
const Renderable = require('./renderable');
const Point = require('./point');
const Color = require('./color');
const Rectangle = require('./rectangle');
const BlendModes = require('./blend_modes');

// radians / degrees factor
const degreesToRadFactor = (Math.PI / 180.0);

// define common rotation vectors upfront
const predefinedRotationVectors = {};
for (var i = 0; i <= 360 / 5; ++i) {

    var deg = Math.round(i * 5);
    var rad = deg * degreesToRadFactor;
    predefinedRotationVectors[deg] = new Point(Math.sin(-rad), Math.cos(-rad));
    if (Object.freeze) { Object.freeze(predefinedRotationVectors[deg]); }
}


/**
 * A drawable sprite instance.
 */
class Sprite extends Renderable
{
    /**
     * Create the sprite.
     * @param {PintarJS.Texture} texture Texture to use for this sprite.
     * @param {PintarJS.Point} position Text position.
     * @param {*} options Additional params.
     */
    constructor(texture, position, options)
    {
        options = options || {};
        super((position || Point.zero()), (options.color || Sprite.defaults.color), (options.blendMode || Sprite.defaults.blendMode));
        this.texture = texture;
        var size = (options.size || Sprite.defaults.size);
        this.size = new Point(size.x, size.y);
        this.scale = (options.scale || Sprite.defaults.scale).clone();
        this.sourceRectangle = (options.sourceRectangle || this.sourceRectangle).clone();
        this.smoothingEnabled = options.smoothingEnabled || Sprite.defaults.smoothingEnabled;
        this.origin = (options.origin || Sprite.defaults.origin).clone();
        this.rotation = options.rotation || 0;
        this.brightness = options.brightness || 1;
        this.colorBoost = (options.colorBoost || Sprite.defaults.colorBoost).clone();
        this.greyscale = Boolean(options.greyscale);
        this.cacheRelativeSourceRectangle = true;
        this.applyAntiBleeding = Sprite.defaults.applyAntiBleeding;
        this.skew = options.skew ? options.skew.clone() : Point.zero();
    }

    /**
     * Get sprite's texture.
     */
    get texture()
    {
        return this._texture;
    }

    /**
     * Set sprite's texture.
     */
    set texture(texture)
    {
        this._texture = texture;
        this.sourceRectangle = new Rectangle(0, 0, 0, 0);
    }

    /**
     * Set sprite width.
     */
    set width(val)
    {
        this.size.x = val;
    }

    /**
     * Get sprite width.
     */
    get width()
    {
        return this.size.x;
    }

    /**
     * Set sprite height.
     */
    set height(val)
    {
        this.size.y = val;
    }

    /**
     * Get sprite height.
     */
    get height()
    {
        return this.size.y;
    }

    /**
     * Get source rectangle with 0-1 values, based on currently loaded texture.
     */
    get sourceRectangleRelative()
    {
        // if source rect was changed, recalc the relative source rect
        if (!this.cacheRelativeSourceRectangle || !this._sourceRectangleRelative || !this._lastSrcRect.equals(this.sourceRectangle)) 
        {    
            // get texture size
            var twidth = this.texture.width;
            var theight = this.texture.height;

            // texture not yet loaded? stop here..
            if (!twidth || !theight) {
                return new Rectangle(0, 0, 0, 0);
            }

            // store last source rect and recalc relative rect
            if (this.cacheRelativeSourceRectangle) { this._lastSrcRect = this.sourceRectangle.clone(); }
            var antiBleedFactor = this.applyAntiBleeding ? 0.075 : 0;
            this._sourceRectangleRelative = new Rectangle(
                ((this.sourceRectangle.x + antiBleedFactor) / twidth), 
                ((this.sourceRectangle.y + antiBleedFactor) / theight), 
                (((this.sourceRectangle.width || this.texture.width) - antiBleedFactor) / twidth), 
                (((this.sourceRectangle.height || this.texture.height) - antiBleedFactor) / theight));
        }
        return this._sourceRectangleRelative;
    }

    /**
     * Set rotation as degrees.
     */
    set rotation(val)
    {
        // normalize value
        val = Math.round((val % 360) * 100) / 100;
        if (val < 0) { val = (360 + val); }

        // if changed, update rotation
        if (this._rotation !== val) {
            this._rotationRadians = val * degreesToRadFactor;
            this._rotationVec = null;
            this._rotation = val;
        }
    }

    /**
     * Get rotation as degrees.
     */
    get rotation()
    {
        return this._rotation;
    }

    /**
     * Set rotation as radians.
     */
    set rotationRadians(val) 
    {
        this.rotation = val / degreesToRadFactor;
    }

    /**
     * Get rotation as radians.
     */
    get rotationRadians()
    {
        return this._rotationRadians;
    }

    /**
     * Get rotation vector (x / y axis).
     */
    get rotationVector()
    {
        // check if we can use one of the pre-defined rotation vectors
        var predefVec = predefinedRotationVectors[this.rotation];
        if (predefVec) { return predefVec; }

        // calculate rotation vector if needed
        if (!this._rotationVec) {
            this._rotationVec = new Point(Math.sin(-this._rotationRadians), Math.cos(-this._rotationRadians));
            if (Object.freeze) {Object.freeze(this._rotationVec);}
        }

        // return rotation vector
        return this._rotationVec;
    }

    /**
     * Set the source Rectangle automatically from spritesheet.
     * This method get sprite index in sheet and how many sprites there are in total, and calculate the desired
     * offset and size in source Rectangle based on it + source image size.
     * @param {PintarJS.Point} index Sprite index in spritesheet.
     * @param {PintarJS.Point} spritesCount How many sprites there are in spritesheet in total.
     * @param {Boolean} setSize If true will also set width and height based on source rectangle (default is true).
     */
    setSourceFromSpritesheet(index, spritesCount, setSize)
    {
        var w = this.texture.width / spritesCount.x;
        var h = this.texture.height / spritesCount.y;
        var x = w * index.x;
        var y = h * index.y;
        if (setSize || setSize === undefined) {
            this.width = w;
            this.height = h;
        }
        this.sourceRectangle.set(x, y, w, h);
    }
        
    /**
     * Return a clone of this sprite.
     */
    clone()
    {
        var ret = new Sprite(this.texture);
        ret.scale = this.scale.clone();
        ret.sourceRectangle = this.sourceRectangle.clone();
        ret.smoothingEnabled = this.smoothingEnabled;
        ret.origin = this.origin.clone();
        ret.rotation = this.rotation;
        ret.brightness = this.brightness;
        ret.colorBoost = this.colorBoost.clone();
        ret.greyscale = this.greyscale;
        ret.skew = this.skew.clone();
        ret.cacheRelativeSourceRectangle = this.cacheRelativeSourceRectangle;
        ret.applyAntiBleeding = this.applyAntiBleeding;
        this._copyBasics(ret);
        return ret;
    }
}

// default values
Sprite.defaults = {
    blendMode: BlendModes.AlphaBlend,
    scale: Point.one(),
    sourceRectangle: new Rectangle(),
    smoothingEnabled: true,
    color: Color.white(),
    origin: Point.zero(),
    colorBoost: Color.transparent(),
    applyAntiBleeding: false,
    size: new Point(64, 64),
}

// export Sprite
module.exports = Sprite;
},{"./blend_modes":1,"./color":2,"./point":5,"./rectangle":6,"./renderable":7}],19:[function(require,module,exports){
/**
 * file: text_sprite.js
 * description: A drawable text sprite.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";
const Renderable = require('./renderable');
const Point = require('./point');
const Color = require('./color');
const BlendModes = require('./blend_modes');


/**
 * A drawable text instance.
 */
class TextSprite extends Renderable
{
    /**
     * Create the text sprite.
     * @param {String} text Text to draw.
     * @param {PintarJS.Point} position Text position.
     * @param {*} options Additional params.
     */
    constructor(text, position, options)
    {
        // set basics
        options = options || {};
        super(position || Point.zero(), options.color || TextSprite.defaults.color, options.blendMode || TextSprite.defaults.blendMode);
        this._version = 0;
        this.text = text;
        this.font = options.font || TextSprite.defaults.font;
        this.fontSize = options.fontSize || TextSprite.defaults.fontSize;
        this.alignment = options.alignment || TextSprite.defaults.alignment;
        this.strokeWidth = options.strokeWidth || TextSprite.defaults.strokeWidth;
        this.maxWidth = null;
        this.strokeColor = (options.strokeColor || TextSprite.defaults.strokeColor).clone();
        this.useStyleCommands = TextSprite.defaults.useStyleCommands;
        this.tracking = TextSprite.defaults.tracking;
        
        // optional offset to add on Y axis based on actual line height
        this.lineHeightOffsetFactor = TextSprite.defaults.lineHeightOffsetFactor;

        // reset version after init
        this._version = 0;
    }

    /**
     * Get hash code of text
     */
    getHashCode() 
    {
        var text = this.text;
        var hash = 0, i, chr;
        if (text.length === 0) return hash;
        for (i = 0; i < text.length; i++) {
            chr   = text.charCodeAt(i);
            hash  = ((hash << 5) - hash) + chr;
            hash |= 0;
        }
        return hash;
    };
    
    /**
     * Get unique id representing this text sprite and all its properties.
     */
    getUniqueId()
    {
        // take id from cache
        if (this._uniqueId && (this._lastUniqueIdVersion == this._version)) {
            return this._uniqueId;
        }

        // if got here it means we need to generate a new id
        this._uniqueId = this.getHashCode().toString() + this.fontPropertyAsString + this.alignment + this.strokeWidth + this.color.asHex() + this.strokeColor.asHex() + this.maxWidth;
        this._lastUniqueIdVersion = this._version;
        return this._uniqueId;
    }

    /**
     * Set alignment.
     */
    set alignment(val)
    {
        if (this._alignment !== val) {
            this._alignment = val;
            this._version++;
        }
    }

    /**
     * Get alignment.
     */
    get alignment()
    {
        return this._alignment;
    }

    /**
     * Set if to use style commands.
     */
    set useStyleCommands(val)
    {
        if (this._useStyleCommands !== val) {
            this._useStyleCommands = val;
            this._cachedLinesAndCommands = null;
        }
    }

    /**
     * Get if using style commands.
     */
    get useStyleCommands()
    {
        return this._useStyleCommands;
    }

    /**
     * Set stroke color.
     */
    set strokeColor(val)
    {
        if (this._strokeColor !== val) {
            this._strokeColor = val;
            this._version++;
        }
    }

    /**
     * Get stroke color.
     */
    get strokeColor()
    {
        return this._strokeColor;
    }

    /**
     * Set max line width.
     */
    set maxWidth(val)
    {
        if (this._maxWidth !== val) {
            this._maxWidth = val;
            this._cachedLinesAndCommands = null;
            this._version++;
        }
    }

    /**
     * Get max line width.
     */
    get maxWidth()
    {
        return this._maxWidth;
    }

    /**
     * Set stroke width.
     */
    set strokeWidth(val)
    {
        if (this._strokeWidth !== val) {
            this._strokeWidth = val;
            this._cachedLinesAndCommands = null;
            this._version++;
        }
    }

    /**
     * Get stroke width.
     */
    get strokeWidth()
    {
        return this._strokeWidth;
    }

    /**
     * Set text.
     */
    set text(val)
    {
        if (this._text !== val) {
            this._text = val;
            this._cachedLinesAndCommands = null;
            this._version++;
        }
    }

    /**
     * Get text.
     */
    get text()
    {
        return this._text;
    }

    /**
     * Get font size and type as string.
     */
    get fontPropertyAsString()
    {
        if (!this._fontString) {
            this._fontString = Math.ceil(this.fontSize) + "px " + this.font;
        }
        return this._fontString;
    }

    /**
     * Set font.
     */
    set font(val)
    {
        if (this._font !== val) {
            this._font = val;
            this._fontString = null;
            this._cachedLinesAndCommands = null;
            this._version++;
        }
    }

    /**
     * Get font.
     */
    get font()
    {
        return this._font;
    }

    /**
     * Set font size.
     */
    set fontSize(val)
    {
        if (this._fontSize !== val) {
            this._fontSize = val;
            this._fontString = null;
            this._cachedLinesAndCommands = null;
            this._version++;
        }
    }

    /**
     * Get font.
     */
    get fontSize()
    {
        return this._fontSize;
    }

    /**
     * Get the actual width, in pixels, of this text sprite.
     * Note: if need to calculate / update, this will call getProcessedTextAndCommands() internally.
     */
    get calculatedWidth()
    {
        if (!this._cachedLinesAndCommands) { this.getProcessedTextAndCommands(); }
        return this._calculatedWidth || 0;
    }

    /**
     * Get the actual height, in pixels, of a single line in this text sprite.
     * Note: if need to calculate / update, this will call getProcessedTextAndCommands() internally.
     */
    get calculatedLineHeight()
    {
        if (!this._cachedLinesAndCommands) { this.getProcessedTextAndCommands(); }
        return this._calculatedLineHeight || 0;
    }

    /**
     * Get the actual height, in pixels, of this text sprite.
     * Note: if need to calculate / update, this will call getProcessedTextAndCommands() internally.
     */
    get calculatedHeight()
    {
        if (!this._cachedLinesAndCommands) { this.getProcessedTextAndCommands(); }
        return this._calculatedHeight || 0;
    }

    /**
     * Get text as an array of lines after breaking them based on maxWidth + list of style commands.
     */
    getProcessedTextAndCommands()
    {
        // got cached? return it
        if (this._cachedLinesAndCommands) {
            return this._cachedLinesAndCommands;
        }

        // get the size, in pixels, of a specific character.
        var charsSizeCache = {};
        var getCharSize = (char) => 
        {
            // if in cache return it
            if (char in charsSizeCache) {
                return charsSizeCache[char];
            }

            // calc actual size
            var width = TextSprite.measureTextWidth(this.font, this.fontSize, char);
            var height = TextSprite.measureTextHeight(this.font, this.fontSize, char);
            var ret = {
                base: new Point(width, height), 
                absoluteDistance: new Point(width + this.tracking , height),
                width: width + this.tracking,
            };
            charsSizeCache[char] = ret;
            return ret;
        }

        // ret list + method to finish line
        var ret = [];
        var currLine = {styleCommands: {}, text: "", sizes: [], totalWidth: 0};
        var endLine = () => 
        {    
            // sanity
            if (currLine.sizes.length != currLine.text.length) {
                throw new Error("Internal error!");
            }

            // update width
            this._calculatedWidth = Math.max(this._calculatedWidth, currLine.totalWidth);

            // push line data
            ret.push(currLine);
            currLine = {styleCommands: {}, text: "", sizes: [], totalWidth: 0};

            // update height
            this._calculatedHeight += this._calculatedLineHeight;
        }

        // method to get value part of the command
        var getValuePart = (j) => 
        {
            var closingIndex = this._text.substr(j, 64).indexOf('}}');
            if (closingIndex === -1) { 
                throw new PintarConsole.Error("Invalid broken style command: '" + this._text.substr(j - 3, 10) + "'!");
            }
            return this._text.substring(j + 5, j + closingIndex);
        };

        // parse color value for style command
        var parseColor = (colorVal) => 
        {
            if (colorVal[0] === '#') {
                return Color.fromHex(colorVal);
            }
            return Color[colorVal]();
        }

        // current offset X, to add line breaks
        var strokeWidth = this.strokeWidth;

        // reset actual heights
        this._calculatedHeight = this._calculatedLineHeight = 0;

        // reset actual width
        this._calculatedWidth = 0;

        // parse lines and style commands
        for (var j = 0; j < this._text.length; ++j) 
        {
            // check if its a style command
            if (this.useStyleCommands) 
            {
                var styleCommandKey = currLine.text.length;
                while (this._text[j] == '{' && this._text[j + 1] == '{') 
                {
                    // create list for style commands
                    currLine.styleCommands[styleCommandKey] = currLine.styleCommands[styleCommandKey] || [];

                    // reset command
                    if (this._text.substr(j, "{{res}}".length) === "{{res}}") 
                    {
                        currLine.styleCommands[styleCommandKey].push({'type': 'reset'});
                        strokeWidth = this.strokeWidth;
                        j += "{{res}}".length;
                    }
                    else
                    {
                        // get command part
                        var command = this._text.substr(j, "{{xx:".length);

                        // get style value part and advance index
                        var styleVal = getValuePart(j);
                        j += styleVal.length + 2 + 5;

                        // is it front color?
                        if (command == "{{fc:") {
                            var val = parseColor(styleVal);
                            currLine.styleCommands[styleCommandKey].push({'type': 'fc', 'val': val});
                        }
                        // is it stroke color?
                        else if (command == "{{sc:") {
                            var val = parseColor(styleVal);
                            currLine.styleCommands[styleCommandKey].push({'type': 'sc', 'val': val});
                        }
                        // is it stroke color?
                        else if (command == "{{sw:") {
                            var val = parseInt(styleVal);
                            strokeWidth = val;
                            currLine.styleCommands[styleCommandKey].push({'type': 'sw', 'val': val});
                        }
                    } 
                }
            }

            // get current character and add to line
            var char = this._text[j];
            if (char === undefined) {
                continue;
            }

            // get current char width and add to sizes array
            var currCharSize = getCharSize(char, strokeWidth);

            // calculate line height
            if (!this._calculatedLineHeight) {
                this._calculatedLineHeight = currCharSize.absoluteDistance.y;
            }

            // check if need to break due to exceeding size
            if (this.maxWidth && currLine.totalWidth >= this.maxWidth - currCharSize.absoluteDistance.x) 
            {
                // break line, but store it first
                var prevLine = currLine;
                endLine();

                // if this character was not ideal for break, search for a better character
                if (!TextSprite.charForLineBreak(char))
                {
                    // try to find better index to break
                    var breakIndex = prevLine.text.length - 1;
                    while (breakIndex-- > 1 && !TextSprite.charForLineBreak(prevLine.text[breakIndex])) {}

                    // got a better place to break? migrate character to previous line
                    if (breakIndex > 1) {
                        breakIndex++; // <-- add +1 so it will break *after* the breaking character and not before it
                        for (var _x = breakIndex; _x < prevLine.text.length; ++_x)
                        {
                            var prevSize = prevLine.sizes[_x];
                            currLine.text += prevLine.text[_x];
                            currLine.totalWidth += prevSize.width;
                            prevLine.totalWidth -= prevSize.width;
                            currLine.sizes.push(prevSize);
                        }

                        // migrate style commands
                        for (var key in prevLine.styleCommands) {
                            if (parseInt(key) >= breakIndex) {
                                currLine.styleCommands[currLine.text.length] = prevLine.styleCommands[key];
                                delete prevLine.styleCommands[key];
                            }
                        }

                        // remove text from previous line
                        prevLine.text = prevLine.text.substr(0, breakIndex);
                    }
                }
                
                // if current char is space, no point adding it to start of line after we broke it
                if (char === ' ') { continue; }
            }

            // break line character?
            if (char == '\n') 
            {
                endLine();
            }
            // regular character, add to output line
            else 
            {
                currLine.sizes.push(currCharSize);
                currLine.text += char;
                currLine.totalWidth += currCharSize.width;
            }
        }

        // push last line
        if (currLine.text.length) { 
            endLine(); 
        }

        // store in cache and return
        this._cachedLinesAndCommands = ret;
        return ret;
    }
 
    /**
     * Return a clone of this text sprite.
     */
    clone()
    {
        var ret = new TextSprite(this.text);
        ret._lineHeight = this._lineHeight;
        ret.position = this.position.clone();
        ret.font = this.font;
        ret.fontSize = this.fontSize;
        ret.color = this.color.clone();
        ret.alignment = this.alignment;
        ret.strokeWidth = this.strokeWidth;
        ret.maxWidth = this.maxWidth;
        ret.strokeColor = this.strokeColor.clone();
        return ret;
    }
}

/**
 * Alignment types enums.
 */
TextSprite.Alignments = {
    Left: "left",
    Right: "right",
    Center: "center",
}

// default values
TextSprite.defaults = {
    font: "Arial",                              // default font to use when drawing text.
    fontSize: 30,                               // default font size.
    color: Color.black(),                       // default text color.
    alignment: TextSprite.Alignments.Left,      // default text alignment.
    strokeWidth: 0,                             // default text stroke width.
    strokeColor: Color.transparent(),           // default text stroke color.
    blendMode: BlendModes.AlphaBlend,           // default blending mode.
    useStyleCommands: false,                    // default if sprite texts should use style commands.
    lineHeightOffsetFactor: 0,                  // default offset based on line calculated height.
    tracking: 0,                                // default extra spacing between characters.
};

/**
 * Get all text without any style commands in it.
 */
TextSprite.getTextWithoutStyleCommands = function(text)
{
    var ret = "";
    var parts = text.split("{{");
    for (var i = 0; i < parts.length; ++i) 
    {
        var currPart = parts[i];
        var currPartOrigin = i === 0 ? currPart : "{{" + currPart;
        var startPart = currPart.substr(0, 3);
        if (startPart !== "fc:" && startPart !== "sc:" && startPart !== "sw:" && startPart !== "res") {
            ret += currPartOrigin;
            continue;
        }

        var closing = currPart.indexOf("}}");
        ret += closing === -1 ? (currPartOrigin) : (currPart.substr(closing + 2));
    }
    return ret;
}

/**
 * Measure font's actual height.
 */
TextSprite.measureTextHeight = function(fontFamily, fontSize, char) 
{
    var text = document.createElement('span');
    text.style.fontFamily = fontFamily;
    text.style.fontSize = fontSize + "px";
    text.style.paddingBottom = text.style.paddingLeft = text.style.paddingTop = text.style.paddingRight = '0px';
    text.style.marginBottom = text.style.marginLeft = text.style.marginTop = text.style.marginRight = '0px';
    text.textContent = char || "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ";
    document.body.appendChild(text);
    var result = text.getBoundingClientRect().height;
    document.body.removeChild(text);
    return Math.ceil(result);
};

/**
 * Measure font's actual width.
 */
TextSprite.measureTextWidth = function(fontFamily, fontSize, char) 
{
    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");
    context.font = fontSize.toString() + 'px ' + fontFamily;
    var result = 0;
    var text = char || "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ";
    for (var i = 0; i < text.length; ++i) {
        result = Math.max(result, context.measureText(text[i]).width);
    }
    return Math.ceil(result);
};

/**
 * Get if a given character is fitting for an unexpected line break.
 */
TextSprite.charForLineBreak = function(char)
{
    return ".,:;- \t-+=/\\*&^~".indexOf(char) !== -1;
}

// export TextSprite
module.exports = TextSprite;
},{"./blend_modes":1,"./color":2,"./point":5,"./renderable":7}],20:[function(require,module,exports){
/**
 * file: texture.js
 * description: A drawable texture class.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";
const Point = require('./point');
const PintarConsole = require('./console');


/**
 * A drawable texture.
 */
class Texture
{
    /**
     * Create the texture.
     * @param {*} imageOrSize Can be Image instance, URI to load image from, or point to create empty texture with image of given size.
     * @param {Function} onLoaded Callback to call when image is successfully loaded.
     */
    constructor(imageOrSize, onLoaded)
    {
        // if we got image instance..
        if (imageOrSize instanceof Image) {

            // store image
            PintarConsole.log("Create new texture from existing image:", imageOrSize);
            this.image = imageOrSize;

            // if ready, call init and callback
            if (this.image.width) {
                if (onLoaded) { onLoaded.call(this.image); }
            }
            // if not ready, set onload callback
            else {
                this.image.onload = onLoaded;
            }
        }

        // if we got a string, load image from URI
        else if (typeof imageOrSize === 'string' || imageOrSize instanceof String) {
            PintarConsole.log("Create new texture from image URI:", imageOrSize);
            this.image = new Image();
            this.image.onload = onLoaded;
            this.image.src = imageOrSize;
        }

        // if got point, create empty image with given size
        else if (imageOrSize instanceof Point) {
            PintarConsole.log("Create new texture from empty image with size:", imageOrSize);
            this.image = new Image(imageOrSize.x, imageOrSize.y);
            if (onLoaded) { onLoaded(); }
        }

        // invalid type?
        else {
            throw new PintarConsole.Error("Invalid param for texture creation; Should either be Image, string, or Point!");
        }
    }

    /**
     * Return if texture's image is loaded / ready.
     */
    get isReady() 
    {
        return this.image && this.image.width != 0;
    }

    /**
     * Get texture width.
     */
    get width()
    {
        return this.image.width;
    }

    /**
     * Get texture height.
     */
    get height()
    {
        return this.image.height;
    }
    
}

// export Texture
module.exports = Texture;
},{"./console":3,"./point":5}],21:[function(require,module,exports){
/**
 * file: viewport.js
 * description: Viewport to define rendering region and offset.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";
const Point = require('./point');


/**
 * Implement a rendering viewport class.
 */
class Viewport
{
    /**
     * Create the Viewport.
     * @param {PintarJS.Point} offset Viewport offset.
     * @param {PintarJS.Rectangle} drawingRegion Viewport drawing region (can be null if you don't want to limit drawing region).
     */
    constructor(offset, drawingRegion)
    {
        this.offset = offset ? offset.clone() : Point.zero();
        this.drawingRegion = drawingRegion ? drawingRegion.clone() : null;
    }

    /**
     * Return a clone of this Viewport.
     */
    clone()
    {
        return new Viewport(this.offset, this.drawingRegion);
    }
    
    /**
     * Check if equal to another Viewport.
     * @param {PintarJS.Point} other Other point to compare to.
     */
    equals(other)
    {
        return other && this.offset.equals(other.offset) && this.drawingRegion.equals(other.drawingRegion);
    }
}

// export Viewport
module.exports = Viewport;
},{"./point":5}]},{},[4])(4)
});
