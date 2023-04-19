import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Col, Input, Row } from "antd";

import "./color-picker.less";

const COLOR_HEX_REGEX = /^#([0-9a-f]{6})$/i;

const ColorPicker = ({ propsRef, label, color, showColorPicker, changeColor, disabled }) => {
    const [colorValue, setColorValue] = useState(color || "");
    const { t } = useTranslation();

    useEffect(() => {
        setColorValue(color);
    }, [color]);

    const onColorChange = (e) => {
        setColorValue(e.target.value);
    };

    const onColorAccept = (e) => {
        if (color !== colorValue && COLOR_HEX_REGEX.test(e.target.value)) changeColor({ hex: e.target.value });
    };

    return (
        <label className="Color_Picker_Wrapper" id={`colour-picker_${label.toLowerCase().replaceAll(" ", "-")}--button`}>
            {t(label)}
            <Button className="Color_Picker">
                <Row wrap={false}>
                    <Col>
                        <Row justify="center" align="middle" className="Color_Picker_Icon_Wrapper" onClick={() => !disabled && showColorPicker()}>
                            <Col>
                                <div style={{ background: color }} className="Color_Picker_Icon" />
                            </Col>
                        </Row>
                    </Col>
                    <Col>
                        <Input
                            ref={propsRef}
                            className="Color_Picker_Input"
                            value={colorValue}
                            onChange={onColorChange}
                            onPressEnter={onColorAccept}
                            onBlur={onColorAccept}
                            disabled={disabled}
                        />
                    </Col>
                </Row>
            </Button>
        </label>
    );
};

export default ColorPicker;
