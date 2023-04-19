import { Input as AntInput } from "antd";
import _ from "lodash";
import { useTranslation } from "react-i18next";
import React, { useEffect, useRef, useState } from "react";
import { AnnotationStore } from "stores";
import { ANNOT_TYPES } from "constants/AnnotationConstants";

const TextArea = ({ label = "", obj, value, onUpdate, style, ...rest }) => {
    const { t } = useTranslation();
    const [currentValue, setCurrentValue] = useState(value);
    const ref = useRef(null);
    const refDefaultValue = useRef(null);

    useEffect(() => {
        setCurrentValue(value);
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
            case "annotationsInserted":
                const typeMap = AnnotationStore.annotationTypeMap.toJS();
                if (obj === "textContent" && typeMap[ANNOT_TYPES.FREE_TEXT] > 0 && ref.current) {
                    ref.current.focus();
                    ref.current.select();
                }
                break;
            default:
                break;
        }
    };

    const onAccept = () => {
        const newValue = ref.current.resizableTextArea?.props?.value;
        const initialValue = refDefaultValue.current;
        if (newValue !== initialValue) onUpdate(newValue, obj);
        setCurrentValue(initialValue);
    };

    const onChange = (e) => {
        setCurrentValue(e.target.value);
    };

    return (
        <div className="properties-pane-item" style={{ ...style }}>
            <label>{t(label)}</label>
            <AntInput.TextArea ref={ref} value={currentValue} onChange={onChange} onBlur={onAccept} rows={4} onFocus={(e) => e.target.select()} {...rest} />
        </div>
    );
};

export default TextArea;
