var UI = {
    UIRoot: require('./root'),
    UIElement: require('./ui_element'),
    ProgressBar: require('./progress_bar'),
    InputManager: require('./input_manager'),
    Container: require('./container'),
    Anchors: require('./anchors'),
    SlicedSprite: require('./sliced_sprite'),
    SizeModes: require('./size_modes'),
    SidesProperties: require('./sides_properties'),
    Panel: require('./panel'),
    Paragraph: require('./paragraph'),
    HorizontalLine: require('./horizontal_line'),
    Button: require('./button'),
    Sprite: require('./sprite'),
    UIPoint: require('./ui_point'),
    CursorTypes: require('./cursor_types'),
};
const pintar = require('./pintar');
pintar.UI = UI;
module.exports = UI;