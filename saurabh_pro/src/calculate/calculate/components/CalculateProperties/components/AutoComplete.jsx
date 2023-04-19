import React, { useEffect, useRef, useState } from "react";
import { AutoComplete as AntAutoComplete } from "antd";
import { useTranslation } from "react-i18next";

const NUMBER_REGEX = /[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)/;

const AutoComplete = ({ value, obj, label, onUpdate, numbersOnly = false, textAlign = "inherit", ...rest }) => {
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

    const onAccept = () => {
        const newValue = ref.current.props?.value;
        const initialValue = refDefaultValue.current;
        if (newValue !== initialValue) {
            if (numbersOnly) {
                if (NUMBER_REGEX.test(newValue)) onUpdate(newValue, obj);
            } else onUpdate(newValue, obj);
        }
        setCurrentValue(initialValue);
    };

    const onChange = (value) => {
        setCurrentValue(value);
    };

    return (
        <div className="properties-pane-item">
            <label>{t(label)}</label>
            <AntAutoComplete
                ref={ref}
                value={currentValue}
                onChange={onChange}
                onSelect={onChange}
                onBlur={onAccept}
                dropdownClassName="properties-pane-select-dropdown"
                style={{ textAlign }}
                {...rest}
            />
        </div>
    );
};

export default AutoComplete;
