import React, { useEffect, useRef, useState } from "react";
import { Slider as AntSlider, InputNumber } from "antd";
import { useTranslation } from "react-i18next";

const Slider = ({ label, obj, value, onUpdate, min = 0, max = 100, ...rest }) => {
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
        const newValue = ref.current.value;
        const initialValue = refDefaultValue.current;
        if (newValue !== initialValue) onUpdate(newValue, obj);
        setCurrentValue(initialValue);
    };

    const onChange = (value) => {
        setCurrentValue(value);
    };

    const onAfterChange = (value) => {
        onUpdate(value, obj);
        setCurrentValue(value);
    };

    return (
        <div className="properties-pane-item">
            <div className="item-container">
                <label>{t(label)}</label>
                <AntSlider value={currentValue} onChange={onChange} onAfterChange={onAfterChange} min={min} max={max} {...rest} />
                <InputNumber
                    ref={ref}
                    value={currentValue}
                    onChange={onChange}
                    onPressEnter={onAccept}
                    onBlur={onAccept}
                    bordered={false}
                    controls={false}
                    min={min}
                    max={max}
                    {...rest}
                />
            </div>
        </div>
    );
};

export default Slider;
