/**
 * file: webgl.js
 * description: Implement webgl renderer.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";
const Renderer = require('./../renderer');
const PintarConsole = require('./../../console');
const CanvasRenderer = require('./../canvas');
const Color = require('./../../color');
const Point = require('./../../point');
const BlendModes = require('../../blend_modes');
const Viewport = require('./../../viewport');
const Rectangle = require('./../../rectangle');
const Shaders = require('./shaders');
const WebglUtils = require('./webgl-utils').webglUtils;


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

        // create the internal canvas renderer, used to draw text
        this._initOverlayCanvas();

        // init shaders and internal stuff
        this._initShadersAndBuffers();

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

        // Create a texture.
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);

        // Set the parameters so we can render any size image.
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

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
     * Called whenever canvas resize to adjust resolution and overlay size.
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
     * Create the overlay canvas for text rendering.
     */
    _initOverlayCanvas()
    {
        PintarConsole.debug("Create internal canvas renderer to use as overlay layer for text..");
        var canvas = this._canvas;
        this._overlayCanvas = document.createElement('canvas');
        this._overlayCanvas.id = "pintarjs-webgl-overlay-canvas";
        this._canvasRender = new CanvasRenderer();
        this._canvasRender._init(this._overlayCanvas);
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
        // check if need to resize
        if (this._lastSize.x != this._gl.canvas.width || this._lastSize.y != this._gl.canvas.height) 
        {
            this._onResize();
        }

        // update the overlay canvas position and size
        this._updateOverlayCanvas();

        // clear texture caching
        this._texture = null;
        this._textureWidth = -1;
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
        // clear the overlay canvas
        this._canvasRender.clear(new Color(0, 0, 0, 0));

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
     * Set viewport.
     */
    setViewport(viewport)
    {
        this._canvasRender.setViewport(viewport);
        
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
        this._canvasRender.drawText(textSprite);
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
     */
    _setTexture(img)
    {
        // only update if texture changed
        // note: the comparison to width is so we'll update the image if it used to be invalid but now loaded
        if (this._texture !== img || this._textureWidth !== img.width) {
        
            // update cached values
            this._textureWidth = img.width;
            this._texture = img;

            // set values
            var gl = this._gl;
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img.width !== 0 ? img : nullImg);
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
                    // gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
                    // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
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
     * Draw a sprite.
     * For more info check out renderer.js.
     */
    drawSprite(sprite) 
    {
        // set texture
        this._setTexture(sprite.texture.image);

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