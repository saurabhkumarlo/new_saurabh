import React from "react";
import { notification } from "antd";
import { tooltips } from "./Tooltip.utils";
import { TooltipMessage, TooltipDescription } from "./components";
import "./tooltip.less";

var timer;

const openNotification = (type) => {
    const item = tooltips.find((item) => item.type === type);
    notification.open({
        message: <TooltipMessage message={item.title} shortcut={item.shortcut} />,
        description: <TooltipDescription description={item.description} />,
        placement: "bottomRight",
        duration: 0,
        className: "Tooltip",
    });
};

export const displayTooltip = (type) => {
    timer = setTimeout(() => {
        openNotification(type);
    }, 1250);
};

export const destroyTooltip = () => {
    clearTimeout(timer);
    notification.destroy();
};
