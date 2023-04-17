import React from "react";
import { createStore } from "reflux";
import axios from "axios";
import Immutable from "immutable";
import { isEmpty } from "lodash";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AnnotationStore, AuthenticationStore, NodeSocketStore, ProjectsStore } from ".";
import { MAX_VOLUME_VALUE, DIVIDER_CONST_M1, DIVIDER_CONST_M2, DIVIDER_CONST_M3 } from "../utils/IfcStoreConstants";
import { ANNOTATION_ACTION_NAME, GROUP_NAME } from "constants/NodeActionsConstants";
import GeometricCalculation from "utils/GeometricCalculation";
import TreeStoreV2 from "./TreeStoreV2";
import ObjectsStore from "./ObjectsStore";

export default createStore({
    listenables: [],
    init() {
        this.selectedObject = {};
        this.modelStructureData = {};
        this.modelStructureTree = {};
        this.selectedKeyFromTree = [];
        this.isLinkActive = false;
        this.currentActions = {};
        this.activeTool = 0;
        this.ifcValueInheritance = undefined;
    },

    initValueInheritance() {
        const sessionValues = JSON.parse(sessionStorage.getItem("inheritance"));

        this.ifcValueInheritance = sessionValues?.["3DModel"] ? sessionValues["3DModel"] : { number: "000", color: "#47ECD5" };
    },

    getActiveTool() {
        return this.activeTool;
    },
    setActiveTool(value) {
        return (this.activeTool = value);
    },
    onChangeActiveTool() {
        this.trigger("changeActiveTool");
    },
    onResetView() {
        this.trigger("resetView");
    },

    changeInheritance(props) {
        this.ifcValueInheritance = Object.assign({}, this.ifcValueInheritance, props);
        sessionStorage.setItem(
            "inheritance",
            JSON.stringify(Object.assign({}, JSON.parse(sessionStorage.getItem("inheritance")), { "3DModel": this.ifcValueInheritance }))
        );
    },

    setActions(actions) {
        this.currentActions = actions;
    },
    getActions() {
        return this.currentActions;
    },

    setSelectedObject(obj) {
        this.selectedObject = obj;
    },
    getSelectedUuid() {
        if (!isEmpty(this.selectedObject)) return this.selectedObject.key;
        return;
    },
    setSelectedObjectFromTree(key, data, fileId) {
        if (fileId === AnnotationStore.getActiveFileId() || !fileId) {
            this.selectedKeyFromTree = key;
            this.selectedObject = data?.node;
        } else {
            this.selectedKeyFromTree = null;
            this.selectedObject = null;
        }
        this.trigger("updateIfcTree");
    },
    getSelectedKeys() {
        return this.selectedKeyFromTree;
    },
    setLinkState(isActive) {
        this.isLinkActive = isActive;
    },
    getLinkState() {
        return this.isLinkActive;
    },
    getModelStructureTree() {
        return this.modelStructureTree;
    },
    canLinkObejct() {
        const annotationTreeData = AnnotationStore.getAnnotations().toJS();
        const selectedAnnotation = annotationTreeData.find(
            (item) => item.type !== "group" && item.xfdf.uuid === this.selectedObject.key && item.geoFile.id === AnnotationStore.getActiveFileId()
        );
        return !selectedAnnotation;
    },
    async linkNormalisedObject() {
        const measureData = await this.getMeasureData(this.selectedObject.id);
        const measureDataInMeters = this.getMeasureDataInMeters(measureData);
        const sholudRecalculateValues = measureData.volume >= MAX_VOLUME_VALUE;
        const area = this.getSum(measureData.sides);
        const netVolume = sholudRecalculateValues ? this.getValueInMeters(measureData.volume, DIVIDER_CONST_M3) : measureData.volume;
        const xfdf = JSON.stringify({
            ...measureDataInMeters,
            uuid: this.selectedObject.id,
            area,
            netArea: area,
            netVolume,
            status: "notStarted",
            readOnly: false,
            color: this.ifcValueInheritance.color,
        });
        this.onCreateIfcAnnotationHandler(this.selectedObject, xfdf);
        TreeStoreV2.clearSelectedAnnotations();
    },
    async linkObject() {
        const xfdf = JSON.stringify({
            uuid: this.selectedObject.id,
            status: "notStarted",
            color: this.ifcValueInheritance.color,
            readOnly: false,
        });
        this.onCreateIfcAnnotationHandler(this.selectedObject, xfdf);
        TreeStoreV2.clearSelectedAnnotations();
    },
    onCreateIfcAnnotationHandler(annot, xfdf) {
        try {
            const parentId = AnnotationStore.getActiveParentId();
            const number = this.getAnnotationTagNumber();

            AnnotationStore.updateAnnotationNumberByProjectId("3DModel", number);
            this.changeInheritance({ number });

            const createIfcAnnotRequest = {
                annotationId: AnnotationStore.generateUUID(),
                geoEstimateId: AnnotationStore.getActiveEstimate().get("id"),
                fileId: Number(AnnotationStore.getActiveFileId()),
                height: "2.5",
                layerId: null,
                parentId: parentId === -1 ? null : parentId.toString(),
                name: annot.title,
                number,
                quantity: 1,
                type: "3DModel",
                xfdf,
                indexPosition: null,
            };
            NodeSocketStore.onSendMessage(GROUP_NAME.GEO_ANNOTATION, { action: ANNOTATION_ACTION_NAME.CREATE, annotations: [createIfcAnnotRequest] });
        } catch (error) {
            console.log("Error: " + error);
        }
    },
    async getMeasureData(id) {
        let data = {};
        await this.getActions().calculateElementMeasures(id, (event) => {
            data = event;
        });
        return data;
    },
    async fetchIfcModelStructureData(filePath) {
        await axios
            .get(filePath)
            .then((res) => {
                this.modelStructureData = res.data;
                this.buildModelStructureTree();
            })
            .catch((err) => console.log(err));
    },
    buildModelStructureTree() {
        const rootID = AnnotationStore.generateUUID();
        let newTree = [
            {
                title: this.modelStructureData.object.uuid,
                parentId: null,
                id: rootID,
                key: rootID,
                children: this.modelStructureData.object.userData.types.map((type) => {
                    const id = AnnotationStore.generateUUID();
                    return {
                        title: type,
                        parentId: rootID,
                        id,
                        key: id,
                        children: [],
                    };
                }),
            },
        ];
        newTree[0].children.forEach((category) => {
            const filteredChildren = this.modelStructureData.object.children.filter((child) => child.userData.type === category.title);
            category.children = filteredChildren.map((child) => ({
                title: category.title,
                parentId: category.id,
                id: child.uuid,
                key: child.uuid,
                icon: <FontAwesomeIcon icon={["fal", "cube"]} />,
                isLeaf: true,
            }));
        });
        this.modelStructureTree = newTree;
        this.trigger("modelStructureTreeBuilded");
    },
    addCreatedIfcAnnotation(annot, userId) {
        if (userId === AuthenticationStore.getUserId()) {
            ObjectsStore.selectAnnotation(annot);
        }
        this.trigger("ifcAnnotationInserted");
    },
    onUpdateIfcAnnotation(newIfcAnnotPropertiesInfo) {
        this.updateIfcAnnotationHandler([newIfcAnnotPropertiesInfo]);
    },
    onUpdateIfcAnnotations({ ids, key, projectId, value }) {
        const annotArr = ids.map((id) => ({ id, projectId, key, value }));
        this.updateIfcAnnotationHandler(annotArr);
    },
    changeIfcStyles(property, value, annotList) {
        const ids = annotList.map((annot) => annot.get("id"));

        NodeSocketStore.onSendMessage(GROUP_NAME.GEO_ANNOTATION, {
            action: ANNOTATION_ACTION_NAME.UPDATE,
            ids,
            parameter: property,
            value: value,
        });
    },
    updateIfcAnnotationHandler(updatedIfcAnnotArray) {
        const updatedAnnotationsList = AnnotationStore.getAnnotations().map((annot) => {
            const newPropertiesForAnnot = updatedIfcAnnotArray.find((newAnnotData) => annot.get("id") === newAnnotData.id);
            if (newPropertiesForAnnot) {
                const { key, value } = newPropertiesForAnnot;
                let updatedAnnot = {};
                switch (key) {
                    case "parentId":
                        updatedAnnot = annot.setIn([key], value === "" ? undefined : value);
                        break;
                    case "name":
                        updatedAnnot = annot.setIn([key], value);
                        break;
                    case "number":
                        AnnotationStore.updateAnnotationNumberByProjectId("3DModel", value);
                        updatedAnnot = annot.setIn([key], value);
                        break;
                    case "readOnly":
                    case "netArea":
                    case "status":
                    case "netVolume":
                    case "color":
                        updatedAnnot = annot.setIn(["xfdf", key], value);
                        break;
                    default:
                        return annot;
                }
                AnnotationStore.exchangeSelectedIfSelected(updatedAnnot);
                const activeAnnotation = AnnotationStore.getActiveAnnotation();
                // if (activeAnnotation && activeAnnotation.get("id") === updatedAnnot.get("id")) {
                //     AnnotationStore.onSetActiveParentId(updatedAnnot.get("parentId"));
                //     AnnotationStore.setActiveAnnotation(updatedAnnot);
                // }
                return updatedAnnot;
            }
            return annot;
        });
        //AnnotationStore.setAnnotations(updatedAnnotationsList);
        // CalculationStore.calculateValues();
        this.trigger("ifcAnnotationsUpdated");
    },
    // UTILS ------------------------------------------------------
    getSum(sides) {
        return Object.entries(sides).reduce((acc, [key, { area }]) => acc + area, 0);
    },
    getMeasureDataInMeters(measureData) {
        if (measureData.volume <= MAX_VOLUME_VALUE) return measureData;

        measureData.volume = this.getValueInMeters(measureData.volume, DIVIDER_CONST_M3);
        Object.entries(measureData.edges).forEach(([key, edge]) => {
            edge.length = this.getValueInMeters(edge.length, DIVIDER_CONST_M1);
        });
        Object.entries(measureData.sides).forEach(([key, side]) => {
            side.area = this.getValueInMeters(side.area, DIVIDER_CONST_M2);
            side.circumference = this.getValueInMeters(side.circumference, DIVIDER_CONST_M1);
        });
        return measureData;
    },
    getValueInMeters(value, divider) {
        return value / divider;
    },
    getAnnotationTagNumber() {
        const initValue = JSON.parse(localStorage.getItem("annotationNumberByProject"));
        let value =
            initValue && initValue[ProjectsStore.getActiveProjectId()] && initValue[ProjectsStore.getActiveProjectId()]["3DModel"]
                ? initValue[ProjectsStore.getActiveProjectId()]["3DModel"]
                : "000";

        if (value) {
            const calculator = new GeometricCalculation();
            value = calculator.getNextNumberString(value);
        }
        return value;
    },
    parseIfcAnnotation({ annotationId, geoEstimateId, fileId, height, id, name, number, parentId, quantity, type, xfdf }) {
        const parsedAnnot = {
            annotationId,
            geoEstimate: { id: geoEstimateId },
            geoFile: { id: fileId, pages: 0 },
            height,
            id,
            name,
            number,
            parentId: parentId ? parentId : undefined,
            quantity,
            type,
            xfdf: JSON.parse(xfdf),
        };
        return Immutable.fromJS(parsedAnnot);
    },
});
