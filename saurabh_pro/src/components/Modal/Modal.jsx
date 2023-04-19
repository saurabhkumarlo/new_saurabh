import "./modal.less";

import { Modal as AntModal, Button, Divider } from "antd";
import React, { useEffect } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";

const Modal = ({ children, title, submitButtonTitle, onOk, onCancel, activeButtons, className, disabledOkButton, closable, onPressEnter, ...props }) => {
    const { t } = useTranslation();

    useEffect(() => {
        document.addEventListener("keydown", onPressKey, true);

        return () => document.removeEventListener("keydown", onPressKey, true);
    }, []);

    const onPressKey = (event) => {
        if (event.key === "Enter" && onPressEnter) onPressEnter();
    };

    return (
        <AntModal
            onOk={onOk}
            onCancel={onCancel}
            title={title}
            centered
            closable={closable === true}
            closeIcon={<FontAwesomeIcon icon={["fal", "times"]} />}
            footer={[
                onCancel ? (
                    <Button onClick={onCancel} type="text" key="onCancelModal">
                        {t("GENERAL.CANCEL")}
                    </Button>
                ) : (
                    <div />
                ),
                activeButtons ? (
                    activeButtons
                ) : (
                    <Button type="primary" key="onOKModal" onClick={onOk} disabled={disabledOkButton}>
                        {t(submitButtonTitle ? submitButtonTitle : "GENERAL.OK")}
                    </Button>
                ),
            ]}
            {...props}
            className={`Modal_Wrapper ${className && className}`}
        >
            {title && children && <Divider />}
            {children}
        </AntModal>
    );
};

export default Modal;
