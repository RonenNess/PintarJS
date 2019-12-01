/**
 * file: root.js
 * description: Implement a UI root element.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";
const Container = require('./container');
const PintarJS = require('../pintar');
const InputManager = require('../input/input_manager');
const Cursor = require('./cursor');


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
        this.size = null;
        this.offset = null;
    }

    /**
     * Cleanup the root UI element stuff.
     */
    cleanup()
    {
        this.inputManager.cleanup();
    }

    /**
     * Set cursor element to show.
     * @param {Cursor} cursor New cursor element.
     */
    setCursor(cursor)
    {
        if (cursor.constructor !== Cursor) {
            throw new Error("Cursor must be a 'Cursor' element instance!");
        }
        this._cursor = cursor;
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
     * Get size in pixels.
     */
    getSizeInPixels()
    {
        var rect = this.pintar.canvasRect;
        return new PintarJS.Point(rect.width, rect.height);
    }

    /**
     * Get offset in pixels.
     */
    getOffsetInPixels()
    {
        return new PintarJS.Point(0, 0);
    }

    /**
     * Draw the UI element.
     */
    draw(pintar)
    {
        // draw UI elements
        super.draw(this.pintar);

        // draw cursor
        if (this._cursor) {
            this._cursor.draw(this.pintar);
        }
    }

    /**
     * Update the UI element.
     */
    update(input)
    {
        // update UI
        this.inputManager.startUpdate();
        super.update(this.inputManager);
        this.inputManager.endUpdate()

        // set cursor type
        if (this._cursor) {
            this._cursor.update(this.inputManager);
            this._cursor.setCursorType(this.inputManager.cursorType);
        }
    }
}

module.exports = UIRoot; 