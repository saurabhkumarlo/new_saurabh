import { Button, Radio, Space } from "antd";
import { ObjectsExportsOptions, RowsExportOptions } from "../../../../constants";
import React, { useEffect, useState } from "react";

import ClipboardButton from "react-clipboard.js";
import { ExportStore } from "../../../../stores";
import { Modal } from "../../../../components";
import { getOS } from "../../../../utils";
import { useTranslation } from "react-i18next";

const FileExport = ({ showFileExportModal, setShowFileExportModal }) => {
    const [exportOption, setExportOption] = useState(false);
    const [annotationsExportState, setAnnotationsExportState] = useState(ObjectsExportsOptions.Nothing_To_Export);
    const [annotationRowsExportState, setAnnotationRowsExportState] = useState(RowsExportOptions.Nothing_To_Export);

    const { t } = useTranslation();

    useEffect(() => {
        return () => {
            setExportOption(false);
            setAnnotationsExportState(ObjectsExportsOptions.Nothing_To_Export);
            setAnnotationRowsExportState(RowsExportOptions.Nothing_To_Export);
        };
    }, []);

    const cancelFileExportModal = () => {
        setExportOption(false);
        setAnnotationsExportState(ObjectsExportsOptions.Nothing_To_Export);
        setAnnotationRowsExportState(RowsExportOptions.Nothing_To_Export);
        setShowFileExportModal(false);
    };

    const exportToCSV = (exportAnnotations, exportAnnotationRows) => {
        const element = document.createElement("a");
        let filename = "";

        if (exportAnnotations && !exportAnnotationRows) {
            const exportData = ExportStore.exportAnnotationsToCsv(annotationsExportState);
            filename = exportData.getIn(["headlineData", "filename"]);

            element.setAttribute("href", "data:data/csv;charset=utf-8,%EF%BB%BF" + encodeURIComponent(exportData.getIn(["headlineData", "exportData"])));
        } else if (!exportAnnotations && exportAnnotationRows) {
            const exportData = ExportStore.exportCalcRowsToCSV(annotationRowsExportState);
            filename = exportData.getIn(["headlineData", "filename"]);

            element.setAttribute("href", "data:data/csv;charset=utf-8,%EF%BB%BF" + encodeURIComponent(exportData.getIn(["headlineData", "exportData"])));
        }

        element.setAttribute("download", filename + ".csv");
        element.style.display = "none";
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);

        setExportOption(false);
        setAnnotationsExportState(ObjectsExportsOptions.Nothing_To_Export);
        setAnnotationRowsExportState(RowsExportOptions.Nothing_To_Export);
        setShowFileExportModal(false);
    };

    const onChangeExportOption = (event) => {
        const value = event.target.value;
        switch (value) {
            case ObjectsExportsOptions.Nothing_To_Export:
            case ObjectsExportsOptions.Objects_Selection:
            case ObjectsExportsOptions.Objects_Net_Selection:
            case ObjectsExportsOptions.Objects_No_Folder_Net_Selection:
            case ObjectsExportsOptions.Folder_Export_Everything:
                setExportOption(value);
                setAnnotationsExportState(value);
                setAnnotationRowsExportState(RowsExportOptions.Nothing_To_Export);
                break;
            case RowsExportOptions.Nothing_To_Export:
            case RowsExportOptions.Rows_Selection:
            case RowsExportOptions.Rows_Sum_Per_Folder_Everything:
            case RowsExportOptions.Rows_Net_Selection:
            case RowsExportOptions.BidCon_Everything:
                setExportOption(value);
                setAnnotationRowsExportState(value);
                setAnnotationsExportState(ObjectsExportsOptions.Nothing_To_Export);
        }
    };

    const copyToClipboard = () => {
        if (annotationsExportState !== ObjectsExportsOptions.Nothing_To_Export && annotationRowsExportState === ObjectsExportsOptions.Nothing_To_Export) {
            return ExportStore.exportAnnotationsToClipboard(annotationsExportState).getIn(["headlineData", "exportData"]);
        } else if (
            annotationsExportState === ObjectsExportsOptions.Nothing_To_Export &&
            annotationRowsExportState !== ObjectsExportsOptions.Nothing_To_Export
        ) {
            return ExportStore.exportCalcRowsToClipboard(annotationRowsExportState).getIn(["headlineData", "exportData"]);
        } else if (
            annotationsExportState !== ObjectsExportsOptions.Nothing_To_Export &&
            annotationRowsExportState !== ObjectsExportsOptions.Nothing_To_Export
        ) {
            const annotationExport = ExportStore.exportAnnotationsToClipboard(annotationsExportState).getIn(["headlineData", "exportData"]);
            const annotationRowExport = ExportStore.exportCalcRowsToClipboard(annotationRowsExportState).getIn(["headlineData", "exportData"]);
            return annotationExport.concat("\n\n" + annotationRowExport);
        } else {
            return "Export Error";
        }
    };

    return (
        <Modal
            visible={showFileExportModal}
            title={t("GENERAL.EXPORT")}
            onCancel={cancelFileExportModal}
            width={428}
            activeButtons={
                <div>
                    <Button
                        type="secondary"
                        onClick={() => {
                            if (
                                annotationsExportState !== ObjectsExportsOptions.Nothing_To_Export &&
                                annotationRowsExportState !== RowsExportOptions.Nothing_To_Export
                            ) {
                                exportToCSV(true, false);
                                exportToCSV(false, true);
                            } else if (
                                annotationsExportState !== ObjectsExportsOptions.Nothing_To_Export &&
                                annotationRowsExportState === RowsExportOptions.Nothing_To_Export
                            ) {
                                exportToCSV(true, false);
                            } else if (
                                annotationsExportState === ObjectsExportsOptions.Nothing_To_Export &&
                                annotationRowsExportState !== RowsExportOptions.Nothing_To_Export
                            ) {
                                exportToCSV(false, true);
                            }
                        }}
                    >
                        {t("GENERAL.EXPORT_TO_CSV")}
                    </Button>
                    <ClipboardButton data-clipboard-text={copyToClipboard()} onSuccess={cancelFileExportModal} className="clipboard-btn">
                        <Button type="primary">{t("GENERAL.COPY_TO_CLIPBOARD")}</Button>
                    </ClipboardButton>
                </div>
            }
        >
            <Radio.Group onChange={onChangeExportOption} value={exportOption}>
                <Space direction="vertical">
                    <Radio value={ObjectsExportsOptions.Folder_Export_Everything}>{t("EXPORT.FOLDER_EXPORT_EVERYTHING")}</Radio>
                    <Radio value={ObjectsExportsOptions.Objects_Selection}>{t("EXPORT.OBJECTS_SELECTION")}</Radio>
                    <Radio value={ObjectsExportsOptions.Objects_Net_Selection}>{t("EXPORT.OBJECTS_NET_SELECTION")}</Radio>
                    <Radio value={ObjectsExportsOptions.Objects_No_Folder_Net_Selection}>{t("EXPORT.OBJECTS_NO_FOLDER_NET_SELECTION")}</Radio>
                    <Radio value={RowsExportOptions.Rows_Selection}>{t("EXPORT.ROWS_SELECTION")}</Radio>
                    <Radio value={RowsExportOptions.Rows_Net_Selection}>{t("EXPORT.ROWS_SUM_SELECTION")}</Radio>
                    <Radio value={RowsExportOptions.Rows_Sum_Per_Folder_Everything}>{t("EXPORT.ROWS_SUM_FOLDER_EVERYTHING")}</Radio>
                    <Radio value={RowsExportOptions.BidCon_Everything}>{t("EXPORT.BIDCON_EVERYTHING")}</Radio>
                </Space>
            </Radio.Group>
        </Modal>
    );
};

export default FileExport;
