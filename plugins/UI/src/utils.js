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