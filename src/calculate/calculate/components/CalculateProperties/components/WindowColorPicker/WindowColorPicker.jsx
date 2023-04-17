import React, { useEffect, useRef, useState } from "react";
import { TwitterPicker } from "react-color";
import { PRESET_COLORS } from "./ColorPicker.utils";

import "./styles.less";

const WindowColorPicker = ({ width, windowColorPickerData, onChangeWindowColorPickerVisible, onChangeValues }) => {
    const wrapperRef = useRef();
    const [color, setColor] = useState(getColorValue());

    useEffect(() => {
        setColor(getColorValue());
    }, [windowColorPickerData]);

    useEffect(() => {
        window.addEventListener("mousedown", onClickOutside);
        return () => window.removeEventListener("mousedown", onClickOutside);
    }, []);

    const onClickOutside = (event) => {
        if (wrapperRef.current && !wrapperRef.current.contains(event.target)) onChangeWindowColorPickerVisible(false);
    };

    function getColorValue() {
        if (windowColorPickerData.key === "labels") return windowColorPickerData.value.value;
        else return windowColorPickerData.value;
    }

    const onUpdateColor = (colorObj) => {
        if (windowColorPickerData.key === "labels")
            onChangeValues(windowColorPickerData.annots, colorObj.hex.toUpperCase(), windowColorPickerData.key, { path: windowColorPickerData.value.path });
        else onChangeValues(windowColorPickerData.annots, colorObj.hex.toUpperCase(), windowColorPickerData.key);
    };

    const onChangeComplete = (colorObj) => {
        onUpdateColor(colorObj);
    };

    return (
        <div ref={wrapperRef} className="Color_Picker_Container">
            <div className="Color_Picker_Wrapper" style={{ right: `${width}px` }}>
                <TwitterPicker
                    color={color}
                    name="color"
                    onChangeComplete={onChangeComplete}
                    colors={PRESET_COLORS}
                    className="Twitter_Picker"
                    triangle="hide"
                />
            </div>
        </div>
    );
};

export default WindowColorPicker;
