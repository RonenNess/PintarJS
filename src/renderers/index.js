/**
 * file: index.js
 * description: Index file for renderer types.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";

// export built-in renderers
module.exports = {
    Canvas: require('./canvas'),
    WebGL: require('./webgl'),
    WebGLHybrid: require('./webgl/webgl_hybrid'),
};