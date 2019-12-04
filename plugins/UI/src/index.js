var UI = {

    UIRoot: require('./elements/root'),
    UIElement: require('./elements/ui_element'),
    ProgressBar: require('./elements/progress_bar'),
    Container: require('./elements/container'),
    Panel: require('./elements/panel'),
    Paragraph: require('./elements/paragraph'),
    HorizontalLine: require('./elements/horizontal_line'),
    VerticalLine: require('./elements/vertical_line'),
    Button: require('./elements/button'),
    Sprite: require('./elements/sprite'),
    SlicedSprite: require('./elements/sliced_sprite'),
    Slider: require('./elements/slider'),
    Cursor: require('./elements/cursor'),

    InputManager: require('./input/input_manager'),

    Anchors: require('./anchors'),
    SizeModes: require('./size_modes'),
    SidesProperties: require('./sides_properties'),
    UIPoint: require('./ui_point'),
    CursorTypes: require('./cursor_types'),
};
const pintar = require('./pintar');
pintar.UI = UI;
module.exports = UI;