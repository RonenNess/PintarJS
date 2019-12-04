/**
 * file: input_manager.js
 * description: Define a basic input manager class.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";
const PintarJS = require('../pintar');


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

        // mouse buttons previous states
        this._mouseButtonsPrevStates = JSON.parse(JSON.stringify(this._mouseButtons));

        // mouse wheel change
        this._mouseWheel = 0;

        // starting position
        this._mousePosition = new PintarJS.Point(0, 0);

        // current cursor type, can be set by elements when pointer on them
        this.setCursorDefault();

        // mouse down
        this._mouseDownEventListener = (e) => {
            this._mouseButtons[e.button] = true;
        };
        canvas.addEventListener("mousedown", this._mouseDownEventListener);
        
        // mouse up
        this._mouseUpEventListener = (e) => {
            this._mouseButtons[e.button] = false;
        };
        canvas.addEventListener("mouseup", this._mouseUpEventListener);

        // mouse leave
        this._mouseLeaveEventListener = (e) => {
            this._mouseButtons[0] = this._mouseButtons[1] = this._mouseButtons[2] = false;
        };
        canvas.addEventListener("mouseleave", this._mouseLeaveEventListener);

        // mouse wheel
        this._mouseWheelEventListener = (e) => {
            this._mouseWheel = e.deltaY;
        };
        canvas.addEventListener("mousewheel", this._mouseWheelEventListener);
        
        // mouse move
        this._mouseMoveEventListener = (e) => {
            this._mousePosition = new PintarJS.Point(e.offsetX, e.offsetY);
        };
        canvas.addEventListener("mousemove", this._mouseMoveEventListener);
    }

    /**
     * Cleanup the input manager (remove callbacks).
     */
    cleanup()
    {
        canvas.removeEventListener("mousedown", this._mouseDownEventListener);
        canvas.removeEventListener("mouseup", this._mouseUpEventListener);
        canvas.removeEventListener("mouseleave", this._mouseLeaveEventListener);
        canvas.removeEventListener("mousewheel", this._mouseWheelEventListener);
        canvas.removeEventListener("mousemove", this._mouseMoveEventListener);
    }

    /**
     * Called at the begining of every update frame.
     */
    startUpdate()
    {
        // reset cursor type
        this.setCursorDefault();

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
        this._mouseButtonsPrevStates = JSON.parse(JSON.stringify(this._mouseButtons));
    }

    /**
     * Get cursor type.
     */
    get cursorType()
    {
        return this._cursorType;
    }

    /**
     * Set cursor type to default for this frame.
     */
    setCursorDefault()
    {
        this._cursorType = "default";
    }

    /**
     * Set cursor type for this frame.
     */
    setCursor(cursorType)
    {
        this._cursorType = cursorType;
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
     * Return if left mouse button was down last frame.
     * @returns {Boolean} left mouse button status.
     */
    get leftMousePrevDown()
    {
        return this._mouseButtonsPrevStates[0];
    }
    
    /**
     * Return if right mouse button was down last frame.
     * @returns {Boolean} right mouse button status.
     */
    get rightMousePrevDown()
    {
        return this._mouseButtonsPrevStates[2];
    }

    /**
     * Return if left mouse button was released this frame.
     * @returns {Boolean} if left mouse button was released this frame.
     */
    get leftMouseClick()
    {
        return !this._mouseClick[0] && this._mouseButtonsPrevStates[0];
    }
    
    /**
     * Return if right mouse button was released this frame.
     * @returns {Boolean} if right mouse button was released this frame.
     */
    get rightMouseClick()
    {
        return !this._mouseClick[2] && this._mouseButtonsPrevStates[2];
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