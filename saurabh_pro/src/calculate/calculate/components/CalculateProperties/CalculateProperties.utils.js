import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import _ from "lodash";
import { AnnotationStore, ObjectsStore, ScaleStore } from "stores";
import { ANNOT_TYPES, ELLIPSE, FREE_HAND, FREE_HAND2, FREE_HAND3, STAMP, ANNOT_ATTRIBUTES } from "../../../../constants";
import { Status } from "components";
import { faAdjust, faQuestionCircle, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { faCircle } from "@fortawesome/free-regular-svg-icons";

export const annotTypesWithAspectRatio = [ELLIPSE, FREE_HAND, FREE_HAND2, FREE_HAND3, STAMP];
export const IFC_PANEL_KEYS = ["edit", "workflow", "ifc-styles", "visuals", "values"];
export const PDF_PANEL_KEYS = [
    "length",
    "edit",
    "visuals",
    "workflow",
    "area",
    "reduction",
    "ellipse",
    "arrow",
    "point",
    "scale",
    "draw",
    "text",
    "image-styles",
    "line",
    "draw",
    "sizePlacement",
    "values",
];

export const isScaleSelected = () => {
    const typeMap = ObjectsStore.getTypeMap();
    return typeMap[ANNOT_TYPES.X_SCALE] > 0 || typeMap[ANNOT_TYPES.Y_SCALE] > 0;
};

export const getSelectedAnnotations = (selectedAnnotations, withReadOnly = true, withFolders = false, annotTypesArray = []) => {
    const isScale = isScaleSelected();
    const { scalesList } = ObjectsStore.getSelectionList();
    const selectedItems = isScale ? scalesList : selectedAnnotations;

    return _.filter(selectedItems, (item) => {
        if (!withFolders && item.type === ANNOT_TYPES.GROUP) return false;
        else if (!withReadOnly && item.readOnly) return false;
        else if (annotTypesArray.length > 0) return _.includes(annotTypesArray, item.type);
        else return true;
    });
};

export const getAttributesValue = (selectedItems, key) => {
    function getValue(annot, key) {
        if (annot.type === ANNOT_TYPES.IFC_MODEL) return annot.xfdf[key];
        else return annot[key];
    }

    if (!selectedItems || selectedItems.length === 0) return "";
    switch (key) {
        case ANNOT_ATTRIBUTES.NUMBER:
        case ANNOT_ATTRIBUTES.NAME:
        case ANNOT_ATTRIBUTES.PARENT_ID: {
            const selectedFolder = ObjectsStore.getSelectionList().mainFoldersList;
            const selectedData = selectedFolder.length > 0 ? selectedFolder : selectedItems;
            const firstValue = selectedData[0][key];
            const IsEveryHaveSameValue = _.every(selectedData, (item) => item[key] === firstValue);

            if (key === ANNOT_ATTRIBUTES.PARENT_ID) return selectedData;
            else return IsEveryHaveSameValue ? firstValue : "";
        }
        case ANNOT_ATTRIBUTES.ASPECT_RATIO:
            const itemsWithCurrentKey = _.filter(selectedItems, (item) => _.includes(annotTypesWithAspectRatio, item.type));
            if (itemsWithCurrentKey.length) {
                const firstValue = getValue(itemsWithCurrentKey[0], key);
                const IsEveryHaveSameValue = _.every(itemsWithCurrentKey, (item) => getValue(item, key) === firstValue);
                return IsEveryHaveSameValue ? firstValue : "";
            } else return false;
        default:
            const firstValue = getValue(selectedItems[0], key);
            const IsEveryHaveSameValue = _.every(selectedItems, (item) => getValue(item, key) === firstValue);
            return IsEveryHaveSameValue ? firstValue : "";
    }
};

export const areAnnotsLocked = (selectedAnnotations) => getAttributesValue(selectedAnnotations, "readOnly");

export const arePropsEqual = (prevProps, nextProps) => _.isEqual(prevProps, nextProps);

export const onChangeExpandIcon = ({ isActive }) => (
    <span>
        <FontAwesomeIcon icon={["fal", "caret-down"]} className={`${!isActive && "fa-rotate-right-90"}`} />
    </span>
);

export const workflowSelectItemsWithStatus = [
    {
        value: "notStarted",
        StatusIcon: () => <Status notStarted />,
        label: "WORKFLOW.NOT_STARTED",
    },
    {
        value: "progress",
        StatusIcon: () => <Status progress />,
        label: "WORKFLOW.IN_PROGRESS",
    },
    {
        value: "review",
        StatusIcon: () => <Status review />,
        label: "WORKFLOW.REVIEW",
    },
    {
        value: "complete",
        StatusIcon: () => <Status complete />,
        label: "WORKFLOW.COMPLETE",
    },
];

export const workflowSelectItems = (t) => [
    {
        value: "notStarted",
        className: "Tree_Title_Circle_Icon",
        icon: faCircle,
        label: t("WORKFLOW.NOT_STARTED"),
    },
    {
        value: "progress",
        className: "Tree_Title_Adjust_Icon",
        icon: faAdjust,
        label: t("WORKFLOW.IN_PROGRESS"),
    },
    {
        value: "review",
        className: "Tree_Title_QuestionCircle_Icon",
        icon: faQuestionCircle,
        label: t("WORKFLOW.REVIEW"),
    },
    {
        value: "complete",
        className: "Tree_Title_CheckCircle_Icon",
        icon: faCheckCircle,
        label: t("WORKFLOW.COMPLETE"),
    },
];
