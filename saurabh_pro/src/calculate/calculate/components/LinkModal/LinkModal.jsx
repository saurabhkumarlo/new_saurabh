import { Button, Modal } from "antd";

import { IfcStore } from "../../../../stores";
import React from "react";
import { useTranslation } from "react-i18next";

const LinkModal = ({ close, visible }) => {
    const { t } = useTranslation();

    return (
        <Modal
            title={t("BIMER.CONNECT_OBJECT")}
            visible={visible}
            onCancel={() => close()}
            footer={[
                <Button
                    onClick={() => {
                        close();
                    }}
                >
                    {t("GENERAL.CANCEL")}
                </Button>,
                <Button
                    type="primary"
                    onClick={() => {
                        IfcStore.linkNormalisedObject();
                        close();
                    }}
                >
                    {t("BIMER.CONNECT_OBJECT")}
                </Button>,
            ]}
        >
            <div>
                <label>{t("BIMER.MESSAGE.CONNECT_OBJECT")}</label>
            </div>
        </Modal>
    );
};

export default LinkModal;
