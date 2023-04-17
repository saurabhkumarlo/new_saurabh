import React, { useState, useEffect, useRef } from "react";
import { Input as AntInput } from "antd";
import Immutable from "immutable";
import { CalculationStore } from "../../../../stores";
import CalculationActions from "../../../../actions/CalculationActions";

const Input = ({ row, object, rightAlign, checkRowIsDisable, initialValue, readOnly, isLibrary, disable, ...props }) => {
    const [value, setValue] = useState(initialValue);
    const refValue = useRef(value);
    const [defaultValue, setDefaultValue] = useState(initialValue);
    const refDefaultValue = useRef(defaultValue);

    useEffect(() => {
        setValue(initialValue);
        refValue.current = initialValue;
        setDefaultValue(initialValue);
        refDefaultValue.current = initialValue;
    }, [row]);

    useEffect(() => {
        return () => {
            onUpdate();
        };
    }, []);

    const onAccept = () => {
        switch (object) {
            case "amount":
                if (refValue.current) {
                    refValue.current = CalculationStore.convertToFloat(value);
                    setValue(CalculationStore.convertToFloat(value));
                } else {
                    refValue.current = "";
                    setValue("");
                }
                break;
            case "pricePerUnit":
                if (refValue.current) {
                    refValue.current = CalculationStore.convertToFloat(value);
                    setValue(CalculationStore.convertToFloat(value));
                } else {
                    refValue.current = "";
                    setValue("");
                }
                break;
            default:
                break;
        }
        onUpdate();
    };

    const onChange = (e) => {
        setValue(e.target.value);
        refValue.current = e.target.value;
    };
    const onUpdate = () => {
        if (refDefaultValue.current !== refValue.current) {
            setDefaultValue(refValue.current);
            refDefaultValue.current = refValue.current;
            if (isLibrary) CalculationStore.requestUpdateRowTemplate(row.id, object, refValue.current);
            else CalculationActions.requestUpdateRow(Immutable.fromJS(row), object, refValue.current);
        }
    };

    return (
        <AntInput
            value={value}
            readOnly={readOnly}
            disabled={disable || checkRowIsDisable}
            bordered={false}
            onChange={onChange}
            onBlur={onAccept}
            onPressEnter={onAccept}
            className={`${rightAlign && "Right_Align"}`}
            {...props}
        />
    );
};

export default Input;
