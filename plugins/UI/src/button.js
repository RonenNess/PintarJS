/**
 * file: button.js
 * description: Implement a button element.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";
const Container = require('./container');
const PintarJS = require('./pintar');
const SizeModes = require('./size_modes');
const SlicedSprite = require('./sliced_sprite');
const Paragraph = require('./paragraph');
const Anchors = require('./anchors');


/**
 * Implement a button element.
 */
class Button extends Container
{

    /**
     * Create a button element.
     * @param {Object} theme
     * @param {PintarJS.Texture} theme.Button[skin].texture Texture to use.
     * @param {PintarJS.Rectangle} theme.Button[skin].externalSourceRect The entire source rect, including frame and fill, of the button.
     * @param {PintarJS.Rectangle} theme.Button[skin].internalSourceRect The internal source rect of the button (must be contained inside the external source rect).
     * @param {PintarJS.Rectangle} theme.Button[skin].mouseHoverExternalSourceRect The entire source rect, including frame and fill, of the button - when mouse hover over it.
     * @param {PintarJS.Rectangle} theme.Button[skin].mouseHoverInternalSourceRect The internal source rect of the button - when mouse hover over it (must be contained inside the external source rect).
     * @param {PintarJS.Rectangle} theme.Button[skin].mouseDownExternalSourceRect The entire source rect, including frame and fill, of the button - when mouse presses it.
     * @param {PintarJS.Rectangle} theme.Button[skin].mouseDownInternalSourceRect The internal source rect of the button - when mouse presses it (must be contained inside the external source rect).
     * @param {String} theme.Button[skin].paragraphSkin Skin to use for button's paragraph.
     * @param {Number} theme.Button[skin].textureScale (Optional) Texture scale for button. 
     */
    constructor(theme, skin, override)
    {
        super();

        // get options from theme and skin type
        var options = this.getOptionsFromTheme(theme, skin, override);
        this.setBaseOptions(options);
        
        // by default buttons take full width
        this.size.x = 100;
        this.size.xMode = SizeModes.Percents;

        // get texture scale
        var textureScale = (options.textureScale || 1);

        // set height
        this.size.y = options.externalSourceRect.height * textureScale;
        this.size.yMode = SizeModes.Pixels;

        // create button paragraph
        if (options.paragraphSkin) {
            this.paragraph = new Paragraph(theme, options.paragraphSkin);
            this.paragraph._setParent(this);
            this.paragraph.anchor = Anchors.Center;
            this.paragraph.alignment = "center";
        }

        // create default sprite
        if (options.externalSourceRect) {
            this._sprite = new SlicedSprite({texture: options.texture, 
                externalSourceRect: options.externalSourceRect, 
                internalSourceRect: options.internalSourceRect, 
                textureScale: textureScale});
            this._sprite.anchor = Anchors.Fixed;
        }

        // create sprite for hover
        if (options.mouseHoverExternalSourceRect) {
            this._spriteHover = new SlicedSprite({texture: options.texture, 
                externalSourceRect: options.mouseHoverExternalSourceRect, 
                internalSourceRect: options.mouseHoverInternalSourceRect, 
                textureScale: textureScale});
            this._spriteHover.anchor = Anchors.Fixed;
        }
        else {
            this._spriteHover = this._sprite;
        }
        
        // create sprite for down
        if (options.mouseDownExternalSourceRect) {
            this._spriteDown = new SlicedSprite({texture: options.texture, 
                externalSourceRect: options.mouseDownExternalSourceRect, 
                internalSourceRect: options.mouseDownInternalSourceRect, 
                textureScale: textureScale});
            this._spriteDown.anchor = Anchors.Fixed;
        }
        else {
            this._spriteDown = this._spriteHover || this._sprite;
        }
    }

    /**
     * Get required options for this element type.
     */
    get requiredOptions()
    {
        return ["texture", "externalSourceRect", "internalSourceRect"];
    }

    /**
     * Get if this element is / can be interactive.
     */
    get interactive()
    {
        return true;
    }

    /**
     * Draw the UI element.
     */
    draw(pintar)
    {
        // get dest rect
        var destRect = this.getBoundingBox();

        // decide which sprite to draw based on state
        var sprite = this._sprite;
        if (this._state.mouseDown) sprite = this._spriteDown;
        else if (this._state.mouseHover) sprite = this._spriteHover;

        // draw button
        if (sprite) {
            sprite.offset = destRect.getPosition();
            sprite.size = destRect.getSize();
            sprite.draw(pintar);
        }

        // draw text
        if (this.paragraph) 
        {
            this.paragraph.draw(pintar);
        }
    }
}

module.exports = Button; 