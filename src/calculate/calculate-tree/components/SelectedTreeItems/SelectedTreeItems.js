import React from "react";

import { useTranslation } from "react-i18next";

import "./selectedTreeItems.less";

const SelectedTreeItems = ({ selectedKeys }) => {
    const { t } = useTranslation();

    return (
        <div className="SelectedTreeItems-wrapper">
            <span>{selectedKeys.length === 1 ? t("GENERAL.SELECTED_OBJECT", { count: selectedKeys.length }) : t("GENERAL.SELECTED_OBJECTS", { count: selectedKeys.length })}</span>
        </div>
    );
};

export default SelectedTreeItems;
