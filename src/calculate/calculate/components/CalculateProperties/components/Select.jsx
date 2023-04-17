import React, { useEffect, useState } from "react";
import { Select as AntSelect } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import _ from "lodash";
import { useTranslation } from "react-i18next";

const { Option } = AntSelect;

const Select = ({ value, obj, label, data, onUpdate, icon = false, iconComponent = false, mode = false, ...rest }) => {
    const { t } = useTranslation();
    const [currentValue, setCurrentValue] = useState();

    useEffect(() => {
        if (mode && !value) setCurrentValue([]);
        else {
            if (obj === "style" && (value === "undefined" || !value)) setCurrentValue("solid");
            else setCurrentValue(value);
        }
    }, [value]);

    const onAccept = (value) => {
        onUpdate(value, obj);
    };

    return (
        <div className="properties-pane-item">
            <label>{t(label)}</label>
            <AntSelect
                value={currentValue}
                onChange={onAccept}
                suffixIcon={<FontAwesomeIcon icon={["fal", "caret-down"]} />}
                dropdownClassName="properties-pane-select-dropdown"
                mode={mode}
                {...rest}
            >
                {_.map(data, (option) => (
                    <Option key={option.value} value={option.value}>
                        {iconComponent ? (
                            <div>
                                <option.StatusIcon /> <span>{t(option.label)}</span>
                            </div>
                        ) : icon ? (
                            option.iconName ? (
                                <img src={option.iconName} alt={option.value} className={`${option.rotated ? "rotated-icon" : ""}`} />
                            ) : (
                                <span>-</span>
                            )
                        ) : obj === "font" || obj === "textFont" ? (
                            <div style={{ fontFamily: option.label }}>{t(option.label)}</div>
                        ) : (
                            t(option.label)
                        )}
                    </Option>
                ))}
            </AntSelect>
        </div>
    );
};

export default Select;
