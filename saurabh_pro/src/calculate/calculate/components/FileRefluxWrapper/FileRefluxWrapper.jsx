import CalculateTreeIFC from "calculate/calculate-tree-IFC";
import CalculatePdf from "calculate/calculatePdf";
import { get } from "lodash";
import React from "react";
import { withTranslation } from "react-i18next";
import { withRouter } from "react-router";
import SplitPane from "react-split-pane";
import { AnnotationStore, AuthenticationStore, FileStore, IfcStore } from "stores";
import { getModelFile } from "utils";
import BIMerViewer from "../../../../components/BIMer";
import LinkModal from "../LinkModal";

class FileRefluxWrapper extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            modelStructureTree: {},
            selectedIfcKeys: [],
            showLinkingModal: false,
        };
        this.role = AuthenticationStore.getRole();
    }

    componentDidMount() {
        this.unsubscribeAnnotationStore = AnnotationStore.listen(this.annotationStoreUpdated);
        this.unsubscribeIfcStore = IfcStore.listen(this.ifcStoreUpdated);
    }

    componentWillUnmount() {
        this.unsubscribeAnnotationStore();
    }

    annotationStoreUpdated = (message) => {
        switch (message) {
            default:
                break;
        }
    };

    ifcStoreUpdated = (message) => {
        switch (message) {
            case "modelStructureTreeBuilded":
                const ifcModelTreeData = IfcStore.getModelStructureTree();
                this.setState({ modelStructureTree: ifcModelTreeData });
                break;
            case "updateIfcTree":
                this.setState({ selectedIfcKeys: IfcStore.getSelectedKeys() });
                break;
            default:
                break;
        }
    };

    toggleIfcModal = (isVisible) => {
        this.setState({ showLinkingModal: isVisible });
    };

    render() {
        const projectId = parseInt(this.props.match.params.projectId, 10);
        const fileId = parseInt(this.props.match.params.fileId, 10);
        const file = FileStore.getFileById(fileId);
        const fileType = get(file, "type");

        return (
            <>
                {this.state.showLinkingModal && (
                    <LinkModal visible={this.state.showLinkingModal} close={() => this.setState({ showLinkingModal: false })} isResize={this.props.isResize} />
                )}
                {fileType === "ifc" ? (
                    <SplitPane
                        split="vertical"
                        defaultSize={
                            localStorage.getItem("calculateSplitModelStructureTreeLeft") === null
                                ? "200px"
                                : parseInt(localStorage.getItem("calculateSplitModelStructureTreeLeft"), 10)
                        }
                        onChange={(size) => localStorage.setItem("calculateSplitModelStructureTreeLeft", size)}
                        pane1Style={{ overflow: "auto", minWidth: "50px", minHeight: "50px" }}
                    >
                        <CalculateTreeIFC
                            treeData={this.state.modelStructureTree}
                            openLinkingModal={() => this.toggleIfcModal(true)}
                            selectedKeys={this.state.selectedIfcKeys}
                        />
                        <BIMerViewer
                            modelUrl={getModelFile(fileId)}
                            ref={this.props.viewerRef}
                            projectId={projectId}
                            fileId={fileId}
                            tree={this.state.modelStructureTree}
                            openLinkingModal={() => this.toggleIfcModal(true)}
                            isActiveCalculate
                        />
                    </SplitPane>
                ) : (
                    <>
                        {this.props.treeListLoaded && (
                            <CalculatePdf
                                activePage={this.props.activePage}
                                projectId={projectId}
                                fileId={fileId}
                                role={this.role}
                                isResize={this.props.isResize}
                            />
                        )}
                    </>
                )}
            </>
        );
    }
}

export default withTranslation()(withRouter(FileRefluxWrapper));
