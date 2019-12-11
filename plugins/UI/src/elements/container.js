/**
 * file: container.js
 * description: Implement a container element.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";
const UIElement = require('./ui_element');
const PintarJS = require('../pintar');
const SidesProperties = require('../sides_properties');


/**
 * Implement a container element to hold other elements.
 */
class Container extends UIElement
{
    /**
     * Create a container element.
     */
    constructor()
    {
        super();

        // create children list
        this._children = [];
        this.padding = new SidesProperties(0, 0, 0, 0);
        this.hideExceedingElements = false;
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
        
        // set starting sibling-before so we can calculate dest rect without waiting for update
        element._siblingBefore = this._children[this._children.length-2];
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
            element._siblingBefore = null;
            element._setParent(null);
        }
    }

    /**
     * Iterate the children of this container. You may add or remove elemnts during iteration.
     * @param {*} callback Method to call with every child.
     */
    iterateChildren(callback)
    {
        for (var i = this._children.length-1; i >= 0; --i) {
            var child = this._children[i];
            if (child) callback(child);
        }
    }

    /**
     * Get this element's internal bounding rectangle, in pixels, with padding.
     */
    getInternalBoundingBox()
    {
        var ret = this.getBoundingBox();
        var padding = this.padding ? this._convertSides(this.padding) : {top: 0, bottom: 0, left: 0, right: 0};
        ret.x += padding.left;
        ret.y += padding.top;
        ret.width -= (padding.right + padding.left);
        ret.height -= (padding.bottom + padding.top);
        return ret;
    }

    /**
     * If true, this element will pass self-state to children, making them copy it.
     */
    get forceSelfStateOnChildren()
    {
        return false;
    }

    /**
     * Draw the UI element.
     */
    draw(pintar)
    {
        // if not visible, do nothing
        if (!this.visible) {
            return;
        }

        // hide exceeding element by using pintar's viewport
        if (this.hideExceedingElements) {
            var destRect = this.getInternalBoundingBox();
            var viewport = new PintarJS.Viewport(PintarJS.Point.zero(), destRect);
            pintar.setViewport(viewport);
            Container._viewportsQueue.push(viewport);
            this._updateVisibleRegion(pintar);
        }
        
        // draw children
        for (var i = 0; i < this._children.length; ++i) 
        {
            this._children[i].drawIfVisible(pintar);
        }

        // clear viewport
        if (this.hideExceedingElements) {
            Container._viewportsQueue.pop();    // <-- removes self viewport
            var prev = Container._viewportsQueue.pop();
            pintar.setViewport(prev);
            this._updateVisibleRegion(pintar);
        }
    }

    /**
     * Draw the UI element but only if its visible.
     * Skip this test for containers, its only relevant for elements.
     * @param {*} pintar Pintar instance to draw this element on.
     */
    drawIfVisible(pintar)
    {
        this.draw(pintar);
    }

    /**
     * Update the currently visible region.
     */
    _updateVisibleRegion(pintar)
    {
        var viewport = Container._viewportsQueue[Container._viewportsQueue.length-1];
        UIElement.visibleRegion = viewport ? viewport.drawingRegion : pintar.canvasRect;
    }

    /**
     * Arrange the auto anchors of all children.
     */
    arrangeAllChildAutoAnchors()
    {
        // iterate all children
        var lastElem = null;
        for (var i = 0; i < this._children.length; ++i) {

            // arrange child
            var child = this._children[i];
            child._siblingBefore = lastElem;
            child._setOffsetForAutoAnchors();
            lastElem = child;

            // call child's arrange function
            if (child.arrangeAllChildAutoAnchors) {
                child.arrangeAllChildAutoAnchors();
            }
        }
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

        // update children
        var lastElement = null;
        for (var i = 0; i < this._children.length; ++i) 
        {
            // get element
            var element = this._children[i];

            // set siblings and store last element
            element._siblingBefore = lastElement;
            lastElement = element;

            // update child element
            element.update(input, forceState || (this.forceSelfStateOnChildren ? this._state : null));
        }
    }
}

// queue of viewports to hide exceeding elements
// this reset every drawing frame
Container._viewportsQueue = [];

// export the container
module.exports = Container; 