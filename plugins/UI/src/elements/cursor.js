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


/**
 * Implement a cursor element.
 */
class Cursor extends UIElement
{

    /**
     * Create a button element.
     * @param {Object} theme
     * @param {PintarJS.Texture} theme.Cursor[skin].texture Texture to use.
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
        
    }

    /**
     * Get required options for this element type.
     */
    get requiredOptions()
    {
        return ["texture"];
    }

    /**
     * Draw the UI element.
     */
    draw(pintar)
    {
        
    }
}

module.exports = Cursor; 