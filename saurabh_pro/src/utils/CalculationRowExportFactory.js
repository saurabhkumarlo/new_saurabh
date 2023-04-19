import { toUS, toUSsquared, toUSvolume } from "./Converison";

import AnnotationExportFactory from "./AnnotationExportFactory";
import AnnotationStore from "../stores/AnnotationStore";
import CalculationStore from "../stores/CalculationStore";
import FileStore from "../stores/FileStore";
import Immutable from "immutable";
import ProjectsStore from "../stores/ProjectsStore";
import i18n from "../i18nextInitialized";
import { ROWS, ANNOTS, ANNOT_TYPES } from "../constants";
import _, { uniq } from "lodash";
import { ObjectsStore, TreeStoreV2 } from "stores";

export default class CalculationRowExportFactory extends AnnotationExportFactory {
    constructor() {
        super();
        this.pathLength = -1;
    }

    initFolderData(dataList) {
        return dataList.map((dataObject) => {
            if (dataObject[ANNOTS.FOLDER]) {
                let pathList = dataObject[ANNOTS.FOLDER].split(">");
                let length = 0;
                if (pathList.length === 2 && pathList[0] === "" && pathList[1] === "") {
                    pathList = [""];
                    length = 1;
                } else length = pathList.length;
                pathList.forEach((path, index) => (dataObject[i18n.t(ANNOTS.GROUP_FOLDER) + " " + (index + 1)] = `${path.trim()} >`));
                if (this.pathLength < length) this.pathLength = length;
            }
            return dataObject;
        });
    }

    getPathLength() {
        return this.pathLength;
    }

    getAnnotationRowsFullList() {
        const selectedRows = ObjectsStore.getSeparateSelectedRows();
        const calcRowsToReturn = [];
        let index = 0;

        _.forEach(selectedRows, (selectedRow) => {
            const currentRow = {};
            const geoEstimateId = selectedRow.geoAnnotation.estimateId;
            const geoFileId = selectedRow.geoAnnotation.fileId;
            const geoAnnotId = selectedRow.geoAnnotation.id;
            const geoParentId = selectedRow.geoAnnotation.parentId;
            const currentAnnot = geoParentId
                ? ObjectsStore.getReductionByPDFTronAnnot({ geoEstimateId, geoFileId, geoAnnotId, geoParentId })
                : ObjectsStore.getAnnotationByPDFTronAnnot({ geoEstimateId, geoFileId, geoAnnotId });
            try {
                _.set(currentRow, [i18n.t(ROWS.ID)], ++index);
                _.set(currentRow, [i18n.t(ANNOTS.FILE_NAME)], FileStore.getFileById(geoFileId).name);
                _.set(currentRow, [i18n.t(ANNOTS.NUMBER)], currentAnnot.number.replace(/-+/g, "−"));
                _.set(currentRow, [i18n.t(ANNOTS.NAME)], currentAnnot.name.replace(/-+/g, "−"));
                _.set(currentRow, [i18n.t(ANNOTS.FOLDER)], ObjectsStore.getFoldersPathForExport(currentAnnot));
                _.set(currentRow, [i18n.t(ROWS.STATUS)], CalculationStore.getVisibleStatusValue(selectedRow.status));
                _.set(currentRow, [i18n.t(ROWS.PROFESSION)], selectedRow.profession);
                _.set(currentRow, [i18n.t(ROWS.PHASE)], selectedRow.phase);
                _.set(currentRow, [i18n.t(ROWS.SEGMENT)], selectedRow.segment);
                _.set(currentRow, [i18n.t(ROWS.ACTION)], selectedRow.action);
                _.set(currentRow, [i18n.t(ROWS.MATERIAL)], selectedRow.material);
                _.set(currentRow, [i18n.t(ROWS.UNIT)], selectedRow.unit);
                _.set(currentRow, [i18n.t(ROWS.UNIT_TIME)], selectedRow.unitTime);
                _.set(currentRow, [i18n.t(ROWS.AMOUNT)], this.translateValue(selectedRow.amount, selectedRow.unit, true));
                _.set(currentRow, [i18n.t(ROWS.UNIT_PRICE)], this.translateValue(selectedRow.pricePerUnit, selectedRow.unit));
                _.set(currentRow, [i18n.t(ROWS.TOTAL_PRICE)], this.translateValue(selectedRow.totalPrice, selectedRow.unit));
                _.set(currentRow, [i18n.t(ROWS.TOTAL_TIME)], selectedRow.totalTime);
                _.set(currentRow, [i18n.t(ROWS.FORMULA)], selectedRow.rawAmount);
                _.set(currentRow, [i18n.t(ROWS.CURRENCY)], ProjectsStore.getProjectCurrency(ProjectsStore.getActiveProjectId()));
            } catch (e) {
                console.log("Error with rows exporting: ", e);
            }
            calcRowsToReturn.push(currentRow);
        });

        return this.initFolderData(calcRowsToReturn);
    }

    getSelectionRowSum() {
        const selectedRows = ObjectsStore.getSeparateSelectedRows();
        const bundledRows = ObjectsStore.getBundledRows();
        const calcRowsToReturn = [];
        let index = 0;

        _.forEach(bundledRows, (bundledRow) => {
            if (
                _.some(selectedRows, (selectedRow) => (bundledRow.ids?.length ? _.includes(bundledRow.ids, selectedRow.id) : bundledRow.id === selectedRow.id))
            ) {
                const currentRow = {};
                try {
                    _.set(currentRow, [i18n.t(ROWS.ID)], ++index);
                    _.set(currentRow, [i18n.t(ROWS.STATUS)], CalculationStore.getVisibleStatusValue(bundledRow.status));
                    _.set(currentRow, [i18n.t(ROWS.PROFESSION)], bundledRow.profession);
                    _.set(currentRow, [i18n.t(ROWS.PHASE)], bundledRow.phase);
                    _.set(currentRow, [i18n.t(ROWS.SEGMENT)], bundledRow.segment);
                    _.set(currentRow, [i18n.t(ROWS.ACTION)], bundledRow.action);
                    _.set(currentRow, [i18n.t(ROWS.MATERIAL)], bundledRow.material);
                    _.set(currentRow, [i18n.t(ROWS.UNIT)], bundledRow.unit);
                    _.set(currentRow, [i18n.t(ROWS.UNIT_TIME)], bundledRow.unitTime);
                    _.set(currentRow, [i18n.t(ROWS.AMOUNT)], this.translateValue(bundledRow.amount, bundledRow.unit, true));
                    _.set(currentRow, [i18n.t(ROWS.UNIT_PRICE)], this.translateValue(bundledRow.pricePerUnit, bundledRow.unit));
                    _.set(currentRow, [i18n.t(ROWS.TOTAL_PRICE)], this.translateValue(bundledRow.totalPrice, bundledRow.unit));
                    _.set(currentRow, [i18n.t(ROWS.TOTAL_TIME)], bundledRow.totalTime);
                    _.set(currentRow, [i18n.t(ROWS.FORMULA)], bundledRow.rawAmount);
                    _.set(currentRow, [i18n.t(ROWS.CURRENCY)], ProjectsStore.getProjectCurrency(ProjectsStore.getActiveProjectId()));
                    _.set(currentRow, [i18n.t(ROWS.OBJECTS)], this.getAffectedObjects(bundledRow));
                } catch (e) {
                    console.log("Error with rows exporting: ", e);
                }
                calcRowsToReturn.push(currentRow);
            }
        });
        return calcRowsToReturn;
    }

    getAnnototationRowsSumFolderList() {
        const calcRowsToReturn = [];
        let index = 0;

        try {
            _.forEach(TreeStoreV2.getFolderMapping(), (folderMap) => {
                let currentLevelRows = [];
                const children = _.find(folderMap.parentChildrens, (children) => children.data.type !== ANNOT_TYPES.GROUP);

                if (children) {
                    const currentPath = ObjectsStore.getFoldersPathForExport(children.data);

                    _.forEach(folderMap.parentChildrens, (parentChildren) => {
                        if (parentChildren.data.type !== ANNOT_TYPES.GROUP) {
                            const currentparentChildrenRows = _.values(JSON.parse(JSON.stringify(parentChildren.data.rows)));
                            currentLevelRows = _.concat(currentLevelRows, currentparentChildrenRows);
                        }
                    });

                    const bundledCurrentLevelRows = ObjectsStore.bundlingRows(currentLevelRows);

                    _.forEach(bundledCurrentLevelRows, (bundledCurrentLevelRow) => {
                        const currentRow = {};
                        _.set(currentRow, [i18n.t(ROWS.ID)], ++index);
                        _.set(currentRow, [i18n.t(ANNOTS.FOLDER)], currentPath);
                        _.set(currentRow, [i18n.t(ROWS.STATUS)], CalculationStore.getVisibleStatusValue(bundledCurrentLevelRow.status));
                        _.set(currentRow, [i18n.t(ROWS.PROFESSION)], bundledCurrentLevelRow.profession);
                        _.set(currentRow, [i18n.t(ROWS.PHASE)], bundledCurrentLevelRow.phase);
                        _.set(currentRow, [i18n.t(ROWS.SEGMENT)], bundledCurrentLevelRow.segment);
                        _.set(currentRow, [i18n.t(ROWS.ACTION)], bundledCurrentLevelRow.action);
                        _.set(currentRow, [i18n.t(ROWS.MATERIAL)], bundledCurrentLevelRow.material);
                        _.set(currentRow, [i18n.t(ROWS.UNIT)], bundledCurrentLevelRow.unit);
                        _.set(currentRow, [i18n.t(ROWS.UNIT_TIME)], bundledCurrentLevelRow.unitTime);
                        _.set(currentRow, [i18n.t(ROWS.AMOUNT)], this.translateValue(bundledCurrentLevelRow.amount, bundledCurrentLevelRow.unit, true));
                        _.set(currentRow, [i18n.t(ROWS.UNIT_PRICE)], this.translateValue(bundledCurrentLevelRow.pricePerUnit, bundledCurrentLevelRow.unit));
                        _.set(currentRow, [i18n.t(ROWS.TOTAL_PRICE)], this.translateValue(bundledCurrentLevelRow.totalPrice, bundledCurrentLevelRow.unit));
                        _.set(currentRow, [i18n.t(ROWS.TOTAL_TIME)], bundledCurrentLevelRow.totalTime);
                        _.set(currentRow, [i18n.t(ROWS.CURRENCY)], ProjectsStore.getProjectCurrency(ProjectsStore.getActiveProjectId()));
                        _.set(currentRow, [i18n.t(ROWS.OBJECTS)], this.getAffectedObjects(bundledCurrentLevelRow));
                        calcRowsToReturn.push(currentRow);
                    });
                }
            });
            return this.initFolderData(calcRowsToReturn);
        } catch (error) {
            console.log("Error | getFolderCalculationExportList: " + error);
        }
    }

    getBidconExportList() {
        const calcRowsToReturn = [];
        let index = 0;

        try {
            _.forEach(TreeStoreV2.getFolderMapping(), (folderMap) => {
                let currentLevelRows = [];
                const children = _.find(folderMap.parentChildrens, (children) => children.data.type !== ANNOT_TYPES.GROUP);

                if (children) {
                    let parentData;
                    _.forEach(folderMap.parentChildrens, (parentChildren) => {
                        if (parentChildren.data.type !== ANNOT_TYPES.GROUP) {
                            const currentparentChildrenRows = _.values(JSON.parse(JSON.stringify(parentChildren.data.rows)));
                            currentLevelRows = _.concat(currentLevelRows, currentparentChildrenRows);
                            parentData = parentChildren?.parent?.data;
                        }
                    });

                    const bundledCurrentLevelRows = ObjectsStore.bundlingRows(currentLevelRows);

                    _.forEach(bundledCurrentLevelRows, (bundledCurrentLevelRow) => {
                        const currentRow = {};
                        _.set(currentRow, [i18n.t(ROWS.ID)], ++index);
                        _.set(currentRow, [i18n.t(ANNOTS.NUMBER)], parentData?.number.replace(/-+/g, "−"));
                        _.set(currentRow, [i18n.t(ANNOTS.NAME)], parentData?.name.replace(/-+/g, "−"));
                        _.set(currentRow, [i18n.t(ROWS.STATUS)], CalculationStore.getVisibleStatusValue(bundledCurrentLevelRow.status));
                        _.set(currentRow, [i18n.t(ROWS.PROFESSION)], bundledCurrentLevelRow.profession);
                        _.set(currentRow, [i18n.t(ROWS.PHASE)], bundledCurrentLevelRow.phase);
                        _.set(currentRow, [i18n.t(ROWS.SEGMENT)], bundledCurrentLevelRow.segment);
                        _.set(currentRow, [i18n.t(ROWS.ACTION)], bundledCurrentLevelRow.action);
                        _.set(currentRow, [i18n.t(ROWS.MATERIAL)], bundledCurrentLevelRow.material);
                        _.set(currentRow, [i18n.t(ROWS.UNIT)], bundledCurrentLevelRow.unit);
                        _.set(currentRow, [i18n.t(ROWS.UNIT_TIME)], bundledCurrentLevelRow.unitTime);
                        _.set(currentRow, [i18n.t(ROWS.AMOUNT)], this.translateValue(bundledCurrentLevelRow.amount, bundledCurrentLevelRow.unit, true));
                        _.set(currentRow, [i18n.t(ROWS.UNIT_PRICE)], this.translateValue(bundledCurrentLevelRow.pricePerUnit, bundledCurrentLevelRow.unit));
                        _.set(currentRow, [i18n.t(ROWS.TOTAL_PRICE)], this.translateValue(bundledCurrentLevelRow.totalPrice, bundledCurrentLevelRow.unit));
                        _.set(currentRow, [i18n.t(ROWS.TOTAL_TIME)], bundledCurrentLevelRow.totalTime);
                        _.set(currentRow, [i18n.t(ROWS.CURRENCY)], ProjectsStore.getProjectCurrency(ProjectsStore.getActiveProjectId()));
                        _.set(currentRow, [i18n.t(ROWS.OBJECTS)], this.getAffectedObjects(bundledCurrentLevelRow));
                        calcRowsToReturn.push(currentRow);
                    });
                }
            });
            return calcRowsToReturn;
        } catch (error) {
            console.log("Error | getFolderCalculationExportList: " + error);
        }
    }

    getAffectedObjects(row) {
        return row.ids && row.ids.length > 1 ? _.uniq(row.ids).length : 1;
    }

    translateValue(value, unit, amount = false) {
        const cell = value;
        let cellTextValue = value;
        if (cell === "errorInFormula") {
            return i18n.t("translation:ESTIMATE.ANNOTATION_ROWS.ERROR_IN_FORMULA");
        }

        const settings = amount
            ? { maximumFractionDigits: 3, minimumFractionDigits: 3, useGrouping: false }
            : {
                  maximumFractionDigits: 2,
                  minimumFractionDigits: 2,
                  useGrouping: false,
              };

        if (typeof cell === "number") {
            switch (unit) {
                case "m":
                    if (ProjectsStore.getProjectUnitsByID(ProjectsStore.getActiveProjectId()) === "imperial") {
                        cellTextValue = toUS(cell, "ft");
                    } else {
                        cellTextValue = cell.toLocaleString(i18n.language, settings).replace(/\s+/g, "").replace(/−+/g, "-");
                    }
                    break;
                case "m2":
                    if (ProjectsStore.getProjectUnitsByID(ProjectsStore.getActiveProjectId()) === "imperial") {
                        cellTextValue = toUSsquared(cell, "sqft");
                    } else {
                        cellTextValue = cell.toLocaleString(i18n.language, settings).replace(/\s+/g, "").replace(/−+/g, "-");
                    }
                    break;
                case "m3":
                    if (ProjectsStore.getProjectUnitsByID(ProjectsStore.getActiveProjectId()) === "imperial") {
                        cellTextValue = toUSvolume(cell, "cuft");
                    } else {
                        cellTextValue = cell.toLocaleString(i18n.language, settings).replace(/\s+/g, "").replace(/−+/g, "-");
                    }
                    break;
                case "st":
                    cellTextValue = cell.toLocaleString(i18n.language, settings).replace(/\s+/g, "").replace(/−+/g, "-");
                    break;
                default:
                    cellTextValue = cell.toLocaleString(i18n.language, settings).replace(/\s+/g, "").replace(/−+/g, "-");
            }
        } else {
            const cellNaN = Number.parseFloat(cellTextValue);
            if (!Number.isNaN(cellNaN)) {
                switch (unit) {
                    case "m":
                        if (ProjectsStore.getProjectUnitsByID(ProjectsStore.getActiveProjectId()) === "imperial") {
                            cellTextValue = toUS(cellNaN, "ft");
                        } else {
                            cellTextValue = cellNaN.toLocaleString(i18n.language, settings).replace(/\s+/g, "").replace(/−+/g, "-");
                        }
                        break;
                    case "m2":
                        if (ProjectsStore.getProjectUnitsByID(ProjectsStore.getActiveProjectId()) === "imperial") {
                            cellTextValue = toUSsquared(cellNaN, "sqft");
                        } else {
                            cellTextValue = cellNaN.toLocaleString(i18n.language, settings).replace(/\s+/g, "").replace(/−+/g, "-");
                        }
                        break;
                    case "m3":
                        if (ProjectsStore.getProjectUnitsByID(ProjectsStore.getActiveProjectId()) === "imperial") {
                            cellTextValue = toUSvolume(cellNaN, "cuft");
                        } else {
                            cellTextValue = cellNaN.toLocaleString(i18n.language, settings).replace(/\s+/g, "").replace(/−+/g, "-");
                        }
                        break;
                    case "st":
                        cellTextValue = cellNaN.toLocaleString(i18n.language, settings).replace(/\s+/g, "").replace(/−+/g, "-");
                        break;
                    default:
                        cellTextValue = cellNaN.toLocaleString(i18n.language, settings).replace(/\s+/g, "").replace(/−+/g, "-");
                }
            }
        }
        return cellTextValue;
    }
}
