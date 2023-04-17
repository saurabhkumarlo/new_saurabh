import React from "react";

import { Empty, Row } from "antd";

import { FolderPreview, PdfPreview } from "../";
import IfcPreview from "../../IfcPreview";

import "./drive-preview.less";

const DrivePreview = ({
    selectedNode,
    onDriveTreeSelect,
    selectionByClick,
    onBack,
    onOpenInCalculate,
    onDownloadFile,
    onOpenFolder,
    onDeleteFile,
    onDeleteFolder,
    checkedItems,
    setCheckedItems,
    treeData,
    onMoveFile,
    onUpdatePage,
    viewerRef,
    multipleFilesLoader,
    isResize,
}) => {
    if (selectedNode) {
        switch (selectedNode.type) {
            case "folder":
                return (
                    <FolderPreview
                        selectedNode={selectedNode}
                        onDriveTreeSelect={onDriveTreeSelect}
                        selectionByClick={selectionByClick}
                        onBack={onBack}
                        onOpenInCalculate={onOpenInCalculate}
                        onDownloadFile={onDownloadFile}
                        onOpenFolder={onOpenFolder}
                        onDeleteFile={onDeleteFile}
                        onDeleteFolder={onDeleteFolder}
                        checkedItems={checkedItems}
                        setCheckedItems={setCheckedItems}
                        treeData={treeData}
                        onMoveFile={onMoveFile}
                        multipleFilesLoader={multipleFilesLoader}
                    />
                );
            case "file-ppt":
            case "file-pdf":
            case "file-gif":
            case "file-image":
            case "file-jpg":
            case "file-docx":
            case "file-xlsx":
            case "doc":
            case "docx":
            case "xls":
            case "xlsx":
            case "ppt":
            case "pptx":
            case "jpg":
            case "png":
            case "svg":
            case "pdf":
                return <PdfPreview selectedNode={selectedNode} onBack={onBack} onUpdatePage={onUpdatePage} isResize={isResize} />;
            case "file-ifc":
            case "ifc":
                return <IfcPreview selectedNode={selectedNode} onBack={onBack} viewerRef={viewerRef} />;
            default:
                return (
                    <Row justify="center" align="middle" className="Empty_Container">
                        <Empty description={false} />
                    </Row>
                );
        }
    } else {
        return null;
    }
};

export default DrivePreview;
