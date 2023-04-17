import { Button, Checkbox, Dropdown, Menu } from "antd";
import React, { useEffect, useState } from "react";

import _ from "lodash";
import { getFlatActiveLabels } from "../Labels.utils";
import { useTranslation } from "react-i18next";

const CheckboxDropdown = ({ label, activeData, data, onChange, isPreventEditing }) => {
    const [activeLabels, setActiveLabels] = useState(getFlatActiveLabels(activeData));
    const { t } = useTranslation();

    useEffect(() => {
        setActiveLabels(getFlatActiveLabels(activeData));
    }, [activeData]);

    const onChangeCheckbox = (e) => {
        onChange(e.target.checked, e.target.option);
    };

    const menu = (
        <Menu>
            <div className="ant-checkbox-group">
                {_.map(data, (option, index) => (
                    <Checkbox key={option + index} checked={_.includes(activeLabels, option)} option={option} onChange={onChangeCheckbox}>
                        {t(option)}
                    </Checkbox>
                ))}
            </div>
        </Menu>
    );

    return (
        <div className="properties-pane-item">
            <Dropdown overlay={menu} trigger={["click"]} disabled={isPreventEditing} overlayClassName="properties-pane-dropdown">
                <Button type="text">{label}</Button>
            </Dropdown>
        </div>
    );
};

export default CheckboxDropdown;
