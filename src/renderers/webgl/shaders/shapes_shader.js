/**
 * file: shapes_shader.js
 * description: Default shader to draw shapes with.
 * author: Ronen Ness.
 * since: 2021.
 */
"use strict";
const Pixel = require('../../../pixel');
const ShaderBase = require('./shader_base');
const PintarConsole = require('./../../../console');
const ColoredRectangle = require('../../../colored_rectangle');
const ColoredLine = require('../../../colored_line');

// vertex shader source:
const vsSource = `
attribute vec2 a_position;
uniform vec2 u_resolution;
uniform float u_scale;

// main vertex shader func
void main() 
{
    // set point size
    gl_PointSize = u_scale;

    // convert the rectangle from pixels to 0.0 to 1.0
    vec2 zeroToOne = a_position / u_resolution;

    // convert from 0 -> 1 to 0 -> 2
    vec2 zeroToTwo = zeroToOne * 2.0;

    // convert from 0 -> 2 to -1 -> +1 (clipspace)
    vec2 clipSpace = zeroToTwo - 1.0;

    // flip 0,0 from bottom left to conventional 2D top left.
    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
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
        return ["u_color", "u_scale", "u_resolution"];
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
        // set uniforms
        this.setUniform4f(this.uniforms.u_color, renderable.color.r, renderable.color.g, renderable.color.b, renderable.color.a);
        this.setUniformf(this.uniforms.u_scale, renderable.pixelScale || 1);

        // draw pixels
        if (renderable instanceof Pixel) 
        {
            this._gl.bufferData( this._gl.ARRAY_BUFFER, new Float32Array([renderable.position.x+0.5, renderable.position.y+0.5]), this._gl.STATIC_DRAW );
            this._gl.drawArrays( this._gl.POINTS, 0, 1 );
        }
        // draw rectangles
        else if (renderable instanceof ColoredRectangle)
        {
            var x = renderable.position.x;
            var y = renderable.position.y;
            var width = renderable.size.x;
            var height = renderable.size.y;

            // filled rect
            if (renderable.filled) {
                this._gl.bufferData( this._gl.ARRAY_BUFFER, 
                    new Float32Array([x, y,
                        x + width, y,
                        x, y + height,
                        x + width, y + height]), 
                    this._gl.STATIC_DRAW );
                this._gl.drawArrays(this._gl.TRIANGLE_STRIP, 0, 4);
            }
            // lines rect
            else {
                this._gl.lineWidth(renderable.pixelScale);
                this._gl.bufferData( this._gl.ARRAY_BUFFER, 
                    new Float32Array([x, y,
                        x + width, y,
                        x + width, y + height,
                        x, y + height,]), 
                    this._gl.STATIC_DRAW );
                this._gl.drawArrays(this._gl.LINE_LOOP, 0, 4);
            }
        }
        // colored line
        else if (renderable instanceof ColoredLine)
        {
            this._gl.lineWidth(renderable.pixelScale);
            this._gl.bufferData( this._gl.ARRAY_BUFFER, 
                new Float32Array([renderable.position.x, renderable.position.y, renderable.toPosition.x, renderable.toPosition.y]), 
                this._gl.STATIC_DRAW );
            this._gl.drawArrays(this._gl.LINE_STRIP, 0, 2);
        }
    }
};

// export the shader
module.exports = ShapesShader