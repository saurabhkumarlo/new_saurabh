import { Collapse } from "antd";
import React from "react";
import { arePropsEqual, getSelectedAnnotations, isScaleSelected, onChangeExpandIcon } from "../../CalculateProperties.utils";
import { useTranslation } from "react-i18next";
import { AnnotationStore, AuthenticationStore, ObjectsStore } from "stores";
import { ANNOT_TYPES, ANNOT_ATTRIBUTES } from "constants/AnnotationConstants";
import { AnnotStyles } from "./components";

const { Panel } = Collapse;
const StylesBox = ({
    activePanelKeys,
    setActiveCollapseKeys,
    selectedAnnotations,
    onChangeValues,
    onChangeWindowColorPickerVisible,
    openTilesDialog,
    openAnglesDialog,
    isPreventEditing,
}) => {
    const { t } = useTranslation();
    const typeMap = ObjectsStore.getTypeMap();
    const role = AuthenticationStore.getRole();

    const onChangeCollapse = (key) => {
        setActiveCollapseKeys(key);
    };

    const isAnnotTypeSelected = (type) => role && typeMap[type] > 0;

    return (
        <Collapse defaultActiveKey={activePanelKeys} onChange={onChangeCollapse} expandIcon={onChangeExpandIcon} className="properties-pane">
            {isScaleSelected() && (
                <Panel header={t("ESTIMATE.SCALE")} key="scale" id="scale_pane">
                    <AnnotStyles
                        annots={getSelectedAnnotations(selectedAnnotations, true, false, [ANNOT_TYPES.X_SCALE, ANNOT_TYPES.Y_SCALE])}
                        styles={{
                            color: ANNOT_ATTRIBUTES.COLOR,
                            opacity: ANNOT_ATTRIBUTES.G_OPACITY,
                            style: ANNOT_ATTRIBUTES.STYLE,
                            thickness: ANNOT_ATTRIBUTES.WIDTH,
                            startIcon: ANNOT_ATTRIBUTES.START_ICON,
                            endIcon: ANNOT_ATTRIBUTES.END_ICON,
                        }}
                        onUpdate={onChangeValues}
                        onChangeWindowColorPickerVisible={onChangeWindowColorPickerVisible}
                        isPreventEditing={isPreventEditing}
                    />
                </Panel>
            )}

            {isAnnotTypeSelected(ANNOT_TYPES.POINT) && (
                <Panel header={t("ESTIMATE.POINT")} key="point" id="point_pane">
                    <AnnotStyles
                        annots={getSelectedAnnotations(selectedAnnotations, true, false, [ANNOT_TYPES.POINT])}
                        styles={{
                            quantity: ANNOT_ATTRIBUTES.QUANTITY,
                            icon: ANNOT_ATTRIBUTES.TYPE_ICON,
                            color: ANNOT_ATTRIBUTES.INTERIOR_COLOR,
                            opacity: ANNOT_ATTRIBUTES.G_OPACITY,
                            size: ANNOT_ATTRIBUTES.POINT_SIZE,
                        }}
                        onUpdate={onChangeValues}
                        onChangeWindowColorPickerVisible={onChangeWindowColorPickerVisible}
                        isPreventEditing={isPreventEditing}
                    />
                </Panel>
            )}

            {isAnnotTypeSelected(ANNOT_TYPES.POLYLINE) && (
                <Panel header={t("ESTIMATE.LINE")} key="line" id="line_pane">
                    <AnnotStyles
                        annots={getSelectedAnnotations(selectedAnnotations, true, false, [ANNOT_TYPES.POLYLINE])}
                        styles={{
                            quantity: ANNOT_ATTRIBUTES.QUANTITY,
                            height: ANNOT_ATTRIBUTES.HEIGHT,
                            color: ANNOT_ATTRIBUTES.COLOR,
                            opacity: ANNOT_ATTRIBUTES.G_OPACITY,
                            style: ANNOT_ATTRIBUTES.STYLE,
                            thickness: ANNOT_ATTRIBUTES.WIDTH,
                            startIcon: ANNOT_ATTRIBUTES.START_ICON,
                            endIcon: ANNOT_ATTRIBUTES.END_ICON,
                            tiles: true,
                            angles: true,
                        }}
                        onUpdate={onChangeValues}
                        onChangeWindowColorPickerVisible={onChangeWindowColorPickerVisible}
                        onOpenTiles={openTilesDialog}
                        onOpenAngles={openAnglesDialog}
                        isPreventEditing={isPreventEditing}
                    />
                </Panel>
            )}

            {isAnnotTypeSelected(ANNOT_TYPES.ARROW) && (
                <Panel header={t("ESTIMATE.ARROW")} key="arrow" id="arrow_pane">
                    <AnnotStyles
                        annots={getSelectedAnnotations(selectedAnnotations, true, false, [ANNOT_TYPES.ARROW])}
                        styles={{
                            color: ANNOT_ATTRIBUTES.COLOR,
                            opacity: ANNOT_ATTRIBUTES.G_BORDER_OPACITY,
                            style: ANNOT_ATTRIBUTES.STYLE,
                            thickness: ANNOT_ATTRIBUTES.WIDTH,
                        }}
                        onUpdate={onChangeValues}
                        onChangeWindowColorPickerVisible={onChangeWindowColorPickerVisible}
                        isPreventEditing={isPreventEditing}
                    />
                </Panel>
            )}

            {isAnnotTypeSelected(ANNOT_TYPES.POLYGON) && (
                <Panel header={t("ESTIMATE.AREA")} key="area" id="area_pane">
                    <AnnotStyles
                        annots={getSelectedAnnotations(selectedAnnotations, true, false, [ANNOT_TYPES.POLYGON])}
                        styles={{
                            quantity: ANNOT_ATTRIBUTES.QUANTITY,
                            height: ANNOT_ATTRIBUTES.HEIGHT,
                            color: ANNOT_ATTRIBUTES.INTERIOR_COLOR,
                            opacity: ANNOT_ATTRIBUTES.G_OPACITY,
                            borderColor: ANNOT_ATTRIBUTES.COLOR,
                            borderOpacity: ANNOT_ATTRIBUTES.G_BORDER_OPACITY,
                            style: ANNOT_ATTRIBUTES.STYLE,
                            thickness: ANNOT_ATTRIBUTES.WIDTH,
                            tiles: true,
                            angles: true,
                        }}
                        onUpdate={onChangeValues}
                        onChangeWindowColorPickerVisible={onChangeWindowColorPickerVisible}
                        onOpenTiles={openTilesDialog}
                        onOpenAngles={openAnglesDialog}
                        isPreventEditing={isPreventEditing}
                    />
                </Panel>
            )}

            {isAnnotTypeSelected(ANNOT_TYPES.REDUCTION) && (
                <Panel header={t("ESTIMATE.REDUCTION")} key="reduction" id="reduction_pane">
                    <AnnotStyles
                        annots={getSelectedAnnotations(selectedAnnotations, true, false, [ANNOT_TYPES.REDUCTION])}
                        styles={{
                            quantity: ANNOT_ATTRIBUTES.QUANTITY,
                            height: ANNOT_ATTRIBUTES.HEIGHT,
                            color: ANNOT_ATTRIBUTES.INTERIOR_COLOR,
                            opacity: ANNOT_ATTRIBUTES.G_OPACITY,
                            borderColor: ANNOT_ATTRIBUTES.COLOR,
                            borderOpacity: ANNOT_ATTRIBUTES.G_BORDER_OPACITY,
                            style: ANNOT_ATTRIBUTES.STYLE,
                            thickness: ANNOT_ATTRIBUTES.WIDTH,
                            tiles: true,
                            angles: true,
                        }}
                        onUpdate={onChangeValues}
                        onChangeWindowColorPickerVisible={onChangeWindowColorPickerVisible}
                        onOpenTiles={openTilesDialog}
                        onOpenAngles={openAnglesDialog}
                        isPreventEditing={isPreventEditing}
                    />
                </Panel>
            )}

            {isAnnotTypeSelected(ANNOT_TYPES.ELLIPSE) && (
                <Panel header={t("ESTIMATE.ELLIPSE")} key="ellipse" id="ellipse_pane">
                    <AnnotStyles
                        annots={getSelectedAnnotations(selectedAnnotations, true, false, [ANNOT_TYPES.ELLIPSE])}
                        styles={{
                            quantity: ANNOT_ATTRIBUTES.QUANTITY,
                            height: ANNOT_ATTRIBUTES.HEIGHT,
                            color: ANNOT_ATTRIBUTES.INTERIOR_COLOR,
                            opacity: ANNOT_ATTRIBUTES.G_OPACITY,
                            borderColor: ANNOT_ATTRIBUTES.COLOR,
                            borderOpacity: ANNOT_ATTRIBUTES.G_BORDER_OPACITY,
                            style: ANNOT_ATTRIBUTES.STYLE,
                            thickness: ANNOT_ATTRIBUTES.WIDTH,
                            tiles: true,
                            angles: true,
                        }}
                        onUpdate={onChangeValues}
                        onChangeWindowColorPickerVisible={onChangeWindowColorPickerVisible}
                        onOpenTiles={openTilesDialog}
                        onOpenAngles={openAnglesDialog}
                        isPreventEditing={isPreventEditing}
                    />
                </Panel>
            )}

            {isAnnotTypeSelected(ANNOT_TYPES.FREE_HAND) && (
                <Panel header={t("ESTIMATE.DRAW")} key="draw" id="draw_pane">
                    <AnnotStyles
                        annots={getSelectedAnnotations(selectedAnnotations, true, false, [ANNOT_TYPES.FREE_HAND])}
                        styles={{
                            quantity: ANNOT_ATTRIBUTES.QUANTITY,
                            height: ANNOT_ATTRIBUTES.HEIGHT,
                            color: ANNOT_ATTRIBUTES.INTERIOR_COLOR,
                            opacity: ANNOT_ATTRIBUTES.G_OPACITY,
                            borderColor: ANNOT_ATTRIBUTES.COLOR,
                            borderOpacity: ANNOT_ATTRIBUTES.G_BORDER_OPACITY,
                            style: ANNOT_ATTRIBUTES.STYLE,
                            thickness: ANNOT_ATTRIBUTES.WIDTH,
                            tiles: true,
                            angles: true,
                        }}
                        onUpdate={onChangeValues}
                        onChangeWindowColorPickerVisible={onChangeWindowColorPickerVisible}
                        onOpenTiles={openTilesDialog}
                        onOpenAngles={openAnglesDialog}
                        isPreventEditing={isPreventEditing}
                    />
                </Panel>
            )}

            {isAnnotTypeSelected(ANNOT_TYPES.FREE_TEXT) && (
                <Panel header={t("ESTIMATE.COMMENT")} key="text" id="text_pane">
                    <AnnotStyles
                        annots={getSelectedAnnotations(selectedAnnotations, true, false, [ANNOT_TYPES.FREE_TEXT])}
                        styles={{
                            font: ANNOT_ATTRIBUTES.TEXT_FONT,
                            fontSize: ANNOT_ATTRIBUTES.FONT_SIZE,
                            decoration: ANNOT_ATTRIBUTES.FONT_DECORATION,
                            textColor: ANNOT_ATTRIBUTES.TEXT_COLOR,
                            textOpacity: ANNOT_ATTRIBUTES.G_OPACITY,
                            borderColor: ANNOT_ATTRIBUTES.STROKE_COLOR,
                            borderOpacity: ANNOT_ATTRIBUTES.G_BORDER_OPACITY,
                            style: ANNOT_ATTRIBUTES.STYLE,
                            thickness: ANNOT_ATTRIBUTES.WIDTH,
                            textContent: ANNOT_ATTRIBUTES.TEXT_CONTENT,
                        }}
                        onUpdate={onChangeValues}
                        onChangeWindowColorPickerVisible={onChangeWindowColorPickerVisible}
                        isPreventEditing={isPreventEditing}
                    />
                </Panel>
            )}

            {isAnnotTypeSelected(ANNOT_TYPES.STAMP) && (
                <Panel header={t("ESTIMATE.IMAGE")} key="image-styles" id="image_pane">
                    <AnnotStyles
                        annots={getSelectedAnnotations(selectedAnnotations, true, false, [ANNOT_TYPES.STAMP])}
                        styles={{
                            borderColor: ANNOT_ATTRIBUTES.COLOR,
                            borderOpacity: ANNOT_ATTRIBUTES.G_BORDER_OPACITY,
                            style: ANNOT_ATTRIBUTES.STYLE,
                            thickness: ANNOT_ATTRIBUTES.WIDTH,
                        }}
                        onUpdate={onChangeValues}
                        onChangeWindowColorPickerVisible={onChangeWindowColorPickerVisible}
                        isPreventEditing={isPreventEditing}
                    />
                </Panel>
            )}

            {isAnnotTypeSelected(ANNOT_TYPES.IFC_MODEL) && (
                <Panel header={t("ESTIMATE.IFC_OBJECT")} key="ifc-styles" id="ifc_pane">
                    <AnnotStyles
                        annots={getSelectedAnnotations(selectedAnnotations, true, false, [ANNOT_TYPES.IFC_MODEL])}
                        styles={{
                            color: ANNOT_ATTRIBUTES.COLOR,
                        }}
                        onUpdate={onChangeValues}
                        onChangeWindowColorPickerVisible={onChangeWindowColorPickerVisible}
                        isPreventEditing={isPreventEditing}
                    />
                </Panel>
            )}
        </Collapse>
    );
};

export default React.memo(StylesBox, (prevProps, nextProps) => arePropsEqual(prevProps.selectedAnnotations, nextProps.selectedAnnotations));
