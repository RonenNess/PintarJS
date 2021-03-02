/**
 * file: default_shader.js
 * description: Default shader to draw sprites.
 * author: Ronen Ness.
 * since: 2021.
 */
"use strict";
const ShaderBase = require('./shader_base');

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

/**
 * Default shader implementation.
 */
class DefaultShader extends ShaderBase
{
    /**
     * Return vertex shader code.
     */
    get vertexShaderCode()
    {
        return vsSource;
    }
    
    /**
     * Return vertex shader code.
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
        return ["u_offset", "u_size", "u_skew", "u_textureOffset", "u_textureSize", "u_color", "u_colorBooster", "u_rotation", "u_origin"];
    }
        
    /**
     * Update shader about new resolution.
     */
    setResolution(w, h)
    {
        var gl = this._gl;
        var resolutionLocation = gl.getUniformLocation(this._program, "u_resolution");
        gl.uniform2f(resolutionLocation, w, h);
    }

    /**
     * Prepare to draw a sprite - need to set all uniforms etc.
     */
    prepare(sprite, viewport)
    {
        // set position and size
        this.setUniform2f(this.uniforms.u_offset, sprite.position.x - viewport.offset.x, -sprite.position.y + viewport.offset.y);
        this.setUniform2f(this.uniforms.u_size, sprite.width * sprite.scale.x, sprite.height * sprite.scale.y);
        
        // set source rect
        var srcRect = sprite.sourceRectangleRelative;
        this.setUniform2f(this.uniforms.u_textureOffset, srcRect.x, srcRect.y);
        this.setUniform2f(this.uniforms.u_textureSize, srcRect.width, srcRect.height); 

        // set color
        this.setUniform4f(this.uniforms.u_color, sprite.color.r * sprite.brightness, sprite.color.g * sprite.brightness, sprite.color.b * sprite.brightness, sprite.color.a);
        this.setUniform4f(this.uniforms.u_colorBooster, sprite.colorBoost.r, sprite.colorBoost.g, sprite.colorBoost.b, sprite.colorBoost.a);
        
        // set skew
        this.setUniform2f(this.uniforms.u_skew, sprite.skew.x, sprite.skew.y);

        // set rotation
        var rotation = sprite.rotationVector;
        this.setUniform2f(this.uniforms.u_rotation, rotation.x, rotation.y)

        // set origin
        this.setUniform2f(this.uniforms.u_origin, sprite.origin.x, sprite.origin.y)
    }
};

// export the shader
module.exports = DefaultShader