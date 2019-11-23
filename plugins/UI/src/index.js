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
};
const pintar = require('./pintar');
pintar.UI = UI;
module.exports = UI;