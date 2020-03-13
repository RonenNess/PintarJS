(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}(g.PintarJS || (g.PintarJS = {})).UI = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/**
 * file: ancors.js
 * description: Define ancors we can attach elements to.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";

module.exports = {
    TopLeft: 'TopLeft',
    TopCenter: 'TopCenter',
    TopRight: 'TopRight',
    CenterLeft: 'CenterLeft',
    Center: 'Center',
    CenterRight: 'CenterRight',
    BottomLeft: 'BottomLeft',
    BottomCenter: 'BottomCenter',
    BottomRight: 'BottomRight',
    Auto: 'Auto',
    AutoInline: 'AutoInline',
    AutoInlineNoBreak: 'AutoInlineNoBreak',
    Fixed: 'Fixed',
};
},{}],2:[function(require,module,exports){
module.exports = {
    Default: "default",
    Pointer: "pointer",
}
},{}],3:[function(require,module,exports){
/**
 * file: button.js
 * description: Implement a button element.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";
const Container = require('./container');
const PintarJS = require('../pintar');
const SizeModes = require('../size_modes');
const SlicedSprite = require('./sliced_sprite');
const Paragraph = require('./paragraph');
const Anchors = require('../anchors');
const Cursors = require('../cursor_types');


/**
 * Implement a button element.
 */
class Button extends Container
{

    /**
     * Create a button element.
     * @param {Object} theme
     * @param {PintarJS.Texture} theme.Button[skin].texture Texture to use.
     * @param {PintarJS.Rectangle} theme.Button[skin].externalSourceRect The entire source rect, including frame and fill, of the button.
     * @param {PintarJS.Rectangle} theme.Button[skin].internalSourceRect The internal source rect of the button (must be contained inside the external source rect).
     * @param {PintarJS.Rectangle} theme.Button[skin].mouseHoverExternalSourceRect The entire source rect, including frame and fill, of the button - when mouse hover over it.
     * @param {PintarJS.Rectangle} theme.Button[skin].mouseHoverInternalSourceRect The internal source rect of the button - when mouse hover over it (must be contained inside the external source rect).
     * @param {PintarJS.Rectangle} theme.Button[skin].mouseDownExternalSourceRect The entire source rect, including frame and fill, of the button - when mouse presses it.
     * @param {PintarJS.Rectangle} theme.Button[skin].mouseDownInternalSourceRect The internal source rect of the button - when mouse presses it (must be contained inside the external source rect).
     * @param {String} theme.Button[skin].paragraphSkin Skin to use for button's paragraph.
     * @param {String} theme.Button[skin].mouseHoverParagraphSkin Skin to use for button's paragraph when mouse hovers over button.
     * @param {String} theme.Button[skin].mouseDownParagraphSkin Skin to use for button's paragraph when mouse is down over button.
     * @param {Number} theme.Button[skin].heightInPixels (Optional) Button default height in pixels. 
     * @param {Number} theme.Button[skin].textureScale (Optional) Texture scale of the button. 
     * @param {Number} theme.Button[skin].toggleMode (Optional) If true, this button will behave like a checkbox and be toggleable. 
     * @param {Number} theme.Button[skin].color (Optional) Optional color for button skins. 
     * @param {String} skin Element skin to use from theme.
     * @param {Object} override Optional override options (can override any of the theme properties listed above).
     */
    constructor(theme, skin, override)
    {
        super();

        // get options from theme and skin type
        var options = this.getOptionsFromTheme(theme, skin, override);
        this.setBaseOptions(options);
        
        // by default buttons take full width
        this.size.x = 100;
        this.size.xMode = SizeModes.Percents;

        // get texture scale
        var textureScale = this.__getFromOptions(options, 'textureScale', 1);

        // set height
        this.size.y = this.__getFromOptions(options, 'heightInPixels') || 
                        (this.__getFromOptions(options, 'externalSourceRect') ? 
                        (this.__getFromOptions(options, 'externalSourceRect').height * textureScale) : 100);
        this.size.yMode = SizeModes.Pixels;

        // button text
        this.text = null;

        // for toggle mode
        this.isChecked = false;
        this.toggleModeEnabled = this.__getFromOptions(options, 'toggleMode', false);

        // get color
        var color = this.__getFromOptions(options, 'color', PintarJS.Color.white());

        // init button paragraph properties
        var initParagraph = (paragraph) => {
            paragraph._setParent(this);
            paragraph.anchor = Anchors.Center;
            paragraph.alignment = "center";          
        }

        // create button paragraph for default state
        if (options.paragraphSkin) {
            this._paragraph = new Paragraph(theme, options.paragraphSkin);
            initParagraph(this._paragraph);
        }

        // create button paragraph for mouse hover
        if (options.mouseHoverParagraphSkin) {
            this._paragraphHover = new Paragraph(theme, options.mouseHoverParagraphSkin);
            initParagraph(this._paragraphHover);
        }
        else {
            this._paragraphHover = this._paragraph;
        }

        // create button paragraph for mouse down
        if (options.mouseDownParagraphSkin) {
            this._paragraphDown = new Paragraph(theme, options.mouseDownParagraphSkin);
            initParagraph(this._paragraphDown);
        }
        else {
            this._paragraphDown = this._paragraphHover || this._paragraph;
        }

        // get texture
        var texture = this.__getFromOptions(options, 'texture');

        // create default sprite
        if (options.externalSourceRect) {
            this._sprite = new SlicedSprite({texture: texture, 
                externalSourceRect: options.externalSourceRect, 
                internalSourceRect: options.internalSourceRect, 
                textureScale: textureScale}, '_');
            this._sprite.anchor = Anchors.Fixed;
            this._sprite.color = color;
        }

        // create sprite for hover
        if (options.mouseHoverExternalSourceRect) {
            this._spriteHover = new SlicedSprite({texture: texture, 
                externalSourceRect: options.mouseHoverExternalSourceRect, 
                internalSourceRect: options.mouseHoverInternalSourceRect, 
                textureScale: textureScale}, '_');
            this._spriteHover.anchor = Anchors.Fixed;
            this._spriteHover.color = color;
        }
        else {
            this._spriteHover = this._sprite;
        }
        
        // create sprite for down
        if (options.mouseDownExternalSourceRect) {
            this._spriteDown = new SlicedSprite({texture: texture, 
                externalSourceRect: options.mouseDownExternalSourceRect, 
                internalSourceRect: options.mouseDownInternalSourceRect, 
                textureScale: textureScale}, '_');
            this._spriteDown.anchor = Anchors.Fixed;
            this._spriteDown.color = color;
        }
        else {
            this._spriteDown = this._spriteHover || this._sprite;
        }
    }

    /**
     * Called when mouse is released on element.
     */
    _onMouseReleased(input)
    {
        super._onMouseReleased(input);
        if (this.toggleModeEnabled) {
            this.toggle();
        }
    }

    /**
     * Toggle value, only useable when in toggle mode.
     */
    toggle()
    {
        if (!this.toggleModeEnabled) {
            throw new Error("Cannot toggle button that's not in toggle mode!");
        }
        this.isChecked = !this.isChecked;
    }

    /**
     * If true, this element will pass self-state to children, making them copy it.
     */
    get forceSelfStateOnChildren()
    {
        return true;
    }

    /**
     * Get required options for this element type.
     */
    get requiredOptions()
    {
        return [];
    }

    /**
     * Get if this element is interactive by default.
     * Elements that are not interactive will not trigger events or run the update loop.
     */
    get isNaturallyInteractive()
    {
        return true;
    }
     
    /**
     * Default cursor type for this element.
     */
    get _defaultCursor()
    {
        return Cursors.Pointer;
    }

    /**
     * Draw the UI element.
     */
    drawImp(pintar, boundingBoxOverride)
    {
        // get dest rect
        var destRect = boundingBoxOverride || this.getBoundingBox();

        // decide which sprite to draw based on state
        var sprite = this._sprite;
        if (this.isChecked || this._state.mouseDown) sprite = this._spriteDown;
        else if (this._state.mouseHover) sprite = this._spriteHover;

        // draw button
        if (sprite) 
        {
            sprite.offset = destRect.getPosition();
            sprite.size = destRect.getSize();
            sprite.draw(pintar);
        }

        // draw text
        if (this.text) 
        {
            // decide which text to draw based on state
            var paragraph = this._paragraph;
            if (this._state.mouseDown) paragraph = this._paragraphDown;
            else if (this._state.mouseHover) paragraph = this._paragraphHover;

            // draw text
            if (paragraph) 
            {
                paragraph.text = this.text;
                paragraph.draw(pintar);
            }
        }

        // draw children
        super.drawImp(pintar, boundingBoxOverride);
    }

    /**
     * Get this button value.
     */
    _getValue()
    {
        return this.isChecked;
    }
}

module.exports = Button; 
},{"../anchors":1,"../cursor_types":2,"../pintar":18,"../size_modes":20,"./container":4,"./paragraph":8,"./sliced_sprite":11}],4:[function(require,module,exports){
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
        // get bounding box and padding
        var ret = this.getBoundingBox();
        var padding = this.padding ? this._convertSides(this.padding) : {top: 0, bottom: 0, left: 0, right: 0};

        // check if should update internal bounding box version
        if (!this.__lastKnownPadding || 
            (this.__lastKnownPadding.left != padding.left || 
            this.__lastKnownPadding.right != padding.right || 
            this.__lastKnownPadding.top != padding.top || 
            this.__lastKnownPadding.bottom != padding.bottom))
            {
                this._bbiVersion++;
                this.__lastKnownPadding = padding;
            }

        // add padding and return
        ret.x += padding.left;
        ret.y += padding.top;
        ret.width -= (padding.right + padding.left);
        ret.height -= (padding.bottom + padding.top);
        return ret;
    }

    /**
     * Called whenever self bounding box changed.
     */
    _onSelfBoundingBoxChange()
    {
        super._onSelfBoundingBoxChange();
        for (var i = 0; i < this._children.length; ++i) {
            this._children[i]._onParentBoundingBoxChange();
        }
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
    drawImp(pintar, boundingBoxOverride)
    {
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
            this._children[i].draw(pintar);
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
     * Check if this element is visible for current viewport - containers are always "visible".
     * This test is only relevant for elements.
     */
    isVisiblyByViewport()
    {
        return true;
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
},{"../pintar":18,"../sides_properties":19,"./ui_element":14}],5:[function(require,module,exports){
/**
 * file: cursor.js
 * description: Implement a cursor element.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";
const UIElement = require('./ui_element');
const PintarJS = require('../pintar');
const Sprite = require('./sprite');
const Anchors = require('../anchors');
const Cursors = require('../cursor_types');
const SizeModes = require('../size_modes');


/**
 * Implement a cursor element.
 */
class Cursor extends UIElement
{
    /**
     * Create a button element.
     * @param {Object} theme
     * @param {PintarJS.Texture} theme.Cursor[skin].texture Texture to use.
     * @param {PintarJS.Rectangle} theme.Cursor[skin].defaultSourceRect Source rect to use for default cursor.
     * @param {PintarJS.Rectangle} theme.Cursor[skin].defaultDownSourceRect Source rect to use for default cursor when mouse button is pressed.
     * @param {PintarJS.Rectangle} theme.Cursor[skin].pointerSourceRect Source rect to use for pointer cursor.
     * @param {PintarJS.Rectangle} theme.Cursor[skin].pointerDownSourceRect Source rect to use for pointer cursor when mouse button is pressed.
     * @param {Number} theme.Cursor[skin].textureScale (Optional) Texture scale for button. 
     * @param {String} skin Element skin to use from theme.
     * @param {Object} override Optional override options (can override any of the theme properties listed above).
     */
    constructor(theme, skin, override)
    {
        super();

        // get options from theme and skin type
        var options = this.getOptionsFromTheme(theme, skin, override);
        this.setBaseOptions(options);

        // store params
        this._textureScale = this.__getFromOptions(options, 'textureScale', 1);
        this._texture = this.__getFromOptions(options, 'texture');

        // store source rects
        this._sourceRects = {}
        for (var key in Cursors) 
        {
            // get cursor type
            var cursorType = Cursors[key];

            // check if got source rect for type
            var sourceRect = options[Cursors[key] + "SourceRect"];
            if (sourceRect) 
            { 
                // set cursor type
                this._sourceRects[Cursors[key]] = sourceRect;

                // also load for down state, if set
                sourceRect.downState = options[Cursors[key] + "DownSourceRect"];
            }
        }
        
        // set default cursor type
        this.setCursorType(Cursors.Default);
    }

    /**
     * Get required options for this element type.
     */
    get requiredOptions()
    {
        return ["texture", "defaultSourceRect"];
    }

    /**
     * Get source rect for a given cursor type.
     */
    _getSourceRect(cursorType)
    {
        return this._sourceRects[cursorType] || this._sourceRects[Cursors.Default];
    }

    /**
     * Set the cursor type to display. Called internally by the UI root element.
     * @param {CursorTypes} cursor Cursor type to show.
     */
    setCursorType(cursor)
    {
        // update cursor sprite if needed
        if (this._cursorType !== cursor) 
        {
            var prevOffset = this._sprite ? this._sprite.offset : {x:0, y:0};
            this._sourceRect = this._getSourceRect(cursor);
            this._sprite = new Sprite({texture: this._texture, 
                sourceRect: this._sourceRect, 
                textureScale: this._textureScale});
            this._sprite.offset.xMode = this._sprite.offset.yMode = SizeModes.Pixels;
            this._sprite.offset.set(prevOffset.x, prevOffset.y);
            this._sprite.anchor = Anchors.Fixed;
        }

        // store new type
        this._cursorType = cursor;
    }

    /**
     * Draw the UI element.
     */
    drawImp(pintar, boundingBoxOverride)
    {
        this._sprite.draw(pintar, boundingBoxOverride);
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

        // call base and set offset
        super.update(input, forceState);
        this._sprite.offset = input.mousePosition.clone();

        // check if need to set down state
        if (input.leftMouseDown && this._sourceRect.downState) {
            this._sprite.sourceRectangle = this._sourceRect.downState;
        }
        else {
            this._sprite.sourceRectangle = this._sourceRect;
        }
    }
}

module.exports = Cursor; 
},{"../anchors":1,"../cursor_types":2,"../pintar":18,"../size_modes":20,"./sprite":13,"./ui_element":14}],6:[function(require,module,exports){
/**
 * file: horizontal_line.js
 * description: Implement a horizontal line element.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";
const UIElement = require('./ui_element');
const PintarJS = require('../pintar');
const SizeModes = require('../size_modes');


/**
 * Implement a horizontal line element.
 */
class HorizontalLine extends UIElement
{
    /**
     * Create a horizontal line element.
     * @param {Object} theme
     * @param {PintarJS.Texture} theme.HorizontalLine[skin].texture Texture to use.
     * @param {PintarJS.Rectangle} theme.HorizontalLine[skin].middleSourceRect The source rect of the line center part (repeating).
     * @param {PintarJS.Rectangle} theme.HorizontalLine[skin].startEdgeSourceRect The source rect of the line left side edge.
     * @param {PintarJS.Rectangle} theme.HorizontalLine[skin].endEdgeSourceRect The source rect of the line right side edge.
     * @param {Number} theme.HorizontalLine[skin].textureScale (Optional) Texture scale for horizontal line. 
     */
    constructor(theme, skin, override)
    {
        super();

        // get options from theme and skin type
        var options = this.getOptionsFromTheme(theme, skin, override);
        this.setBaseOptions(options);
        
        // by default horizontal lines take full width
        this.size.x = 100;
        this.size.xMode = SizeModes.Percents;

        // get texture scale
        var textureScale = this.__getFromOptions(options, 'textureScale', 1);

        // set height
        this.size.y = this.__getFromOptions(options, 'middleSourceRect').height * textureScale;
        this.size.yMode = SizeModes.Pixels;

        var texture = this.__getFromOptions(options, 'texture');

        // create left-side edge
        var leftSideSourceRect = this.__getFromOptions(options, 'startEdgeSourceRect');
        if (leftSideSourceRect)
        {
            this._leftEdgeSprite = new PintarJS.Sprite(texture);
            this._leftEdgeSprite.sourceRectangle = leftSideSourceRect;
            this._leftEdgeSprite.size.set(leftSideSourceRect.width * textureScale, leftSideSourceRect.height * textureScale);
        }
        // create right-side edge
        var rightSideSourceRect = this.__getFromOptions(options, 'endEdgeSourceRect');
        if (rightSideSourceRect)
        {
            this._rightEdgeSprite = new PintarJS.Sprite(texture);
            this._rightEdgeSprite.sourceRectangle = rightSideSourceRect;
            this._rightEdgeSprite.size.set(rightSideSourceRect.width * textureScale, rightSideSourceRect.height * textureScale);
        }
        // create center part
        this._middleSprite = new PintarJS.Sprite(texture);
        this._textureScale = this.__getFromOptions(options, 'textureScale');
        this._middleSourceRect = this.__getFromOptions(options, 'middleSourceRect');
    }

    /**
     * Get required options for this element type.
     */
    get requiredOptions()
    {
        return ["texture", "middleSourceRect"];
    }

    /**
     * Draw the UI element.
     */
    drawImp(pintar, boundingBoxOverride)
    {
        // get dest rect
        var destRect = boundingBoxOverride || this.getBoundingBox();

        // width left to draw for center part
        var widthLeft = destRect.width;
        var offsetX = 0;

        // draw left edge
        if (this._leftEdgeSprite)
        {
            this._leftEdgeSprite.position.set(destRect.x, destRect.y);
            pintar.drawSprite(this._leftEdgeSprite);
            widthLeft -= this._leftEdgeSprite.size.x;
            offsetX += this._leftEdgeSprite.size.x;
        }
        // draw right edge
        if (this._rightEdgeSprite)
        {
            this._rightEdgeSprite.position.set(destRect.right - this._rightEdgeSprite.width, destRect.y);
            pintar.drawSprite(this._rightEdgeSprite);
            widthLeft -= this._rightEdgeSprite.size.x;
        }

        // draw center parts
        if (this._middleSprite)
        {
            // reset middle part properties
            this._middleSprite.sourceRectangle = this._middleSourceRect.clone();
            this._middleSprite.size.set(this._middleSourceRect.width * this._textureScale, this._middleSourceRect.height * this._textureScale);

            // draw middle parts
            while (widthLeft > 0)
            {
                this._middleSprite.position.set(destRect.x + offsetX, destRect.y);
                if (this._middleSprite.size.x > widthLeft)
                {
                    var toCut = this._middleSprite.size.x - widthLeft;
                    this._middleSprite.size.x -= toCut;
                    this._middleSprite.sourceRectangle.width -= toCut / this._textureScale;
                }
                pintar.drawSprite(this._middleSprite);
                widthLeft -= this._middleSprite.size.x;
                offsetX += this._middleSprite.size.x;
            }
        }
    }
}

module.exports = HorizontalLine; 
},{"../pintar":18,"../size_modes":20,"./ui_element":14}],7:[function(require,module,exports){
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
},{"../pintar":18,"../sides_properties":19,"./container":4,"./sliced_sprite":11}],8:[function(require,module,exports){
/**
 * file: paragraph.js
 * description: Implement a paragraph element.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";
const UIElement = require('./ui_element');
const PintarJS = require('../pintar');
const SizeModes = require('../size_modes');


/**
 * Implement a paragraph element.
 */
class Paragraph extends UIElement
{
    /**
     * Create a paragraph element.
     * @param {Object} theme
     * @param {String} theme.Paragraph[skin].font (Optional) Font to use.
     * @param {Number} theme.Paragraph[skin].fontSize (Optional) Font size to use.
     * @param {PintarJS.Color} theme.Paragraph[skin].fillColor (Optional) Text fill color.
     * @param {PintarJS.Color} theme.Paragraph[skin].strokeColor (Optional) Text stroke color.
     * @param {Number} theme.Paragraph[skin].strokeWidth (Optional) Text stroke width.
     * @param {PintarJS.TextAlignment} theme.Paragraph[skin].alignment (Optional) Text alignment.
     * @param {Boolean} theme.Paragraph[skin].useStyleCommands (Optional) Should we enable style commands?
     */
    constructor(theme, skin, override)
    {
        super();

        // get options from theme and skin type
        var options = this.getOptionsFromTheme(theme, skin, override);
        this.setBaseOptions(options);
        
        // by default paragraphs take full width
        this.size.x = 100;
        this.size.xMode = SizeModes.Percents;

        // limit paragraph text to element width
        this.enableLineBreaking = true;

        // should we center this paragraph's text vertically?
        this.centerTextVertically = true;

        // create text
        this._textSprite = new PintarJS.TextSprite("");
        this._textSprite.useStyleCommands = Boolean(this.__getFromOptions(options, 'useStyleCommands'));
        if (options.font !== undefined) { this._textSprite.font = this.__getFromOptions(options, 'font'); }
        if (options.fontSize !== undefined) { this._textSprite.fontSize = this.__getFromOptions(options, 'fontSize'); }
        if (options.alignment !== undefined) { this._textSprite.alignment = this.__getFromOptions(options, 'alignment'); }
        if (options.fillColor !== undefined) { this._textSprite.color = this.__getFromOptions(options, 'fillColor'); }
        if (options.strokeColor !== undefined) { this._textSprite.strokeColor = this.__getFromOptions(options, 'strokeColor'); }
        if (options.strokeWidth !== undefined) { this._textSprite.strokeWidth = this.__getFromOptions(options, 'strokeWidth'); }

        // if true, set element height automatically from text
        this.autoSetHeight = true;

        // if true, set element width automatically from text
        this.autoSetWidth = false;
    }

    /**
     * Get text.
     */
    get text()
    {
        return this._textSprite.text;
    }

    /**
     * Set text.
     */
    set text(text)
    {
        if (this._textSprite.text !== text) {
            this._textSprite.text = text;
        }
    }

    /**
     * Get text alignment.
     */
    get alignment()
    {
        return this._textSprite.alignment;
    }
    
    /**
     * Set text alignment.
     */
    set alignment(val)
    {
        this._textSprite.alignment = val;
    }

    /**
     * Get required options for this element type.
     */
    get requiredOptions()
    {
        return [];
    }

    /**
     * Draw the UI element.
     */
    drawImp(pintar, boundingBoxOverride)
    {
        // set auto height
        if (this.autoSetHeight) 
        {
            this.size.yMode = SizeModes.Pixels;
            this.size.y = this._textSprite.calculatedHeight;
        }

        // set auto width
        if (this.autoSetWidth) 
        {
            this.size.xMode = SizeModes.Pixels;
            this.size.x = this._textSprite.calculatedWidth;
        }

        // get position and size
        var destRect = boundingBoxOverride || this.getBoundingBox();
        var position = destRect.getPosition();

        // adjust vertical position
        if (this.centerTextVertically) {
            this._textSprite.lineHeightOffsetFactor = 1 / 1.25;
        }
        else {
            this._textSprite.lineHeightOffsetFactor = 1 / 2;
        }

        // set text sprite position
        this._textSprite.position = position;

        // set max width
        this._textSprite.maxWidth = (this.enableLineBreaking && !this.autoSetWidth) ? destRect.width : 0;

        // adjust position for alignment
        if (this.alignment == "center") {
            this._textSprite.position.x += destRect.width / 2 + 1;
        }
        if (this.alignment == "right") {
            this._textSprite.position.x += destRect.width;
        }

        // draw text
        pintar.drawText(this._textSprite);
    }

    /**
     * Get this element value.
     */
    _getValue()
    {
        return this.text;
    }
}

module.exports = Paragraph; 
},{"../pintar":18,"../size_modes":20,"./ui_element":14}],9:[function(require,module,exports){
/**
 * file: progress_bar.js
 * description: Implement a progress bar element.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";
const Container = require('./container');
const PintarJS = require('../pintar');
const SlicedSprite = require('./sliced_sprite');
const Sprite = require('./sprite');
const Anchors = require('../anchors');
const SizeModes = require('../size_modes');
const Utils = require('../utils');

/**
 * Implement a progressbar element.
 */
class ProgressBar extends Container
{
    /**
     * Create a progressbar element.
     * @param {Object} theme
     * @param {PintarJS.Texture} theme.ProgressBar[skin].texture Texture to use.
     * @param {PintarJS.Rectangle} theme.ProgressBar[skin].fillExternalSourceRect The entire source rect, including frame and fill, of the fill sprite.
     * @param {PintarJS.Rectangle} theme.ProgressBar[skin].fillInternalSourceRect The internal source rect of the fill sprite (must be contained inside the external source rect).
     * @param {PintarJS.Rectangle} theme.ProgressBar[skin].fillSourceRect Source rect for fill sprite, when not using 9-sliced sprite (cannot use with fillExternalSourceRect / fillInternalSourceRect).
     * @param {PintarJS.Color} theme.ProgressBar[skin].fillColor (Optional) Progressbar fill color.
     * @param {PintarJS.Rectangle} theme.ProgressBar[skin].backgroundExternalSourceRect The entire source rect, including frame and fill, of the background sprite.
     * @param {PintarJS.Rectangle} theme.ProgressBar[skin].backgroundInternalSourceRect The internal source rect of the background sprite (must be contained inside the external source rect).
     * @param {PintarJS.Rectangle} theme.ProgressBar[skin].backgroundSourceRect Source rect for background sprite, when not using 9-sliced sprite (cannot use with backgroundExternalSourceRect / backgroundInternalSourceRect).
     * @param {PintarJS.Color} theme.ProgressBar[skin].backgroundColor (Optional) Progressbar background color.
     * @param {PintarJS.Rectangle} theme.ProgressBar[skin].foregroundExternalSourceRect The entire source rect, including frame and fill, of an optional foreground sprite.
     * @param {PintarJS.Rectangle} theme.ProgressBar[skin].foregroundInternalSourceRect The internal source rect of the foreground sprite (must be contained inside the external source rect).
     * @param {PintarJS.Rectangle} theme.ProgressBar[skin].foregroundSourceRect Source rect for foreground sprite, when not using 9-sliced sprite (cannot use with foregroundExternalSourceRect / foregroundInternalSourceRect).
     * @param {PintarJS.Color} theme.ProgressBar[skin].foregroundColor (Optional) Progressbar foreground color.
     * @param {Number} theme.ProgressBar[skin].textureScale (Optional) Frame and fill texture scale for both background and progressbar fill.
     * @param {PintarJS.Point} theme.ProgressBar[skin].fillOffset (Optional) Fill part offset from its base position. By default, with offset 0,0, fill part will start from the background's top-left corner.
     * @param {Number} theme.ProgressBar[skin].height (Optional) Progressbar height (if not defined, will base on texture source rectangle).
     * @param {Number} theme.ProgressBar[skin].animationSpeed (Optional) Animation speed when value changes (if 0, will show new value immediately).
     * @param {PintarJS.UI.Anchors} theme.ProgressBar[skin].fillAnchor (Optional) Anchor type for the fill part. Defaults to Top-Left.
     * @param {Boolean} theme.ProgressBar[skin].valueSetWidth (Optional) If true (default), progressbar value will set the fill width.
     * @param {Boolean} theme.ProgressBar[skin].valueSetHeight (Optional) If true (not default), progressbar value will set the fill height.
     * @param {String} skin Element skin to use from theme.
     * @param {Object} override Optional override options (can override any of the theme properties listed above).
     */
    constructor(theme, skin, override)
    {
        super();

        // get options from theme and skin type
        var options = this.getOptionsFromTheme(theme, skin, override);
        this.setBaseOptions(options);

        // sanity checks
        if (options.foregroundSourceRect && (options.foregroundExternalSourceRect || options.foregroundInternalSourceRect)) {
            throw new Error("Option 'foregroundSourceRect' cannot appear with options 'foregroundExternalSourceRect' or 'foregroundInternalSourceRect'!");
        }
        if (options.fillSourceRect && (options.fillInternalSourceRect || options.fillExternalSourceRect)) {
            throw new Error("Option 'fillSourceRect' cannot appear with options 'fillInternalSourceRect' or 'fillExternalSourceRect'!");
        }
        if (options.backgroundSourceRect && (options.backgroundInternalSourceRect || options.backgroundExternalSourceRect)) {
            throw new Error("Option 'backgroundSourceRect' cannot appear with options 'backgroundInternalSourceRect' or 'backgroundExternalSourceRect'!");
        }

        // store fill offset
        this.fillOffset = this.__getFromOptions(options, 'fillOffset', PintarJS.Point.zero());

        // get texture scale
        var textureScale = this._textureScale = this.__getFromOptions(options, 'textureScale', 1);

        // get texture
        var texture = this.__getFromOptions(options, 'texture');

        // create background sprite as regular UI sprite
        var backgroundSourceRect = this.__getFromOptions(options, 'backgroundSourceRect');
        if (backgroundSourceRect) {
            this._backgroundSprite = new Sprite({texture: texture, 
                sourceRect: backgroundSourceRect, 
                textureScale: textureScale});
        }
        // create background sprite as 9-sliced sprite
        else if (options.backgroundExternalSourceRect) {
            var backgroundExternalSourceRect = this.__getFromOptions(options, 'backgroundExternalSourceRect');
            var backgroundInternalSourceRect = this.__getFromOptions(options, 'backgroundInternalSourceRect');
            this._backgroundSprite = new SlicedSprite({texture: texture, 
                externalSourceRect: backgroundExternalSourceRect, 
                internalSourceRect: backgroundInternalSourceRect, 
                textureScale: textureScale}, '_');
        }
        else
        {
            throw new Error("Progress bars must have a background sprite!");
        }
        // set other background properties
        this._backgroundSprite.color = this.__getFromOptions(options, 'backgroundColor', PintarJS.Color.white());
        this._backgroundSprite.anchor = Anchors.Fixed;

        // create fill sprite as regular UI sprite
        var fillSourceRect = this.__getFromOptions(options, 'fillSourceRect');
        if (fillSourceRect) {
            this.spriteFillSourceRect = fillSourceRect;
            this._fillSprite = new Sprite({texture: texture, 
                sourceRect: fillSourceRect, 
                textureScale: textureScale});
        }
        // create fill sprite as 9-sliced sprite
        else if (options.fillExternalSourceRect) {
            var fillExternalSourceRect = this.__getFromOptions(options, 'fillExternalSourceRect');
            var fillInternalSourceRect = this.__getFromOptions(options, 'fillInternalSourceRect');
            this._fillSprite = new SlicedSprite({texture: texture, 
                externalSourceRect: fillExternalSourceRect, 
                internalSourceRect: fillInternalSourceRect, 
                textureScale: textureScale}, '_');
        }
        // no fill??
        else
        {
            throw new Error("Missing progressbar fill part source rect!");
        }

        // set fill other properties
        var fillRect = this.__getFromOptions(options, 'fillExternalSourceRect') || this.__getFromOptions(options, 'fillSourceRect');
        var backRect = this.__getFromOptions(options, 'backgroundExternalSourceRect') || this.__getFromOptions(options, 'backgroundSourceRect');
        this._fillSprite.color = this.__getFromOptions(options, 'fillColor', PintarJS.Color.white());
        this._fillSprite.anchor = Anchors.Fixed;
        this._fillWidthToRemove = backRect ? Math.round(backRect.width - fillRect.width) : 0;
        this._fillHeightToRemove = backRect ? Math.round(backRect.height - fillRect.height) : 0;

        // create optional foreground sprite as regular UI sprite
        var foregroundSourceRect = this.__getFromOptions(options, 'foregroundSourceRect');
        if (foregroundSourceRect) {
            this._foregroundSprite = new Sprite({texture: texture, 
                sourceRect: foregroundSourceRect, 
                textureScale: textureScale});
        }
        // create optional foreground sprite as 9-sliced sprite
        else if (options.foregroundExternalSourceRect) {
            var foregroundExternalSourceRect = this.__getFromOptions(options, 'foregroundExternalSourceRect');
            var foregroundInternalSourceRect = this.__getFromOptions(options, 'foregroundInternalSourceRect');
            this._foregroundSprite = new SlicedSprite({texture: texture, 
                externalSourceRect: foregroundExternalSourceRect, 
                internalSourceRect: foregroundInternalSourceRect, 
                textureScale: textureScale}, '_');
        }
        // set other foreground sprite properties
        if (this._foregroundSprite) {
            this._foregroundSprite.color = this.__getFromOptions(options, 'foregroundColor', PintarJS.Color.white());
            this._foregroundSprite.anchor = Anchors.Fixed;
        }

        // store fill part anchor
        this.fillPartAnchor = this.__getFromOptions(options, 'fillAnchor', Anchors.TopLeft);

        // store if setting width / height
        this._setWidth = Boolean(this.__getFromOptions(options, 'valueSetWidth', true));
        this._setHeight = Boolean(this.__getFromOptions(options, 'valueSetHeight'));

        // calculate progressbar default height and width
        // when using regular sprite
        var fillSourceRect = this.__getFromOptions(options, 'fillSourceRect');
        if (fillSourceRect) {
            this.size.y = fillSourceRect.height * textureScale;
            this.size.x = fillSourceRect.width * textureScale;
        }
        // when using sliced sprite, set default size based on mode
        else
        {
            if (this._setWidth && !this._setHeight) {
                this.size.y = this.__getFromOptions(options, 'height') || (((backRect || fillRect).height) * textureScale);
                this.size.x = 100;
                this.size.xMode = SizeModes.Percents;
            }
            else if (this._setHeight && !this._setWidth) {
                this.size.x = this.__getFromOptions(options, 'width') || (((backRect || fillRect).width) * textureScale);
                this.size.y = this.__getFromOptions(options, 'height') || 100;
            }
        }

        // store animation speed
        this.animationSpeed = this.__getFromOptions(options, 'animationSpeed', 0);

        // set starting value
        this._displayValue = this.value = 0;
    }

    /**
     * Get required options for this element type.
     */
    get requiredOptions()
    {
        return ['texture'];
    }

    /**
     * Get progressbar fill color.
     */
    get fillColor()
    {
        return this._fillSprite.color;
    }

    /**
     * Set progressbar fill color.
     */
    set fillColor(color)
    {
        this._fillSprite.color = color;
    }

    /**
     * Get progressbar fill blend mode.
     */
    get fillBlendMode()
    {
        return this._fillSprite.blendMode;
    }

    /**
     * Set progressbar fill blend mode.
     */
    set fillBlendMode(blendMode)
    {
        this._fillSprite.blendMode = blendMode;
    }

    /**
     * Make display value be the same of value right now, regardless of animation speed.
     * Useful when you want to usually have animation, but set the starting value immediately.
     */
    matchDisplayToValue()
    {
        this._displayValue = this.value;
    }

    /**
     * Set value from value and max.
     * @param {Number} value Current value.
     * @param {Number} max Max value.
     */
    setFromValueAndMax(value, max)
    {
        // special case
        if (max <= 0 || value <= 0) {
            this.value = 0;
            return;
        }

        // set value
        this.value = Math.min(value / max, 1);
    }

    /**
     * Draw the UI element.
     */
    drawImp(pintar, boundingBoxOverride)
    {
        // get dest rect
        var dest = boundingBoxOverride || this.getBoundingBox();

        // draw background
        this._backgroundSprite.offset = dest.getPosition();
        this._backgroundSprite.size = dest.getSize();
        this._backgroundSprite.draw(pintar);

        // draw fill
        var value = this._displayValue;
        if (value > 0)
        {
            // update source rect for single sprite mode
            if (this.spriteFillSourceRect) 
            {
                // reset source rect
                this._fillSprite.sourceRectangle = this.spriteFillSourceRect.clone();

                // update width
                if (this._setWidth) {
                    this._fillSprite.sourceRectangle.width = Math.floor((this._backgroundSprite.sourceRectangle.width - this._fillWidthToRemove) * value);
                    this._fillSprite.size.x = this._fillSprite.sourceRectangle.width * this._textureScale;
                    if (this.fillPartAnchor.indexOf("right") !== -1) {
                        this._fillSprite.sourceRectangle.x = Math.floor(this.spriteFillSourceRect.right - this._fillSprite.sourceRectangle.width);
                    }
                }
                // update height
                if (this._setHeight) {
                    this._fillSprite.sourceRectangle.height = Math.floor((this._backgroundSprite.sourceRectangle.height - this._fillHeightToRemove) * value);
                    this._fillSprite.size.y = this._fillSprite.sourceRectangle.height * this._textureScale;
                    if (this.fillPartAnchor.indexOf("Bottom") !== -1) {
                        this._fillSprite.sourceRectangle.y = Math.floor(this.spriteFillSourceRect.bottom - this._fillSprite.sourceRectangle.height);
                    }
                }

                // update offset
                this._fillSprite.offset = this.getDestTopLeftPositionForRect(dest, this._fillSprite.size, this.fillPartAnchor, this.fillOffset);
            }
            // update size and offset for 9-slice texture
            else
            {
                this._fillSprite.size.x = Math.floor((this._backgroundSprite.size.x - (this._fillWidthToRemove * this._textureScale)) * (this._setWidth ? value : 1));
                this._fillSprite.size.y = Math.floor((this._backgroundSprite.size.y - (this._fillHeightToRemove * this._textureScale)) * (this._setHeight ? value : 1));
                this._fillSprite.offset = this.getDestTopLeftPositionForRect(dest, this._fillSprite.size, this.fillPartAnchor, this.fillOffset);    
            }

            // draw sprite
            this._fillSprite.draw(pintar);
        }

         // draw foreground
         if (this._foregroundSprite) 
         {
            this._foregroundSprite.offset = dest.getPosition();
            this._foregroundSprite.size = dest.getSize();
            this._foregroundSprite.draw(pintar);
         }

         // draw children
        super.drawImp(pintar, boundingBoxOverride);
    }

    /**
     * Get the actual value this progressbar currently shows.
     * Can differ from 'this.value' if animate is enabled.
     */
    get displayedValue()
    {
        return this._displayValue;
    }

    /**
     * Get this element value.
     */
    _getValue()
    {
        return this.value;
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

        // call base update
        super.update(input, forceState);

        // update display value
        if (this._displayValue != this.value)
        {
            if (!this.animationSpeed) { 
                this._displayValue = this.value;
            }
            else {
                this._displayValue = Utils.MoveTowards(this._displayValue, this.value, input.deltaTime * this.animationSpeed);
            }
        }
        
        // make sure display value is in range
        if (this._displayValue < 0) this._displayValue = 0;
        if (this._displayValue > 1) this._displayValue = 1;
    }
}

module.exports = ProgressBar; 
},{"../anchors":1,"../pintar":18,"../size_modes":20,"../utils":22,"./container":4,"./sliced_sprite":11,"./sprite":13}],10:[function(require,module,exports){
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
        this.padding.set(0,0,0,0);
        this.margin.set(0,0,0,0);
    }

    /**
     * Get root container, ie self.
     */
    getRoot()
    {
        return this;
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
        cursor._setParent(this);
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
    draw()
    {
        // if not visible, do nothing
        if (!this.visible) {
            return;
        }

        // check if should update bounding boxes
        this.checkIfSelfBoundingBoxShouldUpdate();

        // draw children
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
        // if not visible, do nothing
        if (!this.visible) {
            return;
        }

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

    /**
     * Check if screen bounds updated.
     */
    checkIfSelfBoundingBoxShouldUpdate()
    {
        if (this.__lastCanvasRect && !this.__lastCanvasRect.equals(this.pintar.canvasRect)) {
            this._onSelfBoundingBoxChange();
        }
        this.__lastCanvasRect = this.pintar.canvasRect.clone();
    }
}

module.exports = UIRoot; 
},{"../input/input_manager":17,"../pintar":18,"./container":4,"./cursor":5}],11:[function(require,module,exports){
/**
 * file: sliced_sprite.js
 * description: A sliced sprite.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";
const PintarJS = require('../pintar');
const UIElement = require('./ui_element');


/**
 * A drawable sprite that is sliced into 9-slices.
 * For more info, read about 9-slice scaling / 9-slice grid in general.
 */
class SlicedSprite extends UIElement
{
    /**
     * Create a sliced sprite element.
     * @param {Object} theme
     * @param {PintarJS.Texture} theme.texture Texture to use.
     * @param {PintarJS.Rectangle} theme.externalSourceRect The entire source rect, including frame and fill.
     * @param {PintarJS.Rectangle} theme.internalSourceRect The internal source rect, must be contained inside the whole source rect.
     * @param {Number} theme.textureScale (Optional) frame and fill texture scale.
     * @param {SlicedSprite.FillModes} theme.fillMode (Optional) How to handle fill part.
     * @param {PintarJS.Color} theme.fillColor (Optional) Fill color.
     * @param {PintarJS.Color} theme.frameColor (Optional) Frame color.
     * @param {String} skin Element skin to use from theme.
     * @param {Object} override Optional override options (can override any of the theme properties listed above).
     */
    constructor(theme, skin, override)
    {
        super();

        // get options from theme and skin type
        var options = this.getOptionsFromTheme(theme, skin, override);
        this.setBaseOptions(options);

        // extract params
        var texture = this.__getFromOptions(options, 'texture');
        var textureScale = this.__getFromOptions(options, 'textureScale', 1);
        var wholeSourceRect = this._externalSourceRect = this.__getFromOptions(options, 'externalSourceRect');
        var fillSourceRect = this._internalSourceRect = this.__getFromOptions(options, 'internalSourceRect');
        var fillMode = this.__getFromOptions(options, 'fillMode', SlicedSprite.FillModes.Tiled);
       
        // calculate frame source rects
        this._leftFrameSourceRect = new PintarJS.Rectangle(wholeSourceRect.x, fillSourceRect.y, fillSourceRect.x - wholeSourceRect.x, fillSourceRect.height);
        this._rightFrameSourceRect = new PintarJS.Rectangle(fillSourceRect.right, fillSourceRect.y, wholeSourceRect.right - fillSourceRect.right, fillSourceRect.height);
        this._topFrameSourceRect = new PintarJS.Rectangle(fillSourceRect.x, wholeSourceRect.y, fillSourceRect.width, fillSourceRect.y - wholeSourceRect.y);
        this._bottomFrameSourceRect = new PintarJS.Rectangle(fillSourceRect.x, fillSourceRect.bottom, fillSourceRect.width, wholeSourceRect.bottom - fillSourceRect.bottom);

        // calculate frame corners rects
        this._topLeftFrameCornerSourceRect = new PintarJS.Rectangle(wholeSourceRect.x, wholeSourceRect.y, fillSourceRect.x - wholeSourceRect.x, fillSourceRect.y - wholeSourceRect.y);
        this._topRightFrameCornerSourceRect = new PintarJS.Rectangle(fillSourceRect.right, wholeSourceRect.y, wholeSourceRect.right - fillSourceRect.right, fillSourceRect.y - wholeSourceRect.y);
        this._bottomLeftFrameCornerSourceRect = new PintarJS.Rectangle(wholeSourceRect.x, fillSourceRect.bottom, fillSourceRect.x - wholeSourceRect.x, wholeSourceRect.bottom - fillSourceRect.bottom);
        this._bottomRightFrameCornerSourceRect = new PintarJS.Rectangle(fillSourceRect.right, fillSourceRect.bottom, wholeSourceRect.right - fillSourceRect.right, wholeSourceRect.bottom - fillSourceRect.bottom);

        // create sprites
        this._topFrameSprite = new PintarJS.Sprite(texture);
        this._bottomFrameSprite = new PintarJS.Sprite(texture);
        this._leftFrameSprite = new PintarJS.Sprite(texture);
        this._rightFrameSprite = new PintarJS.Sprite(texture);
        this._topLeftCornerFrameSprite = new PintarJS.Sprite(texture);
        this._bottomLeftCornerFrameSprite = new PintarJS.Sprite(texture);
        this._topRightCornerFrameSprite = new PintarJS.Sprite(texture);
        this._bottomRightCornerFrameSprite = new PintarJS.Sprite(texture);
        this._fillSprite = new PintarJS.Sprite(texture);

        // set default colors
        this.fillColor = this.__getFromOptions(options, 'fillColor', PintarJS.Color.white());
        this.frameColor = this.__getFromOptions(options, 'frameColor', PintarJS.Color.white());

        // store frame scale
        this.frameScale = textureScale;
        this.fillScale = textureScale;

        // set default blend mode
        this.blendMode = PintarJS.BlendModes.AlphaBlend;

        // store fill mode
        this.fillMode = fillMode || SlicedSprite.FillModes.Tiled;
    }

    /**
     * Get required options for this element type.
     */
    get requiredOptions()
    {
        return ['texture', 'externalSourceRect', 'internalSourceRect'];
    }

    /**
     * Get the external source rect of this sliced sprite.
     */
    get sourceRectangle()
    {
        return this._externalSourceRect;
    }

    /**
     * Set color for both fill and frame.
     */
    set color(color)
    {
        this.fillColor = color.clone();
        this.frameColor = color.clone();
    }

    /**
     * Draw the UI element.
     * @param {*} pintar Pintar instance to draw this element on.
     */
    drawImp(pintar, boundingBoxOverride)
    {
        // get drawing position and size
        var destRect = boundingBoxOverride || this.getBoundingBox();
        
        // get scale and adjust position to centerize sprite
        var scaleFactor = this.absoluteScale;
        var frameScale = scaleFactor * this.frameScale;

        // get position
        var position = destRect.getPosition();
        destRect.width -= this._bottomRightFrameCornerSourceRect.width * frameScale;
        destRect.height -= this._bottomRightFrameCornerSourceRect.height * frameScale;

        // draw frames part
        if (destRect.width > 0 && destRect.height > 0) 
        {
            // function to draw top / bottom frames
            var drawTopAndBottomFrames = (sprite, sourceRect, extraY) => 
            {
                // skip if not needed
                if (sourceRect.width == 0 || sourceRect.height == 0) {
                    return;
                }

                // store original source rect and set starting params
                sprite.sourceRectangle = sourceRect.clone();
                sprite.origin = PintarJS.Point.zero();
                sprite.position = position.clone();
                sprite.blendMode = this.blendMode;
                sprite.position.y += extraY;
                sprite.position.x += this._topLeftFrameCornerSourceRect.width * frameScale;
                sprite.width = sprite.sourceRectangle.width * frameScale;
                sprite.height = sprite.sourceRectangle.height * frameScale;
                sprite.color = this.frameColor;

                // iterate and draw frame
                var exceededRightSide = false;
                while (!exceededRightSide)
                {
                    // check if need to trim the sprite / finish drawing
                    var spriteRight = (sprite.position.x + sprite.width);
                    exceededRightSide = spriteRight >= destRect.right;
                    if (exceededRightSide) 
                    {
                        var toCut = spriteRight - destRect.right;
                        if (toCut > 0) {
                            sprite.sourceRectangle.width -= Math.floor(toCut * (sprite.sourceRectangle.width / sprite.width));
                            sprite.width -= toCut;
                        }
                    }

                    // draw frame part
                    pintar.drawSprite(sprite);
                    sprite.position.x += sprite.width;    
                }
            }

            // draw top and bottom frames
            drawTopAndBottomFrames(this._topFrameSprite, this._topFrameSourceRect, 0);
            drawTopAndBottomFrames(this._bottomFrameSprite, this._bottomFrameSourceRect, destRect.height);

            // function to draw left / right frames
            var drawLeftAndRightFrames = (sprite, sourceRect, extraX) => 
            {
                // skip if not needed
                if (sourceRect.width == 0 || sourceRect.height == 0) {
                    return;
                }

                // store original source rect and set starting params
                sprite.sourceRectangle = sourceRect.clone();
                sprite.origin = PintarJS.Point.zero();
                sprite.position = position.clone();
                sprite.blendMode = this.blendMode;
                sprite.position.x += extraX;
                sprite.position.y += this._topLeftFrameCornerSourceRect.height * frameScale;
                sprite.width = sprite.sourceRectangle.width * frameScale;
                sprite.height = sprite.sourceRectangle.height * frameScale;
                sprite.color = this.frameColor;

                // iterate and draw frame
                var exceededBottomSide = false;
                while (!exceededBottomSide)
                {
                    // check if need to trim the sprite / finish drawing
                    var spriteBottom = (sprite.position.y + sprite.height);
                    exceededBottomSide = spriteBottom >= destRect.bottom;
                    if (exceededBottomSide) 
                    {
                        var toCut = spriteBottom - destRect.bottom;
                        if (toCut > 0) {
                            sprite.sourceRectangle.height -= Math.floor(toCut * (sprite.sourceRectangle.height / sprite.height));
                            sprite.height -= toCut;
                        }
                    }

                    // draw frame part
                    pintar.drawSprite(sprite);
                    sprite.position.y += sprite.height;    
                }
            }

            // draw top and bottom frames
            drawLeftAndRightFrames(this._leftFrameSprite, this._leftFrameSourceRect, 0);
            drawLeftAndRightFrames(this._rightFrameSprite, this._rightFrameSourceRect, destRect.width);

            // function to draw frames corners
            var drawFramesCorner = (sprite, sourceRect, posx, posy) => 
            {
                // skip if not needed
                if (sourceRect.width == 0 || sourceRect.height == 0) {
                    return;
                }

                // store original source rect and set starting params
                sprite.sourceRectangle = sourceRect.clone();
                sprite.origin = PintarJS.Point.zero();
                sprite.position = position.clone();
                sprite.blendMode = this.blendMode;
                sprite.position.x += posx;
                sprite.position.y += posy;
                sprite.width = sprite.sourceRectangle.width * frameScale;
                sprite.height = sprite.sourceRectangle.height * frameScale;
                sprite.color = this.frameColor;

                // draw sprite corner
                pintar.drawSprite(sprite);
            }

            // draw corners
            drawFramesCorner(this._topLeftCornerFrameSprite, this._topLeftFrameCornerSourceRect, 0, 0);
            drawFramesCorner(this._topRightCornerFrameSprite, this._topRightFrameCornerSourceRect, destRect.width, 0);
            drawFramesCorner(this._bottomLeftCornerFrameSprite, this._bottomLeftFrameCornerSourceRect, 0, destRect.height);
            drawFramesCorner(this._bottomRightCornerFrameSprite, this._bottomRightFrameCornerSourceRect, destRect.width, destRect.height);
        }

        // draw fill
        if (this._internalSourceRect.width && this._internalSourceRect.height)
        {
            // prepare fill sprite properties
            var sprite = this._fillSprite;     
            sprite.origin = PintarJS.Point.zero();
            sprite.position = position.clone();
            sprite.blendMode = this.blendMode;
            sprite.position.x += this._topLeftCornerFrameSprite.width;
            sprite.position.y += this._topLeftCornerFrameSprite.height;
            sprite.width = destRect.width - this._bottomLeftCornerFrameSprite.width;
            sprite.height = destRect.height - this._bottomLeftCornerFrameSprite.height;
            sprite.color = this.fillColor;

            // draw fill - stretch mode
            if (this.fillMode === SlicedSprite.FillModes.Stretch) 
            {
                sprite.sourceRectangle = this._internalSourceRect.clone();
                pintar.drawSprite(sprite);
            }
            // draw fill - tiling
            else if (this.fillMode === SlicedSprite.FillModes.Tiled) 
            {
                // setup starting params
                var fillScale = scaleFactor * this.fillScale; 
                var fillSize = new PintarJS.Point(Math.max(this._internalSourceRect.width * fillScale, 1), Math.max(this._internalSourceRect.height * fillScale, 1));
                sprite.size = fillSize.clone();
                var startPosition = sprite.position.clone();

                // iterate columns
                for (var i = 0; i < destRect.width / fillSize.x; ++i)
                {
                    // reset source rect
                    sprite.sourceRectangle = this._internalSourceRect.clone();

                    // set width and position x
                    sprite.size.x = fillSize.x;
                    sprite.position.x = startPosition.x + sprite.width * i;

                    // check if should finish
                    if (sprite.position.x >= this._rightFrameSprite.position.x) {
                        break;
                    }

                    // check if need to trim width
                    var spriteRight = sprite.position.x + sprite.size.x;
                    if (spriteRight > this._rightFrameSprite.position.x)
                    {
                        var toCut = spriteRight - this._rightFrameSprite.position.x;
                        if (toCut > 0) {
                            sprite.sourceRectangle.width -= Math.floor(toCut * (sprite.sourceRectangle.width / sprite.width));
                            sprite.width -= toCut;
                        }
                    }

                    // check if should stop here
                    if (sprite.width == 0) {
                        break;
                    }

                    // iterate rows
                    for (var j = 0; j < destRect.height / fillSize.y; ++j)
                    {
                        // set height and position y
                        sprite.size.y = fillSize.y;
                        sprite.position.y = startPosition.y + sprite.height * j;

                        // check if should finish
                        if (sprite.position.y >= this._bottomFrameSprite.position.y) {
                            break;
                        }

                        // check if need to trim height
                        var spriteBottom = sprite.position.y + sprite.size.y;
                        if (spriteBottom > this._bottomFrameSprite.position.y)
                        {
                            var toCut = spriteBottom - this._bottomFrameSprite.position.y;
                            if (toCut > 0) {
                                sprite.sourceRectangle.height -= Math.floor(toCut * (sprite.sourceRectangle.height / sprite.height));
                                sprite.height -= toCut;
                            }
                        }

                        // check if should stop here
                        if (sprite.height == 0) {
                            break;
                        }

                        // draw sprite
                        pintar.drawSprite(sprite);
                    }
                }
            }
            // draw fill - no fill
            else if (this.fillMode === SlicedSprite.FillModes.None) 
            {
            }
            // unknown mode.
            else
            {
                throw new Error("Invalid fill mode!");
            }
        }
    }
}

// set fill modes
SlicedSprite.FillModes = 
{
    Tiled: 1,
    Stretch: 2,
    None: 3,
};

// export SlicedSprite
module.exports = SlicedSprite;
},{"../pintar":18,"./ui_element":14}],12:[function(require,module,exports){
/**
 * file: slider.js
 * description: Implement a slider element.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";
const Container = require('./container');
const PintarJS = require('../pintar');
const SizeModes = require('../size_modes');
const HorizontalLine = require('./horizontal_line');
const VerticalLine = require('./vertical_line');
const Cursors = require('../cursor_types');


/**
 * Implement a slider element.
 */
class Slider extends Container
{
    /**
     * Create a slider element.
     * @param {Object} theme
     * @param {PintarJS.Texture} theme.Slider[skin].texture Texture to use.
     * @param {PintarJS.Rectangle} theme.Slider[skin].middleSourceRect The source rect of the line center part (repeating).
     * @param {PintarJS.Rectangle} theme.Slider[skin].startEdgeSourceRect The source rect of the line starting edge (left or top).
     * @param {PintarJS.Rectangle} theme.Slider[skin].endEdgeSourceRect The source rect of the line ending edge (right or bottom).
     * @param {PintarJS.Rectangle} theme.Slider[skin].handleSourceRect The source rect of the handle you can use to change slider value.
     * @param {PintarJS.Rectangle} theme.Slider[skin].handleOffset (Optional) Handle offset, in pixels.
     * @param {String} theme.Slider[skin].direction (Optional) Slider direction, either 'horizontal' (default) or 'vertical'.
     * @param {Number} theme.Slider[skin].textureScale (Optional) Texture scale of the button. 
     * @param {String} skin Element skin to use from theme.
     * @param {Object} override Optional override options (can override any of the theme properties listed above).
     */
    constructor(theme, skin, override)
    {
        super();

        // get options from theme and skin type
        var options = this.getOptionsFromTheme(theme, skin, override);
        this.setBaseOptions(options);

        // get texture scale
        var textureScale = this.__getFromOptions(options, 'textureScale', 1);
        
        // get direction
        this._direction = this.__getFromOptions(options, 'direction', "horizontal");

        // set min, max and if should round values
        this._min = 0;
        this._max = 100;
        this._roundValues = true;

        // create the line part of the slider
        this._line = new {horizontal: HorizontalLine, vertical: VerticalLine}[this._direction](options, '_');
        this._line._setParent(this);
        this._line.size.x = 100;
        this._line.size.xMode = '%';
        this._line.size.y = 100;
        this._line.size.yMode = '%';
        this._line.ignoreParentPadding = true;
        this._line.margin.set(0, 0, 0, 0);

        // get middle source rect
        var middleSourceRect = this.__getFromOptions(options, 'middleSourceRect');

        // set default size for horizontal
        if (this._direction === "horizontal") 
        {
            this.size.x = 100;
            this.size.xMode = SizeModes.Percents;
            this.size.y = middleSourceRect.height * textureScale;
            this.size.yMode = SizeModes.Pixels;
        }
        // set default size for vertical
        else 
        {
            this.size.y = 100;
            this.size.yMode = SizeModes.Percents;
            this.size.x = middleSourceRect.width * textureScale;
            this.size.xMode = SizeModes.Pixels;
        }

        // start piece offset
        var startOffset = this.__getFromOptions(options, 'startEdgeSourceRect');
        this._startOffset = startOffset ? 
        new PintarJS.Point(startOffset.width * textureScale, startOffset.height * textureScale) : 
        new PintarJS.Point(0, 0);

        // end piece offset
        var endEdgeSourceRect = this.__getFromOptions(options, 'endEdgeSourceRect');
        this._endOffset = endEdgeSourceRect ? 
        new PintarJS.Point(endEdgeSourceRect.width * textureScale, endEdgeSourceRect.height * textureScale) : 
        new PintarJS.Point(0, 0);

        // create handle sprite
        this._handle = new PintarJS.Sprite(this.__getFromOptions(options, 'texture'));
        this._handle.sourceRectangle = this.__getFromOptions(options, 'handleSourceRect');
        this._handle.size.set(this._handle.sourceRectangle.width * textureScale, this._handle.sourceRectangle.height * textureScale);

        // set handle offset
        this._handleOffset = this.__getFromOptions(options, 'handleOffset', PintarJS.Point.zero());

        // set starting value
        this.value = 50;
    }

    /**
     * Get required options for this element type.
     */
    get requiredOptions()
    {
        return ["texture", "middleSourceRect", "handleSourceRect"];
    }

    /**
     * Get min value.
     */
    get min()
    {
        return this._min;
    }

    /**
     * Set min value.
     */
    set min(val)
    {
        this._min = val;
        this.value = this.value;
    }

    /**
     * Get max value.
     */
    get max()
    {
        return this._max;
    }

    /**
     * Set max value.
     */
    set max(val)
    {
        this._max = val;
        this.value = this.value;
    }

    /**
     * Get if should round values
     */
    get roundValue()
    {
        return this._roundValues;
    }

    /**
     * Set if should round values.
     */
    set roundValue(val)
    {
        this._roundValues = Boolean(val);
        this.value = this.value;
    }

    /**
     * Get current value.
     */
    get value()
    {
        return this._value;
    }

    /**
     * Set current value.
     */
    set value(val)
    {
        this._value = this._clampValue(val);
    }

    /**
     * Clamp and validate value range.
     */
    _clampValue(val)
    {
        if (this._roundValues) { val = Math.round(val); }
        if (val < this.min) { val = this.min; }
        if (val > this.max) { val = this.max; }
        return val;
    }

    /**
     * Get if this element is interactive by default.
     * Elements that are not interactive will not trigger events or run the update loop.
     */
    get isNaturallyInteractive()
    {
        return true;
    }
     
    /**
     * Default cursor type for this element.
     */
    get _defaultCursor()
    {
        return Cursors.Pointer;
    }

    /**
     * Get value in percents, from 0.0 to 1.0.
     */
    getValuePercent()
    {
        if (this.min == this.max) { return 0; }
        var val = this.value - this.min;
        return val / (this.max - this.min);
    }

    /**
     * Set value from percent.
     * @param {*} val Value, between 0.0 to 1.0.
     */
    setValueFromPercent(val)
    {
        if (val < 0) val = 0;
        if (val > 1) val = 1;
        this.value = this.min + (this.max - this.min) * val;
    }

    /**
     * Draw the UI element.
     */
    drawImp(pintar, boundingBoxOverride)
    {
        // get dest rect
        var destRect = boundingBoxOverride || this.getBoundingBox();

        // draw background line
        this._line.draw(pintar);

        // draw handle
        this._handle.position = destRect.getPosition().add(this._handleOffset).round();
        if (this._direction === "horizontal") 
        {
            var maxWidth = destRect.width - this._startOffset.x - this._endOffset.x;
            this._handle.position.x += this._startOffset.x + maxWidth * this.getValuePercent() - this._handle.size.x / 2;
        }
        else 
        {
            var maxHeight = destRect.height - this._startOffset.y - this._endOffset.y;
            this._handle.position.y += this._startOffset.y + maxHeight * this.getValuePercent() - this._handle.size.y / 2;
        }
        pintar.drawSprite(this._handle);

        // draw children
        super.drawImp(pintar, boundingBoxOverride);
    }

    /**
     * Update this slider.
     */
    update(input, forceStatus)
    {
        // if not visible, do nothing
        if (!this.visible) {
            return;
        }

        // call base update
        super.update(input, forceStatus);

        // check if should update value
        if (this._state.mouseStartPressOnSelf && this._state.mouseDown) 
        {
            // get dest rect
            var destRect = this.getBoundingBox();

            // set value
            if (this._direction === "horizontal") 
            {
                var maxWidth = destRect.width - this._startOffset.x - this._endOffset.x;
                var relativePos = input.mousePosition.x - destRect.x - this._startOffset.x;
                this.setValueFromPercent(relativePos / maxWidth);
            }
            else 
            {
                var maxHeight = destRect.height - this._startOffset.y - this._endOffset.y;
                var relativePos = input.mousePosition.y - destRect.y - this._startOffset.y;
                this.setValueFromPercent(relativePos / maxHeight);
            }
        }
    }

    /**
     * Get this slider value.
     */
    _getValue()
    {
        return this.value;
    }
}

module.exports = Slider; 
},{"../cursor_types":2,"../pintar":18,"../size_modes":20,"./container":4,"./horizontal_line":6,"./vertical_line":15}],13:[function(require,module,exports){
/**
 * file: sprite.js
 * description: A UI sprite.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";
const PintarJS = require('../pintar');
const UIElement = require('./ui_element');


/**
 * A drawable sprite with UI properties.
 */
class Sprite extends UIElement
{
    /**
     * Create a sprite element.
     * @param {Object} options
     * @param {PintarJS.Texture} options.texture Texture to use.
     * @param {PintarJS.Rectangle} options.sourceRect The sprite source rect.
     * @param {Number} options.textureScale (Optional) texture scale.
     * @param {String} skin Element skin to use from theme.
     * @param {Object} override Optional override options (can override any of the theme properties listed above).
     */
    constructor(options, skin, override)
    {
        super();

        // if we got skin, we assume 'options' is actually a theme - used when other elements inherit from us, like in 'panel' case
        if (skin) 
        {
            options = this.getOptionsFromTheme(options, skin, override);
            this.setBaseOptions(options);
        }

        // extract params
        var texture = this.__getFromOptions(options, 'texture');
        var textureScale = this.__getFromOptions(options, 'textureScale', 1);
        var sourceRect = this.__getFromOptions(options, 'sourceRect');

        // make sure texture scale comes with source rect
        if (options.textureScale && !sourceRect) {
            throw new Error("When providing 'textureScale' option for UI Sprite you must also provide the sourceRect option!");
        }
        
        // create underlying sprite
        this._sprite = new PintarJS.Sprite(texture);
        if (sourceRect) { 
            this._sprite.sourceRectangle = sourceRect; 
            this.size.x = sourceRect.width * textureScale;
            this.size.y = sourceRect.height * textureScale;
        }
    }

    /**
     * Set texture.
     */
    set texture(val)
    {
        this._sprite.texture = val;
    }

    /**
     * Get texture.
     */
    get texture()
    {
        return this._sprite.texture;
    }

    /**
     * Get required options for this element type.
     */
    get requiredOptions()
    {
        return ['texture'];
    }

    /**
     * Get sprite color.
     */
    get color()
    {
        return this._sprite.color;
    }

    /**
     * Set sprite color.
     */
    set color(val)
    {
        this._sprite.color = val;
    }

    /**
     * Get source rectangle.
     */
    get sourceRectangle()
    {
        return this._sprite.sourceRectangle;
    }

    /**
     * Set source rectangle.
     */
    set sourceRectangle(val)
    {
        this._sprite.sourceRectangle = val;
    }

    /**
     * Draw the UI element.
     * @param {*} pintar Pintar instance to draw this element on.
     */
    drawImp(pintar, boundingBoxOverride)
    {
        // get drawing position and size and draw element
        var destRect = boundingBoxOverride || this.getBoundingBox();
        this._sprite.size.set(destRect.width, destRect.height);
        this._sprite.position.set(destRect.x, destRect.y);
        pintar.drawSprite(this._sprite);
    }
}


// export sprite
module.exports = Sprite;
},{"../pintar":18,"./ui_element":14}],14:[function(require,module,exports){
/**
 * file: ui_element.js
 * description: Base UI element class.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";
const PintarJS = require('../pintar');
const Anchors = require('../anchors');
const SizeModes = require('../size_modes');
const Sides = require('../sides_properties');
const UIPoint = require('../ui_point');
const Cursors = require('../cursor_types');

/**
 * State of a UI element.
 */
class UIElementState
{
    constructor()
    {
        this.mouseHover = false;
        this.mouseDown = false;
        this.mouseStartPressOnSelf = false;
    }

    clone()
    {
        var ret = new UIElementState();
        ret.mouseHover = this.mouseHover;
        ret.mouseDown = this.mouseDown;
        ret.mouseStartPressOnSelf = this.mouseStartPressOnSelf;
        return ret;
    }
}


/**
 * Base UI element.
 */
class UIElement
{
    /**
     * Create the UI element.
     */
    constructor()
    {
        // set all basic properties
        this.offset = UIPoint.zero();
        this.size = new UIPoint(100, 'px', 100, 'px');
        this.anchor = Anchors.Auto;
        this.scale = 1;
        this.margin = new Sides(5, 5, 5, 5);
        this.ignoreParentPadding = false;
        this.cursor = this._defaultCursor;
        this._state = new UIElementState();
        this._prevState = new UIElementState();
        this.__parent = null;

        // set fixed position false by default
        this.fixedPosition = false;

        // set default interactive mode
        this.interactive = this.isNaturallyInteractive;

        // callbacks users can register to
        // every callback is called with (this, inputManager)
        this.onMouseEnter = null;
        this.onMouseLeave = null;
        this.whileMouseHover = null;
        this.onMousePressed = null;
        this.onMouseReleased = null;
        this.whileMouseDown = null;
        this.afterValueChanged = null;
        this.beforeUpdate = null;

        // cache some things for faster calculations
        this._selfBoundingBoxCache = null;
        this._parentBoundingBoxCache = null;
        this._parentInternalBoundingBoxCache = null;
        this._boundingBoxVersion = 0;

        // is this element currently visible?
        this.visible = true;

        // when inside container, this will hold the element before us.
        // this is set internally by the container
        this._siblingBefore = null;

        // hold special offset for auto anchors
        this._autoOffset = null;
    }

    /**
     * Get if this element is in fixed position mode.
     */
    get fixedPosition()
    {
        return this._fixedPosition;
    }

    /**
     * Set if this element has fixed position.
     * Elements with fixed position will ignore parents position, padding, margin ect. and will position itself relevant to the root container.
     */
    set fixedPosition(value)
    {
        value = Boolean(value);
        if (this._fixedPosition !== value) {
            this._fixedPosition = value;
            if (this.__parent) {
                this._onParentBoundingBoxChange();
            }
        }
    }

    /**
     * Copy state from another UI element.
     * When copying state, update will not calculate new state, the other element will determine it for us.
     * Events will still trigger.
     * @param {*} other Other element to copy state from, or null to cancel state sharing.
     */
    _copyStateFrom(other)
    {
        this.__copyStateFrom = other;
    }

    /**
     * Set base element theme-related options.
     * @param {Object} options.
     */
    setBaseOptions(options)
    {
        this.scale = this.__getFromOptions(options, 'scale', this.scale);
        this.margin = this.__getFromOptions(options, 'margin', this.margin);
        this.anchor = this.__getFromOptions(options, 'anchor', this.anchor);
        this.cursor = this.__getFromOptions(options, 'cursor', this.cursor);
    }

    /**
     * Default cursor type for this element.
     */
    get _defaultCursor()
    {
        return Cursors.Default;
    }

    /**
     * Get element type name.
     */
    get elementTypeName()
    {
        return this.constructor.name;
    }

    /**
     * Get options for object type and skin from theme.
     * @param {Object} theme Theme object.
     * @param {String} skin Skin to use for this specific element (or 'default' if not defined).
     * @param {Object} override Optional dictionary of values to override theme's defaults.
     */
    getOptionsFromTheme(theme, skin, override)
    {
        // special case - if skin is '_', return theme as options
        if (skin === '_') {
            return theme;
        }

        // get class name
        var elementName = this.elementTypeName;

        // get element definition from theme
        var options = theme[elementName];
        if (!options) {
            throw new Error("Missing definition for object type '" + elementName + "' in UI theme!");
        }

        // get skin type (or default)
        skin = skin || 'default';
        options = options[skin];
        if (!options) {
            throw new Error("Missing definition for object type '" + elementName + "' and skin '" + skin + "' in UI theme!");
        }

        // apply override values
        if (override) 
        {
            var temp = {};
            for (var key in options) {
                temp[key] = options[key];
            }
            for (var key in override) {
                temp[key] = override[key];
            }
            options = temp;
        }

        // do inheritance
        if (options.extends) 
        {
            var temp = {};
            var base = theme[elementName][options.extends];
            for (var key in base) {
                temp[key] = base[key];
            }
            for (var key in options) {
                temp[key] = options[key];
            }
            options = temp;
        }

        // validate required options
        var required = this.requiredOptions;
        for (var i = 0; i < required.length; ++i) {
            if (!(required[i] in options)) {
                throw new Error("Missing mandatory option '" + required[i] + "' in element type '" + elementName + "' options!");
            }
        }

        // success - return element options
        return options;
    }

    /**
     * Get required options for this element type.
     */
    get requiredOptions()
    {
        return [];
    }

    /**
     * Set the parent of this element (called internally by containers).
     * @param {UIElement} parent Parent to set.
     */
    _setParent(parent)
    {
        this._lastParentBoundingBoxVersion = -1;
        this._cachedTopLeftPos = null;
        this._autoOffset = this._siblingBefore = null;
        this._onParentBoundingBoxChange();
        this.__parent = parent;
        this._root = null;
    }

    /**
     * Get root container.
     */
    getRoot()
    {
        if (!this._root) {
            this._root = this.__parent.getRoot();
        }
        return this._root;
    }

    /**
     * Get value from options dictionary (and clone it) or default.
     */
    __getFromOptions(options, key, defaultVal)
    {
        var val = options[key]
        if (val === undefined) val = defaultVal;
        if (val && val.clone) {
            val = val.clone();
        }
        return val;
    }

    /**
     * Get absolute scale.
     */
    get absoluteScale()
    {
        return this.scale * UIElement.globalScale;
    }

    /**
     * Convert a single value to absolute value in pixels.
     */
    _convertVal(val, parentSize, mode)
    {
        switch (mode)
        {
            case undefined:
            case SizeModes.Pixels:
                var scale = this.absoluteScale;
                return Math.ceil(val * scale);

            case SizeModes.Percents:
                return Math.ceil((val / 100.0) * parentSize);

            default:
                throw new Error("Invalid size mode!");
        }
    }

    /**
     * Convert size value to absolute pixels. 
     */
    _convertSize(val)
    {
        var parentSize = (val.xMode == SizeModes.Percents || val.yMode == SizeModes.Percents) ? this.getParentInternalBoundingBox().getSize() : {x:0, y:0};
        return new PintarJS.Point(this._convertVal(val.x, parentSize.x, val.xMode), this._convertVal(val.y, parentSize.y, val.yMode));
    }

    /**
     * Convert size value to absolute pixels. 
     */
    _convertSides(val)
    {
        var ret = val.clone();
        var parentSize = (ret.leftMode == SizeModes.Percents || ret.rightMode == SizeModes.Percents || ret.topMode == SizeModes.Percents || ret.bottomMode == SizeModes.Percents) ? 
            this.getParentInternalBoundingBox().getSize() : {x:0, y:0};
        ret.left = this._convertVal(ret.left, parentSize.x, ret.leftMode);
        ret.right = this._convertVal(ret.right, parentSize.x, ret.rightMode);
        ret.top = this._convertVal(ret.top, parentSize.y, ret.topMode);
        ret.bottom = this._convertVal(ret.bottom, parentSize.y, ret.bottomMode);
        return ret;
    }

    /**
     * Get size in pixels.
     */
    getSizeInPixels()
    {
        return this._convertSize(this.size);
    }

    /**
     * Get offset in pixels.
     */
    getOffsetInPixels()
    {
        return this._convertSize(this.offset);
    }

    /**
     * Return the parent container, if have one.
     */
    get parent()
    {
        return this.__parent;
    }

    /**
     * Get if this element is interactive by default.
     * Elements that are not interactive will not trigger events or run the update loop.
     */
    get isNaturallyInteractive()
    {
        return false;
    }

    /**
     * Draw the UI element.
     * @param {*} pintar Pintar instance to draw this element on.
     * @param {PintarJS.Rectangle} boundingBoxOverride If provided, will draw element with this bounding box.
     */
    draw(pintar, boundingBoxOverride)
    {
        // if not visible, do nothing
        if (!this.visible) {
            return;
        }

        // check if should reset caches
        this.checkIfParentBoundingBoxWasUpdated();
        this.checkIfSelfBoundingBoxShouldUpdate();

        // check if visible and draw
        if (this.isVisiblyByViewport()) {
            this.drawImp(pintar, boundingBoxOverride);
        }
    }

    /**
     * Actually implements drawing this element.
     * @param {*} pintar Pintar instance to draw this element on.
     * @param {PintarJS.Rectangle} boundingBoxOverride If provided, will draw element with this bounding box.
     */
    drawImp(pintar, boundingBoxOverride)
    {
    }

    /**
     * Trigger registered events based on current state and previous state.
     */
    _triggerEvents(input)
    {
        // trigger callbacks
        if (!this._prevState.mouseHover && this._state.mouseHover) { this._onMouseEnter(input); }
        if (this._prevState.mouseHover && !this._state.mouseHover) { this._onMouseLeave(input); }
        if (this._state.mouseHover) { this._whileMouseHover(input); }
        if (!this._prevState.mouseDown && this._state.mouseDown) { this._onMousePressed(input); }
        if (this._prevState.mouseDown && !this._state.mouseDown && this._state.mouseHover) { this._onMouseReleased(input); }
        if (this._state.mouseDown) { this._whileMouseDown(input); }
        
        // trigger value changed events
        var newVal = this._getValue();
        if (newVal !== this._prevVal) {
            this._afterValueChanged(input);
            this._prevVal = newVal;
        }

        // set new previous state
        this._prevState = this._state.clone();
    }

    /**
     * Called when mouse enter element.
     */
    _onMouseEnter(input)
    {
        if (this.onMouseEnter) { this.onMouseEnter(this, input); }
    }

    /**
     * Called when mouse leave element.
     */
    _onMouseLeave(input)
    {
        if (this.onMouseLeave) { this.onMouseLeave(this, input); }
    }

    /**
     * Called while mouse hover on element.
     */
    _whileMouseHover(input)
    {
        if (this.whileMouseHover) { this.whileMouseHover(this, input); }
    }

    /**
     * Called when mouse is pressed on element.
     */
    _onMousePressed(input)
    {
        if (this.onMousePressed) { this.onMousePressed(this, input); }
    }

    /**
     * Called when mouse is released on element.
     */
    _onMouseReleased(input)
    {
        if (this.onMouseReleased) { this.onMouseReleased(this, input); }
    }

    /**
     * Called while mouse is down over element.
     */
    _whileMouseDown(input)
    {
        if (this.whileMouseDown) { this.whileMouseDown(this, input); }
    }

    /**
     * Called after this element's value was changed, for elements that have values.
     */
    _afterValueChanged(input)
    {
        if (this.afterValueChanged) { this.afterValueChanged(this, input); }
    }

    /**
     * For elements that have a changeable value, this returns the current valut for internal usage.
     */
    _getValue()
    {
        return undefined;
    }

    /**
     * Set offset for auto anchor types.
     */
    _setOffsetForAutoAnchors()
    {
        // not auto anchor? skip
        if (this.anchor.indexOf('Auto') !== 0 || this.__parent == null) {
            this._autoOffset = null;
            return;
        }

        // get parent internal bounding box
        var parentIBB = this.getParentInternalBoundingBox()
        
        // get margin
        var selfMargin = this._convertSides(this.margin);

        // get last element and its bounding box and margin
        var lastElement = this._siblingBefore;
        var lastElementMargin = lastElement ? lastElement._convertSides(lastElement.margin) : new Sides(0, 0, 0, 0);
        var lastElementBB = lastElement ? lastElement.getBoundingBox() : new PintarJS.Rectangle();

        // do we need to break line? 
        var needBreakLine = false;

        // if auto-inline anchor, arrange it accordingly
        if ((this.anchor === Anchors.AutoInline) || (this.anchor === Anchors.AutoInlineNoBreak))
        {
            // got element before?
            if (lastElement) 
            {
                // calc margin x as max between self margin and last element margin
                var marginX = Math.max(selfMargin.left, lastElementMargin.right);

                // set offset
                this._autoOffset = new PintarJS.Point(lastElementBB.right - parentIBB.left + marginX, lastElementBB.top - parentIBB.top);

                // check if we should break line
                if ((this.anchor === Anchors.AutoInline) && (this.getBoundingBox(false).right >= parentIBB.right)) 
                {
                    needBreakLine = true;
                }
            }
            // don't have element before? set margin as offset
            else 
            {
                this._autoOffset = new PintarJS.Point(selfMargin.left, selfMargin.top);
            }
        }

        // if auto anchor or need to break line, do auto with line break
        if (needBreakLine || this.anchor === Anchors.Auto)
        {
            // got last element?
            if (lastElement) 
            {
                var marginY = Math.max(selfMargin.top, lastElementMargin.bottom);
                var marginX = Math.max(selfMargin.left, 0);
                this._autoOffset = new PintarJS.Point(marginX, lastElementBB.bottom - parentIBB.top + marginY);
            }
            // don't have element before? set margin as offset
            else 
            {
                this._autoOffset = new PintarJS.Point(selfMargin.left, selfMargin.top);
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

        // trigger before-update callback
        if (this.beforeUpdate) {
            this.beforeUpdate(this, input);
        }

        // check if bounding box should update
        this.checkIfSelfBoundingBoxShouldUpdate();

        // set auto position
        this._setOffsetForAutoAnchors();

        // not interactive? skip
        if (!this.interactive) {
            return;
        }

        // if copying another element's state, skip
        if (this.__copyStateFrom || forceState) {
            this._state = forceState ? forceState.clone() : this.__copyStateFrom._state.clone();
            this._triggerEvents(input);
            return;
        }

        // get dest rect
        var dest = this.getBoundingBox();

        // check if mouse hover
        var mousePos = input.mousePosition;
        this._state.mouseHover = mousePos.x >= dest.left && mousePos.x <= dest.right && mousePos.y >= dest.top && mousePos.y <= dest.bottom;
        
        // if mouse hover, update cursor
        if (this._state.mouseHover) {
            input.setCursor(this.cursor);
        }

        // check if mouse is down on element
        this._state.mouseDown = this._state.mouseHover && input.leftMouseDown;

        // check if mouse was pressed on this element
        if (this._state.mouseDown && !input.leftMousePrevDown) {
            this._state.mouseStartPressOnSelf = true;
        }

        // cancel pressed on this state
        if (!input.leftMouseDown && !input.isMouseOutside) {
            this._state.mouseStartPressOnSelf = false;
        }

        // trigger events based on new state
        this._triggerEvents(input);
    }

    /**
     * Get this element's bounding rectangle, in pixels.
     * @param {Boolean} calculateAutoAnchors (defaults to true) will also calculate auto anchors positioning if set.
     * @returns {PintarJS.Rectangle} Bounding box, in pixels.
     */
    getBoundingBox(calculateAutoAnchors)
    {
        // if got cached value, return it
        if (this._selfBoundingBoxCache) 
        {
            return this._selfBoundingBoxCache.clone();
        }

        // calculate and return bounding box
        var position = this.getDestTopLeftPosition(calculateAutoAnchors);
        var size = this.getSizeInPixels();
        this._selfBoundingBoxCache = new PintarJS.Rectangle(position.x, position.y, size.x, size.y);
        this._boundingBoxVersion++;
        return this._selfBoundingBoxCache.clone();
    }

    /**
     * Get this element's internal bounding rectangle, in pixels, with padding.
     * Note: this is just bounding box for most elements, but overrided for containers.
     * @returns {PintarJS.Rectangle} Bounding box, in pixels.
     */
    getInternalBoundingBox()
    {
        // if got cached value, return it
        if (this._selfInternalBoundingBoxCache) 
        {
            return this._selfInternalBoundingBoxCache.clone();
        }

        this._selfInternalBoundingBoxCache = this.getBoundingBox();
        return this._selfInternalBoundingBoxCache.clone();
    }

    /**
     * Get currently visible region.
     */
    getVisibleRegion()
    {
        return UIElement.visibleRegion;
    }

    /**
     * Check if this element is visible for current viewport.
     */
    isVisiblyByViewport()
    {
        // get visible region
        var visibleRegion = UIElement.visibleRegion;

        // if got visible region test it
        if (visibleRegion) {

            // get dest rect and check if visible
            var dest = this.getBoundingBox();
            if (dest.bottom < visibleRegion.top || dest.top > visibleRegion.bottom || dest.right < visibleRegion.left || dest.left > visibleRegion.right) {
                return false;
            }
        }

        // if got here it means its visible
        return true;
    }

    /**
     * Get parent bounding box.
     * @returns {PintarJS.Rectangle} Bounding box, in pixels.
     */
    getParentInternalBoundingBox()
    {
        // get parent and make sure valid
        var parent = this.parent;
        if (!parent) {
            throw new Error("Missing parent element! Did you forget to create a UI root and add elements to it?");
        }

        // if in fixed mode, get root bounding box
        if (this.fixedPosition) {
            return this.getRoot().getBoundingBox();
        }

        // ignore padding - take parent whole bounding box
        if (this.ignoreParentPadding) 
        {
            // check if need to refresh cache and return
            if (!this._parentBoundingBoxCache)
            {
                this._parentBoundingBoxCache = this.parent.getBoundingBox();
            }
            return this._parentBoundingBoxCache;
        }
        // don't ignore padding - get internal bounding box
        else 
        {
            // check if need to refresh cache and return
            if (!this._parentInternalBoundingBoxCache)
            {
                this._parentInternalBoundingBoxCache = this.parent.getInternalBoundingBox();
            }
            return this._parentInternalBoundingBoxCache;
        }
    } 

    /**
     * Get absolute top-left position for a given parent internal rectangle, size in pixels, and anchor.
     */
    getDestTopLeftPositionForRect(parentRect, selfSize, anchor, offset)
    {
        // to return
        var ret = new PintarJS.Point(0, 0);

        // set offset factor based on anchor
        var offsetFactor = new PintarJS.Point(1, 1);
        
        // set position based on anchor
        switch (anchor)
        {
            // note: auto anchors behave like top-left because they set the internal 'auto-offset' property.
            case Anchors.TopLeft:
            case Anchors.Auto: 
            case Anchors.AutoInline:
            case Anchors.AutoInlineNoBreak:
                ret.set(parentRect.x, parentRect.y);
                break;

            case Anchors.TopCenter:
                ret.set((parentRect.x + (parentRect.width / 2)) - (selfSize.x / 2), parentRect.y);
                break;

            case Anchors.TopRight:
                ret.set(parentRect.right - selfSize.x, parentRect.y)
                offsetFactor.x = -1;
                break;

            case Anchors.CenterLeft:
                ret.x = parentRect.x;
                ret.y = parentRect.y + (parentRect.height / 2) - (selfSize.y / 2);
                break;

            case Anchors.Center:
                ret.x = parentRect.x + (parentRect.width / 2) - (selfSize.x / 2);
                ret.y = parentRect.y + (parentRect.height / 2) - (selfSize.y / 2);
                break;

            case Anchors.CenterRight:
                ret.x = parentRect.right - selfSize.x;
                ret.y = parentRect.y + (parentRect.height / 2) - (selfSize.y / 2);
                offsetFactor.x = -1;
                break;

            case Anchors.BottomLeft:
                ret.x = parentRect.x;
                ret.y = parentRect.bottom - selfSize.y;
                offsetFactor.y = -1;
                break;

            case Anchors.BottomCenter:
                ret.x = parentRect.x + (parentRect.width / 2) - (selfSize.x / 2);
                ret.y = parentRect.bottom - selfSize.y;
                offsetFactor.y = -1;
                break;

            case Anchors.BottomRight:
                ret.x = parentRect.right - selfSize.x;
                ret.y = parentRect.bottom - selfSize.y;
                offsetFactor.x = -1;
                offsetFactor.y = -1;
                break;       
        }
        
        // add self offset and round
        if (offset) {
            ret = ret.add(offset.mul(offsetFactor));
        }
        ret.x = Math.floor(ret.x);
        ret.y = Math.floor(ret.y);

        // add auto-anchor offset (if exist) and return
        if (anchor.indexOf('Auto') === 0 && this._autoOffset) {
            ret = ret.add(this._autoOffset);
        }

        // return result
        return ret;
    }

    /**
     * Get absolute top-left drawing position.
     * @param {Boolean} calculateAutoAnchors (defaults to true) will also calculate auto anchors positioning if set.
     * @returns {PintarJS.Point} Element top-left position.
     */
    getDestTopLeftPosition(calculateAutoAnchors)
    {
        // special case - absolute
        if (this.anchor === Anchors.Fixed)
        {
            return this.offset.clone();
        }

        // got cached value? return it
        if (this._cachedTopLeftPos) {
            return this._cachedTopLeftPos.clone();
        }

        // if got here it means there's no cache, calculate it
        var parentRect = this.getParentInternalBoundingBox();
        var selfSize = this.getSizeInPixels();
        var offset = this.getOffsetInPixels();
        
        // update auto-anchor offset if needed
        if (calculateAutoAnchors || calculateAutoAnchors === undefined) {
            this._setOffsetForAutoAnchors();
        }
        
        // get position based on anchor
        var ret = this.getDestTopLeftPositionForRect(parentRect, selfSize, this.anchor, offset);

        // put in cache and return
        this._boundingBoxVersion++;
        this._cachedTopLeftPos = ret.clone();
        return ret;
    }

    /**
     * Check if bounding box of this element's parent should update.
     * If so, will call _onParentBoundingBoxChange().
     */
    checkIfParentBoundingBoxWasUpdated()
    {
        if (this.__parent && this._lastParentBoundingBoxVersion != this.__parent._boundingBoxVersion) {
            this._onParentBoundingBoxChange();
        }
    }

    /**
     * Check if bounding box of this element should update, but not due to parent change but because of internal change.
     * If so, will call _onSelfBoundingBoxChange().
     */
    checkIfSelfBoundingBoxShouldUpdate()
    {
        var autoOffset = this._autoOffset || PintarJS.Point.zero();
        if ((this.__lastAnchor !== this.anchor) ||
            (!this.__lastSize || !this.__lastSize.equals(this.size)) ||
            (!this.__lastOffset || !this.__lastOffset.equals(this.offset)) ||
            (!this.__lastMargin || !this.__lastMargin.equals(this.margin)) ||
            (!this.__lastAutoOffset || !this.__lastAutoOffset.equals(autoOffset)) ||
            (this.__lastScale !== this.scale) ||
            (this.__lastIgnoreParentPadding !== this.ignoreParentPadding) ||
            (this.padding && (!this.__lastPadding || !this.__lastPadding.equals(this.padding))))
            {
                this._onSelfBoundingBoxChange();
                this.__lastAnchor = this.anchor;
                this.__lastSize = this.size.clone();
                this.__lastOffset = this.offset.clone();
                this.__lastMargin = this.margin.clone();
                this.__lastAutoOffset = autoOffset.clone();
                this.__lastPadding = this.padding ? this.padding.clone() : null;
                this.__lastIgnoreParentPadding = this.ignoreParentPadding;
                this.__lastScale = this.scale;
            }
    }

    /**
     * Called whenever self bounding box changed.
     */
    _onSelfBoundingBoxChange()
    {
        this._autoOffset = null;
        this._cachedTopLeftPos = null;
        this._selfBoundingBoxCache = null;
        this._selfInternalBoundingBoxCache = null;
    }

    /**
     * Called whenever the parent's bounding box was updated.
     */
    _onParentBoundingBoxChange()
    {
        // change in parent bounding box will always result in self change
        this._onSelfBoundingBoxChange();

        // clear parent caches
        this._parentBoundingBoxCache = null;
        this._parentInternalBoundingBoxCache = null;

        // store last known parent bounding box
        if (this.__parent) {
            this._lastParentBoundingBoxVersion = this.__parent._boundingBoxVersion;
        }
    }

    /**
     * Get element center position.
     * @returns {PintarJS.Point} Element center position.
     */
    getCenterPosition()
    {
        var bb = this.getBoundingBox();
        return bb.getCenter();
    } 
}

// set global scale
UIElement.globalScale = 1;

// export the base UI element object
module.exports = UIElement; 
},{"../anchors":1,"../cursor_types":2,"../pintar":18,"../sides_properties":19,"../size_modes":20,"../ui_point":21}],15:[function(require,module,exports){
/**
 * file: vertical_line.js
 * description: Implement a vertical line element.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";
const UIElement = require('./ui_element');
const PintarJS = require('../pintar');
const SizeModes = require('../size_modes');


/**
 * Implement a vertical line element.
 */
class VerticalLine extends UIElement
{
    /**
     * Create a horizontal line element.
     * @param {Object} theme
     * @param {PintarJS.Texture} theme.VerticalLine[skin].texture Texture to use.
     * @param {PintarJS.Rectangle} theme.VerticalLine[skin].middleSourceRect The source rect of the line center part (repeating).
     * @param {PintarJS.Rectangle} theme.VerticalLine[skin].startEdgeSourceRect The source rect of the line top edge.
     * @param {PintarJS.Rectangle} theme.VerticalLine[skin].endEdgeSourceRect The source rect of the line bottom edge.
     * @param {Number} theme.VerticalLine[skin].textureScale (Optional) Texture scale for horizontal line. 
     */
    constructor(theme, skin, override)
    {
        super();

        // get options from theme and skin type
        var options = this.getOptionsFromTheme(theme, skin, override);
        this.setBaseOptions(options);

        // get texture scale
        var textureScale = this.__getFromOptions(options, 'textureScale', 1);

        // get middle source rect
        var middleSourceRect = this.__getFromOptions(options, 'middleSourceRect');

        // set default width
        this.size.x = middleSourceRect.width * textureScale;
        this.size.xMode = SizeModes.Pixels;

        // set default height
        this.size.y = middleSourceRect.height * textureScale * 2;
        this.size.yMode = SizeModes.Pixels;

        // get texture
        var texture = this.__getFromOptions(options, 'texture');

        // create top edge
        var topSideSourceRect = this.__getFromOptions(options, 'startEdgeSourceRect');
        if (topSideSourceRect)
        {
            this._topEdgeSprite = new PintarJS.Sprite(texture);
            this._topEdgeSprite.sourceRectangle = topSideSourceRect;
            this._topEdgeSprite.size.set(topSideSourceRect.width * textureScale, topSideSourceRect.height * textureScale);
        }
        // create bottom edge
        var bottomSideSourceRect = this.__getFromOptions(options, 'endEdgeSourceRect');
        if (bottomSideSourceRect)
        {
            this._bottomEdgeSprite = new PintarJS.Sprite(texture);
            this._bottomEdgeSprite.sourceRectangle = bottomSideSourceRect;
            this._bottomEdgeSprite.size.set(bottomSideSourceRect.width * textureScale, bottomSideSourceRect.height * textureScale);
        }
        // create center part
        this._middleSprite = new PintarJS.Sprite(texture);
        this._textureScale = this.__getFromOptions(options, 'textureScale');
        this._middleSourceRect = this.__getFromOptions(options, 'middleSourceRect');
    }

    /**
     * Get required options for this element type.
     */
    get requiredOptions()
    {
        return ["texture", "middleSourceRect"];
    }

    /**
     * Draw the UI element.
     */
    drawImp(pintar, boundingBoxOverride)
    {
        // get dest rect
        var destRect = boundingBoxOverride || this.getBoundingBox();

        // height left to draw for center part
        var heightLeft = destRect.height;
        var offsetY = 0;

        // draw top edge
        if (this._topEdgeSprite)
        {
            this._topEdgeSprite.position.set(destRect.x, destRect.y);
            pintar.drawSprite(this._topEdgeSprite);
            heightLeft -= this._topEdgeSprite.size.y;
            offsetY += this._topEdgeSprite.size.y;
        }
        // draw bottom edge
        if (this._bottomEdgeSprite)
        {
            this._bottomEdgeSprite.position.set(destRect.x, destRect.bottom - this._bottomEdgeSprite.height);
            pintar.drawSprite(this._bottomEdgeSprite);
            heightLeft -= this._bottomEdgeSprite.size.y;
        }

        // draw center parts
        if (this._middleSprite)
        {
            // reset middle part properties
            this._middleSprite.sourceRectangle = this._middleSourceRect.clone();
            this._middleSprite.size.set(this._middleSourceRect.width * this._textureScale, this._middleSourceRect.height * this._textureScale);

            // draw middle parts
            while (heightLeft > 0)
            {
                this._middleSprite.position.set(destRect.x, destRect.y + offsetY);
                if (this._middleSprite.size.y > heightLeft)
                {
                    var toCut = this._middleSprite.size.y - heightLeft;
                    this._middleSprite.size.y -= toCut;
                    this._middleSprite.sourceRectangle.height -= toCut / this._textureScale;
                }
                pintar.drawSprite(this._middleSprite);
                heightLeft -= this._middleSprite.size.y;
                offsetY += this._middleSprite.size.y;
            }
        }
    }
}

module.exports = VerticalLine; 
},{"../pintar":18,"../size_modes":20,"./ui_element":14}],16:[function(require,module,exports){
var UI = {

    UIRoot: require('./elements/root'),
    UIElement: require('./elements/ui_element'),
    ProgressBar: require('./elements/progress_bar'),
    Container: require('./elements/container'),
    Panel: require('./elements/panel'),
    Paragraph: require('./elements/paragraph'),
    HorizontalLine: require('./elements/horizontal_line'),
    VerticalLine: require('./elements/vertical_line'),
    Button: require('./elements/button'),
    Sprite: require('./elements/sprite'),
    SlicedSprite: require('./elements/sliced_sprite'),
    Slider: require('./elements/slider'),
    Cursor: require('./elements/cursor'),

    InputManager: require('./input/input_manager'),

    Anchors: require('./anchors'),
    SizeModes: require('./size_modes'),
    SidesProperties: require('./sides_properties'),
    UIPoint: require('./ui_point'),
    CursorTypes: require('./cursor_types'),
};
const pintar = require('./pintar');
pintar.UI = UI;
module.exports = UI;
},{"./anchors":1,"./cursor_types":2,"./elements/button":3,"./elements/container":4,"./elements/cursor":5,"./elements/horizontal_line":6,"./elements/panel":7,"./elements/paragraph":8,"./elements/progress_bar":9,"./elements/root":10,"./elements/sliced_sprite":11,"./elements/slider":12,"./elements/sprite":13,"./elements/ui_element":14,"./elements/vertical_line":15,"./input/input_manager":17,"./pintar":18,"./sides_properties":19,"./size_modes":20,"./ui_point":21}],17:[function(require,module,exports){
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

        // mouse position multiply factor - use this to adjust different size between canvas and screen
        this.mousePositionFactor = 1;

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
            this._mouseOutside = true;
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
            this._mouseOutside = false;
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
     * Get if mouse is outside canvas boundaries.
     */
    get isMouseOutside()
    {
        return Boolean(this._mouseOutside);
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
        var ret = this._mousePosition.clone();
        ret.x *= this.mousePositionFactor;
        ret.y *= this.mousePositionFactor;
        return ret;
    }

    /**
     * Return if left mouse button is down.
     * @returns {Boolean} left mouse button status.
     */
    get leftMouseDown()
    {
        return this._mouseButtons[0] && !this._mouseOutside;
    }
    
    /**
     * Return if right mouse button is down.
     * @returns {Boolean} right mouse button status.
     */
    get rightMouseDown()
    {
        return this._mouseButtons[2] && !this._mouseOutside;
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
},{"../pintar":18}],18:[function(require,module,exports){
var pintar = window.PintarJS || window.pintar;
if (!pintar) { throw new Error("Missing PintarJS main object."); }
module.exports = pintar;
},{}],19:[function(require,module,exports){
/**
 * file: sides.js
 * description: Implement a data structure for sides.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";
const getValueAndType = require('./utils').getValueAndType;

/**
 * Implement a simple data structure to hold value for all sides - top, left, bottom, right.
 */
class SidesProperties
{
    /**
     * Create the sides data.
     */
    constructor(left, right, top, bottom)
    {
        this.left = left || 0;
        this.right = right || 0;
        this.top = top || 0;
        this.bottom = bottom || 0;
        this.leftMode = this.rightMode = this.topMode = this.bottomMode = 'px';
    }

    /**
     * Set values.
     */
    set(left, right, top, bottom)
    {
        this.left = left;
        this.right = right;
        this.top = top;
        this.bottom = bottom;
    }

    /**
     * Get left value.
     */
    get left()
    {
        return this._left;
    }

    /**
     * Get right value.
     */
    get right()
    {
        return this._right;
    }

    /**
     * Get top value.
     */
    get top()
    {
        return this._top;
    }

    /**
     * Get bottom value.
     */
    get bottom()
    {
        return this._bottom;
    }

    /**
     * Set left value,
     */
    set left(value)
    {
        var valueSplit = getValueAndType(value);
        this._left = valueSplit.value;
        this.leftMode = valueSplit.mode || this.leftMode;
    }

    /**
     * Set right value.
     */
    set right(value)
    {
        var valueSplit = getValueAndType(value);
        this._right = valueSplit.value;
        this.rightMode = valueSplit.mode || this.rightMode;
    }

    /**
     * Set top value.
     */
    set top(value)
    {
        var valueSplit = getValueAndType(value);
        this._top = valueSplit.value;
        this.topMode = valueSplit.mode || this.topMode;
    }

    /**
     * Set bottom value.
     */
    set bottom(value)
    {
        var valueSplit = getValueAndType(value);
        this._bottom = valueSplit.value;
        this.bottomMode = valueSplit.mode || this.bottomMode;
    }

    /**
     * Return if equal another value.
     */
    equals(other)
    {
        return this.left === other.left && this.right === other.right && this.top === other.top && this.bottom === other.bottom &&
                this.leftMode === other.leftMode && this.rightMode === other.rightMode && this.topMode === other.topMode && this.bottomMode === other.bottomMode;
    }

    /**
     * Clone and return sides data.
     */
    clone()
    {
        var ret = new SidesProperties(this.left, this.right, this.top, this.bottom);
        ret.leftMode = this.leftMode;
        ret.rightMode = this.rightMode;
        ret.topMode = this.topMode;
        ret.bottomMode = this.bottomMode;
        return ret;
    }
}


module.exports = SidesProperties;
},{"./utils":22}],20:[function(require,module,exports){
/**
 * file: size_modes.js
 * description: Define size modes we can set.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";

module.exports = {
    Pixels: 'px',
    Percents: '%'
};
},{}],21:[function(require,module,exports){
/**
 * file: ui_point.js
 * description: A Point for UI elements position and size.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";
const PintarJS = require('./pintar');
const SizeModes = require('./size_modes');
const getValueAndType = require('./utils').getValueAndType;

/**
 * A UI point = regular point + mode.
 */
class UIPoint extends PintarJS.Point
{
    /**
     * Create the UI point.
     */
    constructor(x, modeX, y, modeY)
    {
        super(x, y);
        this.xMode = modeX || SizeModes.Pixels;
        this.yMode = modeY || SizeModes.Pixels;
    }

    /**
     * Get x value.
     */
    get x()
    {
        return this._x;
    }

    /**
     * Get y value.
     */
    get y()
    {
        return this._y;
    }
        
    /**
     * Set x value.
     */
    set x(value)
    {
        var valueSplit = getValueAndType(value);
        this._x = valueSplit.value;
        this.xMode = valueSplit.mode || this.xMode;
    }

    /**
     * Set y value.
     */
    set y(value)
    {
        var valueSplit = getValueAndType(value);
        this._y = valueSplit.value;
        this.yMode = valueSplit.mode || this.yMode;
    }

    /**
     * Return a clone of this point.
     */
    clone()
    {
        return new UIPoint(this.x, this.xMode, this.y, this.yMode);
    }
    
    /**
     * Check if equal to another point.
     * @param {PintarJS.Point} other Other point to compare to.
     */
    equals(other)
    {
        return other && this.x == other.x && this.y == other.y && this.xMode == other.xMode && this.yMode == other.yMode;
    }
}

/**
 * Get point with 0,0 values.
 */
UIPoint.zero = function()
{
    return new UIPoint(0, 'px', 0, 'px');
}

/**
 * Get point with 1,1 values.
 */
UIPoint.one = function()
{
    return new UIPoint(1, 'px', 1, 'px');
}

/**
 * Get point with 0.5,0.5 values.
 */
UIPoint.half = function()
{
    return new UIPoint(0.5, 'px', 0.5, 'px');
}

// export the UI point
module.exports = UIPoint;
},{"./pintar":18,"./size_modes":20,"./utils":22}],22:[function(require,module,exports){
/**
 * file: utils.js
 * description: Mixed utility methods.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";


module.exports = {

    /**
     * Lerp between two numbers.
     */
    lerp: function(start, end, a) 
    {
        return ((1 - a) * start) + (a * end);
    },

    /**
     * Move from start to end at constant speed.
     */
    MoveTowards: function(start, end, a)
    {
        if (start === end) { return end; }
        var sign = Math.sign(end - start);
        var ret = start + sign * a;
        if (sign > 0 && ret > end) { ret = end; }
        else if (sign < 0 && ret < end) { ret = end; }
        return ret;
    },

    /**
     * Split value and mode, returning a dictionary iwth {value, mode}
     * Values and return examples:
     * 25       =>  {value: 25, mode: undefined}
     * '25px'   =>  {value: 25, mode: 'px'}
     * '25%'    =>  {value: 25, mode: '%'}
     */
    getValueAndType: function(value)
    {
        // got a number? mode is undefined
        if (typeof value === 'number') {
            return {value: value};
        }

        // convert to string and parse
        value = String(value);

        // percent mode
        if (value[value.length-1] === '%') {
            return {value: Number(value.substr(0, value.length-1)), mode: '%'};
        }
        // pixels mode
        else if (value.substr(value.length-2) === 'px') {
            return {value: Number(value.substr(0, value.length-2)), mode: 'px'};
        }

        // unknown
        return {value: Number(value)};
    }
}
},{}]},{},[16])(16)
});
