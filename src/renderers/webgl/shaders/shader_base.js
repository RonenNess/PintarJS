/**
 * file: shader_base.js
 * description: Base class for all shaders.
 * author: Ronen Ness.
 * since: 2021.
 */
"use strict";
const WebglUtils = require('./webgl_utils').webglUtils;

/**
 * Base class for shaders.
 */
class ShaderBase
{
    /**
     * Return vertex shader code.
     */
    get vertexShaderCode()
    {
        throw new Error("Not implemented!");
    }
    
    /**
     * Return vertex shader code.
     */
    get fragmentShaderCode()
    {
        throw new Error("Not implemented!");
    }

    /**
     * Return a list with all uniform names to load.
     */
    get uniformNames()
    {
        throw new Error("Not implemented!");
    }

    /**
     * Prepare to draw a sprite - need to set all uniforms etc.
     */
    prepare(renderable, viewport)
    {
        throw new Error("Not implemented!");
    }
    
    /**
     * Update shader about new resolution.
     */
    setResolution(w, h)
    {
        if (this.uniforms.u_resolution) {
            this._gl.uniform2f(this.uniforms.u_resolution, w, h);
        }
    }

    /**
     * Draw the sprite.
     */
    draw(renderable, viewport)
    {  
        this.prepare(renderable, viewport);
        this._gl.drawArrays(this._gl.TRIANGLE_STRIP, 0, 4);
    }

    /**
     * Should we enable depth test for this shader?
     */
    get enableDepthTest()
    {
        return false;
    }

    /**
     * Should we enable face culling for this shader?
     */
    get enableFaceCulling()
    {
        return false;
    }

    /**
     * Should we enable stencil test for this shader?
     */
    get enableStencilTest()
    {
        return false;
    }

    /**
     * Should we normalize vertex data?
     */
    get normalizeVertexData()
    {
        return false;
    }

    /**
     * Do we have z component in vertex position?
     */
    get is3d()
    {
        return false;
    }
         
    /**
     * Set uniform vec2 value with check if changed.
     */
    setUniformf(uniform, val)
    {
        // only update if values changed
        if (uniform._lastVal.val !== val) 
        {
            // update cached values
            uniform._lastVal.val = val;

            // set values
            this._gl.uniformf(uniform, val);
        }
    }

    /**
     * Set uniform vec2 value with check if changed.
     */
    setUniform2f(uniform, x, y)
    {
        // only update if values changed
        if (uniform._lastVal.x !== x || uniform._lastVal.y !== y) 
        {
            // update cached values
            uniform._lastVal.x = x; 
            uniform._lastVal.y = y;

            // set values
            this._gl.uniform2f(uniform, x, y);
        }
    }
        
    /**
     * Set uniform vec4 value with check if changed.
     */
    setUniform4f(uniform, x, y, z, w)
    {
        // only update if values changed
        if (uniform._lastVal.x !== x || uniform._lastVal.y !== y || uniform._lastVal.z !== z || uniform._lastVal.w !== w) {
        
            // update cached values
            uniform._lastVal.x = x; 
            uniform._lastVal.y = y;
            uniform._lastVal.z = z;
            uniform._lastVal.w = w;

            // set values
            this._gl.uniform4f(uniform, x, y, z, w);
        }
    }

    /**
     * Set this shader as active
     */
    setAsActive()
    {
        // get web gl
        var gl = this._gl;

        // enable / disable some features
        if (this.enableDepthTest) { gl.enable(gl.DEPTH_TEST); } else { gl.disable(gl.DEPTH_TEST); }
        if (this.enableFaceCulling) { gl.enable(gl.CULL_FACE); } else { gl.disable(gl.CULL_FACE); }
        if (this.enableStencilTest) { gl.enable(gl.STENCIL_TEST); } else { gl.disable(gl.STENCIL_TEST); }

        // bind position buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this._positionBuffer);
        var setRectangle = function(gl, x, y, width, height) {
            var x1 = x;
            var x2 = x + width;
            var y1 = y;
            var y2 = y + height;
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
                x1, y1,
                x2, y1,
                x1, y2,
                x2, y2,
            ]), gl.STATIC_DRAW);
        }
        setRectangle(gl, 0, 0, 1, 1);

        // bind texture buffer
        var texcoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            0.0,  0.0,
            1.0,  0.0,
            0.0,  1.0,
            1.0,  1.0,
        ]), gl.STATIC_DRAW);

        // set our program as active
        gl.useProgram(this._program);

        // define attributes for position vector
        gl.enableVertexAttribArray(this._positionLocation);
        gl.vertexAttribPointer(this._positionLocation, this.is3d ? 3 : 2, gl.FLOAT, this.normalizeVertexData, 0, 0);

        // define attributes for texture coords vector
        gl.enableVertexAttribArray(this._texcoordLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
        gl.vertexAttribPointer(this._texcoordLocation, 2, gl.FLOAT, this.normalizeVertexData, 0, 0);

        // set default 'last value' to uniforms so we'll only update them when needed
        for (var key in this.uniforms) {
            if (this.uniforms.hasOwnProperty(key)) {
                this.uniforms[key]._lastVal = {};
            }
        }
    }

    /**
     * Init the shader.
     */
    init(gl)
    {   
        // store gl
        this._gl = gl;  

        // setup GLSL program
        var program = WebglUtils.createProgramFromSources(gl, [this.vertexShaderCode, this.fragmentShaderCode], undefined, undefined, (reason) => {
            throw new PintarConsole.Error(reason);
        });
        this._program = program;

        // look up where the vertex data needs to go.
        this._positionLocation = gl.getAttribLocation(program, "a_position");
        this._texcoordLocation = gl.getAttribLocation(program, "a_texCoord");

        // Create a buffer to put three 2d clip space points in
        var positionBuffer = gl.createBuffer();

        // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        this._positionBuffer = positionBuffer;
        
        // init all shader uniforms
        this.uniforms = {}
        var uniforms = this.uniformNames;
        for (var i = 0; i < uniforms.length; ++i) {
            this.uniforms[uniforms[i]] = gl.getUniformLocation(this._program, uniforms[i]);
        }
    }
}


module.exports = ShaderBase;