/**
 * file: slider.js
 * description: Implement a slider element.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";
const Container = require('./container');
const PintarJS = require('../pintar');
const SizeModes = require('../size_modes');
const SlicedSprite = require('./sliced_sprite');
const Paragraph = require('./paragraph');
const Anchors = require('../anchors');
const Cursors = require('../cursor_types');


/**
 * Implement a slider element.
 */
class Slider extends Container
{
    /**
     * Create a slider element.
     * @param {Object} theme
     * @param {PintarJS.Texture} theme.Slider[skin].texture Texture to use.
     * @param {PintarJS.Rectangle} theme.Slider[skin].middleSourceRect The source rect of the line center part (repeating).
     * @param {PintarJS.Rectangle} theme.Slider[skin].startSourceRect The source rect of the line left side edge.
     * @param {PintarJS.Rectangle} theme.Slider[skin].endSourceRect The source rect of the line right side edge.
     * @param {PintarJS.Rectangle} theme.Slider[skin].handleSourceRect The source rect of the handle you can use to change slider value.
     * @param {String} theme.Slider[skin].direction (Optional) Slider direction, either 'horizontal' (default) or 'vertical'.
     * @param {Number} theme.Slider[skin].textureScale (Optional) Texture scale of the button. 
     * @param {String} skin Element skin to use from theme.
     * @param {Object} override Optional override options (can override any of the theme properties listed above).
     */
    constructor(theme, skin, override)
    {
        super();

        // get options from theme and skin type
        var options = this.getOptionsFromTheme(theme, skin, override);
        this.setBaseOptions(options);

        // get texture scale
        var textureScale = (options.textureScale || 1);

        throw new Error("TODO")

        // set min, max and should round values
        this._min = 0;
        this._max = 100;
        this._roundValues = true;

        // set starting value
        this.value = 50;
    }

    /**
     * Get required options for this element type.
     */
    get requiredOptions()
    {
        return ["texture", "middleSourceRect", "handleSourceRect"];
    }

    /**
     * Get min value.
     */
    get min()
    {
        return this._min;
    }

    /**
     * Set min value.
     */
    set min(val)
    {
        this._min = val;
        this.value = this.value;
    }

    /**
     * Get max value.
     */
    get max()
    {
        return this._max;
    }

    /**
     * Set max value.
     */
    set max(val)
    {
        this._max = val;
        this.value = this.value;
    }

    /**
     * Get if should round values
     */
    get roundValue()
    {
        return this._roundValues;
    }

    /**
     * Set if should round values.
     */
    set roundValue(val)
    {
        this._roundValues = Boolean(val);
        this.value = this.value;
    }

    /**
     * Get current value.
     */
    get value()
    {
        return this._value;
    }

    /**
     * Set current value.
     */
    set value(val)
    {
        this._value = val;
    }

    /**
     * Clamp and validate value range.
     */
    _clampValue(val)
    {
        if (this._roundValues) { val = Math.round(val); }
        if (val < this.min) { val = this.min; }
        if (val > this.max) { val = this.max; }
        return val;
    }

    /**
     * Get if this element is interactive by default.
     * Elements that are not interactive will not trigger events or run the update loop.
     */
    get isNaturallyInteractive()
    {
        return true;
    }
     
    /**
     * Default cursor type for this element.
     */
    get _defaultCursor()
    {
        return Cursors.Pointer;
    }

    /**
     * Draw the UI element.
     */
    draw(pintar)
    {
        // get dest rect
        var destRect = this.getBoundingBox();

        throw new Error("TODO")
    }

    /**
     * Get this slider value.
     */
    _getValue()
    {
        return this.value;
    }
}

module.exports = Slider; 