import React from "react";

import { useTranslation } from "react-i18next";
import { Input } from "antd";

import "./descriptionPane.less";

const DescriptionPane = ({ onChangeDescription, onChangeShortDescription, onBlur, role, shortDescription, description }) => {
    const { t } = useTranslation();
    return (
        <div className="DescriptionPane">
            <label>
                {t("GENERAL.DESCRIPTION")}
                <Input disabled={!role} value={shortDescription} onChange={onChangeShortDescription} onBlur={() => onBlur("shortDescription")} />
            </label>

            <label>
                {t("GENERAL.NOTES")}
                <Input.TextArea disabled={!role} rows={10} value={description} onChange={onChangeDescription} onBlur={() => onBlur("description")} />
            </label>
        </div>
    );
};

export default DescriptionPane;
