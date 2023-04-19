import { CentralLabels, SideLabels, CheckboxDropdown } from "./components";
import React, { useEffect, useRef, useState } from "react";
import { getLabelValues } from "./Labels.utils";
import { AnnotationStore } from "stores";
import { Collapse } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ANNOT_ATTRIBUTES } from "constants/AnnotationConstants";
import { LABEL_TYPES } from "constants/LabelsConstants";
import _ from "lodash";
import { useTranslation } from "react-i18next";
import { arePropsEqual, getSelectedAnnotations, onChangeExpandIcon } from "../../CalculateProperties.utils";

const { Panel } = Collapse;

const Labels = ({ activePanelKeys, setActiveCollapseKeys, selectedAnnotations, onChangeValues, onChangeWindowColorPickerVisible, isPreventEditing }) => {
    const { t } = useTranslation();
    const [data, setData] = useState(getLabelValues(selectedAnnotations));
    const dataRef = useRef();

    useEffect(() => {
        setData(getLabelValues(selectedAnnotations));
        dataRef.current = getLabelValues(selectedAnnotations);
    }, [selectedAnnotations]);

    const onUpdateLabels = (path, value, label) => {
        if (path === "active") {
            if (value) {
                const filteredAnnots = _.filter(getSelectedAnnotations(selectedAnnotations, false, false), (annot) =>
                    _.includes(_.flatten(_.values(AnnotationStore.getLabelsByAnnotType(annot.type))), label)
                );
                onChangeValues(filteredAnnots, label, ANNOT_ATTRIBUTES.LABELS, { path, updateAction: "add" });
            } else onChangeValues(getSelectedAnnotations(selectedAnnotations, false, false), label, ANNOT_ATTRIBUTES.LABELS, { path, updateAction: "remove" });
        } else onChangeValues(getSelectedAnnotations(selectedAnnotations, false, false), value, ANNOT_ATTRIBUTES.LABELS, { path });
    };

    const onChangeCollapse = (key) => {
        setActiveCollapseKeys(key);
    };

    const onSwitchWindowColorPickerVisible = (isVisible, value) => {
        onChangeWindowColorPickerVisible(isVisible, selectedAnnotations, value, ANNOT_ATTRIBUTES.LABELS);
    };

    const onChangeActiveLabels = (value, label) => {
        onUpdateLabels("active", value, label);
    };

    return (
        <Collapse
            defaultActiveKey={activePanelKeys}
            onChange={onChangeCollapse}
            expandIcon={onChangeExpandIcon}
            collapsible="header"
            className="properties-pane"
        >
            {data[LABEL_TYPES.CENTRAL] && (
                <Panel
                    header={t("ESTIMATE.LABELS_CENTER")}
                    key="labels"
                    id="labels_pane"
                    extra={
                        <CheckboxDropdown
                            label={<FontAwesomeIcon icon={["fal", "plus-square"]} />}
                            activeData={data[LABEL_TYPES.CENTRAL].active}
                            data={data[LABEL_TYPES.CENTRAL].options}
                            onChange={onChangeActiveLabels}
                            isPreventEditing={isPreventEditing}
                        />
                    }
                >
                    <CentralLabels
                        values={data[LABEL_TYPES.CENTRAL]}
                        onUpdate={onUpdateLabels}
                        onChangeWindowColorPickerVisible={onSwitchWindowColorPickerVisible}
                        isPreventEditing={isPreventEditing}
                    />
                </Panel>
            )}
            {data[LABEL_TYPES.SIDE] && (
                <Panel
                    header={t("ESTIMATE.LABELS_SIDES")}
                    key="labels-sides"
                    id="labels-sides_pane"
                    extra={
                        <CheckboxDropdown
                            label={<FontAwesomeIcon icon={["fal", "plus-square"]} />}
                            activeData={data[LABEL_TYPES.SIDE].active}
                            data={data[LABEL_TYPES.SIDE].options}
                            onChange={onChangeActiveLabels}
                            isPreventEditing={isPreventEditing}
                        />
                    }
                >
                    <SideLabels
                        values={data[LABEL_TYPES.SIDE]}
                        onUpdate={onUpdateLabels}
                        onChangeWindowColorPickerVisible={onSwitchWindowColorPickerVisible}
                        isPreventEditing={isPreventEditing}
                    />
                </Panel>
            )}
        </Collapse>
    );
};

export default React.memo(Labels, (prevProps, nextProps) => arePropsEqual(prevProps.selectedAnnotations, nextProps.selectedAnnotations));
