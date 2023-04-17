import { Button, Modal } from "antd";

import { FileStore } from "../../stores";
import React from "react";
import { useTranslation } from "react-i18next";

const ImportAnnotationsInPdfModal = ({ close, isOpen }) => {
    const filename = FileStore.getUploadedPdfFile().name;
    const nrAnnotations = FileStore.getDetectedAnnotationsLength();

    const { t } = useTranslation();

    return (
        <Modal
            title={t("DRIVE.OBJECTS_FOUND_IN_PDF")}
            visible={isOpen}
            closable={false}
            footer={[
                <Button
                    key="cancel"
                    onClick={() => {
                        FileStore.onCancelUploadMultiplePdfFile();
                        close();
                    }}
                >
                    {t("GENERAL.CANCEL")}
                </Button>,
                <Button
                    key="fileOnly"
                    type="primary"
                    onClick={() => {
                        FileStore.uploadPdfFileWithAnnotations(false);
                        close();
                    }}
                >
                    {t("DRIVE.FILE_ONLY")}
                </Button>,
                <Button
                    key="fileAndAnnotations"
                    type="primary"
                    onClick={() => {
                        FileStore.uploadPdfFileWithAnnotations(true);
                        close();
                    }}
                >
                    {t("DRIVE.FILE_AND_OBJECTS")}
                </Button>,
            ]}
        >
            <div>
                <label key={"file"}>{`${t("Filename:")} ${filename}`}</label>
            </div>
            <div>
                <label key={"annotations"}>{`${t("Annotations:")} ${nrAnnotations} ${t("annotations were found in the file")}`}</label>
            </div>
        </Modal>
    );
};

export default ImportAnnotationsInPdfModal;
