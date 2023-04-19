import React, { useEffect, useRef, useState } from "react";
import { Input } from "antd";
import { useTranslation } from "react-i18next";
import { AnnotationStore, ObjectsStore } from "stores";
import _ from "lodash";

const COLOR_HEX_REGEX = /^#([0-9a-f]{6})$/i;

const ColorPicker = ({
    label,
    obj,
    value,
    onChangeWindowColorPickerVisible,
    onUpdate,
    fillColor = false,
    textColor = false,
    borderColor = false,
    containerClass = false,
    disabled,
}) => {
    const { t } = useTranslation();
    const [colorValue, setColorValue] = useState(value);
    const ref = useRef(null);
    const refDefaultValue = useRef(null);

    useEffect(() => {
        setColorValue(value);
        refDefaultValue.current = value;
    }, [value]);

    useEffect(() => {
        return () => onAccept();
    }, []);

    useEffect(() => {
        function unsubscribeAnnotationStore() {
            AnnotationStore.listen(annotationStoreUpdated);
        }
        unsubscribeAnnotationStore();
        return () => unsubscribeAnnotationStore();
    }, []);

    const annotationStoreUpdated = (message) => {
        switch (message) {
            case "showFillColour":
                if (ref.current && (fillColor || textColor)) {
                    const selectedAnnots = ObjectsStore.getSelectionList().selectionList;
                    const annotsType = selectedAnnots[0].type;
                    const areSelectedAnnotsHaveSameType = _.every(selectedAnnots, ["type", annotsType]);
                    if (areSelectedAnnotsHaveSameType) onColorClick();
                }
                break;
            case "showBorderColour":
                if (ref.current && borderColor) {
                    const selectedAnnots = ObjectsStore.getSelectionList().selectionList;
                    const annotsType = selectedAnnots[0].type;
                    const areSelectedAnnotsHaveSameType = _.every(selectedAnnots, ["type", annotsType]);
                    if (areSelectedAnnotsHaveSameType) onColorClick();
                }
                break;
            default:
                break;
        }
    };

    const onAccept = () => {
        if (value !== colorValue && COLOR_HEX_REGEX.test(colorValue)) onUpdate(colorValue.toUpperCase(), obj);
        setColorValue(value);
    };

    const onChange = (e) => {
        setColorValue(e.target.value);
    };

    const onColorClick = () => {
        if (disabled) return;
        onChangeWindowColorPickerVisible(true, obj, colorValue);
    };

    return (
        <div className={`properties-pane-item${containerClass ? ` ${containerClass}` : ""}`}>
            <label>{t(label)}</label>
            <div className={`item-container${disabled ? " item-container-disabled" : ""}`}>
                <Input
                    ref={ref}
                    value={colorValue}
                    bordered={false}
                    onChange={onChange}
                    onPressEnter={onAccept}
                    onBlur={onAccept}
                    addonBefore={
                        <div
                            style={{ backgroundColor: colorValue }}
                            className={`color-preview${disabled ? " color-preview-disabled" : ""}`}
                            onClick={onColorClick}
                        />
                    }
                    disabled={disabled}
                />
            </div>
        </div>
    );
};

export default ColorPicker;
