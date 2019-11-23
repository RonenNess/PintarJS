/**
 * file: root.js
 * description: Implement a UI root element.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";
const Container = require('./container');
const PintarJS = require('./pintar');


/**
 * Implement a root element to hold all UI elements.
 */
class UIRoot extends Container
{
    /**
     * Create the UI root element.
     * @param {PintarJS} pintar PintarJS instance.
     * @param {InputManager} inputManager Input manager instance.
     */
    constructor(pintar, inputManager)
    {
        super();
        this.pintar = pintar;
        this.inputManager = inputManager;
        this.padding.set(0, 0, 0, 0);
    }

    /**
     * Get this element's bounding rectangle, in pixels.
     * @returns {PintarJS.Rectangle} Bounding box, in pixels.
     */
    getBoundingBox()
    {
        return this.pintar.canvasRect;
    }

    /**
     * Draw the UI element.
     */
    draw(pintar)
    {
        super.draw(this.pintar);
    }

    /**
     * Update the UI element.
     */
    update(input)
    {
        super.update(this.inputManager);
    }
}

module.exports = UIRoot; 