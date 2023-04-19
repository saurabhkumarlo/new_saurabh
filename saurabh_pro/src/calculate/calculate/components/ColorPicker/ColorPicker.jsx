import React from "react";

import { TwitterPicker } from "react-color";

import { PRESET_COLORS } from "./ColorPicker.utils";

import "./color-picker.less";

const ColorPicker = ({ visible, colorPickerRef, color, changeColor }) => (
    <div className="Color_Picker_Container">
        {visible && (
            <div
                ref={colorPickerRef}
                className="Color_Picker_Wrapper"
                style={{
                    right: localStorage.getItem("calculateSplitPosRight") === null ? "280px" : parseInt(localStorage.getItem("calculateSplitPosRight"), 10),
                }}
            >
                <TwitterPicker color={color} name="color" onChangeComplete={changeColor} colors={PRESET_COLORS} className="Twitter_Picker" />
            </div>
        )}
    </div>
);

export default ColorPicker;
