import React from "react";
import { arePropsEqual, getAttributesValue, getSelectedAnnotations, workflowSelectItemsWithStatus } from "../../CalculateProperties.utils";
import { Select } from "../../components";
import { ANNOT_ATTRIBUTES } from "constants/AnnotationConstants";

const Workflow = ({ selectedAnnotations, onChangeValues, isPreventEditing }) => {
    const onChange = (value, obj) => {
        onChangeValues(getSelectedAnnotations(selectedAnnotations, false, false), value, obj);
    };

    return (
        <Select
            label="GENERAL.STATUS"
            obj={ANNOT_ATTRIBUTES.STATUS}
            value={getAttributesValue(selectedAnnotations, ANNOT_ATTRIBUTES.STATUS)}
            data={workflowSelectItemsWithStatus}
            disabled={isPreventEditing}
            onUpdate={onChange}
            iconComponent
        />
    );
};

export default React.memo(Workflow, (prevProps, nextProps) => arePropsEqual(prevProps.selectedAnnotations, nextProps.selectedAnnotations));
