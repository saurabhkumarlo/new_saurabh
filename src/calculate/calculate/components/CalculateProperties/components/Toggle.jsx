import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Switch } from "antd";

const Toggle = ({ label, obj, value, onUpdate, ...rest }) => {
    const { t } = useTranslation();
    const [currentValue, setCurrentValue] = useState(value);

    useEffect(() => {
        setCurrentValue(value);
    }, [value]);

    const onChange = (value) => {
        onUpdate(value, obj);
    };

    return (
        <div className="properties-pane-item">
            <span className="toggle-container">
                <Switch checked={currentValue} onChange={onChange} {...rest} />
                <label>{t(label)}</label>
            </span>
        </div>
    );
};

export default Toggle;
