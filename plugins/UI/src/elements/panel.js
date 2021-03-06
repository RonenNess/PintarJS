/**
 * file: panel.js
 * description: A container with graphics object.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";
const PintarJS = require('../pintar');
const Container = require('./container');
const SlicedSprite = require('./sliced_sprite');
const SidesProperties = require('../sides_properties');

// default panel paddings
const defaultPadding = new SidesProperties(10, 10, 10, 10);


/**
 * A container with graphical background.
 */
class Panel extends Container
{
    /**
     * Create a panel element.
     * @param {Object} theme
     * @param {PintarJS.UI.SidesProperties} theme.Panel[skin].padding (Optional) Container padding (distance between internal elements and container sides).
     * @param {PintarJS.Texture} theme.Panel[skin].texture Texture to use.
     * @param {PintarJS.Rectangle} theme.Panel[skin].externalSourceRect The entire source rect, including frame and fill.
     * @param {PintarJS.Rectangle} theme.Panel[skin].internalSourceRect The internal source rect, must be contained inside the whole source rect.
     * @param {Number} theme.Panel[skin].textureScale (Optional) frame and fill texture scale.
     * @param {SlicedSprite.FillModes} theme.Panel[skin].fillMode (Optional) How to handle fill part.
     * @param {PintarJS.Color} theme.Panel[skin].fillColor (Optional) Fill color.
     * @param {PintarJS.Color} theme.Panel[skin].frameColor (Optional) Frame color.
     * @param {String} skin Element skin to use from theme.
     * @param {Object} override Optional override options (can override any of the theme properties listed above).
     */
    constructor(theme, skin, override)
    {
        super();
        
        // get options
        var options = this.getOptionsFromTheme(theme, skin, override);
        this.setBaseOptions(options);
        
        // set padding
        this.padding = this.__getFromOptions(options, 'padding', defaultPadding);

        // set background
        this._background = new SlicedSprite(options, '_');
        this._background._setParent(this);
        this._background.size.x = this._background.size.y = 100;
        this._background.size.xMode = this._background.size.yMode = '%';
        this._background.ignoreParentPadding = true;
    }
    
    /**
     * Get required options for this element type.
     */
    get requiredOptions()
    {
        return ['texture', 'externalSourceRect', 'internalSourceRect'];
    }
       
    /**
     * Called whenever self bounding box changed.
     */
    _onSelfBoundingBoxChange()
    {
        super._onSelfBoundingBoxChange();
        this._background._onParentBoundingBoxChange();
    }

    /**
     * Draw the UI element.
     */
    drawImp(pintar, boundingBoxOverride)
    {
        // draw background
        this._background.draw(pintar, boundingBoxOverride || this.getBoundingBox());

        // draw children
        super.drawImp(pintar, boundingBoxOverride);
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

        // call base class update
        super.update(input, forceState);
        
        // update background
        if (this._background)
        {
            this._background.update(input, forceState);
        }
    }
}


// export the panel class
module.exports = Panel;