/**
 * file: root.js
 * description: Implement a UI root element.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";
const Container = require('./elements/container');
const PintarJS = require('./pintar');
const InputManager = require('./input_manager');


/**
 * Implement a root element to hold all UI elements.
 */
class UIRoot extends Container
{
    /**
     * Create the UI root element.
     * @param {PintarJS} pintar PintarJS instance.
     * @param {InputManager} inputManager Optional input manager instance. If not provided, will create a default Input Manager.
     */
    constructor(pintar, inputManager)
    {
        super({UIRoot: { default: { }}});
        this.pintar = pintar;
        this.inputManager = inputManager || new InputManager(pintar);
    }

    /**
     * Cleanup the root UI element stuff.
     */
    cleanup()
    {
        this.inputManager.cleanup();
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
     * Get this element's internal bounding rectangle, in pixels, with padding.
     */
    getInternalBoundingBox()
    {
        return this.pintar.canvasRect;
    }

    /**
     * Draw the UI element.
     */
    draw(pintar)
    {
        // draw children
        super.draw(this.pintar);

        // clear viewports queue
        Container._viewportsQueue = [];
    }

    /**
     * Update the UI element.
     */
    update(input)
    {
        this.inputManager.startUpdate();
        super.update(this.inputManager);
        this.inputManager.endUpdate()
    }
}

module.exports = UIRoot; 