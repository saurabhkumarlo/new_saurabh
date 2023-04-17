import React from "react";
import { useTranslation } from "react-i18next";

const TooltipDescription = ({ description }) => {
    const { t } = useTranslation();

    return (
        <div>
            <label>{t(description)}</label>
        </div>
    );
};

export default TooltipDescription;
