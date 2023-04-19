import React, { useEffect, useRef, useState } from "react";
import { Select as AntSelect, Row, Col } from "antd";
import Immutable from "immutable";
import EventsStore from "../../../../stores/EventsStore";
import CalculationActions from "../../../../actions/CalculationActions";
import { useTranslation } from "react-i18next";
import { CalculationStore } from "../../../../stores";

const { Option } = AntSelect;

const Select = ({ data, row, initialValue, object, checkRowIsDisable, isLibrary, disable, ...props }) => {
    const { t } = useTranslation();
    const [value, setValue] = useState(CalculationStore.getStatusValue(initialValue));
    const refValue = useRef(value);
    const [defaultValue, setDefaultValue] = useState(value);
    const refDefaultValue = useRef(defaultValue);
    const [isOpen, setIsOpen] = useState(false);

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

    const onBlur = () => {
        setIsOpen(false);
        onUpdate();
    };

    const onSelect = (value) => {
        setValue(value);
        refValue.current = value;
        onUpdate();
        setIsOpen(false);
    };

    const onChange = (value) => {
        setValue(value);
        refValue.current = value;
    };

    const onUpdate = () => {
        if (refDefaultValue.current !== refValue.current) {
            setDefaultValue(refValue.current);
            refDefaultValue.current = refValue.current;
            if (isLibrary) CalculationStore.requestUpdateRowTemplate(row.id, object, refValue.current);
            else CalculationActions.requestUpdateRow(Immutable.fromJS(row), object, refValue.current);
        }
    };

    const onDropdownVisibleTrigger = () => {
        setTimeout(() => {
            if (!isOpen && !EventsStore.isContextMenuCalculateRowsOpen()) {
                setIsOpen(true);
            }
        }, 250);
    };

    const onMouseClick = () => {
        setTimeout(() => {
            if (EventsStore.isContextMenuCalculateRowsOpen()) {
                setIsOpen(false);
            }
        }, 250);
    };

    return (
        <AntSelect
            defaultValue={value}
            value={value}
            open={isOpen}
            disabled={disable || checkRowIsDisable}
            showArrow={false}
            bordered={false}
            showAction={["click"]}
            onMouseDown={onMouseClick}
            onChange={onChange}
            onSelect={onSelect}
            onBlur={onBlur}
            onDropdownVisibleChange={onDropdownVisibleTrigger}
            dropdownClassName="Calculate_Rows_Dropdown"
            defaultActiveFirstOption
            {...props}
        >
            {data.map((item, index) => {
                return isOpen ? (
                    <Option value={item.value} key={index}>
                        <Row wrap={false} gutter={6}>
                            <Col>
                                <item.StatusIcon />
                            </Col>
                            <Col>{t(item.label)}</Col>
                        </Row>
                    </Option>
                ) : (
                    <Option value={item.value} key={index}>
                        <Row wrap={false}>
                            <item.StatusIcon />
                        </Row>
                    </Option>
                );
            })}
        </AntSelect>
    );
};

export default Select;
