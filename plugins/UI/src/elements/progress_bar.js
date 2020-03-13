/**
 * file: progress_bar.js
 * description: Implement a progress bar element.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";
const Container = require('./container');
const PintarJS = require('../pintar');
const SlicedSprite = require('./sliced_sprite');
const Sprite = require('./sprite');
const Anchors = require('../anchors');
const SizeModes = require('../size_modes');
const Utils = require('../utils');

/**
 * Implement a progressbar element.
 */
class ProgressBar extends Container
{
    /**
     * Create a progressbar element.
     * @param {Object} theme
     * @param {PintarJS.Texture} theme.ProgressBar[skin].texture Texture to use.
     * @param {PintarJS.Rectangle} theme.ProgressBar[skin].fillExternalSourceRect The entire source rect, including frame and fill, of the fill sprite.
     * @param {PintarJS.Rectangle} theme.ProgressBar[skin].fillInternalSourceRect The internal source rect of the fill sprite (must be contained inside the external source rect).
     * @param {PintarJS.Rectangle} theme.ProgressBar[skin].fillSourceRect Source rect for fill sprite, when not using 9-sliced sprite (cannot use with fillExternalSourceRect / fillInternalSourceRect).
     * @param {PintarJS.Color} theme.ProgressBar[skin].fillColor (Optional) Progressbar fill color.
     * @param {PintarJS.Rectangle} theme.ProgressBar[skin].backgroundExternalSourceRect The entire source rect, including frame and fill, of the background sprite.
     * @param {PintarJS.Rectangle} theme.ProgressBar[skin].backgroundInternalSourceRect The internal source rect of the background sprite (must be contained inside the external source rect).
     * @param {PintarJS.Rectangle} theme.ProgressBar[skin].backgroundSourceRect Source rect for background sprite, when not using 9-sliced sprite (cannot use with backgroundExternalSourceRect / backgroundInternalSourceRect).
     * @param {PintarJS.Color} theme.ProgressBar[skin].backgroundColor (Optional) Progressbar background color.
     * @param {PintarJS.Rectangle} theme.ProgressBar[skin].foregroundExternalSourceRect The entire source rect, including frame and fill, of an optional foreground sprite.
     * @param {PintarJS.Rectangle} theme.ProgressBar[skin].foregroundInternalSourceRect The internal source rect of the foreground sprite (must be contained inside the external source rect).
     * @param {PintarJS.Rectangle} theme.ProgressBar[skin].foregroundSourceRect Source rect for foreground sprite, when not using 9-sliced sprite (cannot use with foregroundExternalSourceRect / foregroundInternalSourceRect).
     * @param {PintarJS.Color} theme.ProgressBar[skin].foregroundColor (Optional) Progressbar foreground color.
     * @param {Number} theme.ProgressBar[skin].textureScale (Optional) Frame and fill texture scale for both background and progressbar fill.
     * @param {PintarJS.Point} theme.ProgressBar[skin].fillOffset (Optional) Fill part offset from its base position. By default, with offset 0,0, fill part will start from the background's top-left corner.
     * @param {Number} theme.ProgressBar[skin].height (Optional) Progressbar height (if not defined, will base on texture source rectangle).
     * @param {Number} theme.ProgressBar[skin].animationSpeed (Optional) Animation speed when value changes (if 0, will show new value immediately).
     * @param {PintarJS.UI.Anchors} theme.ProgressBar[skin].fillAnchor (Optional) Anchor type for the fill part. Defaults to Top-Left.
     * @param {Boolean} theme.ProgressBar[skin].valueSetWidth (Optional) If true (default), progressbar value will set the fill width.
     * @param {Boolean} theme.ProgressBar[skin].valueSetHeight (Optional) If true (not default), progressbar value will set the fill height.
     * @param {String} skin Element skin to use from theme.
     * @param {Object} override Optional override options (can override any of the theme properties listed above).
     */
    constructor(theme, skin, override)
    {
        super();

        // get options from theme and skin type
        var options = this.getOptionsFromTheme(theme, skin, override);
        this.setBaseOptions(options);

        // sanity checks
        if (options.foregroundSourceRect && (options.foregroundExternalSourceRect || options.foregroundInternalSourceRect)) {
            throw new Error("Option 'foregroundSourceRect' cannot appear with options 'foregroundExternalSourceRect' or 'foregroundInternalSourceRect'!");
        }
        if (options.fillSourceRect && (options.fillInternalSourceRect || options.fillExternalSourceRect)) {
            throw new Error("Option 'fillSourceRect' cannot appear with options 'fillInternalSourceRect' or 'fillExternalSourceRect'!");
        }
        if (options.backgroundSourceRect && (options.backgroundInternalSourceRect || options.backgroundExternalSourceRect)) {
            throw new Error("Option 'backgroundSourceRect' cannot appear with options 'backgroundInternalSourceRect' or 'backgroundExternalSourceRect'!");
        }

        // store fill offset
        this.fillOffset = this.__getFromOptions(options, 'fillOffset', PintarJS.Point.zero());

        // get texture scale
        var textureScale = this._textureScale = this.__getFromOptions(options, 'textureScale', 1);

        // get texture
        var texture = this.__getFromOptions(options, 'texture');

        // create background sprite as regular UI sprite
        var backgroundSourceRect = this.__getFromOptions(options, 'backgroundSourceRect');
        if (backgroundSourceRect) {
            this._backgroundSprite = new Sprite({texture: texture, 
                sourceRect: backgroundSourceRect, 
                textureScale: textureScale});
        }
        // create background sprite as 9-sliced sprite
        else if (options.backgroundExternalSourceRect) {
            var backgroundExternalSourceRect = this.__getFromOptions(options, 'backgroundExternalSourceRect');
            var backgroundInternalSourceRect = this.__getFromOptions(options, 'backgroundInternalSourceRect');
            this._backgroundSprite = new SlicedSprite({texture: texture, 
                externalSourceRect: backgroundExternalSourceRect, 
                internalSourceRect: backgroundInternalSourceRect, 
                textureScale: textureScale}, '_');
        }
        else
        {
            throw new Error("Progress bars must have a background sprite!");
        }
        // set other background properties
        this._backgroundSprite.color = this.__getFromOptions(options, 'backgroundColor', PintarJS.Color.white());
        this._backgroundSprite.anchor = Anchors.Fixed;

        // create fill sprite as regular UI sprite
        var fillSourceRect = this.__getFromOptions(options, 'fillSourceRect');
        if (fillSourceRect) {
            this.spriteFillSourceRect = fillSourceRect;
            this._fillSprite = new Sprite({texture: texture, 
                sourceRect: fillSourceRect, 
                textureScale: textureScale});
        }
        // create fill sprite as 9-sliced sprite
        else if (options.fillExternalSourceRect) {
            var fillExternalSourceRect = this.__getFromOptions(options, 'fillExternalSourceRect');
            var fillInternalSourceRect = this.__getFromOptions(options, 'fillInternalSourceRect');
            this._fillSprite = new SlicedSprite({texture: texture, 
                externalSourceRect: fillExternalSourceRect, 
                internalSourceRect: fillInternalSourceRect, 
                textureScale: textureScale}, '_');
        }
        // no fill??
        else
        {
            throw new Error("Missing progressbar fill part source rect!");
        }

        // set fill other properties
        var fillRect = this.__getFromOptions(options, 'fillExternalSourceRect') || this.__getFromOptions(options, 'fillSourceRect');
        var backRect = this.__getFromOptions(options, 'backgroundExternalSourceRect') || this.__getFromOptions(options, 'backgroundSourceRect');
        this._fillSprite.color = this.__getFromOptions(options, 'fillColor', PintarJS.Color.white());
        this._fillSprite.anchor = Anchors.Fixed;
        this._fillWidthToRemove = backRect ? Math.round(backRect.width - fillRect.width) : 0;
        this._fillHeightToRemove = backRect ? Math.round(backRect.height - fillRect.height) : 0;

        // create optional foreground sprite as regular UI sprite
        var foregroundSourceRect = this.__getFromOptions(options, 'foregroundSourceRect');
        if (foregroundSourceRect) {
            this._foregroundSprite = new Sprite({texture: texture, 
                sourceRect: foregroundSourceRect, 
                textureScale: textureScale});
        }
        // create optional foreground sprite as 9-sliced sprite
        else if (options.foregroundExternalSourceRect) {
            var foregroundExternalSourceRect = this.__getFromOptions(options, 'foregroundExternalSourceRect');
            var foregroundInternalSourceRect = this.__getFromOptions(options, 'foregroundInternalSourceRect');
            this._foregroundSprite = new SlicedSprite({texture: texture, 
                externalSourceRect: foregroundExternalSourceRect, 
                internalSourceRect: foregroundInternalSourceRect, 
                textureScale: textureScale}, '_');
        }
        // set other foreground sprite properties
        if (this._foregroundSprite) {
            this._foregroundSprite.color = this.__getFromOptions(options, 'foregroundColor', PintarJS.Color.white());
            this._foregroundSprite.anchor = Anchors.Fixed;
        }

        // store fill part anchor
        this.fillPartAnchor = this.__getFromOptions(options, 'fillAnchor', Anchors.TopLeft);

        // store if setting width / height
        this._setWidth = Boolean(this.__getFromOptions(options, 'valueSetWidth', true));
        this._setHeight = Boolean(this.__getFromOptions(options, 'valueSetHeight'));

        // calculate progressbar default height and width
        // when using regular sprite
        var fillSourceRect = this.__getFromOptions(options, 'fillSourceRect');
        if (fillSourceRect) {
            this.size.y = fillSourceRect.height * textureScale;
            this.size.x = fillSourceRect.width * textureScale;
        }
        // when using sliced sprite, set default size based on mode
        else
        {
            if (this._setWidth && !this._setHeight) {
                this.size.y = this.__getFromOptions(options, 'height') || (((backRect || fillRect).height) * textureScale);
                this.size.x = 100;
                this.size.xMode = SizeModes.Percents;
            }
            else if (this._setHeight && !this._setWidth) {
                this.size.x = this.__getFromOptions(options, 'width') || (((backRect || fillRect).width) * textureScale);
                this.size.y = this.__getFromOptions(options, 'height') || 100;
            }
        }

        // store animation speed
        this.animationSpeed = this.__getFromOptions(options, 'animationSpeed', 0);

        // set starting value
        this._displayValue = this.value = 0;
    }

    /**
     * Get required options for this element type.
     */
    get requiredOptions()
    {
        return ['texture'];
    }

    /**
     * Get progressbar fill color.
     */
    get fillColor()
    {
        return this._fillSprite.color;
    }

    /**
     * Set progressbar fill color.
     */
    set fillColor(color)
    {
        this._fillSprite.color = color;
    }

    /**
     * Get progressbar fill blend mode.
     */
    get fillBlendMode()
    {
        return this._fillSprite.blendMode;
    }

    /**
     * Set progressbar fill blend mode.
     */
    set fillBlendMode(blendMode)
    {
        this._fillSprite.blendMode = blendMode;
    }

    /**
     * Make display value be the same of value right now, regardless of animation speed.
     * Useful when you want to usually have animation, but set the starting value immediately.
     */
    matchDisplayToValue()
    {
        this._displayValue = this.value;
    }

    /**
     * Set value from value and max.
     * @param {Number} value Current value.
     * @param {Number} max Max value.
     */
    setFromValueAndMax(value, max)
    {
        // special case
        if (max <= 0 || value <= 0) {
            this.value = 0;
            return;
        }

        // set value
        this.value = Math.min(value / max, 1);
    }

    /**
     * Draw the UI element.
     */
    drawImp(pintar, boundingBoxOverride)
    {
        // get dest rect
        var dest = boundingBoxOverride || this.getBoundingBox();

        // draw background
        this._backgroundSprite.offset = dest.getPosition();
        this._backgroundSprite.size = dest.getSize();
        this._backgroundSprite.draw(pintar);

        // draw fill
        var value = this._displayValue;
        if (value > 0)
        {
            // update source rect for single sprite mode
            if (this.spriteFillSourceRect) 
            {
                // reset source rect
                this._fillSprite.sourceRectangle = this.spriteFillSourceRect.clone();

                // update width
                if (this._setWidth) {
                    this._fillSprite.sourceRectangle.width = Math.floor((this._backgroundSprite.sourceRectangle.width - this._fillWidthToRemove) * value);
                    this._fillSprite.size.x = this._fillSprite.sourceRectangle.width * this._textureScale;
                    if (this.fillPartAnchor.indexOf("right") !== -1) {
                        this._fillSprite.sourceRectangle.x = Math.floor(this.spriteFillSourceRect.right - this._fillSprite.sourceRectangle.width);
                    }
                }
                // update height
                if (this._setHeight) {
                    this._fillSprite.sourceRectangle.height = Math.floor((this._backgroundSprite.sourceRectangle.height - this._fillHeightToRemove) * value);
                    this._fillSprite.size.y = this._fillSprite.sourceRectangle.height * this._textureScale;
                    if (this.fillPartAnchor.indexOf("Bottom") !== -1) {
                        this._fillSprite.sourceRectangle.y = Math.floor(this.spriteFillSourceRect.bottom - this._fillSprite.sourceRectangle.height);
                    }
                }

                // update offset
                this._fillSprite.offset = this.getDestTopLeftPositionForRect(dest, this._fillSprite.size, this.fillPartAnchor, this.fillOffset);
            }
            // update size and offset for 9-slice texture
            else
            {
                this._fillSprite.size.x = Math.floor((this._backgroundSprite.size.x - (this._fillWidthToRemove * this._textureScale)) * (this._setWidth ? value : 1));
                this._fillSprite.size.y = Math.floor((this._backgroundSprite.size.y - (this._fillHeightToRemove * this._textureScale)) * (this._setHeight ? value : 1));
                this._fillSprite.offset = this.getDestTopLeftPositionForRect(dest, this._fillSprite.size, this.fillPartAnchor, this.fillOffset);    
            }

            // draw sprite
            this._fillSprite.draw(pintar);
        }

         // draw foreground
         if (this._foregroundSprite) 
         {
            this._foregroundSprite.offset = dest.getPosition();
            this._foregroundSprite.size = dest.getSize();
            this._foregroundSprite.draw(pintar);
         }

         // draw children
        super.drawImp(pintar, boundingBoxOverride);
    }

    /**
     * Get the actual value this progressbar currently shows.
     * Can differ from 'this.value' if animate is enabled.
     */
    get displayedValue()
    {
        return this._displayValue;
    }

    /**
     * Get this element value.
     */
    _getValue()
    {
        return this.value;
    }
 
    /**
     * Update the UI element.
     * @param {InputManager} input A class that implements the 'InputManager' API.
     * @param {UIElementState} forceState If provided, this element will copy this state, no questions asked.
     */
    update(input, forceState)
    {
        // if not visible, do nothing
        if (!this.visible) {
            return;
        }

        // call base update
        super.update(input, forceState);

        // update display value
        if (this._displayValue != this.value)
        {
            if (!this.animationSpeed) { 
                this._displayValue = this.value;
            }
            else {
                this._displayValue = Utils.MoveTowards(this._displayValue, this.value, input.deltaTime * this.animationSpeed);
            }
        }
        
        // make sure display value is in range
        if (this._displayValue < 0) this._displayValue = 0;
        if (this._displayValue > 1) this._displayValue = 1;
    }
}

module.exports = ProgressBar; 