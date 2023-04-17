import React, { useState, useEffect } from "react";
import { Popover, Button } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import "./closable-popover.less";

const ClosablePopover = ({ isActiveAnnotation, onVisibleChange, content, visible, clearFilters, mainStatusFilter, ...props }) => {
    const [isVisible, setIsVisible] = useState(visible);

    const handleClose = () => {
        clearFilters();
        setIsVisible(false);
    };

    useEffect(() => {
        if (!isActiveAnnotation && !mainStatusFilter) {
            handleClose();
        }
    }, [isActiveAnnotation]);

    const handleVisibleChange = (visibility) => {
        setIsVisible(visibility);
        onVisibleChange(visibility);
    };

    return (
        <Popover
            className="Popover"
            {...props}
            visible={isVisible}
            onVisibleChange={handleVisibleChange}
            content={
                isActiveAnnotation && (
                    <div>
                        {content}
                        <Button icon={<FontAwesomeIcon icon={["fal", "times"]} />} className="Popover_Icon_Button" onClick={handleClose} />
                    </div>
                )
            }
        />
    );
};

export default ClosablePopover;
