import React, { useEffect } from "react";
import { withRouter } from "react-router";

import { Empty, Row } from "antd";

import AnnotationStore from "../stores/AnnotationStore";
import FileStore from "../stores/FileStore";
import BIMerViewer from "../components/BIMer";
import { getModelFile } from "../utils";

const IfcPreview = ({ viewerRef, selectedNode, ...props }) => {
    useEffect(() => {
        const unsubscribeFileStore = FileStore.listen(fileStoreUpdated);
        const unsubscribeAnnotationStore = AnnotationStore.listen(annotationStoreUpdated);
        AnnotationStore.onSetActiveFileId(selectedNode.key);

        return () => {
            unsubscribeFileStore();
            unsubscribeAnnotationStore();
            FileStore.cleanup();
        };
    }, [selectedNode.key]);

    const annotationStoreUpdated = (message) => {
        if (message === "EstimateInitialized") {
            FileStore.loadAnnotations();
        }
    };

    const fileStoreUpdated = (message) => {
        switch (message) {
            case "filesUpdated":
                FileStore.reloadFileView(FileStore.getSelectedFiles());
                break;
            default:
                break;
        }
    };

    return selectedNode.status === "conversion_failed" ? (
        <Row justify="center" align="middle" className="Empty_Container">
            <Empty description={false} />
        </Row>
    ) : (
        <div style={{ height: "100vh" }}>
            <BIMerViewer modelUrl={getModelFile(selectedNode.key)} ref={viewerRef} />
        </div>
    );
};

export default withRouter(IfcPreview);
