/**
 * file: console.js
 * description: For internal errors and logging.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";


/**
 * Implement a simple error throwing and logging.
 * Note: all methods are static.
 */
class Console
{
}

/***
 * Disable all logging and output of PintarJS.
 */
Console.silent = function() {
    Console.debug = Console.log = Console.warn = Console.error = function() {}
};

/**
 * Write a log message.
 */
Console.log = function() {
    var context = "PintarJS | " + (new Date()).toLocaleString() + " |>";
    return Function.prototype.bind.call(console.log, console, context);
}();

/**
 * Write a warning message.
 */
Console.warn = function() {
    var context = "PintarJS | " + (new Date()).toLocaleString() + " | WARNING |>";
    return Function.prototype.bind.call(console.warn || console.log, console, context);
}();

/**
 * Write an error message.
 */
Console.error = function() {
    var context = "PintarJS | " + (new Date()).toLocaleString() + " | ERROR |>";
    return Function.prototype.bind.call(console.error || console.log, console, context);
}();

/**
 * Write a debug message - disabled by default.
 */
Console.debug = function() {
};

/***
 * Enable debug-level messages
 */
Console.enableDebugMessages = function() {
    Console.debug = function() {
        var context = "PintarJS | " + (new Date()).toLocaleString() + " | DEBUG |>";
        return Function.prototype.bind.call(console.debug || console.log, console, context);
    }();
};

/**
 * Create custom PintarJS error type.
 */
class PintarError extends Error 
{
    constructor(message = "", ...args) {
        Console.error("Exception thrown:", message);
        super(message, ...args);
        this.message = "PintarJS Error: " + message;
    }
}

/**
 * Attach error to console.
 */
Console.Error = PintarError;

// export Console
module.exports = Console;