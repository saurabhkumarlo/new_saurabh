import React from "react";
import { arePropsEqual, getAttributesValue, getSelectedAnnotations } from "../../../CalculateProperties.utils";
import { AutoComplete, ColorPicker, Input, Select, TextArea } from "../../../components";
import { useTranslation } from "react-i18next";
import { borderSizes, borderStyleOptions, iconOptions, lineStyleOptions, lineStyleRotatedOptions } from "../StylesBox.utils";

import { Button } from "antd";
import { DECORATION_LIST, FONTS_LIST } from "constants/FontConstants";

const AnnotStyles = ({ annots, styles, onUpdate, onChangeWindowColorPickerVisible, onOpenTiles, onOpenAngles, isPreventEditing }) => {
    const { t } = useTranslation();

    const onChangeValue = (value, obj) => {
        switch (obj) {
            case styles.decoration:
                const decorationStyles = { "font-weight": "normal", "text-decoration": "", "font-style": "normal" };

                if (value.includes("bold")) decorationStyles["font-weight"] = "bold";
                if (value.includes("italic")) decorationStyles["font-style"] = "italic";
                let decorationString = "";
                if (value.includes("underline")) decorationString += "underline";
                if (value.includes("line-through")) decorationString += decorationString.length > 1 ? " line-through" : "line-through";
                if (decorationString.length > 1) decorationStyles["text-decoration"] = decorationString;

                onUpdate(getSelectedAnnotations(annots, false), JSON.stringify(decorationStyles), obj);
                break;
            default:
                onUpdate(getSelectedAnnotations(annots, false), value, obj);
                break;
        }
    };

    const onSwitchWindowColorPickerVisible = (isVisible, obj, value) => {
        onChangeWindowColorPickerVisible(isVisible, getSelectedAnnotations(annots, false), value, obj);
    };

    return (
        <>
            {(styles.height || styles.fontSize || styles.font) && (
                <div className="properties-pane-row">
                    {styles.quantity && (
                        <Input
                            label={t("ESTIMATE.QUANTITY")}
                            obj={styles.quantity}
                            value={getAttributesValue(annots, styles.quantity)}
                            onUpdate={onChangeValue}
                            type="number"
                            addonBefore="Q"
                            numbersOnly
                            disabled={isPreventEditing}
                        />
                    )}
                    {styles.height && (
                        <Input
                            label={t("ESTIMATE.HEIGHT")}
                            obj={styles.height}
                            value={getAttributesValue(annots, styles.height)}
                            onUpdate={onChangeValue}
                            type="number"
                            addonBefore="H"
                            step={0.1}
                            numbersOnly
                            disabled={isPreventEditing}
                        />
                    )}
                    {styles.icon && (
                        <Select
                            label={t("GENERAL.ICON")}
                            obj={styles.icon}
                            value={getAttributesValue(annots, styles.icon)}
                            data={iconOptions}
                            onUpdate={onChangeValue}
                            icon
                            disabled={isPreventEditing}
                        />
                    )}
                </div>
            )}
            {styles.font && (
                <Select
                    label={t("ESTIMATE.FONT")}
                    obj={styles.font}
                    value={getAttributesValue(annots, styles.font)}
                    data={FONTS_LIST}
                    onUpdate={onChangeValue}
                    disabled={isPreventEditing}
                />
            )}
            {styles.fontSize && styles.decoration && (
                <div className="properties-pane-row">
                    <Input
                        label={t("ESTIMATE.FONT_SIZE")}
                        obj={styles.fontSize}
                        value={getAttributesValue(annots, styles.fontSize)}
                        onUpdate={onChangeValue}
                        suffix="pt"
                        numbersOnly
                        textAlign="right"
                        disabled={isPreventEditing}
                    />

                    <Select
                        label={t("ESTIMATE.DECORATION")}
                        obj={styles.decoration}
                        value={getAttributesValue(annots, styles.decoration)}
                        data={DECORATION_LIST}
                        mode="multiple"
                        onUpdate={onChangeValue}
                        disabled={isPreventEditing}
                    />
                </div>
            )}
            {(styles.color || styles.opacity) && (
                <div className="properties-pane-row">
                    {styles.color && (
                        <ColorPicker
                            label={t("ESTIMATE.FILL_COLOUR")}
                            obj={styles.color}
                            fillColor
                            value={getAttributesValue(annots, styles.color)}
                            onUpdate={onChangeValue}
                            onChangeWindowColorPickerVisible={onSwitchWindowColorPickerVisible}
                            containerClass={!styles.opacity && "half-width"}
                            disabled={isPreventEditing}
                        />
                    )}

                    {styles.opacity && (
                        <Input
                            label={t("ESTIMATE.FILL_OPACITY")}
                            obj={styles.opacity}
                            value={getAttributesValue(annots, styles.opacity) * 100}
                            onUpdate={onChangeValue}
                            suffix="%"
                            numbersOnly
                            textAlign="right"
                            percents
                            disabled={isPreventEditing}
                        />
                    )}
                </div>
            )}
            {styles.textColor && styles.textOpacity && (
                <div className="properties-pane-row">
                    <ColorPicker
                        label={t("ESTIMATE.TEXT_COLOUR")}
                        obj={styles.textColor}
                        textColor
                        value={getAttributesValue(annots, styles.textColor)}
                        onUpdate={onChangeValue}
                        onChangeWindowColorPickerVisible={onSwitchWindowColorPickerVisible}
                        disabled={isPreventEditing}
                    />

                    <Input
                        label={t("ESTIMATE.TEXT_OPACITY")}
                        obj={styles.textOpacity}
                        value={getAttributesValue(annots, styles.textOpacity) * 100}
                        onUpdate={onChangeValue}
                        suffix="%"
                        numbersOnly
                        textAlign="right"
                        percents
                        disabled={isPreventEditing}
                    />
                </div>
            )}
            {styles.borderColor && (
                <div className="properties-pane-row">
                    <ColorPicker
                        label={t("ESTIMATE.BORDER_COLOUR")}
                        obj={styles.borderColor}
                        borderColor
                        value={getAttributesValue(annots, styles.borderColor)}
                        onUpdate={onChangeValue}
                        onChangeWindowColorPickerVisible={onSwitchWindowColorPickerVisible}
                        disabled={isPreventEditing}
                    />

                    <Input
                        label={t("ESTIMATE.BORDER_OPACITY")}
                        obj={styles.borderOpacity}
                        value={getAttributesValue(annots, styles.borderOpacity) * 100}
                        onUpdate={onChangeValue}
                        suffix="%"
                        numbersOnly
                        textAlign="right"
                        percents
                        disabled={isPreventEditing}
                    />
                </div>
            )}
            {styles.style && styles.thickness && (
                <div className="properties-pane-row">
                    <Select
                        label={t("ESTIMATE.STYLE")}
                        obj={styles.style}
                        value={getAttributesValue(annots, styles.style)}
                        data={borderStyleOptions}
                        onUpdate={onChangeValue}
                        icon
                        disabled={isPreventEditing}
                    />

                    <AutoComplete
                        label={t("ESTIMATE.THICKNESS")}
                        obj={styles.thickness}
                        value={getAttributesValue(annots, styles.thickness)}
                        options={borderSizes}
                        onUpdate={onChangeValue}
                        numbersOnly
                        textAlign="right"
                        disabled={isPreventEditing}
                    />
                </div>
            )}
            {styles.startIcon && styles.endIcon && (
                <div className="properties-pane-row">
                    <Select
                        label={t("GENERAL.START")}
                        obj={styles.startIcon}
                        value={getAttributesValue(annots, styles.startIcon)}
                        data={lineStyleOptions}
                        onUpdate={onChangeValue}
                        icon
                        disabled={isPreventEditing}
                    />

                    <Select
                        label={t("GENERAL.END")}
                        obj={styles.endIcon}
                        value={getAttributesValue(annots, styles.endIcon)}
                        data={lineStyleRotatedOptions}
                        onUpdate={onChangeValue}
                        icon
                        disabled={isPreventEditing}
                    />
                </div>
            )}
            {styles.size && (
                <div className="properties-pane-row">
                    <Input
                        label={t("GENERAL.SIZE")}
                        obj={styles.size}
                        value={getAttributesValue(annots, styles.size)}
                        onUpdate={onChangeValue}
                        suffix="pt"
                        numbersOnly
                        textAlign="right"
                        disabled={isPreventEditing}
                        containerClass="half-width"
                    />
                </div>
            )}
            {styles.tiles && styles.angles && (
                <div className="properties-pane-row">
                    <div className="properties-pane-item">
                        <Button onClick={onOpenTiles} disabled={isPreventEditing}>
                            {t("ESTIMATE.TILES")}
                        </Button>
                    </div>

                    <div className="properties-pane-item">
                        <Button onClick={onOpenAngles} disabled={isPreventEditing}>
                            {t("ESTIMATE.ANGLES")}
                        </Button>
                    </div>
                </div>
            )}
            {styles.textContent && (
                <TextArea
                    obj={styles.textContent}
                    value={getAttributesValue(annots, styles.textContent)}
                    onUpdate={onChangeValue}
                    disabled={isPreventEditing}
                />
            )}
        </>
    );
};

export default React.memo(AnnotStyles, (prevProps, nextProps) => arePropsEqual(prevProps.annots, nextProps.annots));
