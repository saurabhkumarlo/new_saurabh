import "./fileuploaddialog.less";

import { Input, Tooltip } from "antd";
import React, { useRef, useState } from "react";

import { FileStore } from "../../../../../stores";
import { InfoCircleOutlined } from "@ant-design/icons";
import { Modal } from "../../../../../components";
import { useTranslation } from "react-i18next";

const FileUploadDialog = ({ isOpen, onCancel, parentId }) => {
    const [name, setName] = useState("");
    const [extension, setExtension] = useState("");
    const [description, setDescription] = useState("");
    const [notes, setNotes] = useState("");
    const [file, setFile] = useState(null);

    const fileRef = useRef(null);

    const { t } = useTranslation();

    const resetState = () => {
        setName("");
        setExtension("");
        setDescription("");
        setNotes("");
        setFile(null);

        if (fileRef.current) {
            fileRef.current.setValue("");
        }
    };

    const onModalOk = () => {
        const finalName = `${name}.${extension}`;
        FileStore.uploadMultipleFiles([{ file, parentId, notes, description, name: finalName }]);
        resetState();
        onCancel();
    };

    const onModalCancel = () => {
        resetState();
        if (onCancel) onCancel();
    };

    const onFileChange = (e) => {
        const targetFile = e.target.files[0];

        setFile(targetFile);

        if (!targetFile) {
            setName("");
            setExtension("");
            return;
        }

        const splitFileName = targetFile.name.split(".");
        const splitName = splitFileName.slice(0, splitFileName.length - 1).join(".");
        const splitExtension = splitFileName[splitFileName.length - 1];
        setName(splitName);
        setExtension(splitExtension);
    };

    return (
        <Modal title={t("GENERAL.UPLOAD")} visible={isOpen} onOk={onModalOk} onCancel={onModalCancel} disabledOkButton={name === "" || file === null}>
            <label>
                {t("GENERAL.NAME")}
                <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={file === null || file === undefined}
                    addonAfter={`${extension ? `.${extension}` : ""}`}
                    className="driveFileNameAddOn"
                />
            </label>
            <Input
                type="file"
                onChange={onFileChange}
                ref={fileRef}
                suffix={
                    <Tooltip title="Eg. PDF, DOCX, PNG, XLSX">
                        <InfoCircleOutlined style={{ color: "rgba(0,0,0,.45)", fontSize: "18px" }} />
                    </Tooltip>
                }
                className="driveFileUploadSuffix"
            />
            <label>
                {t("GENERAL.DESCRIPTION")}
                <Input value={description} onChange={(e) => setDescription(e.target.value)} />
            </label>
            <label>
                {t("GENERAL.NOTES")}
                <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
            </label>
        </Modal>
    );
};

export default FileUploadDialog;
