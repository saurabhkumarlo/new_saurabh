import React from "react";
import { useTranslation } from "react-i18next";
import "./tooltip-message.less";

const TooltipMessage = ({ message, shortcut }) => {
    const { t } = useTranslation();

    return (
        <div className="Message">
            <label>{t(message)}</label>
            {shortcut && <label className="Message_Shortcut">{t(shortcut)}</label>}
        </div>
    );
};

export default TooltipMessage;
