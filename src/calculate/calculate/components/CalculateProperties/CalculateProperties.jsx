import "./calculate-properties.less";
import { ANNOT_TYPES, ELLIPSE, FREE_HAND, POLYGON, POLYLINE, REDUCTION } from "../../../../constants";
import { AnnotationStore, AuthenticationStore, IfcStore, ObjectsStore } from "../../../../stores";
import { Button, Collapse, Empty } from "antd";
import { IFC_PANEL_KEYS, PDF_PANEL_KEYS, areAnnotsLocked, getSelectedAnnotations, isScaleSelected, onChangeExpandIcon } from "./CalculateProperties.utils";
import { SetAnglesModal, SetTilesModal, WindowColorPicker } from "./components";
import { Labels, Edit, Workflow, Scale, StylesBox, CalculationTable } from "./panes";
import _, { first, get, isEqual, isNil, isNumber, map, uniqWith } from "lodash";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback, Modal } from "../../../../components";
import Immutable from "immutable";
import { default as React } from "react";
import { handleFolderChanged } from "calculate/calculate-tree/CalculateTree.utils";
import i18n from "./../../../../i18nextInitialized";
import numeral from "numeral";
import { withTranslation } from "react-i18next";
import ConfirmationModal from "../ConfirmationModal";

const { Panel } = Collapse;
class CalculateProperties extends React.PureComponent {
    constructor() {
        super();
        numeral.locale(i18n.language);
        this.formulaVariableMapping = {
            NA: "ESTIMATE.ANNOTATION_VALUES.NET_AREA",
            NL: "NetLength",
            NVO: "NetVolume",
            NV: "NetWall",
        };
    }

    componentDidMount() {
        this.setSelectedKeys();
        this.unsubscribeAnnotaiotnStore = AnnotationStore.listen(this.annotationStoreUpdated);
        this.unsubscribeIfcStore = IfcStore.listen(this.ifcStoreUpdated);
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.selectedAnnotations.length < 1 && !isScaleSelected && this.state.isWindowColorPickerVisible)
            this.onChangeWindowColorPickerVisible(false);
        if (prevProps.fileType !== this.props.fileType) this.setSelectedKeys();
    }

    componentWillUnmount() {
        this.unsubscribeAnnotaiotnStore();
        this.unsubscribeIfcStore();
        if (this.state.isWindowColorPickerVisible) this.onChangeWindowColorPickerVisible(false);
    }

    state = {
        selectedAnnotations: [],
        mainFoldersList: [],
        areaChecked: false,
        lengthChecked: false,
        volumeChecked: false,
        wallChecked: false,
        tilesSelection: "netArea",
        activePanelKeys: [],
        tilesDialog: false,
        anglesDialog: false,
        isWindowColorPickerVisible: false,
        windowColorPickerData: { annots: [], value: undefined, key: undefined },
        isConfirmationModalVisible: false,
        confirmationModalData: { annots: [], value: undefined, key: undefined, additional: undefined },
        showReductionIncreaseConfirmation: false,
        reductionsIncreaseQuantity: {
            data: [],
            key: "",
            value: "",
        },
    };

    annotationStoreUpdated = (message) => {
        switch (message) {
            case "showTiles":
                if (!this.state.anglesDialog && this.shouldTilesAnglesDisplay()) this.openTilesDialog();
                break;
            case "showAngles":
                if (!this.state.tilesDialog && this.shouldTilesAnglesDisplay()) this.openAnglesDialog();
                break;
            case "folderInserted":
            case "fileChanged":
            case "EstimateInitialized":
            case "AnnotationUpdated":
            case "AnnotationDeleted":
            case "annotationsInserted":
            case "AnnotationAdded":
            case "annotationSelectedFromGui":
            case "annotationSelected":
            case "annotationDeSelectedFromGui":
                const { selectionList, mainFoldersList } = ObjectsStore.getSelectionList();
                this.setState({ selectedAnnotations: selectionList, mainFoldersList });
                if (this.state.isWindowColorPickerVisible) this.onChangeWindowColorPickerVisible(false);
                break;
            case "scaleToolChange":
                this.setSelectedKeys();
                break;
            default:
                break;
        }
    };

    ifcStoreUpdated = (message) => {
        switch (message) {
            case "ifcAnnotationsUpdated":
            case "ifcAnnotationInserted":
                const { selectionList, mainFoldersList } = ObjectsStore.getSelectionList();
                this.setState({ selectedAnnotations: selectionList, mainFoldersList });
                break;
            default:
                break;
        }
    };

    shouldTilesAnglesDisplay() {
        const allowedTypes = [POLYGON, ELLIPSE, FREE_HAND, POLYLINE, REDUCTION];
        if (this.state.selectedAnnotations.length === 0) return false;
        return this.state.selectedAnnotations.every((annot) => allowedTypes.includes(annot.type));
    }

    setSelectedKeys = () => {
        const isIfcFileType = this.props.fileType === "ifc";
        const ifcActivePanelKeys = localStorage.getItem("activeIfcPanelKeys");
        const pdfActivePanelKeys = localStorage.getItem("activePdfPanelKeys");

        if (isIfcFileType && ifcActivePanelKeys === null) {
            this.setState({
                activePanelKeys: IFC_PANEL_KEYS,
            });
            localStorage.setItem("activeIfcPanelKeys", JSON.stringify(IFC_PANEL_KEYS));
            return;
        }
        if (!isIfcFileType && pdfActivePanelKeys === null) {
            this.setState({
                activePanelKeys: PDF_PANEL_KEYS,
            });
            localStorage.setItem("activePdfPanelKeys", JSON.stringify(PDF_PANEL_KEYS));
            return;
        }
        if (isNil(isIfcFileType)) return;
        this.setState({
            activePanelKeys: JSON.parse(localStorage.getItem(isIfcFileType ? "activeIfcPanelKeys" : "activePdfPanelKeys")),
        });
    };

    openTilesDialog = () => {
        this.setState({
            tilesDialog: true,
        });
        this.onReset();
    };

    openAnglesDialog = () => {
        this.setState({
            anglesDialog: true,
        });
        this.onReset();
    };

    closeTilesDialog = () => {
        this.setState({
            tilesDialog: false,
        });
        this.onReset();
    };

    closeAnglesDialog = () => {
        this.setState({
            anglesDialog: false,
        });
        this.cleanAnglesSelection();
    };

    anglesSelection = (e) => {
        this.setState({
            [e.target.name]: e.target.checked,
        });
    };

    cleanAnglesSelection = () => {
        this.setState({
            areaChecked: false,
            lengthChecked: false,
            volumeChecked: false,
            wallChecked: false,
        });
    };

    translateImperial = (value) => {
        return isNumber(numeral(Number(value)).value()) ? numeral(Number(value)).value() : null;
    };

    changeTilesSelection = (tilesSelection) => this.setState({ tilesSelection });

    saveTiles = (values, closeDialog) => {
        const areaTileX = this.translateImperial(values.areaTileX);
        const areaTileY = this.translateImperial(values.areaTileY);
        const areaJointX = this.translateImperial(values.areaJointX);
        const areaJointY = this.translateImperial(values.areaJointY);
        const areaJointDepth = this.translateImperial(values.areaJointDepth);
        const wallTileX = this.translateImperial(values.wallTileX);
        const wallTileY = this.translateImperial(values.wallTileY);
        const wallJointX = this.translateImperial(values.wallJointX);
        const wallJointY = this.translateImperial(values.wallJointY);
        const wallJointDepth = this.translateImperial(values.wallJointDepth);

        const parser = new DOMParser();
        const oSerializer = new XMLSerializer();

        if (
            (!isNil(values.areaTileX) && !isNil(values.areaTileY) && !isNil(values.areaJointX) && !isNil(values.areaJointY) && !isNil(values.areaJointDepth)) ||
            (!isNil(values.wallTileX) && !isNil(values.wallTileY) && !isNil(values.wallJointX) && !isNil(values.wallJointY) && !isNil(values.wallJointDepth))
        ) {
            let annotationsToUpdate = new Immutable.List();

            getSelectedAnnotations(this.state.selectedAnnotations, false, false).forEach((annot) => {
                switch (annot.type) {
                    case POLYGON:
                    case FREE_HAND:
                    case REDUCTION:
                    case POLYLINE:
                    case ELLIPSE:
                        const xfdfElements = parser.parseFromString(annot.xfdf, "text/xml");
                        const annotElement = xfdfElements.querySelector("annots").firstElementChild;

                        if (annotElement.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.TILES_X")) {
                            annotElement.removeAttribute("ESTIMATE.ANNOTATION_PROPERTIES.TILES_X");
                            annotElement.removeAttribute("ESTIMATE.ANNOTATION_PROPERTIES.TILES_Y");
                            annotElement.removeAttribute("ESTIMATE.ANNOTATION_PROPERTIES.JOINT_X");
                            annotElement.removeAttribute("ESTIMATE.ANNOTATION_PROPERTIES.JOINT_Y");
                            annotElement.removeAttribute("ESTIMATE.ANNOTATION_PROPERTIES.JOINT_DEPTH");
                        }

                        annotElement.setAttribute("ESTIMATE.ANNOTATION_PROPERTIES.AREA_TILES_X", areaTileX);
                        annotElement.setAttribute("ESTIMATE.ANNOTATION_PROPERTIES.AREA_TILES_Y", areaTileY);
                        annotElement.setAttribute("ESTIMATE.ANNOTATION_PROPERTIES.AREA_JOINT_X", areaJointX);
                        annotElement.setAttribute("ESTIMATE.ANNOTATION_PROPERTIES.AREA_JOINT_Y", areaJointY);
                        annotElement.setAttribute("ESTIMATE.ANNOTATION_PROPERTIES.AREA_JOINT_DEPTH", areaJointDepth);

                        annotElement.setAttribute("ESTIMATE.ANNOTATION_PROPERTIES.WALL_TILES_X", wallTileX);
                        annotElement.setAttribute("ESTIMATE.ANNOTATION_PROPERTIES.WALL_TILES_Y", wallTileY);
                        annotElement.setAttribute("ESTIMATE.ANNOTATION_PROPERTIES.WALL_JOINT_X", wallJointX);
                        annotElement.setAttribute("ESTIMATE.ANNOTATION_PROPERTIES.WALL_JOINT_Y", wallJointY);
                        annotElement.setAttribute("ESTIMATE.ANNOTATION_PROPERTIES.WALL_JOINT_DEPTH", wallJointDepth);

                        annot.xfdf = oSerializer.serializeToString(xfdfElements);
                        annotationsToUpdate = annotationsToUpdate.push(annot);
                        break;
                    default:
                        break;
                }
            });
            if (annotationsToUpdate.size > 0) {
                AnnotationStore.onRequestAnnotationUpdateArray(annotationsToUpdate);
                if (closeDialog) this.closeTilesDialog();
            }
        }
    };

    validateAngles = () => {
        const parsedAngle = this.translateImperial(this.state.angle);
        return !(parsedAngle && (this.state.angleNetArea || this.state.angleNetVolume || this.state.angleNetLength || this.state.angleNetWall));
    };

    saveAngles = (values) => {
        if (this.validateAngles()) {
            const annotationsToUpdate = Immutable.fromJS(getSelectedAnnotations(this.state.selectedAnnotations, false, false));
            const parsedAngle = this.translateImperial(values);
            const angleFormula = "/cos(" + parsedAngle + ")";
            let formulaVariables = new Immutable.List();

            if (this.state.areaChecked) formulaVariables = formulaVariables.push("NA");
            if (this.state.volumeChecked) formulaVariables = formulaVariables.push("NVO");
            if (this.state.lengthChecked) formulaVariables = formulaVariables.push("NL");
            if (this.state.wallChecked) formulaVariables = formulaVariables.push("NV");

            if (annotationsToUpdate.size > 0) AnnotationStore.changeFormula(annotationsToUpdate, angleFormula, formulaVariables);
            this.closeAnglesDialog();
        }
    };

    onReset = () => {
        this.setState({
            tilesX: "",
            tilesY: "",
            jointX: "",
            jointY: "",
            jointDepth: "",
        });
    };

    setActiveCollapseKeys = (key) => {
        const isIfcFileType = this.props.fileType === "ifc";
        localStorage.setItem(isIfcFileType ? "activeIfcPanelKeys" : "activePdfPanelKeys", JSON.stringify(key));
        this.setState({
            activePanelKeys: key,
        });
    };

    getTiles = () => {
        const parser = new DOMParser();

        const selectedAnnotations = this.state.selectedAnnotations.length > 0 ? this.state.selectedAnnotations : [];
        const tilesValues = uniqWith(
            map(selectedAnnotations, (annotation) => {
                if (annotation.type !== "group" && annotation.type !== "3DModel") {
                    const xfdfElements = parser.parseFromString(get(annotation, "xfdf") || get(annotation, "xdf"), "text/xml");
                    const annotElement = xfdfElements.querySelector("annots").firstElementChild;
                    if (annotElement.getAttribute("readOnly") !== "true") {
                        return {
                            areaTileX:
                                annotElement.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.AREA_TILES_X") ||
                                annotElement.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.TILES_X"),
                            areaTileY:
                                annotElement.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.AREA_TILES_Y") ||
                                annotElement.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.TILES_Y"),
                            areaJointX:
                                annotElement.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.AREA_JOINT_X") ||
                                annotElement.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.JOINT_X"),
                            areaJointY:
                                annotElement.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.AREA_JOINT_Y") ||
                                annotElement.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.JOINT_Y"),
                            areaJointDepth:
                                annotElement.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.AREA_JOINT_DEPTH") ||
                                annotElement.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.JOINT_DEPTH"),
                            wallTileX: annotElement.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.WALL_TILES_X"),
                            wallTileY: annotElement.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.WALL_TILES_Y"),
                            wallJointX: annotElement.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.WALL_JOINT_X"),
                            wallJointY: annotElement.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.WALL_JOINT_Y"),
                            wallJointDepth: annotElement.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.WALL_JOINT_DEPTH"),
                        };
                    }
                }
            }),
            isEqual
        );

        if (tilesValues.length === 1) return first(tilesValues);
        else return {};
    };

    onFolderChanged = (value) => {
        handleFolderChanged({
            key: value,
            selectedAnnotations: Immutable.fromJS(this.state.mainFoldersList.length > 0 ? this.state.mainFoldersList : this.state.selectedAnnotations),
            projectId: Number(this.props.match.params.projectId),
            onMovePreventEditingAnnots: this.props.onMovePreventEditingAnnots,
            onChange: this.onChangeValues,
        });
    };

    onChangeWindowColorPickerVisible = (isVisible, annots = [], value = undefined, key = undefined) => {
        this.setState({ isWindowColorPickerVisible: isVisible, windowColorPickerData: { annots, value, key } });
    };

    onCloseConfirmationModalVisible = () => {
        this.setState({
            isConfirmationModalVisible: false,
            confirmationModalData: { annots: [], value: undefined, key: undefined, additional: undefined },
        });
    };

    onAcceptConfirmationModalVisible = () => {
        const { annots, value, key, additional } = this.state.confirmationModalData;
        this.onChangeValues(annots, value, key, additional, true);
        this.onCloseConfirmationModalVisible();
    };

    onOpenInreaseQuantity = () => {
        this.setState({ showReductionIncreaseConfirmation: true });
    };

    onInreaseQuantity = () => {
        // Update Quantity
        this.setState({ showReductionIncreaseConfirmation: false });
        const reductionsIncreaseQuantity = this.state.reductionsIncreaseQuantity;
        this.onChangeValues(reductionsIncreaseQuantity.data, reductionsIncreaseQuantity.value, reductionsIncreaseQuantity.key);
    };

    onCancelInreaseQuantity = () => {
        this.setState({ showReductionIncreaseConfirmation: false });
    };

    onChangeValues = (annots, value, key, additional = null, isConfirmationModalAccepted = false) => {
        if (key === "height") value = +value + "";
        // if (annots.length > 1 && !isConfirmationModalAccepted)
        //     this.setState({ isConfirmationModalVisible: true, confirmationModalData: { annots, value, key, additional } });
        // else {
        const filterAreaAnnotation = _.filter(annots, function (annot) {
            return annot?.type === "Polygon" && key === "quantity";
        });
        if (filterAreaAnnotation.length > 0) {
            const newReductionArr = [];
            for (const annot of filterAreaAnnotation) {
                const annotationId = annot.annotationId;
                const reductionsData = AnnotationStore.getReductionByParentAnnotationId(annotationId);
                for (const reduction of reductionsData) {
                    newReductionArr.push(reduction.toJS());
                }
            }
            if (newReductionArr.length > 0) {
                this.onOpenInreaseQuantity();
                this.setState({
                    reductionsIncreaseQuantity: {
                        data: newReductionArr,
                        key: key,
                        value: value,
                    },
                });
            }
        } else {
            this.setState({
                reductionsIncreaseQuantity: {
                    data: [],
                    key: "",
                    value: "",
                },
            });
        }

        this.props.onChangeValues(annots, value, key, additional);
        //}
    };

    render() {
        const {
            selectedAnnotations,
            mainFoldersList,
            windowColorPickerData,
            isWindowColorPickerVisible,
            activePanelKeys,
            isConfirmationModalVisible,
            confirmationModalData,
            showReductionIncreaseConfirmation,
            anglesDialog,
            tilesDialog,
            areaChecked,
            lengthChecked,
            volumeChecked,
            wallChecked,
            tilesSelection,
        } = this.state;

        if (selectedAnnotations.length === 0 && !isScaleSelected()) return <Empty description={false} style={{ marginTop: "30vh" }} />;

        const role = AuthenticationStore.getRole();
        const typeMap = ObjectsStore.getTypeMap();
        const isOkButtonDisabled = !this.state.areaChecked && !this.state.lengthChecked && !this.state.volumeChecked && !this.state.wallChecked;
        const selectedAnnots = getSelectedAnnotations(selectedAnnotations);
        const selectedAnnotsWithFolders = getSelectedAnnotations(selectedAnnotations, true, true);
        const isScale = isScaleSelected();
        const isPreventEditing = areAnnotsLocked(selectedAnnots) || !role;
        const shouldValuesAppear =
            !isScale && !selectedAnnots.every((annot) => [ANNOT_TYPES.ARROW, ANNOT_TYPES.STAMP, ANNOT_TYPES.FREE_TEXT].includes(annot.type));
        const splitPosRight = localStorage.getItem("calculateSplitPosRight") ? localStorage.getItem("calculateSplitPosRight") : "280";

        return (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
                {isConfirmationModalVisible && (
                    <ConfirmationModal
                        visible={isConfirmationModalVisible}
                        onOk={this.onAcceptConfirmationModalVisible}
                        onCancel={this.onCloseConfirmationModalVisible}
                        data={confirmationModalData}
                    />
                )}
                {showReductionIncreaseConfirmation && (
                    <Modal
                        visible={showReductionIncreaseConfirmation}
                        title={this.props.t("ESTIMATE.CHANGE_REDUCTION_QUANTITY")}
                        footer={[
                            <Button key="2" onClick={this.onCancelInreaseQuantity}>
                                {this.props.t("GENERAL.CANCEL")}
                            </Button>,
                            <Button key="1" type="primary" onClick={this.onInreaseQuantity}>
                                {this.props.t("GENERAL.OK")}
                            </Button>,
                        ]}
                        width={284}
                        closable={true}
                        onCancel={this.onCancelInreaseQuantity}
                    ></Modal>
                )}
                {isWindowColorPickerVisible && (
                    <WindowColorPicker
                        width={splitPosRight}
                        windowColorPickerData={windowColorPickerData}
                        onChangeWindowColorPickerVisible={this.onChangeWindowColorPickerVisible}
                        onChangeValues={this.onChangeValues}
                    />
                )}
                {anglesDialog && (
                    <SetAnglesModal
                        modalVisible={anglesDialog}
                        cancelModal={this.closeAnglesDialog}
                        inputLabel={this.props.t("ESTIMATE.ANGLE")}
                        onCheckboxChecked={this.anglesSelection}
                        onSubmit={this.saveAngles}
                        okButtonDisabled={isOkButtonDisabled}
                        checkboxStatuses={{
                            areaChecked: areaChecked,
                            lengthChecked: lengthChecked,
                            volumeChecked: volumeChecked,
                            wallChecked: wallChecked,
                        }}
                    />
                )}
                {tilesDialog && (
                    <SetTilesModal
                        modalVisible={tilesDialog}
                        cancelModal={this.closeTilesDialog}
                        onSubmit={this.saveTiles}
                        netSelection={typeMap["Polyline"] ? "netWall" : tilesSelection}
                        onSelectionChange={this.changeTilesSelection}
                        annotationsTiles={this.getTiles()}
                        displayArea={!typeMap["Polyline"]}
                    />
                )}

                <Collapse
                    defaultActiveKey={activePanelKeys}
                    onChange={this.setActiveCollapseKeys}
                    expandIcon={onChangeExpandIcon}
                    className="properties-pane"
                    style={{ marginBottom: "40px" }}
                >
                    {isScale && (
                        <Panel header={this.props.t("ESTIMATE.SCALE_LENGTH")} key="length">
                            <Scale selectedAnnotations={selectedAnnots} onChangeValues={this.onChangeValues} isPreventEditing={isPreventEditing} />
                        </Panel>
                    )}

                    <Panel header={this.props.t("GENERAL.EDIT")} key="edit">
                        <Edit
                            selectedAnnotations={selectedAnnotsWithFolders}
                            mainFoldersList={mainFoldersList}
                            onChangeValues={this.onChangeValues}
                            onFolderChanged={this.onFolderChanged}
                            isPreventEditing={isPreventEditing}
                        />
                    </Panel>

                    {!isScale && (
                        <Panel header={this.props.t("GENERAL.WORKFLOW")} key="workflow">
                            <Workflow selectedAnnotations={selectedAnnots} onChangeValues={this.onChangeValues} isPreventEditing={isPreventEditing} />
                        </Panel>
                    )}

                    <StylesBox
                        activePanelKeys={activePanelKeys}
                        setActiveCollapseKeys={this.setActiveCollapseKeys}
                        selectedAnnotations={selectedAnnots}
                        onChangeValues={this.onChangeValues}
                        onChangeWindowColorPickerVisible={this.onChangeWindowColorPickerVisible}
                        openTilesDialog={this.openTilesDialog}
                        openAnglesDialog={this.openAnglesDialog}
                        isPreventEditing={isPreventEditing}
                    />

                    <Labels
                        activePanelKeys={activePanelKeys}
                        setActiveCollapseKeys={this.setActiveCollapseKeys}
                        selectedAnnotations={selectedAnnots}
                        onChangeValues={this.onChangeValues}
                        onChangeWindowColorPickerVisible={this.onChangeWindowColorPickerVisible}
                        isPreventEditing={isPreventEditing}
                    />

                    {shouldValuesAppear && (
                        <Panel header={this.props.t("ESTIMATE.VALUES")} key="values">
                            <CalculationTable
                                selectedAnnotations={selectedAnnots}
                                onChangeValues={this.onChangeValues}
                                splitPosRight={splitPosRight}
                                isPreventEditing={isPreventEditing}
                            />
                        </Panel>
                    )}
                </Collapse>
            </ErrorBoundary>
        );
    }
}

export default withTranslation()(CalculateProperties);
