import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Dropdown, Tag, Tooltip } from "antd";
import { Modal, TemplatesDialog } from "components";
import { get } from "lodash";
import React from "react";
import { withTranslation } from "react-i18next";
import { withRouter } from "react-router";
import { AnnotationStore, AuthenticationStore, CalculationStore, FileStore, TreeStoreV2 } from "stores";
import Submenu from "../Submenu/Submenu";

class SubmenuRefluxWrapper extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            markersSize: localStorage.getItem("markersSize") || "medium",
            sideLabelsPosition: localStorage.getItem("sideLabelsPosition") || "follow",
            treeSorting: localStorage.getItem("annotationTreeSorting") || "type-number-name",
            toggleTreeFilter: localStorage.getItem("toggleTreeFilter") ? JSON.parse(localStorage.getItem("toggleTreeFilter")) : false,
            displayMode: null,
            snapMode: null,
            showSubmenu: false,
            toggleTemplateDialog: false,
            showFileExportToPDFModal: false,
            toggleSnapOn: null,
            rowColumnsVisibilty: CalculationStore.getRowColumnsVisibilty(),
        };
        this.role = AuthenticationStore.getRole();
        TreeStoreV2.setTreeFilter(this.state.toggleTreeFilter);
    }

    componentDidMount() {
        this.unsubscribeAnnotaiotnStore = AnnotationStore.listen(this.annotationStoreUpdated);
        this.unsubscribeTreeStore = TreeStoreV2.listen(this.treeStoreUpdated);
        this.unsubscribeCalculationStore = CalculationStore.listen(this.calculationStoreUpdated);
    }

    componentWillUnmount() {
        this.unsubscribeAnnotaiotnStore();
        this.unsubscribeTreeStore();
        this.unsubscribeCalculationStore();
    }

    annotationStoreUpdated = (message) => {
        switch (message) {
            case "toggleRows":
                this.toggleRows();
                break;
            case "annotationSelected":
            case "annotationSelectedFromGui":
            case "annotationDeSelectedFromGui":
                this.setState({
                    allKeysSelected: TreeStoreV2.isSelectAll(),
                });
                break;
            case "displayModeUpdated":
                this.setState({ displayMode: AnnotationStore.getDisplayMode() });
                break;
            case "snapModeUpdated":
                this.setState({
                    snapMode: AnnotationStore.getSnapMode(),
                });
                break;
            case "closeSubMenu":
                if (!this.state.showSubmenu) return;
                this.setState({
                    showSubmenu: false,
                });
                break;
            case "toggleSnapon":
                localStorage.setItem("toggleSnapOn", AnnotationStore.getSnaponEnabled());
                this.setState({
                    toggleSnapOn: AnnotationStore.isSnaponEnabled(),
                });
                break;
            default:
                break;
        }
    };

    treeStoreUpdated = (message) => {
        switch (message) {
            case "toggleTreeFilter":
                localStorage.setItem("toggleTreeFilter", TreeStoreV2.getTreeFilter());
                const result = TreeStoreV2.buildTree();
                this.setState({
                    toggleTreeFilter: TreeStoreV2.getTreeFilter(),
                });
                this.props.setTreeData(result.treeData);
                break;
            default:
                break;
        }
    };

    calculationStoreUpdated = (message) => {
        switch (message) {
            case "rowColumnsVisibiltyUpdated":
                this.setState({ rowColumnsVisibilty: CalculationStore.getRowColumnsVisibilty() });
                break;
            default:
                break;
        }
    };

    expandAll = () => {
        AnnotationStore.expandAll();
        this.setState({
            allKeysExpanded: true,
        });
    };

    collapseAll = () => {
        TreeStoreV2.setTreeExpansion([]);
        this.setState({
            allKeysExpanded: false,
        });
    };

    changeMarkersSize = (e) => {
        localStorage.setItem("markersSize", e.target.value);
        this.setState({
            markersSize: e.target.value,
        });
        AnnotationStore.reloadWebViewer();
    };

    changeSideLabelsPosition = (e) => {
        localStorage.setItem("sideLabelsPosition", e.target.value);
        this.setState({
            sideLabelsPosition: e.target.value,
        });
        AnnotationStore.reloadWebViewer();
    };

    switchShowSubmenu = (value) => {
        this.setState({
            showSubmenu: value,
        });
    };

    changeTreeSorting = (e) => {
        localStorage.setItem("annotationTreeSorting", e.target.value);
        const result = TreeStoreV2.buildTree();
        this.setState({
            treeSorting: e.target.value,
        });
        this.props.setTreeData(result.treeData);
    };

    onToggleTemplateDialog = () => {
        this.setState({
            toggleTemplateDialog: true,
            showSubmenu: false,
        });
    };

    onCancelTemplateDialog = () => this.setState({ toggleTemplateDialog: false });

    onAcceptTemplateDialog = () => this.setState({ toggleTemplateDialog: false });

    onToggleFileExportToPDFModal = (value) => {
        if (value) this.setState({ showFileExportToPDFModal: true, showSubmenu: false });
        else this.setState({ showFileExportToPDFModal: false });
    };

    onSaveDocumentToPdf = () => {
        AnnotationStore.saveDocumentToPdf();
        this.onToggleFileExportToPDFModal(false);
    };

    onCancelSaveDocumentToPdf = () => this.onToggleFileExportToPDFModal(false);

    toggleSnapOn = () => {
        AnnotationStore.toggleSnapon1();
    };

    toggleTreeFilter = () => {
        TreeStoreV2.clearSelectedAnnotations();
        TreeStoreV2.toggleTreeFilter();
    };

    changeRowColumnsVisibiltyHandler = (e) => {
        localStorage.setItem("rowColumnsVisibility", JSON.stringify(e));
        CalculationStore.setRowColumnsVisibilty(e);
    };

    render() {
        const fileId = parseInt(this.props.match.params.fileId, 10);
        const file = FileStore.getFileById(fileId);
        const fileType = get(file, "type");

        return (
            <>
                {this.state.toggleTemplateDialog && (
                    <TemplatesDialog
                        visible={this.state.toggleTemplateDialog}
                        onCancel={this.onCancelTemplateDialog}
                        onAccept={this.onAcceptTemplateDialog}
                        title={this.props.t("GENERAL.TEMPLATES")}
                        type="calculate"
                    />
                )}
                {this.state.showFileExportToPDFModal && (
                    <Modal
                        visible={this.state.showFileExportToPDFModal}
                        title={this.props.t("ESTIMATE.EXPORT_PDF")}
                        onOk={this.onSaveDocumentToPdf}
                        onCancel={this.onCancelSaveDocumentToPdf}
                        submitButtonTitle={this.props.t("GENERAL.EXPORT")}
                    >
                        {this.props.t("ESTIMATE.MESSAGE.EXPORT_PDF")}
                    </Modal>
                )}
                <Tooltip
                    placement="bottom"
                    title={
                        <span>
                            {this.props.t("GENERAL.TOOLTIP.FILTER")}
                            <br />
                            <br />
                            <Tag>Ctrl + Shift + F</Tag>
                        </span>
                    }
                >
                    <Button
                        icon={<FontAwesomeIcon icon={["fal", "eye"]} />}
                        onClick={this.toggleTreeFilter}
                        className={this.state.toggleTreeFilter ? "Toolbar_Button--active" : null}
                    />
                </Tooltip>
                {fileType !== "ifc" && (
                    <Tooltip
                        placement="bottom"
                        title={
                            <span>
                                {this.props.t("GENERAL.TOOLTIP.SNAP_ON")}
                                <br />
                                <br />
                                <Tag>Ctrl + G</Tag>
                            </span>
                        }
                    >
                        <Button
                            disabled={!this.role}
                            icon={<FontAwesomeIcon icon={["fal", "magnet"]} />}
                            className={this.state.toggleSnapOn ? "Toolbar_Button--active" : null}
                            onClick={this.toggleSnapOn}
                        />
                    </Tooltip>
                )}
                <Dropdown
                    overlay={
                        <Submenu
                            toggleRows={this.props.toggleRows}
                            isToggleRows={this.props.isToggleRows}
                            toggleProperties={this.props.toggleProperties}
                            isToggleProperties={this.props.isToggleProperties}
                            toggleDocument={this.props.toggleDocument}
                            isToggleDocument={this.props.isToggleDocument}
                            allKeysSelected={this.state.allKeysSelected}
                            collapseAll={this.collapseAll}
                            expandAll={this.expandAll}
                            allKeysExpanded={this.state.allKeysExpanded}
                            changeTreeSorting={this.changeTreeSorting}
                            markersSize={this.state.markersSize}
                            changeMarkersSize={this.changeMarkersSize}
                            sideLabelsPosition={this.state.sideLabelsPosition}
                            changeSideLabelsPosition={this.changeSideLabelsPosition}
                            treeSorting={this.state.treeSorting}
                            displayMode={this.state.displayMode}
                            snapMode={this.state.snapMode}
                            toggleTemplateDialog={this.onToggleTemplateDialog}
                            switchShowSubmenu={this.switchShowSubmenu}
                            onChangeRowColumnsVisibilty={this.changeRowColumnsVisibiltyHandler}
                            rowColumnsVisibilty={this.state.rowColumnsVisibilty}
                            showFileExportToPDFModal={() => this.onToggleFileExportToPDFModal(true)}
                        />
                    }
                    trigger={["click"]}
                    visible={this.state.showSubmenu}
                    onVisibleChange={this.switchShowSubmenu}
                >
                    <Button icon={<FontAwesomeIcon icon={["fal", "ellipsis-v-alt"]} />} />
                </Dropdown>
            </>
        );
    }
}

export default withTranslation()(withRouter(SubmenuRefluxWrapper));
