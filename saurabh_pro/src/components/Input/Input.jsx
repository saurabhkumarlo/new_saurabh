import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Col, Input as BaseInput, Row } from "antd";
import { isNil } from "lodash";

import "./input.less";

const Input = ({
    propsRef,
    label,
    value,
    onChange,
    onAccept,
    type = "text",
    min,
    max,
    isPositive,
    addonBefore,
    disabled,
    suffix,
    heightAndQuantityType,
    ...props
}) => {
    const [inputValue, setInputValue] = useState(value);
    const inputRef = useRef();
    const { t } = useTranslation();
    const validateNumber = (value, minValue, maxValue) => !Number.isNaN(value) && value >= minValue && value <= maxValue;
    const isNumber = type === "number";

    useEffect(() => {
        setInputValue(value);
    }, [value]);

    useEffect(() => {
        return () => {
            if (type === "textArea") onInputAccept({ target: { value: propsRef?.current?.resizableTextArea?.props?.value } });
            else onInputAccept({ target: { value: inputRef?.current?.props ? inputRef.current.props.value : inputRef.current } });
        };
    }, []);

    const onInputChange = (e) => {
        setInputValue(isNumber ? getNumberValue(e, isNumber) : e.target.value);
        inputRef.current = isNumber ? getNumberValue(e, isNumber) : e.target.value;
    };

    const onTextAreaChange = (e) => {
        setInputValue(e.target.value);
    };

    const onInputAccept = (e) => {
        if (value !== e.target.value) {
            onAccept(isNumber ? getNumberValue(e, isNumber) : e);
        }
    };

    const getNumberValue = (e, isNumber) => {
        return isNumber && !isNil(min) && !isNil(max)
            ? validateNumber(e.target.value, min, max)
                ? e.target.value
                : inputValue
            : isPositive && !Number.isNaN(Math.abs(e.target.value))
            ? Math.abs(e.target.value)
            : e.target.value;
    };

    return (
        <Row className="Input_Wrapper">
            {heightAndQuantityType && type === "number" && (
                <>
                    <Col span={24} id={`${label.toLowerCase().replaceAll(" ", "-")}_input-title`}>
                        {t(label)}
                    </Col>
                    <Col span={24} id={`${label.toLowerCase().replaceAll(" ", "-")}_input`}>
                        <BaseInput
                            ref={propsRef || inputRef}
                            type="number"
                            value={inputValue}
                            onChange={onInputChange}
                            addonBefore={addonBefore}
                            suffix={suffix}
                            disabled={disabled}
                            onPressEnter={onInputAccept}
                            onBlur={onInputAccept}
                            step={addonBefore === "Q" ? 1 : 0.1}
                            {...props}
                        />
                    </Col>
                </>
            )}
            {(type === "text" || (type === "number" && !heightAndQuantityType)) && (
                <>
                    <Col span={24} id={`${label.toLowerCase().replaceAll(" ", "-")}_input-title`}>
                        {t(label)}
                    </Col>
                    <Col span={24} id={`${label.toLowerCase().replaceAll(" ", "-")}_input`}>
                        <BaseInput
                            ref={propsRef || inputRef}
                            type="text"
                            value={inputValue}
                            onChange={onInputChange}
                            addonBefore={addonBefore}
                            suffix={suffix}
                            disabled={disabled}
                            onPressEnter={onInputAccept}
                            onBlur={onInputAccept}
                            {...props}
                        />
                    </Col>
                </>
            )}
            {type === "textArea" && (
                <Col span={24}>
                    <BaseInput.TextArea
                        ref={propsRef}
                        value={inputValue}
                        onChange={onTextAreaChange}
                        onBlur={onTextAreaChange}
                        disabled={disabled}
                        {...props}
                        id="text_input"
                        onFocus={(e) => e.target.select()}
                    />
                </Col>
            )}
        </Row>
    );
};

export default Input;
