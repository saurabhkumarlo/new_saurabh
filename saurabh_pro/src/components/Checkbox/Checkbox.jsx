import React from "react";
import { useTranslation } from "react-i18next";
import { Checkbox as AntdCheckbox } from "antd";

const Checkbox = ({ name, onChange, label, checked }) => {
    const { t } = useTranslation();

    return (
        <label>
            <AntdCheckbox name={name} onChange={onChange} checked={checked} /> {t(label)}
        </label>
    );
};

export default Checkbox;
