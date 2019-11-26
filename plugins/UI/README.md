# Pintar.UI

`Pintar.UI` is a built-in UI plugin for `PintarJS`.


## How It Works

`Pintar.UI ` uses `PintarJS` sprites and rendering pipelines to implement basic UI elements, as well as a grid / anchors system, UI theme, sliced sprites, and other UI-related goodies.


## Why Not CSS

You might consider using HTML with CSS for UI instead of `PintarJS`'s native UI. That's a viable option, since after all HTML is made for that and CSS is very powerful these days. However, here are few points to consider:

- Making UI with the same feel as your game using CSS would be *a lot* of work.
- Drawing everything with PintarJS will feel more natural than combining HTML with WebGL. Mixing will always have those pixels that just won't align like you want, update times that are slightly off, and other small things that will make the UI feel alien to the game.
- With CSS you need to worry about cross-browser differences that might break your UI. With native UI it will look the same on all browsers, no matter what.
- With PintarJS UI everything will be part of the canvas you render on, which means you can apply post-effects, take screenshots, set unified resolution, ect.

To summarize, HTML with CSS is great, but mixing it with WebGL rendering will never feel truly native and will have these small annoying caveats that 
will ultimately destroy your UI experience. That's why if you use `PintarJS`, its recommended to also draw and handle UI with it.


## Quick Example

TODO

## Basic Concepts

TODO

### Anchors

TODO

### Offsets and Sizes

TODO

### UI Theme

TODO

## Elements

TODO


[TODO - STILL UNDER DEVELOPMENT]