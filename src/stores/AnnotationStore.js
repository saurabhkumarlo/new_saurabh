import { ANNOTATION_ACTION_NAME, FILE_ACTION_NAME, GROUP_NAME, SCALE_ACTION_NAME } from "constants/NodeActionsConstants";
import { ANNOT_TYPES, CENTER_VALUE, PERIPHERAL_VALUE } from "constants/AnnotationConstants";
import { EstimateStore, IfcStore, NodeSocketStore } from "stores";
import { Redo, Undo } from "../assets/icons";
import { X_SCALE_NAME, Y_SCALE_NAME } from "../constants/ScaleConstants";
import _, { filter, forEach, get, includes, isNil, keys, last, map, omit, set, uniq } from "lodash";
import {
    handleAnnotationStoreKeyDown,
    handleAnnotationStoreKeyUp,
    handleCalculateKeyDown,
    handleCalculateMouseDown,
    handleCalculateMouseUp,
    handleDoubleClick,
} from "utils/hotkeys/CalculateHotkeys";
import { objectToStyle, styleToObject } from "../utils/StyleUtil";
import { toUS, toUSsquared, toUSvolume } from "../utils/Converison.js";

import AnnotCommandHandler from "../utils/AnnotCommandHandler";
import AnnotationActions from "../actions/AnnotationActions";
import AppBarActions from "./../actions/AppBarActions";
import AuthenticationStore from "../stores/AuthenticationStore";
import CalculationStore from "./CalculationStore";
import DisplayValuesAnnotationsHandler from "../pdfAnnotationUtils/DisplayValuesAnnotationsHandler";
import FileStore from "../stores/FileStore";
import GeometricCalculation from "../utils/GeometricCalculation";
import HeaderStore from "./HeaderStore";
import Immutable, { isImmutable } from "immutable";
import { LABELS } from "constants/LabelsConstants";
import LineValueInheritance from "../utils/LineValueInheritance";
import PointValueInheritance from "../utils/PointValueInheritance";
import ProjectsStore from "../stores/ProjectsStore";
import StandardValueInheritance from "../utils/StandardAnnotationValueInheritance";
import ViewerWebViewerInit from "./../pdfAnnotationUtils/initializers/ViewerWebViewerInit";
import WebViewer from "@pdftron/webviewer";
import WebviewerInit from "./../pdfAnnotationUtils/initializers/WebViewerInit";
import { asyncForEach } from "../utils/AsyncForEach";
import { createStore } from "reflux";
import hexToRGB from "../utils/HexToRGB";
import i18n from "./../i18nextInitialized.js";
import ObjectsStore from "./ObjectsStore";
import TreeStoreV2 from "./TreeStoreV2";
import ScaleStore from "./ScaleStore";

export default createStore({
    init() {
        this.bucketURL = process.env.REACT_APP_BUCKET_URL;
        this.listenables = AnnotationActions;
        this.Annotations = new Immutable.List();
        this.reductions = new Immutable.List();
        this.displayValueAnnotations = new Immutable.List();
        this.WebViewer = undefined;
        this.element = undefined;
        this.ActiveParentId = undefined;
        this.lastActiveParentId = undefined;
        this.ActiveEstimate = undefined;
        this.ActivePageId = undefined;
        this.ActiveFileId = undefined;
        this.activeProjectId = undefined;
        this.ActiveScale = 1.0;
        this.SelectedAnnotations = new Immutable.List();
        this.xScaleList = new Immutable.List();
        this.yScaleList = new Immutable.List();
        this.ActiveReductionParentId = undefined;
        this.currentToolMode = undefined;
        this.previousToolMode = null;
        this.isHotkeyLongPress = false;
        this.copiedAnnotationContainers = [];
        this.fitModeButtonPressed = false;
        this.jumpAnnotId = undefined;
        this.annotationsToDeleteByPdfTron = new Immutable.List();
        this.annotationManagerSelectionLock = false; // Used to hinder multi trigging when multi selecting
        this.copiedScaleContainers = [];

        this.ellipseValueInheritance = undefined;
        this.polygonValueInheritance = undefined;
        this.reductionValueInheritance = undefined;
        this.polylineValueInheritance = undefined;
        this.pointValueInheritance = undefined;
        this.freehandValueInheritance = undefined;
        this.freeTextValueInheritance = undefined;
        this.stampValueInheritance = undefined;
        this.arrowValueInheritance = undefined;
        this.typeInheritanceMap = undefined;

        this.activeAnnotation = undefined;
        this.type = undefined;
        this.calculatedSum = new Immutable.Map();
        this.displayAnnot = undefined;
        this.call = 0;
        this.snapMode = undefined;
        this.snaponEnabled = undefined;
        this.pageCount = undefined;
        this.userLoadingAnnotations = false;
        this.documentLoaded = false;
        this.treeFilter = "PageAndFile";
        this.annotationActionDone = false;
        this.useYScaleOnly = false;
        this.isAltKeyEnabledForScale = false;
        this.isActiveIfc = false;
        this.duplicateAnnotsModalInfo = {
            duplicatingAnnots: false,
            annotsToDuplicate: 0,
            annotsDuplicated: 0,
            annotsDuplicatedList: [],
            annotsRowsDuplicatedList: [],
            userId: null,
        };
        this.selectedFolderAnnotations = [];
        this.selectedParentFolders = [];
        this.addedAnnotInfo = null;
        this.isCtrlPressed = false;
        this.isAltPressed = false;
        this.isReductionCreated = false;
        this.pageRotation = 0;
        this.fetchingDataLoader = false;
        this.createYScale = false;
    },
    getFetchingDataLoader() {
        return this.fetchingDataLoader;
    },
    setFetchingDataLoader(value) {
        this.fetchingDataLoader = value;
        this.trigger("fetchingDataLoaderChanged");
    },
    getCreateYScale() {
        return this.createYScale;
    },
    setCreateYScale(value) {
        this.createYScale = value;
    },
    setIsReductionCreated(value) {
        this.isReductionCreated = value;
    },
    getIsReductionCreated() {
        return this.isReductionCreated;
    },
    setAddedAnnotInfo(data) {
        this.addedAnnotInfo = data;
    },
    getAddedAnnotInfo() {
        return this.addedAnnotInfo;
    },
    setIsCtrlPressed(value) {
        this.isCtrlPressed = value;
    },
    setIsAltPressed(value) {
        this.isAltPressed = value;
    },
    setSelectedParentFolders(item) {
        this.selectedParentFolders.push(item);
    },
    setArrayOfParentFolders(items) {
        this.selectedParentFolders = items;
    },
    setIfcIsActive(isActive) {
        this.isActiveIfc = isActive;
    },
    isActiveIfcFile() {
        return this.isActiveIfc;
    },
    setUseYScaleOnly(useScale) {
        this.useYScaleOnly = useScale;
    },
    setIsAltKeyEnabledForScale(enabled) {
        this.isAltKeyEnabledForScale = enabled;
    },
    setAnnotationActionDone(annotationActionDone) {
        this.annotationActionDone = annotationActionDone;
    },
    updateSelectedTool() {
        this.trigger("toolChange");
    },
    updateScaleTool() {
        this.trigger("scaleToolChange");
    },
    toggleDeleteModal() {
        this.trigger("toggleDeleteModal");
    },
    onFocusNameInput() {
        this.trigger("focusNameInput");
    },
    onFocusNrTagInput() {
        this.trigger("focusNrTagInput");
    },
    onShowFillColour() {
        this.trigger("showFillColour");
    },
    onShowBorderColour() {
        this.trigger("showBorderColour");
    },
    onShowTiles() {
        this.trigger("showTiles");
    },
    onShowAngles() {
        this.trigger("showAngles");
    },
    onshowReplaceRowsConfirmation() {
        this.trigger("showReplaceRowsConfirmation");
    },
    onShowFileExportModal() {
        this.trigger("showFileExportModal");
    },
    onToggleDocument() {
        this.trigger("toggleDocument");
    },
    onToggleRows() {
        this.trigger("toggleRows");
    },
    onToggleProperties() {
        this.trigger("toggleProperties");
    },
    isAnnotationActionDone() {
        return this.annotationActionDone;
    },
    getCurrentToolNode() {
        return this.currentToolMode;
    },
    setSnapMode(snapMode) {
        this.snapMode = snapMode;
        this.trigger("snapModeUpdated");
    },
    getSnaponEnabled() {
        return this.snaponEnabled;
    },
    toggleSnapon1() {
        const snapon = this.snaponEnabled === "true";
        if (snapon) {
            this.snaponEnabled = "false";
        } else {
            this.snaponEnabled = "true";
        }
        this.trigger("toggleSnapon");
    },
    isSnaponEnabled() {
        return this.snaponEnabled === "true";
    },
    getSnapMode(drawing = false) {
        if (!drawing) {
            return this.snapMode;
        } else if (this.WebViewer) {
            switch (this.snapMode) {
                case "end-of-line":
                    return this.WebViewer.docViewer.SnapMode.PATH_ENDPOINT;
                case "points":
                    return this.WebViewer.docViewer.SnapMode.POINT_ON_LINE;
                case "end-mid-line":
                    return this.WebViewer.docViewer.SnapMode.LINE_MID_POINT;
                default:
                    break;
            }
        }
    },
    getElement() {
        return this.element;
    },
    getDuplicateAnnotsModalInfo() {
        return this.duplicateAnnotsModalInfo;
    },
    setDisplayValueAnnotations(displayValueAnnotationsList) {
        this.displayValueAnnotations = displayValueAnnotationsList;
    },
    setDisplayMode(displayModeString) {
        if (this.WebViewer && this.WebViewer.docViewer && this.WebViewer.docViewer.getDocument()) {
            const manager = this.WebViewer.docViewer.getDisplayModeManager();
            this.displayMode = displayModeString;
            let displayMode;
            switch (displayModeString) {
                case "single":
                    displayMode = new this.WebViewer.CoreControls.DisplayMode(this.WebViewer.docViewer, this.WebViewer.CoreControls.DisplayModes.Single, true);
                    break;
                case "single-noscroll":
                    displayMode = new this.WebViewer.CoreControls.DisplayMode(this.WebViewer.docViewer, this.WebViewer.CoreControls.DisplayModes.Single, false);
                    break;
                case "multi":
                    displayMode = new this.WebViewer.CoreControls.DisplayMode(
                        this.WebViewer.docViewer,
                        this.WebViewer.CoreControls.DisplayModes.Continuous,
                        true
                    );
                    break;
                default:
                    console.log("setDisplayMode did not handle mode " + displayModeString);
            }
            if (displayMode) {
                manager.setDisplayMode(displayMode);
            }
            this.trigger("displayModeUpdated");
        }
    },
    setLayoutMode(layoutMode) {
        if (this.WebViewer && this.WebViewer.docViewer && this.WebViewer.docViewer.getDocument()) {
            localStorage.setItem("webviewerLayoutMode", layoutMode);
            this.WebViewer.setLayoutMode(layoutMode);
            this.trigger("layoutModeUpdated");
        }
    },
    getDisplayMode() {
        return this.displayMode;
    },
    getPointValueInheritance() {
        return this.pointValueInheritance;
    },

    // setScaleTypeMap(type) {
    //     this.annotationTypeMap = this.annotationTypeMap.set("nrSelected", 1);
    //     if (type === X_SCALE_NAME) {
    //         this.annotationTypeMap = this.annotationTypeMap.set("x-scale", 1);
    //     }
    //     if (type === Y_SCALE_NAME) {
    //         this.annotationTypeMap = this.annotationTypeMap.set("y-scale", 1);
    //     }
    // },

    // resetScaleTypeMap() {
    //     this.annotationTypeMap = this.annotationTypeMap.set("x-scale", 0);
    //     this.annotationTypeMap = this.annotationTypeMap.set("y-scale", 0);
    // },

    isReductionToolDisabled() {
        const typeMap = ObjectsStore.getTypeMap();
        if (typeMap) {
            const enabled = typeMap.nrSelected === 1 && typeMap[ANNOT_TYPES.POLYGON];
            return this.currentToolMode !== "AnnotationCreateReduction" && !enabled;
        }
        return true;
    },
    getTypeConversion(type) {
        if (type === "annotation.freeHand" || type === "Free Hand" || type === "Free hand") {
            type = "Free hand";
        } else if (type === "Free Text" || type === "Free text") {
            type = "Free text";
        }
        return type;
    },
    // getCurrentSelectionType() {
    //     if (this.annotationTypeMap.get("group") > 0) {
    //         return "group";
    //     } else {
    //         let selection = undefined;
    //         const keys = this.annotationTypeMap.keySeq();
    //         keys.forEach((actualKey) => {
    //             let key = actualKey;
    //             if (key !== "nrSelected" && this.annotationTypeMap.get(key) > 0) {
    //                 if (key === "x-scale" || key === "y-scale") {
    //                     key = "scale";
    //                 }
    //                 if (!selection || key === selection) {
    //                     selection = key;
    //                 } else {
    //                     selection = "group";
    //                     return false;
    //                 }
    //             }
    //         });
    //         return selection;
    //     }
    // },
    getTheDisplayAnnot() {
        return this.displayAnnot;
    },
    getType() {
        return this.type;
    },
    getCalculatedSum() {
        return this.calculatedSum;
    },
    triggerAnnotationSelected() {
        this.trigger("annotationSelectedFromGui");
        this.trigger("allSelectedStateUpdated");
    },
    updateAnnotationNumberByProjectId(type, value) {
        const annotationNumberByProject = JSON.parse(localStorage.getItem("annotationNumberByProject"));
        annotationNumberByProject[this.activeProjectId][type] = value;
        localStorage.setItem("annotationNumberByProject", JSON.stringify(annotationNumberByProject));
    },
    initLocalStortageValueInheritance(projectId) {
        if (!localStorage.getItem("annotationNumberByProject")) {
            localStorage.setItem("annotationNumberByProject", JSON.stringify({}));
        }
        //const projectId = ProjectsStore.getActiveProjectId()
        const annotNumbersByProject = JSON.parse(localStorage.getItem("annotationNumberByProject"));
        if (!annotNumbersByProject[projectId]) {
            annotNumbersByProject[projectId] = {
                Ellipse: "000",
                "Free hand": "000",
                Reduction: "000",
                Polygon: "000",
                Polyline: "000",
                Point: "000",
                "Free text": "000",
                Stamp: "000",
                Arrow: "000",
                "3DModel": "000",
            };
            localStorage.setItem("annotationNumberByProject", JSON.stringify(annotNumbersByProject));
        }
    },

    initValueInheritance(projectId) {
        this.activeProjectId = projectId;
        this.initLocalStortageValueInheritance(projectId);
        const initValues = JSON.parse(localStorage.getItem("annotationNumberByProject"))[projectId];
        const sessionValues = JSON.parse(sessionStorage.getItem("inheritance"));

        this.ellipseValueInheritance = new StandardValueInheritance(
            sessionValues?.Ellipse
                ? sessionValues.Ellipse
                : {
                      number: initValues["Ellipse"],
                      name: i18n.t("ESTIMATE.ELLIPSE"),
                      height: 2.5,
                      interiorColor: "#F5B200",
                      color: "#0AB1E1",
                      style: "solid",
                      width: 1,
                      labels: this.getDefaultLabels(),
                  }
        );
        this.polygonValueInheritance = new StandardValueInheritance(
            sessionValues?.Polygon
                ? sessionValues.Polygon
                : {
                      number: initValues["Polygon"],
                      name: i18n.t("ESTIMATE.AREA"),
                      height: 2.5,
                      interiorColor: "#00CF83",
                      color: "#F5B200",
                      style: "solid",
                      labels: this.getDefaultLabels(),
                  }
        );
        this.reductionValueInheritance = new StandardValueInheritance(
            sessionValues?.Reduction
                ? sessionValues.Reduction
                : {
                      number: initValues["Reduction"],
                      name: i18n.t("ESTIMATE.REDUCTION"),
                      height: 2.5,
                      interiorColor: "#A7ACB1",
                      color: "#4E5256",
                      style: "dotted",
                      geometraOpacity: 0.5,
                      geometraBorderOpacity: 0.6,
                      width: 0.5,
                      labels: this.getDefaultLabels(),
                  }
        );
        this.freehandValueInheritance = new StandardValueInheritance(
            sessionValues?.["Free hand"]
                ? sessionValues["Free hand"]
                : {
                      number: initValues["Free hand"],
                      name: i18n.t("ESTIMATE.DRAW"),
                      height: 2.5,
                      interiorColor: "#9775FA",
                      color: "#FF6921",
                      style: "dotted",
                      width: 0.5,
                      labels: this.getDefaultLabels(),
                  }
        );
        this.freeTextValueInheritance = new StandardValueInheritance(
            sessionValues?.["Free text"]
                ? sessionValues["Free text"]
                : {
                      number: initValues["Free text"],
                      name: i18n.t("ESTIMATE.COMMENT"),
                      color: "#2C3135",
                      interiorColor: "#FF0000",
                      fontSize: "0",
                      style: "dashed",
                      geometraOpacity: 1,
                      geometraBorderOpacity: 0,
                      width: 0.5,
                      labels: this.getDefaultLabels(),
                  }
        );
        this.polylineValueInheritance = new LineValueInheritance(
            sessionValues?.Polyline
                ? sessionValues.Polyline
                : {
                      number: initValues["Polyline"],
                      name: i18n.t("ESTIMATE.LINE"),
                      height: 2.5,
                      color: "#0AB1E1",
                      width: 2,
                      style: "solid",
                      labels: this.getDefaultLabels(),
                  }
        );
        this.arrowValueInheritance = new LineValueInheritance(
            sessionValues?.Arrow
                ? sessionValues.Arrow
                : {
                      number: initValues["Arrow"],
                      name: i18n.t("ESTIMATE.ARROW"),
                      height: 2.5,
                      color: "#E61C27",
                      geometraOpacity: 0.8,
                      labels: this.getDefaultLabels(),
                  }
        );
        this.pointValueInheritance = new PointValueInheritance(
            sessionValues?.Point
                ? sessionValues.Point
                : {
                      number: initValues["Point"],
                      name: i18n.t("ESTIMATE.POINT"),
                      height: 2.5,
                      interiorColor: "#FF6921",
                      pointSize: 12,
                      geometraOpacity: 0.8,
                      labels: this.getDefaultLabels(true),
                  }
        );
        this.stampValueInheritance = new StandardValueInheritance(
            sessionValues?.Stamp
                ? sessionValues.Stamp
                : {
                      number: initValues["Stamp"],
                      name: i18n.t("ESTIMATE.IMAGE"),
                      height: 2.5,
                      color: "#4E5256",
                      style: "solid",
                      geometraBorderOpacity: "0.0",
                      labels: this.getDefaultLabels(),
                  }
        );

        this.typeInheritanceMap = new Immutable.Map();
        this.typeInheritanceMap = this.typeInheritanceMap.set("Ellipse", this.ellipseValueInheritance);
        this.typeInheritanceMap = this.typeInheritanceMap.set("Free hand", this.freehandValueInheritance);
        this.typeInheritanceMap = this.typeInheritanceMap.set("Free Hand", this.freehandValueInheritance);
        this.typeInheritanceMap = this.typeInheritanceMap.set("Reduction", this.reductionValueInheritance);
        this.typeInheritanceMap = this.typeInheritanceMap.set("Polygon", this.polygonValueInheritance);
        this.typeInheritanceMap = this.typeInheritanceMap.set("Polyline", this.polylineValueInheritance);
        this.typeInheritanceMap = this.typeInheritanceMap.set("Point", this.pointValueInheritance);
        this.typeInheritanceMap = this.typeInheritanceMap.set("Free text", this.freeTextValueInheritance);
        this.typeInheritanceMap = this.typeInheritanceMap.set("Free Text", this.freeTextValueInheritance);
        this.typeInheritanceMap = this.typeInheritanceMap.set("Stamp", this.stampValueInheritance);
        this.typeInheritanceMap = this.typeInheritanceMap.set("Arrow", this.arrowValueInheritance);
    },

    changeAnnotationInheritance({ type, styles, properties, tiles }) {
        const initValues = JSON.parse(localStorage.getItem("annotationNumberByProject"))[this.activeProjectId];
        this.typeInheritanceMap = new Immutable.Map();
        switch (type) {
            case "Ellipse":
                this.ellipseValueInheritance = new StandardValueInheritance({
                    number: initValues["Ellipse"],
                    ...properties,
                    ...styles,
                    ...tiles,
                });
                break;
            case "Polygon":
                this.polygonValueInheritance = new StandardValueInheritance({
                    number: initValues["Polygon"],
                    ...properties,
                    ...styles,
                    ...tiles,
                });
                break;
            case "Reduction":
                this.reductionValueInheritance = new StandardValueInheritance({
                    number: initValues["Reduction"],
                    ...properties,
                    ...styles,
                    ...tiles,
                });
                break;
            case "Freehand":
            case "Free hand":
                this.freehandValueInheritance = new StandardValueInheritance({
                    number: initValues["Free hand"],
                    ...properties,
                    ...styles,
                    ...tiles,
                });
                break;
            case "Free text":
                styles.interiorColor = styles.TextColor;
                this.freeTextValueInheritance = new StandardValueInheritance({
                    number: initValues["Free text"],
                    ...properties,
                    ...styles,
                });
                break;
            case "Polyline":
                this.polylineValueInheritance = new LineValueInheritance({
                    number: initValues["Polyline"],
                    ...properties,
                    ...styles,
                    ...tiles,
                });
                break;
            case "Arrow":
                styles.geometraOpacity = styles.geometraBorderOpacity;
                this.arrowValueInheritance = new LineValueInheritance({
                    number: initValues["Arrow"],
                    ...properties,
                    ...styles,
                });
                break;
            case "Point":
                this.pointValueInheritance = new PointValueInheritance({
                    number: initValues["Point"],
                    ...properties,
                    ...styles,
                });
                break;
            case "Stamp":
                this.stampValueInheritance = new StandardValueInheritance({
                    number: initValues["Stamp"],
                    ...properties,
                    ...styles,
                });
                break;
            default:
                break;
        }
        this.typeInheritanceMap = new Immutable.Map();
        this.typeInheritanceMap = this.typeInheritanceMap.set("Ellipse", this.ellipseValueInheritance);
        this.typeInheritanceMap = this.typeInheritanceMap.set("Free hand", this.freehandValueInheritance);
        this.typeInheritanceMap = this.typeInheritanceMap.set("Free Hand", this.freehandValueInheritance);
        this.typeInheritanceMap = this.typeInheritanceMap.set("Reduction", this.reductionValueInheritance);
        this.typeInheritanceMap = this.typeInheritanceMap.set("Polygon", this.polygonValueInheritance);
        this.typeInheritanceMap = this.typeInheritanceMap.set("Polyline", this.polylineValueInheritance);
        this.typeInheritanceMap = this.typeInheritanceMap.set("Point", this.pointValueInheritance);
        this.typeInheritanceMap = this.typeInheritanceMap.set("Free text", this.freeTextValueInheritance);
        this.typeInheritanceMap = this.typeInheritanceMap.set("Free Text", this.freeTextValueInheritance);
        this.typeInheritanceMap = this.typeInheritanceMap.set("Stamp", this.stampValueInheritance);
        this.typeInheritanceMap = this.typeInheritanceMap.set("Arrow", this.arrowValueInheritance);

        sessionStorage.setItem(
            "inheritance",
            JSON.stringify(Object.assign({}, JSON.parse(sessionStorage.getItem("inheritance")), this.typeInheritanceMap.toJS()))
        );
    },
    sumValuesForMultipleAnnotations(annotations, selectionType) {
        return annotations
            .filter((ano) => {
                if (selectionType !== "Reduction" && ano.get("type") === "Reduction") {
                    return false;
                }
                return ano.has("annotationData");
            })
            .map((annot) => {
                if (annotations.size > 1) {
                    return annot
                        .get("annotationData")
                        .delete("ESTIMATE.ANNOTATION_VALUES.LENGTHS")
                        .delete("ESTIMATE.ANNOTATION_VALUES.WALLS")
                        .delete("ESTIMATE.ANNOTATION_VALUES.REDUCTIONS")
                        .delete("ESTIMATE.ANNOTATION_VALUES.OUTER_DIM_X")
                        .delete("ESTIMATE.ANNOTATION_VALUES.OUTER_DIM_Y")
                        .delete("ESTIMATE.ANNOTATION_VALUES.RADIUS_X")
                        .delete("ESTIMATE.ANNOTATION_VALUES.RADIUS_Y")
                        .delete("ESTIMATE.ANNOTATION_VALUES.DIAMETER_X")
                        .delete("ESTIMATE.ANNOTATION_VALUES.DIAMETER_Y");
                } else {
                    return annot.get("annotationData");
                }
            })
            .reduce((acc, next) => {
                if (!acc.isEmpty()) {
                    return acc.mergeWith((oldVal, newVal) => {
                        if (!Immutable.List.isList(oldVal)) {
                            if (Number(oldVal)) {
                                oldVal = Number(oldVal);
                            }
                            if (Number(newVal)) {
                                newVal = Number(newVal);
                            }
                            return newVal + (oldVal ? oldVal : 0.0);
                        } else {
                            return oldVal.concat(newVal);
                        }
                    }, next);
                } else {
                    return next;
                }
            }, new Immutable.Map({}));
    },
    // getMergedFolderData() {
    //     const folders = this.selectedParentFolders;
    //     if (folders.length > 0) {
    //         const name = folders[0].name;
    //         const number = folders[0].number;
    //         const id = folders[0].id;
    //         const foldersName = folders.every((annot) => annot.name === name);
    //         const foldersNumber = folders.every((annot) => annot.number === number);
    //         const foldersId = folders.every((annot) => annot.id === id);
    //         return { name: foldersName ? name : undefined, number: foldersNumber ? number : undefined, id: foldersId ? id : undefined };
    //     }
    //     return {};
    // },
    getAnnotListWithIFCStatuses(annotList) {
        return annotList.map((annot) => (annot.get("type") === "3DModel" ? annot.set("status", annot.getIn(["xfdf", "status"])) : annot));
    },
    //-----------------------------PDF-Tron---------------------------------------
    async createWebViewer(fileId, element) {
        this.onSetActiveFileId(fileId);
        this.onSetActivePageId(1);
        this.onSetActiveParentId(undefined, true);
        this.documentLoaded = false;
        this.WebViewer = await new WebViewer(
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
                isReadOnly: !AuthenticationStore.getRole(),
                disabledElements: [
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
            element
        );
        this.WebViewer.disableElements(["redoButton", "undoButton"]);
        this.WebViewer.hotkeys.off(this.WebViewer.hotkeys.Keys.CTRL_Z);
        this.WebViewer.hotkeys.off(this.WebViewer.hotkeys.Keys.CTRL_Y);
        this.element = element;
        if (AuthenticationStore.getRole()) {
            this.webviewerInit = new WebviewerInit(this.WebViewer);
        } else {
            this.webviewerInit = new ViewerWebViewerInit(this.WebViewer);
        }
        const Feature = this.WebViewer.Feature;
        this.WebViewer.disableFeatures([Feature.Copy]);
        this.webviewerInit.init();
        if (!localStorage.getItem("toggleSnapOn")) {
            localStorage.setItem("toggleSnapOn", "false");
        }
        this.snaponEnabled = localStorage.getItem("toggleSnapOn");
        if (!localStorage.getItem("calculatePageLayout")) {
            localStorage.setItem("calculatePageLayout", "single");
        }
        this.displayMode = localStorage.getItem("calculatePageLayout");

        if (!localStorage.getItem("snapMode")) {
            localStorage.setItem("snapMode", "end-of-line");
        }
        this.snapMode = localStorage.getItem("snapMode");
        this.initializeEventHandlers();
        this.trigger("displayModeUpdated");
        this.trigger("snapModeUpdated");
        this.trigger("toggleSnapon");
        this.WebViewer.contextMenuPopup.update([]);
    },
    setContextMenuPopupContent({ selectionList }) {
        if (this.WebViewer && selectionList && selectionList.length > 0 && this.currentToolMode === "AnnotationEdit") {
            const contextArray = [];
            selectionList.forEach((annot) => {
                switch (annot.type) {
                    case "Polygon":
                    case "Line":
                    case "Polyline":
                    case "Free hand":
                        //change onClick
                        // contextArray.push({
                        //     type: "actionButton",
                        //     img: Sync,
                        //     onClick: () => this.switchRotationControlEnabled(TreeStore.getCurrentlySelectedNodes(), true),
                        // });
                        break;
                    case "Stamp":
                    case "Free text":
                    case "CenterValue":
                    case "PeripheralValue":
                    case "Point":
                        contextArray.push(
                            {
                                type: "actionButton",
                                img: Redo,
                                onClick: () => this.onRotate(-90),
                            },
                            {
                                type: "actionButton",
                                img: Undo,
                                onClick: () => this.onRotate(90),
                            }
                        );
                        break;
                    default:
                        return;
                }
            });

            const uniqueContextArray = contextArray.filter(
                (item, index) => contextArray.findIndex((obj) => obj.onClick.toString() === item.onClick.toString()) === index
            );
            if (!this.isActiveIfcFile()) this.WebViewer.contextMenuPopup.update(uniqueContextArray);
        } else if (this.WebViewer) {
            this.WebViewer.contextMenuPopup.update([]);
        }
    },
    clampRotation(currentRotation, addedAngle) {
        let newAngle = currentRotation + addedAngle;

        if (newAngle < 0) {
            newAngle = 360 + addedAngle;
        }

        if (newAngle > 360) {
            newAngle = 0 + addedAngle;
        }

        return newAngle;
    },
    onRotate(degrees) {
        //rework
        // let rotationArrays = {};
        // TreeStore.getCurrentlySelectedNodes().forEach((annot) => {
        //     const newRotation = this.clampRotation(annot.get("rotation") || 0, degrees);
        //     if (!rotationArrays[newRotation]) {
        //         rotationArrays[newRotation] = new Immutable.List();
        //     }
        //     rotationArrays[newRotation] = rotationArrays[newRotation].push(annot);
        // });
        // Object.keys(rotationArrays).forEach((rotation) => {
        //     this.changeRotation(rotationArrays[rotation], rotation);
        // });
    },
    showUsUnits() {
        const selection = this.getSelectedAnnotations();
        if (selection && selection.first()) {
            return (
                ProjectsStore.getProjectUnitsByID(this.getProjectIdFromEstimateId(selection.first().getIn(["storeAnnnotation", "geoEstimate", "id"]))) ===
                "imperial"
            );
        }
        return false;
    },
    toUsValue(value) {
        return toUS(value, "m");
    },
    toUsVolume(value) {
        return toUSvolume(value, "m3");
    },
    toUsSquared(value) {
        return toUSsquared(value, "m2");
    },
    removePointFromAnnotationFromConfig(pdfAnnot, pointIndex) {
        if (this.WebViewer && pdfAnnot) {
            // Modify lock applied from config
            let storeAnnotation = this.getAnnotationByAnnotationId(pdfAnnot.Id);
            if (storeAnnotation) {
                pdfAnnot.Hidden = true;
                const oSerializer = new XMLSerializer();

                let vertices = undefined;
                const parser = new DOMParser();
                const xfdfElements = parser.parseFromString(storeAnnotation.get("xfdf"), "text/xml");
                let element = xfdfElements.getElementsByTagName("vertices")[0];
                if (!element) {
                    element = xfdfElements.getElementsByTagName("gesture")[0];
                }
                if (element) {
                    vertices = element.childNodes[0].nodeValue;
                    if (vertices) {
                        vertices = vertices.split(";").map((point) => {
                            const values = point.split(",");
                            return [parseFloat(values[0]), parseFloat(values[1])];
                        });
                    }
                }
                switch (pdfAnnot.Subject) {
                    case "Polygon":
                    case "Reduction":
                        if (pointIndex === 0 || pointIndex === vertices.length - 1) {
                            vertices.splice(vertices.length - 1, 1);
                            vertices.splice(pointIndex, 1);
                            vertices.push(vertices[0]);
                        } else {
                            vertices.splice(pointIndex, 1);
                        }
                        break;
                    case "Polyline":
                        vertices.splice(pointIndex, 1);
                        break;
                    default:
                        break;
                }
                let updatedVertices = "";
                for (let i = 0; i < vertices.length; i++) {
                    if (i === vertices.length - 1) {
                        updatedVertices += vertices[i][0] + "," + vertices[i][1];
                    } else {
                        updatedVertices += vertices[i][0] + "," + vertices[i][1] + ";";
                    }
                }
                element.childNodes[0].nodeValue = updatedVertices;
                const updatedXFDF = oSerializer.serializeToString(xfdfElements);
                storeAnnotation = storeAnnotation.set("xfdf", updatedXFDF);
                this.onRequestAnnotationUpdateArray(new Immutable.List().push(storeAnnotation));
            }
        }
    },
    addPointToAnnotationFromConfig(pdfAnnot, pointCoordinate, pointIndex) {
        if (this.WebViewer && pdfAnnot) {
            // Modify lock applied from config
            let storeAnnotation = null;
            if (pdfAnnot.Subject === "Reduction") {
                storeAnnotation = this.getReductionByAnnotationId(pdfAnnot.Id);
            } else {
                storeAnnotation = this.getAnnotationByAnnotationId(pdfAnnot.Id);
            }
            if (storeAnnotation) {
                pdfAnnot.Hidden = true;
                const oSerializer = new XMLSerializer();

                let vertices = undefined;
                const parser = new DOMParser();
                const xfdfElements = parser.parseFromString(storeAnnotation.get("xfdf"), "text/xml");
                let element = xfdfElements.getElementsByTagName("vertices")[0];
                if (!element) {
                    element = xfdfElements.getElementsByTagName("gesture")[0];
                }
                if (element) {
                    vertices = element.childNodes[0].nodeValue;
                    if (vertices) {
                        vertices = vertices.split(";").map((point) => {
                            const values = point.split(",");
                            return [parseFloat(values[0]), parseFloat(values[1])];
                        });
                    }
                }

                const newCoord = [pointCoordinate.x, pointCoordinate.y];
                vertices.splice(pointIndex, 0, newCoord);
                let updatedVertices = "";
                for (let i = 0; i < vertices.length; i++) {
                    if (i === vertices.length - 1) {
                        updatedVertices += vertices[i][0] + "," + vertices[i][1];
                    } else {
                        updatedVertices += vertices[i][0] + "," + vertices[i][1] + ";";
                    }
                }
                element.childNodes[0].nodeValue = updatedVertices;
                const updatedXFDF = oSerializer.serializeToString(xfdfElements);
                storeAnnotation = storeAnnotation.set("xfdf", updatedXFDF);

                this.onRequestAnnotationUpdateArray(new Immutable.List().push(storeAnnotation));
            }
        }
    },
    parseFormulaFromConfig(pdfAnnotation, formula, key) {
        try {
            if (pdfAnnotation && formula) {
                switch (pdfAnnotation.Subject) {
                    case "Polygon":
                    case "annotation.freeHand":
                    case "Free hand":
                    case "Free Hand":
                    case "Reduction":
                        const scale = this.getScaleForFileAndPage(this.getActiveFileId(), pdfAnnotation.PageNumber);
                        //height, quantity, xScale, geoFile, yScale = undefined
                        const calculator = new GeometricCalculation(pdfAnnotation.annotationHeight, 1, scale.get("x-scale"), undefined, scale.get("y-scale"));
                        let vertices = undefined;
                        if (pdfAnnotation.Subject === "annotation.freeHand" || pdfAnnotation.Subject === "Free Hand" || pdfAnnotation.Subject === "Free hand") {
                            vertices = pdfAnnotation.getPath(0).map((point) => {
                                return [point.x, point.y];
                            });
                        } else {
                            vertices = pdfAnnotation.getPath().map((point) => {
                                return [point.x, point.y];
                            });
                        }
                        let annotationData = Immutable.fromJS(calculator.calculatePolygonValues(vertices));
                        if (pdfAnnotation.Subject === "Polygon") {
                            let value = annotationData.get(key);
                            const reductions = this.getReductionByParentAnnotationId(pdfAnnotation.Id);
                            reductions.forEach((storeReduction) => {
                                const reductionCalculator = new GeometricCalculation(
                                    storeReduction.get("height"),
                                    storeReduction.get("quantity"),
                                    scale.get("x-scale"),
                                    undefined,
                                    scale.get("y-scale")
                                );
                                const vertices = reductionCalculator.getVerticesFromXfdf(storeReduction.get("xfdf"));
                                const reductionAnnotationData = Immutable.fromJS(reductionCalculator.calculatePolygonValues(vertices));
                                value -= reductionAnnotationData.get(key);
                            });
                            annotationData = annotationData.set(key, value);
                        }

                        const result = CalculationStore.parseExpressionToValues(annotationData.get(key) + formula, annotationData);
                        return result;
                    case "Ellipse": {
                        const scale = this.getScaleForFileAndPage(this.getActiveFileId(), pdfAnnotation.PageNumber);
                        const calculator = new GeometricCalculation(pdfAnnotation.annotationHeight, 1, scale.get("x-scale"), undefined, scale.get("y-scale"));
                        const rect = pdfAnnotation.getRect();
                        const calcRect = [];
                        calcRect.push(rect.x1);
                        calcRect.push(rect.y1);
                        calcRect.push(rect.x2);
                        calcRect.push(rect.y2);
                        const annotationData = Immutable.fromJS(calculator.calculateEllipseValues(calcRect));

                        const result = CalculationStore.parseExpressionToValues(annotationData.get(key) + formula, annotationData);
                        return result;
                    }
                    case "Polyline": {
                        const scale = this.getScaleForFileAndPage(this.getActiveFileId(), pdfAnnotation.PageNumber);
                        const vertices = pdfAnnotation.getPath().map((point) => {
                            return [point.x, point.y];
                        });
                        const calculator = new GeometricCalculation(pdfAnnotation.annotationHeight, 1, scale.get("x-scale"), undefined, scale.get("y-scale"));
                        const annotationData = Immutable.fromJS(calculator.calculateLineValues(vertices));

                        const result = CalculationStore.parseExpressionToValues(annotationData.get(key) + formula, annotationData);
                        return result;
                    }
                    default:
                        break;
                }
            }
        } catch (error) {
            console.log("erro in parseFormulaFromConfig: " + error.stack);
        }
    },
    cleanup() {
        if (this.element && this.element.querySelector("iframe").contentWindow) {
            const innerDoc = this.element.querySelector("iframe").contentWindow.document;
            innerDoc.querySelector("body").removeEventListener("keydown", handleCalculateKeyDown);
            innerDoc.querySelector("body").removeEventListener("keydown", handleAnnotationStoreKeyDown);
            innerDoc.querySelector("body").removeEventListener("keyup", handleAnnotationStoreKeyUp);
            innerDoc.querySelector("body").removeEventListener("mousedown", handleCalculateMouseDown);
            innerDoc.querySelector("body").removeEventListener("mouseup", handleCalculateMouseUp);
            innerDoc.querySelector("body").removeEventListener("dblclick", handleDoubleClick);
        }
        if (this.WebViewer) {
            this.WebViewer.dispose();
            this.WebViewer = undefined;
        }
        if (this.webviewerInit) {
            this.webviewerInit.cleanup();
            this.webviewerInit = undefined;
        }
        this.documentLoaded = false;
    },
    getAnnotationsLists() {
        let annotationsList = [];
        const { selectionList } = ObjectsStore.getSelectionList();
        selectionList.forEach((annot) => {
            let currentNodeList = [annot];
            if (annot.type === ANNOT_TYPES.GROUP) {
                const allFolderChilds = TreeStoreV2.getAllChildrensForFolder(annot.id);
                currentNodeList.push(..._.map(allFolderChilds, ({ data }) => data));
            }
            if (annot.type === ANNOT_TYPES.POLYGON) {
                const reductions = TreeStoreV2.getAllChildrensForPolygon(annot.annotationId);
                if (reductions.length) currentNodeList.push(..._.map(reductions, ({ data }) => data));
            }
            currentNodeList.forEach((node) => {
                if (annotationsList.every((selectedAnnot) => selectedAnnot.id !== node.id)) {
                    if (AuthenticationStore.getRole()) {
                        annotationsList.push(node);
                    } else {
                        if (annot.type === ANNOT_TYPES.ARROW || annot.type === ANNOT_TYPES.FREE_TEXT) {
                            annotationsList = annotationsList.push(annot);
                        }
                    }
                }
            });
        });

        return this.groupAnnotsByPreventEditing(annotationsList);
    },
    groupAnnotsByPreventEditing(annotations) {
        let readWriteAnnots = [];
        let readOnlyAnnots = [];

        annotations.forEach((annot) => {
            if (annot.type === ANNOT_TYPES.IFC_MODEL) {
                const isReadOnlyChecked = annot.xfdf.readOnly;
                if (!isReadOnlyChecked) readWriteAnnots.push(annot);
                else readOnlyAnnots.push(annot);
                return;
            }
            if (annot.type !== ANNOT_TYPES.GROUP && annot.type !== ANNOT_TYPES.X_SCALE && annot.type !== ANNOT_TYPES.Y_SCALE) {
                if (!annot.readOnly) {
                    readWriteAnnots.push(annot);
                } else readOnlyAnnots.push(annot);
            } else {
                readWriteAnnots.push(annot);
            }
        });
        return { readWriteList: readWriteAnnots, readOnlyList: readOnlyAnnots };
    },
    changeAnnotsStatus(value) {
        const annotsList = this.getAnnotationsLists().readWriteList;

        if (annotsList.length > 0) {
            this.onRequestAnnotationUpdate({
                annots: annotsList,
                key: "status",
                value,
            });
        }
    },

    clearTreeSelection() {
        ObjectsStore.clearSelection();
    },

    initializeEventHandlers() {
        if (this.WebViewer) {
            const file = FileStore.getFileById(this.ActiveFileId);
            let filename = "";
            if (file) {
                filename = file.name;
            }
            this.pageCount = undefined;
            this.documentLoaded = false;
            this.WebViewer.loadDocument(this.bucketURL + this.ActiveFileId, {
                documentId: this.ActiveFileId,
                filename: filename,
            });
            let keysCurrentlyPressed = {};
            const documentViewer = this.WebViewer.docViewer;
            const innerDoc = this.element.querySelector("iframe").contentWindow.document;
            innerDoc.querySelector("body").addEventListener("keydown", function (e) {
                const key = e.keyCode || e.charCode;
                if (keysCurrentlyPressed[key]) {
                    e.stopPropagation();
                    e.preventDefault();
                } else {
                    keysCurrentlyPressed[key] = true;
                    handleCalculateKeyDown(e);
                }
            });
            innerDoc.querySelector("body").addEventListener("keydown", handleAnnotationStoreKeyDown);
            innerDoc.querySelector("body").addEventListener("keyup", function (e) {
                const key = e.keyCode || e.charCode;
                delete keysCurrentlyPressed[key];
                handleAnnotationStoreKeyUp(e);
            });
            innerDoc.querySelector("body").addEventListener("mousedown", handleCalculateMouseDown);
            innerDoc.querySelector("body").addEventListener("mouseup", handleCalculateMouseUp);
            innerDoc.querySelector("body").addEventListener("dblclick", handleDoubleClick);
            const annotationManager = this.WebViewer.annotManager;
            documentViewer.addEventListener("keyDown", (nativeEvent) => {
                switch (nativeEvent.key) {
                    case "Control":
                        this.setIsCtrlPressed(true);
                        break;
                    case "Alt":
                        this.setIsAltPressed(true);
                        break;
                }
            });
            documentViewer.addEventListener("keyUp", (nativeEvent) => {
                switch (nativeEvent.key) {
                    case "Control":
                        this.setIsCtrlPressed(false);
                        break;
                    case "Alt":
                        this.setIsAltPressed(false);
                        break;
                }
            });
            documentViewer.addEventListener("mouseLeftDown", () => {
                const selection = ObjectsStore.getSelectionList().selectionList;
                if (selection.length > 0 && annotationManager.getSelectedAnnotations().length === 0 && !this.isCtrlPressed) {
                    this.clearTreeSelection();
                }
                this.trigger("closeSubMenu");
            });
            documentViewer.addEventListener("fitModeUpdated", () => {
                if (this.fitModeButtonPressed) {
                    this.fitModeButtonPressed = false;
                    this.WebViewer.setCurrentPageNumber(this.WebViewer.getCurrentPageNumber());
                }
            });
            annotationManager.addEventListener("annotationChanged", async (annotations, action, { imported }) => {
                if (!imported) {
                    switch (action) {
                        case "add":
                            await annotationManager.exportAnnotationCommand();
                            forEach(annotations, (annot) => {
                                if (annot.Subject === "x-scale" || annot.Subject === "y-scale") {
                                    annotationManager.exportAnnotations({ annotList: [annot] }).then((xfdf) => {
                                        try {
                                            this.onRequestScaleCreate(xfdf, annot.Subject, this.ActiveFileId, annot.getPageNumber(), annot.length || 1);
                                        } catch (error) {
                                            console.log("error: ", error.stack);
                                        }
                                    });
                                } else {
                                    if (annot.Subject !== "Stamp" && annot.Subject !== "Free text") {
                                        annotationManager.deleteAnnotation(annot, true, true);
                                    }
                                    if (annot.Subject === "Free text") {
                                        annot.setContents(i18n.t("GENERAL.COMMENT"));
                                    }
                                    annotationManager.exportAnnotations({ annotList: [annot] }).then((xfdf) => {
                                        const xfdfWeightInMB = xfdf.length / 100000;
                                        if (annot.Subject === "Stamp" && xfdfWeightInMB > 5) {
                                            annotationManager.deleteAnnotations([annot]);
                                            this.deSelectAllAnnotationsFromGui();
                                            this.trigger("showStampTooHeavyDialog");
                                        } else {
                                            this.onRequestAnnotationCreate(
                                                Immutable.fromJS([
                                                    {
                                                        annotXfdf: xfdf,
                                                        type: annot.Subject,
                                                        fileId: this.ActiveFileId,
                                                        annotationId: annot.Id,
                                                        parentId: this.ActiveParentId,
                                                    },
                                                ])
                                            );
                                        }
                                    });
                                }
                            });
                            break;
                        case "modify":
                            const annotCmd = await annotationManager.exportAnnotationCommand();
                            const annotCmdHandler = new AnnotCommandHandler();
                            const annotList = annotCmdHandler.getModifyList(annotCmd);
                            const annotationsToUpdate = { annots: [], key: "preview" };
                            const length = annotList.length;
                            let j = 0;
                            for (j = 0; j < length; j++) {
                                if (!annotList[0]) continue;
                                const currentAnnot = annotations.find((annot) => annot.xy === annotList[0].getAttribute("name"));
                                const { geoEstimateId, geoFileId, annotationType, geoAnnotId, geoParentId, pageNumber } = currentAnnot;
                                let isScale = false;
                                let annotToUpdate = undefined;
                                let xfdf = undefined;

                                switch (currentAnnot.annotationType) {
                                    case ANNOT_TYPES.REDUCTION:
                                        annotToUpdate = ObjectsStore.getReductionByPDFTronAnnot({ geoEstimateId, geoFileId, geoAnnotId, geoParentId });
                                        xfdf = annotToUpdate?.xfdf;
                                        break;
                                    case ANNOT_TYPES.X_SCALE:
                                    case ANNOT_TYPES.Y_SCALE:
                                        annotToUpdate = ObjectsStore.getScaleByPDFTronAnnot({ geoEstimateId, geoFileId, annotationType, pageNumber });
                                        xfdf = annotToUpdate?.xdf;
                                        isScale = true;
                                        break;
                                    default:
                                        annotToUpdate = ObjectsStore.getAnnotationByPDFTronAnnot({ geoEstimateId, geoFileId, geoAnnotId });
                                        xfdf = annotToUpdate?.xfdf;
                                        break;
                                }
                                if (!annotToUpdate) continue;
                                const parser = new DOMParser();
                                const xfdfToUpdate = parser.parseFromString(xfdf, "text/xml");
                                const annots = xfdfToUpdate.querySelector("annots");
                                let groupedAnnotIds;
                                if (currentAnnot?.getGroupedChildren().length > 0) {
                                    groupedAnnotIds = currentAnnot.getGroupedChildren().map((item) => item.xy);
                                    if (groupedAnnotIds?.length) groupedAnnotIds.push(currentAnnot.xy);
                                } else if (currentAnnot?.isGrouped()) {
                                    groupedAnnotIds = annotations
                                        .find((annot) => annot.xy === currentAnnot.InReplyTo)
                                        ?.getGroupedChildren()
                                        .map((item) => item.xy);
                                    if (groupedAnnotIds?.length) groupedAnnotIds.push(currentAnnot.InReplyTo);
                                }
                                if (groupedAnnotIds?.length) annotList[0].setAttribute("groupedAnnotIds", JSON.stringify(groupedAnnotIds));

                                annots.removeChild(annots.firstElementChild);
                                annots.appendChild(annotList[0]);
                                const oSerializer = new XMLSerializer();
                                const annotString = oSerializer.serializeToString(xfdfToUpdate);
                                if (!isScale) {
                                    annotationsToUpdate.annots.push({ id: annotToUpdate.id, xfdf: annotString });
                                } else {
                                    this.onRequestScaleUpdate2({ scale: { ...annotToUpdate, xdf: annotString }, key: "preview" });
                                }
                            }
                            try {
                                if (annotationsToUpdate.annots.length > 0) this.onRequestAnnotationUpdate(annotationsToUpdate);
                            } catch (error) {
                                console.log("Error | Modify: " + error);
                            }
                            break;
                        // case "delete":
                        //     await annotationManager.exportAnnotationCommand();
                        //     this.annotationsToDeleteByPdfTron = this.annotationsToDeleteByPdfTron.clear();
                        //     forEach(annotations, (annot) => {
                        //         let storeAnnotation = undefined;
                        //         if (annot.Subject === "x-scale" || annot.Subject === "y-scale") {
                        //             return;
                        //         } else if (annot.Subject === "Reduction") {
                        //             storeAnnotation = this.getReductionByAnnotationId(annot.Id);
                        //         } else {
                        //             storeAnnotation = this.getAnnotationByAnnotationId(annot.Id);
                        //         }
                        //         if (storeAnnotation) {
                        //             this.annotationsToDeleteByPdfTron = this.annotationsToDeleteByPdfTron.push(storeAnnotation);
                        //         }
                        //     });
                        //     this.onTriggerDeleteAnnotations();
                        //     this.annotationManagerSelectionLock = false;
                        //     break;
                        default:
                            break;
                    }
                }
            });

            const getAnnotationWhenSelect = ({ annot, annotationList }) => {
                switch (annot.Subject) {
                    case "x-scale":
                    case "y-scale":
                        if (annotationList.length > 1) {
                            annotationManager.deselectAnnotation(annot);
                            return null;
                        } else {
                            return ObjectsStore.getScaleByPDFTronAnnot(annot);
                        }
                    case "Reduction":
                        this.initPdfAnnotationAsSelected(annot);
                        return ObjectsStore.getReductionByPDFTronAnnot(annot);
                    default:
                        this.initPdfAnnotationAsSelected(annot);
                        return ObjectsStore.getAnnotationByPDFTronAnnot(annot);
                }
            };
            const getAnnotationWhenDeselect = ({ annot }) => {
                switch (annot.Subject) {
                    case "x-scale":
                    case "y-scale":
                        return ObjectsStore.getScaleByPDFTronAnnot(annot);
                    case "Reduction":
                        this.initPdfAnnotationAsDeselected(annot);
                        return ObjectsStore.getReductionByPDFTronAnnot(annot);
                    default:
                        this.initPdfAnnotationAsDeselected(annot);
                        return ObjectsStore.getAnnotationByPDFTronAnnot(annot);
                }
            };

            const setReductionDrawingToolIfPolygonType = () => {
                if (annotationManager.getSelectedAnnotations().length === 1 && annotationManager.getSelectedAnnotations()[0].Subject === "Polygon") {
                    this.setActiveReductionParentId(annotationManager.getSelectedAnnotations()[0]);
                    AppBarActions.enableReductionDrawingTool();
                } else if (this.currentToolMode !== "AnnotationCreateReduction") {
                    AppBarActions.disableReductionDrawingTool();
                }
            };

            annotationManager.addEventListener("annotationSelected", (annotationList, action) => {
                if (this.annotationManagerSelectionLock) return;
                switch (action) {
                    case "selected":
                        const newlySelected = [];
                        forEach(annotationList, (annot) => {
                            const storedAnnot = getAnnotationWhenSelect({ annot, annotationList });
                            if ((storedAnnot && annot.annotationType === ANNOT_TYPES.X_SCALE) || annot.annotationType === ANNOT_TYPES.Y_SCALE) {
                                const { geoEstimateId, geoFileId, annotationType, pageNumber } = annot;
                                ObjectsStore.selectScale({
                                    scaleType: annotationType,
                                    activeEstimateId: geoEstimateId,
                                    fileId: geoFileId,
                                    activePage: pageNumber,
                                });
                                return;
                            }
                            if (storedAnnot) newlySelected.push(storedAnnot);
                        });
                        if (newlySelected.length) ObjectsStore.selectListOfObjects(newlySelected, [], this.isCtrlPressed);
                        break;
                    case "deselected":
                        if (annotationList) {
                            const newlyDeselected = [];
                            forEach(annotationList, (annot) => {
                                const storedAnnot = getAnnotationWhenDeselect({ annot });
                                if (annot.annotationType === ANNOT_TYPES.X_SCALE || annot.annotationType === ANNOT_TYPES.Y_SCALE) {
                                    const { geoEstimateId, geoFileId, annotationType, pageNumber } = annot;
                                    ObjectsStore.deselectScale({
                                        scaleType: annotationType,
                                        activeEstimateId: geoEstimateId,
                                        fileId: geoFileId,
                                        activePage: pageNumber,
                                    });
                                    return;
                                }
                                if (storedAnnot) newlyDeselected.push(storedAnnot);
                            });
                            const deselectMainFolders = !annotationManager.getSelectedAnnotations().length && !this.isCtrlPressed;
                            ObjectsStore.deselectAnnotations(newlyDeselected, deselectMainFolders);
                        } else {
                            ObjectsStore.clearSelection();
                        }
                        break;
                    default:
                        break;
                }

                setReductionDrawingToolIfPolygonType();
            });
            this.WebViewer.docViewer.addEventListener("documentLoaded", async () => {
                this.documentLoaded = true;
                this.userLoadingAnnotations = false;
                const annotationManager = this.WebViewer.annotManager;
                const file = FileStore.getFileById(this.ActiveFileId);
                this.pageRotation = this.WebViewer.docViewer.getCompleteRotation(this.WebViewer.docViewer.getCurrentPage());
                if (file && file.rotation) {
                    let rotations = JSON.parse(file.rotation);
                    rotations = omit(rotations, ["0"]);
                    this.WebViewer.docViewer.setPageRotations(rotations);
                }
                this.setToolMode(this.WebViewer.Tools.ToolNames.EDIT);
                this.setDisplayMode(localStorage.getItem("calculatePageLayout"));
                this.WebViewer.setSideWindowVisibility(false); // Removes the thumbnails panel
                annotationManager.disableFreeTextEditing();
                try {
                    this.pageCount = this.WebViewer.docViewer.getPageCount();
                    await this.loadAllAnnotations();
                } catch (error) {
                    console.log("error 2" + error);
                }
                TreeStoreV2.clearSelectedAnnotations();
                this.trigger("documentLoaded");
            });
            this.WebViewer.docViewer.addEventListener("annotationsLoaded", async () => {
                this.pageCount = this.WebViewer.docViewer.getPageCount();
                this.trigger("pageRendered");
                this.trigger("annotationsLoaded");
            });
            this.WebViewer.docViewer.addEventListener("pageNumberUpdated", () => {
                this.onSetActivePageId(this.WebViewer.getCurrentPageNumber());
                if (this.webviewerInit && this.webviewerInit.isDrawing()) {
                    const prevMode = this.currentToolMode;
                    if (this.WebViewer.ToolMode) {
                        this.setToolMode(this.WebViewer.ToolMode.AnnotationEdit);
                    }
                    this.setToolMode(prevMode);
                    this.webviewerInit.setIsDrawing(false);
                } else if (this.getAnnotationTableFilter() === "PageAndFile") {
                    TreeStoreV2.clearSelectedAnnotations();
                }
            });
            this.WebViewer.docViewer.addEventListener("toolModeUpdated", () => {
                if (this.currentToolMode !== "AnnotationCreateReduction") {
                    AppBarActions.disableReductionDrawingTool();
                }
                if (this.currentToolMode === "AnnotationEdit") {
                    this.WebViewer.Tools.Tool.ENABLE_ANNOTATION_HOVER_CURSORS = true;
                } else {
                    this.WebViewer.Tools.Tool.ENABLE_ANNOTATION_HOVER_CURSORS = false;
                }
                if (this.currentToolMode !== this.WebViewer.getToolMode()) {
                    this.setToolMode(this.currentToolMode);
                    this.updateSelectedTool();
                }
            });
            AppBarActions.disableReductionDrawingTool();
        }
    },

    updatePageRotationState() {
        this.pageRotation = this.WebViewer?.docViewer.getCompleteRotation(this.WebViewer.docViewer.getCurrentPage()) || 0;
    },
    getPageRotation() {
        return this.pageRotation;
    },

    async loadAllAnnotations() {
        this.userLoadingAnnotations = true;
        try {
            await this.loadAnnotations();
        } catch (e) {
            console.log("Error | Loading Annotations: " + e);
        }
        try {
            await this.loadScales();
        } catch (e) {
            console.log(e);
        }
        await this.WebViewer.annotManager.drawAnnotationsFromList(this.WebViewer.annotManager.getAnnotationsList());
        await this.WebViewer.annotManager.exportAnnotationCommand();
        if (this.jumpAnnotId) {
            this.jumpToAnnotation(this.jumpAnnotId, true);
            this.jumpAnnotId = undefined;
        } else {
            this.WebViewer.setCurrentPageNumber(FileStore.getLastViewedPageNr());
        }
    },

    setScaleStyleValues(annotationList, copyAction, immutableAnnot, updatedXFDF) {
        if (!copyAction) {
            this.onRequestScaleUpdate(immutableAnnot, updatedXFDF);
        }

        return annotationList.push(
            Immutable.fromJS({
                type: immutableAnnot.get("type"),
                annotationId: immutableAnnot.get("annotationId"),
                xdf: updatedXFDF,
            })
        );
    },

    changeColor(annotationsImmutableList, color, copyAction = false) {
        try {
            if (this.WebViewer && annotationsImmutableList) {
                let annotationChangedColorList = new Immutable.List();
                const parser = new DOMParser();
                const oSerializer = new XMLSerializer();
                annotationsImmutableList.forEach((immutableAnnot) => {
                    if (immutableAnnot.get("type") !== "group") {
                        let xfdfElements = undefined;
                        if (immutableAnnot.get("type") === "x-scale" || immutableAnnot.get("type") === "y-scale") {
                            xfdfElements = parser.parseFromString(immutableAnnot.get("xdf"), "text/xml");
                        } else {
                            xfdfElements = parser.parseFromString(immutableAnnot.get("xfdf"), "text/xml");
                        }
                        if (this.typeInheritanceMap.get(this.getTypeConversion(immutableAnnot.get("type")))) {
                            this.typeInheritanceMap.get(this.getTypeConversion(immutableAnnot.get("type"))).setColor(color);
                        }
                        const annotations = get(xfdfElements.querySelector("annots"), "children");
                        forEach(annotations, (annotElement) => {
                            switch (this.getTypeConversion(immutableAnnot.get("type"))) {
                                case "Point":
                                case "Polygon":
                                case "Ellipse":
                                case "Free Hand":
                                case "Free hand":
                                case "Reduction":
                                case "Stamp":
                                    annotElement.setAttribute("color", color);
                                    break;
                                case "Polyline":
                                case "Arrow":
                                case "x-scale":
                                case "y-scale":
                                    annotElement.setAttribute("color", color);
                                    break;
                                case "FreeText":
                                case "Free text":
                                case "Freetext":
                                case "Free Text":
                                    annotElement.setAttribute("TextColor", color);
                                    break;
                                default:
                                    break;
                            }
                        });

                        const updatedXFDF = oSerializer.serializeToString(xfdfElements);

                        if (immutableAnnot.get("type") === "x-scale" || immutableAnnot.get("type") === "y-scale") {
                            annotationChangedColorList = this.setScaleStyleValues(annotationChangedColorList, copyAction, immutableAnnot, updatedXFDF);
                        } else {
                            annotationChangedColorList = annotationChangedColorList.push(
                                Immutable.fromJS({
                                    type: immutableAnnot.get("type"),
                                    annotationId: immutableAnnot.get("annotationId"),
                                    xfdf: updatedXFDF,
                                })
                            );
                        }
                    }
                });
                if (copyAction) {
                    return annotationChangedColorList;
                } else if (annotationChangedColorList.size > 0) {
                    this.onRequestAnnotationUpdateArray(annotationChangedColorList);
                }
            }
        } catch (error) {
            console.log("Error | Changing Color: " + error.stack);
        }
    },
    changeColor2(annots, value) {
        try {
            if (this.WebViewer && annots) {
                if (annots.type === X_SCALE_NAME || annots.type === Y_SCALE_NAME) {
                    this.onRequestScaleUpdate2({ id: annots.id, value, parameter: "color" });
                    return;
                }

                const updateColorData = {
                    annots: [],
                    key: "color",
                    value,
                };
                const updateTextColorData = {
                    annots: [],
                    key: "TextColor",
                    value,
                };

                annots.forEach((annot) => {
                    if (annot.type !== "group") {
                        if (this.typeInheritanceMap.get(this.getTypeConversion(annot.type))) {
                            this.typeInheritanceMap.get(this.getTypeConversion(annot.type)).setColor(value);
                        }

                        switch (this.getTypeConversion(annot.type)) {
                            case "Point":
                            case "Polygon":
                            case "Ellipse":
                            case "Free Hand":
                            case "Free hand":
                            case "Reduction":
                            case "Stamp":
                            case "Polyline":
                            case "Arrow":
                            case "x-scale":
                            case "y-scale":
                                updateColorData.annots.push(annot);
                                break;
                            case "FreeText":
                            case "Free text":
                            case "Freetext":
                            case "Free Text":
                                updateTextColorData.annots.push(annot);
                                break;
                            default:
                                break;
                        }
                    }
                });
                if (updateColorData.annots.length > 0) this.onRequestAnnotationUpdate(updateColorData);
                if (updateTextColorData.annots.length > 0) this.onRequestAnnotationUpdate(updateTextColorData);
            }
        } catch (error) {
            console.log("Error | Changing Color: " + error.stack);
        }
    },
    changeInteriorColor(annotationsImmutableList, color, copyAction = false) {
        try {
            if (this.WebViewer && annotationsImmutableList) {
                let annotationChangedColorList = new Immutable.List();
                const parser = new DOMParser();
                const oSerializer = new XMLSerializer();
                annotationsImmutableList.forEach((immutableAnnot) => {
                    if (immutableAnnot.get("type") !== "group") {
                        let xfdfElements = undefined;
                        if (immutableAnnot.get("type") === "x-scale" || immutableAnnot.get("type") === "y-scale") {
                            xfdfElements = parser.parseFromString(immutableAnnot.get("xdf"), "text/xml");
                        } else {
                            xfdfElements = parser.parseFromString(immutableAnnot.get("xfdf"), "text/xml");
                        }

                        if (this.typeInheritanceMap.get(this.getTypeConversion(immutableAnnot.get("type")))) {
                            this.typeInheritanceMap.get(this.getTypeConversion(immutableAnnot.get("type"))).setInteriorColor(color);
                        }

                        const annotations = get(xfdfElements.querySelector("annots"), "children");

                        forEach(annotations, (annotElement) => {
                            switch (this.getTypeConversion(immutableAnnot.get("type"))) {
                                case "Point":
                                case "Polygon":
                                case "Ellipse":
                                case "Free Hand":
                                case "Free hand":
                                case "Reduction":
                                    annotElement.setAttribute("interior-color", color);
                                    break;
                                case "Polyline":
                                case "x-scale":
                                case "y-scale":
                                    annotElement.setAttribute("interior-color", color);
                                    break;
                                default:
                                    break;
                            }
                        });

                        const updatedXFDF = oSerializer.serializeToString(xfdfElements);

                        if (immutableAnnot.get("type") === "x-scale" || immutableAnnot.get("type") === "y-scale") {
                            annotationChangedColorList = this.setScaleStyleValues(annotationChangedColorList, copyAction, immutableAnnot, updatedXFDF);
                        } else {
                            annotationChangedColorList = annotationChangedColorList.push(
                                Immutable.fromJS({
                                    type: immutableAnnot.get("type"),
                                    annotationId: immutableAnnot.get("annotationId"),
                                    xfdf: updatedXFDF,
                                })
                            );
                        }
                    }
                });
                if (copyAction) {
                    return annotationChangedColorList;
                } else if (annotationChangedColorList.size > 0) {
                    this.onRequestAnnotationUpdateArray(annotationChangedColorList);
                }
            }
        } catch (error) {
            console.log("Error | Changing Interior Color: " + error.stack);
        }
    },

    changeStyle(annotationsImmutableList, style, copyAction = false) {
        try {
            return this.changeAnnotationAttribute(annotationsImmutableList, "style", style, copyAction);
        } catch (error) {
            console.log("Error | Changing style: " + error.stack);
        }
    },

    changeStatus(annotationsImmutableList, value) {
        try {
            if (this.WebViewer && annotationsImmutableList) {
                let immutableAnnotationsList = new Immutable.List();
                const parser = new DOMParser();
                annotationsImmutableList.forEach((immutableAnnotation) => {
                    let xfdfElements = undefined;
                    const oSerializer = new XMLSerializer();
                    let updatedXfdf = undefined;
                    switch (immutableAnnotation.get("type")) {
                        case "x-scale":
                        case "y-scale":
                        case "group":
                        case "CenterValue":
                        case "PeripheralValue":
                            break;
                        default:
                            xfdfElements = parser.parseFromString(immutableAnnotation.get("xfdf"), "text/xml");
                            const annotElement = xfdfElements.querySelector("annots").firstElementChild;
                            annotElement.setAttribute("status", value);
                            updatedXfdf = oSerializer.serializeToString(xfdfElements);
                            const updatedAnnotation = immutableAnnotation.set("xfdf", updatedXfdf);
                            immutableAnnotationsList = immutableAnnotationsList.push(updatedAnnotation);
                    }
                });
                if (immutableAnnotationsList.size > 0) {
                    this.onRequestAnnotationUpdateArray(immutableAnnotationsList);
                }
            }
        } catch (error) {
            console.log("Error | Changing attribute: " + error.stack);
        }
    },

    changeAnnotationAttribute(annotationsImmutableList, property, value, copyAction = false) {
        try {
            if (annotationsImmutableList) {
                let immutableAnnotationsList = new Immutable.List();
                const parser = new DOMParser();
                annotationsImmutableList.forEach((immutableAnnotation) => {
                    if (immutableAnnotation.get("type") !== "group") {
                        let xfdfElements = undefined;
                        const oSerializer = new XMLSerializer();
                        let updatedXfdf = undefined;
                        if (immutableAnnotation.get("type") === "x-scale" || immutableAnnotation.get("type") === "y-scale") {
                            xfdfElements = parser.parseFromString(immutableAnnotation.get("xdf"), "text/xml");
                            const scaleElement = xfdfElements.querySelector("annots").children[0];
                            scaleElement.setAttribute(property, value);
                            updatedXfdf = oSerializer.serializeToString(xfdfElements);
                            immutableAnnotation.set("xdf", updatedXfdf);

                            immutableAnnotationsList = this.setScaleStyleValues(immutableAnnotationsList, copyAction, immutableAnnotation, updatedXfdf);
                        } else {
                            xfdfElements = parser.parseFromString(immutableAnnotation.get("xfdf"), "text/xml");
                            immutableAnnotation.set(property, value);
                            const annotationElement = xfdfElements.querySelector("annots").children[0];
                            annotationElement.setAttribute(property, value);
                            updatedXfdf = oSerializer.serializeToString(xfdfElements);
                            if (copyAction) {
                                immutableAnnotation = immutableAnnotation.set("xfdf", updatedXfdf);
                                immutableAnnotationsList = immutableAnnotationsList.push(immutableAnnotation);
                            } else {
                                immutableAnnotationsList = immutableAnnotationsList.push(
                                    Immutable.fromJS({
                                        type: immutableAnnotation.get("type"),
                                        annotationId: immutableAnnotation.get("annotationId"),
                                        xfdf: updatedXfdf,
                                    })
                                );
                            }
                        }
                    }
                });
                if (copyAction) {
                    return immutableAnnotationsList;
                } else if (immutableAnnotationsList.size > 0) {
                    this.onRequestAnnotationUpdateArray(immutableAnnotationsList);
                }
            }
        } catch (error) {
            console.log("Error | Changing attribute: " + error.stack);
        }
    },
    changeStrokeThickness(annotationsImmutableList, thickness, copyAction = false) {
        if (this.WebViewer && annotationsImmutableList) {
            let immutableAnnotationsList = new Immutable.List();
            const parser = new DOMParser();
            annotationsImmutableList.forEach((immutableAnnotation) => {
                let xfdfElements = undefined;
                const oSerializer = new XMLSerializer();
                let updatedXfdf = undefined;
                if (immutableAnnotation.get("type") === "x-scale" || immutableAnnotation.get("type") === "y-scale") {
                    xfdfElements = parser.parseFromString(immutableAnnotation.get("xdf"), "text/xml");
                    const scaleElement = xfdfElements.querySelector("annots").children[0];
                    scaleElement.setAttribute("width", thickness);
                    scaleElement.removeAttribute("strokeSize");
                    updatedXfdf = oSerializer.serializeToString(xfdfElements);
                    immutableAnnotation.set("xdf", updatedXfdf);
                    immutableAnnotationsList = this.setScaleStyleValues(immutableAnnotationsList, copyAction, immutableAnnotation, updatedXfdf);
                } else {
                    this.typeInheritanceMap.get(immutableAnnotation.get("type")).setLineSize(thickness);
                    xfdfElements = parser.parseFromString(immutableAnnotation.get("xfdf"), "text/xml");
                    const annotationElement = xfdfElements.querySelector("annots").children[0];
                    annotationElement.setAttribute("width", thickness);
                    updatedXfdf = oSerializer.serializeToString(xfdfElements);
                    if (copyAction) {
                        immutableAnnotation = immutableAnnotation.set("xfdf", updatedXfdf);
                        immutableAnnotationsList = immutableAnnotationsList.push(immutableAnnotation);
                    } else {
                        immutableAnnotationsList = immutableAnnotationsList.push(
                            Immutable.fromJS({
                                type: immutableAnnotation.get("type"),
                                annotationId: immutableAnnotation.get("annotationId"),
                                xfdf: updatedXfdf,
                            })
                        );
                    }
                }
            });
            if (copyAction) {
                return immutableAnnotationsList;
            } else if (immutableAnnotationsList.size > 0) {
                this.onRequestAnnotationUpdateArray(immutableAnnotationsList);
            }
        }
    },
    changePointSize(annotationsImmutableList, newPointSize, copyAction = false) {
        if (annotationsImmutableList) {
            let annotationsToUpdate = new Immutable.List();
            const parser = new DOMParser();
            const oSerializer = new XMLSerializer();
            this.typeInheritanceMap.get("Point").setPointSize(newPointSize);
            annotationsImmutableList.forEach((storeAnnotation) => {
                const xfdfElements = parser.parseFromString(storeAnnotation.get("xfdf"), "text/xml");
                const annotations = get(xfdfElements.querySelector("annots"), "children");
                forEach(annotations, (annotElement) => {
                    annotElement.setAttribute("pointSize", newPointSize);
                });
                const updatedXFDF = oSerializer.serializeToString(xfdfElements);
                if (copyAction) {
                    storeAnnotation = storeAnnotation.set("xfdf", updatedXFDF);
                    annotationsToUpdate = annotationsToUpdate.push(storeAnnotation);
                } else {
                    annotationsToUpdate = annotationsToUpdate.push(
                        Immutable.fromJS({
                            type: storeAnnotation.get("type"),
                            annotationId: storeAnnotation.get("annotationId"),
                            xfdf: updatedXFDF,
                        })
                    );
                }
            });
            if (copyAction) {
                return annotationsToUpdate;
            } else if (annotationsToUpdate.size > 0) {
                this.onRequestAnnotationUpdateArray(annotationsToUpdate);
            }
        }
    },
    changeIconType(annotationsImmutableList, newIconType, copyAction = false) {
        if (annotationsImmutableList) {
            let annotationsToUpdate = new Immutable.List();
            const parser = new DOMParser();
            const oSerializer = new XMLSerializer();
            this.typeInheritanceMap.get("Point").setIconType(newIconType);
            annotationsImmutableList.forEach((storeAnnotation) => {
                const xfdfElements = parser.parseFromString(storeAnnotation.get("xfdf"), "text/xml");
                const annotations = get(xfdfElements.querySelector("annots"), "children");
                forEach(annotations, (annotElement) => {
                    annotElement.setAttribute("iconType", newIconType);
                });
                const updatedXFDF = oSerializer.serializeToString(xfdfElements);
                if (copyAction) {
                    storeAnnotation = storeAnnotation.set("xfdf", updatedXFDF);
                    annotationsToUpdate = annotationsToUpdate.push(storeAnnotation);
                } else {
                    annotationsToUpdate = annotationsToUpdate.push(
                        Immutable.fromJS({
                            type: storeAnnotation.get("type"),
                            annotationId: storeAnnotation.get("annotationId"),
                            xfdf: updatedXFDF,
                        })
                    );
                }
            });
            if (copyAction) {
                return annotationsToUpdate;
            } else if (annotationsToUpdate.size > 0) {
                this.onRequestAnnotationUpdateArray(annotationsToUpdate);
            }
        }
    },
    switchRotationControlEnabled(annotationsImmutableList, value) {
        if (annotationsImmutableList) {
            let annotationsToUpdate = new Immutable.List();
            const parser = new DOMParser();
            const oSerializer = new XMLSerializer();

            annotationsImmutableList.forEach((storeAnnotation) => {
                switch (storeAnnotation.get("type")) {
                    case "Polygon":
                    case "Line":
                    case "Polyline":
                    case "Free hand":
                        const xfdfElements = parser.parseFromString(storeAnnotation.get("xfdf"), "text/xml");
                        const annotations = get(xfdfElements.querySelector("annots"), "children");

                        forEach(annotations, (annotElement) => {
                            if ((annotElement.getAttribute("rotationControlEnabled") == "true") !== value) {
                                annotElement.setAttribute("rotationControlEnabled", value);
                                const updatedXFDF = oSerializer.serializeToString(xfdfElements);

                                annotationsToUpdate = annotationsToUpdate.push(
                                    Immutable.fromJS({
                                        type: storeAnnotation.get("type"),
                                        annotationId: storeAnnotation.get("annotationId"),
                                        xfdf: updatedXFDF,
                                    })
                                );
                            }
                        });
                        break;
                    default:
                        break;
                }
            });

            if (annotationsToUpdate.size > 0) {
                this.onRequestAnnotationUpdateArray(annotationsToUpdate);
            }
        }
    },
    changeRotation(annotationsImmutableList, newRotation) {
        if (annotationsImmutableList) {
            let annotationsToUpdate = new Immutable.List();
            const parser = new DOMParser();
            const oSerializer = new XMLSerializer();
            this.typeInheritanceMap.get("Point").setRotation(newRotation);
            annotationsImmutableList.forEach((storeAnnotation) => {
                if (storeAnnotation.get("type") !== "group") {
                    const xfdfElements = parser.parseFromString(storeAnnotation.get("xfdf"), "text/xml");
                    const annotations = get(xfdfElements.querySelector("annots"), "children");

                    storeAnnotation.rotation = newRotation;
                    storeAnnotation.set("rotation", newRotation);

                    forEach(annotations, (annotElement) => {
                        annotElement.setAttribute("rotation", newRotation);
                    });

                    const updatedXFDF = oSerializer.serializeToString(xfdfElements);

                    annotationsToUpdate = annotationsToUpdate.push(
                        Immutable.fromJS({
                            type: storeAnnotation.get("type"),
                            annotationId: storeAnnotation.get("annotationId"),
                            xfdf: updatedXFDF,
                        })
                    );
                }
            });
            if (annotationsToUpdate.size > 0) {
                this.onRequestAnnotationUpdateArray(annotationsToUpdate);
            }
        }
    },

    changeGeometraOpacity(annotationsImmutableList, newGeometraOpacity, copyAction = false) {
        if (annotationsImmutableList) {
            let annotationsToUpdate = new Immutable.List();
            const parser = new DOMParser();
            const oSerializer = new XMLSerializer();
            annotationsImmutableList.forEach((storeAnnotation) => {
                if (storeAnnotation.get("type") != "group") {
                    let xfdfKey = "xfdf";

                    let xfdfElements = undefined;
                    if (storeAnnotation.get("type") === "x-scale" || storeAnnotation.get("type") === "y-scale") {
                        xfdfElements = parser.parseFromString(storeAnnotation.get("xdf"), "text/xml");
                        xfdfKey = "xdf";
                    } else {
                        xfdfElements = parser.parseFromString(storeAnnotation.get("xfdf"), "text/xml");

                        this.typeInheritanceMap.get(this.getTypeConversion(storeAnnotation.get("type"))).setGeometraOpacity(newGeometraOpacity);
                    }

                    const annotations = get(xfdfElements.querySelector("annots"), "children");

                    forEach(annotations, (annotElement) => {
                        if (storeAnnotation.get("type") === "Polyline") annotElement.removeAttribute("geometraBorderOpacity");
                        annotElement.setAttribute("geometraOpacity", newGeometraOpacity);
                    });
                    const updatedXFDF = oSerializer.serializeToString(xfdfElements);

                    if (copyAction) {
                        storeAnnotation = storeAnnotation.set(xfdfKey, updatedXFDF);

                        annotationsToUpdate = annotationsToUpdate.push(storeAnnotation);
                    } else {
                        if (xfdfKey === "xdf") {
                            annotationsToUpdate = this.setScaleStyleValues(annotationsToUpdate, copyAction, storeAnnotation, updatedXFDF);
                        } else {
                            annotationsToUpdate = annotationsToUpdate.push(
                                Immutable.fromJS({
                                    type: storeAnnotation.get("type"),
                                    annotationId: storeAnnotation.get("annotationId"),
                                    [xfdfKey]: updatedXFDF,
                                })
                            );
                        }
                    }
                }
            });

            if (copyAction) {
                return annotationsToUpdate;
            } else if (annotationsToUpdate.size > 0) {
                this.onRequestAnnotationUpdateArray(annotationsToUpdate);
            }
        }
    },

    changeGeometraBorderOpacity(annotationsImmutableList, newGeometraBorderOpacity, copyAction = false) {
        if (annotationsImmutableList) {
            let annotationsToUpdate = new Immutable.List();
            const parser = new DOMParser();
            const oSerializer = new XMLSerializer();
            annotationsImmutableList.forEach((storeAnnotation) => {
                if (storeAnnotation.get("type") != "group") {
                    this.typeInheritanceMap.get(this.getTypeConversion(storeAnnotation.get("type"))).setGeometraBorderOpacity(newGeometraBorderOpacity);
                    const xfdfElements = parser.parseFromString(storeAnnotation.get("xfdf"), "text/xml");
                    const annotations = get(xfdfElements.querySelector("annots"), "children");
                    forEach(annotations, (annotElement) => {
                        annotElement.setAttribute("geometraBorderOpacity", newGeometraBorderOpacity);
                    });
                    const updatedXFDF = oSerializer.serializeToString(xfdfElements);
                    if (copyAction) {
                        storeAnnotation = storeAnnotation.set("xfdf", updatedXFDF);
                        annotationsToUpdate = annotationsToUpdate.push(storeAnnotation);
                    } else {
                        annotationsToUpdate = annotationsToUpdate.push(
                            Immutable.fromJS({
                                type: storeAnnotation.get("type"),
                                annotationId: storeAnnotation.get("annotationId"),
                                xfdf: updatedXFDF,
                            })
                        );
                    }
                }
            });

            if (copyAction) {
                return annotationsToUpdate;
            } else if (annotationsToUpdate.size > 0) {
                this.onRequestAnnotationUpdateArray(annotationsToUpdate);
            }
        }
    },
    changeTextStyle(annotationsImmutableList, key, value, copyAction = false) {
        if (annotationsImmutableList) {
            let annotationsToUpdate = new Immutable.List();
            const parser = new DOMParser();
            const oSerializer = new XMLSerializer();
            annotationsImmutableList.forEach((storeAnnotation) => {
                const xfdfElements = parser.parseFromString(storeAnnotation.get("xfdf"), "text/xml");
                xfdfElements.querySelector("annots").firstElementChild.setAttribute(key, value);
                const defaultstyleContent = xfdfElements.querySelector("defaultstyle").textContent;

                const defaultStyleStyles = styleToObject(defaultstyleContent);

                if (value !== null) {
                    defaultStyleStyles[key] = value;
                } else {
                    delete defaultStyleStyles[key];
                }

                const newStyleString = objectToStyle(defaultStyleStyles);

                // Update values
                xfdfElements.querySelector("defaultstyle").textContent = newStyleString;

                const updatedXFDF = oSerializer.serializeToString(xfdfElements);

                if (copyAction) {
                    storeAnnotation = storeAnnotation.set("xfdf", updatedXFDF);
                    annotationsToUpdate = annotationsToUpdate.push(storeAnnotation);
                } else {
                    annotationsToUpdate = annotationsToUpdate.push(
                        Immutable.fromJS({
                            type: storeAnnotation.get("type"),
                            annotationId: storeAnnotation.get("annotationId"),
                            xfdf: updatedXFDF,
                        })
                    );
                }
            });
            if (copyAction) {
                return annotationsToUpdate;
            } else if (annotationsToUpdate.size > 0) {
                this.onRequestAnnotationUpdateArray(annotationsToUpdate);
            }
        }
    },

    async setRichTextStyle(annotationsImmutableList, style, copyAction = false) {
        if (annotationsImmutableList) {
            let annotationsToUpdate = new Immutable.List();

            await asyncForEach(annotationsImmutableList.toJS(), async (storeAnnotation) => {
                const webAnnot = this.WebViewer.annotManager.getAnnotationById(storeAnnotation.annotationId);

                if (webAnnot) {
                    webAnnot.setRichTextStyle({
                        0: style,
                    });

                    const newXfdf = await this.WebViewer.annotManager.exportAnnotations({
                        annotList: [webAnnot],
                    });

                    storeAnnotation.xfdf = newXfdf;

                    annotationsToUpdate = annotationsToUpdate.push(Immutable.fromJS({ ...storeAnnotation }));
                }
            });

            if (copyAction) {
                return annotationsToUpdate;
            } else if (annotationsToUpdate.size > 0) {
                this.changeColor2(annotationsToUpdate.toJS(), style.color);
            }
        }
    },

    async changeStrokeColor(annotationsImmutableList, color, copyAction = false) {
        if (annotationsImmutableList) {
            let annotationsToUpdate = new Immutable.List();

            await asyncForEach(annotationsImmutableList.toJS(), async (storeAnnotation) => {
                const webAnnot = this.WebViewer.annotManager.getAnnotationById(storeAnnotation.annotationId);

                if (webAnnot) {
                    const rgb = hexToRGB(color);

                    webAnnot.StrokeColor.R = rgb.r;
                    webAnnot.StrokeColor.G = rgb.g;
                    webAnnot.StrokeColor.B = rgb.b;

                    const newXfdf = await this.WebViewer.annotManager.exportAnnotations({
                        annotList: [webAnnot],
                    });

                    const parser = new DOMParser();
                    const oSerializer = new XMLSerializer();
                    const xfdfElements = parser.parseFromString(newXfdf, "text/xml");
                    const annotation = xfdfElements.querySelector("annots").children[0];

                    annotation.setAttribute("strokeColor", color);
                    storeAnnotation.xfdf = oSerializer.serializeToString(xfdfElements);

                    annotationsToUpdate = annotationsToUpdate.push(Immutable.fromJS({ ...storeAnnotation }));
                }
            });

            if (copyAction) {
                return annotationsToUpdate;
            } else if (annotationsToUpdate.size > 0) {
                this.onRequestAnnotationUpdateArray(annotationsToUpdate);
            }
        }
    },
    changeFontSize(annotationsImmutableList, newFontSize, copyAction = false) {
        if (annotationsImmutableList) {
            let annotationsToUpdate = new Immutable.List();
            const parser = new DOMParser();
            const oSerializer = new XMLSerializer();
            annotationsImmutableList.forEach((storeAnnotation) => {
                const xfdfElements = parser.parseFromString(storeAnnotation.get("xfdf"), "text/xml");
                xfdfElements.querySelector("annots").firstElementChild.setAttribute("FontSize", newFontSize);
                const defaultAppearanceContent = xfdfElements.querySelector("defaultappearance").textContent;
                const defaultstyleContent = xfdfElements.querySelector("defaultstyle").textContent;
                const defaultappearanceRegExp = /[a-z]+\s+(\d+)/;
                const defaultStyleRegExp = /(\d+)(?:pt)/;

                const defaultAppearanceContentMatch = defaultAppearanceContent.match(defaultappearanceRegExp);
                const defaultStyleMatch = defaultstyleContent.match(defaultStyleRegExp);

                if (defaultAppearanceContentMatch && defaultStyleMatch) {
                    const newDefaultAppearanceContent = defaultAppearanceContent.replace(defaultAppearanceContentMatch[1], newFontSize);

                    const newDefaultStyleContent = defaultstyleContent.replace(defaultStyleMatch[1], newFontSize);

                    // Update values
                    xfdfElements.querySelector("defaultappearance").textContent = newDefaultAppearanceContent;
                    xfdfElements.querySelector("defaultstyle").textContent = newDefaultStyleContent;

                    const updatedXFDF = oSerializer.serializeToString(xfdfElements);

                    if (copyAction) {
                        storeAnnotation = storeAnnotation.set("xfdf", updatedXFDF);
                        annotationsToUpdate = annotationsToUpdate.push(storeAnnotation);
                    } else {
                        annotationsToUpdate = annotationsToUpdate.push(
                            Immutable.fromJS({
                                type: storeAnnotation.get("type"),
                                annotationId: storeAnnotation.get("annotationId"),
                                xfdf: updatedXFDF,
                            })
                        );
                    }
                }
            });

            if (copyAction) {
                return annotationsToUpdate;
            } else if (annotationsToUpdate.size > 0) {
                this.onRequestAnnotationUpdateArray(annotationsToUpdate);
            }
        }
    },
    changeFormula(annotationsImmutableList, formula, formulaVariables, projectId) {
        if (annotationsImmutableList) {
            let annotationsToUpdate = new Immutable.List();
            const parser = new DOMParser();
            const oSerializer = new XMLSerializer();
            const standardAnnots = annotationsImmutableList.filter((annot) => annot.get("type") !== "3DModel");

            standardAnnots.forEach((storeAnnotation) => {
                const xfdfElements = parser.parseFromString(storeAnnotation.get("xfdf"), "text/xml");
                let updated = false;
                const annotElement = xfdfElements.querySelector("annots").firstElementChild;
                switch (this.getTypeConversion(storeAnnotation.get("type"))) {
                    case "Polygon":
                    case "Reduction":
                    case "Ellipse":
                    case "Free hand":
                        if (formulaVariables.includes("NA")) {
                            updated = true;
                            annotElement.setAttribute("formulaNA", formula);
                        }
                        if (formulaVariables.includes("NL")) {
                            updated = true;
                            annotElement.setAttribute("formulaNL", formula);
                        }
                        if (formulaVariables.includes("NVO")) {
                            updated = true;
                            annotElement.setAttribute("formulaNVO", formula);
                        }
                        if (formulaVariables.includes("NV")) {
                            updated = true;
                            annotElement.setAttribute("formulaNV", formula);
                        }
                        break;
                    case "Polyline":
                        if (formulaVariables.includes("NL")) {
                            updated = true;
                            annotElement.setAttribute("formulaNL", formula);
                        }
                        if (formulaVariables.includes("NV")) {
                            updated = true;
                            annotElement.setAttribute("formulaNV", formula);
                        }
                        break;
                    default:
                        break;
                }
                if (updated) {
                    const updatedXFDF = oSerializer.serializeToString(xfdfElements);
                    annotationsToUpdate = annotationsToUpdate.push(
                        Immutable.fromJS({
                            type: storeAnnotation.get("type"),
                            annotationId: storeAnnotation.get("annotationId"),
                            xfdf: updatedXFDF,
                        })
                    );
                }
            });
            if (annotationsToUpdate.size > 0) {
                this.onRequestAnnotationUpdateArray(annotationsToUpdate);
            }
        }
    },
    deleteScale(scale) {
        const annotationManager = this.WebViewer.docViewer.getAnnotationManager();
        if (scale) {
            this.annotationManagerSelectionLock = true;
            const oldScale = annotationManager.getAnnotationById(scale.annotationId);
            if (oldScale) {
                try {
                    annotationManager.deleteAnnotation(oldScale, true, true);
                } catch (error) {
                    console.log("Exception deleting from annotation manager: " + error);
                    console.log("Caught by Geometra and seems to be legitimate.");
                }
            }
            this.annotationManagerSelectionLock = false;
        }
    },
    async updateScale(scale, converted = false) {
        try {
            this.annotationManagerSelectionLock = true;
            const am = this.WebViewer.annotManager;
            if (scale && scale.geoFile.id === this.ActiveFileId) {
                let oldScaleSelected = false;
                const oldScale = am.getAnnotationById(scale.annotationId);
                if (oldScale) {
                    oldScaleSelected = am.isAnnotationSelected(oldScale);
                    am.deleteAnnotation(oldScale, true, true);
                }
                const importScales = await am.importAnnotations(scale.xdf);
                const newScaleAnnot = importScales[0];

                newScaleAnnot.StrokeColor.A = 0.85;
                newScaleAnnot.Opacity = newScaleAnnot.geometraOpacity;
                if (scale.type === "x-scale") {
                    newScaleAnnot.Subject = "x-scale";
                }
                newScaleAnnot.length = scale.length;
                am.deleteAnnotation(newScaleAnnot, true, true);
                if (converted) {
                    newScaleAnnot.converted = true;
                }
                am.addAnnotation(newScaleAnnot, true);
                if (oldScaleSelected) {
                    const selected = am.getSelectedAnnotations();
                    selected.push(newScaleAnnot);
                    am.selectAnnotations(selected);
                } else {
                    am.redrawAnnotation(newScaleAnnot);
                }
                await am.exportAnnotationCommand();
            }
        } catch (error) {}
        this.annotationManagerSelectionLock = false;
    },
    initPdfAnnotationAsDeselected(pdfAnnotation) {
        // Init as not selected
        if (pdfAnnotation) {
            pdfAnnotation.Opacity = 1.0;
            switch (pdfAnnotation.Subject) {
                case "Point":
                case "Polygon":
                case "Ellipse":
                case "annotation.freeHand":
                case "Free Hand":
                case "Free hand":
                case "Reduction":
                    if (pdfAnnotation.FillColor) {
                        if (pdfAnnotation.turnOffFill) {
                            pdfAnnotation.FillColor.A = 0;
                        } else {
                            pdfAnnotation.FillColor.A = pdfAnnotation.geometraOpacity;
                        }
                    }
                    if (pdfAnnotation.StrokeColor) {
                        pdfAnnotation.StrokeColor.A = pdfAnnotation.geometraBorderOpacity;
                    }
                    if (pdfAnnotation.Subject === "Point" && pdfAnnotation.iconType && pdfAnnotation.iconType !== "none") {
                        this.WebViewer.annotManager.redrawAnnotation(pdfAnnotation);
                    }
                    break;
                case "Polyline":
                case "Arrow":
                    pdfAnnotation.StrokeColor.A = pdfAnnotation.geometraBorderOpacity;
                    break;
                case "Free text":
                case "Free Text":
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
    initPdfAnnotationAsSelected(pdfAnnotation) {
        // Init as selected
        if (pdfAnnotation) {
            pdfAnnotation.Opacity = 1.0;
            switch (pdfAnnotation.Subject) {
                case "Point":
                case "Polygon":
                case "Ellipse":
                case "annotation.freeHand":
                case "Free Hand":
                case "Free hand":
                case "Reduction":
                    if (pdfAnnotation.FillColor) {
                        if (pdfAnnotation.turnOffFill) {
                            pdfAnnotation.FillColor.A = 0;
                        } else {
                            pdfAnnotation.FillColor.A = 0.8;
                        }
                    }
                    if (pdfAnnotation.Subject === "Point" && pdfAnnotation.iconType && pdfAnnotation.iconType !== "none") {
                        this.WebViewer.annotManager.redrawAnnotation(pdfAnnotation);
                    }
                    break;
                case "Polyline":
                case "Arrow":
                    pdfAnnotation.StrokeColor.A = 0.8;
                    break;
                case "Free text":
                case "Free Text":
                    pdfAnnotation.TextColor.A = 0.8;
                    pdfAnnotation.Opacity = 0.8;
                    break;
                case "Stamp":
                    pdfAnnotation.Opacity = 0.8;
                    break;
                default:
                    break;
            }
        }
    },
    async loadAnnotations() {
        try {
            const annotationManager = this.WebViewer.annotManager;

            await annotationManager.exportAnnotationCommand();
            const activeEstimateId = this.getActiveEstimate().get("id");
            const annotComHandler = new AnnotCommandHandler();
            const annotations = ObjectsStore.getAllAnnotations(activeEstimateId, this.ActiveFileId);
            const reductions = ObjectsStore.getAllReductions(activeEstimateId, this.ActiveFileId);

            _.forEach([...annotations, ...reductions], (annot) => {
                if (annot.type !== ANNOT_TYPES.GROUP && this.ActiveFileId == annot.geoFile.id) annotComHandler.addAddedCommand(annot.xfdf);
            });

            // const displayValueAnnotations = this.displayValueAnnotations;
            // for (let i = 0; i < displayValueAnnotations.size; i++) {
            //     const annot = displayValueAnnotations.get(i);
            //     if (annot.get("type") !== "group" && this.ActiveFileId == annot.getIn(["geoFile", "id"])) {
            //         annotComHandler.addAddedCommand(annot.get("xfdf"));
            //     }
            // }
            try {
                const addedPdftronAnnotations = await this.WebViewer.annotManager.importAnnotationCommand(annotComHandler.getAnnotCommand());
                for (let i = 0; i < addedPdftronAnnotations.length; i++) {
                    if (addedPdftronAnnotations[i].Subject !== "Stamp") {
                        this.initPdfAnnotationAsDeselected(addedPdftronAnnotations[i]);
                    }
                }
            } catch (error) {
                console.log("error " + error);
            }
            await annotationManager.exportAnnotationCommand();
        } catch (error) {
            console.log("err oloading annots: ", error.stack);
        }
    },
    async loadScales() {
        const annotationManager = this.WebViewer.annotManager;
        await annotationManager.exportAnnotationCommand();
        const scales = ObjectsStore.getAllScales(this.ActiveEstimate.get("id"), this.ActiveFileId);

        for (let i = 0; i < scales.length; i++) {
            const scale = scales[i];
            if (scale.type === ANNOT_TYPES.X_SCALE && scale.geoFile.id == this.ActiveFileId) {
                const imported = await annotationManager.importAnnotations(scale.xdf);
                const scaleAnnotation = imported[0];
                scaleAnnotation.length = scale.length;
                scaleAnnotation.Subject = "x-scale";
                scaleAnnotation.StrokeColor.A = 0.85;
                annotationManager.deleteAnnotation(scaleAnnotation, true, true);
                annotationManager.addAnnotation(scaleAnnotation, true);
            } else if (scale.type === ANNOT_TYPES.Y_SCALE && scale.geoFile.id == this.ActiveFileId) {
                const imported = await annotationManager.importAnnotations(scale.xdf);
                const scaleAnnotation = imported[0];
                scaleAnnotation.length = scale.length;
                scaleAnnotation.StrokeColor.A = 0.85;
                annotationManager.deleteAnnotation(scaleAnnotation, true, true);
                annotationManager.addAnnotation(scaleAnnotation, true);
            }
        }
        await annotationManager.exportAnnotationCommand();
    },
    setToolMode(toolMode, isHotkeyAction = false) {
        const isEstimateLocked = get(this.ActiveEstimate.toJS(), "locked");
        if (!this.WebViewer) return;

        if (isHotkeyAction && !this.isHotkeyLongPress) {
            this.previousToolMode = this.currentToolMode;
            this.isHotkeyLongPress = true;
        }
        const isViewTool = toolMode === "AnnotationEdit" || toolMode === "Pan" || toolMode === "MarqueeZoomTool" || toolMode === "MarqueeZoomTool";
        //if (toolMode === "AnnotationEdit") this.resetScaleTypeMap();
        if (isEstimateLocked && !isViewTool) {
            this.currentToolMode = "AnnotationEdit";
            this.WebViewer.setToolMode("AnnotationEdit");

            return;
        }
        if (toolMode === "AnnotationCreateReduction") this.setIsReductionCreated(true);
        this.currentToolMode = toolMode;
        this.WebViewer.setToolMode(toolMode);
    },
    backToPreviousToolMode() {
        this.isHotkeyLongPress = false;
        this.currentToolMode = this.previousToolMode;
        this.WebViewer.setToolMode(this.previousToolMode);
    },

    getMoveFolderTree() {
        const selection = ObjectsStore.getSelectionList().selectionList.filter((node) => node.type === ANNOT_TYPES.GROUP);
        if (!selection.length) {
            return [];
        }
        const selectedGroupIds = _.map(selection, (folder) => folder.id);
        const estimateId = this.ActiveEstimate.get("id");
        let allEstimateGroups = ObjectsStore.getAllFolders(estimateId);

        const getMoveToFolderTree = (parentId) => {
            let annotsCurrentLevel = [];
            allEstimateGroups = allEstimateGroups.filter((annot) => {
                if (selectedGroupIds.includes(annot.parentId) || selectedGroupIds.includes(annot.id)) {
                    return false;
                }
                if (annot.parentId == parentId) {
                    annotsCurrentLevel.push({
                        ...annot,
                        title: annot.name,
                        key: "" + annot.id,
                    });
                    return false;
                }
                return true;
            });
            annotsCurrentLevel = annotsCurrentLevel.map((annot) => {
                const children = getMoveToFolderTree(annot.id);
                if (children.length) return { ...annot, children };
                return annot;
            });
            return annotsCurrentLevel;
        };
        const tree = getMoveToFolderTree(null);
        const fullTree = [{ title: ">", key: "root", children: tree }];
        return fullTree;
    },
    async printDocumentToPdf(currentView) {
        if (this.WebViewer) {
            const am = this.WebViewer.docViewer.getAnnotationManager();

            await forEach(am.getAnnotationsList(), async (annot) => {
                annot.Printable = false;
            });
            await forEach(am.getSelectedAnnotations(), async (annot) => {
                annot.Printable = true;
            });

            this.WebViewer.setPrintQuality(5);
            this.WebViewer.printInBackground({ includeAnnotations: true, isPrintCurrentView: currentView });
        }
    },
    async saveDocumentToPdf() {
        if (this.WebViewer) {
            const parser = new DOMParser();
            const tDocument = this.WebViewer.docViewer.getDocument();
            if (!tDocument) return;

            const am = this.WebViewer.docViewer.getAnnotationManager();
            await forEach(am.getSelectedAnnotations(), async (annot) => {
                annot.Printable = true;
                if (annot.Subject === "Stamp") {
                    const xfdf = await am.exportAnnotations({ annotList: [annot] });

                    const xfdfElements = parser.parseFromString(xfdf, "text/xml");
                    const annotation = xfdfElements.querySelector("annots").firstElementChild;

                    const style = annotation.getAttribute("style");
                    const maintainAspectRatio = annotation.getAttribute("maintainAspectRatio");
                    const rotationControlEnabled = annotation.getAttribute("rotationControlEnabled");
                    const geometraOpacity = annotation.getAttribute("geometraOpacity");
                    const geometraBorderOpacity = annotation.getAttribute("geometraBorderOpacity");
                    const status = annotation.getAttribute("status");

                    annot.setCustomData("style", style);
                    annot.setCustomData("maintainAspectRatio", maintainAspectRatio);
                    annot.setCustomData("rotationControlEnabled", rotationControlEnabled);
                    annot.setCustomData("geometraOpacity", geometraOpacity);
                    annot.setCustomData("geometraBorderOpacity", geometraBorderOpacity);
                    annot.setCustomData("status", status);
                }
            });
            try {
                let additionalAnnotsToPrint = await this.webviewerInit.getPrintHelper().getDisplayValuesAnnotations(am);
                additionalAnnotsToPrint = additionalAnnotsToPrint.concat(am.getSelectedAnnotations());
                const xfdf = await am.exportAnnotations({ annotList: additionalAnnotsToPrint });
                const options = {
                    xfdfString: xfdf,
                };
                const data = await tDocument.getFileData(options);
                const blob = new Blob([data], { type: "application/pdf" });

                const link = document.createElement("a");
                link.href = window.URL.createObjectURL(blob);
                let filename = "";
                const file = FileStore.getFileById(this.ActiveFileId);
                if (file) {
                    filename = file.name;
                }
                link.download = filename;
                link.click();
            } catch (error) {
                console.log("error: ", error.stack);
            }
        }
    },
    rotatePDF() {
        if (this.WebViewer) {
            this.WebViewer.docViewer.rotateClockwise(this.WebViewer.docViewer.getCurrentPage());
            const file = FileStore.getFileById(this.ActiveFileId);
            if (file) {
                let rotationMap = JSON.parse(file.rotation);
                if (!rotationMap) {
                    rotationMap = {};
                }
                rotationMap = omit(rotationMap, ["0"]);
                rotationMap = set(
                    rotationMap,
                    String(this.WebViewer.docViewer.getCurrentPage()),
                    this.WebViewer.docViewer.getRotation(this.WebViewer.docViewer.getCurrentPage())
                );
                NodeSocketStore.onSendMessage(GROUP_NAME.GEO_FILE, {
                    action: FILE_ACTION_NAME.UPDATE,
                    parameter: "rotation",
                    value: JSON.stringify(rotationMap),
                    ids: [this.ActiveFileId],
                });
            }
        }
    },
    rotateLeftPDF() {
        if (this.WebViewer) {
            this.WebViewer.docViewer.rotateCounterClockwise(this.WebViewer.docViewer.getCurrentPage());
            const file = FileStore.getFileById(this.ActiveFileId);
            if (file) {
                let rotationMap = JSON.parse(file.rotation);
                if (!rotationMap) {
                    rotationMap = {};
                }
                rotationMap = omit(rotationMap, ["0"]);
                rotationMap = set(
                    rotationMap,
                    String(this.WebViewer.docViewer.getCurrentPage()),
                    this.WebViewer.docViewer.getRotation(this.WebViewer.docViewer.getCurrentPage())
                );
                NodeSocketStore.onSendMessage(GROUP_NAME.GEO_FILE, {
                    action: FILE_ACTION_NAME.UPDATE,
                    parameter: "rotation",
                    value: JSON.stringify(rotationMap),
                    ids: [this.ActiveFileId],
                });
            }
        }
    },
    setFitToScreen() {
        if (this.WebViewer) {
            this.fitModeButtonPressed = true;
            this.WebViewer.setFitMode(this.WebViewer.FitMode.FitPage);
        }
    },
    zoomInPDF() {
        if (this.WebViewer) {
            this.WebViewer.setZoomLevel(this.WebViewer.getZoomLevel() * 1.25);
        }
    },
    zoomOutPDF() {
        if (this.WebViewer) {
            this.WebViewer.setZoomLevel(this.WebViewer.getZoomLevel() * 0.8);
        }
    },
    handleEscapeButtonInCalculate() {
        if (this.webviewerInit && this.webviewerInit.isDrawing()) {
            this.webviewerInit.setIsDrawing(false);
        } else {
            this.currentToolMode === "AnnotationEdit" ? this.clearTreeSelection() : this.setToolMode("AnnotationEdit");
        }
    },
    undoDrawing(event, buttonPressed = false) {
        if (this.WebViewer && (buttonPressed || event.ctrlKey) && this.WebViewer.docViewer.getToolMode().annotation) {
            // ctrl-z
            switch (this.WebViewer.docViewer.getToolMode().name) {
                case this.WebViewer.Tools.ToolNames.POLYGON:
                case this.WebViewer.Tools.ToolNames.POLYLINE:
                case "AnnotationCreateReduction":
                    const annotation = this.WebViewer.docViewer.getToolMode().annotation;
                    if (annotation.getPath().length > 2) {
                        annotation.popPath();
                        this.WebViewer.annotManager.redrawAnnotation(annotation);
                    }
                    break;
                default:
                    console.log("did not undo");
            }
        }
    },
    async jumpToAnnotation(annotationId, selectRequired) {
        if (this.WebViewer) {
            await this.WebViewer.docViewer.getAnnotationsLoadedPromise();
            const annotationManager = this.WebViewer.annotManager;
            let annot = this.getAnnotationByAnnotationId(annotationId);
            if (!annot) {
                annot = this.getScaleByAnnotationId(annotationId);
            }
            if (!annot) {
                annot = this.getDisplayValueAnnotationByAnnotationId(annotationId);
            }
            if (!annot) {
                annot = this.getReductionByAnnotationId(annotationId);
            }
            if (annot && annot.hasIn(["geoFile", "id"])) {
                if (annot.getIn(["geoFile", "id"]) === this.ActiveFileId) {
                    const jumpAnnot = annotationManager.getAnnotationById(annot.get("annotationId"));
                    if (jumpAnnot && this.WebViewer.docViewer.getDocument()) {
                        const annotZoomer = Math.max(jumpAnnot.Width, jumpAnnot.Height);
                        const viewZoomer = Math.min(window.innerHeight, window.innerWidth);
                        let zoom = Number.parseFloat(viewZoomer) / Number.parseFloat(annotZoomer);
                        zoom *= 0.5;
                        this.WebViewer.setZoomLevel(zoom);
                        this.annotationManagerSelectionLock = true;
                        annotationManager.jumpToAnnotation(jumpAnnot);
                        if (selectRequired) {
                            this.annotationManagerSelectionLock = false;
                            annotationManager.selectAnnotation(jumpAnnot);
                            this.onFocusNameField();
                        } else {
                            this.onFocusNameField();
                            this.annotationManagerSelectionLock = false;
                        }
                    }
                } else {
                    this.jumpAnnotId = annotationId;
                    this.onSetActiveFileId(annot.getIn(["geoFile", "id"]));
                    this.onSetActivePageId(1);
                    let filename = "";
                    const file = FileStore.getFileById(this.ActiveFileId);
                    if (file) {
                        filename = file.name;
                    }
                    this.pageCount = undefined;
                    this.documentLoaded = false;
                    this.WebViewer.loadDocument(this.bucketURL + annot.getIn(["geoFile", "id"]), {
                        documentId: annot.getIn(["geoFile", "id"]),
                        filename: filename,
                    });
                }
            }
        }
    },
    async jumpToFile(data) {
        const activeFile = FileStore.getFileById(this.ActiveFileId);

        if (data.type === "ifc" || activeFile.type === "ifc") {
            window.location.replace(`/projects/${ProjectsStore.getActiveProjectId()}/calculate/${data.id}`);
        } else {
            if (this.WebViewer) {
                await this.WebViewer.docViewer.getAnnotationsLoadedPromise();
                if (data.id !== this.ActiveFileId) {
                    this.onSetActiveFileId(data.id);
                    this.onSetActivePageId(1);
                    let filename = "";
                    const file = FileStore.getFileById(this.ActiveFileId);
                    if (file) {
                        filename = file.name;
                    }
                    this.pageCount = undefined;
                    this.documentLoaded = false;
                    this.WebViewer.loadDocument(this.bucketURL + data.id, {
                        documentId: data.id,
                        filename: filename,
                    });
                }
            }
        }
    },

    selectAnnotationFromGui(selectedAnnotation) {
        this.annotationManagerSelectionLock = true;
        const annotationId = selectedAnnotation.annotationId;
        if (this.WebViewer) {
            const annotationManager = this.WebViewer.annotManager;
            const annot = annotationManager.getAnnotationById(annotationId);
            if (annot) {
                this.setAnnotationSelected(annot);
                annotationManager.selectAnnotation(annot);
            }
        }

        if (this.WebViewer) {
            if (this.currentToolMode === "AnnotationCreateReduction") {
                const annotationManager = this.WebViewer.annotManager;
                const selected = annotationManager.getSelectedAnnotations();
                AppBarActions.setSelectState();
                this.setToolMode(this.WebViewer.Tools.ToolNames.EDIT);
                annotationManager.selectAnnotations(selected);
            }
        }
        this.annotationManagerSelectionLock = false;
        this.trigger("annotationSelectedFromGui");
    },

    setAnnotationSelected(annot) {
        //Set annotation to visually selected when selecting from tree to avoid extra loops by annotation manager
        if (annot && !(annot.Subject === "x-scale" || annot.Subject === "y-scale")) {
            this.initPdfAnnotationAsSelected(annot);
        }
    },
    setAnnotationDeselected(annot) {
        //Set annotaiotn to visually selected when selecting from tree to avoid extra loops by annotation manager
        if (annot && !(annot.Subject === "x-scale" || annot.Subject === "y-scale")) {
            this.initPdfAnnotationAsDeselected(annot);
        }
    },
    deSelectAnnotationFromGui(storeAnnotation) {
        this.annotationManagerSelectionLock = true;
        const type = storeAnnotation.type;
        const annotationId = storeAnnotation.annotationId;
        if (this.WebViewer) {
            const annotationManager = this.WebViewer.annotManager; //getInstance().docViewer.getAnnotationManager();
            if (annotationId) {
                const annot = annotationManager.getAnnotationById(annotationId);
                this.annotationManagerSelectionLock = true;
                if (annot) {
                    this.setAnnotationDeselected(annot);
                    annotationManager.deselectAnnotation(annot);
                    if (type !== "x-scale" && type !== "y-scale") {
                        this.trigger("annotationDeSelectedFromGui");
                        this.annotationManagerSelectionLock = false;
                    } else {
                        this.trigger("annotationDeSelectedFromGui");
                    }
                }
            }
        }
        if (this.WebViewer) {
            if (this.currentToolMode === "AnnotationCreateReduction") {
                const annotationManager = this.WebViewer.annotManager;
                const selected = annotationManager.getSelectedAnnotations();
                AppBarActions.setSelectState();
                this.setToolMode(this.WebViewer.Tools.ToolNames.EDIT);
                annotationManager.selectAnnotations(selected);
            }
        }
        this.annotationManagerSelectionLock = false;
    },

    deSelectAllAnnotationsFromGui(selectedInTree = [], trigger = true) {
        if (this.WebViewer) {
            this.annotationManagerSelectionLock = true;
            const annotationManager = this.WebViewer.annotManager;
            try {
                annotationManager.getSelectedAnnotations().forEach((annot) => {
                    this.initPdfAnnotationAsDeselected(annot);
                });
                annotationManager.deselectAllAnnotations();
            } catch (e) {
                console.log("Error | AnnotationManager: ", e.message);
            }
            this.annotationManagerSelectionLock = false;
        }
        if (trigger) {
            this.trigger("annotationSelectedFromGui");
        }
    },
    selectAllAnnotationsFromGui(selectedAnnotatations, trigger = true) {
        const self = this;
        self.annotationManagerSelectionLock = true;
        if (self.WebViewer) {
            if (self.currentToolMode === "AnnotationCreateReduction" && !this.getIsReductionCreated()) {
                AppBarActions.setSelectState();

                self.setToolMode(self.WebViewer.Tools.ToolNames.EDIT);
            }
        }
        const selectPdftronAnnotions = [];

        _.forEach(selectedAnnotatations, (jsonAnnot) => {
            const annotationId = jsonAnnot.annotationId;
            const id = jsonAnnot.id;
            const type = jsonAnnot.type;
            if (type === "x-scale" || type === "y-scale") {
                // if (self.WebViewer) {
                //     const annotManager = self.WebViewer.annotManager;
                //     const scale = annotManager.getAnnotationById(annotationId);
                //     if (scale && annotManager.isAnnotationSelected(scale)) {
                //         annotManager.deselectAnnotation(scale);
                //     } else {
                //         selectPdftronAnnotions.push(scale);
                //         self.updateSelectedAnnotationsToStore(annotationId, id, type, Immutable.fromJS(jsonAnnot));
                //     }
                // } else {
                //     self.updateDeSelectAnnotationToStore(annotationId, id);
                // }
            } else if (!annotationId || (jsonAnnot.geoFile && jsonAnnot.geoFile.id !== self.ActiveFileId)) {
                return;
            } else {
                if (self.WebViewer) {
                    const annotationManager = self.WebViewer.annotManager;
                    if (annotationId) {
                        const pdftronAnnotation = annotationManager.getAnnotationById(annotationId);
                        selectPdftronAnnotions.push(pdftronAnnotation);
                        self.setAnnotationSelected(pdftronAnnotation);
                    }
                }
            }
        });

        if (self.WebViewer) {
            const annotationManager = self.WebViewer.annotManager;
            annotationManager.selectAnnotations(selectPdftronAnnotions);
        }

        if (trigger) {
            this.trigger("annotationSelectedFromGui");
        }
        self.annotationManagerSelectionLock = false;
    },
    // isSelected(annotationId, id) {
    //     return (
    //         this.SelectedAnnotations.findIndex((annot) => {
    //             return annot.get("id") == id && annot.get("annotationId") == annotationId;
    //         }) !== -1
    //     );
    // },
    getCopiedAnnotation() {
        return this.copiedAnnotationContainers;
    },
    copyAnnotations() {
        if (this.WebViewer) {
            try {
                this.copiedAnnotationContainers = [];
                this.copiedScaleContainers = [];
                const annotationManager = this.WebViewer.annotManager;
                const selectedAnnotations = annotationManager
                    .getSelectedAnnotations()
                    .filter((annot) => annot.Subject !== "CenterValue" && annot.Subject !== "PeripheralValue");
                forEach(selectedAnnotations, (annotation) => {
                    if (annotation.Subject === "x-scale" || annotation.Subject === "y-scale") {
                        const storeScale = this.getScaleByAnnotationId(annotation.Id);
                        if (storeScale) {
                            const scaleCopy = annotationManager.getAnnotationCopy(annotation);
                            this.copiedScaleContainers.push({
                                copiedScale: scaleCopy,
                                length: storeScale.get("length"),
                                type: storeScale.get("type"),
                            });
                        }
                    } else {
                        const { geoEstimateId, geoFileId, geoAnnotId, geoParentId, annotationType } = annotation;
                        const annot =
                            annotationType === "Reduction"
                                ? ObjectsStore.getReductionByPDFTronAnnot({ geoEstimateId, geoFileId, geoAnnotId, geoParentId })
                                : ObjectsStore.getAnnotationByPDFTronAnnot({ geoEstimateId, geoFileId, geoAnnotId });
                        if (!annot) return;
                        this.copiedAnnotationContainers.push({
                            annotationId: annot.annotationId,
                            type: annotationType,
                            id: geoAnnotId,
                        });
                    }
                });
            } catch (error) {
                console.log("Error | copyAnnots: " + error);
            }
        }
    },
    async copyScale() {
        const annotationManager = this.WebViewer.annotManager;
        for (let k = 0; k < this.copiedScaleContainers.length; k++) {
            const scaleContainer = this.copiedScaleContainers[k];
            scaleContainer.copiedScale.Id = this.generateUUID();
            scaleContainer.copiedScale.PageNumber = this.WebViewer.getCurrentPageNumber();
            const xfdf = await annotationManager.exportAnnotations({ annotList: [scaleContainer.copiedScale] });
            this.onRequestScaleCreate(xfdf, scaleContainer.type, this.getActiveFileId(), scaleContainer.copiedScale.PageNumber, scaleContainer.length);
        }
    },
    async pasteAnnotations() {
        const selectedAnnotationsArray = this.copiedAnnotationContainers;
        const shouldPasteAnnotations = this.WebViewer && (this.copiedAnnotationContainers.length > 0 || this.copiedScaleContainers.length > 0);
        if (!shouldPasteAnnotations) return;

        let annotationToCopyIdsList = new Set();
        const selectedAnnotsIds = selectedAnnotationsArray.map((annot) => annot.id);

        selectedAnnotationsArray.forEach((selectedAnnot) => {
            annotationToCopyIdsList.add(selectedAnnot.id);
            if (selectedAnnot.type === "Polygon") {
                let selectedReductionsIds = [];
                const reductions = TreeStoreV2.getAllChildrensForPolygon(selectedAnnot.annotationId);
                if (!reductions.length) return;
                const reductionIds = reductions.map(({ data }) => data.id);
                reductionIds.forEach((reductionId) => {
                    if (selectedAnnotsIds.includes(reductionId)) selectedReductionsIds.push(reductionId);
                });

                if (selectedReductionsIds.length) selectedReductionsIds.forEach((id) => annotationToCopyIdsList.add(id));
                else reductionIds.forEach((id) => annotationToCopyIdsList.add(id));
            }
        });
        this.copyScale();
        if (annotationToCopyIdsList.size > 50) this.initDuplicateAnnotsModal(annotationToCopyIdsList.size, AuthenticationStore.getUserId());
        NodeSocketStore.onSendMessage(GROUP_NAME.GEO_ANNOTATION, {
            action: ANNOTATION_ACTION_NAME.DUPLICATE,
            ids: [...annotationToCopyIdsList],
            parentId: this.ActiveParentId ? this.ActiveParentId.toString() : this.ActiveParentId,
            fileId: this.getActiveFileId(),
            geoEstimateId: this.ActiveEstimate.get("id"),
            page: this.getActivePageId() - 1,
        });
    },
    initDuplicateAnnotsModal(annotsToDuplicate, userId) {
        this.duplicateAnnotsModalInfo.duplicatingAnnots = true;
        this.duplicateAnnotsModalInfo.annotsToDuplicate = annotsToDuplicate;
        this.duplicateAnnotsModalInfo.annotsDuplicated = 0;
        this.duplicateAnnotsModalInfo.annotsDuplicatedList = [];
        this.duplicateAnnotsModalInfo.annotsRowsDuplicatedList = [];
        this.duplicateAnnotsModalInfo.userId = userId;

        this.trigger("duplicatingAnnotsInfoChanged");
    },
    resetDuplicateAnnotsModalInfo() {
        this.duplicateAnnotsModalInfo.duplicatingAnnots = false;
        this.duplicateAnnotsModalInfo.annotsToDuplicate = 0;
        this.duplicateAnnotsModalInfo.annotsDuplicated = 0;
        this.duplicateAnnotsModalInfo.annotsDuplicatedList = [];
        this.duplicateAnnotsModalInfo.annotsRowsDuplicatedList = [];
        this.duplicateAnnotsModalInfo.userId = null;
    },
    annotationIsOnFileCurrentPage(annotation) {
        if (annotation.get("type") === ANNOT_TYPES.IFC_MODEL && this.getActiveFileId() === annotation.getIn(["geoFile", "id"])) return true;
        return annotation.hasIn(["geoFile", "id"])
            ? this.getActiveFileId() === annotation.getIn(["geoFile", "id"]) && this.getActivePageId() === annotation.get("pageNumber")
            : false;
    },
    jsAnnotationIsOnFileCurrentPage(annotation) {
        const geoFileId = annotation.geoFile?.id ? annotation.geoFile.id : annotation.fileId;
        if (annotation.type === ANNOT_TYPES.IFC_MODEL && this.getActiveFileId() === geoFileId) return true;
        return annotation?.geoFile?.id ? this.getActiveFileId() === geoFileId && this.getActivePageId() === annotation.pageNumber : false;
    },
    loadFile(fileId) {
        if (this.WebViewer) {
            const file = FileStore.getFileById(fileId);
            if (file) {
                this.onSetActiveFileId(fileId);
                this.onSetActivePageId(1);
                const filename = file.get("name");
                this.pageCount = undefined;
                this.documentLoaded = false;
                this.WebViewer.loadDocument(this.bucketURL + fileId, {
                    documentId: fileId,
                    filename: filename,
                });
            }
        }
    },
    //-----------------------------Getters----------------------------------------
    getAnnotationTableFilter() {
        return this.treeFilter;
    },
    getAnnotations() {
        return this.Annotations;
    },
    getDisplayValueAnnotations() {
        return this.displayValueAnnotations;
    },
    getDisplayValueAnnotationByAnnotationId(annotationId) {
        return this.displayValueAnnotations.find((annot) => annot.get("annotationId") === annotationId);
    },
    getDisplayValueAnnotationIdsForParent(parentAnnotationId) {
        const ids = [];
        this.displayValueAnnotations.forEach((annot) => {
            if (annot.get("parentId") === parentAnnotationId) {
                ids.push(annot.get("id"));
            }
        });
        return ids;
    },
    getAnnotationById(id) {
        return this.Annotations.find((annot) => {
            return annot.get("id") == id;
        });
    },
    // getScaleForAnnotation(annotation) {
    //     if (!annotation) {
    //         return undefined;
    //     }
    //     const xScale = this.xScaleList.find((annot) => {
    //         return annot.getIn(["geoFile", "id"]) === annotation.getIn(["geoFile", "id"]) && annot.get("page") === annotation.get("pageNumber");
    //     });
    //     const yScale = this.yScaleList.find((annot) => {
    //         return annot.getIn(["geoFile", "id"]) === annotation.getIn(["geoFile", "id"]) && annot.get("page") === annotation.get("pageNumber");
    //     });
    //     return new Immutable.Map().set("x-scale", xScale).set("y-scale", yScale);
    // },
    getScaleForPDFAnnotation(annotation) {
        if (!annotation) {
            return undefined;
        }
        const xScale = this.xScaleList.find((annot) => {
            return annot.getIn(["geoFile", "id"]) === annotation.geoFileId && annot.get("page") === annotation.pageNumber;
        });
        const yScale = this.yScaleList.find((annot) => {
            return annot.getIn(["geoFile", "id"]) === annotation.geoFileId && annot.get("page") === annotation.pageNumber;
        });
        return new Immutable.Map().set("x-scale", xScale).set("y-scale", yScale);
    },
    getScaleByAnnotationId(annotationId) {
        const xScale = this.xScaleList.find((scale) => {
            return scale.get("annotationId") === annotationId;
        });
        if (xScale) {
            return xScale;
        }
        return this.yScaleList.find((scale) => {
            return scale.get("annotationId") === annotationId;
        });
    },
    getScaleById(id) {
        const xScale = this.xScaleList.find((scale) => {
            return scale.get("id") === id;
        });
        if (xScale) {
            return xScale;
        }
        return this.yScaleList.find((scale) => {
            return scale.get("id") === id;
        });
    },
    getScalesForFile(fileId) {
        const xScales = this.xScaleList.filter((scale) => {
            return scale.getIn(["geoFile", "id"]) == fileId;
        });
        const yScales = this.yScaleList.filter((scale) => {
            return scale.getIn(["geoFile", "id"]) == fileId;
        });
        return xScales.concat(yScales);
    },
    getYscaleForFileAndPage(xScale) {
        return this.yScaleList.find((scale) => {
            return scale.getIn(["geoFile", "id"]) == xScale.getIn(["geoFile", "id"]) && scale.get("page") == xScale.get("page");
        });
    },
    getScaleForFileAndPage(fileId, page) {
        const xScale = this.xScaleList.find((scale) => {
            return scale.getIn(["geoFile", "id"]) == fileId && scale.get("page") == page;
        });
        const yScale = this.yScaleList.find((scale) => {
            return scale.getIn(["geoFile", "id"]) == fileId && scale.get("page") == page;
        });
        return new Immutable.Map().set("x-scale", xScale).set("y-scale", yScale);
    },
    getReductionByAnnotationId(annotationId) {
        return this.reductions.find((annot) => {
            return annot.get("type") === "Reduction" && annot.get("annotationId") === annotationId;
        });
    },
    getReductionById(id) {
        return this.reductions.find((annot) => {
            return annot.get("type") === "Reduction" && annot.get("id") === id;
        });
    },
    getReductionByParentAnnotationId(parentId) {
        return this.reductions.filter((annot) => {
            return annot.get("type") === "Reduction" && annot.get("parentId") === parentId;
        });
    },
    getProjectIdFromEstimateId() {
        return this.ActiveEstimate.getIn(["geoProject", "id"]);
    },
    getAnnotationByAnnotationId(annotationId) {
        return this.Annotations.find((annot) => {
            return annot.get("annotationId") === annotationId;
        });
    },
    getAnnotaionsInFolderFirstLevel(parentId) {
        let annotationsToReturn = new Immutable.List();
        this.Annotations.forEach((annotation) => {
            if (annotation.get("parentId") == parentId) {
                annotationsToReturn = annotationsToReturn.push(annotation);
                if (annotation.get("type") === "Polygon") {
                    this.getReductionByParentAnnotationId(annotation.get("annotationId")).forEach((reduction) => {
                        annotationsToReturn = annotationsToReturn.push(reduction);
                    });
                }
            }
        });
        return annotationsToReturn;
    },
    getAllAnnotationsFromParent(parentId) {
        const searchText = HeaderStore.getAppSearch();
        let annotations = this.Annotations.filter((annot) => {
            if (this.getAnnotationTableFilter() === "PageAndFile") {
                if (annot.get("type") === "group") {
                    return parentId == annot.get("parentId");
                } else {
                    if (
                        annot.get("type") !== "group" &&
                        searchText &&
                        (!annot.get("name") || (annot.get("name") && annot.get("name").toLowerCase().indexOf(searchText.toLowerCase()) == -1))
                    ) {
                        return false;
                    }
                    return parentId == annot.get("parentId") && this.annotationIsOnFileCurrentPage(annot);
                }
            }
            if (
                annot.get("type") !== "group" &&
                searchText &&
                (!annot.get("name") || (annot.get("name") && annot.get("name").toLowerCase().indexOf(searchText.toLowerCase()) == -1))
            ) {
                return false;
            }
            return parentId == annot.get("parentId");
        });

        annotations.forEach((annot) => {
            if (annot.get("type") === "group") {
                annotations = annotations.concat(this.getAllAnnotationsFromParent(annot.get("id")));
            }
        });
        return annotations;
    },
    getAllFolders() {
        return this.Annotations.filter((annot) => {
            return annot.get("type") === "group" && annot.getIn(["geoEstimate", "id"]) === this.ActiveEstimate.get("id");
        });
    },
    getPathForAnnotationHandler(selectedAnnots) {
        if (!selectedAnnots.length) return "";
        return selectedAnnots.length === 1 ? this.getFoldersPathForAnnotation(selectedAnnots[0]) : "";
    },

    getFoldersPathForAnnotation(annot) {
        const {
            parentId,
            geoEstimate: { id: geoEstimateId },
        } = annot;
        const parent = ObjectsStore.getFolderById({ geoEstimateId, id: parentId });
        if (parent && parent.parentId) {
            return `${this.getFoldersPathForAnnotation(parent)} > ${parent.name}`;
        } else if (parent) {
            return parent.name;
        } else {
            return "";
        }
    },
    getSortedFolderPaths(disregardSelection) {
        let sortedFoldersContainersListToReturn = new Immutable.List();
        let rootFolderContainer = new Immutable.Map();
        let rootFolder = new Immutable.Map();
        let selectedFolders = undefined;
        if (disregardSelection) {
            selectedFolders = new Immutable.List();
        } else {
            selectedFolders = this.SelectedAnnotations.filter((annot) => annot.get("type") === "group");
        }
        rootFolder = rootFolder.set("id", undefined);
        rootFolderContainer = rootFolderContainer.set("title", ">");
        rootFolderContainer = rootFolderContainer.set("folder", rootFolder);
        rootFolderContainer = rootFolderContainer.set("key", "root");

        sortedFoldersContainersListToReturn = sortedFoldersContainersListToReturn.push(rootFolderContainer);
        const allFolders = this.getAllFolders();

        const addSortedFolder = (parentId, currentPath) => {
            const foldersForCurrentLevel = allFolders
                .filter((folder) => {
                    return folder.get("parentId") == parentId && !selectedFolders.find((selectedFolder) => selectedFolder.get("id") === folder.get("id"));
                })
                .sort((folder1, folder2) => {
                    if (folder1.get("number") < folder2.get("number")) {
                        return -1;
                    } else if (folder1.get("number") > folder2.get("number")) {
                        return 1;
                    } else if (folder1.get("name") < folder2.get("name")) {
                        return -1;
                    } else if (folder1.get("name") > folder2.get("name")) {
                        return 1;
                    }
                    return 0;
                });
            let sortedFoldersContainers = new Immutable.List();
            foldersForCurrentLevel.forEach((folder) => {
                let folderContainer = new Immutable.Map();
                const number = folder.get("number") ? " (" + folder.get("number") + ") " : " ";
                const path = currentPath + number + folder.get("name");
                folderContainer = folderContainer.set("title", path);
                folderContainer = folderContainer.set("folder", folder);
                folderContainer = folderContainer.set("key", "" + folder.get("id"));
                sortedFoldersContainers = sortedFoldersContainers.push(folderContainer);
                sortedFoldersContainers = sortedFoldersContainers.concat(addSortedFolder(folder.get("id"), path + " >"));
            });
            return sortedFoldersContainers;
        };

        const folders = addSortedFolder(undefined, rootFolderContainer.get("title"));
        sortedFoldersContainersListToReturn = sortedFoldersContainersListToReturn.concat(folders);
        return sortedFoldersContainersListToReturn;
    },
    getActiveFileId() {
        return this.ActiveFileId ? this.ActiveFileId : -1;
    },
    getActivePageId() {
        return this.ActivePageId ? this.ActivePageId : -1;
    },
    getActiveParentId() {
        return this.ActiveParentId ? this.ActiveParentId : -1;
    },
    getActiveEstimate() {
        return this.ActiveEstimate ? this.ActiveEstimate : -1;
    },
    getSelectedAnnotationIds() {
        return this.SelectedAnnotations;
    },
    getSelectedAnnotations() {
        return this.SelectedAnnotations;
    },
    //-----------------------------Setters----------------------------------------

    onFocusNameField() {
        this.trigger("focusNameField");
    },

    onSetActiveFileId(fileId) {
        this.ActiveFileId = fileId;
        this.trigger("fileChanged");
    },
    onSetActivePageId(pageNumber, updateWebViewer = false) {
        this.ActivePageId = pageNumber;
        if (updateWebViewer && this.WebViewer) {
            this.WebViewer.docViewer.setCurrentPage(pageNumber);
        }
        this.updatePageRotationState();
        this.trigger("pageChanged");
    },
    onSetActiveParentId(parentId, clearLastActiveId = false) {
        this.ActiveParentId = parentId;
        if (clearLastActiveId) {
            this.lastActiveParentId = parentId;
        }
    },
    setActiveReductionParentId(reductionParent) {
        if (reductionParent) {
            this.ActiveReductionParentId = reductionParent.Id;
        } else {
            this.ActiveReductionParentId = undefined;
        }
    },
    getWebViewerFileInformation() {
        return Immutable.fromJS({ activePage: this.ActivePageId, pageCount: this.pageCount });
    },
    setAnnotationTableFilter(filter) {
        if (filter) {
            this.treeFilter = "PageAndFile";
        } else {
            this.treeFilter = "all";
        }
    },
    selectAll(isAltPressed) {
        console.time("ctrl a select");

        let annotationManager = null;
        let annotPdfList = null;
        if (this.WebViewer) {
            annotationManager = this.WebViewer.annotManager;
            annotPdfList = annotationManager.getAnnotationsList();
        }
        this.annotationManagerSelectionLock = true;
        const selectPdftronAnnotions = [];
        const annotsToSelect = [];
        const filterToolActive = TreeStoreV2.getTreeFilter();
        const activeEstimateId = this.ActiveEstimate.get("id");
        const allFolders = ObjectsStore.getAllFolders(activeEstimateId);
        const annotationsList = ObjectsStore.getAllAnnotations(activeEstimateId);
        const reductionsList = ObjectsStore.getAllReductions(activeEstimateId);
        const allAnnotsLit = isAltPressed ? [...allFolders, ...annotationsList] : [...allFolders, ...annotationsList, ...reductionsList];
        const searchText = HeaderStore.getAppSearch();

        allAnnotsLit.forEach((annot) => {
            if (searchText && (!annot.name || (annot.name && annot.name.toLowerCase().indexOf(searchText.toLowerCase()) == -1))) return;
            const { annotationId, type } = annot;
            if (filterToolActive) {
                if (!this.jsAnnotationIsOnFileCurrentPage(annot) && type !== "group") return;
            }
            annotsToSelect.push(annot);

            if (annotationManager && annotPdfList.length > 0) {
                const pdfAnnotToSelect = annotPdfList.find(({ xy }) => xy === annotationId);
                if (pdfAnnotToSelect) {
                    selectPdftronAnnotions.push(pdfAnnotToSelect);
                    this.initPdfAnnotationAsSelected(pdfAnnotToSelect);
                }
            }
        });
        this.onSetActiveParentId(undefined, true);
        const allFolderChildrens = TreeStoreV2.getAllChildrensForFolderArray(allFolders).filter((child) => child.data.type == ANNOT_TYPES.GROUP);
        const mainFoldersToSelect = TreeStoreV2.getFoldersSelectionAfterShiftSelect(allFolders, allFolderChildrens);
        const objectsToSelect = _.filter(allAnnotsLit, (annot) => !_.some(mainFoldersToSelect, (folder) => folder.id === annot.id));
        ObjectsStore.selectListOfObjects(objectsToSelect, mainFoldersToSelect);

        if (this.WebViewer && selectPdftronAnnotions.length > 0) {
            annotationManager.selectAnnotations(selectPdftronAnnotions);
        }
        this.trigger("annotationSelectedFromGui");
        this.annotationManagerSelectionLock = false;

        console.timeEnd("ctrl a select");
    },
    getAllKeysAndNodes(list) {
        const nodes = [];
        const getTheKeys = (theList) => {
            return theList.reduce((acc, node) => {
                acc.push(node.key);
                nodes.push(node);
                if (node.children) {
                    acc.push(...getTheKeys(node.children));
                }
                return acc;
            }, []);
        };
        const keys = getTheKeys(list);
        return { keys, nodes };
    },
    expandAll() {
        const keys = this.getAllKeys(TreeStoreV2.buildTree().treeData);
        TreeStoreV2.setTreeExpansion(keys);
        localStorage.setItem(`expandedKeys_${this.activeProjectId}`, JSON.stringify(keys));
    },
    getAllKeys(item) {
        return item.reduce((acc, item) => {
            acc.push(item.key);

            if (item.children) {
                acc.push(...this.getAllKeys(item.children));
            }

            return acc;
        }, []);
    },

    onRequestAnnotationUpdateArray(annotationList, key, value) {
        const payload = {};
        payload.update_array = [];

        annotationList.forEach((annotation) => {
            const annotationType = annotation.get("type");
            const annotationId = annotation.get("annotationId");
            if (annotationType !== "x-scale" && annotationType !== "y-scale") {
                let storeAnnotation = undefined;
                if (annotationType === "CenterValue" || annotationType === "PeripheralValue") {
                    storeAnnotation = this.getDisplayValueAnnotationByAnnotationId(annotationId);
                } else if (annotationType === "Reduction") {
                    storeAnnotation = this.getReductionByAnnotationId(annotationId);
                } else if (annotationId) {
                    storeAnnotation = this.getAnnotationByAnnotationId(annotationId);
                } else {
                    storeAnnotation = this.getAnnotationById(annotation.get("id"));
                }
                if (storeAnnotation) {
                    let annotationUpdated = false;
                    if (key && value !== annotation.get(key)) {
                        annotation = annotation.set(key, value);
                        annotationUpdated = true;
                        const valueInheritance = this.typeInheritanceMap.get(this.getTypeConversion(annotationType));
                        if (valueInheritance) {
                            switch (key) {
                                case "name":
                                    valueInheritance.setName(value);
                                    break;
                                case "number":
                                    valueInheritance.setNumber(value);
                                    this.updateAnnotationNumberByProjectId(this.getTypeConversion(annotationType), value);
                                    break;
                                case "height":
                                    valueInheritance.setHeight(value);
                                    break;
                                default:
                                    break;
                            }
                        }
                    }
                    if (!key || (key && annotationUpdated)) {
                        const geoAnnotation = storeAnnotation.merge(annotation).toJS();
                        const labels = annotation.get("labels");

                        geoAnnotation.height = JSON.stringify(geoAnnotation.height);

                        delete geoAnnotation.interiorColor;
                        delete geoAnnotation["interior-color"];
                        delete geoAnnotation.pageNumber;
                        delete geoAnnotation.strokeSize;
                        if (geoAnnotation.annotationData) {
                            delete geoAnnotation.annotationData;
                        }

                        if (geoAnnotation.strokeColor) {
                            delete geoAnnotation.strokeColor;
                        }
                        if (geoAnnotation.displayValueList) {
                            delete geoAnnotation.displayValueList;
                        }
                        if (geoAnnotation.xfdf && geoAnnotation.type !== "3DModel") {
                            const parser = new DOMParser();
                            const oSerializer = new XMLSerializer();
                            const xfdfElements = parser.parseFromString(geoAnnotation.xfdf, "text/xml");
                            const annotation = xfdfElements.querySelector("annots").children[0];
                            annotation.setAttribute("annotationName", geoAnnotation.name);
                            annotation.setAttribute("annotationNumber", geoAnnotation.number);
                            annotation.setAttribute("annotationHeight", geoAnnotation.height);
                            if (geoAnnotation.type === "Point") {
                                annotation.setAttribute("geometraBorderOpacity", "0");
                            }
                            if (geoAnnotation.geometraBorderOpacity === 0 && !annotation.getAttribute("color") && geoAnnotation.color) {
                                annotation.setAttribute("color", geoAnnotation.color);
                            }

                            const styles = {
                                ["interiorColor"]: annotation.getAttribute("interior-color"),
                                ["geometraOpacity"]: annotation.getAttribute("geometraOpacity"),
                                ["color"]: annotation.getAttribute("color"),
                                ["geometraBorderOpacity"]: annotation.getAttribute("geometraBorderOpacity"),
                                ["style"]: annotation.getAttribute("style"),
                                ["width"]: annotation.getAttribute("width"),
                                ["fontSize"]: annotation.getAttribute("FontSize"),
                                ["decoration"]: this.parseRichTextStyleFromXfdf(geoAnnotation.xfdf),
                                ["strokeColor"]: annotation.getAttribute("strokeColor"),
                                ["geometraLineStart"]: annotation.getAttribute("geometraLineStart"),
                                ["geometraLineEnd"]: annotation.getAttribute("geometraLineEnd"),
                                ["pointSize"]: annotation.getAttribute("pointSize"),
                                ["iconType"]: annotation.getAttribute("iconType"),
                            };

                            const tiles = {
                                areaTilesX: annotation.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.AREA_TILES_X"),
                                areaTilesY: annotation.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.AREA_TILES_Y"),
                                areaJointX: annotation.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.AREA_JOINT_X"),
                                areaJointY: annotation.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.AREA_JOINT_Y"),
                                areaJointDepth: annotation.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.AREA_JOINT_DEPTH"),

                                wallTilesX: annotation.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.WALL_TILES_X"),
                                wallTilesY: annotation.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.WALL_TILES_Y"),
                                wallJointX: annotation.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.WALL_JOINT_X"),
                                wallJointY: annotation.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.WALL_JOINT_Y"),
                                wallJointDepth: annotation.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.WALL_JOINT_DEPTH"),
                            };

                            const properties = {
                                name: geoAnnotation.name,
                                height: geoAnnotation.height,
                                maintainAspectRatio: annotation.getAttribute("maintainAspectRatio"),
                                labels: labels,
                            };
                            this.changeAnnotationInheritance({ type: annotationType, styles, properties, tiles });
                            geoAnnotation.xfdf = oSerializer.serializeToString(xfdfElements);
                        }
                        delete geoAnnotation.color;
                        if (geoAnnotation.textContents) {
                            delete geoAnnotation.textContents;
                        }
                        if (!isNil(geoAnnotation.fontSize)) {
                            delete geoAnnotation.fontSize;
                        }
                        if (geoAnnotation.geometraOpacity || geoAnnotation.geometraOpacity === 0) {
                            delete geoAnnotation.geometraOpacity;
                        }
                        if (geoAnnotation.geometraBorderOpacity || geoAnnotation.geometraBorderOpacity === 0) {
                            delete geoAnnotation.geometraBorderOpacity;
                        }
                        if (geoAnnotation.hasOwnProperty("geometraLineEnd")) {
                            delete geoAnnotation.geometraLineEnd;
                        }
                        if (!isNil(geoAnnotation.maintainAspectRatio)) {
                            delete geoAnnotation.maintainAspectRatio;
                        }
                        if (geoAnnotation.hasOwnProperty("geometraLineStart")) {
                            delete geoAnnotation.geometraLineStart;
                        }

                        if (geoAnnotation.geometraFlip || geoAnnotation.geometraFlip === null || geoAnnotation.geometraFlip === "") {
                            delete geoAnnotation.geometraFlip;
                        }

                        if (geoAnnotation.pattern) {
                            delete geoAnnotation.pattern;
                        }
                        if (geoAnnotation.iconType) {
                            delete geoAnnotation.iconType;
                        }
                        delete geoAnnotation.labels;
                        delete geoAnnotation.Hidden;
                        delete geoAnnotation.vertices;
                        delete geoAnnotation.maintainAspectRatio;
                        delete geoAnnotation.readOnly;
                        delete geoAnnotation["ESTIMATE.ANNOTATION_PROPERTIES.TILES_X"];
                        delete geoAnnotation["ESTIMATE.ANNOTATION_PROPERTIES.TILES_Y"];
                        delete geoAnnotation["ESTIMATE.ANNOTATION_PROPERTIES.JOINT_X"];
                        delete geoAnnotation["ESTIMATE.ANNOTATION_PROPERTIES.JOINT_Y"];
                        delete geoAnnotation["ESTIMATE.ANNOTATION_PROPERTIES.JOINT_DEPTH"];
                        delete geoAnnotation["ESTIMATE.ANNOTATION_PROPERTIES.AREA_TILES_X"];
                        delete geoAnnotation["ESTIMATE.ANNOTATION_PROPERTIES.AREA_TILES_Y"];
                        delete geoAnnotation["ESTIMATE.ANNOTATION_PROPERTIES.AREA_JOINT_X"];
                        delete geoAnnotation["ESTIMATE.ANNOTATION_PROPERTIES.AREA_JOINT_Y"];
                        delete geoAnnotation["ESTIMATE.ANNOTATION_PROPERTIES.AREA_JOINT_DEPTH"];
                        delete geoAnnotation["ESTIMATE.ANNOTATION_PROPERTIES.WALL_TILES_X"];
                        delete geoAnnotation["ESTIMATE.ANNOTATION_PROPERTIES.WALL_TILES_Y"];
                        delete geoAnnotation["ESTIMATE.ANNOTATION_PROPERTIES.WALL_JOINT_X"];
                        delete geoAnnotation["ESTIMATE.ANNOTATION_PROPERTIES.WALL_JOINT_Y"];
                        delete geoAnnotation["ESTIMATE.ANNOTATION_PROPERTIES.WALL_JOINT_DEPTH"];
                        delete geoAnnotation.rotation;
                        delete geoAnnotation.formulaNA;
                        delete geoAnnotation.formulaNL;
                        delete geoAnnotation.formulaNVO;
                        delete geoAnnotation.formulaNV;
                        delete geoAnnotation.status;
                        delete geoAnnotation.pointSize;
                        delete geoAnnotation.layerId;
                        delete geoAnnotation.geoEstimateId;
                        delete geoAnnotation.fileId;
                        delete geoAnnotation.indexPosition;
                        delete geoAnnotation.width;
                        delete geoAnnotation.groupedAnnotIds;
                        delete geoAnnotation.style;
                        if (geoAnnotation.geoFile) delete geoAnnotation.geoFile.nodeStatus;

                        payload.update_array.push(geoAnnotation);
                    }
                }
            }
        });
        const annotations = map(payload.update_array, (annotation) => {
            const { geoEstimate, geoFile, ...data } = annotation;
            const groupAnnotationRequest = {
                geoEstimateId: geoEstimate.id,
                ...data,
            };
            return annotation.type === "group" ? groupAnnotationRequest : { ...groupAnnotationRequest, fileId: geoFile.id };
        });
        if (annotations?.length > 0) NodeSocketStore.onSendMessage(GROUP_NAME.GEO_ANNOTATION, { action: ANNOTATION_ACTION_NAME.UPDATE, annotations });
    },
    onRequestAnnotationDelete(annotationsToRemove) {
        const rowsToRemove = [];
        const ids = annotationsToRemove.map((annotation) => {
            const rows = _.values(annotation.rows);
            if (rows.length) rowsToRemove = [...rowsToRemove, ...rows];
            //const hasValuesAnnots = annotation.get("displayValueList") && annotation.get("displayValueList").size;
            //const visualsIds = hasValuesAnnots ? this.getDisplayValueAnnotationIdsForParent(annotation.get("annotationId")) : [];
            //return [annotation.get("id"), ...visualsIds];
            return annotation.id;
        });
        if (rowsToRemove.length) ObjectsStore.onRowsDelete(rowsToRemove);

        NodeSocketStore.onSendMessage(GROUP_NAME.GEO_ANNOTATION, { action: ANNOTATION_ACTION_NAME.DELETE, ids });
    },
    async onDeleteAnnotations({ ids, deletedAnnotations }) {
        TreeStoreV2.clearSelectedAnnotations();

        let newDisplayValueAnnotationsList = new Immutable.List();

        //    else if (this.shouldReloadAnnotation(annot)) removedAnnotationIds.push(annot.get("annotationId"));
        const removedAnnotationIds = ObjectsStore.onAnnotationsDelete(deletedAnnotations);

        // this.getDisplayValueAnnotations().forEach((valueAnnot) => {
        //     if (ids.every((id) => id !== valueAnnot.get("id"))) newDisplayValueAnnotationsList = newDisplayValueAnnotationsList.push(valueAnnot);
        //     else {
        //         DisplayValuesAnnotationsHandler.getInstance().removeDisplayAnnotations(valueAnnot.get("parentId"), valueAnnot);
        //         if (this.shouldReloadAnnotation(valueAnnot)) removedAnnotationIds.push(valueAnnot.get("annotationId"));
        //     }
        // });

        // this.setDisplayValueAnnotations(newDisplayValueAnnotationsList);

        if (this.WebViewer && this.documentLoaded && removedAnnotationIds.length) {
            const am = this.WebViewer.annotManager;
            await am.exportAnnotationCommand();
            await this.reloadAnnotations(removedAnnotationIds);
            await am.exportAnnotationCommand();
        }
        this.trigger("AnnotationDeleted");
    },
    onRequestAnnotationCreate(annotationsToCreate) {
        try {
            annotationsToCreate.forEach((annotationAnnotationRowMap) => {
                let annotXfdf = annotationAnnotationRowMap.get("annotXfdf");
                const type = this.getTypeConversion(annotationAnnotationRowMap.get("type"));
                const fileId = annotationAnnotationRowMap.get("fileId");
                const annotationId = annotationAnnotationRowMap.get("annotationId");
                const initialStatus = "notStarted";
                let parentId = annotationAnnotationRowMap.get("parentId");

                let currentHeight = undefined;
                let currentNumber = undefined;
                let currentName = undefined;
                let currentColor = undefined;
                let currentInteriorColor = undefined;
                let currentGeometraOpacity = undefined;
                let currentGeometraBorderOpacity = undefined;
                let currentWidth = undefined;
                let currentStyle = undefined;
                let currentStrokeColor = undefined;
                let currentGeometraLineStart = undefined;
                let currentGeometraLineEnd = undefined;
                let currentFontSize = undefined;
                let currentDecoration = undefined;
                let currentMaintainAspectRatio = undefined;
                let currentTiles = undefined;
                let labels = undefined;

                if (type === "Reduction") {
                    if (!this.ActiveReductionParentId) {
                        return;
                    }
                    parentId = this.ActiveReductionParentId;
                } else if (!parentId) {
                    parentId = this.lastActiveParentId;
                }
                switch (type) {
                    case "Circle":
                    case "Ellipse":
                        {
                            currentName = this.ellipseValueInheritance.getName();
                            currentHeight = this.ellipseValueInheritance.getHeight();
                            currentNumber = this.ellipseValueInheritance.getNumber();
                            currentColor = this.ellipseValueInheritance.getColor();
                            currentInteriorColor = this.ellipseValueInheritance.getInteriorColor();
                            currentGeometraOpacity = this.ellipseValueInheritance.getGeometraOpacity();
                            currentGeometraBorderOpacity = this.ellipseValueInheritance.getGeometraBorderOpacity();
                            currentWidth = this.ellipseValueInheritance.getWidth();
                            currentStyle = this.ellipseValueInheritance.getStyle();
                            currentMaintainAspectRatio = this.ellipseValueInheritance.getMaintainAspectRatio();
                            currentTiles = this.ellipseValueInheritance.getTiles();
                            labels = this.ellipseValueInheritance.getLabels();

                            const parser = new DOMParser();
                            const xfdfElements = parser.parseFromString(annotXfdf, "text/xml");
                            const annotationElement = xfdfElements.querySelector("annots").children[0];
                            annotationElement.setAttribute("color", currentColor);
                            annotationElement.setAttribute("interior-color", currentInteriorColor);
                            annotationElement.setAttribute("annotationName", currentName);
                            annotationElement.setAttribute("annotationNumber", currentNumber);
                            annotationElement.setAttribute("annotationHeight", currentHeight);
                            annotationElement.setAttribute("geometraOpacity", currentGeometraOpacity);
                            annotationElement.setAttribute("geometraBorderOpacity", currentGeometraBorderOpacity);
                            annotationElement.setAttribute("status", initialStatus);
                            annotationElement.setAttribute("maintainAspectRatio", currentMaintainAspectRatio);
                            annotationElement.setAttribute("readOnly", false);
                            annotationElement.setAttribute("width", currentWidth);
                            annotationElement.setAttribute("style", currentStyle);

                            annotationElement.setAttribute("ESTIMATE.ANNOTATION_PROPERTIES.AREA_TILES_X", currentTiles.areaTilesX);
                            annotationElement.setAttribute("ESTIMATE.ANNOTATION_PROPERTIES.AREA_TILES_Y", currentTiles.areaTilesY);
                            annotationElement.setAttribute("ESTIMATE.ANNOTATION_PROPERTIES.AREA_JOINT_X", currentTiles.areaJointX);
                            annotationElement.setAttribute("ESTIMATE.ANNOTATION_PROPERTIES.AREA_JOINT_Y", currentTiles.areaJointY);
                            annotationElement.setAttribute("ESTIMATE.ANNOTATION_PROPERTIES.AREA_JOINT_DEPTH", currentTiles.areaJointDepth);
                            annotationElement.setAttribute("ESTIMATE.ANNOTATION_PROPERTIES.WALL_TILES_X", currentTiles.wallTilesX);
                            annotationElement.setAttribute("ESTIMATE.ANNOTATION_PROPERTIES.WALL_TILES_Y", currentTiles.wallTilesY);
                            annotationElement.setAttribute("ESTIMATE.ANNOTATION_PROPERTIES.WALL_JOINT_X", currentTiles.wallJointX);
                            annotationElement.setAttribute("ESTIMATE.ANNOTATION_PROPERTIES.WALL_JOINT_Y", currentTiles.wallJointY);
                            annotationElement.setAttribute("ESTIMATE.ANNOTATION_PROPERTIES.WALL_JOINT_DEPTH", currentTiles.wallJointDepth);

                            const oSerializer = new XMLSerializer();
                            annotXfdf = oSerializer.serializeToString(xfdfElements);
                        }
                        break;
                    case "Polygon":
                        {
                            currentName = this.polygonValueInheritance.getName();
                            currentHeight = this.polygonValueInheritance.getHeight();
                            currentNumber = this.polygonValueInheritance.getNumber();
                            currentColor = this.polygonValueInheritance.getColor();
                            currentInteriorColor = this.polygonValueInheritance.getInteriorColor();
                            currentGeometraOpacity = this.polygonValueInheritance.getGeometraOpacity();
                            currentGeometraBorderOpacity = this.polygonValueInheritance.getGeometraBorderOpacity();
                            currentWidth = this.polygonValueInheritance.getWidth();
                            currentStyle = this.polygonValueInheritance.getStyle();
                            currentTiles = this.polygonValueInheritance.getTiles();
                            labels = this.polygonValueInheritance.getLabels();

                            const parser = new DOMParser();
                            const xfdfElements = parser.parseFromString(annotXfdf, "text/xml");
                            let annotationElement;
                            try {
                                annotationElement = xfdfElements.querySelector("annots").children[0];
                            } catch (error) {
                                console.log("polygon create error " + error);
                            }
                            annotationElement.setAttribute("color", currentColor);
                            annotationElement.setAttribute("interior-color", currentInteriorColor);
                            annotationElement.setAttribute("annotationName", currentName);
                            annotationElement.setAttribute("annotationNumber", currentNumber);
                            annotationElement.setAttribute("annotationHeight", currentHeight);
                            annotationElement.setAttribute("geometraOpacity", currentGeometraOpacity);
                            annotationElement.setAttribute("geometraBorderOpacity", currentGeometraBorderOpacity);
                            annotationElement.setAttribute("status", initialStatus);
                            annotationElement.setAttribute("readOnly", false);
                            annotationElement.setAttribute("width", currentWidth);
                            annotationElement.setAttribute("style", currentStyle);

                            annotationElement.setAttribute("ESTIMATE.ANNOTATION_PROPERTIES.AREA_TILES_X", currentTiles.areaTilesX);
                            annotationElement.setAttribute("ESTIMATE.ANNOTATION_PROPERTIES.AREA_TILES_Y", currentTiles.areaTilesY);
                            annotationElement.setAttribute("ESTIMATE.ANNOTATION_PROPERTIES.AREA_JOINT_X", currentTiles.areaJointX);
                            annotationElement.setAttribute("ESTIMATE.ANNOTATION_PROPERTIES.AREA_JOINT_Y", currentTiles.areaJointY);
                            annotationElement.setAttribute("ESTIMATE.ANNOTATION_PROPERTIES.AREA_JOINT_DEPTH", currentTiles.areaJointDepth);
                            annotationElement.setAttribute("ESTIMATE.ANNOTATION_PROPERTIES.WALL_TILES_X", currentTiles.wallTilesX);
                            annotationElement.setAttribute("ESTIMATE.ANNOTATION_PROPERTIES.WALL_TILES_Y", currentTiles.wallTilesY);
                            annotationElement.setAttribute("ESTIMATE.ANNOTATION_PROPERTIES.WALL_JOINT_X", currentTiles.wallJointX);
                            annotationElement.setAttribute("ESTIMATE.ANNOTATION_PROPERTIES.WALL_JOINT_Y", currentTiles.wallJointY);
                            annotationElement.setAttribute("ESTIMATE.ANNOTATION_PROPERTIES.WALL_JOINT_DEPTH", currentTiles.wallJointDepth);

                            const oSerializer = new XMLSerializer();
                            annotXfdf = oSerializer.serializeToString(xfdfElements);
                            this.setActiveReductionParentId({ Id: annotationId });
                        }
                        break;
                    case "Reduction":
                        {
                            currentName = this.reductionValueInheritance.getName();
                            currentHeight = this.reductionValueInheritance.getHeight();
                            currentNumber = this.reductionValueInheritance.getNumber();
                            currentColor = this.reductionValueInheritance.getColor();
                            currentInteriorColor = this.reductionValueInheritance.getInteriorColor();
                            currentGeometraOpacity = this.reductionValueInheritance.getGeometraOpacity();
                            currentGeometraBorderOpacity = this.reductionValueInheritance.getGeometraBorderOpacity();
                            currentWidth = this.reductionValueInheritance.getWidth();
                            currentStyle = this.reductionValueInheritance.getStyle();
                            currentTiles = this.reductionValueInheritance.getTiles();
                            labels = this.reductionValueInheritance.getLabels();

                            const parser = new DOMParser();
                            const xfdfElements = parser.parseFromString(annotXfdf, "text/xml");
                            const annotationElement = xfdfElements.querySelector("annots").children[0];
                            annotationElement.setAttribute("color", currentColor);
                            annotationElement.setAttribute("interior-color", currentInteriorColor);
                            annotationElement.setAttribute("annotationName", currentName);
                            annotationElement.setAttribute("annotationNumber", currentNumber);
                            annotationElement.setAttribute("annotationHeight", currentHeight);
                            annotationElement.setAttribute("geometraOpacity", currentGeometraOpacity);
                            annotationElement.setAttribute("geometraBorderOpacity", currentGeometraBorderOpacity);
                            annotationElement.setAttribute("status", initialStatus);
                            annotationElement.setAttribute("readOnly", false);
                            annotationElement.setAttribute("width", currentWidth);
                            annotationElement.setAttribute("style", currentStyle);

                            annotationElement.setAttribute("ESTIMATE.ANNOTATION_PROPERTIES.AREA_TILES_X", currentTiles.areaTilesX);
                            annotationElement.setAttribute("ESTIMATE.ANNOTATION_PROPERTIES.AREA_TILES_Y", currentTiles.areaTilesY);
                            annotationElement.setAttribute("ESTIMATE.ANNOTATION_PROPERTIES.AREA_JOINT_X", currentTiles.areaJointX);
                            annotationElement.setAttribute("ESTIMATE.ANNOTATION_PROPERTIES.AREA_JOINT_Y", currentTiles.areaJointY);
                            annotationElement.setAttribute("ESTIMATE.ANNOTATION_PROPERTIES.AREA_JOINT_DEPTH", currentTiles.areaJointDepth);
                            annotationElement.setAttribute("ESTIMATE.ANNOTATION_PROPERTIES.WALL_TILES_X", currentTiles.wallTilesX);
                            annotationElement.setAttribute("ESTIMATE.ANNOTATION_PROPERTIES.WALL_TILES_Y", currentTiles.wallTilesY);
                            annotationElement.setAttribute("ESTIMATE.ANNOTATION_PROPERTIES.WALL_JOINT_X", currentTiles.wallJointX);
                            annotationElement.setAttribute("ESTIMATE.ANNOTATION_PROPERTIES.WALL_JOINT_Y", currentTiles.wallJointY);
                            annotationElement.setAttribute("ESTIMATE.ANNOTATION_PROPERTIES.WALL_JOINT_DEPTH", currentTiles.wallJointDepth);

                            const oSerializer = new XMLSerializer();
                            annotXfdf = oSerializer.serializeToString(xfdfElements);
                        }
                        break;
                    case "annotation.freeHand":
                    case "Free Hand":
                    case "Free hand":
                        {
                            currentName = this.freehandValueInheritance.getName();
                            currentHeight = this.freehandValueInheritance.getHeight();
                            currentNumber = this.freehandValueInheritance.getNumber();
                            currentColor = this.freehandValueInheritance.getColor();
                            currentInteriorColor = this.freehandValueInheritance.getInteriorColor();
                            currentGeometraOpacity = this.freehandValueInheritance.getGeometraOpacity();
                            currentGeometraBorderOpacity = this.freehandValueInheritance.getGeometraBorderOpacity();
                            currentWidth = this.freehandValueInheritance.getWidth();
                            currentStyle = this.freehandValueInheritance.getStyle();
                            currentMaintainAspectRatio = this.freehandValueInheritance.getMaintainAspectRatio();
                            currentTiles = this.freehandValueInheritance.getTiles();
                            labels = this.freehandValueInheritance.getLabels();

                            const parser = new DOMParser();
                            const xfdfElements = parser.parseFromString(annotXfdf, "text/xml");
                            const annotationElement = xfdfElements.querySelector("annots").children[0];
                            annotationElement.setAttribute("color", currentColor);
                            annotationElement.setAttribute("interior-color", currentInteriorColor);
                            annotationElement.setAttribute("annotationName", currentName);
                            annotationElement.setAttribute("annotationNumber", currentNumber);
                            annotationElement.setAttribute("annotationHeight", currentHeight);
                            annotationElement.setAttribute("geometraOpacity", currentGeometraOpacity);
                            annotationElement.setAttribute("geometraBorderOpacity", currentGeometraBorderOpacity);
                            annotationElement.setAttribute("status", initialStatus);
                            annotationElement.setAttribute("maintainAspectRatio", currentMaintainAspectRatio);
                            annotationElement.setAttribute("readOnly", false);
                            annotationElement.setAttribute("width", currentWidth);
                            annotationElement.setAttribute("style", currentStyle);

                            annotationElement.setAttribute("ESTIMATE.ANNOTATION_PROPERTIES.AREA_TILES_X", currentTiles.areaTilesX);
                            annotationElement.setAttribute("ESTIMATE.ANNOTATION_PROPERTIES.AREA_TILES_Y", currentTiles.areaTilesY);
                            annotationElement.setAttribute("ESTIMATE.ANNOTATION_PROPERTIES.AREA_JOINT_X", currentTiles.areaJointX);
                            annotationElement.setAttribute("ESTIMATE.ANNOTATION_PROPERTIES.AREA_JOINT_Y", currentTiles.areaJointY);
                            annotationElement.setAttribute("ESTIMATE.ANNOTATION_PROPERTIES.AREA_JOINT_DEPTH", currentTiles.areaJointDepth);
                            annotationElement.setAttribute("ESTIMATE.ANNOTATION_PROPERTIES.WALL_TILES_X", currentTiles.wallTilesX);
                            annotationElement.setAttribute("ESTIMATE.ANNOTATION_PROPERTIES.WALL_TILES_Y", currentTiles.wallTilesY);
                            annotationElement.setAttribute("ESTIMATE.ANNOTATION_PROPERTIES.WALL_JOINT_X", currentTiles.wallJointX);
                            annotationElement.setAttribute("ESTIMATE.ANNOTATION_PROPERTIES.WALL_JOINT_Y", currentTiles.wallJointY);
                            annotationElement.setAttribute("ESTIMATE.ANNOTATION_PROPERTIES.WALL_JOINT_DEPTH", currentTiles.wallJointDepth);

                            const oSerializer = new XMLSerializer();
                            annotXfdf = oSerializer.serializeToString(xfdfElements);
                        }
                        break;
                    case "Freetext":
                    case "FreeText":
                    case "Free Text":
                    case "Free text":
                        {
                            currentName = this.freeTextValueInheritance.getName();
                            currentNumber = this.freeTextValueInheritance.getNumber();
                            currentGeometraOpacity = this.freeTextValueInheritance.getGeometraOpacity();
                            currentGeometraBorderOpacity = this.freeTextValueInheritance.getGeometraBorderOpacity();
                            currentWidth = this.freeTextValueInheritance.getWidth();
                            currentStyle = this.freeTextValueInheritance.getStyle();
                            currentStrokeColor = this.freeTextValueInheritance.getStrokeColor();
                            currentFontSize = this.freeTextValueInheritance.getFontSize();
                            currentDecoration = this.freeTextValueInheritance.getDecoration();
                            currentInteriorColor = this.freeTextValueInheritance.getInteriorColor();
                            labels = this.freeTextValueInheritance.getLabels();

                            const parser = new DOMParser();
                            const xfdfElements = parser.parseFromString(annotXfdf, "text/xml");
                            const annotationElement = xfdfElements.querySelector("annots").children[0];
                            annotationElement.setAttribute("FontSize", currentFontSize);
                            annotationElement.setAttribute("geometraOpacity", currentGeometraOpacity);
                            annotationElement.setAttribute("geometraBorderOpacity", currentGeometraBorderOpacity);
                            annotationElement.setAttribute("width", currentWidth);
                            annotationElement.setAttribute("status", initialStatus);
                            annotationElement.setAttribute("readOnly", false);
                            annotationElement.setAttribute("strokeColor", currentStrokeColor);
                            annotationElement.setAttribute("style", currentStyle);
                            annotationElement.setAttribute("TextColor", currentInteriorColor);

                            const oSerializer = new XMLSerializer();
                            annotXfdf = oSerializer.serializeToString(xfdfElements);
                        }
                        break;
                    case "Polyline":
                        {
                            currentName = this.polylineValueInheritance.getName();
                            currentHeight = this.polylineValueInheritance.getHeight();
                            currentNumber = this.polylineValueInheritance.getNumber();
                            currentColor = this.polylineValueInheritance.getColor();
                            currentInteriorColor = this.polylineValueInheritance.getInteriorColor();
                            const currentLineWidth = this.polylineValueInheritance.getWidth();
                            currentGeometraOpacity = this.polylineValueInheritance.getGeometraOpacity();
                            currentGeometraLineStart = this.polylineValueInheritance.getGeometraLineStart();
                            currentGeometraLineEnd = this.polylineValueInheritance.getGeometraLineEnd();
                            currentStyle = this.polylineValueInheritance.getStyle();
                            currentTiles = this.polylineValueInheritance.getTiles();
                            labels = this.polylineValueInheritance.getLabels();

                            const parser = new DOMParser();
                            const xfdfElements = parser.parseFromString(annotXfdf, "text/xml");
                            const annotationElement = xfdfElements.querySelector("annots").children[0];
                            annotationElement.setAttribute("color", currentColor);
                            annotationElement.setAttribute("interior-color", currentInteriorColor);
                            annotationElement.setAttribute("width", currentLineWidth);
                            annotationElement.setAttribute("annotationName", currentName);
                            annotationElement.setAttribute("annotationNumber", currentNumber);
                            annotationElement.setAttribute("annotationHeight", currentHeight);
                            annotationElement.setAttribute("geometraOpacity", currentGeometraOpacity);
                            annotationElement.setAttribute("status", initialStatus);
                            annotationElement.setAttribute("readOnly", false);
                            annotationElement.setAttribute("style", currentStyle);
                            annotationElement.setAttribute("geometraLineStart", currentGeometraLineStart);
                            annotationElement.setAttribute("geometraLineEnd", currentGeometraLineEnd);

                            annotationElement.setAttribute("ESTIMATE.ANNOTATION_PROPERTIES.AREA_TILES_X", currentTiles.areaTilesX);
                            annotationElement.setAttribute("ESTIMATE.ANNOTATION_PROPERTIES.AREA_TILES_Y", currentTiles.areaTilesY);
                            annotationElement.setAttribute("ESTIMATE.ANNOTATION_PROPERTIES.AREA_JOINT_X", currentTiles.areaJointX);
                            annotationElement.setAttribute("ESTIMATE.ANNOTATION_PROPERTIES.AREA_JOINT_Y", currentTiles.areaJointY);
                            annotationElement.setAttribute("ESTIMATE.ANNOTATION_PROPERTIES.AREA_JOINT_DEPTH", currentTiles.areaJointDepth);
                            annotationElement.setAttribute("ESTIMATE.ANNOTATION_PROPERTIES.WALL_TILES_X", currentTiles.wallTilesX);
                            annotationElement.setAttribute("ESTIMATE.ANNOTATION_PROPERTIES.WALL_TILES_Y", currentTiles.wallTilesY);
                            annotationElement.setAttribute("ESTIMATE.ANNOTATION_PROPERTIES.WALL_JOINT_X", currentTiles.wallJointX);
                            annotationElement.setAttribute("ESTIMATE.ANNOTATION_PROPERTIES.WALL_JOINT_Y", currentTiles.wallJointY);
                            annotationElement.setAttribute("ESTIMATE.ANNOTATION_PROPERTIES.WALL_JOINT_DEPTH", currentTiles.wallJointDepth);
                            annotationElement.removeAttribute("geometraBorderOpacity");

                            const oSerializer = new XMLSerializer();
                            annotXfdf = oSerializer.serializeToString(xfdfElements);
                        }
                        break;
                    case "Arrow":
                        currentName = this.arrowValueInheritance.getName();
                        currentNumber = this.arrowValueInheritance.getNumber();
                        currentColor = this.arrowValueInheritance.getColor();
                        currentInteriorColor = this.arrowValueInheritance.getInteriorColor();
                        const lineSize = this.arrowValueInheritance.getLineSize();
                        currentGeometraOpacity = this.arrowValueInheritance.getGeometraOpacity();
                        currentStyle = this.arrowValueInheritance.getStyle();
                        currentWidth = this.arrowValueInheritance.getWidth();
                        labels = this.arrowValueInheritance.getLabels();

                        const parser = new DOMParser();
                        const xfdfElements = parser.parseFromString(annotXfdf, "text/xml");
                        const annotationElement = xfdfElements.querySelector("annots").children[0];
                        annotationElement.setAttribute("color", currentColor);
                        annotationElement.setAttribute("width", lineSize);
                        annotationElement.setAttribute("annotationName", currentName);
                        annotationElement.setAttribute("annotationNumber", currentNumber);
                        annotationElement.setAttribute("geometraOpacity", currentGeometraOpacity);
                        annotationElement.setAttribute("geometraBorderOpacity", currentGeometraOpacity);
                        annotationElement.setAttribute("status", initialStatus);
                        annotationElement.setAttribute("readOnly", false);
                        annotationElement.setAttribute("style", currentStyle);
                        annotationElement.setAttribute("width", currentWidth);

                        const oSerializer = new XMLSerializer();
                        annotXfdf = oSerializer.serializeToString(xfdfElements);
                        break;
                    case "Point":
                        {
                            currentName = this.pointValueInheritance.getName();
                            currentHeight = this.pointValueInheritance.getHeight();
                            currentNumber = this.pointValueInheritance.getNumber();
                            currentInteriorColor = this.pointValueInheritance.getInteriorColor();
                            currentGeometraOpacity = this.pointValueInheritance.getGeometraOpacity();
                            currentGeometraBorderOpacity = this.pointValueInheritance.getGeometraBorderOpacity();
                            labels = this.pointValueInheritance.getLabels();

                            const currentPointSize = this.pointValueInheritance.getPointSize();
                            const currentIconType = this.pointValueInheritance.getIconType();
                            const currentRotation = this.pointValueInheritance.getRotation();
                            const parser = new DOMParser();
                            const xfdfElements = parser.parseFromString(annotXfdf, "text/xml");
                            const annotationElement = xfdfElements.querySelector("annots").children[0];
                            annotationElement.setAttribute("interior-color", currentInteriorColor);
                            annotationElement.setAttribute("pointSize", currentPointSize);
                            annotationElement.setAttribute("iconType", currentIconType);
                            annotationElement.setAttribute("rotation", currentRotation);
                            annotationElement.setAttribute("annotationName", currentName);
                            annotationElement.setAttribute("annotationNumber", currentNumber);
                            annotationElement.setAttribute("geometraOpacity", currentGeometraOpacity);
                            annotationElement.setAttribute("geometraBorderOpacity", currentGeometraBorderOpacity);
                            annotationElement.setAttribute("status", initialStatus);
                            annotationElement.setAttribute("readOnly", false);

                            const oSerializer = new XMLSerializer();
                            annotXfdf = oSerializer.serializeToString(xfdfElements);
                        }
                        break;
                    case "Stamp":
                        {
                            currentName = this.stampValueInheritance.getName();
                            currentNumber = this.stampValueInheritance.getNumber();
                            currentGeometraOpacity = this.stampValueInheritance.getGeometraOpacity();
                            currentGeometraBorderOpacity = this.stampValueInheritance.getGeometraBorderOpacity();
                            currentColor = this.stampValueInheritance.getColor();
                            currentStyle = this.stampValueInheritance.getStyle();
                            currentWidth = this.stampValueInheritance.getWidth();
                            labels = this.stampValueInheritance.getLabels();

                            const parser = new DOMParser();
                            const xfdfElements = parser.parseFromString(annotXfdf, "text/xml");
                            const annotationElement = xfdfElements.querySelector("annots").children[0];
                            annotationElement.setAttribute("geometraOpacity", currentGeometraOpacity);
                            annotationElement.setAttribute("geometraBorderOpacity", currentGeometraBorderOpacity);
                            annotationElement.setAttribute("status", initialStatus);
                            annotationElement.setAttribute("maintainAspectRatio", true);
                            annotationElement.setAttribute("readOnly", false);
                            annotationElement.setAttribute("color", currentColor);
                            annotationElement.setAttribute("style", currentStyle);
                            annotationElement.setAttribute("width", currentWidth);
                            const oSerializer = new XMLSerializer();
                            annotXfdf = oSerializer.serializeToString(xfdfElements);
                        }
                        break;
                    case "CenterValue":
                    case "PeripheralValue":
                        currentName = type;
                        break;
                    default:
                        currentName = i18n.t("GENERAL.UNKNOWN");
                }
                this.updateAnnotationNumberByProjectId(type, currentNumber);
                const noActiveParent = parentId === -1 || !parentId;
                const createAnnotationRequest = {
                    annotationId,
                    geoEstimateId: this.ActiveEstimate.get("id"),
                    fileId,
                    height: typeof currentHeight === "number" ? JSON.stringify(currentHeight) : currentHeight,
                    layerId: null,
                    parentId: noActiveParent ? null : parentId.toString(),
                    name: currentName,
                    number: currentNumber,
                    labels: labels ? JSON.stringify(labels) : null,
                    quantity: 1,
                    type,
                    xfdf: annotXfdf,
                    indexPosition: null,
                };
                NodeSocketStore.onSendMessage(GROUP_NAME.GEO_ANNOTATION, { action: ANNOTATION_ACTION_NAME.CREATE, annotations: [createAnnotationRequest] });
                return;
            });
        } catch (error) {
            console.log("Error: " + error.stack);
        }
    },
    onRequestAnnotationUpdate(data) {
        const { annots, key, value, additional } = data;

        forEach(annots, (annot) => {
            const annotationType = annot?.type;
            const annotationId = annot?.annotationId;
            if (annotationType !== X_SCALE_NAME && annotationType !== Y_SCALE_NAME) {
                let storeAnnotation = undefined;
                if (annotationType === "Reduction") storeAnnotation = this.getReductionByAnnotationId(annotationId);
                else if (annotationId) storeAnnotation = this.getAnnotationByAnnotationId(annotationId);
                else storeAnnotation = this.getAnnotationById(annot?.id);

                if (storeAnnotation) {
                    let annotationUpdated = false;
                    if (key === "preview") {
                        if (annot.xfdf) {
                            const parser = new DOMParser();
                            const oSerializer = new XMLSerializer();
                            const xfdfElements = parser.parseFromString(annot.xfdf, "text/xml");
                            const annotation = xfdfElements.querySelector("annots").children[0];
                            if (annotation.getAttribute("geometraOpacity") && !storeAnnotation.get("geometraOpacity")) {
                                annotation.setAttribute("geometraOpacity", storeAnnotation.get("geometraOpacity").toString());
                            }
                            annotation.removeAttribute("labels");
                            annotation.removeAttribute("vertices");
                            annotation.removeAttribute("annotationQuantity");
                            annotation.removeAttribute("geoFileId");
                            annotation.removeAttribute("pageNumber");

                            const id = annot.id;
                            for (const obj in annot) delete annot[obj];

                            annot.id = id;
                            annot.xfdf = oSerializer.serializeToString(xfdfElements);
                        }
                    }

                    let labels = { ...annot.labels };
                    if (key === "labels") {
                        annotationUpdated = true;
                        try {
                            labels = this.updateLabels(labels, additional?.path, additional?.updateAction, value);
                        } catch (e) {
                            console.log("Error with labels inheritance: ", e);
                            labels = null;
                        }
                    } else if (key && value !== annot[key]) {
                        annot[key] = value;
                        annotationUpdated = true;
                        const valueInheritance = this.typeInheritanceMap.get(this.getTypeConversion(annotationType));
                        if (valueInheritance) {
                            switch (key) {
                                case "name":
                                    valueInheritance.setName(value);
                                    break;
                                case "number":
                                    valueInheritance.setNumber(value);
                                    this.updateAnnotationNumberByProjectId(this.getTypeConversion(annotationType), value);
                                    break;
                                case "height":
                                    valueInheritance.setHeight(value);
                                    break;
                                default:
                                    break;
                            }
                        }
                    }
                    if (annotationType === "3DModel") return;
                    if (!key || (key && annotationUpdated)) {
                        const geoAnnotation = storeAnnotation.merge(Immutable.fromJS(annot)).toJS();

                        if (geoAnnotation.xfdf) {
                            const parser = new DOMParser();
                            const xfdfElements = parser.parseFromString(geoAnnotation.xfdf, "text/xml");
                            const annotation = xfdfElements.querySelector("annots").children[0];
                            annotation.setAttribute("annotationName", geoAnnotation.name);
                            annotation.setAttribute("annotationNumber", geoAnnotation.number);
                            annotation.setAttribute("annotationHeight", geoAnnotation.height);

                            if (geoAnnotation.type === "Point") annotation.setAttribute("geometraBorderOpacity", "0");
                            if (geoAnnotation.geometraBorderOpacity === 0 && !annotation.getAttribute("color") && geoAnnotation.color)
                                annotation.setAttribute("color", geoAnnotation.color);
                            if (key === "FontSize") annotation.setAttribute("fontSize", value);

                            annotation.setAttribute(key, value);

                            const styles = {
                                ["interiorColor"]: annotation.getAttribute("interior-color"),
                                ["geometraOpacity"]: annotation.getAttribute("geometraOpacity"),
                                ["color"]: annotation.getAttribute("color"),
                                ["geometraBorderOpacity"]: annotation.getAttribute("geometraBorderOpacity"),
                                ["style"]: annotation.getAttribute("style"),
                                ["width"]: annotation.getAttribute("width"),
                                ["fontSize"]: annotation.getAttribute("fontSize"),
                                ["decoration"]: this.parseRichTextStyleFromXfdf(geoAnnotation.xfdf),
                                ["strokeColor"]: annotation.getAttribute("strokeColor"),
                                ["geometraLineStart"]: annotation.getAttribute("geometraLineStart"),
                                ["geometraLineEnd"]: annotation.getAttribute("geometraLineEnd"),
                                ["pointSize"]: annotation.getAttribute("pointSize"),
                                ["iconType"]: annotation.getAttribute("iconType"),
                                ["TextColor"]: annotation.getAttribute("TextColor"),
                            };

                            const tiles = {
                                areaTilesX: annotation.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.AREA_TILES_X"),
                                areaTilesY: annotation.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.AREA_TILES_Y"),
                                areaJointX: annotation.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.AREA_JOINT_X"),
                                areaJointY: annotation.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.AREA_JOINT_Y"),
                                areaJointDepth: annotation.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.AREA_JOINT_DEPTH"),

                                wallTilesX: annotation.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.WALL_TILES_X"),
                                wallTilesY: annotation.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.WALL_TILES_Y"),
                                wallJointX: annotation.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.WALL_JOINT_X"),
                                wallJointY: annotation.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.WALL_JOINT_Y"),
                                wallJointDepth: annotation.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.WALL_JOINT_DEPTH"),
                            };

                            const properties = {
                                name: geoAnnotation.name,
                                height: geoAnnotation.height,
                                maintainAspectRatio: annotation.getAttribute("maintainAspectRatio"),
                                labels: labels,
                            };
                            this.changeAnnotationInheritance({ type: annotationType, styles, properties, tiles });
                        }
                    }
                }
            }
        });

        if (key === "readOnly") {
            CalculationStore.updateReadOnlyRows({ annotationIds: map(annots, (annot) => annot?.id), value });
        }

        if (key === "preview")
            NodeSocketStore.onSendMessage(GROUP_NAME.GEO_ANNOTATION, {
                action: ANNOTATION_ACTION_NAME.UPDATE,
                annotations: annots,
            });
        else {
            const polylines = filter(annots, (annot) => annot.type === "Polyline");
            const polylineIds = map(polylines, (polyline) => polyline.id);
            if (key === "geometraOpacity" && polylineIds.length) {
                NodeSocketStore.onSendMessage(GROUP_NAME.GEO_ANNOTATION, {
                    action: ANNOTATION_ACTION_NAME.UPDATE,
                    ids: polylineIds,
                    parameter: "geometraBorderOpacity",
                    value,
                });
            }
            NodeSocketStore.onSendMessage(GROUP_NAME.GEO_ANNOTATION, {
                action: ANNOTATION_ACTION_NAME.UPDATE,
                ids: map(annots, (annot) => annot?.id),
                parameter: key,
                value,
                ...additional,
            });
        }
    },
    onRequestScaleUpdate2(data) {
        const { scale, key } = data;

        if (key === "preview") {
            if (scale.xdf) {
                const parser = new DOMParser();
                const oSerializer = new XMLSerializer();
                const xfdfElements = parser.parseFromString(scale.xdf, "text/xml");
                const annotation = xfdfElements.querySelector("annots").children[0];
                annotation.removeAttribute("labels");
                annotation.removeAttribute("vertices");
                annotation.removeAttribute("annotationQuantity");
                annotation.removeAttribute("geoFileId");
                annotation.removeAttribute("pageNumber");
                annotation.removeAttribute("status");
                annotation.removeAttribute("head");

                const id = scale.id;
                for (const obj in scale) delete scale[obj];

                scale.id = id;
                scale.xdf = oSerializer.serializeToString(xfdfElements);
            }
        }

        if (key === "preview") {
            NodeSocketStore.onSendMessage(GROUP_NAME.GEO_SCALE, {
                action: SCALE_ACTION_NAME.UPDATE,
                scale,
            });
        } else {
            NodeSocketStore.onSendMessage(GROUP_NAME.GEO_SCALE, { action: SCALE_ACTION_NAME.UPDATE, ...data });
        }
    },
    onScaleUpdate(payload) {
        try {
            const { id } = payload;
            if (!id) return;

            const mergedScale = payload.scale ? ObjectsStore.updateScaleFromPdfTron(payload.scale) : ObjectsStore.updateScale(payload);
            ObjectsStore.exchangeSelectedIfSelected(mergedScale);
            if (this.WebViewer && this.documentLoaded) {
                this.updateScale(mergedScale);
                this.WebViewer.annotManager.exportAnnotationCommand();
            }

            this.trigger("AnnotationUpdated");
        } catch (e) {
            console.log(e.stack);
        }
    },
    async onGeoAnnotationMessageHandler(response) {
        const {
            payload: { annotations, userId },
            action,
        } = response;

        switch (action) {
            case ANNOTATION_ACTION_NAME.CREATE:
                forEach(annotations, (annotation) => this.onAnnotationCreateSwitch(annotation, userId));
                break;
            case ANNOTATION_ACTION_NAME.UPDATE:
                this.onAnnotationsUpdateHandler(response.payload);
                break;
            case ANNOTATION_ACTION_NAME.DUPLICATE:
                this.onAnnotationsDuplicateHandler(response.payload);
                break;
            case ANNOTATION_ACTION_NAME.DELETE:
                this.onDeleteAnnotations(response.payload);
                break;
            default:
                return;
        }
    },

    async onAnnotationsUpdateHandler(response) {
        const { parameter } = response;
        try {
            const annotComHandler = new AnnotCommandHandler();
            const updatedAnnots = response?.annotations
                ? ObjectsStore.updateAnnotationsAfterPdfTronChange(response.annotations)
                : ObjectsStore.updateAnnotations(response);

            _.forEach(updatedAnnots, (annot) => {
                ObjectsStore.exchangeSelectedIfSelected(annot);
                if ((annot.type !== ANNOT_TYPES.GROUP || annot.type !== ANNOT_TYPES.IFC_MODEL) && annot.geoFile.id === this.getActiveFileId())
                    annotComHandler.addModifyCommand(annot.xfdf);
            });
            if (parameter && parameter === "parentId") {
                if (updatedAnnots.length > 0 || (updatedAnnots.length === 1 && updatedAnnots[0].type !== ANNOT_TYPES.GROUP)) {
                    this.onSetActiveParentId(updatedAnnots[0].parentId);
                } else if (updatedAnnots.length === 1 && updatedAnnots[0].type === ANNOT_TYPES.GROUP) {
                    this.onSetActiveParentId(updatedAnnots[0].id);
                }
            }
            const updateRows = response?.annotations || parameter === "height" || parameter === "quantity";
            if (updateRows) {
                // const rowsToUpdate = [];
                // _.forEach(updatedAnnots, (annotation) => {
                //     const rows = _.values(annotation.rows);
                //     if (rows.length) rowsToUpdate = [...rowsToUpdate, ...rows];
                // });
                //if (rowsToUpdate.length) ObjectsStore.onRowsDelete(rowsToUpdate);
                //update rows when values are changed
            }
            //sth with g3 tiles, move this to calcvalues/parseAnnot
            //  if (
            //     annot.has("ESTIMATE.ANNOTATION_PROPERTIES.TILES_X") &&
            //     !updatedAnnotation["ESTIMATE.ANNOTATION_PROPERTIES.TILES_X"]
            // ) {
            //     mergedAnnot = mergedAnnot.delete("ESTIMATE.ANNOTATION_PROPERTIES.TILES_X");
            //     mergedAnnot = mergedAnnot.delete("ESTIMATE.ANNOTATION_PROPERTIES.TILES_Y");
            //     mergedAnnot = mergedAnnot.delete("ESTIMATE.ANNOTATION_PROPERTIES.JOINT_X");
            //     mergedAnnot = mergedAnnot.delete("ESTIMATE.ANNOTATION_PROPERTIES.JOINT_Y");
            //     mergedAnnot = mergedAnnot.delete("ESTIMATE.ANNOTATION_PROPERTIES.JOINT_DEPTH");
            // }
            // this.setBundledRows();
            if (this.WebViewer && this.documentLoaded) {
                const annotCmd = annotComHandler.getAnnotCommand();
                await this.WebViewer.annotManager.exportAnnotationCommand();
                const updatedPdftronAnnotations = await this.WebViewer.annotManager.importAnnotationCommand(annotCmd);
                if (updatedPdftronAnnotations) {
                    const annotManager = this.WebViewer.annotManager;
                    forEach(updatedPdftronAnnotations, (updatedAnnot) => {
                        if (annotManager.isAnnotationSelected(updatedAnnot)) {
                            this.initPdfAnnotationAsSelected(updatedAnnot);
                        } else {
                            this.initPdfAnnotationAsDeselected(updatedAnnot);
                        }
                    });
                }
                this.WebViewer.annotManager.exportAnnotationCommand();
            }
            const propsUpdatingTreeList = ["parentId", "number", "name", "color", "readOnly", "status", "interior-color", "strokeColor"];
            const updateTree = propsUpdatingTreeList.includes(parameter);
            const triggerName = updateTree ? "AnnotationUpdatedUpdateTree" : "AnnotationUpdatedSkipTreeUpdate";
            this.trigger(triggerName);
            this.trigger("AnnotationUpdated");
            try {
                if (this.WebViewer && this.documentLoaded) {
                    const pageCount = this.WebViewer.docViewer.getPageCount();
                    for (let i = 1; i <= pageCount; i++) {
                        await this.WebViewer.annotManager.drawAnnotations(i);
                    }
                }
            } catch (error) {
                console.log("error 10 " + error);
            }
        } catch (error) {
            console.log("Error | actions.updateArray " + error.stack);
        }
    },

    onAnnotationCreateSwitch(annot, userId) {
        switch (annot.type) {
            case "3DModel":
                const createdIfcAnnot = ObjectsStore.onObjectCreate(annot);
                IfcStore.addCreatedIfcAnnotation(createdIfcAnnot, userId);
                break;
            case "group":
                const createdFolder = ObjectsStore.onObjectCreate(annot);
                this.onCreateFolder(createdFolder, userId);
                break;
            default:
                const createdAnnot = ObjectsStore.onObjectCreate(annot);
                this.onAnnotationCreate(createdAnnot, userId);
                break;
        }
    },
    async onAnnotationCreate(annotation, userId) {
        const {
            geoFile: { id: fileId },
            geoEstimate: { id: geoEstimateId },
            id,
        } = annotation;
        if (geoEstimateId !== this.ActiveEstimate.get("id")) return;

        const annotComHandler = new AnnotCommandHandler();
        if (fileId === this.getActiveFileId()) {
            annotComHandler.addAddedCommand(annotation.xfdf);
        }

        if (this.getActiveFileId() === fileId) {
            let addedPdftronAnnotations;
            if (this.WebViewer && this.documentLoaded) {
                const annotCmd = annotComHandler.getAnnotCommand();
                this.WebViewer.annotManager.exportAnnotationCommand();
                try {
                    addedPdftronAnnotations = await this.WebViewer.annotManager.importAnnotationCommand(annotCmd);
                } catch (error) {
                    console.log("error 5" + error.stack);
                }
                this.WebViewer.annotManager.exportAnnotationCommand();
                if (addedPdftronAnnotations) {
                    forEach(addedPdftronAnnotations, (insertedAnnot) => {
                        this.initPdfAnnotationAsDeselected(insertedAnnot);
                    });
                }
            }

            if (userId === AuthenticationStore.getUserId()) {
                if (annotation.type === ANNOT_TYPES.REDUCTION) this.setIsReductionCreated(true);
                ObjectsStore.selectAnnotation(annotation);
                const isReduction = annotation.type === ANNOT_TYPES.REDUCTION;
                this.addedAnnotInfo = {
                    id,
                    //add this later
                    //id: isReduction ? this.getAnnotationByAnnotationId(parsedAnnotation.get("parentId")).get("id") : id,
                    type: annotation.type,
                };
            } else if (this.WebViewer && this.documentLoaded) {
                await this.WebViewer.annotManager.drawAnnotations(this.WebViewer.docViewer.getCurrentPage());
            }
        }
        this.trigger("annotationsInserted");
    },
    async onScaleCreate({ scale, userId, removedScaleNames }) {
        const { geoEstimateId, fileId, type, page } = scale;
        const parsedScale = ObjectsStore.onScaleCreate(scale);
        if (geoEstimateId !== this.ActiveEstimate.get("id")) return;

        if (this.WebViewer && this.documentLoaded) {
            try {
                const am = this.WebViewer.annotManager;
                forEach(removedScaleNames, (removedScaleName) => {
                    const oldScaleAnnot = am.getAnnotationById(removedScaleName);
                    if (oldScaleAnnot) {
                        am.deleteAnnotation(oldScaleAnnot, true, true);
                    }
                });
                const pdfAnnotation = await this.insertScale(parsedScale);
                await this.WebViewer.annotManager.exportAnnotationCommand();
                if (userId === AuthenticationStore.getUserId()) {
                    this.WebViewer.annotManager.selectAnnotation(pdfAnnotation);
                    ObjectsStore.selectScale({ scaleType: type, activeEstimateId: geoEstimateId, fileId, activePage: page });
                    this.trigger("UserAddedScale");
                }
            } catch (error) {
                console.log("Error | Insert Scale: " + error);
            }
        }
        this.trigger("AnnotationAdded", parsedScale.id);
        this.trigger("scaleInserted");
    },
    getScale({ fileId, estimateId, page, type }) {
        if (type === X_SCALE_NAME) {
            return last(filter(this.xScaleList.toJS(), (o) => o.page === page && o.geoEstimate.id === estimateId && o.geoFile.id === fileId));
        }
        if (type === Y_SCALE_NAME) {
            return last(filter(this.yScaleList.toJS(), (o) => o.page === page && o.geoEstimate.id === estimateId && o.geoFile.id === fileId));
        }
    },
    async insertScale(scale) {
        this.annotationManagerSelectionLock = true;
        const am = this.WebViewer.annotManager;
        if (scale && this.ActiveFileId == scale.geoFile.id) {
            const importedAnnotation = await am.importAnnotations(scale.xdf);
            const importedAnnot = importedAnnotation[0];
            if (scale.type === "x-scale") {
                importedAnnot.Subject = "x-scale";
            }
            importedAnnot.length = scale.length;
            await am.redrawAnnotation(importedAnnot);
            await am.exportAnnotationCommand();
            this.annotationManagerSelectionLock = false;
            return importedAnnot;
        }
        this.annotationManagerSelectionLock = false;
    },
    onScaleDelete({ deletedScales }) {
        TreeStoreV2.clearSelectedAnnotations();
        if (this.WebViewer && this.documentLoaded) {
            deletedScales.forEach((scale) => {
                const { estimateId: geoEstimateId, fileId: geoFileId, type: annotationType, page: pageNumber } = scale;
                const oldScale = ObjectsStore.getScaleByPDFTronAnnot({ geoEstimateId, geoFileId, annotationType, pageNumber });
                if (oldScale) this.deleteScale(oldScale);
            });
        }
        ObjectsStore.onAnnotationsDelete(deletedScales);
        ObjectsStore.recalculateValuesAndRowsAfterScaleLenghtUpdate(deletedScales[0].estimateId, deletedScales[0].fileId);
        if (this.WebViewer && this.documentLoaded) {
            this.WebViewer.annotManager.drawAnnotations(this.WebViewer.getCurrentPageNumber());
        }
        this.trigger("AnnotationDeleted");
        this.trigger("scaleDeleted");
    },
    onAnnotationsDuplicateHandler(duplicateInfo) {
        const { annotations, annotationRows, userId, length, totalLength } = duplicateInfo;
        if (totalLength && length === totalLength) {
            this.onAnnotationsDuplicate(annotations, annotationRows, userId);
            return;
        }

        this.duplicateAnnotsModalInfo.duplicatingAnnots = true;
        this.duplicateAnnotsModalInfo.annotsToDuplicate = totalLength;
        this.duplicateAnnotsModalInfo.annotsDuplicated += length;
        this.duplicateAnnotsModalInfo.annotsDuplicatedList.push(...annotations);
        this.duplicateAnnotsModalInfo.annotsRowsDuplicatedList.push(...annotationRows);
        this.duplicateAnnotsModalInfo.userId = userId;
        this.trigger("duplicatingAnnotsInfoChanged");

        if (this.duplicateAnnotsModalInfo.annotsDuplicated === totalLength) {
            setTimeout(
                () =>
                    this.onAnnotationsDuplicate(
                        this.duplicateAnnotsModalInfo.annotsDuplicatedList,
                        this.duplicateAnnotsModalInfo.annotsRowsDuplicatedList,
                        userId
                    ),
                300
            );
        }
    },

    async onAnnotationsDuplicate(annotations, annotationRows, userId) {
        const addedAnnots = ObjectsStore.onAnnotationDuplicate(annotations, annotationRows);

        if (annotations[0].geoEstimateId !== this.ActiveEstimate.get("id")) return;

        const annotComHandler = new AnnotCommandHandler();
        const annotsToCheckForGuiList = [];

        forEach(addedAnnots, (insertedAnnotation) => {
            const {
                geoFile: { id: fileId },
                xfdf,
            } = insertedAnnotation;
            annotsToCheckForGuiList.push(insertedAnnotation);
            if (this.getActiveFileId() === fileId) annotComHandler.addAddedCommand(xfdf);
        });

        let addedPdftronAnnotations;
        if (this.WebViewer && this.documentLoaded) {
            const annotCmd = annotComHandler.getAnnotCommand();
            this.WebViewer.annotManager.exportAnnotationCommand();
            try {
                addedPdftronAnnotations = await this.WebViewer.annotManager.importAnnotationCommand(annotCmd);
            } catch (error) {
                console.log("error 5" + error.stack);
            }
            this.WebViewer.annotManager.exportAnnotationCommand();
            if (addedPdftronAnnotations) {
                forEach(addedPdftronAnnotations, (insertedAnnot) => {
                    this.initPdfAnnotationAsDeselected(insertedAnnot);
                });
            }

            if (userId === AuthenticationStore.getUserId()) {
                ObjectsStore.selectListOfObjects(annotsToCheckForGuiList);
            } else await this.WebViewer.annotManager.drawAnnotations(this.WebViewer.docViewer.getCurrentPage());
        }
        this.trigger("annotationsInserted");
    },
    onRequestAnnotationFolderCreate(name) {
        const noActiveParent = this.ActiveParentId === -1 || !this.ActiveParentId;
        const geoEstimateId = this.ActiveEstimate.get("id");
        const createFolderRequest = {
            geoEstimateId,
            parentId: noActiveParent ? null : this.ActiveParentId.toString(),
            name,
            number: this.getFolderTagNumber(geoEstimateId),
            type: "group",
        };
        NodeSocketStore.onSendMessage(GROUP_NAME.GEO_ANNOTATION, { action: ANNOTATION_ACTION_NAME.CREATE, annotations: [createFolderRequest] });
    },
    onCreateFolder(data, userId) {
        const {
            geoEstimate: { id: geoEstimateId },
            id,
            type,
        } = data;
        if (geoEstimateId !== this.ActiveEstimate.get("id")) return;

        if (userId === AuthenticationStore.getUserId()) {
            ObjectsStore.selectListOfObjects([], [data]);
            this.addedAnnotInfo = { id, type };
        }
        this.trigger("folderInserted");
    },
    onRequestScaleDelete(scalesToDelete, skipUpdatingYScale) {
        let yScalesToConvertToX = new Immutable.List();
        let visualsIds = [];

        if (scalesToDelete && scalesToDelete.length > 0) {
            const ids = scalesToDelete.map((scale) => scale.id);

            scalesToDelete.forEach((scale) => {
                let yScaleToConvertToX = undefined;
                // const hasValuesAnnots = scale.get("displayValueList") && scale.get("displayValueList").size;
                // visualsIds = visualsIds.concat(hasValuesAnnots ? this.getDisplayValueAnnotationIdsForParent(scale.get("annotationId")) : []);

                if (scale.type === "x-scale") {
                    const { type, page } = scale;
                    yScaleToConvertToX = ScaleStore.getScale(type, page);
                    //yScaleToConvertToX = this.getYscaleForFileAndPage(scale);
                    if (yScaleToConvertToX && !ids.includes(yScaleToConvertToX.id)) {
                        yScalesToConvertToX.push(yScaleToConvertToX);
                    }
                }
            });

            // if (visualsIds.length > 0) {
            //     NodeSocketStore.onSendMessage(GROUP_NAME.GEO_ANNOTATION, { action: ANNOTATION_ACTION_NAME.DELETE, ids: visualsIds });
            // }

            NodeSocketStore.onSendMessage(GROUP_NAME.GEO_SCALE, { action: SCALE_ACTION_NAME.DELETE, ids });
            if (skipUpdatingYScale) return;
            const parser = new DOMParser();
            const oSerializer = new XMLSerializer();
            yScalesToConvertToX.forEach((yScale) => {
                const xfdfElements = parser.parseFromString(yScale.xdf, "text/xml");
                const annotationElement = xfdfElements.querySelector("annots").children[0];
                annotationElement.setAttribute("subject", "x-scale");
                const updatedXfdf = oSerializer.serializeToString(xfdfElements);
                yScale.xdf = updatedXfdf;
                yScale.type = "x-scale";
                this.onRequestScaleUpdate(yScale, yScale.xdf, true);
            });
        }
    },
    onRequestScaleUpdate(scale, xdf) {
        const {
            geoEstimate: { id: geoEstimateId },
            geoFile: { id: geoFileId },
            page: pageNumber,
            type: annotationType,
        } = scale;
        const jsScale = ObjectsStore.getScaleByPDFTronAnnot({ geoEstimateId, geoFileId, annotationType, pageNumber });
        let immutableScale = Immutable.fromJS(jsScale)
            .merge(scale)
            .delete("color")
            .delete("interior-color")
            .delete("strokeSize")
            .delete("width")
            .delete("annotationId")
            .delete("geoEstimate")
            .delete("geoFile")
            .delete("displayValueList")
            .delete("geometraOpacity")
            .delete("geometraLineStart")
            .delete("geometraLineEnd");

        if (xdf) {
            immutableScale = immutableScale.set("xdf", xdf);
            immutableScale = immutableScale.set("length", String(immutableScale.get("length")));
        }

        if (immutableScale) {
            NodeSocketStore.onSendMessage(GROUP_NAME.GEO_SCALE, { action: SCALE_ACTION_NAME.UPDATE, scale: immutableScale.toJS() });
        }
    },
    onRequestScaleCreate(annotXfdf, type, fileId, page, length) {
        annotXfdf = this.changeXfdfAttribute(annotXfdf, {
            geometraLineStart: "|<-",
            geometraLineEnd: "|<-",
            width: "1",
        });
        // let visualsIds = [];
        // const scaleList = type === "x-scale" ? this.xScaleList : this.yScaleList;

        // scaleList.forEach((scale) => {
        //     const hasValuesAnnots = scale.get("displayValueList") && scale.get("displayValueList").size;
        //     visualsIds = visualsIds.concat(hasValuesAnnots ? this.getDisplayValueAnnotationIdsForParent(scale.get("annotationId")) : []);
        // });

        // if (visualsIds.length > 0) {
        //     NodeSocketStore.onSendMessage(GROUP_NAME.GEO_ANNOTATION, { action: ANNOTATION_ACTION_NAME.DELETE, ids: visualsIds });
        // }
        const createScaleRequest = {
            geoEstimateId: this.ActiveEstimate.get("id"),
            fileId,
            page,
            xdf: annotXfdf,
            type,
            length: String(length || 0),
        };

        NodeSocketStore.onSendMessage(GROUP_NAME.GEO_SCALE, { action: SCALE_ACTION_NAME.CREATE, ...createScaleRequest });
    },
    onTriggerDeleteAnnotations() {
        this.trigger("deleteAnnotations");
    },
    async onInitializeEstimates(estimateArray) {
        const savedActiveEstimate = JSON.parse(localStorage.getItem("activeEstimate"));
        let activeEstimate = {};

        if (estimateArray[0].theGeoEstimate.geoProject.id === get(savedActiveEstimate, "geoProject.id")) {
            activeEstimate = estimateArray.find((element) => element.theGeoEstimate.id === savedActiveEstimate.id) || estimateArray[0];
        } else {
            activeEstimate = estimateArray[0];
        }
        this.ActiveEstimate = Immutable.fromJS(activeEstimate.theGeoEstimate);

        // this.Annotations = this.Annotations.filter((annot) => {
        //         if (annot.get("type") === "CenterValue" || annot.get("type") === "PeripheralValue") {
        //             DisplayValuesAnnotationsHandler.getInstance().addDisplayAnnotations(annot.get("parentId"), annot);
        //             this.displayValueAnnotations = this.displayValueAnnotations.push(annot);
        //             return false;
        //         }
        // });
        this.setFetchingDataLoader(false);
        try {
            if (this.WebViewer && this.documentLoaded) {
                this.loadAllAnnotations();
            }
        } catch (error) {
            console.log(error);
        }
        EstimateStore.setAnnotationsFromJava(estimateArray);
        this.setAnnotationActionDone(true);
        // const childrenKeys = this.getAllAnnotationsFromParent(this.ActiveParentId)
        //     .toJS()
        //     .map((annot) => {
        //         return annot.id;
        //     });
        // TreeStore.setTreeSelection(childrenKeys);
        this.trigger("EstimateInitialized");
    },
    async reloadAnnotations(removedAnnotationIds) {
        try {
            if (this.WebViewer) {
                this.annotationManagerSelectionLock = true;
                const am = this.WebViewer.annotManager;
                await am.exportAnnotationCommand();
                const selectedAnnotations = am.getSelectedAnnotations();

                const list = this.WebViewer.annotManager.getAnnotationsList();

                for (let i = 0; i < list.length; i++) {
                    if (removedAnnotationIds.includes(list[i].Id)) {
                        if (list[i].Subject === "Point") {
                            list[i].iconType = "none";
                        }
                        list.splice(i, 1);
                        i--;
                    }
                }

                forEach(selectedAnnotations, (annot) => {
                    this.initPdfAnnotationAsSelected(annot);
                });
                am.selectAnnotations(selectedAnnotations);

                await am.exportAnnotationCommand();
                try {
                    const pageCount = this.WebViewer.docViewer.getPageCount();
                    for (let i = 1; i <= pageCount; i++) {
                        await this.WebViewer.annotManager.drawAnnotations(i);
                    }
                } catch (error) {
                    console.log("error 1 " + error);
                }
                await am.exportAnnotationCommand();
            }
        } catch (error) {
            console.log("Error reloading AnnotationManager: " + error.stack);
        }
        this.annotationManagerSelectionLock = false;
    },
    onDeleteFileHandler(fileId) {
        const estimateId = this.ActiveEstimate.get("id");
        ObjectsStore.deleteAnnotationsAfterFilesDelete([fileId], estimateId);
        this.trigger("AnnotationDeleted");
    },
    onDeleteDriveFolderHandler(fileIdsArr) {
        const estimateId = this.ActiveEstimate.get("id");
        ObjectsStore.deleteAnnotationsAfterFilesDelete(fileIdsArr, estimateId);
        this.trigger("AnnotationDeleted");
    },
    //---------------------------Util functions-----------------------------------

    /**
     * Sets attributes of an XFDF string.
     * @param {string} xfdf The xfdf string to update
     * @param {string|Object.<string, string>} property The key to update. If this is an object, it'll set multiple properties
     * @param {?string} value The value to set the key to. Ignored if property is an object.
     * @function
     * @author Max Thor
     * @returns {string} The serialized XFDF string with the new values
     */
    changeXfdfAttribute(xfdf, property, value) {
        const parser = new DOMParser();

        const oSerializer = new XMLSerializer();

        const xfdfElements = parser.parseFromString(xfdf, "text/xml");
        const element = xfdfElements.querySelector("annots").children[0];

        const isPropertyObject = typeof property === "object" && property !== null;

        if (!isPropertyObject) {
            element.setAttribute(property, value);
        } else {
            Object.keys(property).forEach((key) => {
                element.setAttribute(key, property[key]);
            });
        }

        return oSerializer.serializeToString(xfdfElements);
    },

    parseDefaultStyleFromXfdf(xfdfString) {
        let defaultStyle;
        try {
            const parser = new DOMParser();
            const xfdfElements = parser.parseFromString(xfdfString, "text/xml");
            const annotations = xfdfElements.getElementsByTagName("defaultstyle");
            forEach(annotations, (annotElement) => {
                defaultStyle = annotElement.childNodes[0].nodeValue;
            });
        } catch (error) {
            console.log("Error | Parsing Default style: " + error);
        }

        if (!defaultStyle) return {};

        return styleToObject(defaultStyle);
    },

    parseStyleFromXfdf(xfdfString) {
        if (!xfdfString) return "";

        let style;
        const parser = new DOMParser();
        const xfdfElements = parser.parseFromString(xfdfString, "text/xml");
        const annotations = get(xfdfElements.querySelector("annots"), "children");

        forEach(annotations, (annotElement) => {
            style = annotElement.getAttribute("style");
        });

        return style !== "undefined" ? style : "solid";
    },

    parseRichTextStyleFromXfdf(xfdfString) {
        const parser = new DOMParser();
        const xfdfElements = parser.parseFromString(xfdfString, "text/xml");
        const freetext = xfdfElements.querySelector("freetext");
        if (!freetext) return {};
        const richText = freetext.querySelector("contents-richtext");
        if (!richText) return {};
        const span = richText.querySelector("body > p > span");
        const styleString = span.getAttribute("style");
        const style = styleToObject(styleString);
        return style;
    },

    updateLabels(labels, path, updateAction, value) {
        if (updateAction === "add") labels[path].push(value);
        else if (updateAction === "remove") labels[path] = labels[path].filter((item) => item !== value);
        else set(labels, path, value);
        return labels;
    },
    parseScales(scales, parameters, path, updateAction) {
        const parser = new DOMParser();
        const oSerializer = new XMLSerializer();
        const isEstimateLocked = get(this.ActiveEstimate.toJS(), "locked");

        return scales.map((scale) => {
            const xfdfElements = parser.parseFromString(scale.get("xdf"), "text/xml");
            const annotElement = xfdfElements.querySelector("annots").firstElementChild;

            const name = annotElement.getAttribute("name");
            const color = !isNil(parameters?.color) ? parameters?.color : annotElement.getAttribute("color");
            const interiorColor = !isNil(get(parameters, "interior-color")) ? get(parameters, "interior-color") : annotElement.getAttribute("interior-color");
            const width = !isNil(parameters?.width) ? parameters?.width : annotElement.getAttribute("width") || "1";
            const geometraLineStart = !isNil(parameters?.geometraLineStart)
                ? parameters?.geometraLineStart
                : annotElement.getAttribute("geometraLineStart") || "|<-";
            const geometraLineEnd = !isNil(parameters?.geometraLineEnd) ? parameters?.geometraLineEnd : annotElement.getAttribute("geometraLineEnd") || "|<-";
            const readOnly = isEstimateLocked
                ? isEstimateLocked
                : !isNil(parameters?.readOnly)
                ? parameters?.readOnly
                : annotElement.getAttribute("readOnly") === "true";
            const Hidden = !isNil(parameters?.Hidden) ? parameters?.Hidden : annotElement.getAttribute("Hidden") === "true";
            const opacity = parseFloat(!isNil(parameters?.geometraOpacity) ? parameters?.geometraOpacity : annotElement.getAttribute("geometraOpacity"));
            const geometraOpacity = !Number.isNaN(opacity) ? opacity : 1;
            const strokeSize = !isNil(parameters?.strokeSize) ? parameters?.strokeSize : annotElement.getAttribute("strokeSize");
            const length = parseFloat(JSON.parse(!isNil(parameters?.length) ? parameters?.length : scale.get("length")));
            const style = !isNil(parameters?.style) ? parameters?.style : annotElement.getAttribute("style");

            let labels = isImmutable(scale.get("labels")) ? scale.get("labels").toJS() : scale.get("labels");
            if (!isNil(parameters?.labels)) {
                if (labels) {
                    labels = this.updateLabels(labels, path, updateAction, parameters.labels);
                } else {
                    labels = this.getDefaultLabels();
                    labels = this.updateLabels(labels, path, updateAction, parameters.labels);
                }
            } else {
                if (typeof labels === "string") {
                    try {
                        labels = JSON.parse(labels);
                    } catch (e) {
                        console.log("Error with scale parsing: ", e);
                    }
                }
            }

            annotElement.setAttribute("name", name);
            annotElement.setAttribute("annotationName", scale.get("type"));
            annotElement.setAttribute("color", color);
            annotElement.setAttribute("interior-color", interiorColor);
            annotElement.setAttribute("width", width);
            annotElement.setAttribute("geometraLineStart", geometraLineStart);
            annotElement.setAttribute("geometraLineEnd", geometraLineEnd);
            annotElement.setAttribute("readOnly", readOnly);
            annotElement.setAttribute("Hidden", Hidden);
            annotElement.setAttribute("geometraOpacity", geometraOpacity);
            annotElement.setAttribute("strokeSize", strokeSize);
            annotElement.setAttribute("length", length);
            annotElement.setAttribute("labels", JSON.stringify(labels));
            annotElement.setAttribute("style", style);

            const updatedXdf = oSerializer.serializeToString(xfdfElements);

            const newScale = scale
                .set("annotationId", name)
                .set("color", color)
                .set("interior-color", interiorColor)
                .set("width", width)
                .set("geometraLineStart", geometraLineStart)
                .set("geometraLineEnd", geometraLineEnd)
                .set("readOnly", readOnly)
                .set("Hidden", Hidden)
                .set("geometraOpacity", geometraOpacity)
                .set("strokeSize", strokeSize)
                .set("length", length)
                .set("labels", labels)
                .set("xdf", updatedXdf)
                .set("style", style);

            return newScale;
        });
    },

    generateUUID() {
        let d = new Date().getTime();
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
            const r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
        });
    },
    // shouldReloadAnnotation(annotation) {
    //     return annotation.get("type") !== "group" && annotation.getIn(["geoFile", "id"]) === this.getActiveFileId();
    // },
    getFolderTagNumber(geoEstimateId) {
        const folderList = ObjectsStore.getAllFolders(geoEstimateId);
        if (folderList.length) {
            let le = folderList[folderList.length - 1]["number"];
            if (le) {
                const calculator = new GeometricCalculation();
                le = calculator.getNextNumberString(le);
            }
            return le;
        } else {
            return "001";
        }
    },

    getLabelsOfSelectedAnnots() {
        //const typeMap = this.annotationTypeMap.toJS();
        const typeMap = ObjectsStore.getTypeMap();
        const activeTypes = filter(keys(typeMap), (type) => typeMap[type] && type);
        const returnedData = { centralLabels: [], sideLabels: [] };

        forEach(activeTypes, (type) => {
            const labels = this.getLabelsByAnnotType(type);
            if (labels && labels.centralLabels) returnedData.centralLabels = uniq([...returnedData.centralLabels, ...labels.centralLabels]);
            if (labels && labels.sideLabels) returnedData.sideLabels = uniq([...returnedData.sideLabels, ...labels.sideLabels]);
        });

        return returnedData;
    },

    getTypesOfSelectedAnnots() {
        //const typeMap = this.annotationTypeMap.toJS();
        const typeMap = ObjectsStore.getTypeMap();
        const activeTypes = filter(
            keys(typeMap),
            (type) => typeMap[type] && type && !includes(["CenterValue", "PeripheralValue", "group", "nrSelected"], type)
        );
        return uniq(activeTypes);
    },

    getDefaultLabels(isPointType = false) {
        return {
            active: [],
            centralStyles: {
                color: "#FFFFFF",
                bgColor: "#FF0000",
                font: "Arial",
                fontSize: 6,
                fontStyles: [],
                opacity: 1,
                bgOpacity: 1,
                render: isPointType ? "right-grouped" : "grouped-rows",
                x: 0,
                y: 0,
            },
            sideStyles: {
                color: "#FFFFFF",
                bgColor: "#FF0000",
                font: "Arial",
                fontSize: 6,
                fontStyles: [],
                opacity: 1,
                bgOpacity: 1,
                margin: 0,
            },
        };
    },

    getLabelsByAnnotType(type) {
        switch (type) {
            case ANNOT_TYPES.POINT:
                return {
                    centralLabels: [LABELS.NR_TAG, LABELS.NAME],
                };
            case ANNOT_TYPES.POLYLINE:
                return {
                    sideLabels: [
                        LABELS.NR_TAG,
                        LABELS.NAME,
                        LABELS.VARIABLES,
                        LABELS.LENGTH,
                        LABELS.WALL,
                        LABELS.NET_LENGTH,
                        LABELS.NET_WALL,
                        LABELS.LENGTHS,
                        LABELS.WALLS,
                    ],
                };
            case ANNOT_TYPES.POLYGON:
                return {
                    centralLabels: [
                        LABELS.NR_TAG,
                        LABELS.NAME,
                        LABELS.VARIABLES,
                        LABELS.AREA,
                        LABELS.LENGTH,
                        LABELS.VOLUME,
                        LABELS.WALL,
                        LABELS.NET_AREA,
                        LABELS.NET_LENGTH,
                        LABELS.NET_VOLUME,
                        LABELS.NET_WALL,
                        LABELS.OUTER_DIM_X,
                        LABELS.OUTER_DIM_Y,
                        LABELS.RED_AREA,
                        LABELS.RED_LENGTH,
                        LABELS.RED_VOLUME,
                        LABELS.RED_WALL,
                    ],
                    sideLabels: [LABELS.LENGTHS, LABELS.WALLS],
                };
            case ANNOT_TYPES.REDUCTION:
                return {
                    centralLabels: [
                        LABELS.NR_TAG,
                        LABELS.NAME,
                        LABELS.VARIABLES,
                        LABELS.AREA,
                        LABELS.LENGTH,
                        LABELS.VOLUME,
                        LABELS.WALL,
                        LABELS.NET_AREA,
                        LABELS.NET_LENGTH,
                        LABELS.NET_VOLUME,
                        LABELS.NET_WALL,
                        LABELS.OUTER_DIM_X,
                        LABELS.OUTER_DIM_Y,
                    ],
                    sideLabels: [LABELS.LENGTHS, LABELS.WALLS],
                };
            case ANNOT_TYPES.ELLIPSE:
                return {
                    centralLabels: [
                        LABELS.NR_TAG,
                        LABELS.NAME,
                        LABELS.VARIABLES,
                        LABELS.AREA,
                        LABELS.LENGTH,
                        LABELS.VOLUME,
                        LABELS.WALL,
                        LABELS.NET_AREA,
                        LABELS.NET_LENGTH,
                        LABELS.NET_VOLUME,
                        LABELS.NET_WALL,
                        LABELS.RADIUS_X,
                        LABELS.RADIUS_Y,
                        LABELS.DIAMETER_X,
                        LABELS.DIAMETER_Y,
                    ],
                };
            case ANNOT_TYPES.FREE_HAND:
            case ANNOT_TYPES.FREE_HAND2:
            case ANNOT_TYPES.FREE_HAND3:
                return {
                    centralLabels: [
                        LABELS.NR_TAG,
                        LABELS.NAME,
                        LABELS.VARIABLES,
                        LABELS.AREA,
                        LABELS.LENGTH,
                        LABELS.VOLUME,
                        LABELS.WALL,
                        LABELS.NET_AREA,
                        LABELS.NET_LENGTH,
                        LABELS.NET_VOLUME,
                        LABELS.NET_WALL,
                        LABELS.OUTER_DIM_X,
                        LABELS.OUTER_DIM_Y,
                    ],
                };
            case ANNOT_TYPES.X_SCALE:
            case ANNOT_TYPES.Y_SCALE:
                return {
                    sideLabels: [LABELS.NAME, LABELS.LENGTHS],
                };
            default:
                return null;
        }
    },

    reloadWebViewer() {
        this.WebViewer.annotManager.drawAnnotations(this.WebViewer.getCurrentPageNumber());
    },
});
