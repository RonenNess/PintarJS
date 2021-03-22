# PintarJS

Micro JS lib (80KB minified) for direct WebGL and canvas rendering.

## Demo

[PintarJS Live Demo](https://ronenness.github.io/PintarJS/demos/index.html)
![PintarJS example](https://github.com/RonenNess/PintarJS/raw/master/demos/example.png "PintarJS transformations example")

## Plugins

Additional PintarJS plugins:

- [PintarJS.UI](plugins/UI/)

## Why

When it comes to WebGL, there are two types of libraries you can find: either high-level huge libraries that manage everything for you (like PIXI), or really low-level stuff that merely wrap WebGL with a more comfortable API and require a lot of work to use.

I needed something that on one hand provide a simple API to draw sprites with all the basic effects, transformations and blending modes, and on the other keeps the API direct and minimal, and don't impose a speicifc structure of scenes, cameras, containers, and other high-level stuff.

If you have similar requirements, ie you just want to draw stuff on screen while maintainig full control on the scene, rendering order and culling, PintarJS might be for you.

## Minimal Example

Using PintarJS is super easy!

```javascript
var pintar = new PintarJS();	// <-- HTML body must have a canvas element
var sprite = new PintarJS.Sprite(new PintarJS.Texture("imgs/skeleton.png");

setInterval(function() {

    pintar.startFrame();
    pintar.drawSprite(sprite);
    pintar.endFrame();

}, 1000 / 60);
```

Note: due to 'cross origin' protection most modern browsers comes with, PintarJS won't be able to load textures when served from filesystem. To test locally, you need a file-serving server and access the HTML and files via `http://localhost` and not via `file:///`. *This problem applies to all WebGL apps, not just PintarJS.*

More info: https://webgl2fundamentals.org/webgl/lessons/webgl-cors-permission.html


## Install

View bower:

```
bower install pintar
```

Via npm (update less frequently):

```
npm install pintar
```

Or you can download `dist/pinter.js` and include in your HTML file.

## Key Features

- WebGL2 and WebGL support with Canvas fallback
- Text drawing
    - Alignment
    - Stroke
    - Multiline
	- Bitmap Font Rendering
	- In-text style commands
- Shapes drawing
    - Rectangle
    - Line
    - Pixels
- Sprites
    - Color Effects
        - Tint (reduce color compontents)
        - Amplify (increase color by percent)
        - Boost (add colors)
        - Brightness
        - Opacity
    - Blend Modes
        - Alpha blend
        - Additive
        - Multiply
        - Subtract
        - Screen
        - Overlay
    - Viewport
        - Drawing region
        - Offset
    - Transformations
        - Rotation
        - Scale
        - Flip
        - Skew
    - Source rectangle from spritesheet
- Custom shaders
- Built-in UI plugin
- Fixed resolution


## Usage

Lets see how to use PintarJS..

### Initialize

To initialize PintarJS you need to have a Canvas element in your HTML page. You can then initialize with one of the following methods:

```javascript
// will init on the first canvas element found on page
var pintar = new PintarJS();

// will init on canvas with id 'canvas2'
var pintar = new PintarJS("#canvas2");

// will init on the given canvas element
var pintar = new PintarJS(document.getElementById("canvas3"));
```

By default, PintarJS will try to use WebGL2. If not found, will use WebGL, and if not found either will fallback to Canvas API.
To control the order of renderers PintarJS will attempt to use you can provide a second parameter, for example:

```javascript
var canvasPintar = new PintarJS(null, PintarJS.Renderers.Canvas);
```

Will just use the Canvas renderer, without trying anything else.

### UI

PintarJS comes with a built-in UI plugin. 
For more information, see the plugin's [readme file](plugins/UI/README.md).

### Renderers

As mentioned above, PintarJS support few types of renderers. These are:

#### WebGL Renderer

The default renderer, which uses WebGL2 and fallback to WebGL1 if not supported.
This is the fastest option, with more effects supported.

Note: the default WebGL renderer uses 'bitmap font rendering' to handle texts (described later), which is the preferred method because it only uses WebGL and its the fastest, but there's also a Hybrid method that utilize canvas for texts.

#### WebGL Hybrid Renderer

This renderer is the same as WebGL renderer, but instead of using bitmap font rendering it will create a transparent overlay canvas and use canvas rendering API to handle texts.

While it solve all the bitmap font rendering drawbacks (described later), it has the following drawbacks of its own:

1. Its slower.
2. On some browsers, like some versions of FireFox, mixing WebGL and canvas cause heavy stuttering anf FPS drops, which makes it unusable.
3. You can't sort Sprites and Texts; Texts will always be rendered above sprites in this technique.

This renderer will never be used, unless you explicitly pick it.

#### Canvas Renderer

Canvas renderer is the fallback renderer that PintarJS will use if WebGL is not supported.
Its slower than WebGL and don't support all effects / blend modes, but its pretty good and covers almost everything the WebGL covers.

### Drawing Frame

To draw with PintarJS you need to start / end every frame:

```javascript
// init pintar
var pintar = new PintarJS();

// draw a single frame
function drawScene() 
{
    pintar.startFrame();

    // draw stuff...

    pintar.endFrame();
}
setInterval(drawScene, 1000 / 60);
```

Normally, you would put your drawing function in an interval, or use `requestAnimationFrame`.

### Sprites

To draw a sprite you first need to load a texture and create a sprite instance:

```javascript
var texture = new PintarJS.Texture("imgs/my_texture_file.png");
var sprite = new PintarJS.Sprite(texture);
```

Then draw it:

```javascript
pintar.drawSprite(sprite);
```

So with the full example from before we now have:

```javascript
// init pintar
var pintar = new PintarJS();

// create sprite
var texture = new PintarJS.Texture("imgs/my_texture_file.png");
var sprite = new PintarJS.Sprite(texture);

// draw a single frame
function drawScene() 
{
    pintar.startFrame();
    pintar.drawSprite(sprite);
    pintar.endFrame();
}
setInterval(drawScene, 1000 / 60);
```

Note: you can also use `pintar.draw(sprite)` if you're not sure if its a sprite or a text (described later), but remember the draw() method is slightly slower.

### Sprite properties

Sprites support the following properties:

#### sprite.texture

Texture to draw:

```javascript
sprite.texture = new PintarJS.Texture("my/texture/file/url.png");
```

#### sprite.position

Set the position to draw the sprite:

```javascript
sprite.position = new PintarJS.Point(100, 100);
```

#### sprite.size

Set the sprite size:

```javascript
sprite.size = new PintarJS.Point(50, 50);
```

#### sprite.color

Tint / amplify sprite colors. This color is multiplied with the sprite texture color, meaning a value between 0-1 will weaken colors, while values above 1 will amplify them:

```javascript
// will draw sprite with just red colors (disable green and blue)
sprite.color = new PintarJS.Color(1, 0, 0, 1);

// will draw sprite with stronger red colors, and other components untouched
sprite.color = new PintarJS.Color(5, 1, 1, 1);
```

#### sprite.blendMode

How we blend this sprite. Most common modes you'll need are:

```javascript
sprite.blendMode = PintarJS.BlendModes.AlphaBlend;     // default blend with alpha channels and opacity
sprite.blendMode = PintarJS.BlendModes.Opaque;         // disable blending, can be faster when you draw opaque textures
sprite.blendMode = PintarJS.BlendModes.Additive;       // add sprite colors to the colors below - useful for fire / light effects
sprite.blendMode = PintarJS.BlendModes.Multiply;       // multiply sprite colors with the colors below - useful for shadows
// to see more modes, check out the options in 'PintarJS.BlendModes'
```

#### sprite.scale

Scale sprite, or flip if values are negative:

```javascript
// will draw sprite at double size
sprite.scale = new PintarJS.Point(2, 2);

// will flip sprite on X axis
sprite.scale = new PintarJS.Point(-1, 1);
```

#### sprite.sourceRectangle

The region to draw from the source texture:

```javascript
// will draw the region starting at 100,100 with size of 50,50 pixels
sprite.sourceRectangle = new PintarJS.Rectangle(100, 100, 50, 50);

// will set the source region of a texture that contains 6x1 sprites (6 on X axis, 1 on Y) to be the second sprite (2,0 index).
sprite.setSourceFromSpritesheet(new PintarJS.Point(2, 0), new PintarJS.Point(6, 1));
```

#### sprite.smoothingEnabled

Will enable / disable smoothing filter when scaling the sprite. When dealing with pixel art, usually you want to disable smoothing:

```javascript
// disable smoothing for pixel art
sprite.smoothingEnabled = false;
```

#### sprite.origin

The transformations origin of the sprite, ranging from 0 to 1. This property will affect rotation, scaling, position, etc. Often called 'anchor' in other engines:

```javascript
// set origin to be the sprite bottom center position. This means that the position you set would represent its bottom center, and if you
// rotate the sprite it will rotate around its bottom center point.
sprite.origin = new PintarJS.Point(0.5, 1);
```

#### sprite.rotation

Rotate the sprite:

```javascript
// rotate the sprite by 90 degrees
sprite.rotation = 90;
```

#### sprite.brightness

Set sprite brightness:

```javascript
// turn sprite 50% darker
sprite.brightness = 0.5;

// turn sprite 50% brighter
sprite.brightness = 1.5;
```

#### sprite.colorBoost

Add / subtract color components from the sprite. Unlike the 'color' property, this property uses 'add' operator.
This means that you can actually add colors that were originally non-existent (0) in texture. In addition you can use this property to create silhouette of sprites:

```javascript
// will add 100% red color to all pixels. this means black pixels will now be red.
sprite.colorBoost = new PintarJS.Color(1, 0, 0, 0);

// will create a green silhouette of the sprite (by adding 100% to all colors and then adding tint to green color):
sprite.colorBoost = new PintarJS.Color(1, 1, 1, 0);
sprite.color = PintarJS.Color.green();
```

#### sprite.skew

Skew sprite on X and Y axis:

```javascript
// skew sprite by factor of 1 on X axis, and 0.5 on Y axis.
sprite.skew = new PintarJS.Point(1, 0.5);
```

#### sprite.greyscale

If true, will render this sprite in black and white. Only works with WebGL renderer.

```javascript
// will draw sprite in black and white
sprite.greyscale = true;
```

#### Sprite Defaults

You can set some of the default properties of all new sprites by changing `PintarJS.Sprite.defaults`. To learn more, check out the keys contained in the defaults dictionary.

### Drawing Shapes

PintarJS provides an API to draw some basic shapes. Lets explore these APIs: 

#### Pixels

To draw a single pixel use:

```javascript
pintar.drawPixel(new PintarJS.Pixel(point, color, scale));
```

Note: scale is an optional factor to "scale" the pixel and actually make it a square in a given size. If you don't provide scale, it will just be a single 1x1 pixel.

#### Lines

To draw a line use:

```javascript
pintar.drawLine(new PintarJS.ColoredLine(startPoint, endPoint, color, blendMode, strokeWidth));
```

Note: at the time of writing this, gl.lineWidth() is not yet functional in WebGL and will not work on most, if not all browsers. PintarJS will still set this param though for future usage, when it becomes available.

####  Rectangles

To draw a rectangle use:

```javascript
pintar.drawRectangle(new PintarJS.ColoredRectangle(topLeftPosition, size, color, blendMode, isFilled, strokeWidth));
```

Note: at the time of writing this, gl.lineWidth() is not yet functional in WebGL and will not work on most, if not all browsers. PintarJS will still set this param though for future usage, when it becomes available.

### Text Sprite

Text sprites are used to draw text on screen. It support line breaks and stroke. 
To create a text sprite:

```javascript
var text = new PintarJS.TextSprite("Hello World!\nBye.");
```

Then draw it:

```javascript
pintar.drawText(text);
```

### Style Commands

Text Sprite support embedded style commands, but only for WebGL renderer.
Style commands are special tags you can put in text to change colors and styles mid-text.

For example, the following TextSprite:

```javascript
textSprite.useStyleCommands = true;
textSprite.color = PintarJS.Color.black();
textSprite.text = "Hello world, this is {{fc:red}}RED{{fc:black}}.";
```

Will draw the text "Hellow world, this is" in black, while "RED" part will be in red.

The following commands are supported:

#### {{fc:<color>}}

Change the fill color of the text.
`<color>` can either be one of the built-in color names (white, black, red, blue, green...) or a hex value (for example red is `#ff0000ff`).

#### {{sc:<color>}}

Change the stroke color of the text.
`<color>` param is the same as with fill color.

#### {{sw:<width>}}

Change the stroke width of the text.
`<width>` param is the new stroke width.

#### {{res}}

Reset style back to the Text Sprite properties.

### Text Sprite properties

Text Sprites support the following properties:

#### text.position

Set the position to draw the text:

```javascript
text.position = new PintarJS.Point(100, 100);
```

#### text.color

Set the text fill color:

```javascript
text.color = new PintarJS.Color(1, 0, 0, 1);  // <-- red color

// or, you can do this:
text.color = PintarJS.Color.red();
```

#### text.blendMode

Text blending mode. See sprite.blendMode for more info.

#### text.font

Text font to use:

```javascript
text.font = "Ariel";
```

#### text.fontSize

Text font size (in pixels):

```javascript
text.fontSize = 30;
```

#### text.sourceFontSize

If set to a positive number and Font Textures are used, will force the source Font Texture to be in this font size (may create a new Font Texture if needed). Use this option when you want to draw small texts in low resolution, and you want sharp text.

#### text.useStyleCommands

Set to true to support style commands. If false, will draw text as-is.

#### text.alignment

Text alignment:

```javascript
text.alignment = PintarJS.TextAlignment.Left;
```

#### text.strokeWidth

Text stroke width (or 0 to disable stroke):

```javascript
text.strokeWidth = 2;
```

#### text.strokeColor

Text stroke color:

```javascript
text.strokeColor = PintarJS.Color.blue();
```

#### Text Defaults

Similar to with Sprites, Text Sprites got defaults dictionary as well you can set to control default values when creating new text sprites - `PintarJS.TextSprite.defaults`. To learn more, check out the keys contained in the defaults dictionary.


### Viewport

Viewports can define rendering area (ie a rectangle region that we'll only draw on it) + drawing offset, that will affect the position of all renderings.

Using the offset property its easy to utilize Viewports to create simple 2D cameras:

```javascript
// create viewport and set as active
var camera = new PintarJS.Viewport();
pintar.setViewport(camera);

// update camera's position
camera.offset = new PintarJS.Point(100, 100);
```

### Optimizations

PintarJS works best if you follow these rules:

- Use texture atlases.
- Group together sprites with common texture and properties (size, color, etc); PintarJS will only update uniforms in the GPU when their value changed, so if you draw sprites with same properties one after another it will save some updates.
- PintarJS does not do culling; Its recommend to implement your own culling algorithm and not draw sprites that are outside the screen boundaries.
- Try to use round rotation degrees where possible (will allow more caching and less calculations).
- Don't update things when not necessary (for example don't call 'setSourceFromSpritesheet()' every frame if you know the source sprite index has not changed).
- If you draw massive amount of sprites avoid using `pintar.draw()` and use the more specific `pintar.drawSprite()` and `pintar.drawText()` accordingly.


### Font Texture (WebGL Only)

Drawing text in WebGL is a bit tricky. To tackle this, PintarJS implements a technique called 'bitmap font rendering' with its WebGL renderer. 

In this technique, PintarJS uses a texture containing all the characters of a given font, and draw the text by drawing the characters individually as if they were regular sprites. 

To get the texture for a given font, PintarJS will generate it at runtime automatically, on the moment you'll try to draw a TextSprite that requires it.

You can, however, ask the renderer to generate a font texture on demand with your own custom parameters. To do so, use the following method:

```javascript
// will only work if you use the WebGL renderer!
pintar._renderer.generateFontTexture(fontName, fontSize, charsSet, maxTextureWidth, missingCharPlaceholder, smoothing);
```

Generating the font texture manually can help you solve some of the drawbacks of this technique, which will be listed next.

#### Preload Custom Fonts

If you want to use a custom font, it is recommended to preload it, to make sure its available for the time of first rendering (if not, it will fallback to default font). To do so, you can add the following tag before including your JS file:

```<div style="font-family: my-font;">.</div>```

You can remove it later once everything is up and ready. Note that it can't be invisible and it must have an actual text (in this case, '.') in it.

#### Advantages

Bitmap font rendering have the following advantages:

##### Sort with Sprites

Rendering order applies for texts that use this technique, which means you can render texts in front or behind sprites. 

##### Support Style Commands

With Bitmap font rendering PintarJS support style commands, that allow you to change colors and styles mid-text.
Read more about it under `TextSprite` section.

##### Fix Slowness Bug

As mentioned before, mixing WebGL and canvas text cause unexplained slowness in some browsers. 
Bitmap fonts fix this problem.

#### Drawbacks

Bitmap font rendering has some drawbacks you should be aware of, including:

##### Only ASCII

By default, PintarJS will only generate textures for ASCII character set.
If you need other languages / symbols, you can generate font textures manually and provide your own characters set.

##### Font Scaling

Since fonts are converted to textures (pixels), scaling them is no longer without artifacts.
If you need to draw large texts, you'll need to generate larger Font Textures to make it look good, which cost more memory.

##### Memory Consumption

Using multiple fonts will result in multiple textures, and multiple languages in larger textures. Be careful not to end up with too much memory used on fonts.

If all your texts are small you can generate Font Textures manually with smaller size than PintarJS default, which is pretty large.


### Shaders

When using WebGL renderer, you can create and use custom shaders.

By default, `PintarJS` comes with two built-in shaders - one to draw sprites and text, and another to draw shapes. The WebGL renderer will automatically switch between them based on what you render, unless you set a custom shader; When a custom shader is used, the WebGL renderer will not touch it until you set active shader back to null.

First, lets see how we set a custom shader:

```javascript
pintarjs._renderer.setShader(shader);
```

And when you're done with it and want to use the built-in shaders:

```javascript
pintarjs._renderer.setShader(null);
```

Now that we know how to set an active shader, lets see how we create a custom shader:

```javascript
class MyShader extends PintarJS.ShaderBase
{
    /**
     * Return vertex shader code.
     */
    get vertexShaderCode()
    {
        return "<put vertex shader code here>";
    }
    
    /**
     * Return fragment shader code.
     */
    get fragmentShaderCode()
    {
        return "<put fragment shader code here>";
    }

    /**
     * Return a list with all uniform names to load.
     * Note: if you have a 'u_resolution' uniform in your shader, PintarJS will set it automatically to match canvas size.
     */
    get uniformNames()
    {
        return ["u_resolution", "u_myuniform", ...];
    }

    /**
     * Does this shader have a texture?
     */
    get haveTexture()
    {
        return true;
    }
    
    /**
     * Prepare to draw a renderable - need to set all uniforms etc.
     */
    prepare(renderable, viewport)
    {
        // set uniforms before rendering a sprite or other renderable.
        // for example, you can set a uniform with 2 floats like this (u_myuniform is defined in `uniformNames`):
        this.setUniform2f(this.uniforms.u_myuniform, x, y);
    }
    
    /**
     * Draw the renderable.
     * You don't have to override this method; the default implementation is seen below, override only if you need to change it.
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
}
```

As you can see we inherit from a shaders base class, which will handle most of the heavy lifting for us. 

The main things you need to define are `vertexShaderCode` and `fragmentShaderCode`, which will return the actual shader code.
In addition there are some getters you can set to configure the shader, like if we want to enable face culling, stencil, etc.

Another important thing we need to set is uniformNames. The shader will load all these uniforms during init and put them under `this.uniforms`, so you can later easily set them. If you set a `u_resolution` uniform, it will be set automatically to match canvas size.

Last thing you need to set is `prepare(renderable, viewport)`, which is a method to setup a renderable before drawing it. This is the place to set all uniforms etc.

You can also override the `draw()` method if you want to change how it renders completely.

#### Wait where are the vertices?

You probably wonder where do we actually set the vertices to draw in all this.

The answer is that every shader will create a default buffer with 4 vertices, for a 1x1 square. This base vertices buffer will be used for all renderings, and it is constant. The default shaders use attributes and uniforms to actually set position, size, etc.

If you want to change this behavior, you'll need to override the init() and draw() methods, and there you can create and use your own buffers the way you see fit.


#### Using the default shader as base

You can also use the default sprites shader as a base class for your shader, and override just specific parts of it:

```javascript
class MyShader extends PintarJS.DefaultShader
{
    /**
     * Implement the vertex shader code part responsible to calculate vertex final position.
     */
    get vertexShaderPositionCode()
    {
        return "// your code here...";
    }

    /**
     * Implement the code part responsible to calculate texture coord in vertex shader.
     */
    get vertexShaderTextureCoordCode()
    {
        return "// your code here...";
    }

    /**
     * Implement the fragment shader code that handle textures.
     */
    get fragmentShaderTextureCode()
    {
        return "// your code here...";
    }

    /**
     * Implement the fragment shader code that handle just color without texture.
     */
    get fragmentShaderNoTextureCode()
    {
        return "// your code here...";
    }
}
```

The method above return strings which are part of the final shaders code you can replace with your own logic. Its best to look at the source code of this file to understand better, but generally you have the following attributes and uniforms to work with in the vertex shader:

```javascript
// input position and texture coord
attribute vec2 a_position;
attribute vec2 a_texCoord;

// screen resolution to project quad
uniform vec2 u_resolution;

// sprite uniforms
uniform vec2 u_offset;
uniform vec2 u_size;
uniform vec2 u_textureOffset;
uniform vec2 u_textureSize;
uniform vec2 u_rotation;
uniform vec2 u_origin;
uniform vec2 u_skew;
```

And these uniforms and attributes in the fragment shader:

```javascript
// main texture
uniform sampler2D u_image;

// color tint and color booster
uniform vec4 u_color;
uniform vec4 u_colorBooster;

// the texCoords passed in from the vertex shader
varying vec2 v_texCoord;
```

### Extras

#### Render Targets

You can create an empty texture, draw on it, and then use that texture to draw sprites. In other words, create a texture at runtime using PintarJS.

To create an empty `Render Target` (ie a texture you can draw on) in the size of 512x512:

```javascript
var rt = pintar.createRenderTarget(new PintarJS.Point(512,512));
```

Now you can set this render target as the active render target, and start drawing directly on it:

```javascript
pintar.setRenderTarget(rt);
// draw some stuff...

// after you finish, clear render target so we'll be back to draw on screen:
pintar.setRenderTarget(null);
```

And once your texture is ready, you can use it with sprites, just as you would with a normal texture. There are few niche things, like greyscale effect, that won't work with render targets. But most things will.


#### Resolution

PintarJS can help you set a constant resolution.
Note that because you have no control over the browser size (and users can change it at runtime), setting the "resolution" don't work the same as with desktop apps.

In this case, you either set desired width or desired height, and PintarJS will adjust the canvas' other dimention to match this size whild keeping 1:1 ratio.

```javascript
// will make width exactly 800 pixels, and adjust height accordingly
pintar.fixedResolutionX = 800;
```

Note that when you scale a canvas and there's no match between its width/height and the actual DOM element size, smoothing filter will occur (which will make pixel art seem blurry). To prevent this effect, you can use `makePixelatedScaling()`:

```javascript
// will make sure that canvas scales with nearest neighbor filter, ie no blur
pintar.makePixelatedScaling();
```

#### Fullscreen

You can use PintarJS to automatically adjust canvas size to fullscreen:

```javascript
pintar.makeFullscreen();
```

This will set the canvas style properties to make always fixed and fullscreen.

#### Adjust to parent

You can use PintarJS to adjust the canvas size to its parent:

```javascript
pintar.adjustToParentSize();
```

## Changes

### 1.0.0.1

- Fixed texture bleeding while using atlas.
- Fixed bug with single texture delayed load / wrong source rectangle.

### 1.0.0.2

- Added some useful API functions to base objects.
- Added bitmap font rendering for pure WebGL renderer.
- Added Hybrid WebGL.
- Bug fixes in basic APIs.
- Optimizations, huge improvement in WebGL texture swapping.
- Added Greyscale to sprites.

### 1.0.0.3

- Fixed bug with replacing GL textures sometimes turning black.
- Fixed bug with blend mode sometimes not properly update between frames.
- Removed some dead code.
- Added function to calculate point distance.

### 1.0.0.4

- Added some useful helper functions (Point.sub and more color formats).
- Added validation that image is completed before loading texture, to prevent black texture bug if drawing while loading.
- Fixed some bugs with WebGL text sprite + added better support in custom fonts.
- Added style commands to WebGL text sprite.

### 2.0.0.1

- Changed sprite size / width / height API so you can use `sprite.size.set()` properly.
- Added anti-bleeding flag for sprites (used to always be true, now can be modified).
- Fixed bug in Color.fromHex().
- Added round, floor and ceil methods to Point.
- Refactored the way text sprites work internally, better handling different-size fonts, and more encapsulated.
- Small refactor in calculating and caching sprites relative source rectangles.
- Added `tracking` property to texts.
- Better caching texts metadata and lines.
- Huge addon: added UI plugin.

### 2.0.2

- Added 'visible' property to UI elements.
- Extended progressbar API.
- Improved panels and auto anchors + added method to arrange all child anchors on-demand.
- Added `hideExceedingElements` mode to containers.
- Added optimization to skip drawing invisible elements.
- Huge refactor to optimize bounding boxes and positions, making everything a lot faster when there are lots of containers.
- Fixed bug in positioning panels background after screen / parent resize.
- Added `mousePositionFactor` to input manager to allow adjustment between different canvas and window size.
- Unified the way we extract values from options dictionary or theme, to make sure we clone values and never accidentally change shared resource.

### 2.0.3

- Added option to set sizes and sides as strings with '%' or 'px' suffix, to set mode and value in one call.
- Added fixed position mode.
- Added bounding box override option for UI elements + fixed panels background positioning.
- Fixed stack overflow bug with auto-anchors.
- Fixed character width calculation for \r and \n characters.
- Added `extraLineHeight` to allow better text adjustments.
- Fixed centered text positioning.
- Added auto-center anchor.
- Added after-draw event for ui elements.
- Added `onAddingChild` and `onRemovingChild` callbacks.
- Added `testViewportVisibility` flag to control whether or not we cull element when not in screen / viewport boundaries.

### 2.1.0

- Added shaders support.
- Added drawing rectangles.
- Added drawing pixels.
- Added drawing line.
- Added render targets.

### 2.1.1

- Tiny fix in shader switching and setting resolution.

### 2.1.2

- Fixed text sprites to round position and size to avoid blurry edges.

### 2.1.3

- Added lots of useful methods to Point, Color and Rectangle.
- Fixed sprite clone() to also copy size.
- Better handling crisp font texture (smoothText = false).
- Added accurateFontSize property to text sprite. 

## License

PintarJS is distributed under the permissive MIT License and is absolutely free to use for any purpose (commercial included).
