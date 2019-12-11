/**
 * file: cursor.js
 * description: Implement a cursor element.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";
const UIElement = require('./ui_element');
const PintarJS = require('../pintar');
const Sprite = require('./sprite');
const Anchors = require('../anchors');
const Cursors = require('../cursor_types');
const SizeModes = require('../size_modes');


/**
 * Implement a cursor element.
 */
class Cursor extends UIElement
{
    /**
     * Create a button element.
     * @param {Object} theme
     * @param {PintarJS.Texture} theme.Cursor[skin].texture Texture to use.
     * @param {PintarJS.Rectangle} theme.Cursor[skin].defaultSourceRect Source rect to use for default cursor.
     * @param {PintarJS.Rectangle} theme.Cursor[skin].defaultDownSourceRect Source rect to use for default cursor when mouse button is pressed.
     * @param {PintarJS.Rectangle} theme.Cursor[skin].pointerSourceRect Source rect to use for pointer cursor.
     * @param {PintarJS.Rectangle} theme.Cursor[skin].pointerDownSourceRect Source rect to use for pointer cursor when mouse button is pressed.
     * @param {Number} theme.Cursor[skin].textureScale (Optional) Texture scale for button. 
     * @param {String} skin Element skin to use from theme.
     * @param {Object} override Optional override options (can override any of the theme properties listed above).
     */
    constructor(theme, skin, override)
    {
        super();

        // get options from theme and skin type
        var options = this.getOptionsFromTheme(theme, skin, override);
        this.setBaseOptions(options);

        // store params
        this._textureScale = options.textureScale || 1;
        this._texture = options.texture;

        // store source rects
        this._sourceRects = {}
        for (var key in Cursors) 
        {
            // get cursor type
            var cursorType = Cursors[key];

            // check if got source rect for type
            var sourceRect = options[Cursors[key] + "SourceRect"];
            if (sourceRect) 
            { 
                // set cursor type
                this._sourceRects[Cursors[key]] = sourceRect;

                // also load for down state, if set
                sourceRect.downState = options[Cursors[key] + "DownSourceRect"];
            }
        }
        
        // set default cursor type
        this.setCursorType(Cursors.Default);
    }

    /**
     * Get required options for this element type.
     */
    get requiredOptions()
    {
        return ["texture", "defaultSourceRect"];
    }

    /**
     * Get source rect for a given cursor type.
     */
    _getSourceRect(cursorType)
    {
        return this._sourceRects[cursorType] || this._sourceRects[Cursors.Default];
    }

    /**
     * Set the cursor type to display. Called internally by the UI root element.
     * @param {CursorTypes} cursor Cursor type to show.
     */
    setCursorType(cursor)
    {
        // update cursor sprite if needed
        if (this._cursorType !== cursor) 
        {
            var prevOffset = this._sprite ? this._sprite.offset : {x:0, y:0};
            this._sourceRect = this._getSourceRect(cursor);
            this._sprite = new Sprite({texture: this._texture, 
                sourceRect: this._sourceRect, 
                textureScale: this._textureScale});
            this._sprite.offset.xMode = this._sprite.offset.yMode = SizeModes.Pixels;
            this._sprite.offset.set(prevOffset.x, prevOffset.y);
            this._sprite.anchor = Anchors.Fixed;
        }

        // store new type
        this._cursorType = cursor;
    }

    /**
     * Draw the UI element.
     */
    drawImp(pintar)
    {
        // draw cursor
        this._sprite.draw(pintar);
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

        // call base and set offset
        super.update(input, forceState);
        this._sprite.offset = input.mousePosition.clone();

        // check if need to set down state
        if (input.leftMouseDown && this._sourceRect.downState) {
            this._sprite.sourceRectangle = this._sourceRect.downState;
        }
        else {
            this._sprite.sourceRectangle = this._sourceRect;
        }
    }
}

module.exports = Cursor; 