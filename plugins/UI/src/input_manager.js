/**
 * file: input_manager.js
 * description: Define a basic input manager class.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";
const PintarJS = require('./pintar');


/**
 * Provides input for the UI.
 */
class InputManager
{
    /**
     * Create the input manager.
     * @param {PintarJS} pintar PintarJS instance.
     */
    constructor(pintar)
    {
        // store canvas and init callbacks
        var canvas = this._canvas = pintar._canvas;

        // mouse buttons states
        this._mouseButtons = {
            0: false,
            1: false, 
            2: false,
        };

        // mouse click states
        this._mouseClicks = {
            0: false,
            1: false, 
            2: false,
        };

        // mouse wheel change
        this._mouseWheel = 0;

        // mouse down
        canvas.addEventListener("mousedown", (e) => {
            this._mouseButtons[e.button] = true;
        });
        
        // mouse up
        canvas.addEventListener("mouseup", (e) => {
            if (this._mouseButtons[e.button]) { this._mouseClicks[e.button] = true; }
            this._mouseButtons[e.button] = false;
        });

        // mouse leave
        canvas.addEventListener("mouseleave", (e) => {
            this._mouseButtons[0] = this._mouseButtons[1] = this._mouseButtons[2] = false;
        });

        // mouse wheel
        canvas.addEventListener("mousewheel", (e) => {
            this._mouseWheel = e.deltaY;
        });
        
        // mouse move
        canvas.addEventListener("mousemove", (e) => {
            this._mousePosition = new PintarJS.Point(e.offsetX, e.offsetY);
        });
    }

    /**
     * Cleanup the input manager (remove callbacks).
     */
    cleanup()
    {

    }

    /**
     * Called at the begining of every update frame.
     */
    startUpdate()
    {
        // calculate delta time
        var timeNow = (new Date()).getTime();
        this._deltaTime = this._prevTime ? ((timeNow - this._prevTime) / 1000.0) : 0.1;
        this._prevTime = timeNow;
    }

    /**
     * Called at the end of every update frame.
     */
    endUpdate()
    {
        this._mouseWheel = 0;
        this._mouseClicks[0] = this._mouseClicks[1] = this._mouseClicks[2] = false;
    }

    /**
     * Return mouse position.
     * @returns {PintarJS.Point} Point with {x,y} position.
     */
    get mousePosition()
    {
        return this._mousePosition.clone();
    }

    /**
     * Return if left mouse button is down.
     * @returns {Boolean} left mouse button status.
     */
    get leftMouseDown()
    {
        return this._mouseButtons[0];
    }
    
    /**
     * Return if right mouse button is down.
     * @returns {Boolean} right mouse button status.
     */
    get rightMouseDown()
    {
        return this._mouseButtons[2];
    }
    
    /**
     * Return if left mouse button was released this frame.
     * @returns {Boolean} if left mouse button was released this frame.
     */
    get leftMouseClick()
    {
        return this._mouseClick[0];
    }
    
    /**
     * Return if right mouse button was released this frame.
     * @returns {Boolean} if right mouse button was released this frame.
     */
    get rightMouseClick()
    {
        return this._mouseClick[2];
    }

    /**
     * Return mouse wheel change.
     * @returns {Number} mouse wheel change, or 0 if not scrolling.
     */
    get mouseWheelChange()
    {
        return this._mouseWheel;
    }

    /**
     * Return delta time between previous frame and current frame.
     * @returns {Number} delta time, in seconds.
     */
    get deltaTime()
    {
        return this._deltaTime;
    }
}

module.exports = InputManager; 