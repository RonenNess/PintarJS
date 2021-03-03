/**
 * file: shapes_shader.js
 * description: Default shader to draw shapes with.
 * author: Ronen Ness.
 * since: 2021.
 */
"use strict";
const ShaderBase = require('./shader_base');

// vertex shader source:
const vsSource = `
// input position
attribute vec2 a_position;

// screen resolution to project quad
uniform vec2 u_resolution;

// main vertex shader func
void main() 
{
    // convert from pixels into 0-2 values
    vec2 zeroToTwo = (a_position / u_resolution) * 2.0;

    // convert from 0->2 to -1->+1 (clipspace) and invert position y
    vec2 clipSpace = zeroToTwo - 1.0;
    clipSpace.y *= -1.0;

    // set output position
    gl_Position = vec4(clipSpace + ((a_position * 2.0) / u_resolution), 0, 1);
}
`;

// fragment (pixel) shader source:
const fsSource = `
precision mediump float;

// shape color
uniform vec4 u_color;

// main fragment shader func
void main() 
{
   gl_FragColor = u_color;
}
`;

/**
 * Default shapes shader implementation.
 */
class ShapesShader extends ShaderBase
{
    /**
     * Return vertex shader code.
     */
    get vertexShaderCode()
    {
        return vsSource;
    }
    
    /**
     * Return fragment shader code.
     */
    get fragmentShaderCode()
    {
        return fsSource;
    }

    /**
     * Return a list with all uniform names to load.
     */
    get uniformNames()
    {
        return ["u_color", "u_resolution"];
    }

    /**
     * Does this shader have a texture?
     */
    get haveTexture()
    {
        return false;
    }

    /**
     * Prepare to draw a renderable - need to set all uniforms etc.
     */
    prepare(renderable, viewport)
    {
    }
    
    /**
     * Draw the sprite.
     */
    draw(renderable, viewport)
    {  
        this._gl.drawArrays(this._gl.TRIANGLE_STRIP, 0, 4);
    }
};

// export the shader
module.exports = ShapesShader