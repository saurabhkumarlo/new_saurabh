import React from "react";

import { withRouter } from "react-router";
import { EstimateStore } from "stores";

import AnnotationStore from "../../../stores/AnnotationStore";
import FileStore from "../../../stores/FileStore";

import "./pdf-viewer.less";

class PdfPreview extends React.PureComponent {
    componentDidMount() {
        this.unsubscribeFileStore = FileStore.listen(this.fileStoreUpdated);
        this.unsubscribeAnnotationStore = AnnotationStore.listen(this.annotationStoreUpdated);
        this.unsubscribeEstimateStore = EstimateStore.listen(this.estimateStoreUpdated);

        FileStore.cleanup();
        FileStore.initWebViewer(document.getElementById("previewViewer"), false);
        FileStore.reloadFileView(FileStore.getSelectedFiles());
        FileStore.loadAnnotations();
        AnnotationStore.onSetActiveFileId(this.props.selectedNode.key);
    }

    componentWillUnmount() {
        this.unsubscribeFileStore();
        this.unsubscribeAnnotationStore();
        this.unsubscribeEstimateStore();
        FileStore.cleanup();
    }

    annotationStoreUpdated = (message) => {
        switch (message) {
            case "EstimateInitialized":
            case "AnnotationUpdated":
            case "AnnotationDeleted":
            case "annotationsInserted":
            case "AnnotationAdded":
                EstimateStore.updateAnnotationsInDrive(AnnotationStore.getAnnotations());
                break;
            case "EstimateInitialized":
                FileStore.loadAnnotations();
                break;
            default:
                break;
        }
    };

    estimateStoreUpdated = (message) => {
        if (message === "annotationsUpdated") {
            FileStore.loadAnnotations();
        }
    };

    fileStoreUpdated = (message) => {
        switch (message) {
            case "filesUpdated":
                FileStore.reloadFileView(FileStore.getSelectedFiles());
                break;
            case "documentLoaded":
                this.props.onUpdatePage(FileStore.webViewer.getCurrentPageNumber(), FileStore.webViewer.getPageCount());
                break;
            case "pageRendered":
                this.props.onUpdatePage(FileStore.webViewer.getCurrentPageNumber(), FileStore.webViewer.getPageCount());
                break;
            default:
                break;
        }
    };

    render() {
        return (
            <div className="PdfWiever_Container">
                <div className="WebViewer_Hide_Element" style={{ visibility: this.props.isResize ? "visible" : "hidden" }} />
                <div className="PdfWiever" id="previewViewer"></div>
            </div>
        );
    }
}

export default withRouter(PdfPreview);
