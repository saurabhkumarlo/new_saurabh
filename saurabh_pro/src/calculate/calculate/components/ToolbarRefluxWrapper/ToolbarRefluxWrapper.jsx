import React from "react";
import { withTranslation } from "react-i18next";
import { withRouter } from "react-router";
import { AnnotationStore, FileStore, IfcStore, TreeStoreV2 } from "stores";
import Scales from "../Scales";
import SubmenuRefluxWrapper from "../SubmenuRefluxWrapper";
import BIMerToolbar from "../../../../components/BIMer/BIMerToolbar";
import { get } from "lodash";
import FileExport from "../FileExport";
import CalculateToolbar from "../CalculateToolbar";
import Filters from "../Filters";

class ToolbarRefluxWrapper extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            showFileExportModal: false,
            pageCount: -1,
            toolNode: "AnnotationEdit",
            checkedFilters: TreeStoreV2.getCheckedFilters(),
            popoverVisible: TreeStoreV2.getPopoverVisible(),
        };
    }

    componentDidMount() {
        this.unsubscribeAnnotationStore = AnnotationStore.listen(this.annotationStoreUpdated);
        this.unsubscribeIfcStore = IfcStore.listen(this.ifcStoreUpdated);
        this.unsubscribeTreeStore = TreeStoreV2.listen(this.treeStoreUpdated);
    }

    componentWillUnmount() {
        this.unsubscribeAnnotationStore();
        this.unsubscribeIfcStore();
        this.unsubscribeTreeStore();
    }

    annotationStoreUpdated = (message) => {
        const info = AnnotationStore.getWebViewerFileInformation();

        switch (message) {
            case "showFileExportModal":
                this.toggleShowFileExportModal(true);
                break;
            case "documentLoaded":
            case "folderInserted":
            case "AnnotationDeleted":
            case "annotationsInserted":
            case "AnnotationAdded":
                this.setState({ pageCount: info.get("pageCount") });
                break;
            case "pageRendered":
                this.setState({
                    pageCount: AnnotationStore.getWebViewerFileInformation().get("pageCount"),
                });
                break;
            case "toolChange":
                this.setState({ toolNode: AnnotationStore.getCurrentToolNode() });
                break;
            default:
                break;
        }
    };

    ifcStoreUpdated = (message) => {
        const info = AnnotationStore.getWebViewerFileInformation();

        switch (message) {
            case "ifcAnnotationsUpdated":
            case "ifcAnnotationInserted":
                this.setState({ pageCount: info.get("pageCount") });
                break;
            default:
                break;
        }
    };

    treeStoreUpdated = (message) => {
        switch (message) {
            case "checkedFiltersUpdated":
                this.setState({ checkedFilters: TreeStoreV2.getCheckedFilters() });
                break;
            case "popoverVisibleUpdated":
                this.setState({ popoverVisible: TreeStoreV2.getPopoverVisible() });
                break;
            default:
                break;
        }
    };

    toggleShowFileExportModal = (value) => {
        this.setState({ showFileExportModal: value });
    };

    toogleActiveToolNode = (tool) => {
        AnnotationStore.setToolMode(tool);
        this.setToolNode(tool);
    };

    setToolNode = (toolNode) => {
        this.setState({ toolNode });
        AnnotationStore.updateScaleTool();
    };

    render() {
        const fileId = parseInt(this.props.match.params.fileId, 10);
        const file = FileStore.getFileById(fileId);
        const fileType = get(file, "type");

        return (
            <div className="Toolbar Calculate_Wrapper_Toolbar">
                <Filters treeData={this.props.treeData} checkedFilters={this.state.checkedFilters} />
                {this.props.treeListLoaded && (
                    <>
                        {this.state.showFileExportModal && (
                            <FileExport showFileExportModal={this.state.showFileExportModal} setShowFileExportModal={this.toggleShowFileExportModal} />
                        )}
                        {fileType === "ifc" ? (
                            <BIMerToolbar viewerRef={this.props.viewerRef} toggleShowFileExportModal={this.toggleShowFileExportModal} />
                        ) : (
                            <CalculateToolbar
                                toogleActiveToolNode={this.toogleActiveToolNode}
                                toolNode={this.state.toolNode}
                                activePage={this.props.activePage}
                                setActivePage={this.props.setActivePage}
                                pageCount={this.state.pageCount}
                                toggleShowFileExportModal={this.toggleShowFileExportModal}
                                treeData={this.props.treeData}
                            />
                        )}
                        <div className="Calculate_Wrapper_Toolbar--right">
                            <Scales
                                activePage={this.props.activePage}
                                lengthX={this.props.lengthX}
                                lengthY={this.props.lengthY}
                                setToolMode={this.setToolNode}
                                setLengthX={this.props.setLengthX}
                                setLengthY={this.props.setLengthY}
                            />
                            <SubmenuRefluxWrapper
                                toggleRows={this.props.toggleRows}
                                isToggleRows={this.props.isToggleRows}
                                toggleProperties={this.props.toggleProperties}
                                isToggleProperties={this.props.isToggleProperties}
                                toggleDocument={this.props.toggleDocument}
                                isToggleDocument={this.props.isToggleDocument}
                                setTreeData={this.props.setTreeData}
                            />
                        </div>
                    </>
                )}
            </div>
        );
    }
}

export default withTranslation()(withRouter(ToolbarRefluxWrapper));
