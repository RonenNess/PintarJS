/**
 * file: shaders.js
 * description: Create the basic 2d shaders for rendering with webGL.
 * author: Ronen Ness.
 * since: 2019.
 */
"use strict";

// vertex shader source:
const vsSource = `
// input position and texture coord
attribute vec2 a_position;
attribute vec2 a_texCoord;

// screen resolution to project quad
uniform vec2 u_resolution;

// to set position, size and texture offset from code
// note: u_size only works if quad is made with 0-1 values
uniform vec2 u_offset;
uniform vec2 u_size;
uniform vec2 u_textureOffset;
uniform vec2 u_textureSize;
uniform vec2 u_rotation;
uniform vec2 u_origin;
uniform vec2 u_skew;

// output texture coord
varying vec2 v_texCoord;

// main vertex shader func
void main() 
{
    // apply size and origin
    vec2 position = (a_position * u_size - u_origin * u_size);

    // apply skew
    position.y += u_skew.y * position.x;
    position.x += u_skew.x * position.y;

    // apply rotation and resolution
    position = (vec2(
        position.x * u_rotation.y + position.y * u_rotation.x,
        position.y * u_rotation.y - position.x * u_rotation.x
    ));

    // convert from pixels into 0-2 values
    vec2 zeroToTwo = (position / u_resolution) * 2.0;

    // convert from 0->2 to -1->+1 (clipspace) and invert position y
    vec2 clipSpace = zeroToTwo - 1.0;
    clipSpace.y *= -1.0;

    // set output position
    gl_Position = vec4(clipSpace + ((u_offset * 2.0) / u_resolution), 0, 1);

    // pass the texCoord to the fragment shader
    // The GPU will interpolate this value between points.
    v_texCoord = a_texCoord * u_textureSize + u_textureOffset;
}
`;

// fragment (pixel) shader source:
const fsSource = `
precision mediump float;

// our texture
uniform sampler2D u_image;

// color tint and enhancer
uniform vec4 u_color;
uniform vec4 u_colorBooster;

// the texCoords passed in from the vertex shader.
varying vec2 v_texCoord;

// main fragment shader func
void main() 
{
   gl_FragColor = clamp(texture2D(u_image, v_texCoord) + u_colorBooster, 0.0, 1.0) * u_color;
   gl_FragColor.rgb *= min(gl_FragColor.a, 1.0);
}
`;

// export the shaders code
module.exports = {
    vertex: vsSource,
    fragment: fsSource
}
