import _ from "lodash";
import { createStore } from "reflux";
import { ANNOT_TYPES } from "../constants/AnnotationConstants";
import Immutable from "immutable";
import AnnotationStore from "./AnnotationStore";
import FileStore from "./FileStore";
import ValuesCalculation from "utils/ValuesCalculation";
import CalculationStore from "./CalculationStore";
import TreeStoreV2 from "./TreeStoreV2";

export default createStore({
    listenables: [],
    //parsowanie i values dla nowych annotek
    init() {
        this.estimateObjectsHashMap = {};
        this.selectionState = {
            selectedAnnotations: {},
            mainFolders: {},
            expandedKeys: {},
            selectedScales: {},
        };
        this.typeMap = {
            nrSelected: 0,
            [ANNOT_TYPES.IFC_MODEL]: false,
            [ANNOT_TYPES.ARROW]: false,
            [ANNOT_TYPES.ELLIPSE]: false,
            [ANNOT_TYPES.FREE_HAND]: false,
            [ANNOT_TYPES.FREE_TEXT]: false,
            [ANNOT_TYPES.POINT]: false,
            [ANNOT_TYPES.POLYGON]: false,
            [ANNOT_TYPES.POLYLINE]: false,
            [ANNOT_TYPES.REDUCTION]: false,
            [ANNOT_TYPES.STAMP]: false,
            [ANNOT_TYPES.GROUP]: false,
            [ANNOT_TYPES.X_SCALE]: false,
            [ANNOT_TYPES.Y_SCALE]: false,
        };
        this.rowsHashMap = {};
        this.rowsAutoComplete = {
            insertRow: [],
            profession: [],
            phase: [],
            segment: [],
            action: [],
            material: [],
            amount: [],
            pricePerUnit: [],
        };
        this.bundledRows = [];
        this.selectedRows = [];
    },

    getEstimateObjectsHashMap() {
        return this.estimateObjectsHashMap;
    },

    getAllAnnotations(estimateId, fileId) {
        const annotationMap = this.estimateObjectsHashMap[estimateId].objects.annotationsMap;
        if (fileId) return _.values(annotationMap[fileId]);
        return this.getAllObjectsFromMap(annotationMap);
    },

    getAllReductions(estimateId, fileId) {
        const reductionsMap = this.estimateObjectsHashMap[estimateId].objects.reductionsMap;
        if (fileId) return this.getAllObjectsFromMap(reductionsMap[fileId]);
        return _.reduce(
            _.values(reductionsMap),
            (acc, el) => {
                return [...acc, ...this.getAllObjectsFromMap(el)];
            },
            []
        );
    },

    getAllScales(estimateId, fileId) {
        const scalesMap = this.estimateObjectsHashMap[estimateId].objects.scalesMap;
        if (fileId) return this.getAllObjectsFromMap(scalesMap[fileId]);
        return _.reduce(
            _.values(scalesMap),
            (acc, el) => {
                return [...acc, ...this.getAllObjectsFromMap(el)];
            },
            []
        );
    },

    getAllFolders(estimateId) {
        return _.values(this.estimateObjectsHashMap[estimateId].objects.foldersMap);
    },

    getAllObjectsFromMap(hashMap) {
        return _.reduce(
            _.values(hashMap),
            (acc, el) => {
                return [...acc, ..._.values(el)];
            },
            []
        );
    },

    getTypeMap() {
        return this.typeMap;
    },

    createHashMap(estimateArray) {
        _.forEach(estimateArray, (estimateObject) => {
            const { annotations, estimate, scales } = estimateObject;
            const [annotationsList, reductionsList, foldersList] = this.getFoldersAndAnnotations(annotations);
            const objectsMap = this.createObjectsMap(annotationsList, reductionsList, foldersList, scales, estimate);

            this.estimateObjectsHashMap[estimate.id] = { estimateData: { ...estimate }, objects: objectsMap };
        });
        this.createRowsAutoComplete();

        console.log(this.estimateObjectsHashMap);
    },

    getFoldersAndAnnotations(objectsList) {
        let annotationsList = [];
        let foldersList = [];
        let reductionsList = [];

        _.forEach(objectsList, (obj) => {
            const { type } = obj;

            switch (type) {
                case ANNOT_TYPES.GROUP:
                    foldersList.push(obj);
                    break;
                case ANNOT_TYPES.REDUCTION:
                    reductionsList.push(obj);
                    break;
                default:
                    annotationsList.push(obj);
                    break;
            }
        });

        return [annotationsList, reductionsList, foldersList];
    },

    createObjectsMap(annotations, reductions, folders, scales, estimate) {
        const foldersMap = this.createFolderIdMap(folders, estimate);
        const scalesMap = this.createScalesIdMap(scales);
        const reductionsMap = this.createReductionIdMap(reductions, estimate, scalesMap);
        const annotationsMap = this.createAnnotationIdMap(annotations, estimate, scalesMap, reductionsMap);

        return {
            foldersMap,
            annotationsMap,
            reductionsMap,
            scalesMap,
        };
    },

    createFolderIdMap(folders, estimate) {
        const parsedFolders = _.map(folders, (el) => this.parseAnnotation(el, estimate));
        return this.createIdMap(parsedFolders);
    },

    createAnnotationIdMap(annotations, estimate, scales, reductions) {
        let fileIdMap = this.createEmptyFileIdMap(annotations);

        _.forEach(annotations, (el) => {
            const parsedAnnot = this.parseAnnotation(el, estimate);
            const annotValues = this.calculateValues(parsedAnnot, scales, reductions);
            const rowsIdMap = el.rows?.length ? this.createIdMap(el.rows) : {};
            const parsedRows = this.parseRows(rowsIdMap, annotValues);
            this.setRowsHashMap(parsedRows);

            fileIdMap[el.geoFile.id][el.id] = {
                ...annotValues,
                rows: parsedRows,
            };
        });

        return fileIdMap;
    },

    createReductionIdMap(reductions, estimate, scales) {
        let fileIdMapForReductions = this.createEmptyFileIdMap(reductions);

        _.forEach(reductions, (reduction) => {
            const {
                id,
                parentId,
                geoFile: { id: geoFileId },
                rows,
            } = reduction;

            const parsedReduction = this.parseAnnotation(reduction, estimate);
            const reductionValues = this.calculateValues(parsedReduction, scales);
            const rowsIdMap = rows?.length ? this.createIdMap(rows) : {};
            const parsedRows = this.parseRows(rowsIdMap, reductionValues);
            this.setRowsHashMap(parsedRows);

            const annotationData = {
                ...reductionValues,
                rows: parsedRows,
            };
            const reductionsListForParent = fileIdMapForReductions[geoFileId][parentId];
            reductionsListForParent ? (reductionsListForParent[id] = annotationData) : (fileIdMapForReductions[geoFileId][parentId] = { [id]: annotationData });
        });

        return fileIdMapForReductions;
    },

    createScalesIdMap(scales) {
        let fileIdMapForScales = this.createEmptyFileIdMap(scales);

        _.forEach(scales, (scale) => {
            const parsedScale = this.parseScale(scale);
            const scaleObjForFileId = fileIdMapForScales[scale.geoFile.id];
            scaleObjForFileId[scale.page]
                ? (scaleObjForFileId[scale.page][scale.type] = parsedScale)
                : (scaleObjForFileId[scale.page] = { [scale.type]: parsedScale });
        });

        return fileIdMapForScales;
    },

    createIdMap(objectsList) {
        return _.reduce(
            objectsList,
            (acc, el) => {
                const id = el.data ? el.data.id : el.id;
                const objectData = el.data ? el.data : el;
                acc[id] = objectData;
                return acc;
            },
            {}
        );
    },

    createEmptyFileIdMap(objectsList) {
        return _.reduce(
            objectsList,
            (acc, el) => {
                acc[el.geoFile.id] = {};
                return acc;
            },
            {}
        );
    },

    getRowsHashMap() {
        return this.rowsHashMap;
    },

    getRowHashMapById(id) {
        return this.rowsHashMap[id];
    },

    setRowsHashMap(rows) {
        _.assign(this.rowsHashMap, rows);
    },

    updateRowAutoComplete(row, parameter) {
        const value = _.get(row, parameter);
        if (!value) return;

        const option = _.find(_.get(this.rowsAutoComplete, parameter), (o) => o.value === value);
        if (option) option.rowIds.push(row.id);
        else {
            this.rowsAutoComplete[parameter].push({ value, rowIds: [row.id] });
            this.rowsAutoComplete[parameter] = _.sortBy(this.rowsAutoComplete[parameter], ["value"]);
        }
    },

    deleteRowAutoComplete(row, key) {
        this.rowsAutoComplete[key] = _.filter(this.rowsAutoComplete[key], (item) => {
            if (item.value === row[key]) {
                if (item.rowIds.length === 1) return false;
                else {
                    if (key === "insertRow") item.rowIds.shift();
                    else item.rowIds = _.filter(item.rowIds, (rowId) => rowId === row.id);
                    return true;
                }
            } else return true;
        });
    },

    createRowAutoComplete(row) {
        this.updateRowAutoComplete(row, "profession");
        this.updateRowAutoComplete(row, "phase");
        this.updateRowAutoComplete(row, "segment");
        this.updateRowAutoComplete(row, "action");
        this.updateRowAutoComplete(row, "material");
        this.updateRowAutoComplete(row, "pricePerUnit");

        const insertRow = `${CalculationStore.getVisibleStatusValue(row.status)} | ${row?.profession || ""} | ${row?.phase || ""} | ${row?.segment || ""} | ${
            row?.action || ""
        } | ${row?.material || ""} | ${row?.rawAmount || ""} | ${row?.unit || ""} | ${row?.pricePerUnit || ""} | ${row?.unitTime || ""}`;
        this.updateRowAutoComplete({ insertRow }, "insertRow");
    },

    createRowsAutoComplete() {
        const rows = this.rowsHashMap;
        _.forEach(_.values(rows), (row) => this.createRowAutoComplete(row));
    },

    getRowsAutoComplete() {
        return this.rowsAutoComplete;
    },

    bundleRows(row, newRow) {
        if (row.rawAmount !== newRow.rawAmount) row.rawAmount = "";
        row.amount = CalculationStore.performChainAdd(row.amount, newRow.amount);
        row.totalPrice = CalculationStore.performChainAdd(row.totalPrice, newRow.totalPrice);
        row.totalTime = CalculationStore.performTimeChainAdd(row.totalTime, newRow.totalTime);
        if (row.ids?.length) row.ids.push(newRow.id);
        else row.ids = [row.id, newRow.id];

        return row;
    },

    setBundledRows() {
        try {
            const selectedAnnots = _.values(JSON.parse(JSON.stringify(this.selectionState.selectedAnnotations)));
            let selectedRows = [];
            const bundledRows = [];
            this.bundledRows = [];

            if (selectedAnnots.length === 0) return;

            _.forEach(selectedAnnots, (annot) => {
                const rowsArray = _.values(annot.rows);
                selectedRows = _.union(selectedRows, rowsArray);
            });

            _.forEach(selectedRows, (row) => {
                const sameRowId = _.findIndex(
                    bundledRows,
                    (bundledRow) =>
                        bundledRow.status === row.status &&
                        bundledRow.profession === row.profession &&
                        bundledRow.phase === row.phase &&
                        bundledRow.segment === row.segment &&
                        bundledRow.action === row.action &&
                        bundledRow.material === row.material &&
                        bundledRow.unit === row.unit &&
                        bundledRow.pricePerUnit === row.pricePerUnit &&
                        bundledRow.unitTime === row.unitTime
                );

                if (
                    sameRowId > -1 &&
                    !(bundledRows[sameRowId].ids?.length ? _.includes(bundledRows[sameRowId].ids, row.id) : bundledRows[sameRowId].id === row.id)
                )
                    bundledRows[sameRowId] = this.bundleRows(bundledRows[sameRowId], row);
                else bundledRows.push(row);
            });

            this.bundledRows = bundledRows;
        } catch (e) {
            console.log("Error on rows bundling: ", e);
        }
    },

    getBundledRows() {
        return this.bundledRows;
    },

    getSeparateBundledRows(rows) {
        const separateBundledRows = [];
        if (!rows) rows = this.getBundledRows();
        _.forEach(rows, (bundledRow) => {
            if (bundledRow.ids?.length)
                _.forEach(bundledRow.ids, (id) => {
                    separateBundledRows.push(this.rowsHashMap[id]);
                });
            else separateBundledRows.push(bundledRow);
        });
        return separateBundledRows;
    },

    bundlingRows(rows) {
        try {
            if (rows.length === 0) return [];
            const bundledRows = [];

            _.forEach(rows, (row) => {
                const sameRowId = _.findIndex(
                    bundledRows,
                    (bundledRow) =>
                        bundledRow.status === row.status &&
                        bundledRow.profession === row.profession &&
                        bundledRow.phase === row.phase &&
                        bundledRow.segment === row.segment &&
                        bundledRow.action === row.action &&
                        bundledRow.material === row.material &&
                        bundledRow.unit === row.unit &&
                        bundledRow.pricePerUnit === row.pricePerUnit &&
                        bundledRow.unitTime === row.unitTime
                );

                if (
                    sameRowId > -1 &&
                    !(bundledRows[sameRowId].ids?.length ? _.includes(bundledRows[sameRowId].ids, row.id) : bundledRows[sameRowId].id === row.id)
                )
                    bundledRows[sameRowId] = this.bundleRows(bundledRows[sameRowId], row);
                else bundledRows.push(row);
            });

            return bundledRows;
        } catch (error) {
            console.log("Error on rows bundling: ", error);
            return [];
        }
    },

    setSelectedRows(rows) {
        this.selectedRows = rows;
    },

    getSeparateSelectedRows() {
        const separateSelectedRows = [];
        const selectedRows = this.selectedRows;
        _.forEach(selectedRows, (selectedRow) => {
            if (selectedRow.ids?.length)
                _.forEach(selectedRow.ids, (id) => {
                    separateSelectedRows.push(this.rowsHashMap[id]);
                });
            else separateSelectedRows.push(selectedRow);
        });
        return separateSelectedRows;
    },

    clearSelectedRows() {
        this.selectedRows = [];
    },

    //CRUD OPERATIONS

    onObjectCreate(objectData) {
        const { type } = objectData;

        switch (type) {
            case ANNOT_TYPES.GROUP:
                return this.onFolderCreate(objectData);
            case ANNOT_TYPES.REDUCTION:
                return this.onReductionCreate(objectData);
            default:
                return this.onAnnotationCreate(objectData);
        }
    },

    onFolderCreate(folderData) {
        const { geoEstimateId, id, ...rest } = folderData;
        const parsedFolder = {
            ...rest,
            id,
            geoEstimate: { id: geoEstimateId },
        };
        this.estimateObjectsHashMap[geoEstimateId].objects.foldersMap[id] = parsedFolder;

        return parsedFolder;
    },

    onReductionCreate(reductionData) {
        const { id, parentId, fileId, geoEstimateId } = reductionData;
        const estimate = this.estimateObjectsHashMap[geoEstimateId].estimateData;
        const scales = this.estimateObjectsHashMap[geoEstimateId].objects.scalesMap;

        const parsedReduction = this.parseAnnotation(reductionData, estimate);
        const reductionValues = this.calculateValues(parsedReduction, scales);

        const annotationData = {
            ...reductionValues,
            rows: {},
        };

        const reductionsListForFile = this.estimateObjectsHashMap[geoEstimateId].objects.reductionsMap[fileId];
        reductionsListForFile[parentId] ? (reductionsListForFile[parentId][id] = annotationData) : (reductionsListForFile[parentId] = { [id]: annotationData });

        return annotationData;
    },

    onAnnotationCreate(annotation) {
        const { id, fileId, geoEstimateId } = annotation;
        const estimate = this.estimateObjectsHashMap[geoEstimateId].estimateData;
        const scales = this.estimateObjectsHashMap[geoEstimateId].objects.scalesMap;

        const parsedAnnot = this.parseAnnotation(annotation, estimate);
        const annotValues = this.calculateValues(parsedAnnot, scales);

        const annotationData = {
            ...annotValues,
            rows: {},
        };

        const annotsMap = this.estimateObjectsHashMap[geoEstimateId].objects.annotationsMap;
        annotsMap[fileId] ? (annotsMap[fileId][id] = annotationData) : (annotsMap[fileId] = { [id]: annotationData });

        return annotationData;
    },

    onScaleCreate(scale) {
        const { fileId, geoEstimateId, page, type } = scale;
        let scalesObject = this.estimateObjectsHashMap[geoEstimateId].objects.scalesMap;
        const parsedScale = this.parseScale(scale);
        if (scalesObject[fileId]) {
            scalesObject[fileId][page] ? (scalesObject[fileId][page][type] = parsedScale) : (scalesObject[fileId] = { [page]: { [type]: parsedScale } });
        } else {
            scalesObject[fileId] = { [page]: { [type]: parsedScale } };
        }
        this.recalculateValuesAndRowsAfterScaleLenghtUpdate(geoEstimateId, fileId);
        return parsedScale;
    },

    updateAnnotationsAfterPdfTronChange(annotations) {
        const updatedAnnotations = [];

        _.forEach(annotations, (annot) => {
            const { geoEstimateId, annotationId, type } = annot;
            const estimate = this.estimateObjectsHashMap[geoEstimateId].estimateData;
            const scales = this.estimateObjectsHashMap[geoEstimateId].objects.scalesMap;
            const reductions = type === ANNOT_TYPES.POLYGON ? _.map(TreeStoreV2.getAllChildrensForPolygon(annotationId), ({ data }) => data) : [];
            const parsedAnnot = this.parseAnnotation(annot, estimate);
            const valuesAnnot = this.calculateValues(parsedAnnot, scales, reductions);
            this.updateAnnotInHashMap(valuesAnnot);
            updatedAnnotations.push(valuesAnnot);
        });
        return updatedAnnotations;
    },

    updateAnnotations(response) {
        const { annotData, parameter, value, path, updateAction } = response;
        const updatedAnnotations = [];

        _.forEach(annotData, (updatedAnnotData) => {
            const {
                id,
                type,
                parentId,
                geoEstimate: { id: geoEstimateId },
                geoFile: { id: geoFileId },
            } = updatedAnnotData;

            switch (type) {
                case ANNOT_TYPES.IFC_MODEL:
                    const ifcAnnot = this.getAnnotationByPDFTronAnnot({ geoEstimateId, geoFileId, geoAnnotId: id });
                    const updatedIfcAnnot = { ...ifcAnnot, xfdf: JSON.stringify({ ...ifcAnnot.xfdf, [parameter]: value }) };
                    this.updateAnnotInHashMap(updatedIfcAnnot);
                    updatedAnnotations.push(updatedIfcAnnot);
                    break;
                case ANNOT_TYPES.GROUP:
                    const folder = this.getFolderById({ geoEstimateId, id });
                    const updatedFolder = this.updatePdfAnnotation({ annotation: folder, parameter, value, path, updateAction });
                    this.updateAnnotInHashMap(updatedFolder);
                    updatedAnnotations.push(updatedFolder);
                    break;
                case ANNOT_TYPES.REDUCTION:
                    const reduction = this.getReductionByPDFTronAnnot({ geoEstimateId, geoFileId, geoAnnotId: id, geoParentId: parentId });
                    const updatedReduction = this.updatePdfAnnotation({ annotation: reduction, parameter, value, path, updateAction });
                    this.updateAnnotInHashMap(updatedReduction);
                    updatedAnnotations.push(updatedReduction);
                    break;
                default:
                    const annotation = this.getAnnotationByPDFTronAnnot({ geoEstimateId, geoFileId, geoAnnotId: id });
                    const updatedAnnotation = this.updatePdfAnnotation({ annotation, parameter, value, path, updateAction });
                    this.updateAnnotInHashMap(updatedAnnotation);
                    updatedAnnotations.push(updatedAnnotation);
            }
        });

        return updatedAnnotations;
    },

    updatePdfAnnotation({ annotation, parameter, value, path, updateAction }) {
        const geoEstimateId = annotation.geoEstimate.id;
        const estimate = this.estimateObjectsHashMap[geoEstimateId].estimateData;
        const scales = this.estimateObjectsHashMap[geoEstimateId].objects.scalesMap;
        const reductions =
            annotation.type === ANNOT_TYPES.POLYGON ? _.map(TreeStoreV2.getAllChildrensForPolygon(annotation.annotationId), ({ data }) => data) : [];
        const objectParameters = ["name", "number", "type", "parentId", "height", "quantity", "labels"];
        if (_.includes(objectParameters, parameter)) {
            if (parameter === "labels") {
                if (updateAction === "add") annotation[parameter][path].push(value);
                else if (updateAction === "remove") annotation[parameter][path] = annotation[parameter][path].filter((item) => item !== value);
                else _.set(annotation[parameter], path, value);
            } else annotation[parameter] = value;
            const parsedAnnot = this.parseAnnotation(annotation, estimate);
            if (parameter === "height" || parameter === "quantity") {
                return this.calculateValues(parsedAnnot, scales, reductions);
            } else {
                return parsedAnnot;
            }
        } else {
            const parser = new DOMParser();
            const oSerializer = new XMLSerializer();
            const xfdfElements = parser.parseFromString(annotation.xfdf, "text/xml");
            const annotationElement = xfdfElements.querySelector("annots").children[0];
            annotationElement.setAttribute(parameter, value);
            if (parameter === "textContent") annotationElement.querySelector("contents").innerHTML = value;
            const updatedXfdf = oSerializer.serializeToString(xfdfElements);
            const parsedAnnot = this.parseAnnotation({ ...annotation, xfdf: updatedXfdf }, estimate);
            return this.calculateValues(parsedAnnot, scales, reductions);
        }
    },

    updateScale(payload) {
        const { parameters, path, updateAction, estimateId, fileId, type, page } = payload;
        const activeScale = { ...this.getScaleByPDFTronAnnot({ geoEstimateId: estimateId, geoFileId: fileId, annotationType: type, pageNumber: page }) };
        const parsedScale = this.parseScale(activeScale, parameters, path, updateAction);
        this.estimateObjectsHashMap[estimateId].objects.scalesMap[fileId][page][type] = parsedScale;
        if (parameters["length"]) this.recalculateValuesAndRowsAfterScaleLenghtUpdate(estimateId, fileId);
        this.setBundledRows();
        return parsedScale;
    },

    updateScaleFromPdfTron(scale) {
        const { geoEstimateId, fileId, page, type, parameters } = scale;
        const parsedScale = this.parseScale(scale);
        this.estimateObjectsHashMap[geoEstimateId].objects.scalesMap[fileId][page][type] = parsedScale;
        this.recalculateValuesAndRowsAfterScaleLenghtUpdate(geoEstimateId, fileId);
        this.setBundledRows();
        return parsedScale;
    },

    recalculateValuesAndRowsAfterScaleLenghtUpdate(estimateId, fileId) {
        const scales = this.estimateObjectsHashMap[estimateId].objects.scalesMap;
        const allAnnotsForFile = this.getAllAnnotations(estimateId, fileId).filter((annot) => annot.type !== ANNOT_TYPES.GROUP);
        _.forEach(allAnnotsForFile, (annot) => {
            const reductions = annot.type === ANNOT_TYPES.POLYGON ? _.map(TreeStoreV2.getAllChildrensForPolygon(annot.annotationId), ({ data }) => data) : [];
            const valuesAnnot = this.calculateValues(annot, scales, reductions);
            valuesAnnot.rows = this.parseRows(annot.rows, annot);
            this.updateAnnotInHashMap(valuesAnnot);
            this.exchangeSelectedIfSelected(valuesAnnot);
        });
    },

    updateAnnotInHashMap(annot) {
        const {
            id,
            type,
            parentId,
            geoEstimate: { id: geoEstimateId },
            geoFile: { id: geoFileId },
        } = annot;
        switch (type) {
            case ANNOT_TYPES.GROUP:
                this.estimateObjectsHashMap[geoEstimateId].objects.foldersMap[id] = annot;
                break;
            case ANNOT_TYPES.REDUCTION:
                this.estimateObjectsHashMap[geoEstimateId].objects.reductionsMap[geoFileId][parentId][id] = annot;
                break;
            default:
                this.estimateObjectsHashMap[geoEstimateId].objects.annotationsMap[geoFileId][id] = annot;
                break;
        }
    },

    onAnnotationDuplicate(annotations, rows) {
        const createdAnnotations = [];
        _.forEach(annotations, (annot) => {
            const parsedAnnot = this.onAnnotationCreate(annot);
            createdAnnotations.push(parsedAnnot);
        });
        this.onRowsCreate(rows);
        return createdAnnotations;
    },

    onRowsCreate(rows) {
        _.forEach(rows, (row) => {
            let annot;
            if (row.parentId) annot = this.estimateObjectsHashMap[row.estimateId].objects.reductionsMap[row.fileId][row.parentId][row.geoAnnotationId];
            else annot = this.estimateObjectsHashMap[row.estimateId].objects.annotationsMap[row.fileId][row.geoAnnotationId];

            const rowData = {
                [row.id]: {
                    geoAnnotation: { annotationId: row.id, estimateId: row.estimateId, fileId: row.fileId, id: row.geoAnnotationId },
                    id: row.id,
                    annotationRow: row.annotationRow,
                },
            };
            const parsedRow = this.parseRows(rowData, annot);
            annot.rows = { ...annot.rows, ...parsedRow };
            this.setRowsHashMap(parsedRow);

            const currentRow = parsedRow[row.id];
            this.createRowAutoComplete(currentRow);
        });
        this.setBundledRows();
    },

    onRowsUpdate(payload) {
        const { rows, key, value } = payload;
        _.forEach(rows, (row) => {
            let annot;
            if (row.parentId) annot = this.estimateObjectsHashMap[row.estimateId].objects.reductionsMap[row.fileId][row.parentId][row.geoAnnotationId];
            else annot = this.estimateObjectsHashMap[row.estimateId].objects.annotationsMap[row.fileId][row.geoAnnotationId];

            const currentRow = { ...annot.rows[row.id] };
            const newRowData = {
                [row.id]: {
                    geoAnnotation: { annotationId: row.id, estimateId: row.estimateId, fileId: row.fileId, id: row.geoAnnotationId },
                    id: row.id,
                    annotationRow: row.annotationRow,
                },
            };
            const parsedRow = this.parseRows(newRowData, annot);
            annot.rows = { ...annot.rows, ...parsedRow };
            this.setRowsHashMap(parsedRow);

            this.deleteRowAutoComplete(currentRow, key);
            this.updateRowAutoComplete({ [key]: value }, key);

            const currentInsertRow = `${CalculationStore.getVisibleStatusValue(currentRow.status)} | ${currentRow?.profession || ""} | ${
                currentRow?.phase || ""
            } | ${currentRow?.segment || ""} | ${currentRow?.action || ""} | ${currentRow?.material || ""} | ${currentRow?.rawAmount || ""} | ${
                currentRow?.unit || ""
            } | ${currentRow?.pricePerUnit || ""} | ${currentRow?.unitTime || ""}`;
            const newInsertRow = `${CalculationStore.getVisibleStatusValue(parsedRow[row.id].status)} | ${parsedRow[row.id]?.profession || ""} | ${
                parsedRow[row.id]?.phase || ""
            } | ${parsedRow[row.id]?.segment || ""} | ${parsedRow[row.id]?.action || ""} | ${parsedRow[row.id]?.material || ""} | ${
                parsedRow[row.id]?.rawAmount || ""
            } | ${parsedRow[row.id]?.unit || ""} | ${parsedRow[row.id]?.pricePerUnit || ""} | ${parsedRow[row.id]?.unitTime || ""}`;

            this.deleteRowAutoComplete({ ["insertRow"]: currentInsertRow }, "insertRow");
            this.updateRowAutoComplete({ insertRow: newInsertRow }, "insertRow");
        });
        this.setBundledRows();
    },

    onRowsDelete(rows) {
        _.forEach(rows, (row) => {
            const currentRow = this.estimateObjectsHashMap[row.estimateId].objects.annotationsMap[row.fileId][row.geoAnnotationId].rows[row.id];
            this.deleteRowAutoComplete(currentRow, "profession");
            this.deleteRowAutoComplete(currentRow, "phase");
            this.deleteRowAutoComplete(currentRow, "segment");
            this.deleteRowAutoComplete(currentRow, "action");
            this.deleteRowAutoComplete(currentRow, "material");
            this.deleteRowAutoComplete(currentRow, "pricePerUnit");

            const currentInsertRow = `${CalculationStore.getVisibleStatusValue(currentRow.status)} | ${currentRow?.profession || ""} | ${
                currentRow?.phase || ""
            } | ${currentRow?.segment || ""} | ${currentRow?.action || ""} | ${currentRow?.material || ""} | ${currentRow?.rawAmount || ""} | ${
                currentRow?.unit || ""
            } | ${currentRow?.pricePerUnit || ""} | ${currentRow?.unitTime || ""}`;
            this.deleteRowAutoComplete({ ["insertRow"]: currentInsertRow }, "insertRow");

            if (row.parentId)
                delete this.estimateObjectsHashMap[row.estimateId].objects.reductionsMap[row.fileId][row.parentId][row.geoAnnotationId].rows[row.id];
            else delete this.estimateObjectsHashMap[row.estimateId].objects.annotationsMap[row.fileId][row.geoAnnotationId].rows[row.id];
            delete this.rowsHashMap[row.id];
        });
        this.setBundledRows();
    },

    onAnnotationsDelete(deletedAnnots) {
        const activeFileId = AnnotationStore.getActiveFileId();
        const removedAnnotationIds = [];

        _.forEach(deletedAnnots, ({ estimateId, fileId, id, parentId, type, page }) => {
            switch (type) {
                case ANNOT_TYPES.X_SCALE:
                case ANNOT_TYPES.Y_SCALE:
                    _.unset(this.estimateObjectsHashMap[estimateId].objects.scalesMap[fileId][page], type);
                    let scalesState = this.selectionState.selectedScales;
                    scalesState = _.filter(scalesState, (scale) => scale.id === id);
                    break;
                case ANNOT_TYPES.GROUP:
                    _.unset(this.estimateObjectsHashMap[estimateId].objects.foldersMap, id);
                    break;
                case ANNOT_TYPES.REDUCTION:
                    const reductionsList = this.estimateObjectsHashMap[estimateId].objects.reductionsMap[fileId][parentId];
                    const deletedReduction = reductionsList[id];
                    if (deletedReduction.geoFile.id === activeFileId) removedAnnotationIds.push(deletedReduction.annotationId);
                    _.unset(reductionsList, id);
                    break;
                default:
                    const annotsList = this.estimateObjectsHashMap[estimateId].objects.annotationsMap[fileId];
                    const deletedAnnotation = annotsList[id];
                    if (deletedAnnotation.geoFile.id === activeFileId) removedAnnotationIds.push(deletedAnnotation.annotationId);
                    _.unset(annotsList, id);
                    break;
            }
        });

        return removedAnnotationIds;
    },

    deleteAnnotationsAfterFilesDelete(filesId, estimateId) {
        const allAnnots = [];

        _.forEach(filesId, (fileId) => {
            allAnnots = [...allAnnots, ...this.getAllAnnotations(estimateId, fileId), ...this.getAllReductions(estimateId, fileId)];
        });
        const rowsToDelete = _.reduce(
            allAnnots,
            (acc, el) => {
                const rows = _.values(el.rows);
                if (rows.length) acc = [...acc, ...rows];
            },
            []
        );
        this.onRowsDelete(rowsToDelete);

        _.forEach(filesId, (fileId) => {
            delete this.estimateObjectsHashMap[estimateId].objects.annotationsMap[fileId];
        });
        const annotsIdsListToOmit = _.map(allAnnots, (annot) => annot.id);
        const newSelection = _.omit(this.selectionState.selectedAnnotations, annotsIdsListToOmit);
        this.selectionState.selectedAnnotations = newSelection;
        this.updateTypeMap();
    },
    //OTHERS

    parseAnnotation(annot, estimate) {
        const isEstimateLocked = estimate.locked;

        if (annot.type === ANNOT_TYPES.GROUP && !annot.parentId) annot.parentId = undefined;
        else if (annot.type === ANNOT_TYPES.IFC_MODEL) {
            try {
                annot.xfdf = JSON.parse(annot.xfdf);
            } catch (e) {
                annot.xfdf = null;
                console.log("Error with parsing annot: ", e);
            }
            if (annot.geoEstimateId) annot.geoEstimate = { id: annot.geoEstimateId };
            if (annot.fileId) annot.geoFile = { id: annot.fileId };
            if (!annot.quantity) annot.quantity = 1;
            if (!annot.parentId) annot.parentId = undefined;
        } else if (annot.xfdf && annot.type !== ANNOT_TYPES.GROUP) {
            try {
                annot.height = JSON.parse(annot.height);
            } catch (e) {
                annot.height = 0;
                console.log("Error with parsing annot: ", e);
            }
            if (!annot.quantity) annot.quantity = 1;
            if (!annot.parentId) annot.parentId = undefined;
            if (annot.geoEstimateId) annot.geoEstimate = { id: annot.geoEstimateId };
            if (annot.fileId) annot.geoFile = { id: annot.fileId };

            annot.xfdf = this.parseAnnotationAttribute(annot.xfdf, "setInitialValues", annot);
            this.parseTiles(annot);

            if (annot.labels) {
                try {
                    annot.xfdf = this.parseAnnotationAttribute(annot.xfdf, "labels", annot.labels);
                    annot.labels = JSON.parse(annot.labels);
                } catch (e) {
                    annot.xfdf = this.parseAnnotationAttribute(annot.xfdf, "labels", JSON.stringify(annot.labels));
                    annot.labels = annot.labels;
                }
            } else annot.labels = this.getDefaultLabels(annot.type === ANNOT_TYPES.POINT);
            annot.xfdf = this.parseAnnotationAttribute(annot.xfdf, "vertices");

            const {
                Hidden,
                maintainAspectRatio,
                readOnly,
                interiorColor,
                status,
                geometraFlip,
                pageNumber,
                rotation,
                groupedAnnotIds,
                strokeSize,
                color,
                pointSize,
                iconType,
                textContents,
                fontSize,
                textFont,
                strokeColor,
                pattern,
                geometraLineStart,
                geometraLineEnd,
                geometraOpacity,
                geometraBorderOpacity,
                formulaNA,
                formulaNL,
                formulaNVO,
                formulaNV,
            } = this.parseAnnotationAttribute(annot.xfdf, "getInitialValues", annot);

            annot.Hidden = Hidden;
            annot.maintainAspectRatio = maintainAspectRatio;
            annot.readOnly = isEstimateLocked || readOnly;
            if (groupedAnnotIds) annot.groupedAnnotIds = groupedAnnotIds;
            if (strokeSize) annot.strokeSize = strokeSize;
            if (color) annot.color = color;
            if (interiorColor) {
                annot["interior-color"] = interiorColor;
                annot.interiorColor = interiorColor;
            }
            annot.status = status;
            if (geometraFlip) annot.geometraFlip = geometraFlip;
            annot.pageNumber = pageNumber;
            annot.rotation = rotation;
            if (formulaNA || formulaNA === "") annot.formulaNA = formulaNA;
            if (formulaNL || formulaNL === "") annot.formulaNL = formulaNL;
            if (formulaNVO || formulaNVO === "") annot.formulaNVO = formulaNVO;
            if (formulaNV || formulaNV === "") annot.formulaNV = formulaNV;

            if (annot.type === ANNOT_TYPES.POINT) {
                annot.pointSize = pointSize;
                annot.iconType = iconType;
            } else if (annot.type === ANNOT_TYPES.FREE_TEXT || annot.type === ANNOT_TYPES.FREE_TEXT2) {
                annot.strokeColor = strokeColor;
                annot.textContents = textContents;
                annot.fontSize = fontSize;
                annot.textFont = textFont;
            } else if (
                annot.type === ANNOT_TYPES.POLYGON ||
                annot.type === ANNOT_TYPES.REDUCTION ||
                annot.type === ANNOT_TYPES.FREE_HAND ||
                annot.type === ANNOT_TYPES.FREE_HAND2 ||
                annot.type === ANNOT_TYPES.FREE_HAND3
            )
                annot.pattern = pattern;
            else if (annot.type === ANNOT_TYPES.POLYLINE || annot.type === ANNOT_TYPES.X_SCALE || annot.type === ANNOT_TYPES.Y_SCALE) {
                annot.geometraLineStart = geometraLineStart;
                annot.geometraLineEnd = geometraLineEnd;
            }

            if (annot.type === ANNOT_TYPES.POLYLINE) annot.geometraOpacity = geometraOpacity;
            else {
                annot.geometraOpacity = geometraOpacity;
                annot.geometraBorderOpacity = geometraBorderOpacity;
            }
        }
        return annot;
    },

    parseScale(scale, parameters, path, updateAction) {
        const { name, color, interiorColor, width, geometraLineStart, geometraLineEnd, readOnly, Hidden, geometraOpacity, strokeSize, style } =
            this.parseAnnotationAttribute(scale.xdf, "getScaleInitialValues", scale);

        if (scale.geoEstimateId) {
            scale.geoEstimate = { id: scale.geoEstimateId };
            delete scale.geoEstimateId;
        }
        if (scale.fileId) {
            scale.geoFile = { id: scale.fileId };
            delete scale.fileId;
        }
        scale.annotationId = name;
        scale.color = color;
        scale["interior-color"] = interiorColor;
        scale.width = width;
        scale.geometraLineStart = geometraLineStart;
        scale.geometraLineEnd = geometraLineEnd;
        scale.readOnly = readOnly;
        scale.Hidden = Hidden;
        scale.geometraOpacity = geometraOpacity;
        scale.strokeSize = strokeSize;
        scale.style = style;

        if (parameters)
            _.forEach(Object.getOwnPropertyNames(parameters), (obj) => {
                if (obj !== "labels") scale[obj] = parameters[obj];
            });

        let labels = scale.labels;
        if (!_.isNil(parameters?.labels)) {
            if (labels) {
                try {
                    labels = labels.toJS();
                    labels = this.updateLabels(labels, path, updateAction, parameters.labels);
                } catch (e) {
                    console.log("Error with scale parsing: ", e);
                }
            } else {
                labels = this.getDefaultLabels();
                labels = this.updateLabels(labels, path, updateAction, parameters.labels);
            }
        } else {
            try {
                labels = JSON.parse(labels);
            } catch (e) {
                console.log("Error with scale parsing: ", e);
            }
        }
        scale.labels = labels;
        scale.xdf = this.parseAnnotationAttribute(scale.xdf, "setInitialScaleValues", scale);

        return scale;
    },

    parseAnnotationAttribute(xfdfString, key, obj = null) {
        let parsedObj;
        const parser = new DOMParser();
        const oSerializer = new XMLSerializer();
        const xfdfElements = parser.parseFromString(xfdfString, "text/xml");
        const annotationElement = xfdfElements.querySelector("annots").children[0];
        switch (key) {
            case "setInitialScaleValues":
                annotationElement.setAttribute("annotationName", obj.type);
                annotationElement.setAttribute("color", obj.color);
                annotationElement.setAttribute("interior-color", obj["interior-color"]);
                annotationElement.setAttribute("width", obj.width);
                annotationElement.setAttribute("geometraLineStart", obj.geometraLineStart);
                annotationElement.setAttribute("geometraLineEnd", obj.geometraLineEnd);
                annotationElement.setAttribute("readOnly", obj.readOnly);
                annotationElement.setAttribute("Hidden", obj.Hidden);
                annotationElement.setAttribute("geometraOpacity", obj.geometraOpacity);
                annotationElement.setAttribute("strokeSize", obj.strokeSize);
                annotationElement.setAttribute("length", obj.length);
                annotationElement.setAttribute("labels", JSON.stringify(obj.labels));
                annotationElement.setAttribute("style", obj.style);
                annotationElement.setAttribute("annotationType", obj.type);
                annotationElement.setAttribute("geoAnnotId", obj.id);
                annotationElement.setAttribute("geoFileId", obj.geoFile?.id || obj.fileId);
                annotationElement.setAttribute("geoEstimateId", obj.geoEstimate?.id || obj.geoEstimateId);

                parsedObj = oSerializer.serializeToString(xfdfElements);
                break;
            case "setInitialValues":
                annotationElement.setAttribute("annotationName", obj.name);
                annotationElement.setAttribute("annotationNumber", obj.number);
                annotationElement.setAttribute("annotationHeight", obj.height);
                annotationElement.setAttribute("annotationQuantity", obj.quantity);
                annotationElement.setAttribute("annotationType", obj.type);
                annotationElement.setAttribute("geoAnnotId", obj.id);
                annotationElement.setAttribute("geoFileId", obj.geoFile?.id || obj.fileId);
                annotationElement.setAttribute("geoEstimateId", obj.geoEstimate?.id || obj.geoEstimateId);
                if (!annotationElement.getAttribute("status")) annotationElement.setAttribute("status", "notStarted");
                if (obj.type === ANNOT_TYPES.REDUCTION) annotationElement.setAttribute("geoParentId", obj.parentId);

                parsedObj = oSerializer.serializeToString(xfdfElements);
                break;
            case "getScaleInitialValues": {
                const name = annotationElement.getAttribute("name");
                const color = annotationElement.getAttribute("color");
                const interiorColor = annotationElement.getAttribute("interior-color");
                const width = annotationElement.getAttribute("width") || "1";
                const geometraLineStart = annotationElement.getAttribute("geometraLineStart") || "|<-";
                const geometraLineEnd = annotationElement.getAttribute("geometraLineEnd") || "|<-";
                const readOnly = annotationElement.getAttribute("readOnly") === "true";
                const Hidden = annotationElement.getAttribute("Hidden") === "true";
                const geometraOpacity = parseFloat(annotationElement.getAttribute("geometraOpacity")) || 1;
                const strokeSize = annotationElement.getAttribute("strokeSize");
                const style = annotationElement.getAttribute("style");

                return { name, color, interiorColor, width, geometraLineStart, geometraLineEnd, readOnly, Hidden, geometraOpacity, strokeSize, style };
            }
            case "getInitialValues": {
                const Hidden = annotationElement.getAttribute("Hidden") === "true";
                const maintainAspectRatio = annotationElement.getAttribute("maintainAspectRatio") === "true";
                const readOnly = annotationElement.getAttribute("readOnly") === "true";
                const interiorColor = annotationElement.getAttribute("interior-color");
                const status = annotationElement.getAttribute("status");
                const geometraFlip = annotationElement.getAttribute("geometraFlip");
                const pageNumber = parseInt(annotationElement.getAttribute("page")) + 1;
                const rotation = annotationElement.getAttribute("rotation");

                let groupedAnnotIds;
                try {
                    groupedAnnotIds = JSON.parse(annotationElement.getAttribute("groupedAnnotIds"));
                } catch (e) {
                    groupedAnnotIds = null;
                }

                let strokeSize = parseFloat(annotationElement.getAttribute("readOnly"));
                if (Number.isNaN(strokeSize)) strokeSize = 1;

                let color;
                if (obj.type === ANNOT_TYPES.FREE_TEXT) color = annotationElement.getAttribute("TextColor");
                else color = annotationElement.getAttribute("color");

                let pointSize,
                    iconType,
                    textContents,
                    fontSize,
                    textFont,
                    strokeColor,
                    pattern,
                    geometraLineStart,
                    geometraLineEnd,
                    geometraOpacity,
                    geometraBorderOpacity,
                    formulaNA,
                    formulaNL,
                    formulaNVO,
                    formulaNV;
                if (obj.type === ANNOT_TYPES.POINT) {
                    pointSize = parseFloat(annotationElement.getAttribute("pointSize"));
                    iconType = annotationElement.getAttribute("iconType");
                } else if (obj.type === ANNOT_TYPES.FREE_TEXT || obj.type === ANNOT_TYPES.FREE_TEXT2) {
                    const textAnnot = xfdfElements.getElementsByTagName("contents");
                    _.forEach(textAnnot, (annotElement) => {
                        textContents = annotElement.childNodes[0].nodeValue;
                    });
                    fontSize = parseInt(annotationElement.getAttribute("fontSize"));
                    textFont = annotationElement.getAttribute("textFont");
                    strokeColor = annotationElement.getAttribute("strokeColor");
                } else if (
                    obj.type === ANNOT_TYPES.POLYGON ||
                    obj.type === ANNOT_TYPES.REDUCTION ||
                    obj.type === ANNOT_TYPES.FREE_HAND ||
                    obj.type === ANNOT_TYPES.FREE_HAND2 ||
                    obj.type === ANNOT_TYPES.FREE_HAND3
                ) {
                    pattern = annotationElement.getAttribute("pattern") || "none";
                } else if (obj.type === ANNOT_TYPES.POLYLINE || obj.type === ANNOT_TYPES.X_SCALE || obj.type === ANNOT_TYPES.Y_SCALE) {
                    geometraLineStart = annotationElement.getAttribute("geometraLineStart") || "-";
                    geometraLineEnd = annotationElement.getAttribute("geometraLineEnd") || "-";
                }

                if (
                    obj.type === ANNOT_TYPES.POLYGON ||
                    obj.type === ANNOT_TYPES.REDUCTION ||
                    obj.type === ANNOT_TYPES.ELLIPSE ||
                    obj.type === ANNOT_TYPES.FREE_HAND ||
                    obj.type === ANNOT_TYPES.FREE_HAND2 ||
                    obj.type === ANNOT_TYPES.FREE_HAND3
                ) {
                    formulaNA = annotationElement.getAttribute("formulaNA") || "";
                    formulaNL = annotationElement.getAttribute("formulaNL") || "";
                    formulaNVO = annotationElement.getAttribute("formulaNVO") || "";
                    formulaNV = annotationElement.getAttribute("formulaNV") || "";
                }

                if (obj.type === ANNOT_TYPES.POLYLINE) {
                    const borderOpacity = parseFloat(annotationElement.getAttribute("geometraBorderOpacity"));
                    const opacity = parseFloat(annotationElement.getAttribute("geometraOpacity")) || 0.5;
                    geometraOpacity = borderOpacity || opacity;
                    formulaNL = annotationElement.getAttribute("formulaNL") || "";
                    formulaNV = annotationElement.getAttribute("formulaNV") || "";
                } else {
                    geometraOpacity = parseFloat(annotationElement.getAttribute("geometraOpacity")) || 0.5;
                    geometraBorderOpacity = parseFloat(annotationElement.getAttribute("geometraBorderOpacity")) || 0.5;
                }

                if (obj.type === ANNOT_TYPES.FREE_HAND2) obj.type = ANNOT_TYPES.FREE_HAND;
                if (obj.type === ANNOT_TYPES.FREE_TEXT2) obj.type = ANNOT_TYPES.FREE_TEXT;

                return {
                    Hidden,
                    maintainAspectRatio,
                    readOnly,
                    interiorColor,
                    status,
                    geometraFlip,
                    pageNumber,
                    rotation,
                    groupedAnnotIds,
                    strokeSize,
                    color,
                    pointSize,
                    iconType,
                    textContents,
                    fontSize,
                    textFont,
                    strokeColor,
                    pattern,
                    geometraLineStart,
                    geometraLineEnd,
                    geometraOpacity,
                    geometraBorderOpacity,
                    formulaNA,
                    formulaNL,
                    formulaNVO,
                    formulaNV,
                };
            }
            case "labels":
                annotationElement.setAttribute(key, obj);
                parsedObj = oSerializer.serializeToString(xfdfElements);
                break;
            case "vertices":
                let element = xfdfElements.getElementsByTagName("vertices")[0];
                if (!element) {
                    const vertices = xfdfElements.getElementsByTagName("gesture")[0];
                    if (vertices) element = vertices;
                    else {
                        let vertices = xfdfElements.getElementsByTagName("annots")[0]?.childNodes[0]?.getAttribute("rect");
                        if (vertices) {
                            let verticesText = "";
                            const pointsArray = vertices.split(",");
                            pointsArray.forEach((point, index) => {
                                if (index + 1 === pointsArray.length) verticesText += point;
                                else if ((index + 1) % 2 === 0) verticesText += point + ";";
                                else verticesText += point + ",";
                            });
                            vertices = verticesText.split(";").map((point) => {
                                const values = point.split(",");
                                return [parseFloat(values[0]), parseFloat(values[1])];
                            });
                        }
                        annotationElement.setAttribute("vertices", JSON.stringify(vertices));
                    }
                }

                if (element) {
                    let vertices = element.childNodes[0].nodeValue;
                    if (vertices) {
                        vertices = vertices.split(";").map((point) => {
                            const values = point.split(",");
                            return [parseFloat(values[0]), parseFloat(values[1])];
                        });
                    }
                    annotationElement.setAttribute("vertices", JSON.stringify(vertices));
                    parsedObj = oSerializer.serializeToString(xfdfElements);
                } else parsedObj = oSerializer.serializeToString(xfdfElements);
                break;
            default:
                parsedObj = annotationElement.getAttribute(key);
                break;
        }
        return parsedObj;
    },

    parseRows(rows, annotation) {
        const ifcValuesRegex = new RegExp(/(l|sl|v|s)[0-9]+/);
        for (const [key, row] of Object.entries(rows)) {
            let rowData = {};
            try {
                rowData = JSON.parse(row.annotationRow);
                if (rowData === null) return rows;
            } catch (e) {
                console.log("Error with row parsing: ", e);
                return rows;
            }
            if (rowData.amount && isNaN(rowData.amount) && !ifcValuesRegex.test(rowData.amount.toLowerCase())) {
                const amountAndUnit = rowData.amount.split(" ");
                rowData.amount = CalculationStore.convertToFloat(amountAndUnit[0]) || 0;
                rowData.unit = amountAndUnit[1];
            }
            if (rowData.pricePerUnit) rowData.pricePerUnit = CalculationStore.convertToFloat(rowData.pricePerUnit) || 0;
            if (!rowData.status) rowData.status = "notStarted";
            if (!rowData.phase) rowData.phase = "";
            if (!rowData.profession) rowData.profession = "";
            if (!rowData.unit) rowData.unit = "";
            if (!rowData.unitTime) rowData.unitTime = "00:00";
            rowData.readOnly = annotation.readOnly;
            rowData.rawAmount = rowData.amount;
            rowData.amount = CalculationStore.parseExpressionToValues(rowData.amount, Immutable.fromJS(annotation.annotationData));
            rowData.totalPrice = CalculationStore.performChainMultiply(rowData.pricePerUnit, rowData.amount);
            rowData.totalTime = CalculationStore.performTimeChainMultiply(rowData.unitTime, rowData.amount);
            rowData.negativeValue = rowData.amount < 0 || rowData.pricePerUnit < 0 || isNaN(rowData.amount) || isNaN(rowData.pricePerUnit);

            rows[key].geoAnnotation.annotationId = annotation.annotationId;
            rows[key].geoAnnotation.fileId = annotation.geoFile.id;
            rows[key].geoAnnotation.estimateId = annotation.geoEstimate.id;
            if (annotation.type === ANNOT_TYPES.REDUCTION) rows[key].geoAnnotation.parentId = annotation.parentId;
            rows[key] = { ...rows[key], ...rowData };
        }
        return rows;
    },

    parseTiles(annotation) {
        switch (annotation.type) {
            case ANNOT_TYPES.POLYGON:
            case ANNOT_TYPES.CIRCLE:
            case ANNOT_TYPES.ELLIPSE:
            case ANNOT_TYPES.FREE_HAND:
            case ANNOT_TYPES.FREE_HAND2:
            case ANNOT_TYPES.FREE_HAND3:
            case ANNOT_TYPES.REDUCTION:
            case ANNOT_TYPES.POLYLINE:
                const parser = new DOMParser();
                const xfdfElements = parser.parseFromString(annotation.xfdf, "text/xml");
                const annotations = _.get(xfdfElements.querySelector("annots"), "children");
                _.forEach(annotations, (annotElement) => {
                    const tileX = annotElement.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.TILES_X");
                    if (tileX) {
                        annotation["ESTIMATE.ANNOTATION_PROPERTIES.AREA_TILES_X"] = Number.parseFloat(
                            annotElement.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.TILES_X")
                        );
                        annotation["ESTIMATE.ANNOTATION_PROPERTIES.AREA_TILES_Y"] = Number.parseFloat(
                            annotElement.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.TILES_Y")
                        );
                        annotation["ESTIMATE.ANNOTATION_PROPERTIES.AREA_JOINT_X"] = Number.parseFloat(
                            annotElement.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.JOINT_X")
                        );
                        annotation["ESTIMATE.ANNOTATION_PROPERTIES.AREA_JOINT_Y"] = Number.parseFloat(
                            annotElement.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.JOINT_Y")
                        );
                        annotation["ESTIMATE.ANNOTATION_PROPERTIES.AREA_JOINT_DEPTH"] = Number.parseFloat(
                            annotElement.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.JOINT_DEPTH")
                        );
                    }
                    const areaTileX = annotElement.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.AREA_TILES_X");
                    if (areaTileX) {
                        annotation["ESTIMATE.ANNOTATION_PROPERTIES.AREA_TILES_X"] = Number.parseFloat(
                            annotElement.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.AREA_TILES_X")
                        );
                        annotation["ESTIMATE.ANNOTATION_PROPERTIES.AREA_TILES_Y"] = Number.parseFloat(
                            annotElement.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.AREA_TILES_Y")
                        );
                        annotation["ESTIMATE.ANNOTATION_PROPERTIES.AREA_JOINT_X"] = Number.parseFloat(
                            annotElement.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.AREA_JOINT_X")
                        );
                        annotation["ESTIMATE.ANNOTATION_PROPERTIES.AREA_JOINT_Y"] = Number.parseFloat(
                            annotElement.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.AREA_JOINT_Y")
                        );
                        annotation["ESTIMATE.ANNOTATION_PROPERTIES.AREA_JOINT_DEPTH"] = Number.parseFloat(
                            annotElement.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.AREA_JOINT_DEPTH")
                        );
                    }
                    const wallTileX = annotElement.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.WALL_TILES_X");
                    if (wallTileX) {
                        annotation["ESTIMATE.ANNOTATION_PROPERTIES.WALL_TILES_X"] = Number.parseFloat(
                            annotElement.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.WALL_TILES_X")
                        );
                        annotation["ESTIMATE.ANNOTATION_PROPERTIES.WALL_TILES_Y"] = Number.parseFloat(
                            annotElement.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.WALL_TILES_Y")
                        );
                        annotation["ESTIMATE.ANNOTATION_PROPERTIES.WALL_JOINT_X"] = Number.parseFloat(
                            annotElement.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.WALL_JOINT_X")
                        );
                        annotation["ESTIMATE.ANNOTATION_PROPERTIES.WALL_JOINT_Y"] = Number.parseFloat(
                            annotElement.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.WALL_JOINT_Y")
                        );
                        annotation["ESTIMATE.ANNOTATION_PROPERTIES.WALL_JOINT_DEPTH"] = Number.parseFloat(
                            annotElement.getAttribute("ESTIMATE.ANNOTATION_PROPERTIES.WALL_JOINT_DEPTH")
                        );
                    }
                });
                break;
            default:
                break;
        }
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

    updateLabels(labels, path, updateAction, value) {
        if (updateAction === "add") labels[path].push(value);
        else if (updateAction === "remove") labels[path] = labels[path].filter((item) => item !== value);
        else _.set(labels, path, value);
        return labels;
    },

    calculateValues(annotation, scales, reductions) {
        const geoFileId = annotation.geoFile?.id ? annotation.geoFile.id : annotation.fileId;

        if (annotation.type === ANNOT_TYPES.IFC_MODEL) {
            const annotationData = this.getIFCAnnotData(annotation);
            annotation.annotationData = annotationData;
            return annotation;
        }

        if (!scales[geoFileId] || !scales[geoFileId][annotation.pageNumber]) {
            annotation.annotationData = {};
            return annotation;
        }

        const currentScales = scales[geoFileId][annotation.pageNumber];
        const xScale = _.find(currentScales, (scale) => scale.type === ANNOT_TYPES.X_SCALE);
        const yScale = _.find(currentScales, (scale) => scale.type === ANNOT_TYPES.Y_SCALE);

        let calculator;
        if (xScale) calculator = new ValuesCalculation(annotation.height, annotation.quantity, xScale, geoFileId, yScale);
        else if (annotation.type !== ANNOT_TYPES.IFC_MODEL) return annotation;

        switch (annotation.type) {
            case ANNOT_TYPES.CIRCLE:
            case ANNOT_TYPES.ELLIPSE: {
                const rect = calculator.getRectFromXfdf(annotation.xfdf);
                annotation.annotationData = calculator.calculateEllipseValues(rect);
                annotation = calculator.calculateFormulae(annotation);
                return calculator.calculateTilesForAnnotation(annotation, 0);
            }
            case ANNOT_TYPES.FREE_HAND:
            case ANNOT_TYPES.FREE_HAND2:
            case ANNOT_TYPES.FREE_HAND3: {
                const freeHandVertices = calculator.getVerticesFromXfdf(annotation.xfdf);
                annotation.annotationData = calculator.calculatePolygonValues(freeHandVertices);
                delete annotation.annotationData["ESTIMATE.ANNOTATION_VALUES.LENGTHS"];
                delete annotation.annotationData["ESTIMATE.ANNOTATION_VALUES.WALLS"];
                delete annotation.annotationData["ESTIMATE.ANNOTATION_VALUES.POINTS"];

                annotation = calculator.calculateFormulae(annotation);
                return calculator.calculateTilesForAnnotation(annotation, 0);
            }
            case "Rectangle":
            case ANNOT_TYPES.REDUCTION: {
                const reductionVertices = calculator.getVerticesFromXfdf(annotation.xfdf);
                annotation.annotationData = calculator.calculatePolygonValues(reductionVertices);
                const annotationData = annotation.annotationData;
                annotation.annotationData = annotationData;
                annotation = calculator.calculateFormulae(annotation);
                return calculator.calculateTilesForAnnotation(annotation);
            }
            case ANNOT_TYPES.POLYGON:
                const vertices = calculator.getVerticesFromXfdf(annotation.xfdf);
                annotation.annotationData = calculator.calculatePolygonValues(vertices);
                const annotationData = annotation.annotationData;
                annotation.annotationData = annotationData;
                let reductionAreaList = new Immutable.List();
                let totalReduction = 0;
                let totalReductionVolume = 0;
                let totalReductionLength = 0;
                let totalReductionWall = 0;
                let totalReductionPoints = 0;
                let reductionTiles = 0;

                _.filter(reductions, (reduction) => reduction.parentId === annotation.annotationId)
                    .sort((reduction1, reduction2) => {
                        if (reduction1.id < reduction2.id) return -1;
                        if (reduction1.id > reduction2.id) return 1;
                        return 0;
                    })
                    .forEach((reduction) => {
                        const tempCalculator = new ValuesCalculation(reduction.height, reduction.quantity, xScale, reduction.geoFile.id, yScale);
                        const vertices = tempCalculator.getVerticesFromXfdf(reduction.xfdf);
                        reduction.annotationData = tempCalculator.calculatePolygonValues(vertices);
                        reduction = tempCalculator.calculateFormulae(reduction);
                        const reductionPoints = reduction.annotationData["ESTIMATE.ANNOTATION_VALUES.POINTS"];
                        const reductionArea = reduction.annotationData["ESTIMATE.ANNOTATION_VALUES.AREA"];
                        const reductionLength = reduction.annotationData["ESTIMATE.ANNOTATION_VALUES.LENGTH"];
                        const reductionWall = reduction.annotationData["ESTIMATE.ANNOTATION_VALUES.WALL"];
                        totalReduction += reductionArea;
                        totalReductionVolume += reductionArea * reduction.height;
                        totalReductionLength += reductionLength;
                        totalReductionPoints += reductionPoints;
                        reductionAreaList = reductionAreaList.push(reductionArea);
                        totalReductionWall += reductionWall;
                        if (
                            reduction.annotationData["ESTIMATE.ANNOTATION_VALUES.TILES_X"] &&
                            AnnotationStore.isSelected(reduction.annotationId, reduction.id)
                        ) {
                            reduction = tempCalculator.calculateTilesForAnnotation(reduction);
                            reductionTiles += reduction.annotationData["ESTIMATE.ANNOTATION_VALUES.TILES"];
                        }
                    });
                if (reductionAreaList.size > 0) {
                    annotation.annotationData["ESTIMATE.ANNOTATION_VALUES.REDUCTIONS"] = reductionAreaList;
                    annotation.annotationData["ESTIMATE.ANNOTATION_VALUES.RED_AREA"] = totalReduction;
                    annotation.annotationData["ESTIMATE.ANNOTATION_VALUES.RED_LENGTH"] = totalReductionLength;
                    annotation.annotationData["ESTIMATE.ANNOTATION_VALUES.NET_AREA"] =
                        annotation.annotationData["ESTIMATE.ANNOTATION_VALUES.NET_AREA"] - totalReduction;
                    annotation.annotationData["ESTIMATE.ANNOTATION_VALUES.NET_VOLUME"] =
                        annotation.annotationData["ESTIMATE.ANNOTATION_VALUES.NET_VOLUME"] - totalReductionVolume;
                    annotation.annotationData["ESTIMATE.ANNOTATION_VALUES.RED_VOLUME"] = totalReductionVolume;
                    annotation.annotationData["ESTIMATE.ANNOTATION_VALUES.NET_LENGTH"] =
                        annotation.annotationData["ESTIMATE.ANNOTATION_VALUES.LENGTH"] - totalReductionLength;
                    annotation.annotationData["ESTIMATE.ANNOTATION_VALUES.NET_WALL"] =
                        annotation.annotationData["ESTIMATE.ANNOTATION_VALUES.WALL"] - totalReductionWall;
                    annotation.annotationData["ESTIMATE.ANNOTATION_VALUES.RED_WALL"] = totalReductionWall;
                    annotation.annotationData["ESTIMATE.ANNOTATION_VALUES.POINTS"] =
                        annotation.annotationData["ESTIMATE.ANNOTATION_VALUES.POINTS"] + totalReductionPoints;
                }
                annotation = calculator.calculateFormulae(annotation);
                return calculator.calculateTilesForAnnotation(annotation, totalReductionLength, reductionTiles);
            case ANNOT_TYPES.POLYLINE: {
                const lineVertices = calculator.getVerticesFromXfdf(annotation.xfdf);
                annotation.annotationData = calculator.calculateLineValues(lineVertices);
                annotation = calculator.calculateFormulae(annotation);
                return calculator.calculateTilesForAnnotation(annotation, 0);
            }
            case ANNOT_TYPES.POINT: {
                const geoFile = annotation.geoFile;
                let fileName = undefined;
                if (geoFile) {
                    const file = FileStore.getFileById(geoFile.id);
                    if (file) fileName = file.name;
                }
                annotation.annotationData = {};
                annotation.annotationData["ESTIMATE.ANNOTATION_VALUES.POINTS"] = annotation.quantity;
                annotation.annotationData["ESTIMATE.ANNOTATION_PROPERTIES.COUNT"] = annotation.quantity;
                annotation.annotationData["ESTIMATE.ANNOTATION_PROPERTIES.FILE_NAME"] = fileName;
                return annotation;
            }
            case ANNOT_TYPES.STAMP:
            case ANNOT_TYPES.ARROW: {
                const geoFile = annotation.geoFile;
                let fileName = undefined;
                if (geoFile) {
                    const file = FileStore.getFileById(geoFile.id);
                    if (file) fileName = file.name;
                }
                annotation.annotationData = {};
                annotation.annotationData["ESTIMATE.ANNOTATION_PROPERTIES.FILE_NAME"] = fileName;
                return annotation;
            }
            case ANNOT_TYPES.FREE_TEXT: {
                const geoFile = annotation.geoFile;
                let fileName = undefined;
                if (geoFile) {
                    const file = FileStore.getFileById(geoFile.id);
                    if (file) fileName = file.name;
                }
                annotation.annotationData = {};
                annotation.annotationData["ESTIMATE.ANNOTATION_VALUES.TEXT_CONTENTS"] = annotation.textContents;
                annotation.annotationData["ESTIMATE.ANNOTATION_PROPERTIES.FILE_NAME"] = fileName;
                return annotation;
            }
            default:
                annotation.annotationData = {};
                return annotation;
        }
    },

    getSumCalculateValues() {
        const { selectionList } = this.getSelectionList();
        let sumCalculateValues = {};
        let sumCalculateArray = [];
        const selectedAnnots = _.cloneDeep(selectionList);
        const nrSelected = selectedAnnots.length;

        function minfiedSummation(list) {
            return list.reduce((acc, next) => {
                if (!_.isEmpty(acc)) {
                    return _.mergeWith(acc, next, (oldVal, newVal) => {
                        if (Number(oldVal) && Number(newVal)) {
                            oldVal = Number(oldVal);
                            newVal = Number(newVal);
                            return newVal + (oldVal ? oldVal : 0.0);
                        } else if (Array.isArray(oldVal)) return oldVal.concat(newVal);
                        else return [oldVal, newVal];
                    });
                } else return next;
            }, {});
        }

        _.forEach(selectedAnnots, (annot) => {
            if (annot.type !== ANNOT_TYPES.GROUP && _.isEmpty(sumCalculateValues)) {
                if (annot.type !== ANNOT_TYPES.X_SCALE && annot.type !== ANNOT_TYPES.Y_SCALE) {
                    if (nrSelected > 1) {
                        if (annot.annotationData) {
                            sumCalculateValues = { ...annot.annotationData };
                            delete sumCalculateValues["ESTIMATE.ANNOTATION_VALUES.LENGTHS"];
                            delete sumCalculateValues["ESTIMATE.ANNOTATION_VALUES.WALLS"];
                            delete sumCalculateValues["ESTIMATE.ANNOTATION_VALUES.REDUCTIONS"];
                            delete sumCalculateValues["ESTIMATE.ANNOTATION_VALUES.OUTER_DIM_X"];
                            delete sumCalculateValues["ESTIMATE.ANNOTATION_VALUES.OUTER_DIM_Y"];
                            delete sumCalculateValues["ESTIMATE.ANNOTATION_VALUES.RADIUS_X"];
                            delete sumCalculateValues["ESTIMATE.ANNOTATION_VALUES.RADIUS_Y"];
                            delete sumCalculateValues["ESTIMATE.ANNOTATION_VALUES.DIAMETER_X"];
                            delete sumCalculateValues["ESTIMATE.ANNOTATION_VALUES.DIAMETER_Y"];
                            delete sumCalculateValues["ESTIMATE.ANNOTATION_VALUES.EDGES"];
                            delete sumCalculateValues["ESTIMATE.ANNOTATION_VALUES.SL"];
                            delete sumCalculateValues["ESTIMATE.ANNOTATION_VALUES.S"];
                        }
                    } else if (annot.annotationData) sumCalculateValues = { ...annot.annotationData };
                }
            } else if (annot.type !== ANNOT_TYPES.GROUP) {
                if (annot.type !== ANNOT_TYPES.X_SCALE && annot.type !== ANNOT_TYPES.Y_SCALE) {
                    if (nrSelected > 1 && annot.annotationData) {
                        delete annot.annotationData["ESTIMATE.ANNOTATION_VALUES.LENGTHS"];
                        delete annot.annotationData["ESTIMATE.ANNOTATION_VALUES.WALLS"];
                        delete annot.annotationData["ESTIMATE.ANNOTATION_VALUES.REDUCTIONS"];
                        delete annot.annotationData["ESTIMATE.ANNOTATION_VALUES.OUTER_DIM_X"];
                        delete annot.annotationData["ESTIMATE.ANNOTATION_VALUES.OUTER_DIM_Y"];
                        delete annot.annotationData["ESTIMATE.ANNOTATION_VALUES.RADIUS_X"];
                        delete annot.annotationData["ESTIMATE.ANNOTATION_VALUES.RADIUS_Y"];
                        delete annot.annotationData["ESTIMATE.ANNOTATION_VALUES.DIAMETER_X"];
                        delete annot.annotationData["ESTIMATE.ANNOTATION_VALUES.DIAMETER_Y"];
                        delete annot.annotationData["ESTIMATE.ANNOTATION_VALUES.EDGES"];
                        delete annot.annotationData["ESTIMATE.ANNOTATION_VALUES.SL"];
                        delete annot.annotationData["ESTIMATE.ANNOTATION_VALUES.S"];
                    }
                    sumCalculateArray = [];
                    sumCalculateArray.push(annot.annotationData, sumCalculateValues);
                    sumCalculateValues = minfiedSummation(sumCalculateArray);
                }
            }
        });

        if (sumCalculateValues) sumCalculateValues["ESTIMATE.ANNOTATION_VALUES.ANNOTATIONS"] = nrSelected;
        return sumCalculateValues;
    },

    getIFCAnnotData(annotation) {
        const geoFileId = annotation.geoFile?.id ? annotation.geoFile.id : annotation.fileId;
        const file = FileStore.getFileById(geoFileId);
        const xfdf = annotation.xfdf;

        let annotationData = { "ESTIMATE.ANNOTATION_PROPERTIES.FILE_NAME": file.name, "ESTIMATE.ANNOTATION_PROPERTIES.COUNT": 1 };

        if (!_.isNil(xfdf.area)) {
            const data = { "ESTIMATE.ANNOTATION_VALUES.AREA": xfdf.area };
            annotationData = Object.assign({}, annotationData, data);
        }
        if (!_.isNil(xfdf.volume)) {
            const data = { "ESTIMATE.ANNOTATION_VALUES.VOLUME": xfdf.volume };
            annotationData = Object.assign({}, annotationData, data);
        }
        if (!_.isNil(xfdf.netArea)) {
            const data = { "ESTIMATE.ANNOTATION_VALUES.NET_AREA": xfdf.netArea };
            annotationData = Object.assign({}, annotationData, data);
        }
        if (!_.isNil(xfdf.netVolume)) {
            const data = { "ESTIMATE.ANNOTATION_VALUES.NET_VOLUME": xfdf.netVolume };
            annotationData = Object.assign({}, annotationData, data);
        }
        if (!_.isNil(xfdf.edges)) {
            const edges = xfdf.edges;
            const edgesArray = Object.keys(edges)
                .sort((a, b) => a.slice(1) - b.slice(1))
                .map((item) => edges[item].length);

            annotationData = Object.assign({}, annotationData, { "ESTIMATE.ANNOTATION_VALUES.EDGES": edgesArray });
        }
        if (!_.isNil(xfdf.sides)) {
            const sides = xfdf.sides;
            const sideLenArray = Object.keys(sides)
                .sort((a, b) => a.slice(1) - b.slice(1))
                .map((item) => sides[item].circumference);
            const sideArray = Object.keys(sides)
                .sort((a, b) => a.slice(1) - b.slice(1))
                .map((item) => sides[item].area);

            annotationData = Object.assign(
                {},
                annotationData,
                { "ESTIMATE.ANNOTATION_VALUES.SL": sideLenArray },
                { "ESTIMATE.ANNOTATION_VALUES.S": sideArray }
            );
        }
        return annotationData;
    },
    //SELECT
    getSelectionState() {
        return this.selectionState;
    },

    getSelectionList(onlyAnnotations) {
        const { selectedAnnotations, mainFolders, selectedScales } = this.selectionState;
        let selectionList = [];
        let selectionKeys = [];
        let mainFoldersList = [];
        let scalesList = [];

        if (onlyAnnotations) {
            selectionList = _.values(selectedAnnotations).filter((obj) => obj.type !== ANNOT_TYPES.GROUP);
            selectionKeys = _.map(selectionList, (annot) => annot.id);
        } else {
            selectionList = [..._.values(mainFolders), ..._.values(selectedAnnotations)];
            selectionKeys = _.map(selectionList, (obj) => obj.id);
            mainFoldersList = [..._.values(mainFolders)];
        }
        scalesList = _.values(selectedScales);
        return { selectionList, selectionKeys, mainFoldersList, scalesList };
    },

    selectScale({ scaleType, activeEstimateId, fileId, activePage }) {
        if (scaleType && activePage !== -1) {
            this.clearSelection();
            const selectedScale = this.estimateObjectsHashMap[activeEstimateId].objects.scalesMap[fileId][activePage][scaleType];
            this.selectionState.selectedScales = { [selectedScale.id]: selectedScale };
            this.updateTypeMap();
            AnnotationStore.selectAnnotationFromGui(selectedScale);
            AnnotationStore.onSetActiveParentId(null);
        } else {
            this.updateTypeMap();
            this.selectionState.selectedScales = {};
        }
    },

    deselectScale({ scaleType, activeEstimateId, fileId, activePage }) {
        if (scaleType && activePage !== -1) {
            const deselectedScale = this.estimateObjectsHashMap[activeEstimateId].objects.scalesMap[fileId][activePage][scaleType];
            delete this.selectionState.selectedScales[deselectedScale.id];
            this.updateTypeMap();
            AnnotationStore.deSelectAnnotationFromGui(deselectedScale);
        }
    },

    selectAnnotation(annot, leaveOldSelection) {
        //expandedKeys
        if (leaveOldSelection) {
            this.selectionState.selectedAnnotations[annot.id] = annot;
        } else {
            this.selectionState.selectedAnnotations = { [annot.id]: annot };
            this.selectionState.mainFolders = {};
        }
        this.setBundledRows();
        this.updateTypeMap();
        this.handleAcitveParentId([annot]);
        if (annot.type === ANNOT_TYPES.POLYGON) AnnotationStore.setActiveReductionParentId({ Id: annot.annotationId });
        AnnotationStore.setContextMenuPopupContent(this.getSelectionList(true));
        if (!leaveOldSelection) AnnotationStore.deSelectAllAnnotationsFromGui([], false);
        AnnotationStore.selectAnnotationFromGui(annot);
    },

    deselectAnnotation(annot) {
        _.unset(this.selectionState.selectedAnnotations, annot.id);
        _.unset(this.selectionState.mainFolders, annot.id);
        AnnotationStore.setContextMenuPopupContent(this.getSelectionList(true));
        this.setBundledRows();
        this.updateTypeMap();
        if (annot.type !== ANNOT_TYPES || annot.type !== ANNOT_TYPES.IFC_MODEL) AnnotationStore.deSelectAnnotationFromGui(annot);
    },

    selectListOfObjects(objectsToSelect, mainFoldersList, leaveOldSelection, setNewMainFolders) {
        if (leaveOldSelection) {
            this.addObjectsToSelection(this.selectionState.selectedAnnotations, objectsToSelect);
        } else {
            const selectionMap = this.createIdMap(objectsToSelect);
            this.selectionState.selectedAnnotations = selectionMap;
        }
        if (leaveOldSelection && !setNewMainFolders) {
            this.addObjectsToSelection(this.selectionState.mainFolders, mainFoldersList);
        } else {
            const selectionMap = this.createIdMap(mainFoldersList);
            this.selectionState.mainFolders = selectionMap;
        }
        this.setBundledRows();
        this.updateTypeMap();
        this.handleAcitveParentId(objectsToSelect, mainFoldersList);
        AnnotationStore.setContextMenuPopupContent(this.getSelectionList(true));
        if (objectsToSelect.length === 1) {
            const type = objectsToSelect[0]?.data?.type || objectsToSelect[0].type;
            if (type === ANNOT_TYPES.POLYGON) {
                const annotId = objectsToSelect[0]?.data?.annotationId || objectsToSelect[0].annotationId;
                AnnotationStore.setActiveReductionParentId({ Id: annotId });
            }
        }
        AnnotationStore.deSelectAllAnnotationsFromGui([], false);
        const annotsToSelect = _.values(this.selectionState.selectedAnnotations).filter((obj) => obj.type !== ANNOT_TYPES.GROUP);
        AnnotationStore.selectAllAnnotationsFromGui(annotsToSelect);
    },

    addObjectsToSelection(objectToUpdate, selectionList = []) {
        if (!selectionList.length) {
            objectToUpdate = {};
            return;
        }
        _.forEach(selectionList, (obj) => {
            const id = obj.data?.id || obj.id;
            const object = obj.data || obj;
            objectToUpdate[id] = object;
        });
    },

    deselectMainFolders(foldersToUnselect) {
        const foldersIdListToDelete = _.map(foldersToUnselect, (folder) => folder.id);
        const newMainFoldersList = _.omit(this.selectionState.mainFolders, foldersIdListToDelete);
        this.selectionState.mainFolders = newMainFoldersList;
        this.setBundledRows();
        this.updateTypeMap();
    },

    deselectAnnotations(annotsList, clearMainFolders) {
        let annotsIdsListToDeselect = _.map(annotsList, (annot) => annot.id);
        if (clearMainFolders) {
            const foldersIds = _.values(this.selectionState.selectedAnnotations)
                .filter((obj) => obj.type === ANNOT_TYPES.GROUP)
                .map((annot) => annot.id);
            const annotsFromOtherFilesIds = _.values(this.selectionState.selectedAnnotations)
                .filter((obj) => obj?.geoFile?.id !== AnnotationStore.getActiveFileId())
                .map((annot) => annot.id);
            annotsIdsListToDeselect = [...annotsIdsListToDeselect, ...foldersIds, ...annotsFromOtherFilesIds];
        }
        const newSelection = _.omit(this.selectionState.selectedAnnotations, annotsIdsListToDeselect);
        this.selectionState.selectedAnnotations = newSelection;
        if (clearMainFolders) this.selectionState.mainFolders = {};
        this.setBundledRows();
        this.updateTypeMap();
        AnnotationStore.setContextMenuPopupContent(this.getSelectionList(true));
        AnnotationStore.deSelectAllAnnotationsFromGui([], false);
        const annotsToSelect = _.values(this.selectionState.selectedAnnotations).filter((obj) => obj.type !== ANNOT_TYPES.GROUP);
        AnnotationStore.selectAllAnnotationsFromGui(annotsToSelect);
    },

    clearSelection() {
        this.selectionState.selectedAnnotations = {};
        this.selectionState.mainFolders = {};
        this.setBundledRows();
        this.updateTypeMap();
        AnnotationStore.setContextMenuPopupContent(this.getSelectionList(true));
        AnnotationStore.deSelectAllAnnotationsFromGui([], true);
    },

    exchangeSelectedIfSelected(annot) {
        try {
            const { type, id } = annot;
            const selectState = this.selectionState.selectedAnnotations;
            const mainFoldersState = this.selectionState.mainFolders;
            const scalesState = this.selectionState.selectedScales;
            switch (type) {
                case ANNOT_TYPES.GROUP:
                    if (selectState[id]) selectState[id] = annot;
                    if (mainFoldersState[id]) mainFoldersState[id] = annot;
                case ANNOT_TYPES.X_SCALE:
                case ANNOT_TYPES.Y_SCALE:
                    if (scalesState[id]) scalesState[id] = annot;
                    break;
                default:
                    if (selectState[id]) selectState[id] = annot;
                    break;
            }
        } catch (error) {
            console.log("Error | exchangeSelectedIfSelected: " + error);
        }
    },

    handleAcitveParentId(selection = [], mainFolders = []) {
        if (mainFolders.length) {
            const id = mainFolders[0].id || mainFolders[0].data.id;
            const newActiveParentId = mainFolders.length === 1 ? id : null;
            AnnotationStore.onSetActiveParentId(newActiveParentId);
        } else {
            if (!selection.length) AnnotationStore.onSetActiveParentId(null);
            const parsedSelection = _.map(selection, (node) => node.data || node);
            const uniqueByParentId = _.uniqBy(parsedSelection, "parentId");
            AnnotationStore.onSetActiveParentId(uniqueByParentId.length === 1 ? uniqueByParentId[0].parentId : null);
        }
    },

    updateTypeMap() {
        this.typeMap.nrSelected = this.getTypeMapNrSelected();
        this.typeMap[ANNOT_TYPES.IFC_MODEL] = this.checkIfTypeIsSelected(ANNOT_TYPES.IFC_MODEL);
        this.typeMap[ANNOT_TYPES.ARROW] = this.checkIfTypeIsSelected(ANNOT_TYPES.ARROW);
        this.typeMap[ANNOT_TYPES.ELLIPSE] = this.checkIfTypeIsSelected(ANNOT_TYPES.ELLIPSE);
        this.typeMap[ANNOT_TYPES.FREE_HAND] = this.checkIfTypeIsSelected(ANNOT_TYPES.FREE_HAND);
        this.typeMap[ANNOT_TYPES.FREE_TEXT] = this.checkIfTypeIsSelected(ANNOT_TYPES.FREE_TEXT);
        this.typeMap[ANNOT_TYPES.POINT] = this.checkIfTypeIsSelected(ANNOT_TYPES.POINT);
        this.typeMap[ANNOT_TYPES.POLYGON] = this.checkIfTypeIsSelected(ANNOT_TYPES.POLYGON);
        this.typeMap[ANNOT_TYPES.POLYLINE] = this.checkIfTypeIsSelected(ANNOT_TYPES.POLYLINE);
        this.typeMap[ANNOT_TYPES.REDUCTION] = this.checkIfTypeIsSelected(ANNOT_TYPES.REDUCTION);
        this.typeMap[ANNOT_TYPES.STAMP] = this.checkIfTypeIsSelected(ANNOT_TYPES.STAMP);
        this.typeMap[ANNOT_TYPES.GROUP] = this.checkIfTypeIsSelected(ANNOT_TYPES.GROUP);
        this.typeMap[ANNOT_TYPES.X_SCALE] = this.checkIfTypeIsSelected(ANNOT_TYPES.X_SCALE);
        this.typeMap[ANNOT_TYPES.Y_SCALE] = this.checkIfTypeIsSelected(ANNOT_TYPES.Y_SCALE);
    },

    checkIfTypeIsSelected(type) {
        switch (type) {
            case ANNOT_TYPES.X_SCALE:
            case ANNOT_TYPES.Y_SCALE:
                const selectedScale = Object.values(this.selectionState.selectedScales);
                return _.some(selectedScale, (obj) => obj.type === type);
            case ANNOT_TYPES.GROUP:
                const selectedAnnots = Object.values(this.selectionState.selectedAnnotations);
                const selectedMainFolders = Object.values(this.selectionState.mainFolders);
                return _.some([...selectedAnnots, ...selectedMainFolders], (obj) => obj.type === type);
            default:
                const selectedAnnotations = Object.values(this.selectionState.selectedAnnotations);
                return _.some(selectedAnnotations, (annot) => annot.type === type);
        }
    },

    getTypeMapNrSelected() {
        const selectedAnnots = _.values(this.selectionState.selectedAnnotations);
        const selectedMainFolders = _.values(this.selectionState.mainFolders);
        return selectedAnnots.length + selectedMainFolders.length;
    },

    getAnnotationByPDFTronAnnot({ geoEstimateId, geoFileId, geoAnnotId }) {
        const annotsMap = this.estimateObjectsHashMap[geoEstimateId]?.objects.annotationsMap;
        return annotsMap && _.get(annotsMap, [geoFileId, geoAnnotId]);
    },

    getReductionByPDFTronAnnot({ geoEstimateId, geoFileId, geoAnnotId, geoParentId }) {
        const reductionsMap = this.estimateObjectsHashMap[geoEstimateId]?.objects.reductionsMap;
        return reductionsMap && _.get(reductionsMap, [geoFileId, geoParentId, geoAnnotId]);
    },

    getFolderById({ geoEstimateId, id }) {
        const foldersMap = this.estimateObjectsHashMap[geoEstimateId]?.objects.foldersMap;
        return foldersMap && _.get(foldersMap, [id]);
    },

    getScaleByPDFTronAnnot({ geoEstimateId, geoFileId, annotationType, pageNumber }) {
        const scalesMap = this.estimateObjectsHashMap[geoEstimateId]?.objects.scalesMap;
        return scalesMap && _.get(scalesMap, [geoFileId, pageNumber, annotationType]);
    },

    getParentAnnotForReduction(reduction, obj = false) {
        const {
            parentId,
            geoFile: { id: fileId },
            geoEstimate: { id: estimateId },
        } = reduction;
        const annotList = this.getAllAnnotations(estimateId, fileId);
        if (obj) return _.find(annotList, (annot) => annot.annotationId === parentId)[obj];
        else return _.find(annotList, (annot) => annot.annotationId === parentId);
    },

    getFoldersPathForExport(annot) {
        const {
            parentId,
            type,
            geoEstimate: { id: geoEstimateId },
        } = annot;
        const isReduction = type === ANNOT_TYPES.REDUCTION;
        const folderId = isReduction ? this.getParentAnnotForReduction(annot, "parentId") : parentId;
        const parent = this.getFolderById({ geoEstimateId, id: folderId });
        if (parent && parent.parentId) return `${this.getFoldersPathForExport(parent)} > (${parent.number}) ${parent.name}`;
        else if (parent) return `> (${parent.number}) ${parent.name}`;
        else return ">";
    },
});
