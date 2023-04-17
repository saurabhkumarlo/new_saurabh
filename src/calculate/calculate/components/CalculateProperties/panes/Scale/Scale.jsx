import React from "react";
import { arePropsEqual, getAttributesValue, getSelectedAnnotations } from "../../CalculateProperties.utils";
import { Input } from "../../components";
import { ANNOT_ATTRIBUTES } from "constants/AnnotationConstants";

const Scale = ({ selectedAnnotations, onChangeValues, isPreventEditing }) => {
    const onUpdate = (value, obj) => {
        onChangeValues(getSelectedAnnotations(selectedAnnotations, false), String(value), obj);
    };

    return (
        <Input
            label="ESTIMATE.SCALE_LENGTH"
            obj={ANNOT_ATTRIBUTES.LENGTH}
            value={getAttributesValue(selectedAnnotations, ANNOT_ATTRIBUTES.LENGTH)}
            onUpdate={onUpdate}
            disabled={isPreventEditing}
            type="number"
            numbersOnly
        />
    );
};

export default React.memo(Scale, (prevProps, nextProps) => arePropsEqual(prevProps.selectedAnnotations, nextProps.selectedAnnotations));
