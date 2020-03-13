/**
 * file: button.js
 * description: Implement a button element.
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
     * @param {String} theme.Button[skin].mouseHoverParagraphSkin Skin to use for button's paragraph when mouse hovers over button.
     * @param {String} theme.Button[skin].mouseDownParagraphSkin Skin to use for button's paragraph when mouse is down over button.
     * @param {Number} theme.Button[skin].heightInPixels (Optional) Button default height in pixels. 
     * @param {Number} theme.Button[skin].textureScale (Optional) Texture scale of the button. 
     * @param {Number} theme.Button[skin].toggleMode (Optional) If true, this button will behave like a checkbox and be toggleable. 
     * @param {Number} theme.Button[skin].color (Optional) Optional color for button skins. 
     * @param {String} skin Element skin to use from theme.
     * @param {Object} override Optional override options (can override any of the theme properties listed above).
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
        var textureScale = this.__getFromOptions(options, 'textureScale', 1);

        // set height
        this.size.y = this.__getFromOptions(options, 'heightInPixels') || 
                        (this.__getFromOptions(options, 'externalSourceRect') ? 
                        (this.__getFromOptions(options, 'externalSourceRect').height * textureScale) : 100);
        this.size.yMode = SizeModes.Pixels;

        // button text
        this.text = null;

        // for toggle mode
        this.isChecked = false;
        this.toggleModeEnabled = this.__getFromOptions(options, 'toggleMode', false);

        // get color
        var color = this.__getFromOptions(options, 'color', PintarJS.Color.white());

        // init button paragraph properties
        var initParagraph = (paragraph) => {
            paragraph._setParent(this);
            paragraph.anchor = Anchors.Center;
            paragraph.alignment = "center";          
        }

        // create button paragraph for default state
        if (options.paragraphSkin) {
            this._paragraph = new Paragraph(theme, options.paragraphSkin);
            initParagraph(this._paragraph);
        }

        // create button paragraph for mouse hover
        if (options.mouseHoverParagraphSkin) {
            this._paragraphHover = new Paragraph(theme, options.mouseHoverParagraphSkin);
            initParagraph(this._paragraphHover);
        }
        else {
            this._paragraphHover = this._paragraph;
        }

        // create button paragraph for mouse down
        if (options.mouseDownParagraphSkin) {
            this._paragraphDown = new Paragraph(theme, options.mouseDownParagraphSkin);
            initParagraph(this._paragraphDown);
        }
        else {
            this._paragraphDown = this._paragraphHover || this._paragraph;
        }

        // get texture
        var texture = this.__getFromOptions(options, 'texture');

        // create default sprite
        if (options.externalSourceRect) {
            this._sprite = new SlicedSprite({texture: texture, 
                externalSourceRect: options.externalSourceRect, 
                internalSourceRect: options.internalSourceRect, 
                textureScale: textureScale}, '_');
            this._sprite.anchor = Anchors.Fixed;
            this._sprite.color = color;
        }

        // create sprite for hover
        if (options.mouseHoverExternalSourceRect) {
            this._spriteHover = new SlicedSprite({texture: texture, 
                externalSourceRect: options.mouseHoverExternalSourceRect, 
                internalSourceRect: options.mouseHoverInternalSourceRect, 
                textureScale: textureScale}, '_');
            this._spriteHover.anchor = Anchors.Fixed;
            this._spriteHover.color = color;
        }
        else {
            this._spriteHover = this._sprite;
        }
        
        // create sprite for down
        if (options.mouseDownExternalSourceRect) {
            this._spriteDown = new SlicedSprite({texture: texture, 
                externalSourceRect: options.mouseDownExternalSourceRect, 
                internalSourceRect: options.mouseDownInternalSourceRect, 
                textureScale: textureScale}, '_');
            this._spriteDown.anchor = Anchors.Fixed;
            this._spriteDown.color = color;
        }
        else {
            this._spriteDown = this._spriteHover || this._sprite;
        }
    }

    /**
     * Called when mouse is released on element.
     */
    _onMouseReleased(input)
    {
        super._onMouseReleased(input);
        if (this.toggleModeEnabled) {
            this.toggle();
        }
    }

    /**
     * Toggle value, only useable when in toggle mode.
     */
    toggle()
    {
        if (!this.toggleModeEnabled) {
            throw new Error("Cannot toggle button that's not in toggle mode!");
        }
        this.isChecked = !this.isChecked;
    }

    /**
     * If true, this element will pass self-state to children, making them copy it.
     */
    get forceSelfStateOnChildren()
    {
        return true;
    }

    /**
     * Get required options for this element type.
     */
    get requiredOptions()
    {
        return [];
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
    drawImp(pintar, boundingBoxOverride)
    {
        // get dest rect
        var destRect = boundingBoxOverride || this.getBoundingBox();

        // decide which sprite to draw based on state
        var sprite = this._sprite;
        if (this.isChecked || this._state.mouseDown) sprite = this._spriteDown;
        else if (this._state.mouseHover) sprite = this._spriteHover;

        // draw button
        if (sprite) 
        {
            sprite.offset = destRect.getPosition();
            sprite.size = destRect.getSize();
            sprite.draw(pintar);
        }

        // draw text
        if (this.text) 
        {
            // decide which text to draw based on state
            var paragraph = this._paragraph;
            if (this._state.mouseDown) paragraph = this._paragraphDown;
            else if (this._state.mouseHover) paragraph = this._paragraphHover;

            // draw text
            if (paragraph) 
            {
                paragraph.text = this.text;
                paragraph.draw(pintar);
            }
        }

        // draw children
        super.drawImp(pintar, boundingBoxOverride);
    }

    /**
     * Get this button value.
     */
    _getValue()
    {
        return this.isChecked;
    }
}

module.exports = Button; 