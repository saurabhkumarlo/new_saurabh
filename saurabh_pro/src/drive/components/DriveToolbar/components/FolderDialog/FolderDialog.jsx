import React, { useState } from "react";

import { Input } from "antd";
import { Modal } from "../../../../../components";
import { useTranslation } from "react-i18next";

const FolderDialog = ({ isOpen, onOk, onCancel }) => {
    const [name, setName] = useState("");
    const [shortDescription, setShortDescription] = useState("");
    const [description, setDescription] = useState("");

    const { t } = useTranslation();

    const resetState = () => {
        setName("");
        setShortDescription("");
        setDescription("");
    };

    const onModalOk = () => {
        if (onOk && name.trim().length) {
            onOk({
                name,
                shortDescription,
                description,
            });
        }

        resetState();
    };

    const onModalCancel = () => {
        resetState();

        if (onCancel) onCancel();
    };

    return (
        <Modal
            title={t("GENERAL.CREATE_FOLDER")}
            visible={isOpen}
            onOk={onModalOk}
            onCancel={onModalCancel}
            disabledOkButton={!name.trim().length}
            destroyOnClose
        >
            <label>
                {t("GENERAL.NAME")}
                <Input value={name} onChange={(e) => setName(e.target.value)} onPressEnter={onModalOk} autoFocus />
            </label>

            <label>
                {t("GENERAL.DESCRIPTION")}
                <Input value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} onPressEnter={onModalOk} />
            </label>

            <label>
                {t("GENERAL.NOTES")}
                <Input value={description} onChange={(e) => setDescription(e.target.value)} onPressEnter={onModalOk} />
            </label>
        </Modal>
    );
};

export default FolderDialog;
