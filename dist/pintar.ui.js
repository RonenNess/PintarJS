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
        var padding = this._convertSides(this.padding, this.paddingMode);
        ret.x += padding.left;
        ret.y += padding.top;
        ret.width -= padding.right + padding.left;
        ret.height -= padding.bottom + padding.top;
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
                    element.offset.set(0, lastElement.offset.y + lastElement.size.y);
                    if (element.offset.x > this.size.x) {
                        needToSetAuto = true;
                    }
                }
                else {
                    element.offset.set(0, 0);
                }
            }

            // if auto anchor, arrange it
            if (needToSetAuto || element.anchor === Anchors.Auto)
            {
                if (lastElement) {
                    element.offset.set(0, lastElement.offset.y + lastElement.size.y);
                }
                else {
                    element.offset.set(0, 0);
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
},{"./anchors":1,"./panel":5,"./pintar":6,"./sides_properties":9,"./size_modes":10,"./ui_element":12}],3:[function(require,module,exports){
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
};
const pintar = require('./pintar');
pintar.UI = UI;
module.exports = UI;
},{"./anchors":1,"./container":2,"./input_manager":4,"./panel":5,"./pintar":6,"./progress_bar":7,"./root":8,"./sides_properties":9,"./size_modes":10,"./sliced_sprite":11,"./ui_element":12}],4:[function(require,module,exports){
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
},{}],5:[function(require,module,exports){
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
     */
    constructor(theme, skin)
    {
        super(theme, skin || 'default');
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
},{"./pintar":6,"./sliced_sprite":11}],6:[function(require,module,exports){
var pintar = window.PintarJS || window.pintar;
if (!pintar) { throw new Error("Missing PintarJS main object."); }
module.exports = pintar;
},{}],7:[function(require,module,exports){
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
const Anchors = require('./anchors');
const SizeModes = require('./size_modes');

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
     * @param {PintarJS.Color} theme.ProgressBar[skin].fillColor (Optional) Progressbar fill color.
     * @param {PintarJS.Rectangle} theme.ProgressBar[skin].backgroundExternalSourceRect The entire source rect, including frame and fill, of the background sprite.
     * @param {PintarJS.Rectangle} theme.ProgressBar[skin].backgroundInternalSourceRect The internal source rect of the background sprite (must be contained inside the whole source rect).
     * @param {PintarJS.Color} theme.ProgressBar[skin].backgroundColor (Optional) Progressbar background color.
     * @param {PintarJS.Rectangle} theme.ProgressBar[skin].foregroundExternalSourceRect The entire source rect, including frame and fill, of an optional foreground sprite.
     * @param {PintarJS.Rectangle} theme.ProgressBar[skin].foregroundInternalSourceRect The internal source rect of the foreground sprite (must be contained inside the whole source rect).
     * @param {PintarJS.Color} theme.ProgressBar[skin].foregroundColor (Optional) Progressbar foreground color.
     * @param {Number} theme.ProgressBar[skin].textureScale (Optional) frame and fill texture scale for both background and progressbar fill.
     * @param {PintarJS.Point} theme.ProgressBar[skin].fillOffset (Optional) Fill part offset from its base position. By default, with offset 0,0, fill part will start from the background's top-left corner.
     * @param {Number} theme.ProgressBar[skin].height (Optional) Progressbar height (if not defined, will base on texture source rectangle).
     */
    constructor(theme, skin)
    {
        super();

        // get options from theme and skin type
        var options = this.getOptionsFromTheme(theme, skin);

        // store fill offset
        this.fillOffset = options.fillOffset || PintarJS.Point.zero();

        // get texture scale
        var textureScale = options.textureScale || 1;

        // create background sprite
        this.backgroundSprite = new SlicedSprite({texture: options.texture, 
            externalSourceRect: options.backgroundExternalSourceRect, 
            internalSourceRect: options.backgroundInternalSourceRect, 
            textureScale: textureScale});
        this.backgroundSprite.color = options.backgroundColor || PintarJS.Color.white();
        this.backgroundSprite.anchor = Anchors.Fixed;
        this.backgroundSprite.sizeMode = SizeModes.Pixels;

        // create fill sprite
        this.fillSprite = new SlicedSprite({texture: options.texture, 
            externalSourceRect: options.fillExternalSourceRect, 
            internalSourceRect: options.fillInternalSourceRect, 
            textureScale: textureScale});
        this.fillSprite.color = options.fillColor || PintarJS.Color.white();
        this.fillSprite.anchor = Anchors.Fixed;
        this.fillSprite.sizeMode = SizeModes.Pixels;
        this.fillWidthToRemove = Math.round(options.backgroundExternalSourceRect.width - options.fillExternalSourceRect.width) * textureScale;
        this.fillHeightToRemove = Math.round(options.backgroundExternalSourceRect.height - options.fillExternalSourceRect.height) * textureScale;

        // create optional foreground sprite
        if (options.foregroundExternalSourceRect) {
            this.foregroundSprite = new SlicedSprite({texture: options.texture, 
                externalSourceRect: options.foregroundExternalSourceRect, 
                internalSourceRect: options.foregroundInternalSourceRect, 
                textureScale: textureScale});
            this.foregroundSprite.color = options.foregroundColor || PintarJS.Color.white();
            this.foregroundSprite.anchor = Anchors.Fixed;
            this.foregroundSprite.sizeMode = SizeModes.Pixels;
        }

        // calculate progressbar default height
        this.size.y = options.height || (options.backgroundExternalSourceRect.height * textureScale);

        // set starting value
        this.value = 1;
    }

    /**
     * Get required options for this element type.
     */
    get requiredOptions()
    {
        return ['texture', 'fillExternalSourceRect', 'fillInternalSourceRect', 'backgroundExternalSourceRect', 'backgroundInternalSourceRect'];
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

        // draw fill
        if (this.value > 0)
        {
            this.fillSprite.offset = dest.getPosition().add(this.fillOffset);
            this.fillSprite.size.x = this.backgroundSprite.size.x - this.fillWidthToRemove;
            this.fillSprite.size.y = this.backgroundSprite.size.y - this.fillHeightToRemove;
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
}

module.exports = ProgressBar; 
},{"./anchors":1,"./pintar":6,"./size_modes":10,"./sliced_sprite":11,"./ui_element":12}],8:[function(require,module,exports){
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
        super({UIRoot: { default: { }}});
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
},{"./container":2,"./pintar":6}],9:[function(require,module,exports){
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
        return new SidesProperties(this.left, this.right, this.top, this.bottom);
    }
}


module.exports = SidesProperties;
},{}],10:[function(require,module,exports){
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
},{}],11:[function(require,module,exports){
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
     * 
     */
    constructor(options, skin)
    {
        super();

        // if we got skin, we assume 'options' is actually a theme - used when other elements inherit from us, like in 'panel' case
        if (skin) {
            options = this.getOptionsFromTheme(options, skin);
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
                var fillSize = new PintarJS.Point(this.internalSourceRect.width * fillScale, this.internalSourceRect.height * fillScale);
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
},{"./pintar":6,"./ui_element":12}],12:[function(require,module,exports){
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
        this.offset = PintarJS.Point.zero();
        this.offsetMode = SizeModes.Pixels;
        this.size = new PintarJS.Point(100, 100);
        this.sizeMode = SizeModes.Pixels;
        this.anchor = Anchors.TopLeft;
        this.scale = 1;
        this.ignoreParentPadding = false;
        this.__parent = null;
    }

    /**
     * Get options for object type and skin from theme.
     * @param {Object} theme Theme object.
     * @param {String} skin Skin to use for this specific element (or 'default' if not defined).
     */
    getOptionsFromTheme(theme, skin)
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
     * Convert size value to absolute pixels. 
     */
    _convertSize(val, mode)
    {
        switch (mode)
        {
            case SizeModes.Pixels:
                var ret = val.clone();
                var scale = this.absoluteScale;
                ret.x *= scale;
                ret.y *= scale;
                return ret;

            case SizeModes.Percents:
                var parentSize = this.getParentInternalBoundingBox().size;
                return new PintarJS.Point((val.x / 100.0) * parentSize.x, (val.y / 100.0) * parentSize.y);

            default:
                throw new Error("Invalid size mode!");
        }
    }

    /**
     * Convert size value to absolute pixels. 
     */
    _convertSides(val, mode)
    {
        switch (mode)
        {
            case SizeModes.Pixels:
                var ret = val.clone();
                var scale = this.absoluteScale;
                ret.left *= scale;
                ret.right *= scale;
                ret.top *= scale;
                ret.bottom *= scale;
                return ret;

            case SizeModes.Percents:
                var parentSize = this.getParentInternalBoundingBox().size;
                return new Sides(
                    (val.left / 100.0) * parentSize.x, 
                    (val.right / 100.0) * parentSize.x,
                    (val.top / 100.0) * parentSize.y,
                    (val.bottom / 100.0) * parentSize.y);

            default:
                throw new Error("Invalid size mode!");
        }
    }

    /**
     * Get size in pixels.
     */
    getSizeInPixels()
    {
        return this._convertSize(this.size, this.sizeMode);
    }

    /**
     * Get offset in pixels.
     */
    getOffsetInPixels()
    {
        return this._convertSize(this.offset, this.offsetMode);
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
        var ret = new PintarJS.Point();

        // check if we can use cache
        if (this.__cachedTopLeftPos &&
            this.anchor === this.__lastAnchor &&
            selfSize.equals(this.__lastSize || PintarJS.Point.zero()) &&
            offset.equals(this.__lastOffset || PintarJS.Point.zero()) &&
            parentRect.equals(this.__lastParentRect || new PintarJS.Rectangle()))
            {
                return this.__cachedTopLeftPos;
            }
        
        // set position based on anchor
        switch (this.anchor)
        {
            case Anchors.TopLeft:
                ret.set(parentRect.x, parentRect.y);
                break;

            case Anchors.TopCenter:
                ret.set((parentRect.x + (parentRect.width / 2)) - (selfSize.x / 2), parentRect.y);
                break;

            case Anchors.TopRight:
                ret.set(parentRect.right - selfSize.x, parentRect.y)
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
                break;

            case Anchors.BottomLeft:
                ret.x = parentRect.x;
                ret.y = parentRect.bottom - selfSize.y;
                break;

            case Anchors.BottomCenter:
                ret.x = parentRect.x + (parentRect.width / 2) - (selfSize.x / 2);
                ret.y = parentRect.bottom - selfSize.y;
                break;

            case Anchors.BottomRight:
                ret.x = parentRect.right - selfSize.x;
                ret.y = parentRect.bottom - selfSize.y;
                break;       
        }
        
        // add self position
        ret.x += offset.x;
        ret.y += offset.y;

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
},{"./anchors":1,"./pintar":6,"./sides_properties":9,"./size_modes":10}]},{},[3])(3)
});
