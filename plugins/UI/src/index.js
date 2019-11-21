var UI = {
    UIElement: require('./ui_element'),
    ProgressBar: require('./progress_bar'),
    InputManager: require('./input_manager'),
    Container: require('./container'),
    Anchors: require('./anchors'),
    SizeModes: require('./size_modes'),
};
const pintar = require('./pintar');
pintar.UI = UI;
module.exports = UI;