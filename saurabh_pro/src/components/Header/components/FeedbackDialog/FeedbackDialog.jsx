import { Modal } from "../../..";
import React from "react";
import { useTranslation } from "react-i18next";

const FeedbackDialog = ({ visible, onCancel }) => {
    const { t } = useTranslation();

    return (
        <Modal title={t("GENERAL.FEEDBACK")} visible={visible} onCancel={onCancel} closable width={600} footer={null}>
            <iframe
                src="https://app.startinfinity.com/form/39d11feb-115e-47bc-9f40-d7f5f7c62435"
                id="Feedback_Iframe"
                title="Feedback"
                height="715"
                className="Feedback_Iframe"
            ></iframe>
        </Modal>
    );
};

export default FeedbackDialog;
