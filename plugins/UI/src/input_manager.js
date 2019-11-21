/**
 * file: input_data.js
 * description: Define the input manager API.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";

/**
 * An API for an object that provide input for the UI.
 */
class InputManager
{
    /**
     * Return mouse position.
     * @returns {PintarJS.Point} Point with {x,y} position.
     */
    get mousePosition()
    {
        throw new Error("Not Implemented!");
    }

    /**
     * Return if left mouse button is down.
     * @returns {Boolean} left mouse button status.
     */
    get isLeftMouseDown()
    {
        throw new Error("Not Implemented!");
    }
    
    /**
     * Return if right mouse button is down.
     * @returns {Boolean} right mouse button status.
     */
    get isRightMouseDown()
    {
        throw new Error("Not Implemented!");
    }
    
    /**
     * Return mouse wheel change.
     * @returns {Number} mouse wheel change, or 0 if not scrolling.
     */
    get mouseWheelChange()
    {
        throw new Error("Not Implemented!");
    }
}

module.exports = InputManager; 