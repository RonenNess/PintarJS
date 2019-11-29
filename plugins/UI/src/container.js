/**
 * file: container.js
 * description: Implement a container element.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";
const UIElement = require('./ui_element');
const Anchors = require('./anchors');


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
     * Draw the UI element.
     */
    draw(pintar)
    {
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
                    var marginX = Math.max(element.margin.left, lastElement.margin.right);
                    var marginY = Math.max(element.margin.top, lastElement.margin.bottom);
                    element.offset.set(lastElement.offset.x + lastElement.size.x + marginX, lastElement.offset.y + lastElement.size.y + marginY);
                    if (element.offset.x > this.size.x) {
                        needToSetAuto = true;
                    }
                }
                else {
                    var padding = this._convertSides(this.padding);
                    element.offset.set(Math.max(element.margin.left - padding.left, 0), Math.max(element.margin.top - padding.top, 0));
                }
            }

            // if auto anchor, arrange it
            if (needToSetAuto || element.anchor === Anchors.Auto)
            {
                if (lastElement) 
                {
                    var marginY = Math.max(element.margin.top, lastElement.margin.bottom);
                    var marginX = Math.max(element.margin.left - padding.left, 0);
                    element.offset.set(marginX, lastElement.offset.y + lastElement.size.y + marginY);
                }
                else 
                {
                    var padding = this._convertSides(this.padding);
                    element.offset.set(Math.max(element.margin.left - padding.left, 0), Math.max(element.margin.top - padding.top, 0));
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