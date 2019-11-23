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