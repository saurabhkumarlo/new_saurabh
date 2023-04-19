import { HEADLINES, ObjectsExportsOptions } from "../constants";
import { all, create } from "mathjs";

import AbstractExportDispatcher from "./AbstractExportDispatcher";
import AnnotationExportFactory from "./AnnotationExportFactory";
import AnnotationExportFieldsFactory from "./AnnotionExportFieldsFactory";
import AnnotationStore from "../stores/AnnotationStore";
import { CalculationStore } from "../stores";
import Immutable from "immutable";
import ProjectsStore from "../stores/ProjectsStore";

const config = {
    epsilon: 1e-12,
    matrix: "Matrix",
    number: "number",
    precision: 64,
    predictable: false,
    randomSeed: null,
};
const math = create(all, config);

export default class AnnotationExportDispatcher extends AbstractExportDispatcher {
    constructor() {
        super();
    }

    dispatch(exportType) {
        const exportFactory = new AnnotationExportFactory();
        const exportFieldsFactory = new AnnotationExportFieldsFactory();
        let headlineData = undefined;
        let data = new Immutable.List();
        let fields = new Immutable.List();
        switch (exportType) {
            case ObjectsExportsOptions.Objects_Selection:
                data = exportFactory.getFlattenedAnnotationExportList(
                    AnnotationStore.getSelectedAnnotations().map((annotRep) => annotRep.get("storeAnnotation")),
                    AnnotationStore.getSortedFolderPaths(true)
                );
                headlineData = this.getProjectExportHeadlineToClipboard(HEADLINES[exportType]);
                fields = exportFieldsFactory.getAnnotationFullExportFields(exportFactory.getPathLength());
                break;
            case ObjectsExportsOptions.Objects_Net_Selection:
                data = exportFactory.getFlattenedAnnotationExportList(
                    AnnotationStore.getSelectedAnnotations().map((annotRep) => annotRep.get("storeAnnotation")),
                    AnnotationStore.getSortedFolderPaths(true)
                );
                headlineData = this.getProjectExportHeadlineToClipboard(HEADLINES[exportType]);
                fields = exportFieldsFactory.getAnnotationNetOnlyExportFields(exportFactory.getPathLength());
                break;
            case ObjectsExportsOptions.Objects_No_Folder_Net_Selection:
                data = exportFactory.getFlattenedAnnotationExportList(
                    AnnotationStore.getSelectedAnnotations().map((annotRep) => annotRep.get("storeAnnotation")),
                    AnnotationStore.getSortedFolderPaths(true)
                );
                headlineData = this.getProjectExportHeadlineToClipboard(HEADLINES[exportType]);
                fields = exportFieldsFactory.getAnnotationNetOnlyNoPathExportFields();
                break;
            case ObjectsExportsOptions.Folder_Export_Everything:
                try {
                    data = exportFactory.getFolderExport(
                        AnnotationStore.getSelectedAnnotations().map((annotRep) => annotRep.get("storeAnnotation")),
                        AnnotationStore.getSortedFolderPaths(true)
                    );
                    headlineData = this.getProjectExportHeadlineToClipboard(HEADLINES[exportType]);
                    fields = exportFieldsFactory.getFolderFullExportFields(exportFactory.getPathLength());
                } catch (error) {
                    console.log("Error | Folder Export: " + error);
                }
                break;
            default:
                console.log("Export did not handle case for annotation: " + exportType);
        }
        data = this.applyTranslation(
            data.map((value) => {
                return value.map((x, k) => {
                    if (ProjectsStore.getProjectUnitsByID(AnnotationStore.getProjectIdFromEstimateId(value.getIn(["geoEstimate", "id"]))) === "imperial") {
                        switch (k) {
                            case "area":
                            case "totalReduction":
                            case "netArea":
                            case "wall":
                                return CalculationStore.formatAmountValue(math.unit(x, "m2").to("sqft").toNumeric(), false);
                            case "volume":
                                return CalculationStore.formatAmountValue(math.unit(x, "m3").to("cuft").toNumeric(), false);
                            case "totalLength":
                            case "radiusX":
                            case "radiusY":
                            case "diameterX":
                            case "diameterY":
                            case "circumference":
                            case "height":
                                return CalculationStore.formatNumberValue(math.unit(x, "m").to("ft").toNumeric(), false);
                            default:
                                return typeof x === "number" ? CalculationStore.formatAmountValue(x, false) : x;
                        }
                    } else {
                        switch (k) {
                            case "ID":
                            case "id":
                            case "pages":
                            case "pageNumber":
                            case "strokeSize":
                            case "fontSize":
                            case "geometraBorderOpacity":
                            case "geometraOpacity":
                            case "quantity":
                            case "rotation":
                            case "pointSize":
                            case "ESTIMATE.ANNOTATION_VALUES.POINTS":
                            case "ESTIMATE.ANNOTATION_PROPERTIES.COUNT":
                                return x;
                            case "height":
                            case "ESTIMATE.ANNOTATION_PROPERTIES.HEIGHT":
                                return CalculationStore.formatNumberValue(x, false);
                            default:
                                return typeof x === "number" ? CalculationStore.formatAmountValue(x, false) : x;
                        }
                    }
                });
            })
        );
        data = this.initFolderData(data);
        let dataWrapper = new Immutable.Map();
        dataWrapper = dataWrapper.set("fields", fields).set("data", data).set("headlineData", headlineData);
        return dataWrapper;
    }
}
