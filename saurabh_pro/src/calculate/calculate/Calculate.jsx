import "./calculate.less";

import { ANNOT_TYPES } from "../../constants";
import {
    AnnotationStore,
    AuthenticationStore,
    CalculationStore,
    EstimateStore,
    FileStore,
    HeaderStore,
    IfcStore,
    ObjectsStore,
    ProjectsStore,
    ScaleStore,
    TreeStoreV2,
} from "../../stores";
import { Spin } from "antd";
import { CalculateProperties, DuplicateModal, FileRefluxWrapper, MoveModal, ToolbarRefluxWrapper } from "./components";
import { Header, Modal, destroyTooltip } from "../../components";
import { X_SCALE_NAME, Y_SCALE_NAME } from "../../constants/ScaleConstants";
import { areBothScalesSet, getCurrentlySelectedScale } from "../../utils/scaleUtilMethods";
import { get, isNumber } from "lodash";

import AnnotationActions from "../../actions/AnnotationActions";
import CalculateRows from "../calculate-rows/CalculateRows";
import CalculateTree from "../calculate-tree/CalculateTree";
import FileActions from "../../actions/FileActions";
import Immutable from "immutable";
import React from "react";
import Sidebar from "../../sidebar/Sidebar";
import SplitPane from "react-split-pane";
import ensureLogin from "../../util/EnsureLogin";
import { getModelFile } from "../../utils";
import { handleCalculateKeyDown } from "utils/hotkeys/CalculateHotkeys";
import { withRouter } from "react-router";
import { withTranslation } from "react-i18next";

class Calculate extends React.PureComponent {
    constructor(props) {
        super(props);
        this.viewerRef = React.createRef();
        this.treeRef = React.createRef();
        this.isFileChanged = React.createRef();
        const projectId = parseInt(this.props.match.params.projectId, 10);
        const selectedKeys = isNumber(JSON.parse(localStorage.getItem(`selectedAnnotation_${this.props.match.params.projectId}`))?.key)
            ? [JSON.parse(localStorage.getItem(`selectedAnnotation_${this.props.match.params.projectId}`))?.key]
            : [];
        const expandedKeys = localStorage.getItem(`expandedKeys_${projectId}`)
            ? new Set(JSON.parse(localStorage.getItem(`expandedKeys_${projectId}`)))
            : new Set();
        this.state = {
            toggleRows: localStorage.getItem("toggleRows") ^ true,
            toggleProperties: localStorage.getItem("toggleProperties") ^ true,
            toggleDocument: localStorage.getItem("toggleDocument") ^ true,
            selectedAnnotations: [],
            treeData: [],
            selectedKeys,
            duplicateAnnotsModal: {
                duplicatingAnnots: false,
                annotsToDuplicate: 0,
                annotsDuplicated: 0,
                showMoreDetails: false,
                updatingUI: false,
                userId: null,
            },
            expandedKeys,
            activePage: -1,
            hasSetInitialPage: false,
            isResize: false,
            treeListLoaded: false,
            showStampTooHeavyDialog: false,
            showMoveModal: false,
            preventEditingAnnotatationList: new Immutable.List(),
            fetchingDataLoader: false,
        };
    }

    componentDidMount() {
        this.isFileChanged.current = false;
        this.checkIfDataIsFetching();
        TreeStoreV2.setTreeRef(this.treeRef);
        document.addEventListener("keydown", handleCalculateKeyDown);
        this.unsubscribeAnnotaiotnStore = AnnotationStore.listen(this.annotationStoreUpdated);
        this.unsubscribeTreeStore = TreeStoreV2.listen(this.treeStoreUpdated);
        this.unsubscribeHeaderStore = HeaderStore.listen(this.headerStoreUpdated);
        this.unsubscribeCalculationStore = CalculationStore.listen(this.calculationStoreUpdated);
        this.unsubscribeFileStore = FileStore.listen(this.fileStoreUpdated);
        this.unsubscribeIfcStore = IfcStore.listen(this.ifcStoreUpdated);

        const projectId = parseInt(this.props.match.params.projectId, 10);

        ProjectsStore.setActiveProjectId(projectId);

        if (FileStore.treeList.length === 0) {
            FileActions.requestGetFiles(projectId);
        }

        if (ProjectsStore.getProjectRows().length === 0) {
            const token = AuthenticationStore.getJwt();
            ProjectsStore.fetchProjects(token);
        }

        // If we don't have any selected file nodes, we set it to be the file ID from the URL for later handling in drive
        if (!FileStore.selectedFileNodes[0]) {
            const fileId = parseInt(this.props.match.params.fileId, 10);

            FileActions.setSelectedFileNodes([fileId]);
        }
        const treeList = FileStore.getTreeList();
        if (treeList.length !== 0) this.setState({ treeListLoaded: true });
        if (this.isIfcFileOpened(true)) IfcStore.fetchIfcModelStructureData(getModelFile(parseInt(this.props.match.params.fileId, 10)));
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", handleCalculateKeyDown);
        this.unsubscribeAnnotaiotnStore();
        this.unsubscribeTreeStore();
        this.unsubscribeHeaderStore();
        this.unsubscribeFileStore();
        this.unsubscribeCalculationStore();
        this.unsubscribeIfcStore();
        TreeStoreV2.setTreeRef(undefined);
        TreeStoreV2.clearSelectedAnnotations();
        destroyTooltip();
        this.isFileChanged.current = false;
    }

    componentDidUpdate(_, prevState) {
        const {
            duplicatingAnnots,
            annotsDuplicated,
            annotsToDuplicate,
            updatingUI: updatingCalculate,
            userId: annotActionUserId,
        } = this.state.duplicateAnnotsModal;
        if (annotsDuplicated === annotsToDuplicate && annotsToDuplicate !== 0 && !updatingCalculate)
            this.setState({
                duplicateAnnotsModal: {
                    updatingUI: true,
                    annotsDuplicated,
                    annotsToDuplicate,
                    duplicatingAnnots,
                    userId: annotActionUserId,
                },
            });
        if (prevState.activePage !== this.state.activePage) {
            ScaleStore.getScale(X_SCALE_NAME, this.state.activePage);
            ScaleStore.getScale(Y_SCALE_NAME, this.state.activePage);
            this.setState({ lengthX: ScaleStore.getLength(X_SCALE_NAME), lengthY: ScaleStore.getLength(Y_SCALE_NAME) });
        }
    }

    fileStoreUpdated = (message, fileId) => {
        switch (message) {
            case "openFile":
                this.props.history.push("/projects/" + this.props.match.params.projectId + "/calculate/" + fileId);
                break;
            case "treeListUpdated":
                if (this.isIfcFileOpened(true)) IfcStore.fetchIfcModelStructureData(getModelFile(parseInt(this.props.match.params.fileId, 10)));
                this.setState({ treeListLoaded: true });
                break;
            default:
                break;
        }
    };

    checkIfDataIsFetching = () => {
        const fetchingState = AnnotationStore.getFetchingDataLoader();
        this.setState({
            fetchingDataLoader: fetchingState,
        });
    };

    toggleRows = () => {
        this.setState({
            toggleRows: !this.state.toggleRows,
        });
        localStorage.setItem("toggleRows", this.state.toggleRows);
    };

    toggleProperties = () => {
        this.setState({
            toggleProperties: !this.state.toggleProperties,
        });
        localStorage.setItem("toggleProperties", this.state.toggleProperties);
    };

    toggleDocument = () => {
        this.setState({
            toggleDocument: !this.state.toggleDocument,
        });
        localStorage.setItem("toggleDocument", this.state.toggleDocument);
    };

    setScalesValuesOnUpdate = () => {
        if (getCurrentlySelectedScale() === Y_SCALE_NAME) {
            this.setState({
                lengthY: ScaleStore.getLength(Y_SCALE_NAME),
            });
        } else if (getCurrentlySelectedScale() === X_SCALE_NAME) {
            this.setState({
                lengthX: ScaleStore.getLength(X_SCALE_NAME),
            });
        }
    };

    setDefaultScalesValues = () => {
        if (!this.state.lengthX) {
            this.setState({
                lengthX: ScaleStore.getLength(X_SCALE_NAME),
            });
        }

        if (!this.state.lengthY) {
            this.setState({
                lengthY: ScaleStore.getLength(Y_SCALE_NAME),
            });
        }
    };

    annotationStoreUpdated = (message) => {
        switch (message) {
            case "showStampTooHeavyDialog":
                this.setState({ showStampTooHeavyDialog: true });
                break;
            case "documentLoaded":
                const info = AnnotationStore.getWebViewerFileInformation();

                let activePage = info.get("activePage");
                if (window.location.hash !== "") {
                    activePage = parseInt(window.location.hash.replace("#", ""), 10);
                    AnnotationActions.setActivePageId(activePage, true);
                }

                if (!this.isFileChanged.current) {
                    const result = TreeStoreV2.buildTree([...this.state.expandedKeys]);
                    this.setState({
                        treeData: result.treeData,
                    });
                }
                this.isFileChanged.current = false;

                this.setState({
                    activePage,
                    hasSetInitialPage: true,
                    selectedKeys: isNumber(JSON.parse(localStorage.getItem(`selectedAnnotation_${this.props.match.params.projectId}`))?.key)
                        ? [JSON.parse(localStorage.getItem(`selectedAnnotation_${this.props.match.params.projectId}`))?.key]
                        : [],
                });

                this.setDefaultScalesValues();
                AnnotationStore.setIsAltKeyEnabledForScale(!areBothScalesSet(this.state.activePage));
                AnnotationStore.jumpToAnnotation(JSON.parse(localStorage.getItem(`selectedAnnotation_${this.props.match.params.projectId}`))?.annotId, true);
                break;
            case "folderInserted": {
                try {
                    const info = AnnotationStore.getWebViewerFileInformation();
                    const result = TreeStoreV2.buildTree([...this.state.expandedKeys]);
                    const { selectionList, selectionKeys } = ObjectsStore.getSelectionList();
                    this.setState(
                        {
                            treeData: result.treeData,
                            expandedKeys: new Set(result.expandedKeys),
                            selectedAnnotations: selectionList,
                            activePage: info.get("activePage"),
                            selectedKeys: selectionKeys,
                        },
                        () => {
                            if (AnnotationStore.getAddedAnnotInfo()) {
                                setTimeout(() => {
                                    this.treeRef.current.scrollTo({ key: AnnotationStore.getAddedAnnotInfo().id, align: "top", offset: 60 });
                                    AnnotationStore.setAddedAnnotInfo(null);
                                }, 100);
                            }
                        }
                    );
                } catch (error) {
                    console.log("eror insert fl " + error.stack);
                }
                break;
            }
            case "pageChanged":
                this.setState({
                    activePage: AnnotationStore.getActivePageId(),
                });

                if (!this.isFileChanged.current || TreeStoreV2.getTreeFilter()) {
                    const tree = TreeStoreV2.buildTree();
                    this.setState({
                        treeData: tree.treeData,
                    });
                }

                this.setDefaultScalesValues();
                break;
            case "fileChanged":
            case "EstimateInitialized":
            case "AnnotationUpdatedUpdateTree":
            case "AnnotationUpdatedSkipTreeUpdate":
            case "AnnotationDeleted":
            case "annotationsInserted":
            case "AnnotationAdded":
                {
                    if (message === "AnnotationUpdatedUpdateTree") {
                        // let keys = new Set();
                        // if (this.state.expandedKeys.has(AnnotationStore.getMergedFolderData().id)) {
                        //     keys = new Set(TreeStore.buildTree([...this.state.expandedKeys, AnnotationStore.getMergedFolderData().id]).expandedKeys);
                        // } else {
                        //     keys = new Set(TreeStore.buildTree([...this.state.expandedKeys]).expandedKeys);
                        //     keys.delete(AnnotationStore.getMergedFolderData().id);
                        // }
                        // this.setState({
                        //     expandedKeys: keys,
                        // });
                    }
                    if (message !== "fileChanged" && message !== "EstimateInitialized")
                        EstimateStore.updateAnnotationsInDrive(AnnotationStore.getAnnotations());
                    const info = AnnotationStore.getWebViewerFileInformation();

                    if (
                        (!this.isFileChanged.current || message === "EstimateInitialized" || this.isIfcFileOpened()) &&
                        message !== "AnnotationUpdatedSkipTreeUpdate"
                    ) {
                        const result = TreeStoreV2.buildTree([...this.state.expandedKeys]);
                        this.setState({
                            treeData: result.treeData,
                        });
                    }
                    if (message === "fileChanged") this.isFileChanged.current = true;

                    let activePage = info.get("activePage");
                    if (message === "pageChanged" && this.state.hasSetInitialPage) {
                        window.history.replaceState({}, "unused argument", `#${info.get("activePage")}`);
                    } else if (!this.state.hasSetInitialPage) {
                        activePage = parseInt(window.location.hash.replace("#", ""), 10);
                    }
                    const { selectionList, selectionKeys } = ObjectsStore.getSelectionList();
                    this.setState(
                        {
                            selectedAnnotations: selectionList,
                            activePage,
                            lengthX: ScaleStore.getLength(X_SCALE_NAME),
                            lengthY: ScaleStore.getLength(Y_SCALE_NAME),
                        },
                        () => {
                            this.clearDuplicateStates();
                            if (message === "annotationsInserted") AnnotationStore.setIsReductionCreated(false);
                            if (AnnotationStore.getAddedAnnotInfo() && message === "annotationsInserted") {
                                setTimeout(() => {
                                    this.treeRef.current.scrollTo({ key: AnnotationStore.getAddedAnnotInfo()?.id, align: "top", offset: 60 });
                                    AnnotationStore.setAddedAnnotInfo(null);
                                }, 100);
                            }
                        }
                    );

                    this.setScalesValuesOnUpdate();
                    AnnotationStore.setIsAltKeyEnabledForScale(!areBothScalesSet(this.state.activePage));
                }
                break;
            case "annotationSelectedFromGui":
                {
                    const { selectionList, selectionKeys } = ObjectsStore.getSelectionList();
                    const result = TreeStoreV2.buildTree([...this.state.expandedKeys]);
                    this.setState({
                        expandedKeys: new Set(result.expandedKeys),
                        selectedAnnotations: selectionList,
                        selectedKeys: selectionKeys,
                    });
                }
                break;
            // case "annotationSelected":
            //     {
            //         const keystoExpand = [];
            //         TreeStore.getCurrentlySelectedNodes().forEach((annotation) => {
            //             if (annotation.get("type") === "Reduction") {
            //                 const parent = AnnotationStore.getAnnotationByAnnotationId(annotation.get("parentId"));
            //                 keystoExpand.push(parent.get("id"));
            //             }
            //         });
            //         const result = TreeStore.buildTree([...this.state.expandedKeys, ...keystoExpand]);
            //         this.setState({
            //             selectedAnnotations: TreeStore.getCurrentlySelectedNodes(),
            //             selectedKeys: TreeStore.getTreeSelection(),
            //             expandedKeys: new Set(result.expandedKeys),
            //         });
            //     }
            //     break;
            case "annotationDeSelectedFromGui":
                const { selectionList, selectionKeys } = ObjectsStore.getSelectionList();
                this.setState({
                    selectedAnnotations: selectionList,
                    selectedKeys: selectionKeys,
                });
                break;
            case "UserAddedScale":
                this.setDefaultScalesValues();
                break;
            case "toggleDocument":
                this.toggleDocument();
                break;
            case "toggleProperties":
                this.toggleProperties();
                break;
            case "duplicatingAnnotsInfoChanged":
                const { duplicatingAnnots, annotsToDuplicate, annotsDuplicated, userId } = AnnotationStore.getDuplicateAnnotsModalInfo();
                this.setState({
                    duplicateAnnotsModal: {
                        duplicatingAnnots,
                        annotsToDuplicate,
                        annotsDuplicated,
                        userId,
                    },
                });
                break;
            case "fetchingDataLoaderChanged":
                this.checkIfDataIsFetching();
                break;
            case "annotationsLoaded":
                {
                    this.setState({
                        selectedKeys: isNumber(JSON.parse(localStorage.getItem(`selectedAnnotation_${this.props.match.params.projectId}`))?.key)
                            ? [JSON.parse(localStorage.getItem(`selectedAnnotation_${this.props.match.params.projectId}`))?.key]
                            : [],
                    });
                }
                break;
            default:
                break;
        }
    };

    headerStoreUpdated = (message) => {
        if (message === "appSearchUpdated") {
            const result = TreeStoreV2.buildTree();
            this.setState({ treeData: result.treeData });
        }
    };

    treeStoreUpdated = (message) => {
        switch (message) {
            case "treeExpansionUpdated":
                this.setState({ expandedKeys: new Set(TreeStoreV2.getTreeExpansion()) });
                break;
            default:
                break;
        }
    };

    calculationStoreUpdated = (message) => {
        switch (message) {
            case "CalculationRowInserted":
            case "CalculationRowUpdated":
            case "CalculationRowDeleted":
                const result = TreeStoreV2.buildTree();
                this.setState({ treeData: result.treeData });
                break;
            default:
                break;
        }
    };

    ifcStoreUpdated = (message) => {
        switch (message) {
            case "ifcAnnotationsUpdated":
            case "ifcAnnotationInserted":
                const info = AnnotationStore.getWebViewerFileInformation();
                const result = TreeStoreV2.buildTree();
                let activePage = info.get("activePage");
                if (message === "pageChanged" && this.state.hasSetInitialPage) {
                    window.history.replaceState({}, "unused argument", `#${info.get("activePage")}`);
                } else if (!this.state.hasSetInitialPage) {
                    activePage = parseInt(window.location.hash.replace("#", ""), 10);
                }
                const { selectionList, selectionKeys } = ObjectsStore.getSelectionList();
                this.setState({
                    treeData: result.treeData,
                    selectedAnnotations: selectionList,
                    selectedKeys: selectionKeys,
                    activePage,
                });

                this.setScalesValuesOnUpdate();
                AnnotationStore.setIsAltKeyEnabledForScale(!areBothScalesSet(this.state.activePage));
                break;
            default:
                break;
        }
    };

    isIfcFileOpened = (isInitial = false) => {
        const fileId = parseInt(this.props.match.params.fileId, 10);
        const file = FileStore.getFileById(fileId);
        const isActive = get(file, "type") === "ifc" ? true : false;
        AnnotationStore.setIfcIsActive(isActive);
        if (isActive && isInitial) {
            this.isFileChanged.current = false;
            AnnotationStore.onSetActiveFileId(fileId);
        }
        return isActive;
    };

    clearDuplicateStates() {
        AnnotationStore.resetDuplicateAnnotsModalInfo();
        this.setState({
            duplicateAnnotsModal: {
                duplicatingAnnots: false,
                annotsToDuplicate: 0,
                annotsDuplicated: 0,
                showMoreDetails: false,
                updatingUI: false,
                userId: null,
            },
        });
    }
    movePreventEditingAnnotsHandler = (preventEditingAnnotatationList) => {
        this.setState({ showMoveModal: true, preventEditingAnnotatationList });
    };

    closeMoveAnnotsModalHandler = () => {
        this.setState({
            showMoveModal: false,
            preventEditingAnnotatationList: new Immutable.List(),
        });
    };

    onChangeValues = (annots, value, key, additional) => {
        if (annots.length === 1 && (annots[0]?.type === ANNOT_TYPES.X_SCALE || annots[0]?.type === ANNOT_TYPES.Y_SCALE))
            AnnotationStore.onRequestScaleUpdate2({ id: annots[0].id, value, parameter: key, ...additional });
        else
            AnnotationStore.onRequestAnnotationUpdate({
                annots,
                key,
                value,
                additional,
            });
    };

    render() {
        const projectId = parseInt(this.props.match.params.projectId, 10);
        const fileId = parseInt(this.props.match.params.fileId, 10);
        const file = FileStore.getFileById(fileId);
        const fileType = get(file, "type");
        const localStorageSplitPosLeftName = fileType === "ifc" ? "calculateSplitPosLeftIFC" : "calculateSplitPosLeft";
        const calculateSplitPosLeftDefaultSize =
            localStorage.getItem(localStorageSplitPosLeftName) === null ? "300px" : parseInt(localStorage.getItem(localStorageSplitPosLeftName), 10);
        const calculateSplitPosRightDefaultSize =
            localStorage.getItem("calculateSplitPosRight") === null ? "280px" : parseInt(localStorage.getItem("calculateSplitPosRight"), 10);
        const calculateSplitPosBottomDefaultSize =
            localStorage.getItem("calculateSplitPosBottom") === null ? "210px" : parseInt(localStorage.getItem("calculateSplitPosBottom"), 10);

        return (
            <div className="Calculate">
                <Header />
                <div className="Calculate_Layout">
                    {this.state.showStampTooHeavyDialog && (
                        <Modal
                            visible={this.state.showStampTooHeavyDialog}
                            title={this.props.t("ERROR.IMAGE_IS_TOO_LARGE")}
                            submitButtonTitle={this.props.t("GENERAL.CLOSE")}
                            onOk={() => this.setState({ showStampTooHeavyDialog: false })}
                            onPressEnter={() => this.setState({ showStampTooHeavyDialog: false })}
                            width={284}
                        />
                    )}
                    {this.state.duplicateAnnotsModal.duplicatingAnnots && (
                        <DuplicateModal
                            visible={this.state.duplicateAnnotsModal.duplicatingAnnots}
                            toDuplicate={this.state.duplicateAnnotsModal.annotsToDuplicate}
                            duplicated={this.state.duplicateAnnotsModal.annotsDuplicated}
                            updatingUI={this.state.duplicateAnnotsModal.updatingUI}
                            userId={this.state.duplicateAnnotsModal.userId}
                        />
                    )}
                    {this.state.showMoveModal && this.state.preventEditingAnnotatationList.size > 0 && (
                        <MoveModal
                            visible={this.state.showMoveModal}
                            onCancel={this.closeMoveAnnotsModalHandler}
                            annotationLists={this.state.preventEditingAnnotatationList}
                        />
                    )}
                    <Sidebar />
                    <div className="Calculate_Wrapper">
                        {this.state.fetchingDataLoader && (
                            <div className="Calulate_Data_Loader">
                                <Spin size="large" />
                            </div>
                        )}
                        <ToolbarRefluxWrapper
                            activePage={this.state.activePage}
                            setActivePage={(activePage) => this.setState({ activePage })}
                            lengthX={this.state.lengthX}
                            lengthY={this.state.lengthY}
                            setLengthX={(lengthX) => this.setState({ lengthX })}
                            setLengthY={(lengthY) => this.setState({ lengthY })}
                            toggleRows={this.toggleRows}
                            isToggleRows={this.state.toggleRows}
                            toggleProperties={this.toggleProperties}
                            isToggleProperties={this.state.toggleProperties}
                            toggleDocument={this.toggleDocument}
                            isToggleDocument={this.state.toggleDocument}
                            setTreeData={(treeData) => this.setState({ treeData })}
                            treeData={this.state.treeData}
                            viewerRef={this.viewerRef}
                            treeListLoaded={this.state.treeListLoaded}
                        />
                        <div className="Calculate_Wrapper_SplitPane--left">
                            <SplitPane
                                defaultSize={calculateSplitPosLeftDefaultSize}
                                onChange={(size) => localStorage.setItem(localStorageSplitPosLeftName, size)}
                                pane1Style={{ minWidth: "50px", minHeight: "50px" }}
                                pane2Style={{ minWidth: "50px", minHeight: "50px", overflow: "auto" }}
                                onDragStarted={() => this.setState({ isResize: true })}
                                onDragFinished={() => this.setState({ isResize: false })}
                            >
                                <CalculateTree
                                    treeData={this.state.treeData}
                                    selectedKeys={this.state.selectedKeys}
                                    expandedKeys={[...this.state.expandedKeys]}
                                    ref={this.treeRef}
                                    selectedAnnotations={this.state.selectedAnnotations}
                                    projectId={projectId}
                                    onMovePreventEditingAnnots={this.movePreventEditingAnnotsHandler}
                                    {...this.props}
                                />

                                <div>
                                    <SplitPane
                                        primary="second"
                                        defaultSize={calculateSplitPosRightDefaultSize}
                                        onChange={(size) => localStorage.setItem("calculateSplitPosRight", size)}
                                        pane1Style={{ minWidth: "50px", minHeight: "50px", overflow: "auto" }}
                                        pane2Style={{
                                            minWidth: "50px",
                                            minHeight: "50px",
                                            overflow: "auto",
                                            display: this.state.toggleProperties ? "block" : "none",
                                        }}
                                        onDragStarted={() => this.setState({ isResize: true })}
                                        onDragFinished={() => this.setState({ isResize: false })}
                                    >
                                        <div>
                                            <SplitPane
                                                primary="second"
                                                split="horizontal"
                                                defaultSize={calculateSplitPosBottomDefaultSize}
                                                onChange={(size) => localStorage.setItem("calculateSplitPosBottom", size)}
                                                pane1Style={{
                                                    minWidth: "50px",
                                                    minHeight: "50px",
                                                    overflow: "auto",
                                                    display: this.state.toggleDocument ? "block" : "none",
                                                }}
                                                pane2Style={{
                                                    minWidth: "50px",
                                                    minHeight: "50px",
                                                    overflow: "auto",
                                                    display: this.state.toggleRows ? "block" : "none",
                                                }}
                                                onDragStarted={() => this.setState({ isResize: true })}
                                                onDragFinished={() => this.setState({ isResize: false })}
                                            >
                                                <FileRefluxWrapper
                                                    viewerRef={this.viewerRef}
                                                    treeListLoaded={this.state.treeListLoaded}
                                                    activePage={this.state.activePage}
                                                    isResize={this.state.isResize}
                                                />
                                                <CalculateRows />
                                            </SplitPane>
                                        </div>
                                        <CalculateProperties
                                            fileType={fileType}
                                            onMovePreventEditingAnnots={this.movePreventEditingAnnotsHandler}
                                            onChangeValues={this.onChangeValues}
                                            {...this.props}
                                        />
                                    </SplitPane>
                                </div>
                            </SplitPane>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default withTranslation()(ensureLogin(withRouter(Calculate)));
