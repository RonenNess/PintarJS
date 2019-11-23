/**
 * file: container.js
 * description: Implement a container element.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";
const UIElement = require('./ui_element');
const PintarJS = require('./pintar');
const SidesProperties = require('./sides_properties');
const SizeModes = require('./size_modes');
const Anchors = require('./anchors');
const Panel = require('./panel');


/**
 * Implement a container element to hold other elements.
 */
class Container extends UIElement
{
    /**
     * Create a container element.
     * @param {Object} theme
     * @param {PintarJS.UI.SidesProperties} theme.Container[skin].padding (Optional) Container padding (distance between internal elements and container sides).
     * @param {PintarJS.UI.SizeModes} theme.Container[skin].paddingMode (Optional) Container padding mode.
     * @param {String} theme.Container[skin].background (Optional) If defined, will create a panel as background with this skin.
     */
    constructor(theme, skin)
    {
        super();

        // get options and create children list
        var options = this.getOptionsFromTheme(theme, skin);
        this._children = [];
        
        // set padding
        this.padding = options.padding || new SidesProperties(10, 10, 10, 10);
        this.paddingMode = options.paddingMode || SizeModes.Pixels;

        // set background
        this.__background = null;
        if (options.background) {
            this.background = new Panel(theme, options.background);
        }
    }

    /**
     * Get background element, or null if not set.
     */
    get background()
    {
        return this.__background;
    }

    /**
     * Set background element.
     */
    set background(backgroundElement)
    {
        if (this.__background) { this.__background._setParent(null); }
        backgroundElement._setParent(this);
        backgroundElement.ignoreParentPadding = true;
        this.__background = backgroundElement;
    }

    /**
     * Add a child element.
     * @param {UIElement} element Child element to add.
     */
    addChild(element)
    {
        // sanity check - make sure don't have a parent
        if (element.parent) {
            throw new Error("Element to add already have a parent!");
        }

        // add child
        this._children.push(element);
        element._setParent(this);
    }

    /**
     * Remove an element from this container.
     * @param {UIElement} element Element to remove.
     */
    removeChild(element)
    {
        // sanity check - make sure we are the parent
        if (element.parent !== this) {
            throw new Error("Element to remove does not belong to this container!");
        }

        // remove element
        var index = this._children.indexOf(element);
        if (index !== -1) 
        {
            this._children.splice(index, 1);
            element._setParent(null);
        }
    }

    /**
     * Get this element's internal bounding rectangle, in pixels, with padding.
     */
    getInternalBoundingBox()
    {
        var ret = this.getBoundingBox();
        var padding = this._convertSides(this.padding, this.paddingMode);
        ret.x += padding.left;
        ret.y += padding.top;
        ret.width -= padding.right + padding.left;
        ret.height -= padding.bottom + padding.top;
        return ret;
    }

    /**
     * Draw the UI element.
     */
    draw(pintar)
    {
        // draw background
        if (this.background) {
            this.background.draw(pintar);
        }

        // draw children
        for (var i = 0; i < this._children.length; ++i) {
            this._children[i].draw(pintar);
        }
    }

    /**
     * Update the UI element.
     */
    update(input)
    {
        // call base class update
        super.update(input);
        
        // update background
        if (this.background)
        {
            this.background.update(input);
            this.background.size = this.size;
        }

        // update children
        var lastElement = null;
        for (var i = 0; i < this._children.length; ++i) 
        {
            // get element
            var element = this._children[i];

            // if auto-inline anchor, arrange it
            var needToSetAuto = false;
            if (element.anchor === Anchors.AutoInline)
            {
                if (lastElement) {
                    element.offset.set(0, lastElement.offset.y + lastElement.size.y);
                    if (element.offset.x > this.size.x) {
                        needToSetAuto = true;
                    }
                }
                else {
                    element.offset.set(0, 0);
                }
            }

            // if auto anchor, arrange it
            if (needToSetAuto || element.anchor === Anchors.Auto)
            {
                if (lastElement) {
                    element.offset.set(0, lastElement.offset.y + lastElement.size.y);
                }
                else {
                    element.offset.set(0, 0);
                }
            }

            // update child element
            element.update(input);
            lastElement = element;
        }
    }
}

// export the container
module.exports = Container; 