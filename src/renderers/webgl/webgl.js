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
const Color = require('./../../color');
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

        // get the size, in pixels, of a specific character.
        var charsSizeCache = {};
        var getCharSize = (char, strokeWidth) => 
        {
            // if in cache return it
            if (char in charsSizeCache) {
                return charsSizeCache[char];
            }

            // get source rect
            var srcRect = fontTexture.getSourceRect(char);

            // calc actual size
            var width = Math.ceil(ratio * srcRect.width);
            var height = Math.ceil(ratio * srcRect.height);
            var strokeExtra = strokeWidth / 5;
            var ret = {
                base: new Point(width, height), 
                withStroke: new Point(width + strokeExtra, height + strokeExtra),
                width: width + strokeExtra - 1 * ratio,
            };
            charsSizeCache[char] = ret;
            return ret;
        }

        // get text lines and style commands
        var lines = textSprite.getProcessedTextAndCommands(getCharSize);

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
                    sprite.position.set(position.x, position.y);

                    // actually draw sprite
                    drawSpriteMethod(sprite, position, fillColor, strokeWidth, strokeColor);


                    // update offset
                    offset += size.withStroke.x - 1 * ratio;
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