# Pintar.UI

`Pintar.UI` is a built-in UI plugin for `PintarJS`.


## How It Works

`Pintar.UI ` uses `PintarJS` sprites and rendering pipelines to implement basic UI elements, as well as a grid / anchors system, UI theme, sliced sprites, and other UI-related goodies.


## Why Not CSS

You might consider using HTML with CSS for UI instead of `PintarJS`'s native UI. That's a viable option, since ultimately HTML is made for UI and CSS is very powerful these days. However, here are few points to consider:

- Making UI with the same feel as your game using pure CSS would require a lot of work.
- Drawing everything with PintarJS will feel more natural than combining WebGL with HTML. When mixing, there will always be some pixels and movement that won't perfectly align.
- With CSS you need to worry about cross-browser differences that might break your UI. With native UI it will look the same on all browsers.
- With PintarJS UI everything will be part of the canvas you render on, which means you can apply post-effects, take screenshots, set unified resolution, ect.

To summarize, HTML with CSS is great, but mixing it with your WebGL rendering will never feel truly native and will have some caveats that will hinder your UI experience. That's why if you use `PintarJS`, its recommended to also draw and handle UI with it.


## Quick Example

Lets begin with a quick example (note: UI_THEME is defined elsewhere and we'll discuss it later):

```js
// create UI root
var root = new PintarJS.UI.UIRoot(pintar);

// set cursor (your responsibility to hide the real cursor via css)
var cursor = new PintarJS.UI.Cursor(UI_THEME);
root.setCursor(cursor);

// create a panel
var panel = new PintarJS.UI.Panel(UI_THEME);
panel.anchor = PintarJS.UI.Anchors.Center;
panel.size.set(370, 500);
root.addChild(panel);

// add a header (with a horizontal line under it)
var header = new PintarJS.UI.Paragraph(UI_THEME, "header");
header.text = "Hello world!";
panel.addChild(header);
panel.addChild(new PintarJS.UI.HorizontalLine(UI_THEME));

// add a button
var button = new PintarJS.UI.Button(UI_THEME);
button.anchor = PintarJS.UI.Anchors.Auto;
button.text = "Click Me!";
button.onMouseReleased = (btn, input) => { alert("Hi there!"); }
panel.addChild(button);
```

The result of the above would look like this:

![UI example 1](assets/exm1.jpg "example 1")

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