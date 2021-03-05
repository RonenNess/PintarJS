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
const Texture = require('../../texture');

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
   
    /**
     * Draw a rectangle.
     * @param {PintarJS.ColoredRectangle} coloredRectangle Colored rectangle to draw.
     */
    drawRectangle(coloredRectangle)
    {
        // save current context state
        this._ctx.save();

        // set blend mode
        this._setBlendMode(coloredRectangle.blendMode);

        // set line width
        this._ctx.lineWidth = coloredRectangle.pixelScale || 1;

        // draw filled rectangle
        if (coloredRectangle.filled)
        {     
            this._ctx.fillStyle = coloredRectangle.color.asHex();
            this._ctx.fillRect(coloredRectangle.position.x, coloredRectangle.position.y, coloredRectangle.width, coloredRectangle.height);
        }
        // draw rectangle stroke
        else
        {
            this._ctx.strokeStyle = coloredRectangle.color.asHex();
            this._ctx.strokeRect(coloredRectangle.position.x, coloredRectangle.position.y, coloredRectangle.width, coloredRectangle.height);
        }

        // restore ctx after drawing
        this._ctx.restore();
    }    

    /**
     * Create and return an empty texture.
     * @param {PintarJS.Point} size Texture size.
     */
    createEmptyTexture(size)
    {
        return new Texture(size);
    }

    /**
     * Draw a single pixel.
     * @param {PintarJS.Pixel} pixel Pixel to draw.
     */
    drawPixel(pixel)
    {
        this._ctx.fillStyle = pixel.color.asHex();
        this._ctx.lineWidth = 1;
        this._ctx.fillRect(pixel.position.x, pixel.position.y, pixel.pixelScale, pixel.pixelScale);
    }
    
    /**
     * Draw a colored line.
     * @param {PintarJS.ColoredLine} coloredLine Line to draw.
     */
    drawLine(coloredLine)
    {
        this._ctx.save();
        this._setBlendMode(coloredLine.blendMode);
        this._ctx.strokeStyle = coloredLine.color.asHex();
        this._ctx.lineWidth = coloredLine.pixelScale || 1;
        this._ctx.beginPath();
        this._ctx.moveTo(coloredLine.position.x, coloredLine.position.y);
        this._ctx.lineTo(coloredLine.toPosition.x, coloredLine.toPosition.y);
        this._ctx.stroke();
        this._ctx.restore();
    }
}

// export CanvasRenderer
module.exports = CanvasRenderer;