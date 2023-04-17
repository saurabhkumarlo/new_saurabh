import { ColorPicker, Input, Select, Slider } from "../../../components";
import { LabelList } from "./";
import { FONTS_LIST, FONT_STYLES } from "constants/FontConstants";
import React, { useEffect, useState } from "react";
import { AnnotationStore } from "stores";
import { POINT } from "constants/AnnotationConstants";
import { RENDERS_PER_LABEL_TYPES } from "constants/LabelsConstants";
import _ from "lodash";
import { useTranslation } from "react-i18next";
import { arePropsEqual } from "../../../CalculateProperties.utils";
import { ANNOT_ATTRIBUTES } from "constants/AnnotationConstants";

const CentralLabels = ({ values, onUpdate, onChangeWindowColorPickerVisible, isPreventEditing }) => {
    const { t } = useTranslation();
    const [activeLabels, setActiveLabels] = useState(values.active);
    const [labelStyles, setLabelStyles] = useState(values.styles);

    useEffect(() => {
        setActiveLabels(values.active);
        setLabelStyles(values.styles);
    }, [values.active, values.styles]);

    const onChangeLabelStyles = (value, obj) => {
        onUpdate(`${ANNOT_ATTRIBUTES.CENTRAL_STYLES}.${obj}`, value);
    };

    const updateActiveLabels = (value, label) => {
        onUpdate(ANNOT_ATTRIBUTES.ACTIVE, value, label);
    };

    const getRenderPositionData = () => {
        const annotTypes = AnnotationStore.getTypesOfSelectedAnnots();
        if (annotTypes[0] === POINT && annotTypes.length === 1) return RENDERS_PER_LABEL_TYPES.POINT;
        else if (_.includes(annotTypes, POINT) && annotTypes.length > 1) return false;
        else return RENDERS_PER_LABEL_TYPES.CENTRAL;
    };

    const onSwitchWindowColorPickerVisible = (isVisible, obj) => {
        onChangeWindowColorPickerVisible(isVisible, { value: labelStyles[obj], path: `${ANNOT_ATTRIBUTES.CENTRAL_STYLES}.${obj}` });
    };

    return (
        <>
            {activeLabels.length > 0 && (
                <>
                    <LabelList activeLabels={activeLabels} updateActiveLabels={updateActiveLabels} disabled={isPreventEditing} />
                    {values.options.length > 0 && (
                        <>
                            <Select
                                label={t("ESTIMATE.POSITION")}
                                obj={ANNOT_ATTRIBUTES.RENDER}
                                value={labelStyles.render}
                                data={getRenderPositionData()}
                                disabled={!getRenderPositionData()}
                                onUpdate={onChangeLabelStyles}
                                disabled={isPreventEditing}
                            />
                            <Slider label="X" obj="x" value={labelStyles.x} onUpdate={onChangeLabelStyles} min={-500} max={500} disabled={isPreventEditing} />
                            <Slider label="Y" obj="y" value={labelStyles.y} onUpdate={onChangeLabelStyles} min={-500} max={500} disabled={isPreventEditing} />
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
            )}
        </>
    );
};

export default React.memo(CentralLabels, (prevProps, nextProps) => {
    if (arePropsEqual(prevProps.isPreventEditing, nextProps.isPreventEditing) && arePropsEqual(prevProps.values, nextProps.values)) return true;
});
