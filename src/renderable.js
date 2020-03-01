/**
 * file: renderable.js
 * description: A renderable object base class.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";


/**
 * A base renderable object.
 */
class Renderable
{
    /**
     * Create the Renderable.
     */
    constructor(position, color, blendMode)
    {
        this.position = position.clone();
        this.color = color.clone();
        this.blendMode = blendMode;
    }

    /**
     * Get alpha / opacity.
     */
    get alpha()
    {
        return this.color.a;
    }

    /**
     * Set alpha / opacity.
     */
    set alpha(val)
    {
        this.color.a = val;
    }

    /**
     * Copy base properties from self to target.
     */
    _copyBasics(target)
    {
        target.position = this.position.clone();
        target.color = this.color.clone();
        target.blendMode = this.blendMode;
    }
    
    /**
     * Get value from options dictionary (and clone it) or default.
     */
    __getFromOptions(options, key, defaultVal)
    {
        var val = options[key];
        if (val === undefined) val = defaultVal;
        if (val && val.clone) {
            val = val.clone();
        }
        return val;
    }
}

// export Renderable class
module.exports = Renderable;