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
const WrapModes = require('../../wrap_modes');
const Viewport = require('./../../viewport');
const Rectangle = require('./../../rectangle');
const DefaultShader = require('./shaders/default_shader');
const ShapesShader = require('./shaders/shapes_shader');
const FontTexture = require('./font_texture');
const RenderTarget = require('../../render_target');


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

        // convert enum to gl wrap modes
        this._wrapEnumToGl = {};
        this._wrapEnumToGl[WrapModes.Clamp] = this._gl.CLAMP_TO_EDGE;
        this._wrapEnumToGl[WrapModes.Repeat] = this._gl.REPEAT;
        this._wrapEnumToGl[WrapModes.RepeatMirrored] = this._gl.MIRRORED_REPEAT;

        // ready!
        PintarConsole.debug("WebGL renderer ready!");
    }

    /**
     * Init shaders and buffers to draw stuff, as well as other defaults.
     */
    _initShadersAndBuffers()
    {
        // create default shaders
        this._defaultSpritesShader = new DefaultShader();
        this._defaultShapesShader = new ShapesShader();

        // set default shader
        this.setShader(this._defaultSpritesShader);

        // Update size
        this._onResize();
    }

    /**
     * Set the default sprites shader, or null to use the built-in default.
     */
    setDefaultSpriteShader(shader)
    {
        this._defaultSpritesShader = shader || new DefaultShader();
        this.shader = null;
    }

    /**
     * Set the default shapes shader, or null to use the built-in default.
     */
    setDefaultShapesShader(shader)
    {
        this._defaultShapesShader = shader || new ShapesShader();
        this.shader = null;
    }

    /**
     * Are we currently using a default shader?
     */
    get usingDefaultShader()
    {
        return this.shader === this._defaultSpritesShader || this.shader === this._defaultShapesShader;
    }

    /**
     * Set default sprites shader, but only if needed and using the default shapes shader.
     */
    _setSpritesShaderIfNeeded()
    {
        if (!this.shader || this.shader === this._defaultShapesShader) {
            this.setShader(this._defaultSpritesShader);
        }
    }

    /**
     * Set default sprites shader, but only if needed and using the default shapes shader.
     */
    _setShapesShaderIfNeeded()
    {
        if (!this.shader || this.shader === this._defaultSpritesShader) {
            this.setShader(this._defaultShapesShader);
        }
    }

    /**
     * Set the currently active shader.
     */
    setShader(shader)
    {
        if (!shader) { shader = this._defaultSpritesShader; }
        this.shader = shader;
        shader.initIfNeeded(this._gl);
        shader.setAsActive();
        this._updateShaderResolution();
    }

    /**
     * Update active shaders resolution.
     */
    _updateShaderResolution()
    {
        if (!this.shader) { return; }
        var resolution = this._getResolution();
        this.shader.setResolution(resolution.x, resolution.y);
        this._gl.viewport(0, 0, resolution.x, resolution.y);
    }

    /**
     * Get current resolution.
     */
    _getResolution()
    {
        if (this._renderTarget) {
            return new Point(this._renderTarget.width, this._renderTarget.height);
        }
        return new Point(this._gl.canvas.width, this._gl.canvas.height);
    }

    /**
     * Called whenever canvas resize to adjust resolution.
     */
    _onResize()
    {
        // set default texture
        if (!this.shader) {
            this._setSpritesShaderIfNeeded();
        }

        // set the resolution
        var gl = this._gl;
        this._updateShaderResolution();
       
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

        // update resolution
        this._updateShaderResolution();
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
     * @param {Boolean} smooth Set if to smooth text (recommended to set false when drawing small texts) (defaults to true).
     * @param {String} key Key to use for this font in the fonts dictionary. If not set, will use fontName.
     */
    generateFontTexture(fontName, fontSize, charsSet, maxTextureWidth, missingCharPlaceholder, smooth, key) 
    {
        var ret = new FontTexture(fontName, fontSize, charsSet, maxTextureWidth, missingCharPlaceholder, smooth);
        this._fontTextures[key || fontName] = ret;
        return ret;
    }

    /**
     * Get or create a font texture.
     */
    _getOrCreateFontTexture(fontName, size)
    {
        var key = size ? fontName + '_' + size.toString() : fontName;
        if (!this._fontTextures[key]) {
            this.generateFontTexture(fontName, size || this.fontTextureDefaultSize, undefined, undefined, undefined, this.smoothText, key);
        }
        return this._fontTextures[key];
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
        // set shader
        this._setSpritesShaderIfNeeded();

        // get font texture to use
        var fontTexture = this._getOrCreateFontTexture(textSprite.font, textSprite.sourceFontSize);

        // create sprite to draw
        var sprite = new Sprite(fontTexture.texture);
        sprite.blendMode = textSprite.blendMode;
        
        // style properties
        var fillColor = null;
        var strokeWidth = null;
        var strokeColor = null;

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
                    sprite.width = Math.floor(size.base.x);
                    sprite.height = Math.floor(size.base.y);
                    sprite.smoothingEnabled = this.smoothText;

                    // apply line-height based offset
                    if (textSprite.lineHeightOffsetFactor) {
                        position.y += textSprite.lineHeightOffsetFactor * textSprite.calculatedLineHeight;
                    }

                    // set sprite position
                    sprite.position.set(Math.floor(position.x), Math.floor(position.y));

                    // actually draw sprite
                    drawSpriteMethod(sprite, position, fillColor, strokeWidth, strokeColor);

                    // update offset
                    offset += size.absoluteDistance.x;
                }
            }
        };

        // draw text shadow
        if (textSprite.shadowColor && textSprite.shadowColor.a > 0) {
            sprite.blendMode = textSprite.shadowBlendMode;
            drawText((sprite, position, fillColor, strokeWidth, strokeColor) => 
            {
                sprite.color = textSprite.shadowColor;
                sprite.position.x += textSprite.shadowOffset.x;
                sprite.position.y += textSprite.shadowOffset.y;
                this.drawSprite(sprite);
            });
            sprite.blendMode = textSprite.blendMode;
        }

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
                        sprite.width = Math.ceil(width + extraWidth);
                        sprite.height = Math.ceil(height + extraHeight);
                        sprite.position.x = Math.floor(position.x + sx * (strokeWidth / 2) - extraWidth / 2);
                        sprite.position.y = Math.floor(position.y + sy * (strokeWidth / 2) - extraHeight / 2);
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

            // reset wrap mode
            this._wrapX = this._wrapY = null;
        }
    }

    /**
     * Set texture wrapping properties
     */
    _setWrapModes(wrapX, wrapY)
    {
        var gl = this._gl;
        if (this._wrapX !== wrapX) {
            this._wrapX = wrapX;
            wrapX = this._wrapEnumToGl[wrapX];
            gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapX );
        }
        if (this._wrapY !== wrapY) {
            this._wrapY = wrapY;
            wrapY = this._wrapEnumToGl[wrapY];
            gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapY );
        }
    }

    setWrapVertically(wrap)
    {

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

        // set shader
        this._setSpritesShaderIfNeeded();

        // set texture
        var textureMode = this._calcTextureMode(sprite);
        this._setTexture(sprite.texture, textureMode);

        // set wrap modes
        this._setWrapModes(sprite.wrapX, sprite.wrapY);
        
        // set smoothing mode
        this._setSmoothingEnabled(sprite.smoothingEnabled);

        // set blend mode
        this._setBlendMode(sprite.blendMode);

        // draw sprite using active shader
        this.shader.draw(sprite, this._viewport);
    }

    /**
     * Draw a rectangle.
     * @param {PintarJS.ColoredRectangle} coloredRectangle Colored rectangle to draw.
     */
    drawRectangle(coloredRectangle)
    {
        // set shader
        this._setShapesShaderIfNeeded();

        // draw rectangle
        this.shader.draw(coloredRectangle, this._viewport);
    }

    /**
     * Draw a single pixel.
     * @param {PintarJS.Pixel} pixel Pixel to draw.
     */
    drawPixel(pixel)
    {
        // set shader
        this._setShapesShaderIfNeeded();

        // draw pixel
        this.shader.draw(pixel, this._viewport);
    }
    
    /**
     * Draw a colored line.
     * @param {PintarJS.ColoredLine} coloredLine Line to draw.
     */
    drawLine(coloredLine)
    {
        // set shader
        this._setShapesShaderIfNeeded();

        // draw colored line
        this.shader.draw(coloredLine, this._viewport);
    }
    
    /**
     * Create and return a render target.
     * @param {PintarJS.Point} size Texture size.
     */
    createRenderTarget(size)
    {     
        // reset shader
        this.shader = null;

        // create a texture
        const gl = this._gl;
        const targetTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, targetTexture);

        // define size and format of level 0
        const level = 0;
        const internalFormat = gl.RGBA;
        const border = 0;
        const format = gl.RGBA;
        const type = gl.UNSIGNED_BYTE;
        const data = null;
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                        size.x, size.y, border,
                        format, type, data);

        // set the filtering so we don't need mips
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        
        // create the framebuffer
        const fb = gl.createFramebuffer();

        // create and return render target
        var ret = new RenderTarget(size, {fb: fb, texture: targetTexture});
        
        // store texture internal handle
        ret._glTextures = {};
        ret._glTextures[gl.RGBA] = ret._glTextures[gl.RGB] = ret._glTextures[gl.LUMINANCE] = targetTexture;

        // return default shader
        this._setSpritesShaderIfNeeded();
        ret.isReady = true;

        // return render target
        return ret;
    }
    
    /**
     * Set currently active render target, or null to remove render target.
     * @param {PintarJS.RenderTarget} renderTarget Render target to set.
     */
    setRenderTarget(renderTarget)
    {
        // get gl
        const gl = this._gl;

        // set current render target
        this._renderTarget = renderTarget;
        this._updateShaderResolution();

        // if we just canceled render targer, reset viewport and stop here
        if (!renderTarget) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
            return;
        }

        // get render target data
        const data = renderTarget._data;

        // render to our targetTexture by binding the framebuffer
        gl.bindFramebuffer(gl.FRAMEBUFFER, data.fb);

        // attach the texture as the first color attachment
        const attachmentPoint = gl.COLOR_ATTACHMENT0;
        gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, data.texture, 0);
    }
}

// export WebGlRenderer
module.exports = WebGlRenderer;