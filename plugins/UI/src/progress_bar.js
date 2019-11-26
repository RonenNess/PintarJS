/**
 * file: progress_bar.js
 * description: Implement a progress bar element.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";
const UIElement = require('./ui_element');
const PintarJS = require('./pintar');
const SlicedSprite = require('./sliced_sprite');
const Anchors = require('./anchors');
const SizeModes = require('./size_modes');
const Utils = require('./utils');

/**
 * Implement a progressbar element.
 */
class ProgressBar extends UIElement
{
    /**
     * Create a progressbar element.
     * @param {Object} theme
     * @param {PintarJS.Texture} theme.ProgressBar[skin].texture Texture to use.
     * @param {PintarJS.Rectangle} theme.ProgressBar[skin].fillExternalSourceRect The entire source rect, including frame and fill, of the fill sprite.
     * @param {PintarJS.Rectangle} theme.ProgressBar[skin].fillInternalSourceRect The internal source rect of the fill sprite (must be contained inside the whole source rect).
     * @param {PintarJS.Color} theme.ProgressBar[skin].fillColor (Optional) Progressbar fill color.
     * @param {PintarJS.Rectangle} theme.ProgressBar[skin].backgroundExternalSourceRect The entire source rect, including frame and fill, of the background sprite.
     * @param {PintarJS.Rectangle} theme.ProgressBar[skin].backgroundInternalSourceRect The internal source rect of the background sprite (must be contained inside the whole source rect).
     * @param {PintarJS.Color} theme.ProgressBar[skin].backgroundColor (Optional) Progressbar background color.
     * @param {PintarJS.Rectangle} theme.ProgressBar[skin].foregroundExternalSourceRect The entire source rect, including frame and fill, of an optional foreground sprite.
     * @param {PintarJS.Rectangle} theme.ProgressBar[skin].foregroundInternalSourceRect The internal source rect of the foreground sprite (must be contained inside the whole source rect).
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

        // store fill offset
        this.fillOffset = options.fillOffset || PintarJS.Point.zero();

        // get texture scale
        var textureScale = options.textureScale || 1;

        // create background sprite
        this.backgroundSprite = new SlicedSprite({texture: options.texture, 
            externalSourceRect: options.backgroundExternalSourceRect, 
            internalSourceRect: options.backgroundInternalSourceRect, 
            textureScale: textureScale});
        this.backgroundSprite.color = options.backgroundColor || PintarJS.Color.white();
        this.backgroundSprite.anchor = Anchors.Fixed;
        this.backgroundSprite.sizeMode = SizeModes.Pixels;

        // create fill sprite
        this.fillSprite = new SlicedSprite({texture: options.texture, 
            externalSourceRect: options.fillExternalSourceRect, 
            internalSourceRect: options.fillInternalSourceRect, 
            textureScale: textureScale});
        this.fillSprite.color = options.fillColor || PintarJS.Color.white();
        this.fillSprite.anchor = Anchors.Fixed;
        this.fillSprite.sizeMode = SizeModes.Pixels;
        this.fillWidthToRemove = Math.round(options.backgroundExternalSourceRect.width - options.fillExternalSourceRect.width) * textureScale;
        this.fillHeightToRemove = Math.round(options.backgroundExternalSourceRect.height - options.fillExternalSourceRect.height) * textureScale;

        // create optional foreground sprite
        if (options.foregroundExternalSourceRect) {
            this.foregroundSprite = new SlicedSprite({texture: options.texture, 
                externalSourceRect: options.foregroundExternalSourceRect, 
                internalSourceRect: options.foregroundInternalSourceRect, 
                textureScale: textureScale});
            this.foregroundSprite.color = options.foregroundColor || PintarJS.Color.white();
            this.foregroundSprite.anchor = Anchors.Fixed;
            this.foregroundSprite.sizeMode = SizeModes.Pixels;
        }

        // store fill part anchor
        this.fillPartAnchor = options.fillAnchor || Anchors.TopLeft;

        // calculate progressbar default height and width
        this.size.y = options.height || (options.backgroundExternalSourceRect.height * textureScale);
        this.size.x = 100;
        this.size.xMode = SizeModes.Percents;

        // store animation speed
        this.animationSpeed = options.animationSpeed || 0;

        // store if set width and height
        if (options.valueSetWidth === undefined) { options.valueSetWidth = true; }
        this.setWidth = Boolean(options.valueSetWidth);
        this.setHeight = Boolean(options.valueSetHeight);

        // set starting value
        this._displayValue = this.value = 0;
    }

    /**
     * Get required options for this element type.
     */
    get requiredOptions()
    {
        return ['texture', 'fillExternalSourceRect', 'fillInternalSourceRect', 'backgroundExternalSourceRect', 'backgroundInternalSourceRect'];
    }

    /**
     * Get progressbar fill color.
     */
    get fillColor()
    {
        return this.fillSprite.color;
    }

    /**
     * Set progressbar fill color.
     */
    set fillColor(color)
    {
        this.fillSprite.color = color;
    }

    /**
     * Get progressbar fill blend mode.
     */
    get fillBlendMode()
    {
        return this.fillSprite.blendMode;
    }

    /**
     * Set progressbar fill blend mode.
     */
    set fillBlendMode(blendMode)
    {
        this.fillSprite.blendMode = blendMode;
    }

    /**
     * Draw the UI element.
     */
    draw(pintar)
    {
        // get dest rect
        var dest = this.getBoundingBox();

        // draw background
        this.backgroundSprite.offset = dest.getPosition();
        this.backgroundSprite.size = dest.getSize();
        this.backgroundSprite.draw(pintar);

        // draw fill
        var value = this._displayValue;
        if (value > 0)
        {
            this.fillSprite.size.x = (this.backgroundSprite.size.x - this.fillWidthToRemove) * (this.setWidth ? value : 1);
            this.fillSprite.size.y = (this.backgroundSprite.size.y - this.fillHeightToRemove) * (this.setHeight ? value : 1);;
            this.fillSprite.offset = this.getDestTopLeftPositionForRect(dest, this.fillSprite.size, this.fillPartAnchor, this.fillOffset);
            this.fillSprite.draw(pintar);
        }

         // draw foreground
         if (this.foregroundSprite) 
         {
            this.foregroundSprite.offset = dest.getPosition();
            this.foregroundSprite.size = dest.getSize();
            this.foregroundSprite.draw(pintar);
         }
    }
 
    /**
     * Update the UI element.
     * @param {InputManager} input A class that implements the 'InputManager' API.
     */
    update(input)
    {
        // call base update
        super.update(input);

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