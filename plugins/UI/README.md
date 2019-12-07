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

# Basic Concepts

Before we dive into using the plugin, lets go over some basic concepts.

## UI Theme

The UI Theme is a dictionary which defines all the UI elements appearance and behavior. This include things likes:

- Texture.
- Scale.
- Source rectangle in texture.
- Margins.
- Default size.
- Is horizontal or vertical, when relevant.
- And much more..

The UI dictionary must have a key for every element type you want to use (key being the element's class name). Every UI element accepts different options.

`Pintar.UI` comes with a demo theme you can use (for any purpose even commercual), which is used by the demo pages. This theme includes a UI texture file, a font, and all the basic elements configurations.

You can check it out [here](assets/ui_theme.js) or watch it in action in the [demo pages](https://ronenness.github.io/PintarJS/demos/index.html#example9_plugin_ui.html).

## Anchors

Every element in `Pintar.UI` anchors to something. Anchors determine the position of the element inside its parent, or relative to its siblings.
The basic anchors include all corners, sides, and the center of the parent element:

- TopLeft		
- TopCenter		
- TopRight		
- CenterLeft
- Center	
- CenterRight	
- BottomLeft	
- BottomCenter	
- BottomRight	

For example, `TopLeft` will position the element based on its parent top-left corner, while `BottomCenter` will position it at the bottom, but vertically center of the parent.

In addition, there's the `Fixed` anchor which will anchor to element to the top-left corner of the screen, regardless its parent, and there are 3 very important `Auto` anchors you should know:

- Auto: Will place element right under the previous element's bottom. This is used to place elements automatically, with one element per row.
- AutoInline: Given enough room, will place element right next to the previous element. If not enough room, will break line and behave like `Auto`.
- AutoInlineNoBreak: Will always place element right next to the previous element, even if exceed the parent element boundaries.


## Container

Containers are any element that can hold child elements.
Normally you'd use `Panels` to group together elements, especially if you want form-like graphics with it (described later), but know that some elements are also containers themselves (like buttons and progressbars) and you can add child elements directly to them (for example adding paragraph on top of progressbar).


## Offset

Every element have an offset property, which is the distance, in either pixels or percents, from its designated anchor-based position.
For example, the following code:

```JS
element.anchor = PintarJS.UI.Anchors.TopLeft;
element.offset.x = 100;
element.offset.xMode = 'px';
```

Will position `element` at the top-left corner of its parent, and then add additional 100 pixels to the right.
To take another example, adding the following code:

```JS
element.offset.y = 25;
element.offset.yMode = '%';
```

Will also push the element 25% down. But percent of what? The answer is always - the parent's size. So if the element is inside a panel with height of 400 pixels, this will move the element 100 pixels down.


## Size

Every element has a size property, which will determine the region it occupies when rendering. Different elements might react slightly different to the size property (for example in paragraphs it determines how many characters can fit in a row), but normally its just the element size.

The size property can also be set in either percent or pixels, just like with offset. Most elements have 100% width by default.





# Elements

TODO


[TODO - STILL UNDER DEVELOPMENT]