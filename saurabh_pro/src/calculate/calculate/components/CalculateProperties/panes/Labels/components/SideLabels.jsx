import { ColorPicker, Input, Select, Slider } from "../../../components";
import { LabelList } from ".";
import { FONTS_LIST, FONT_STYLES } from "constants/FontConstants";
import React, { useEffect, useState } from "react";
import _ from "lodash";
import { useTranslation } from "react-i18next";
import { arePropsEqual } from "../../../CalculateProperties.utils";
import { ANNOT_ATTRIBUTES } from "constants/AnnotationConstants";

const SideLabels = ({ values, onUpdate, onChangeWindowColorPickerVisible, isPreventEditing }) => {
    const { t } = useTranslation();
    const [activeLabels, setActiveLabels] = useState(values.active);
    const [labelStyles, setLabelStyles] = useState(values.styles);

    useEffect(() => {
        setActiveLabels(values.active);
        setLabelStyles(values.styles);
    }, [values]);

    const onChangeLabelStyles = (value, obj) => {
        onUpdate(`${ANNOT_ATTRIBUTES.SIDE_STYLES}.${obj}`, value);
    };

    const updateActiveLabels = (value, label) => {
        onUpdate(ANNOT_ATTRIBUTES.ACTIVE, value, label);
    };

    const onSwitchWindowColorPickerVisible = (isVisible, obj) => {
        onChangeWindowColorPickerVisible(isVisible, { value: labelStyles[obj], path: `${ANNOT_ATTRIBUTES.SIDE_STYLES}.${obj}` });
    };

    return (
        <>
            {activeLabels.length > 0 && (
                <>
                    <LabelList activeLabels={activeLabels} updateActiveLabels={updateActiveLabels} disabled={isPreventEditing} />
                    <Slider
                        label={t("GENERAL.MARGIN")}
                        obj={ANNOT_ATTRIBUTES.MARGIN}
                        value={labelStyles.margin}
                        onUpdate={onChangeLabelStyles}
                        min={-25}
                        max={25}
                        disabled={isPreventEditing}
                    />
                    <Select
                        label={t("ESTIMATE.FONT")}
                        obj={ANNOT_ATTRIBUTES.FONT}
                        value={labelStyles.font}
                        data={FONTS_LIST}
                        onUpdate={onChangeLabelStyles}
                        disabled={isPreventEditing}
                    />
                    <div className="properties-pane-row">
                        <Input
                            label={t("GENERAL.SIZE")}
                            obj={ANNOT_ATTRIBUTES.FONT_SIZE}
                            value={labelStyles.fontSize}
                            onUpdate={onChangeLabelStyles}
                            suffix="px"
                            numbersOnly
                            textAlign="right"
                            disabled={isPreventEditing}
                        />
                        <Select
                            label={t("ESTIMATE.STYLE")}
                            obj={ANNOT_ATTRIBUTES.FONT_STYLES}
                            value={labelStyles.fontStyles}
                            data={FONT_STYLES}
                            onUpdate={onChangeLabelStyles}
                            mode="multiple"
                            disabled={isPreventEditing}
                        />
                    </div>
                    <div className="properties-pane-row">
                        <ColorPicker
                            label={t("ESTIMATE.TEXT_COLOUR")}
                            obj={ANNOT_ATTRIBUTES.COLOR}
                            value={labelStyles.color}
                            onUpdate={onChangeLabelStyles}
                            onChangeWindowColorPickerVisible={onSwitchWindowColorPickerVisible}
                            disabled={isPreventEditing}
                        />
                        <Input
                            label={t("ESTIMATE.TEXT_OPACITY")}
                            obj={ANNOT_ATTRIBUTES.OPACITY}
                            value={labelStyles.opacity * 100}
                            onUpdate={onChangeLabelStyles}
                            suffix="%"
                            numbersOnly
                            textAlign="right"
                            percents
                            disabled={isPreventEditing}
                        />
                    </div>
                    <div className="properties-pane-row">
                        <ColorPicker
                            label={t("ESTIMATE.FILL_COLOUR")}
                            obj={ANNOT_ATTRIBUTES.BG_COLOR}
                            value={labelStyles.bgColor}
                            onUpdate={onChangeLabelStyles}
                            onChangeWindowColorPickerVisible={onSwitchWindowColorPickerVisible}
                            disabled={isPreventEditing}
                        />
                        <Input
                            label={t("ESTIMATE.FILL_OPACITY")}
                            obj={ANNOT_ATTRIBUTES.BG_OPACITY}
                            value={labelStyles.bgOpacity * 100}
                            onUpdate={onChangeLabelStyles}
                            suffix="%"
                            numbersOnly
                            textAlign="right"
                            percents
                            disabled={isPreventEditing}
                        />
                    </div>
                </>
            )}
        </>
    );
};

export default React.memo(SideLabels, (prevProps, nextProps) => {
    if (arePropsEqual(prevProps.isPreventEditing, nextProps.isPreventEditing) && arePropsEqual(prevProps.values, nextProps.values)) return true;
});
