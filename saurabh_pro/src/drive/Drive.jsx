import { AuthenticationStore, FileStore, HeaderStore, NodeSocketStore, ProjectsStore, SocketV2Store } from "../stores";
import { FileActions, AnnotationActions, ProjectActions } from "../actions";
import FileIconSwitcher from "../util/FileIconSwitcher";
import { Header, TemplatesDialog } from "../components";
import ImportAnnotationsInPdfModal from "../calculate/dialogs/ImportAnnotationsInPdfModal";
import React from "react";
import Sidebar from "../sidebar/Sidebar";
import SplitPane from "react-split-pane";
import ensureLogin from "../util/EnsureLogin";
import { translateFileExtension } from "../utils/fileTypeUtil/fileTypeUtil";
import { withRouter } from "react-router";
import { DriveToolbar, DeleteDialog, DrivePreview, DriveProperties, DriveTree } from "./components";
import { isEmpty, map, filter, isNull } from "lodash";
import {
    checkIfShouldUpdateFolderArrPosition,
    checkIfShouldUpdateFolderPosition,
    getAllKeys,
    shouldChangeSelectedNodeBeforeDeletation,
    sortTree,
} from "./Drive.utils";

import "./drive.less";
import TreeLoader from "./components/TreeLoader/TreeLoader";
import { handleDriveKeyDown } from "utils/hotkeys/DriveHotkeys";
import { FileUploadDialog, FolderDialog } from "./components/DriveToolbar/components";
import { FILE_ACTION_NAME, GROUP_NAME } from "constants/NodeActionsConstants";

class Drive extends React.PureComponent {
    constructor(props) {
        super(props);
        this.viewerRef = React.createRef();
    }
    role = AuthenticationStore.getRole();

    state = {
        selectedNode: [],
        activeProject: null,
        treeData: [],
        driveLoader: {
            isLoading: FileStore.fileLoaderDataDrive.isLoading,
            loadedCount: 0,
            wantedCount: 100,
        },
        driveTreeHeight: 0,
        expandedKeys: localStorage.getItem(`pdfExpandedKeys_${this.props.match.params.projectId}`)
            ? JSON.parse(localStorage.getItem(`pdfExpandedKeys_${this.props.match.params.projectId}`))
            : [],
        deleteModalVisibile: false,
        folderModalVisibile: false,
        uploadModalVisible: false,
        templateModalVisible: false,
        allKeysExpanded: true,
        checkedItems: [],
        treeSearch: "",
        treeSearchTimeout: 0,
        activePage: "",
        pageCount: "",
        multipleFilesLoader: {
            show: false,
            filesName: [],
            wanted: 0,
            loaded: 0,
        },
        showSubmenu: false,
        isResize: false,
        toolNode: "AnnotationEdit",
    };

    unlistenHistory = null;
    treeRef = React.createRef();
    splitRef = React.createRef();

    componentDidMount() {
        const projectId = parseInt(this.props.match.params.projectId, 10);
        const activeProjectId = ProjectsStore.getActiveProjectId();
        if (!activeProjectId || activeProjectId !== projectId) {
            if (activeProjectId) {
                ProjectActions.requestCloseProject(activeProjectId);
            }
            ProjectActions.requestOpenProject(projectId);
            ProjectActions.requestProject(projectId);
        }
        ProjectsStore.setActiveProjectId(projectId);

        let extraState = {};

        if (FileStore.treeList.length === 0) {
            FileActions.requestGetFiles(projectId);
        } else {
            if (!FileStore.selectedFileNodes[0]) FileStore.setDefaultFileNode();
            let selectedNode = FileStore.selectedFileNodes[0];
            let treeData = sortTree(FileStore.getTreeData());
            FileStore.fileLoaderDataDrive.isLoading = false;
            this.setState({
                driveLoader: {
                    isLoading: false,
                },
            });

            extraState = {
                treeData,
                expandedKeys: this.state.expandedKeys.length > 0 ? this.state.expandedKeys : getAllKeys(treeData),
                selectedNode,
            };
        }

        if (ProjectsStore.getProjectRows().length === 0) {
            const token = AuthenticationStore.getJwt();
            ProjectsStore.fetchProjects(token);
        }

        this.unsubscribeProjectStore = ProjectsStore.listen(this.projectStoreUpdated);
        this.unsubscribeFileStore = FileStore.listen(this.fileStoreUpdated);
        this.unsubscribeHeaderStore = HeaderStore.listen(this.headerStoreUpdated);

        this.setState({ ...extraState }, () => {
            if (FileStore.selectedFileNodes[0] && typeof FileStore.selectedFileNodes[0] === "number") {
                let keyEntities = this.treeRef.current.state.keyEntities;

                let node = keyEntities[FileStore.selectedFileNodes[0]];
                FileActions.setSelectedFileNodes([node.node]);
                AnnotationActions.setActiveFileId(node.node.key);

                // If there's no expanded keys, expand all keys
                let expandedKeys = FileStore.expandedKeys;
                if (FileStore.expandedKeys.length <= 0) {
                    let treeData = FileStore.getTreeData();
                    expandedKeys = this.state.expandedKeys.length > 0 ? this.state.expandedKeys : getAllKeys(treeData);
                    FileActions.setExpandedKeys(expandedKeys);
                }

                this.setState(
                    {
                        selectedNode: node.node,
                        expandedKeys,
                    },
                    () => this.setSelectionHash()
                );
            }
        });
        window.addEventListener("resize", this.onResize);
        document.addEventListener("keydown", handleDriveKeyDown);

        window.onpopstate = () => {
            this.onPreviewBack();
        };
        SocketV2Store.onInitSocket();
    }

    componentDidUpdate(prevProps, prevState) {
        // This sets the root folder to be selected when the drive file list has finished loading
        if (prevState?.driveLoader.isLoading !== this.state?.driveLoader?.isLoading) {
            let getDriveNode = FileStore.getRootFolder();
            const driveSelectedKey = localStorage.getItem(`driveSelected_${this.props.match.params.projectId}`);
            if (driveSelectedKey) getDriveNode = FileStore.getFileById(parseInt(driveSelectedKey));
            FileActions.setSelectedFileNodes([getDriveNode]);

            this.setState(
                {
                    selectedNode: getDriveNode,
                    checkedItems: [getDriveNode],
                },
                () => this.setSelectionHash()
            );
        }
    }
    onResize = () => {
        this.setState({
            driveTreeHeight: this.splitRef.current.pane1.clientHeight,
        });
    };
    onUpdatePage = (activePage, pageCount) => {
        this.setState({
            activePage: activePage,
            pageCount: pageCount,
        });
    };

    componentWillUnmount() {
        this.unsubscribeFileStore();
        this.unsubscribeHeaderStore();
        this.unsubscribeProjectStore();
        document.removeEventListener("keydown", handleDriveKeyDown);
        window.onpopstate = null;
        window.removeEventListener("resize", this.onResize);
        FileStore.clearDriveLoader();
        FileStore.cleanup();
    }

    setSelectionHash = () => {
        const id = this.state.selectedNode?.key;
        window.history.pushState({}, "unused argument", `#${id}`);
    };

    setToolNode = (tool) => {
        this.setState({ toolNode: tool });
        FileStore.setToolMode(tool);
    };

    mapFolder = (folder) => {
        const children = FileStore.getChildren(folder.id);

        const type = translateFileExtension(folder.name);

        let icon = type.icon;

        if (icon === "file-unknown" && folder.type === "folder") {
            icon = "folder";
        }

        let data = {
            title: folder.name,
            key: folder.id,
            type: icon,
            icon: <FileIconSwitcher type={icon} />,
            notes: folder.description,
            description: folder.shortDescription,
        };

        if (folder.type === "folder") {
            data.children = children.map((child) => this.mapFolder(child));
        }

        return data;
    };

    fileStoreUpdated = (message, fileId, index) => {
        switch (message) {
            case "treeDataUpdated":
                const treeData = FileStore.getTreeData();
                this.setState(
                    {
                        treeData,
                        driveLoader: {
                            wantedCount: FileStore.fileLoaderDataDrive.wanted,
                            loadedCount: FileStore.fileLoaderDataDrive.loaded,
                            isLoading: FileStore.fileLoaderDataDrive.isLoading,
                        },
                    },
                    () => {
                        this.updatePreviewState();
                    }
                );
                break;
            case "showWebViewerImportDialog":
                const filename = FileStore.getUploadedPdfFile().name;
                if (filename) this.setState({ showWebViewerImportDialog: true });
                break;
            case "updateSelectedNode":
                if (this.state.selectedNode) {
                    this.setState({
                        selectedNode: FileStore.getSelectedNode(this.state.selectedNode.id),
                    });
                    FileStore.reloadFileView([FileStore.getSelectedNode(this.state.selectedNode.id)]);
                }
                break;
            case "started_uploading_multiple_files":
            case "multiple_files_counter_updated":
                const loaderData = FileStore.getMultipleFilesDataLoader();
                this.setState({
                    multipleFilesLoader: {
                        show: true,
                        filesName: loaderData.filesName,
                        wanted: loaderData.wanted,
                        loaded: loaderData.loaded,
                    },
                });
                break;
            case "ended_uploading_multiple_files":
                this.setState({
                    multipleFilesLoader: {
                        show: false,
                        filesName: [],
                        wanted: 0,
                        loaded: 0,
                    },
                });
                break;
            case "drivePageChanged":
                this.setState({ activePage: FileStore.getActivePage() });
                break;
            case "showDeleteConfirmation":
                if (this.state.checkedItems.length === 1 && this.state.checkedItems[0].parentId !== null) this.setState({ deleteModalVisibile: true });
                break;
            case "openFolderModal":
                if (this.state.selectedNode.type === "folder") this.openFolderModal();
                break;
            case "openUploadModal":
                if (this.state.selectedNode.type === "folder") this.openUploadModal();
                break;
            case "downloadFile":
                this.onDownloadFile();
                break;
            case "openInCalculate":
                this.onOpenInCalculate();
                break;
            case "expandAll":
                this.onExpandAll();
                break;
            case "collapseAll":
                this.onCollapseAll();
                break;
            case "setMarqueeZoomTool":
                this.setToolNode("MarqueeZoomTool");
                break;
            case "treeNodeDeleted":
                {
                    if (this.state.checkedItems) {
                        this.setState(
                            {
                                selectedNode: FileStore.getSelectedNode(this.state.checkedItems[0].parentId),
                                checkedItems: [FileStore.getSelectedNode(this.state.checkedItems[0].parentId)],
                            },
                            () => FileStore.reloadFileView([FileStore.getSelectedNode(this.state.selectedNode.id)])
                        );
                    }
                }
                break;
            default:
                break;
        }
    };

    projectStoreUpdated = (message) => {
        if (message === "projectAdded") {
            this.setState({ activeProject: ProjectsStore.getActiveProject() });
        }
    };

    headerStoreUpdated = (message) => {
        const self = this;

        if (message === "appSearchUpdated") {
            if (this.state.treeSearchTimeout) clearTimeout(this.state.treeSearchTimeout);
            this.setState({
                treeSearchTimeout: setTimeout(() => {
                    self.setState({
                        treeSearch: HeaderStore.appSearch,
                    });
                }, 300),
            });
        }
    };

    onDriveTreeDoubleClick = (_, data) => {
        if (data.type !== "folder") {
            this.props.history.push("/projects/" + this.props.match.params.projectId + "/calculate/" + data.key);
        }
    };

    onExpandAll = () => {
        this.setState({ expandedKeys: getAllKeys(FileStore.getTreeData()), allKeysExpanded: true });
        localStorage.setItem(`pdfExpandedKeys_${this.props.match.params.projectId}`, JSON.stringify(getAllKeys(FileStore.getTreeData())));
    };
    onCollapseAll = () => {
        this.setState({ expandedKeys: [], allKeysExpanded: false });
        localStorage.setItem(`pdfExpandedKeys_${this.props.match.params.projectId}`, JSON.stringify([]));
    };

    onDriveTreeSelect = (_, data) => {
        this.setState(
            {
                selectedNode: data.node,
            },
            () => this.setSelectionHash()
        );
        const uniqueArray = [...new Set([data.node])];
        this.setState({ checkedItems: uniqueArray });
        localStorage.setItem(`driveSelected_${this.props.match.params.projectId}`, data.node.key);

        FileActions.setSelectedFileNodes([data.node]);
        FileStore.setCheckedItemsIds([data.node.key]);
        AnnotationActions.setActiveFileId(data.node.key);
    };

    selectionByClick = (_, data) => {
        const uniqueArray = [...new Set([data])];
        this.setState({ checkedItems: uniqueArray });
        const nodeToSelectIndex = sortTree(this.state.selectedNode).children.findIndex((item) => item.key === data.key);

        let nodeToSelect;

        if (this.state.selectedNode.children) {
            if (typeof this.state.selectedNode.children.get === "function") {
                nodeToSelect = this.state.selectedNode.children.find((item) => item.get("key") === data.key);
            } else {
                nodeToSelect = this.state.selectedNode.children.find((item) => item.key === data.key);
            }
        }

        nodeToSelect.pos = `${this.state.selectedNode.pos}-${nodeToSelectIndex}`;
        FileActions.setSelectedFileNodes([nodeToSelect]);

        this.setState(
            {
                selectedNode: nodeToSelect,
            },
            () => this.setSelectionHash()
        );
    };

    onDrop = (e) => {
        e.preventDefault();
        if (this.state.selectedNode?.type !== "folder") return false;
        const files = [];

        if (e.dataTransfer.items) {
            for (let i = 0; i < e.dataTransfer.items.length; i++) {
                if (e.dataTransfer.items[i].kind === "file") {
                    const file = e.dataTransfer.items[i].getAsFile();
                    files.push({ file, parentId: this.state.selectedNode?.key, notes: "", description: "", name: file.name });
                }
            }
        } else {
            files = e.dataTransfer.files;
        }

        FileStore.uploadMultipleFiles(files);
    };

    updatePreviewState = () => {
        if (!this.state.selectedNode.key) return;
        this.setState({ selectedNode: FileStore.getSelectedNode(this.state.selectedNode.id) || FileStore.getRootFolder() });
    };

    onPreviewBack = () => {
        try {
            let parentNode = null;

            const nodePos = this.state.selectedNode.pos;

            const positionParts = nodePos ? nodePos.split(/-/gm) : "";

            if (!positionParts) return;
            positionParts.shift();
            positionParts.pop();

            parentNode = positionParts.reduce((acc, current) => {
                let idx = parseInt(current, 10);

                let node = acc[idx];

                if (acc?.children) {
                    node = acc?.children?.get(idx);
                }

                return node;
            }, this.state.treeData);

            if (!parentNode) return;

            if (!this.treeRef.current) return;

            const keyEntities = this.treeRef.current.state.keyEntities;

            if (!keyEntities[parentNode.key]) return;

            this.setState(
                {
                    selectedNode: {
                        ...keyEntities[parentNode.key],
                        ...keyEntities[parentNode.key].node,
                    },
                },
                () => this.setSelectionHash()
            );
        } catch (e) {
            console.error(e.message);
        }
    };

    onUpdateFileLocation = (dragNode, dropNode) => {
        const shouldUpdateFolderPosition = dragNode.type === "folder" ? checkIfShouldUpdateFolderPosition(dragNode, dropNode) : true;
        if (shouldUpdateFolderPosition) {
            NodeSocketStore.onSendMessage(GROUP_NAME.GEO_FILE, {
                action: FILE_ACTION_NAME.UPDATE,
                ids: [dragNode.key],
                parameter: "parentId",
                value: Number(dropNode.key),
            });
        }
    };

    onUpdateFilesLocation = (nodeList, toNode) => {
        const folderArr = nodeList.filter((node) => node.type === "folder");
        const shouldUpdateNodePositions = nodeList.every((node) => node.type !== "folder") ? true : checkIfShouldUpdateFolderArrPosition(folderArr, toNode);
        if (shouldUpdateNodePositions) {
            const ids = map(nodeList, (node) => Number(node.key));

            NodeSocketStore.onSendMessage(GROUP_NAME.GEO_FILE, {
                action: FILE_ACTION_NAME.UPDATE,
                ids,
                parameter: "parentId",
                value: Number(toNode.key),
            });
        }
    };

    onUpdateFileProps = (fileId, field, value) => {
        NodeSocketStore.onSendMessage(GROUP_NAME.GEO_FILE, { action: FILE_ACTION_NAME.UPDATE, ids: [fileId], parameter: field, value });
    };

    onUpdateNodeStatus = (value) => this.onUpdateFileProps(this.state.selectedNode.key, "nodeStatus", value);

    onExpandDriveTree = (expandedKeys) => {
        const projectId = parseInt(this.props.match.params.projectId, 10);
        localStorage.setItem(`pdfExpandedKeys_${projectId}`, JSON.stringify(expandedKeys));
        this.setState({
            expandedKeys,
        });
    };

    onOpenInCalculate = (item, newTab) => {
        const projectId = parseInt(this.props.match.params.projectId, 10);
        if (item) {
            if (newTab) {
                window.open(`/projects/${projectId}/calculate/${item.key}`);
                return;
            }
            this.props.history.push(`/projects/${projectId}/calculate/${item.key}`);
        } else {
            if (this.state.checkedItems.length === 1) {
                this.props.history.push(`/projects/${projectId}/calculate/${this.state.checkedItems[0].key}`);
            } else if (this.state.checkedItems.length > 1) {
                this.state.checkedItems.forEach((item) => {
                    window.open(`/projects/${projectId}/calculate/${item.key}`);
                });
            }
        }
    };

    onDownloadFile = (item, singleElement = false) => {
        if (singleElement) {
            const fileURL = `${process.env.REACT_APP_BUCKET_URL.replace(/\/$/, "")}/${item.key}`;

            fetch(fileURL, { mode: "cors" })
                .then((response) => response.blob())
                .then((blob) => {
                    const a = document.createElement("a");
                    a.href = window.URL.createObjectURL(blob);
                    a.download = item.title || "download";

                    a.click();
                    a.remove();
                });
        } else {
            this.state.checkedItems.forEach((item) => {
                if (item.type !== "folder") {
                    const fileURL = `${process.env.REACT_APP_BUCKET_URL.replace(/\/$/, "")}/${item.key}`;

                    fetch(fileURL, { mode: "cors" })
                        .then((response) => response.blob())
                        .then((blob) => {
                            const a = document.createElement("a");
                            a.href = window.URL.createObjectURL(blob);
                            a.download = item.title || "download";

                            a.click();
                            a.remove();
                        });
                }
            });
        }
    };

    onOpenFolder = (item) => {
        this.onDriveTreeSelect(undefined, { node: item });
    };

    onDeleteItem = () => {
        this.setState({
            deleteModalVisibile: true,
        });
    };

    onCancelDeletion = () => {
        this.setState({
            deleteModalVisibile: false,
        });
    };

    onConfirmDeletion = () => {
        if (this.state.selectedNode.parentId) {
            if (shouldChangeSelectedNodeBeforeDeletation(this.state.treeData, this.state.selectedNode, this.state.checkedItems)) {
                this.setState(
                    {
                        selectedNode: FileStore.getSelectedNode(this.state.checkedItems[0].parentId),
                    },
                    () => {
                        FileStore.reloadFileView([FileStore.getSelectedNode(this.state.selectedNode.id)]);
                        this.deleteFileHandler();
                        return;
                    }
                );
            }
        }
        this.deleteFileHandler();
    };

    deleteFileHandler = () => {
        const projectId = parseInt(this.props.match.params.projectId, 10);

        let items = this.state.checkedItems;

        items.forEach((item) => {
            if (item.key === this.state.selectedNode.key) this.nodeBackHandler();
            if (item.type === "folder") {
                FileActions.deleteFolder({ projectId, folderId: item.key });
            } else {
                FileActions.deleteFile({ projectId, fileId: item.key });
            }
        });

        this.setState({
            deleteModalVisibile: false,
            checkedItems: [],
        });
    };

    filterTree = (data) => {
        const copy = (o) => Object.assign({}, o);

        const self = this;

        const filtered = data.map(copy).filter(function f(ob) {
            if (ob.type === "folder" && ob.title.toLowerCase().includes(self.state.treeSearch.toLowerCase()) && ob.parentId) return true;

            if (!!ob.children) {
                if (typeof ob.children.toJS === "function" && ob.children.size > 0) {
                    const newData = ob.children.toJS().map(copy).filter(f);

                    return (ob.children = newData).length;
                } else if (ob.children.length > 0) {
                    const newData = ob.children.map(copy).filter(f);

                    return (ob.children = newData).length;
                }
            }

            if (ob.title.toLowerCase().includes(self.state.treeSearch.toLowerCase())) return true;

            return false;
        });

        return filtered;
    };

    closeModals = () => {
        this.setState({ showWebViewerImportDialog: false });
    };

    setCheckedItems = (items) => {
        this.setState({ checkedItems: items });

        const checkedItemsIds = filter(
            map(items, (o) => o.parentId && o.id),
            (p) => !!p
        );
        FileStore.setCheckedItemsIds(checkedItemsIds);
    };

    nodeBackHandler = () => {
        if (this.state.selectedNode) {
            this.setState(
                {
                    selectedNode: FileStore.getSelectedNode(this.state.selectedNode.parentId),
                },
                () => FileStore.reloadFileView([FileStore.getSelectedNode(this.state.selectedNode.id)])
            );
        }
    };

    templateModalVisible = () => {
        this.setState({
            templateModalVisible: true,
            showSubmenu: false,
        });
    };

    switchShowSubmenu = (value) => {
        this.setState({
            showSubmenu: value,
        });
    };

    onCreateFolder = (data) => {
        this.closeFolderModal();
        const newFolderRequest = {
            action: FILE_ACTION_NAME.CREATE_GROUP,
            geoProjectId: Number(ProjectsStore.getActiveProjectId()),
            parentId: this.state.selectedNode.key,
            name: data.name,
            shortDescription: data.shortDescription,
            description: data.description,
            added: new Date(),
        };
        NodeSocketStore.onSendMessage(GROUP_NAME.GEO_FILE, newFolderRequest);
    };
    openFolderModal = () => this.setState({ folderModalVisibile: true });
    closeFolderModal = () => this.setState({ folderModalVisibile: false });

    openUploadModal = () => this.setState({ uploadModalVisible: true });
    closeUploadModal = () => this.setState({ uploadModalVisible: false });

    render() {
        const {
            selectedNode,
            checkedItems,
            driveLoader,
            expandedKeys,
            treeData,
            isResize,
            activePage,
            showSubmenu,
            driveTreeHeight,
            multipleFilesLoader,
            pageCount,
            showWebViewerImportDialog,
            folderModalVisibile,
            deleteModalVisibile,
            templateModalVisible,
            uploadModalVisible,
            allKeysExpanded,
            toolNode,
        } = this.state;
        const {
            viewerRef,
            splitRef,
            treeRef,
            role,
            onCreateFolder,
            openFolderModal,
            closeFolderModal,
            onCancelDeletion,
            onConfirmDeletion,
            nodeBackHandler,
            onDriveTreeSelect,
            closeModals,
            onDrop,
            openUploadModal,
            closeUploadModal,
            onExpandAll,
            onCollapseAll,
            setToolNode,
        } = this;

        return (
            <div className="Drive" onDrop={onDrop} onDragOver={(e) => e.preventDefault()}>
                {showWebViewerImportDialog && <ImportAnnotationsInPdfModal isOpen={showWebViewerImportDialog} close={closeModals} />}
                <Header
                    isLoading={driveLoader.isLoading}
                    selectedNode={selectedNode}
                    onNodeBack={nodeBackHandler}
                    onDoubleClickDrive={(data) => onDriveTreeSelect(undefined, { node: data })}
                    selectedKeys={checkedItems.map((item) => item.key)}
                />
                <div className="Drive_Layout">
                    <Sidebar fileId={selectedNode?.key} type={selectedNode?.type} />
                    {deleteModalVisibile && (
                        <DeleteDialog
                            visible={deleteModalVisibile}
                            confirmValue={checkedItems[0].title}
                            onCancel={onCancelDeletion}
                            onConfirm={onConfirmDeletion}
                        />
                    )}
                    {folderModalVisibile && <FolderDialog isOpen={folderModalVisibile} onOk={onCreateFolder} onCancel={closeFolderModal} />}
                    {uploadModalVisible && <FileUploadDialog isOpen={uploadModalVisible} onCancel={closeUploadModal} parentId={selectedNode.key} />}
                    {templateModalVisible && (
                        <TemplatesDialog
                            visible={templateModalVisible}
                            onCancel={() => this.setState({ templateModalVisible: false })}
                            onAccept={() => this.setState({ templateModalVisible: false })}
                            title="Folder Templates"
                            type="drive"
                        />
                    )}

                    <div className="Drive_Wrapper">
                        {this.state.driveLoader.isLoading ? (
                            <TreeLoader loadedCount={driveLoader.loadedCount} wantedCount={driveLoader.wantedCount} />
                        ) : (
                            <>
                                <DriveToolbar
                                    role={role}
                                    selectedNode={selectedNode}
                                    onDelete={this.onDeleteItem}
                                    onDownloadFile={this.onDownloadFile}
                                    activePage={activePage}
                                    pageCount={pageCount}
                                    onUpdatePage={this.onUpdatePage}
                                    onOpenInCalculate={this.onOpenInCalculate}
                                    checkedItems={checkedItems}
                                    selectedItem={selectedNode}
                                    viewerRef={viewerRef}
                                    templateModalVisible={this.templateModalVisible}
                                    showSubmenu={showSubmenu}
                                    switchShowSubmenu={(value) => this.switchShowSubmenu(value)}
                                    openFolderModal={openFolderModal}
                                    openUploadModal={openUploadModal}
                                    allKeysExpanded={allKeysExpanded}
                                    collapseAll={onCollapseAll}
                                    expandAll={onExpandAll}
                                    toolNode={toolNode}
                                    onChangeTool={setToolNode}
                                />
                                <div className="Drive_Body">
                                    <SplitPane
                                        defaultSize={
                                            localStorage.getItem("driveSplitPosLeft") === null
                                                ? "350px"
                                                : parseInt(localStorage.getItem("driveSplitPosLeft"), 10)
                                        }
                                        onChange={(size) => localStorage.setItem("driveSplitPosLeft", size)}
                                        pane1Style={{ minWidth: "50px", minHeight: "50px", overflow: "auto" }}
                                        pane2Style={{ minWidth: "50px", minHeight: "50px", overflow: "auto" }}
                                        ref={splitRef}
                                        onDragStarted={() => this.setState({ isResize: true })}
                                        onDragFinished={() => this.setState({ isResize: false })}
                                    >
                                        <DriveTree
                                            role={role}
                                            onDoubleClick={this.onDriveTreeDoubleClick}
                                            treeData={sortTree([...this.filterTree(treeData)])}
                                            onDriveTreeSelect={this.onDriveTreeSelect}
                                            selectedKeys={checkedItems.map((item) => item.key)}
                                            checkedKeys={checkedItems.map((item) => item.key)}
                                            ref={treeRef}
                                            onMoveFile={this.onUpdateFileLocation}
                                            onMoveFiles={this.onUpdateFilesLocation}
                                            height={driveTreeHeight}
                                            expandedKeys={expandedKeys}
                                            onExpand={this.onExpandDriveTree}
                                            draggable={role}
                                            checkedItems={checkedItems}
                                            setCheckedItems={this.setCheckedItems}
                                            onDeleteFile={this.onDeleteItem}
                                            onDeleteFolder={this.onDeleteItem}
                                            onOpenFolder={this.onOpenFolder}
                                            onOpenInCalculate={this.onOpenInCalculate}
                                            onDownloadFile={this.onDownloadFile}
                                            isUploadingFiles={multipleFilesLoader.show}
                                        />
                                        <div>
                                            <SplitPane
                                                primary="second"
                                                defaultSize={
                                                    localStorage.getItem("driveSplitPosRight") === null
                                                        ? "250px"
                                                        : parseInt(localStorage.getItem("driveSplitPosRight"), 10)
                                                }
                                                onChange={(size) => localStorage.setItem("driveSplitPosRight", size)}
                                                pane1Style={{ minWidth: "50px", minHeight: "50px" }}
                                                pane2Style={{ minWidth: "50px", minHeight: "50px" }}
                                                onDragStarted={() => this.setState({ isResize: true })}
                                                onDragFinished={() => this.setState({ isResize: false })}
                                            >
                                                <DrivePreview
                                                    selectedNode={selectedNode}
                                                    onDriveTreeSelect={this.onDriveTreeSelect}
                                                    selectionByClick={this.selectionByClick}
                                                    onBack={this.onPreviewBack}
                                                    onOpenInCalculate={this.onOpenInCalculate}
                                                    onDownloadFile={this.onDownloadFile}
                                                    onOpenFolder={this.onOpenFolder}
                                                    onDeleteFile={this.onDeleteItem}
                                                    onDeleteFolder={this.onDeleteItem}
                                                    checkedItems={checkedItems}
                                                    setCheckedItems={this.setCheckedItems}
                                                    treeData={sortTree([...this.filterTree(treeData)])}
                                                    onMoveFile={this.onUpdateFilesLocation}
                                                    onUpdatePage={this.onUpdatePage}
                                                    viewerRef={viewerRef}
                                                    multipleFilesLoader={multipleFilesLoader}
                                                    isResize={isResize}
                                                />
                                                {!isEmpty(selectedNode) && selectedNode.parentId ? (
                                                    <DriveProperties
                                                        selectedNode={selectedNode}
                                                        treeData={sortTree([...treeData])}
                                                        onUpdateFileProps={this.onUpdateFileProps}
                                                        onUpdateFileLocation={this.onUpdateFileLocation}
                                                        onChangeStatus={this.onUpdateNodeStatus}
                                                    />
                                                ) : (
                                                    <> </>
                                                )}
                                            </SplitPane>
                                        </div>
                                    </SplitPane>
                                </div>
                            </>
                        )}
                    </div>
                    <div style={{ width: "10px", height: "10px", background: "#333333" }} id="fileTest"></div>
                </div>
            </div>
        );
    }
}

export default ensureLogin(withRouter(Drive));
