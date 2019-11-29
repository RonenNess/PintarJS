/**
 * file: button.js
 * description: Implement a button element.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";
const UIElement = require('./ui_element');
const PintarJS = require('./pintar');
const SizeModes = require('./size_modes');
const SlicedSprite = require('./sliced_sprite');
const Paragraph = require('./paragraph');
const Anchors = require('./anchors');


/**
 * Implement a button element.
 */
class Button extends UIElement
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
            this.paragraph.anchor = Anchors.Fixed;
            this.paragraph.alignment = "center";
            this.paragraph.size.xMode = SizeModes.Pixels;
        }

        // create default sprite
        this._sprite = new SlicedSprite({texture: options.texture, 
            externalSourceRect: options.externalSourceRect, 
            internalSourceRect: options.internalSourceRect, 
            textureScale: textureScale});
        this._sprite.anchor = Anchors.Fixed;
    }

    /**
     * Get required options for this element type.
     */
    get requiredOptions()
    {
        return ["texture", "externalSourceRect", "internalSourceRect"];
    }

    /**
     * Draw the UI element.
     */
    draw(pintar)
    {
        // get dest rect
        var destRect = this.getBoundingBox();

        // draw button
        this._sprite.offset = destRect.getPosition();
        this._sprite.size = destRect.getSize();
        this._sprite.draw(pintar);

        // draw text
        if (this.paragraph) 
        {
            this.paragraph.offset = destRect.getPosition();
            this.paragraph.offset.x += destRect.width / 2;
            this.paragraph.offset.y += destRect.height / 2;
            this.paragraph.size.x = destRect.width;
            this.paragraph.draw(pintar);
        }
    }
}

module.exports = Button; 