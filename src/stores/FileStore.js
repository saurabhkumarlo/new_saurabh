import React from "react";

import { createStore } from "reflux";
import { forEach, isEmpty, find, map, remove, get, filter, mergeWith, lowerCase, includes } from "lodash";
import WebViewer from "@pdftron/webviewer";
import axios from "axios";

import { parseIcon } from "./../constants/FilesConstants";
import AnnotCommandHandler from "./../utils/AnnotCommandHandler";
import AnnotationStore from "./AnnotationStore";
import AuthenticationStore from "./AuthenticationStore";
import FileActions from "./../actions/FileActions";
import FileIconSwitcher from "../util/FileIconSwitcher";
import { SocketV2Actions } from "../actions";
import ProjectsStore from "./ProjectsStore";
import { translateFileExtension } from "../utils/fileTypeUtil/fileTypeUtil";
import EstimateStore from "./EstimateStore";
import ViewerWebViewerInit from "../pdfAnnotationUtils/initializers/ViewerWebViewerInit";
import { handleDriveKeyDown, handleDriveMouseDown, handleDriveMouseUp, handleMouseMove } from "utils/hotkeys/DriveHotkeys";
import { FILE_ACTION_NAME, GROUP_NAME } from "constants/NodeActionsConstants";
import NodeSocketStore from "./NodeSocketStore";

export default createStore({
    listenables: [FileActions],

    init() {
        this.currentFolder = undefined;
        this.previewReady = false;
        this.lastViewedPageNr = 1;

        this.fileLoaderData = {
            wanted: 10,
            loaded: 0,
            isLoading: true,
        };

        this.fileLoaderDataDrive = {
            wanted: 100,
            loaded: 0,
            isLoading: true,
            annotsCount: 0,
            estimateCount: -1,
        };

        this.multipleFliesDataLoader = {
            uploadingFiles: false,
            filesName: [],
            wanted: 0,
            loaded: 0,
            uploadingPDFwithAnnots: false,
        };
        this.expandedKeys = [];
        this.selectedFileNodes = [];
        this.treeData = [];
        this.uploadedPdfFile = {};
        this.detectedAnnotationsLength = null;
        this.files = [];
        this.treeList = [];
        this.pdfsArrGenerator = null;
        this.otherArrGenerator = null;
        this.activePage = -1;
        this.checkedItemsIds = [];
        this.element = undefined;
        this.currentToolMode = "AnnotationEdit";
        this.previousToolMode = null;
        this.isHotkeyLongPress = false;
    },

    async initWebViewer(documentReference, shouldLoadAnnotations) {
        this.webViewer = await new WebViewer(
            {
                type: "html5,html5Mobile",
                path: "/webviewer",
                showLocalFilePicker: false,
                showToolbarControl: false,
                showPageHistoryButtons: false,
                hideAnnotationPanel: true,
                l: "Rukkor AB(rukkor.com):OEM:Geometra::B+:AMS(20220604):BBA5883D0427060A7360B13AC982737860614F9BFF68AD1BBD72558495873E8E4AB431F5C7",
                annotationUser: AuthenticationStore.getUserId(),
                enableAnnotations: true,
                backgroundColor: "#333333",
                autoCreate: true,
                fullAPI: true,
                isAdminUser: true,
                streaming: false,
                enableOfflineMode: false,
                annotationAdmin: true,
                serverUrl: null,
                useDownloader: false,
                isReadOnly: true,
                disabledElements: [
                    "contextMenuPopup",
                    "annotationStylePopup",
                    "annotationDeleteButton",
                    "toolsOverlay",
                    "searchOverlay",
                    "toolbarGroup-Shapes",
                    "toolbarGroup-Edit",
                    "toolbarGroup-Insert",
                    "linkButton",
                    "menuOverlay",
                    "toolsHeader",
                    "pageNavOverlay",
                ],
            },
            documentReference
        );

        const annotationManager = this.webViewer.annotManager;
        this.element = documentReference;
        this.webviewerInit = new ViewerWebViewerInit(this.webViewer);
        this.webviewerInit.init();
        this.reloadFileView(this.getSelectedFiles());
        this.webViewer.docViewer.addEventListener("documentLoaded", async () => {
            await this.loadAnnotations();
            this.trigger("documentLoaded");
        });
        this.webViewer.docViewer.addEventListener("annotationsLoaded", async () => {
            if (shouldLoadAnnotations) {
                if (annotationManager.getAnnotationsList().length) {
                    const detectedAnnotations = annotationManager.getAnnotationsList();
                    const xfdfPromise = map(detectedAnnotations, (annot) => annotationManager.exportAnnotations({ annotList: [annot] }));
                    const xfdfList = await Promise.all(xfdfPromise);
                    const detectedAnnotationsLength = filter(xfdfList, (xfdf) => {
                        const parser = new DOMParser();
                        const xfdfElements = parser.parseFromString(xfdf, "text/xml");
                        const annotationType = get(xfdfElements.querySelector("annots"), "firstElementChild")?.tagName;
                        return annotationType;
                    });
                    this.detectedAnnotationsLength = detectedAnnotationsLength.length;
                    this.trigger("showWebViewerImportDialog");
                } else {
                    if (!isEmpty(this.uploadedPdfFile)) {
                        if (!this.multipleFliesDataLoader.uploadingFiles) this.initLoaderForSinglePDFUpload();
                        this.onUploadFile(this.uploadedPdfFile);
                        this.uploadedPdfFile = {};
                    }
                }
            }
            this.trigger("pageRendered");
        });
        this.webViewer.docViewer.addEventListener("pageNumberUpdated", () => {
            this.setActivePage(this.webViewer.getCurrentPageNumber());
        });
        const innerDoc = this.element.querySelector("iframe").contentWindow.document;
        innerDoc.querySelector("body").addEventListener("keydown", handleDriveKeyDown);
        innerDoc.querySelector("body").addEventListener("mousedown", handleDriveMouseDown);
        innerDoc.querySelector("body").addEventListener("mouseup", handleDriveMouseUp);
        this.webViewer.docViewer.addEventListener("keyDown", (nativeEvent) => {
            handleDriveKeyDown(nativeEvent);
        });
    },

    setCheckedItemsIds(items) {
        this.checkedItemsIds = items;
    },

    getCheckedItemsIds() {
        return this.checkedItemsIds;
    },

    setActivePage(activePage) {
        this.activePage = activePage;
        this.trigger("drivePageChanged");
    },

    showDeleteConfirmation() {
        this.trigger("showDeleteConfirmation");
    },
    onOpenFolderModal() {
        this.trigger("openFolderModal");
    },
    onOpenUploadModal() {
        this.trigger("openUploadModal");
    },
    onDownloadFile() {
        this.trigger("downloadFile");
    },
    onOpenInCalculate() {
        this.trigger("openInCalculate");
    },
    onExpandAll() {
        this.trigger("expandAll");
    },
    onCollapseAll() {
        this.trigger("collapseAll");
    },

    getActivePage() {
        return this.activePage;
    },

    getTreeData() {
        return this.treeData;
    },

    getTreeList() {
        return this.treeList;
    },

    getUploadedPdfFile() {
        return this.uploadedPdfFile;
    },

    getDetectedAnnotationsLength() {
        return this.detectedAnnotationsLength;
    },

    getLastViewedPageNr() {
        return this.lastViewedPageNr;
    },

    getSelectedFiles() {
        const fileItem = find(this.treeList, (item) => item.id === get(this.selectedFileNodes[0], "key"));

        return [fileItem];
    },

    onSetSelectedFileNodes(nodes) {
        this.selectedFileNodes = nodes;

        this.trigger("filesUpdated");
    },

    getFileById(id) {
        return find(this.treeList, (file) => file.id === id);
    },

    getChildren(parentId) {
        return this.treeList.filter((file) => {
            return file.parentId == parentId;
        });
    },

    getRootFolder() {
        return find(this.treeList, (o) => !o.parentId);
    },
    updateFileState() {
        this.trigger("treeNodeDeleted");
    },

    getAllSortedFilesList() {
        const self = this;
        const filePathList = [];

        const getFilePaths = (folder, path) => {
            if (folder) {
                let children = self.getChildren(folder.id).sort((folder1, folder2) => {
                    return folder1.name.toLowerCase().localeCompare(folder2.name.toLowerCase());
                });
                const currentPath = path.concat(folder.name);
                children = children.filter((file) => {
                    if (file.type !== "folder") {
                        filePathList.push({ value: file.id, key: file.id, label: currentPath + " > " + file.name, filename: file.name });
                        return false;
                    }
                    return true;
                });
                children.forEach((aFolder) => {
                    getFilePaths(aFolder, path + folder.name + " > ");
                });
            }
        };
        getFilePaths(this.getRootFolder(), "");
        return filePathList;
    },

    getMultipleFilesDataLoader() {
        return this.multipleFliesDataLoader;
    },

    getOthersArrGenerator() {
        return this.otherArrGenerator;
    },

    getPdfsArrGenerator() {
        return this.pdfsArrGenerator;
    },

    onIncrementLoader(progress, estimateCount, isAnnotations) {
        this.fileLoaderDataDrive.loaded += progress;
        if (estimateCount) {
            this.fileLoaderDataDrive.estimateCount = estimateCount;
        }
        if (isAnnotations) {
            this.fileLoaderDataDrive.annotsCount += 1;
        }
        if (Math.round(this.fileLoaderDataDrive.wanted) === Math.round(this.fileLoaderDataDrive.loaded)) {
            this.fileLoaderDataDrive.isLoading = false;
        }
        this.trigger("treeDataUpdated");
    },

    clearDriveLoader() {
        this.fileLoaderDataDrive = {
            wanted: 100,
            loaded: 0,
            isLoading: true,
            annotsCount: 0,
            estimateCount: -1,
        };
    },

    clearFileStore() {
        this.treeData = [];
        this.files = [];
        this.treeList = [];
        this.clearDriveLoader();
        AnnotationStore.setAnnotationActionDone(false);
    },

    async onRequestGetFiles(projectId) {
        await axios
            .get(`${process.env.REACT_APP_NODE_URL}/files`, {
                params: { projectId },
                headers: {
                    Authorization: AuthenticationStore.getJwt(),
                },
            })
            .then(({ data }) => {
                this.onBuildTree(data);
                this.onIncrementLoader(25);
            })
            .catch((error) => {
                console.log(error);
            });
    },

    onClearFileList() {
        this.fileLoaderData = {
            wanted: 10,
            loaded: 0,
            isLoading: true,
        };

        this.expandedKeys = [];
        this.selectedFileNodes = [];
    },

    onSetExpandedKeys(keys) {
        this.expandedKeys = keys;
    },

    uploadSinglePdfFile({ file, parentId, notes, description, name }) {
        if (this.webViewer) {
            try {
                this.uploadedPdfFile = { file, parentId, notes, description, name };
                this.webViewer.loadDocument(file, { filename: name });
            } catch (error) {
                console.log("fileload arror " + error);
            }
        }
    },

    getStampXfdf(xfdf, annot) {
        const parser = new DOMParser();
        const oSerializer = new XMLSerializer();
        const xfdfElements = parser.parseFromString(xfdf, "text/xml");
        const annotation = xfdfElements.querySelector("annots").firstElementChild;

        const style = annot.getCustomData("style");
        const maintainAspectRatio = annot.getCustomData("maintainAspectRatio");
        const rotationControlEnabled = annot.getCustomData("rotationControlEnabled");
        const geometraOpacity = annot.getCustomData("geometraOpacity");
        const geometraBorderOpacity = annot.getCustomData("geometraBorderOpacity");
        const status = annot.getCustomData("status");

        annotation.setAttribute("style", style);
        annotation.setAttribute("maintainAspectRatio", maintainAspectRatio);
        annotation.setAttribute("rotationControlEnabled", rotationControlEnabled);
        annotation.setAttribute("geometraOpacity", geometraOpacity);
        annotation.setAttribute("geometraBorderOpacity", geometraBorderOpacity);
        annotation.setAttribute("status", status);

        const updatedXFDF = oSerializer.serializeToString(xfdfElements);
        return updatedXFDF;
    },

    getAnnotationType(type) {
        switch (type) {
            case "circle":
                return "Ellipse";
            case "ink":
                return "Free hand";
            case "freetext":
                return "Free text";
            case "line":
                return "Arrow";
            default:
                return type.charAt(0).toUpperCase() + type.slice(1);
        }
    },

    async uploadPdfFileWithAnnotations(uploadAnnotations = false) {
        const annotationManager = this.webViewer.annotManager;
        const detectedAnnotations = annotationManager.getAnnotationsList();

        const xfdf = await annotationManager.exportAnnotations({ annotList: [] });
        const options = {
            xfdfString: xfdf,
        };
        const tDocument = await this.webViewer.docViewer.getDocument();
        const data = await tDocument.getFileData(options);
        const blob = new Blob([data], { type: "application/pdf" });
        this.uploadedPdfFile.file = blob;

        if (uploadAnnotations) {
            const xfdfPromise = map(detectedAnnotations, (annot) => annotationManager.exportAnnotations({ annotList: [annot] }));
            const xfdfPromiseList = await Promise.all(xfdfPromise);
            const annotsToCreate = filter(
                map(detectedAnnotations, (annot, index) => {
                    const newUUID = AnnotationStore.generateUUID();
                    let newXfdf = xfdfPromiseList[index].replace(annot.xy, newUUID);
                    const parser = new DOMParser();
                    const xfdfElements = parser.parseFromString(newXfdf, "text/xml");
                    const annotation = get(xfdfElements.querySelector("annots"), "firstElementChild");
                    newXfdf = this.removeRedundantElementsInAnnotation(annotation, xfdfElements);
                    if (annotation) {
                        const annotationType = annotation.tagName;
                        const type = this.getAnnotationType(annotationType);
                        const newXfdfWithClonedVertices = type === "Polygon" ? this.parseAnnotVertices(newXfdf, xfdfElements) : newXfdf;
                        return {
                            estimateId: AnnotationStore.getActiveEstimate().get("id"),
                            annotationId: newUUID,
                            name: annot.annotationName || annot.Subject,
                            number: annot.annotationNumber || "000",
                            xfdf: annotationType === "stamp" ? this.getStampXfdf(newXfdf, annot) : newXfdfWithClonedVertices,
                            type,
                            height: annot.height || "2.5",
                            quantity: annot.quantity || 1,
                            layerId: "-1",
                        };
                    } else {
                        return null;
                    }
                }),
                (o) => !!o
            );
            if (!this.multipleFliesDataLoader.uploadingFiles) this.initLoaderForSinglePDFUpload(true);
            if (!this.multipleFliesDataLoader.uploadingPDFwithAnnots) this.multipleFliesDataLoader.uploadingPDFwithAnnots = true;
            this.onUploadFile({ ...this.uploadedPdfFile, annotations: annotsToCreate });
            this.uploadedPdfFile = {};
        } else {
            if (!this.multipleFliesDataLoader.uploadingFiles) this.initLoaderForSinglePDFUpload(false);
            try {
                this.onUploadFile(this.uploadedPdfFile);
                this.uploadedPdfFile = {};
            } catch (error) {
                console.log("error: ", error.stack);
            }
        }
    },

    initLoaderForSinglePDFUpload(pdfWithAnnots) {
        this.multipleFliesDataLoader.wanted++;
        this.multipleFliesDataLoader.uploadingFiles = true;
        this.multipleFliesDataLoader.filesName = [...this.multipleFliesDataLoader.filesName, this.uploadedPdfFile.name];
        this.multipleFliesDataLoader.uploadingPDFwithAnnots = pdfWithAnnots;
        this.trigger("started_uploading_multiple_files");
    },

    countChildrenStatuses(childrenArray = []) {
        const statuses = childrenArray.reduce(
            (accumulator, currentValue) => {
                return currentValue.type === "folder"
                    ? mergeWith(accumulator, currentValue.statuses, (a = 0, b) => a + b)
                    : currentValue.nodeStatus
                    ? { ...accumulator, [currentValue.nodeStatus]: (accumulator[currentValue.nodeStatus] || 0) + 1 }
                    : accumulator;
            },
            { notStarted: 0, progress: 0, review: 0, complete: 0 }
        );
        return statuses;
    },

    onBuildTree(files) {
        try {
            let root = null;
            const uniqueFiles = [...new Map(files.map((file) => [file["id"], file])).values()];
            const newFiles = map(uniqueFiles, (item) => {
                const file = {
                    parentId: item.parentId,
                    id: item.id,
                    description: item.description,
                    key: item.id,
                    shortDescription: item.shortDescription,
                    title: item.name,
                    type: item.type || "folder",
                    children: [],
                    size: item.size,
                    added: item.added,
                    name: item.name,
                    status: item.status,
                    nodeStatus: item.nodeStatus,
                    rotation: item.rotation || null,
                };

                if (item.type === "folder" || !item.type) return file;
                else {
                    return { ...file, icon: <FileIconSwitcher type={parseIcon(item.type)} status={item.status} /> };
                }
            });
            const idMapping = newFiles.reduce((acc, el, i) => {
                acc[el.id] = i;
                return acc;
            }, {});
            forEach(newFiles, (el) => {
                if (el.parentId === null) {
                    root = el;
                    return;
                }
                const parentEl = newFiles[idMapping[el.parentId]];
                parentEl.children = [...(parentEl.children || []), el];
                parentEl.statuses = this.countChildrenStatuses(parentEl.children);
            });
            this.treeData = [root];
            this.treeList = newFiles;
            this.trigger("treeListUpdated");
            this.trigger("treeDataUpdated");
        } catch (err) {
            console.log(err);
        }
    },

    onUpdateTree(files) {
        forEach(files, (file) => {
            forEach(this.treeList, (item) => {
                if (item.id === file.id) {
                    item.name = file.name;
                    item.shortDescription = file.shortDescription;
                    item.description = file.description;
                    item.nodeStatus = file.nodeStatus;
                    return;
                }
            });
        });
        this.onBuildTree(this.treeList);
    },

    onAddNodeToTree(file, removeNode = false) {
        // It may be optimized, not to rebuild all tree
        if (removeNode) {
            this.onBuildTree(remove(this.treeList, (o) => o.id !== file.id));
        } else {
            this.onBuildTree([...this.treeList, file]);
        }
        this.trigger("updateSelectedNode");
    },

    getSelectedNode(id) {
        return find(this.treeList, (o) => o.id === id);
    },

    onUploadFileChannelOpen(payload, name) {
        if (payload.statusCode) {
            console.log("Error:", payload);
        }
        if (payload.url) {
            const url = payload.url;
            axios.put(url, this.files[0]);
            this.files.shift();
        }
    },

    onUploadFile({ file, parentId, notes = "", description = "", name = "", annotations = [] }) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const fileName = name || file.name;
                const fileAndExtienstion = fileName?.split(/\.(?=[^\.]+$)/);
                let fileWithLowerExtenstion = "";
                if (fileAndExtienstion.length === 2) {
                    fileWithLowerExtenstion = fileAndExtienstion[0] + "." + lowerCase(fileAndExtienstion[1]);
                } else {
                    fileAndExtienstion = fileName;
                }
                axios
                    .post(`${process.env.REACT_APP_AUTH0_URL}start_file_upload`, {
                        name: fileWithLowerExtenstion,
                        geoProjectId: ProjectsStore.getActiveProjectId(),
                        type: lowerCase(translateFileExtension(fileName).fileExtensions[0]),
                        description: notes,
                        shortDescription: description,
                        parentId,
                        size: file.size,
                        added: new Date(),
                        annotations,
                    })
                    .then((res) => {
                        const fileLodaderState = this.getMultipleFilesDataLoader();
                        const pdfGenerator = this.getPdfsArrGenerator();
                        const otherFilesGenerator = this.getOthersArrGenerator();

                        if (res.data.type !== "pdf" && fileLodaderState.wanted >= 1) {
                            otherFilesGenerator.next();
                        }
                        if (res.data.type === "pdf" && fileLodaderState.wanted >= 1) {
                            pdfGenerator.next();
                        }
                        FileActions.uploadFileChannelOpen(res.data.payload, res.data.name);
                        if (res.data.annotations.length >= 1 && res.data.type === "pdf") {
                            EstimateStore.onSetAnnotationsFromPDF(res.data.annotations);
                        }
                    })
                    .catch(console.log);

                this.files.push(file);
            } catch (error) {
                console.log("error", error);
            }
        };
        reader.readAsArrayBuffer(file);
    },
    multipleFilesLoaderHandler() {
        this.multipleFliesDataLoader.loaded++;
        this.trigger("multiple_files_counter_updated");
        if (this.multipleFliesDataLoader.loaded >= this.multipleFliesDataLoader.wanted) {
            if (this.multipleFliesDataLoader.uploadingPDFwithAnnots) ProjectsStore.onRequestProject(ProjectsStore.getActiveProjectId());
            this.multipleFliesDataLoader.wanted = 0;
            this.multipleFliesDataLoader.loaded = 0;
            this.multipleFliesDataLoader.uploadingFiles = false;
            this.multipleFliesDataLoader.filesName = [];
            this.pdfsArrGenerator = null;
            this.multipleFliesDataLoader.uploadingPDFwithAnnots = false;

            setTimeout(() => this.trigger("ended_uploading_multiple_files"), 1500);
        }
    },

    uploadMultipleFiles(files) {
        const pdfFiles = filter(files, (file) => file.file.type.split("/").pop() === "pdf");
        const otherFiles = filter(files, (file) => file.file.type.split("/").pop() !== "pdf");
        if (files.length > 0) {
            const filesNameArr = files.map((file) => file.name);
            this.multipleFliesDataLoader.wanted = this.multipleFliesDataLoader.wanted + files.length;
            this.multipleFliesDataLoader.uploadingFiles = true;
            this.multipleFliesDataLoader.filesName = [...this.multipleFliesDataLoader.filesName, ...filesNameArr];
            this.trigger("started_uploading_multiple_files");
        }
        if (otherFiles.length === 0 && pdfFiles.length > 0) {
            this.pdfsArrGenerator = this.uploadMultiplePDFFiles(pdfFiles);
            this.pdfsArrGenerator.next();
        }
        if (otherFiles.length >= 1) {
            this.otherArrGenerator = this.uploadMultipleOtherFiles(otherFiles, pdfFiles);
            this.otherArrGenerator.next();
        }
    },

    *uploadMultipleOtherFiles(otherFiles, pdfFiles) {
        for (const file of otherFiles) yield this.onUploadFile(file);
        if (pdfFiles.length >= 1) {
            this.pdfsArrGenerator = this.uploadMultiplePDFFiles(pdfFiles);
            this.pdfsArrGenerator.next();
        }
    },

    *uploadMultiplePDFFiles(files) {
        for (const pdf of files) yield this.uploadSinglePdfFile(pdf);
    },

    onCancelUploadMultiplePdfFile() {
        if (this.multipleFliesDataLoader.wanted > 0) {
            this.multipleFliesDataLoader.wanted--;
            if (this.multipleFliesDataLoader.wanted === 0) {
                this.trigger("ended_uploading_multiple_files");
            } else {
                this.trigger("multiple_files_counter_updated");
            }
            this.pdfsArrGenerator.next();
        }
    },

    onDeleteFile(body) {
        SocketV2Actions.sendMessage({
            action: "delete_file",
            ...body,
        });
    },

    deleteWithoutConfirmation() {
        const selectedNodeArr = this.getSelectedFiles();

        if (selectedNodeArr?.length === 0 || !selectedNodeArr[0]?.parentId) return;

        const deleteRequest =
            selectedNodeArr[0].type === "folder"
                ? {
                      action: "delete_folder",
                      projectId: ProjectsStore.getActiveProjectId(),
                      folderId: selectedNodeArr[0].id,
                  }
                : {
                      action: "delete_file",
                      projectId: ProjectsStore.getActiveProjectId(),
                      fileId: selectedNodeArr[0].id,
                  };

        SocketV2Actions.sendMessage(deleteRequest);
    },

    onDeleteFolder(body) {
        SocketV2Actions.sendMessage({
            action: "delete_folder",
            ...body,
        });
    },

    onUpdateCheckedNodesStatuses(value) {
        NodeSocketStore.onSendMessage(GROUP_NAME.GEO_FILE, { action: FILE_ACTION_NAME.UPDATE, ids: this.getCheckedItemsIds(), parameter: "nodeStatus", value });
    },

    cleanup() {
        this.previewReady = false;
        if (this.element && this.element.querySelector("iframe").contentWindow) {
            const innerDoc = this.element.querySelector("iframe").contentWindow.document;
            innerDoc.querySelector("body").removeEventListener("keydown", handleDriveKeyDown);
            innerDoc.querySelector("body").removeEventListener("mousedown", handleDriveMouseDown);
            innerDoc.querySelector("body").removeEventListener("mouseup", handleDriveMouseUp);
        }
        if (this.webViewer) {
            this.webViewer.dispose();
        }
        if (this.webviewerInit) {
            this.webviewerInit.cleanup();
            this.webviewerInit = undefined;
        }
        this.webViewer = undefined;
    },

    reloadFileView(selectedFiles) {
        if (this.webViewer && selectedFiles && selectedFiles.length > 0 && selectedFiles[0] && selectedFiles[0].type !== "folder") {
            const fileURL = `${process.env.REACT_APP_BUCKET_URL}${selectedFiles[0].id}`;

            this.webViewer.loadDocument(fileURL, { documentId: selectedFiles[0].id, filename: selectedFiles[0].name });
        }
    },

    initPdfAnnotationAsDeselected(pdfAnnotation) {
        if (pdfAnnotation) {
            if (pdfAnnotation.enableRotationControl) {
                pdfAnnotation.disableRotationControl();
            }
            switch (pdfAnnotation.Subject) {
                case "Point":
                case "Polygon":
                case "Ellipse":
                case "annotation.freeHand":
                case "Free Hand":
                case "Free hand":
                case "Reduction":
                    if (pdfAnnotation.FillColor) {
                        pdfAnnotation.FillColor.A = pdfAnnotation.geometraOpacity;
                    }
                    if (pdfAnnotation.StrokeColor) {
                        pdfAnnotation.StrokeColor.A = pdfAnnotation.geometraBorderOpacity;
                    }
                    if (pdfAnnotation.Subject === "Point" && pdfAnnotation.iconType && pdfAnnotation.iconType !== "none") {
                        this.webViewer.annotManager.redrawAnnotation(pdfAnnotation);
                    }

                    break;
                case "Polyline":
                case "x-scale":
                case "y-scale":
                    pdfAnnotation.StrokeColor.A = pdfAnnotation.geometraOpacity;
                    break;
                case "Free text":
                    pdfAnnotation.TextColor.A = pdfAnnotation.geometraOpacity;
                    pdfAnnotation.Opacity = pdfAnnotation.geometraOpacity;
                    break;
                case "Stamp":
                    pdfAnnotation.Opacity = pdfAnnotation.geometraOpacity;
                    break;
                default:
                    break;
            }
        }
    },

    async loadAnnotations() {
        const selectedFiles = this.getSelectedFiles();
        if (this.webViewer && selectedFiles && selectedFiles.length > 0 && selectedFiles[0]) {
            const am = this.webViewer.annotManager;
            await am.exportAnnotationCommand();
            am.deleteAnnotations(am.getAnnotationsList(), true, true);
            const annotComHandler = new AnnotCommandHandler();

            const selectedFile = selectedFiles[0];
            if (selectedFile && selectedFile.rotation) {
                let rotations = selectedFile.rotation;
                this.webViewer.docViewer.setPageRotations(rotations);
            }
            const annotations =
                get(
                    find(EstimateStore.getActiveAnnotations(), (o) => o.fileId === get(selectedFile, "id")),
                    "annotations"
                ) || [];
            for (let i = 0; i < annotations.length; i++) {
                const annot = annotations[i];
                if (annot.xfdf && annot.type !== "group") {
                    annotComHandler.addAddedCommand(annot.xfdf);
                }
            }

            const addedPdftronAnnotations = await this.webViewer.annotManager.importAnnotationCommand(annotComHandler.getAnnotCommand());
            for (let i = 0; i < addedPdftronAnnotations.length; i++) {
                if (addedPdftronAnnotations[i].Subject !== "Stamp") {
                    this.initPdfAnnotationAsDeselected(addedPdftronAnnotations[i]);
                }
            }

            const scalesForFile = AnnotationStore.getScalesForFile(selectedFile.id);
            for (let i = 0; i < scalesForFile.size; i++) {
                const scale = scalesForFile.get(i);
                const scales = await am.importAnnotations(scale.get("xdf"));
                const scaleAnnotation = scales[0];
                scaleAnnotation.StrokeColor.A = 0.85;
                scaleAnnotation.length = scale.get("length");
                scaleAnnotation.Opacity = scaleAnnotation.geometraOpacity;
                am.deleteAnnotation(scaleAnnotation, true, true);
                if (scale.get("type") === "x-scale") {
                    scaleAnnotation.Subject = "x-scale";
                }
                scaleAnnotation.enableRotationControl();
                am.addAnnotation(scaleAnnotation, true);
            }
            await am.drawAnnotationsFromList(am.getAnnotationsList());
            await am.exportAnnotationCommand();
        }
    },

    onSetMarqueeZoomTool() {
        this.trigger("setMarqueeZoomTool");
    },

    setToolMode(toolMode, isHotkeyAction = false) {
        if (this.webViewer) {
            if (isHotkeyAction) {
                this.previousToolMode = this.currentToolMode;
                this.isHotkeyLongPress = true;
            }
            this.currentToolMode = toolMode;
            this.webViewer.setToolMode(toolMode);
        }
    },
    backToPreviousToolMode() {
        this.isHotkeyLongPress = false;
        this.currentToolMode = this.previousToolMode;
        this.webViewer.setToolMode(this.previousToolMode);
    },
    setFitToScreen() {
        if (this.webViewer) {
            this.webViewer.setFitMode(this.webViewer.FitMode.FitPage);
        }
    },
    parseAnnotVertices(newXfdf, xfdfElements) {
        const vertices = xfdfElements.querySelector("vertices").innerHTML;
        const verticesArr = vertices.split(";");
        const newVertices = [...verticesArr, verticesArr[0]].join(";");

        return verticesArr[0] === verticesArr[verticesArr.length - 1] ? newXfdf : newXfdf.replace(vertices, newVertices);
    },
    setDefaultFileNode() {
        this.selectedFileNodes = this.getTreeList().filter((node) => !node.parentId && node.type === "folder");
    },
    changeRootFolderName(name) {
        this.treeList = this.treeList.map((node) => {
            if (node.type === "folder" && !node.parentId) {
                return {
                    ...node,
                    name,
                };
            }
            return node;
        });
        this.onBuildTree(this.treeList);
    },
    onGeoFileMessageHandler(response) {
        const { action, statusCode, payload } = response;
        const { CREATE_GROUP, UPDATE } = FILE_ACTION_NAME;
        if (statusCode !== 200) return console.log(payload.message);

        switch (action) {
            case CREATE_GROUP:
                this.onAddNodeToTree(payload.group, false, payload.name);
                break;
            case UPDATE:
                const { ids, parameter, value } = payload;
                const updatedTreeList = map(this.treeList, (treeItem) => (includes(ids, treeItem.id) ? { ...treeItem, [parameter]: value } : treeItem));
                this.onBuildTree(updatedTreeList);
                break;
            default:
                break;
        }
    },
    removeRedundantElementsInAnnotation(annotation, xfdfElements) {
        const oSerializer = new XMLSerializer();
        const tagsToRemoveArray = ["apref", "trn-custom-data"];

        tagsToRemoveArray.forEach((tag) => {
            const element = annotation.getElementsByTagName(tag);
            if (element.length) {
                annotation.removeChild(element[0]);
            }
        });
        return oSerializer.serializeToString(xfdfElements);
    },
});
