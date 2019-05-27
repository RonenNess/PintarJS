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
        this.size = options.size || Sprite.defaults.size;
        this.scale = (options.scale || Sprite.defaults.scale).clone();
        this.sourceRectangle = (options.sourceRectangle || this.sourceRectangle).clone();
        this.smoothingEnabled = options.smoothingEnabled || Sprite.defaults.smoothingEnabled;
        this.origin = (options.origin || Sprite.defaults.origin).clone();
        this.rotation = options.rotation || 0;
        this.brightness = options.brightness || 1;
        this.colorBoost = (options.colorBoost || Sprite.defaults.colorBoost).clone();
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
     * Set sprite size (set width and height properties).
     */
    set size(val)
    {
        this.width = val.x;
        this.height = val.y;
    }

    /**
     * Get sprite size (Point with width and height properties).
     */
    get size()
    {
        return new Point(this.width, this.height);
    }

    /**
     * Get source rectangle with 0-1 values, based on currently loaded texture.
     */
    get sourceRectangleRelative()
    {
        if (!this._sourceRectangleRelative || !this._lastSrcRect.equals(this.sourceRectangle) || isNaN(this._sourceRectangleRelative.width)) {
            this._lastSrcRect = this.sourceRectangle.clone();
            var twidth = this.texture.width;
            var theight = this.texture.height;
            this._sourceRectangleRelative = new Rectangle(
                this.sourceRectangle.x / twidth, 
                this.sourceRectangle.y / theight, 
                (this.sourceRectangle.width || this.texture.width) / twidth, 
                (this.sourceRectangle.height || this.texture.height) / theight);
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
        ret.skew = this.skew.clone();
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
    size: new Point(64, 64),
}

// export Sprite
module.exports = Sprite;