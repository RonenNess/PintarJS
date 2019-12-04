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
const HorizontalLine = require('./horizontal_line');
const VerticalLine = require('./vertical_line');
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
     * @param {String} theme.Slider[skin].lineSkin Skin to use for the background line, either for HorizontalLine or VerticalLine, depends if horizontal or vertical.
     * @param {PintarJS.Rectangle} theme.Slider[skin].middleSourceRect The source rect of the line center part (repeating).
     * @param {PintarJS.Rectangle} theme.Slider[skin].startEdgeSourceRect The source rect of the line starting edge (left or top).
     * @param {PintarJS.Rectangle} theme.Slider[skin].endEdgeSourceRect The source rect of the line ending edge (right or bottom).
     * @param {PintarJS.Rectangle} theme.Slider[skin].handleSourceRect The source rect of the handle you can use to change slider value.
     * @param {PintarJS.Rectangle} theme.Slider[skin].handleOffset (Optional) Handle offset, in pixels.
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

        // get direction
        this._direction = options.direction || "horizontal";

        // set min, max and if should round values
        this._min = 0;
        this._max = 100;
        this._roundValues = true;

        // create the line part of the slider
        this._line = new {horizontal: HorizontalLine, vertical: VerticalLine}[this._direction](options, '_');
        this._line._setParent(this);

        // set default size
        if (this._direction === "horizontal") {
            this.size.x = 100;
            this.size.xMode = SizeModes.Percents;
        }
        else {
            this.size.y = 100;
            this.size.yMode = SizeModes.Percents;
        }

        // start piece offset
        this._startOffset = options.startEdgeSourceRect ? 
        new PintarJS.Point(options.startEdgeSourceRect.width * textureScale, options.startEdgeSourceRect.height * textureScale) : 
        new PintarJS.Point(0, 0);

        // end piece offset
        this._endOffset = options.endEdgeSourceRect ? 
        new PintarJS.Point(options.endEdgeSourceRect.width * textureScale, options.endEdgeSourceRect.height * textureScale) : 
        new PintarJS.Point(0, 0);

        // create handle sprite
        this._handle = new PintarJS.Sprite(options.texture);
        this._handle.sourceRectangle = options.handleSourceRect;
        this._handle.size.set(options.handleSourceRect.width * textureScale, options.handleSourceRect.height * textureScale);

        // set handle offset
        this._handleOffset = options.handleOffset || PintarJS.Point.zero();

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
     * Get value in percents, from 0.0 to 1.0.
     */
    getValuePercent()
    {
        if (this.min == this.max) { return 0; }
        var val = this.value - this.min;
        return val / (this.max - this.min);
    }

    /**
     * Set value from percent.
     * @param {*} val Value, between 0.0 to 1.0.
     */
    setValueFromPercent(val)
    {
        if (val < 0) val = 0;
        if (val > 1) val = 1;
        this.value = this.min + (this.max - this.min) * val;
    }

    /**
     * Draw the UI element.
     */
    draw(pintar)
    {
        // get dest rect
        var destRect = this.getBoundingBox();

        // draw background line
        this._line.draw(pintar);

        // draw handle
        this._handle.position = destRect.getPosition().add(this._handleOffset);
        if (this._direction === "horizontal") 
        {
            var maxWidth = destRect.width - this._startOffset.x - this._endOffset.x;
            this._handle.position.x += this._startOffset.x + maxWidth * this.getValuePercent() - this._handle.size.x / 2;
        }
        else 
        {
            var maxHeight = destRect.height - this._startOffset.y - this._endOffset.y;
            this._handle.position.y += this._startOffset.y + maxHeight * this.getValuePercent();
        }
        pintar.drawSprite(this._handle);
    }

    /**
     * Update this slider.
     */
    update(input, forceStatus)
    {
        // call base update
        super.update(input, forceStatus);

        // check if should update value
        if (this._state.mouseStartPressOnSelf && this._state.mouseDown) 
        {
            // get dest rect
            var destRect = this.getBoundingBox();

            // set value
            if (this._direction === "horizontal") 
            {
                var maxWidth = destRect.width - this._startOffset.x - this._endOffset.x;
                var relativePos = input.mousePosition.x - destRect.x - (this._handle.size.x / 2);
                this.setValueFromPercent(relativePos / maxWidth);
            }
            else 
            {
                var maxHeight = destRect.height - this._startOffset.y - this._endOffset.y;
                var relativePos = input.mousePosition.y - destRect.y - (this._handle.size.y / 2);
                this.setValueFromPercent(relativePos / maxHeight);
            }
        }
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