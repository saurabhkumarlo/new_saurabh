import "./autocomplete.less";

import { AutoComplete, Input, Popconfirm } from "antd";
import { CalculationStore, EventsStore, ObjectsStore } from "../../../../stores";
import React, { useEffect, useRef, useState } from "react";

import CalculationActions from "../../../../actions/CalculationActions";
import Immutable from "immutable";
import { transformExtendedValue } from "../../CalculateRows.utils";
import { useTranslation } from "react-i18next";

const Autocomplete = ({ row, object, checkRowIsDisable, initialValue, extendedValue, rightAlign, addonAfter, extended, isLibrary, disable, ...props }) => {
    const { t } = useTranslation();
    const [value, setValue] = useState(initialValue);
    const refValue = useRef(value);
    const [defaultValue, setDefaultValue] = useState(initialValue);
    const refDefaultValue = useRef(defaultValue);
    const [exValue, setExValue] = useState(extendedValue);
    const [isOpen, setIsOpen] = useState(false);
    const [isExtended, setIsExtended] = useState(extended);
    const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);
    const [shouldModalAppear, setShouldModalAppear] = useState(false);

    useEffect(() => {
        setValue(initialValue);
        refValue.current = initialValue;
        setDefaultValue(initialValue);
        refDefaultValue.current = initialValue;
        setExValue(extendedValue);
        setShouldModalAppear(false);
    }, [row]);

    useEffect(() => {
        return () => {
            if (object !== "insertRow") onUpdate();
        };
    }, []);

    const onClear = () => {
        refValue.current = refDefaultValue.current;
        setValue(refDefaultValue.current);
        setIsConfirmationVisible(false);
        setShouldModalAppear(true);
        setIsOpen(false);
        if (extended) setIsExtended(true);
    };

    const onAccept = () => {
        if (object !== "insertRow") {
            if (!shouldModalAppear) {
                setIsOpen(false);
                if (extended) setIsExtended(true);
                if (isConfirmationVisible) setIsConfirmationVisible(false);
            }

            switch (object) {
                case "amount":
                case "pricePerUnit":
                    refValue.current = CalculationStore.convertToFloat(value);
                    setValue(CalculationStore.convertToFloat(value));
                    break;
                default:
                    refValue.current = value;
                    setValue(value);
                    break;
            }

            onUpdate();
        }
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
            if (shouldModalAppear) {
                setIsConfirmationVisible(true);
                setShouldModalAppear(false);
                setIsOpen(false);
                return;
            }
            setDefaultValue(refValue.current);
            refDefaultValue.current = refValue.current;
            if (extended) {
                if (object === "amount") setExValue(CalculationStore.formatAmountValue(transformExtendedValue(refValue.current, row.geoAnnotation)));
                else if (object === "pricePerUnit") setExValue(CalculationStore.formatCurrencyValue(refValue.current));
                else setExValue(refValue.current);
            }
            if (isLibrary) CalculationStore.requestUpdateRowTemplate(row.id, object, refValue.current);
            else CalculationActions.requestUpdateRow(Immutable.fromJS(row), object, refValue.current);
        }
    };

    const onFocusInput = () => {
        setIsExtended(false);
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

    return isExtended ? (
        <Input
            value={exValue}
            disabled={disable || checkRowIsDisable}
            bordered={false}
            onFocus={onFocusInput}
            className={rightAlign && "Right_Align Calculate_Rows_Input"}
        />
    ) : (
        <Popconfirm
            title={t("ESTIMATE.MESSAGE.OVERWRITE_ROWS")}
            visible={isConfirmationVisible}
            onConfirm={onAccept}
            onCancel={onClear}
            okText={t("GENERAL.OVERWRITE")}
            cancelText={t("GENERAL.CANCEL")}
            overlayClassName="AmountPopover"
        >
            <AutoComplete
                value={value}
                open={isOpen}
                disabled={disable || checkRowIsDisable}
                bordered={false}
                options={!isLibrary && ObjectsStore.getRowsAutoComplete()[object]}
                autoFocus={extended}
                filterOption={(inputValue, option) => option.value.toString().toLowerCase().indexOf(inputValue.toString().toLowerCase()) !== -1}
                showAction={["click"]}
                onChange={onChange}
                onSelect={onSelect}
                onMouseDown={onMouseClick}
                onBlur={() => {
                    if (!isConfirmationVisible) onAccept();
                }}
                onKeyDown={(e) => {
                    if (e.keyCode === 13) {
                        onAccept();
                    }
                }}
                onDropdownVisibleChange={onDropdownVisibleTrigger}
                className={`${rightAlign && "Right_Align"}`}
                dropdownClassName="Calculate_Rows_Dropdown"
                {...props}
            />
        </Popconfirm>
    );
};

export default Autocomplete;
