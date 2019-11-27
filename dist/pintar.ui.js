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
    BottomCenterRight: 'BottomCenterRight',
    Auto: 'Auto',
    AutoInline: 'AutoInline',
    Fixed: 'Fixed',
};
},{}],2:[function(require,module,exports){
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
        this.setBaseOptions(options);
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
        var padding = this._convertSides(this.padding);
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
},{"./anchors":1,"./panel":6,"./pintar":8,"./sides_properties":11,"./size_modes":12,"./ui_element":15}],3:[function(require,module,exports){
/**
 * file: horizontal_line.js
 * description: Implement a horizontal line element.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";
const UIElement = require('./ui_element');
const PintarJS = require('./pintar');
const SizeModes = require('./size_modes');


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
     * @param {PintarJS.Rectangle} theme.HorizontalLine[skin].leftEdgeSourceRect The source rect of the line left side edge.
     * @param {PintarJS.Rectangle} theme.HorizontalLine[skin].rightEdgeSourceRect The source rect of the line right side edge.
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
        var textureScale = (options.textureScale || 1);

        // set height
        this.size.y = options.middleSourceRect.height * textureScale;
        this.size.yMode = SizeModes.Pixels;

        // create left-side edge
        var leftSideSourceRect = options.leftEdgeSourceRect;
        if (leftSideSourceRect)
        {
            this.leftEdgeSprite = new PintarJS.Sprite(options.texture);
            this.leftEdgeSprite.sourceRectangle = leftSideSourceRect;
            this.leftEdgeSprite.size.set(leftSideSourceRect.width * textureScale, leftSideSourceRect.height * textureScale);
        }
        // create right-side edge
        var rightSideSourceRect = options.rightEdgeSourceRect;
        if (rightSideSourceRect)
        {
            this.rightEdgeSprite = new PintarJS.Sprite(options.texture);
            this.rightEdgeSprite.sourceRectangle = rightSideSourceRect;
            this.rightEdgeSprite.size.set(rightSideSourceRect.width * textureScale, rightSideSourceRect.height * textureScale);
        }
        // create center part
        this.middleSprite = new PintarJS.Sprite(options.texture);
        this.middleSprite.sourceRectangle = options.middleSourceRect;
        this.middleSprite.size.set(options.middleSourceRect.width * textureScale, options.middleSourceRect.height * textureScale);
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
    draw(pintar)
    {
        // get dest rect
        var destRect = this.getBoundingBox();

        // draw left edge
        if (this.leftEdgeSprite)
        {
            this.leftEdgeSprite.position.set(destRect.x, destRect.y);
            pintar.drawSprite(this.leftEdgeSprite);
        }
        // draw right edge
        if (this.rightEdgeSprite)
        {
            this.rightEdgeSprite.position.set(destRect.right - this.rightEdgeSprite.width, destRect.y);
            pintar.drawSprite(this.rightEdgeSprite);
        }
    }
}

module.exports = HorizontalLine; 
},{"./pintar":8,"./size_modes":12,"./ui_element":15}],4:[function(require,module,exports){
var UI = {
    UIRoot: require('./root'),
    UIElement: require('./ui_element'),
    ProgressBar: require('./progress_bar'),
    InputManager: require('./input_manager'),
    Container: require('./container'),
    Anchors: require('./anchors'),
    SlicedSprite: require('./sliced_sprite'),
    SizeModes: require('./size_modes'),
    SidesProperties: require('./sides_properties'),
    Panel: require('./panel'),
    Paragraph: require('./paragraph'),
    HorizontalLine: require('./horizontal_line'),
    Sprite: require('./sprite'),
    UIPoint: require('./ui_point'),
};
const pintar = require('./pintar');
pintar.UI = UI;
module.exports = UI;
},{"./anchors":1,"./container":2,"./horizontal_line":3,"./input_manager":5,"./panel":6,"./paragraph":7,"./pintar":8,"./progress_bar":9,"./root":10,"./sides_properties":11,"./size_modes":12,"./sliced_sprite":13,"./sprite":14,"./ui_element":15,"./ui_point":16}],5:[function(require,module,exports){
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
        this._mouseDownEventListener = (e) => {
            this._mouseButtons[e.button] = true;
        };
        canvas.addEventListener("mousedown", this._mouseDownEventListener);
        
        // mouse up
        this._mouseUpEventListener = (e) => {
            if (this._mouseButtons[e.button]) { this._mouseClicks[e.button] = true; }
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
},{"./pintar":8}],6:[function(require,module,exports){
/**
 * file: panel.js
 * description: A graphical panel object.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";
const PintarJS = require('./pintar');
const SlicedSprite = require('./sliced_sprite');


/**
 * A drawable sprite that is sliced into 9-slices.
 * For more info, read about 9-slice scaling / 9-slice grid in general.
 */
class Panel extends SlicedSprite
{
    /**
     * Create a panel sprite element.
     * @param {Object} theme
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
        super(theme, skin || 'default', override);
    }
    
    /**
     * Get required options for this element type.
     */
    get requiredOptions()
    {
        return ['texture', 'externalSourceRect', 'internalSourceRect'];
    }
}


// export the panel class
module.exports = Panel;
},{"./pintar":8,"./sliced_sprite":13}],7:[function(require,module,exports){
/**
 * file: paragraph.js
 * description: Implement a paragraph element.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";
const UIElement = require('./ui_element');
const PintarJS = require('./pintar');
const SizeModes = require('./size_modes');


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
     *  
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

        // create text
        this.textSprite = new PintarJS.TextSprite("");
        this.textSprite.useStyleCommands = Boolean(options.useStyleCommands);
        if (options.font !== undefined) { this.textSprite.font = options.font; }
        if (options.fontSize !== undefined) { this.textSprite.fontSize = options.fontSize; }
        if (options.alignment !== undefined) { this.textSprite.alignment = options.alignment; }
        if (options.fillColor !== undefined) { this.textSprite.color = options.fillColor; }
        if (options.strokeColor !== undefined) { this.textSprite.strokeColor = options.strokeColor; }
        if (options.strokeWidth !== undefined) { this.textSprite.strokeWidth = options.strokeWidth; }

        // if true, set element height automatically from text
        this.autoSetHeight = true;
    }

    /**
     * Get text.
     */
    get text()
    {
        return this.textSprite.text;
    }

    /**
     * Set text.
     */
    set text(text)
    {
        this.textSprite.text = text;
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
    draw(pintar)
    {
        // set position
        var destRect = this.getBoundingBox();
        var position = destRect.getPosition();
        position.y += this.textSprite.fontSize;
        this.textSprite.position = position;

        // set max width
        this.textSprite.maxWidth = this.enableLineBreaking ? destRect.width : 0;

        // draw text
        pintar.drawText(this.textSprite);

        // set auto height
        if (this.autoSetHeight) 
        {
            this.size.yMode = SizeModes.Pixels;
            this.size.y = this.textSprite.calculatedHeight;
        }
    }
}

module.exports = Paragraph; 
},{"./pintar":8,"./size_modes":12,"./ui_element":15}],8:[function(require,module,exports){
var pintar = window.PintarJS || window.pintar;
if (!pintar) { throw new Error("Missing PintarJS main object."); }
module.exports = pintar;
},{}],9:[function(require,module,exports){
/**
 * file: progress_bar.js
 * description: Implement a progress bar element.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";
const UIElement = require('./ui_element');
const PintarJS = require('./pintar');
const SlicedSprite = require('./sliced_sprite');
const Sprite = require('./sprite');
const Anchors = require('./anchors');
const SizeModes = require('./size_modes');
const Utils = require('./utils');

/**
 * Implement a progressbar element.
 */
class ProgressBar extends UIElement
{
    /**
     * Create a progressbar element.
     * @param {Object} theme
     * @param {PintarJS.Texture} theme.ProgressBar[skin].texture Texture to use.
     * @param {PintarJS.Rectangle} theme.ProgressBar[skin].fillExternalSourceRect The entire source rect, including frame and fill, of the fill sprite.
     * @param {PintarJS.Rectangle} theme.ProgressBar[skin].fillInternalSourceRect The internal source rect of the fill sprite (must be contained inside the whole source rect).
     * @param {PintarJS.Rectangle} theme.ProgressBar[skin].fillSourceRect Source rect for fill sprite, when not using 9-sliced sprite (cannot use with fillExternalSourceRect / fillInternalSourceRect).
     * @param {PintarJS.Color} theme.ProgressBar[skin].fillColor (Optional) Progressbar fill color.
     * @param {PintarJS.Rectangle} theme.ProgressBar[skin].backgroundExternalSourceRect The entire source rect, including frame and fill, of the background sprite.
     * @param {PintarJS.Rectangle} theme.ProgressBar[skin].backgroundInternalSourceRect The internal source rect of the background sprite (must be contained inside the whole source rect).
     * @param {PintarJS.Rectangle} theme.ProgressBar[skin].backgroundSourceRect Source rect for background sprite, when not using 9-sliced sprite (cannot use with backgroundExternalSourceRect / backgroundInternalSourceRect).
     * @param {PintarJS.Color} theme.ProgressBar[skin].backgroundColor (Optional) Progressbar background color.
     * @param {PintarJS.Rectangle} theme.ProgressBar[skin].foregroundExternalSourceRect The entire source rect, including frame and fill, of an optional foreground sprite.
     * @param {PintarJS.Rectangle} theme.ProgressBar[skin].foregroundInternalSourceRect The internal source rect of the foreground sprite (must be contained inside the whole source rect).
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
        this.fillOffset = options.fillOffset || PintarJS.Point.zero();

        // get texture scale
        var textureScale = options.textureScale || 1;

        // create background sprite as regular UI sprite
        if (options.backgroundSourceRect) {
            this.backgroundSprite = new Sprite({texture: options.texture, 
                sourceRect: options.backgroundSourceRect, 
                textureScale: textureScale});
        }
        // create background sprite as 9-sliced sprite
        else if (options.backgroundExternalSourceRect) {
            this.backgroundSprite = new SlicedSprite({texture: options.texture, 
                externalSourceRect: options.backgroundExternalSourceRect, 
                internalSourceRect: options.backgroundInternalSourceRect, 
                textureScale: textureScale});
        }
        else
        {
            throw new Error("Progress bars must have a background sprite!");
        }
        // set other background properties
        this.backgroundSprite.color = options.backgroundColor || PintarJS.Color.white();
        this.backgroundSprite.anchor = Anchors.Fixed;

        // create fill sprite as regular UI sprite
        if (options.fillSourceRect) {
            this.spriteFillSourceRect = options.fillSourceRect;
            this.fillSprite = new Sprite({texture: options.texture, 
                sourceRect: options.fillSourceRect, 
                textureScale: textureScale});
        }
        // create fill sprite as 9-sliced sprite
        else if (options.fillExternalSourceRect) {
            this.fillSprite = new SlicedSprite({texture: options.texture, 
                externalSourceRect: options.fillExternalSourceRect, 
                internalSourceRect: options.fillInternalSourceRect, 
                textureScale: textureScale});
        }
        // no fill??
        else
        {
            throw new Error("Missing progressbar fill part source rect!");
        }

        // set fill other properties
        var fillRect = options.fillExternalSourceRect || options.fillSourceRect;
        var backRect = options.backgroundExternalSourceRect || options.backgroundSourceRect;
        this.fillSprite.color = options.fillColor || PintarJS.Color.white();
        this.fillSprite.anchor = Anchors.Fixed;
        this.fillWidthToRemove = backRect ? Math.round(backRect.width - fillRect.width) : 0;
        this.fillHeightToRemove = backRect ? Math.round(backRect.height - fillRect.height) : 0;

        // create optional foreground sprite as regular UI sprite
        if (options.foregroundSourceRect) {
            this.foregroundSprite = new Sprite({texture: options.texture, 
                sourceRect: options.foregroundSourceRect, 
                textureScale: textureScale});
        }
        // create optional foreground sprite as 9-sliced sprite
        else if (options.foregroundExternalSourceRect) {
            this.foregroundSprite = new SlicedSprite({texture: options.texture, 
                externalSourceRect: options.foregroundExternalSourceRect, 
                internalSourceRect: options.foregroundInternalSourceRect, 
                textureScale: textureScale});
        }
        // set other foreground sprite properties
        if (this.foregroundSprite) {
            this.foregroundSprite.color = options.foregroundColor || PintarJS.Color.white();
            this.foregroundSprite.anchor = Anchors.Fixed;
        }

        // store fill part anchor
        this.fillPartAnchor = options.fillAnchor || Anchors.TopLeft;

        // calculate progressbar default height and width
        // when using regular sprite
        if (options.fillSourceRect) {
            this.size.y = options.fillSourceRect.height * textureScale;
            this.size.x = options.fillSourceRect.width * textureScale;
        }
        // when using sliced sprite:
        else
        {
            this.size.y = options.height || ((backRect || fillRect).height * textureScale);
            this.size.x = 100;
            this.size.xMode = SizeModes.Percents;
        }

        // store animation speed
        this.animationSpeed = options.animationSpeed || 0;

        // store if set width and height
        if (options.valueSetWidth === undefined) { options.valueSetWidth = true; }
        this.setWidth = Boolean(options.valueSetWidth);
        this.setHeight = Boolean(options.valueSetHeight);

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
        return this.fillSprite.color;
    }

    /**
     * Set progressbar fill color.
     */
    set fillColor(color)
    {
        this.fillSprite.color = color;
    }

    /**
     * Get progressbar fill blend mode.
     */
    get fillBlendMode()
    {
        return this.fillSprite.blendMode;
    }

    /**
     * Set progressbar fill blend mode.
     */
    set fillBlendMode(blendMode)
    {
        this.fillSprite.blendMode = blendMode;
    }

    /**
     * Draw the UI element.
     */
    draw(pintar)
    {
        // get dest rect
        var dest = this.getBoundingBox();

        // draw background
        this.backgroundSprite.offset = dest.getPosition();
        this.backgroundSprite.size = dest.getSize();
        this.backgroundSprite.draw(pintar);

        // get texture scale factor
        var textureScaleX = this.backgroundSprite.size.x / this.backgroundSprite.sourceRectangle.width ;
        var textureScaleY = this.backgroundSprite.size.y / this.backgroundSprite.sourceRectangle.height;

        // draw fill
        var value = this._displayValue;
        if (value > 0)
        {
            // set size and offset
            this.fillSprite.size.x = (this.backgroundSprite.size.x - this.fillWidthToRemove * textureScaleX) * (this.setWidth ? value : 1);
            this.fillSprite.size.y = (this.backgroundSprite.size.y - this.fillHeightToRemove * textureScaleY) * (this.setHeight ? value : 1);
            this.fillSprite.offset = this.getDestTopLeftPositionForRect(dest, this.fillSprite.size, this.fillPartAnchor, this.fillOffset);

            // update source rect for single sprite mode
            if (this.spriteFillSourceRect) 
            {
                // reset source rect
                this.fillSprite.sourceRectangle = this.spriteFillSourceRect.clone();

                // update width
                if (this.setWidth) {
                    this.fillSprite.sourceRectangle.width = (this.backgroundSprite.sourceRectangle.width - this.fillWidthToRemove) * value;
                    if (this.fillPartAnchor.indexOf("right") !== -1) {
                        this.fillSprite.sourceRectangle.x = this.spriteFillSourceRect.right - this.fillSprite.sourceRectangle.width;
                    }
                }
                // update height
                if (this.setHeight) {
                    this.fillSprite.sourceRectangle.height = (this.backgroundSprite.sourceRectangle.height - this.fillHeightToRemove) * value;
                    if (this.fillPartAnchor.indexOf("Bottom") !== -1) {
                        this.fillSprite.sourceRectangle.y = this.spriteFillSourceRect.bottom - this.fillSprite.sourceRectangle.height;
                    }
                }
            }

            // draw sprite
            this.fillSprite.draw(pintar);
        }

         // draw foreground
         if (this.foregroundSprite) 
         {
            this.foregroundSprite.offset = dest.getPosition();
            this.foregroundSprite.size = dest.getSize();
            this.foregroundSprite.draw(pintar);
         }
    }
 
    /**
     * Update the UI element.
     * @param {InputManager} input A class that implements the 'InputManager' API.
     */
    update(input)
    {
        // call base update
        super.update(input);

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
},{"./anchors":1,"./pintar":8,"./size_modes":12,"./sliced_sprite":13,"./sprite":14,"./ui_element":15,"./utils":17}],10:[function(require,module,exports){
/**
 * file: root.js
 * description: Implement a UI root element.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";
const Container = require('./container');
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
        this.padding.set(0, 0, 0, 0);
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
        super.draw(this.pintar);
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
},{"./container":2,"./input_manager":5,"./pintar":8}],11:[function(require,module,exports){
/**
 * file: sides.js
 * description: Implement a data structure for sides.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";

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
},{}],12:[function(require,module,exports){
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
},{}],13:[function(require,module,exports){
/**
 * file: sliced_sprite.js
 * description: A sliced sprite.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";
const PintarJS = require('./pintar');
const UIElement = require('./ui_element');


/**
 * A drawable sprite that is sliced into 9-slices.
 * For more info, read about 9-slice scaling / 9-slice grid in general.
 */
class SlicedSprite extends UIElement
{
    /**
     * Create a sliced sprite element.
     * @param {Object} options
     * @param {PintarJS.Texture} options.texture Texture to use.
     * @param {PintarJS.Rectangle} options.externalSourceRect The entire source rect, including frame and fill.
     * @param {PintarJS.Rectangle} options.internalSourceRect The internal source rect, must be contained inside the whole source rect.
     * @param {Number} options.textureScale (Optional) frame and fill texture scale.
     * @param {SlicedSprite.FillModes} options.fillMode (Optional) How to handle fill part.
     * @param {PintarJS.Color} options.fillColor (Optional) Fill color.
     * @param {PintarJS.Color} options.frameColor (Optional) Frame color.
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
        var texture = options.texture;
        var textureScale = options.textureScale || 1;
        var wholeSourceRect = this.externalSourceRect = options.externalSourceRect;
        var fillSourceRect = this.internalSourceRect = options.internalSourceRect;
        var fillMode = options.fillMode || SlicedSprite.FillModes.Tiled;
       
        // calculate frame source rects
        this.leftFrameSourceRect = new PintarJS.Rectangle(wholeSourceRect.x, fillSourceRect.y, fillSourceRect.x - wholeSourceRect.x, fillSourceRect.height);
        this.rightFrameSourceRect = new PintarJS.Rectangle(fillSourceRect.right, fillSourceRect.y, wholeSourceRect.right - fillSourceRect.right, fillSourceRect.height);
        this.topFrameSourceRect = new PintarJS.Rectangle(fillSourceRect.x, wholeSourceRect.y, fillSourceRect.width, fillSourceRect.y - wholeSourceRect.y);
        this.bottomFrameSourceRect = new PintarJS.Rectangle(fillSourceRect.x, fillSourceRect.bottom, fillSourceRect.width, wholeSourceRect.bottom - fillSourceRect.bottom);

        // calculate frame corners rects
        this.topLeftFrameCornerSourceRect = new PintarJS.Rectangle(wholeSourceRect.x, wholeSourceRect.y, fillSourceRect.x - wholeSourceRect.x, fillSourceRect.y - wholeSourceRect.y);
        this.topRightFrameCornerSourceRect = new PintarJS.Rectangle(fillSourceRect.right, wholeSourceRect.y, wholeSourceRect.right - fillSourceRect.right, fillSourceRect.y - wholeSourceRect.y);
        this.bottomLeftFrameCornerSourceRect = new PintarJS.Rectangle(wholeSourceRect.x, fillSourceRect.bottom, fillSourceRect.x - wholeSourceRect.x, wholeSourceRect.bottom - fillSourceRect.bottom);
        this.bottomRightFrameCornerSourceRect = new PintarJS.Rectangle(fillSourceRect.right, fillSourceRect.bottom, wholeSourceRect.right - fillSourceRect.right, wholeSourceRect.bottom - fillSourceRect.bottom);

        // create sprites
        this.topFrameSprite = new PintarJS.Sprite(texture);
        this.bottomFrameSprite = new PintarJS.Sprite(texture);
        this.leftFrameSprite = new PintarJS.Sprite(texture);
        this.rightFrameSprite = new PintarJS.Sprite(texture);
        this.topLeftCornerFrameSprite = new PintarJS.Sprite(texture);
        this.bottomLeftCornerFrameSprite = new PintarJS.Sprite(texture);
        this.topRightCornerFrameSprite = new PintarJS.Sprite(texture);
        this.bottomRightCornerFrameSprite = new PintarJS.Sprite(texture);
        this.fillSprite = new PintarJS.Sprite(texture);

        // set default colors
        this.fillColor = options.fillColor || PintarJS.Color.white();
        this.frameColor = options.frameColor || PintarJS.Color.white();

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
        return this.externalSourceRect;
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
    draw(pintar)
    {
        // get drawing position and size
        var destRect = this.getBoundingBox();
        
        // get scale and adjust position to centerize sprite
        var scaleFactor = this.absoluteScale;
        var frameScale = scaleFactor * this.frameScale;

        // get position
        var position = destRect.getPosition();
        destRect.width -= this.bottomRightFrameCornerSourceRect.width * frameScale;
        destRect.height -= this.bottomRightFrameCornerSourceRect.height * frameScale;

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
                sprite.position.x += this.topLeftFrameCornerSourceRect.width * frameScale;
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
                            sprite.sourceRectangle.width -= Math.round(toCut * (sprite.sourceRectangle.width / sprite.width));
                            sprite.width -= toCut;
                        }
                    }

                    // draw frame part
                    pintar.drawSprite(sprite);
                    sprite.position.x += sprite.width;    
                }
            }

            // draw top and bottom frames
            drawTopAndBottomFrames(this.topFrameSprite, this.topFrameSourceRect, 0);
            drawTopAndBottomFrames(this.bottomFrameSprite, this.bottomFrameSourceRect, destRect.height);

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
                sprite.position.y += this.topLeftFrameCornerSourceRect.height * frameScale;
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
                            sprite.sourceRectangle.height -= Math.round(toCut * (sprite.sourceRectangle.height / sprite.height));
                            sprite.height -= toCut;
                        }
                    }

                    // draw frame part
                    pintar.drawSprite(sprite);
                    sprite.position.y += sprite.height;    
                }
            }

            // draw top and bottom frames
            drawLeftAndRightFrames(this.leftFrameSprite, this.leftFrameSourceRect, 0);
            drawLeftAndRightFrames(this.rightFrameSprite, this.rightFrameSourceRect, destRect.width);

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
            drawFramesCorner(this.topLeftCornerFrameSprite, this.topLeftFrameCornerSourceRect, 0, 0);
            drawFramesCorner(this.topRightCornerFrameSprite, this.topRightFrameCornerSourceRect, destRect.width, 0);
            drawFramesCorner(this.bottomLeftCornerFrameSprite, this.bottomLeftFrameCornerSourceRect, 0, destRect.height);
            drawFramesCorner(this.bottomRightCornerFrameSprite, this.bottomRightFrameCornerSourceRect, destRect.width, destRect.height);
        }

        // draw fill
        if (this.internalSourceRect.width && this.internalSourceRect.height)
        {
            // prepare fill sprite properties
            var sprite = this.fillSprite;     
            sprite.origin = PintarJS.Point.zero();
            sprite.position = position.clone();
            sprite.blendMode = this.blendMode;
            sprite.position.x += this.topLeftCornerFrameSprite.width;
            sprite.position.y += this.topLeftCornerFrameSprite.height;
            sprite.width = destRect.width - this.bottomLeftCornerFrameSprite.width;
            sprite.height = destRect.height - this.bottomLeftCornerFrameSprite.height;
            sprite.color = this.fillColor;

            // draw fill - stretch mode
            if (this.fillMode === SlicedSprite.FillModes.Stretch) 
            {
                sprite.sourceRectangle = this.internalSourceRect.clone();
                pintar.drawSprite(sprite);
            }
            // draw fill - tiling
            else if (this.fillMode === SlicedSprite.FillModes.Tiled) 
            {
                // setup starting params
                var fillScale = scaleFactor * this.fillScale; 
                var fillSize = new PintarJS.Point(Math.max(this.internalSourceRect.width * fillScale, 1), Math.max(this.internalSourceRect.height * fillScale, 1));
                sprite.size = fillSize.clone();
                var startPosition = sprite.position.clone();

                // iterate columns
                for (var i = 0; i < destRect.width / fillSize.x; ++i)
                {
                    // reset source rect
                    sprite.sourceRectangle = this.internalSourceRect.clone();

                    // set width and position x
                    sprite.size.x = fillSize.x;
                    sprite.position.x = startPosition.x + sprite.width * i;

                    // check if should finish
                    if (sprite.position.x >= this.rightFrameSprite.position.x) {
                        break;
                    }

                    // check if need to trim width
                    var spriteRight = sprite.position.x + sprite.size.x;
                    if (spriteRight > this.rightFrameSprite.position.x)
                    {
                        var toCut = spriteRight - this.rightFrameSprite.position.x;
                        if (toCut > 0) {
                            sprite.sourceRectangle.width -= Math.round(toCut * (sprite.sourceRectangle.width / sprite.width));
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
                        if (sprite.position.y >= this.bottomFrameSprite.position.y) {
                            break;
                        }

                        // check if need to trim height
                        var spriteBottom = sprite.position.y + sprite.size.y;
                        if (spriteBottom > this.bottomFrameSprite.position.y)
                        {
                            var toCut = spriteBottom - this.bottomFrameSprite.position.y;
                            if (toCut > 0) {
                                sprite.sourceRectangle.height -= Math.round(toCut * (sprite.sourceRectangle.height / sprite.height));
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
},{"./pintar":8,"./ui_element":15}],14:[function(require,module,exports){
/**
 * file: sprite.js
 * description: A UI sprite.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";
const PintarJS = require('./pintar');
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
        var texture = options.texture;
        var textureScale = options.textureScale || 1;
        var sourceRect = options.sourceRect;

        // make sure texture scale comes with source rect
        if (options.textureScale && !sourceRect) {
            throw new Error("When providing 'textureScale' option for UI Sprite you must also provide the sourceRect option!");
        }
        
        // create underlying sprite
        this.sprite = new PintarJS.Sprite(texture);
        if (sourceRect) { 
            this.sprite.sourceRectangle = sourceRect.clone(); 
            this.size.x = sourceRect.width * textureScale;
            this.size.y = sourceRect.height * textureScale;
        }
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
        return this.sprite.color;
    }

    /**
     * Set sprite color.
     */
    set color(val)
    {
        this.sprite.color = val;
    }

    /**
     * Get source rectangle.
     */
    get sourceRectangle()
    {
        return this.sprite.sourceRectangle;
    }

    /**
     * Set source rectangle.
     */
    set sourceRectangle(val)
    {
        this.sprite.sourceRectangle = val;
    }

    /**
     * Draw the UI element.
     * @param {*} pintar Pintar instance to draw this element on.
     */
    draw(pintar)
    {
        // get drawing position and size and draw element
        var destRect = this.getBoundingBox();
        this.sprite.size.set(destRect.width, destRect.height);
        this.sprite.position.set(destRect.x, destRect.y);
        pintar.drawSprite(this.sprite);
    }
}


// export sprite
module.exports = Sprite;
},{"./pintar":8,"./ui_element":15}],15:[function(require,module,exports){
/**
 * file: ui_element.js
 * description: Base UI element class.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";
const PintarJS = require('./pintar');
const Anchors = require('./anchors');
const SizeModes = require('./size_modes');
const Sides = require('./sides_properties');
const UIPoint = require('./ui_point');


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
        this.offset = UIPoint.zero();
        this.size = new UIPoint(100, 'px', 100, 'px');
        this.anchor = Anchors.Auto;
        this.scale = 1;
        this.margin = new Sides(5, 5, 5, 5);
        this.ignoreParentPadding = false;
        this.__parent = null;
    }

    /**
     * Set base element theme-related options.
     * @param {Object} options.
     */
    setBaseOptions(options)
    {
        this.scale = options.scale || this.scale;
        this.margin = options.margin || this.margin;
        this.anchor = options.anchor || this.anchor;
    }

    /**
     * Get options for object type and skin from theme.
     * @param {Object} theme Theme object.
     * @param {String} skin Skin to use for this specific element (or 'default' if not defined).
     * @param {Object} override Optional dictionary of values to override theme's defaults.
     */
    getOptionsFromTheme(theme, skin, override)
    {
        // get class name
        var elementName = this.constructor.name;

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
        if (override) {
            var temp = {};
            for (var key in options)
            {
                temp[key] = options[key];
            }
            for (var key in override)
            {
                temp[key] = override[key];
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
        this.__parent = parent;
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
                return val * scale;

            case SizeModes.Percents:
                return (val / 100.0) * parentSize;

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
     * Draw the UI element.
     * @param {*} pintar Pintar instance to draw this element on.
     */
    draw(pintar)
    {
        throw new Error("Not Implemented!");
    }

    /**
     * Update the UI element.
     * @param {InputManager} input A class that implements the 'InputManager' API.
     */
    update(input)
    {
    }

    /**
     * Get this element's bounding rectangle, in pixels.
     * @returns {PintarJS.Rectangle} Bounding box, in pixels.
     */
    getBoundingBox()
    {
        var position = this.getDestTopLeftPosition();
        var size = this.getSizeInPixels();
        return new PintarJS.Rectangle(position.x, position.y, size.x, size.y);
    }

    /**
     * Get this element's internal bounding rectangle, in pixels, with padding.
     * Note: this is just bounding box for most elements, but overrided for containers.
     * @returns {PintarJS.Rectangle} Bounding box, in pixels.
     */
    getInternalBoundingBox()
    {
        return this.getBoundingBox();
    }

    /**
     * Get parent bounding box.
     * @returns {PintarJS.Rectangle} Bounding box, in pixels.
     */
    getParentInternalBoundingBox()
    {
        if (!this.parent) {
            throw new Error("Missing parent element! Did you forget to create a UI root and add elements to it?");
        }
        return this.ignoreParentPadding ? this.parent.getBoundingBox() : this.parent.getInternalBoundingBox();
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
            case Anchors.TopLeft:
            case Anchors.Auto:          // note: auto and auto-inline behave just like top-left because offset is set by the parent container.
            case Anchors.AutoInline:
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
        
        // add self position and return
        if (offset) {
            ret = ret.add(offset.mul(offsetFactor));
        }
        return ret;
    }

    /**
     * Get absolute top-left drawing position.
     * @returns {PintarJS.Point} Element top-left position.
     */
    getDestTopLeftPosition()
    {
        // special case - absolute
        if (this.anchor === Anchors.Fixed)
        {
            return this.offset.clone();
        }

        // get parent bounding box
        var parentRect = this.getParentInternalBoundingBox();
        var selfSize = this.getSizeInPixels();
        var offset = this.getOffsetInPixels();
        

        // check if we can use cache
        if (this.__cachedTopLeftPos &&
            this.anchor === this.__lastAnchor &&
            selfSize.equals(this.__lastSize || PintarJS.Point.zero()) &&
            offset.equals(this.__lastOffset || PintarJS.Point.zero()) &&
            parentRect.equals(this.__lastParentRect || new PintarJS.Rectangle()))
            {
                return this.__cachedTopLeftPos;
            }
        
        // get position based on anchor
        var ret = this.getDestTopLeftPositionForRect(parentRect, selfSize, this.anchor, offset);

        // put in cache and return
        this.__cachedTopLeftPos = ret.clone();
        this.__lastAnchor = this.anchor;
        this.__lastSize = selfSize;
        this.__lastOffset = offset;
        this.__lastParentRect = parentRect.clone();
        return ret;
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
},{"./anchors":1,"./pintar":8,"./sides_properties":11,"./size_modes":12,"./ui_point":16}],16:[function(require,module,exports){
/**
 * file: ui_point.js
 * description: A Point for UI elements position and size.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";
const PintarJS = require('./pintar');
const SizeModes = require('./size_modes');

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
},{"./pintar":8,"./size_modes":12}],17:[function(require,module,exports){
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
}
},{}]},{},[4])(4)
});
