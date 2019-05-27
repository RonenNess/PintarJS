# PintarJS

Micro JS lib (52KB minified) for direct WebGL and canvas rendering.

[PintarJS Live Demo]([https://ronenness.github.io/PintarJS/demos/index.html)

![PintarJS example](https://github.com/RonenNess/PintarJS/raw/master/demos/example.png "PintarJS transformations example")

## Why

When it comes to WebGL, there are two types of libraries you can find: either high-level huge libraries that manage everything for you (like PIXI), or really low-level stuff that merely wrap WebGL with a more comfortable API and require a lot of work to use.

I needed something that on one hand provide a simple API to draw sprites with all the basic effects, transformations and blending modes, and on the other keeps the API direct and minimal, and don't impose a speicifc structure of scenes, cameras, containers, and other high-level stuff.

If you have similar requirements, ie you just want to draw stuff on screen while maintainig full control on the scene, rendering order and culling, PintarJS might be for you.

## Minimal Example

Using PintarJS is super easy!

```js
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

Via npm:

```
npm install pintar
```

Or you can download `dist/pinter.js` and include in your HTML file.

## Key Features

- WebGL2 and WebGL support with Canvas fallback
- Text drawing
    - Alignment
    - Stroke
    - Line breaks
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
- Fixed resolution


## Usage

Lets see how to use PintarJS..

### Initialize

To initialize PintarJS you need to have a Canvas element in your HTML page. You can then initialize with one of the following methods:

```js
// will init on the first canvas element found on page
var pintar = new PintarJS();

// will init on canvas with id 'canvas2'
var pintar = new PintarJS("#canvas2");

// will init on the given canvas element
var pintar = new PintarJS(document.getElementById("canvas3"));
```

By default, PintarJS will try to use WebGL2. If not found, will use WebGL, and if not found either will fallback to Canvas API.
To control the order of renderers PintarJS will attempt to use you can provide a second parameter, for example:

```js
var canvasPintar = new PintarJS(null, PintarJS.Renderers.Canvas);
```

### Drawing Frame

To draw with PintarJS you need to start / end every frame:

```js
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

```js
var texture = new PintarJS.Texture("imgs/my_texture_file.png");
var sprite = new PintarJS.Sprite(texture);
```

Then draw it:

```js
pintar.drawSprite(sprite);
```

So with the full example from before we now have:

```js
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

```js
sprite.texture = new PintarJS.Texture("my/texture/file/url.png");
```

#### sprite.position

Set the position to draw the sprite:

```js
sprite.position = new PintarJS.Point(100, 100);
```

#### sprite.size

Set the sprite size:

```js
sprite.size = new PintarJS.Point(50, 50);
```

#### sprite.color

Tint / amplify sprite colors. This color is multiplied with the sprite texture color, meaning a value between 0-1 will weaken colors, while values above 1 will amplify them:

```js
// will draw sprite with just red colors (disable green and blue)
sprite.color = new PintarJS.Color(1, 0, 0, 1);

// will draw sprite with stronger red colors, and other components untouched
sprite.color = new PintarJS.Color(5, 1, 1, 1);
```

#### sprite.blendMode

How we blend this sprite. Most common modes you'll need are:

```js
sprite.blendMode = PintarJS.BlendModes.AlphaBlend;     // default blend with alpha channels and opacity
sprite.blendMode = PintarJS.BlendModes.Opaque;         // disable blending, can be faster when you draw opaque textures
sprite.blendMode = PintarJS.BlendModes.Additive;       // add sprite colors to the colors below - useful for fire / light effects
sprite.blendMode = PintarJS.BlendModes.Multiply;       // multiply sprite colors with the colors below - useful for shadows
// to see more modes, check out the options in 'PintarJS.BlendModes'
```

#### sprite.scale

Scale sprite, or flip if values are negative:

```js
// will draw sprite at double size
sprite.scale = new PintarJS.Point(2, 2);

// will flip sprite on X axis
sprite.scale = new PintarJS.Point(-1, 1);
```

#### sprite.sourceRectangle

The region to draw from the source texture:

```js
// will draw the region starting at 100,100 with size of 50,50 pixels
sprite.sourceRectangle = new PintarJS.Rectangle(100, 100, 50, 50);

// will set the source region of a texture that contains 6x1 sprites (6 on X axis, 1 on Y) to be the second sprite (2,0 index).
sprite.setSourceFromSpritesheet(new PintarJS.Point(2, 0), new PintarJS.Point(6, 1));
```

#### sprite.smoothingEnabled

Will enable / disable smoothing filter when scaling the sprite. When dealing with pixel art, usually you want to disable smoothing:

```js
// disable smoothing for pixel art
sprite.smoothingEnabled = false;
```

#### sprite.origin

The transformations origin of the sprite, ranging from 0 to 1. This property will affect rotation, scaling, position, etc. Often called 'anchor' in other engines:

```js
// set origin to be the sprite bottom center position. This means that the position you set would represent its bottom center, and if you
// rotate the sprite it will rotate around its bottom center point.
sprite.origin = new PintarJS.Point(0.5, 1);
```

#### sprite.rotation

Rotate the sprite:

```js
// rotate the sprite by 90 degrees
sprite.rotation = 90;
```

#### sprite.brightness

Set sprite brightness:

```js
// turn sprite 50% darker
sprite.brightness = 0.5;

// turn sprite 50% brighter
sprite.brightness = 1.5;
```

#### sprite.colorBoost

Add / subtract color components from the sprite. Unlike the 'color' property, this property uses 'add' operator.
This means that you can actually add colors that were originally non-existent (0) in texture. In addition you can use this property to create silhouette of sprites:

```js
// will add 100% red color to all pixels. this means black pixels will now be red.
sprite.colorBoost = new PintarJS.Color(1, 0, 0, 0);

// will create a green silhouette of the sprite (by adding 100% to all colors and then adding tint to green color):
sprite.colorBoost = new PintarJS.Color(1, 1, 1, 0);
sprite.color = PintarJS.Color.green();
```

#### sprite.skew

Skew sprite on X and Y axis:

```js
// skew sprite by factor of 1 on X axis, and 0.5 on Y axis.
sprite.skew = new PintarJS.Point(1, 0.5);
```

#### Sprite Defaults

You can set some of the default properties of all new sprites by changing `PintarJS.Sprite.defaults`. To learn more, check out the keys contained in the defaults dictionary.

### Text Sprite

Text sprites are used to draw text on screen. It support line breaks and stroke. 
To create a text sprite:

```js
var text = new PintarJS.TextSprite("Hello World!\nBye.");
```

Then draw it:

```js
pintar.drawText(text);
```

### Text Sprite properties

Text Sprites support the following properties:

#### text.position

Set the position to draw the text:

```js
text.position = new PintarJS.Point(100, 100);
```

#### text.color

Set the text fill color:

```js
// draw red text
text.color = new PintarJS.Color(1, 0, 0, 1);
```

#### text.blendMode

Text blending mode. See sprite.blendMode for more info.

#### text.font

Text font to use:

```js
text.font = "Ariel";
```

#### text.fontSize

Text font size (in pixels):

```js
text.fontSize = 30;
```

#### text.alignment

Text alignment:

```js
text.alignment = PintarJS.TextAlignment.Left;
```

#### text.strokeWidth

Text stroke width (or 0 to disable stroke):

```js
text.strokeWidth = 2;
```

#### text.strokeColor

Text stroke color:

```js
text.strokeColor = PintarJS.Color.blue();
```

#### Text Defaults

Similar to with Sprites, Text Sprites got defaults dictionary as well you can set to control default values when creating new text sprites - `PintarJS.TextSprite.defaults`. To learn more, check out the keys contained in the defaults dictionary.

### Viewport

Viewports can define rendering area (ie a rectangle region that we'll only draw on it) + drawing offset, that will affect the position of all renderings.

Using the offset property its easy to utilize Viewports to create simple 2D cameras:

```js
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


### Extras

#### Resolution

PintarJS can help you set a constant resolution.
Note that because you have no control over the browser size (and users can change it at runtime), setting the "resolution" don't work the same as with desktop apps.

In this case, you either set desired width or desired height, and PintarJS will adjust the canvas' other dimention to match this size whild keeping 1:1 ratio.

```js
// will make width exactly 800 pixels, and adjust height accordingly
pintar.fixedResolutionX = 800;
```

Note that when you scale a canvas and there's no match between its width/height and the actual DOM element size, smoothing filter will occur (which will make pixel art seem blurry). To prevent this effect, you can use `makePixelatedScaling()`:

```js
// will make sure that canvas scales with nearest neighbor filter, ie no blur
pintar.makePixelatedScaling();
```

#### Fullscreen

You can use PintarJS to automatically adjust canvas size to fullscreen:

```js
pintar.makeFullscreen();
```

This will set the canvas style properties to make always fixed and fullscreen.

#### Adjust to parent

You can use PintarJS to adjust the canvas size to its parent:

```js
pintar.adjustToParentSize();
```

## License

PintarJS is distributed under the permissive MIT License and is absolutely free to use for any purpose, commercial or not.
