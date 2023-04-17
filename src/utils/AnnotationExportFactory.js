import Immutable from "immutable";
import AnnotationStore from "./../stores/AnnotationStore";
import i18n from "./../i18nextInitialized";
import { ANNOTS } from "../constants";

export default class AnnotationExportFactory {
    constructor() {
        this.pathLength = -1;
    }

    getPathLength() {
        return this.pathLength;
    }

    getFolderExport(selected, sortedFolderPaths) {
        let id = 0;
        const calculatedFolders = sortedFolderPaths.map((folderPath) => {
            let folder = folderPath.get("folder");
            let children = AnnotationStore.getAnnotaionsInFolderFirstLevel(folderPath.getIn(["folder", "id"])).filter((annot) => annot.get("type") !== "group");
            children = children.map((annot) => {
                // return AnnotationStore.calculateValuesForAnnotation(annot, true);
            });
            let annotationData = AnnotationStore.sumValuesForMultipleAnnotations(children, "group");
            annotationData = annotationData.set(ANNOTS.COUNT, children.size);
            annotationData = annotationData.delete("ESTIMATE.ANNOTATION_PROPERTIES.COUNT");

            if (children.size > 0) {
                if (annotationData.has("ESTIMATE.ANNOTATION_VALUES.AREA")) {
                    annotationData = annotationData.set(ANNOTS.AREA, annotationData.get("ESTIMATE.ANNOTATION_VALUES.AREA"));
                    annotationData = annotationData.delete("ESTIMATE.ANNOTATION_VALUES.AREA");
                }
                if (annotationData.has("ESTIMATE.ANNOTATION_VALUES.LENGTH")) {
                    annotationData = annotationData.set(ANNOTS.LENGTH, annotationData.get("ESTIMATE.ANNOTATION_VALUES.LENGTH"));
                    annotationData = annotationData.delete("ESTIMATE.ANNOTATION_VALUES.LENGTH");
                }
                if (annotationData.has("ESTIMATE.ANNOTATION_VALUES.VOLUME")) {
                    annotationData = annotationData.set(ANNOTS.VOLUME, annotationData.get("ESTIMATE.ANNOTATION_VALUES.VOLUME"));
                    annotationData = annotationData.delete("ESTIMATE.ANNOTATION_VALUES.VOLUME");
                }
                if (annotationData.has("ESTIMATE.ANNOTATION_VALUES.WALL")) {
                    annotationData = annotationData.set(ANNOTS.WALL, annotationData.get("ESTIMATE.ANNOTATION_VALUES.WALL"));
                    annotationData = annotationData.delete("ESTIMATE.ANNOTATION_VALUES.WALL");
                }
            }

            Object.keys(annotationData.toJS()).forEach((attribute) => {
                if (attribute.includes("ESTIMATE.ANNOTATION_VALUES") || attribute.includes("ESTIMATE.ANNOTATION_PROPERTIES")) {
                    const name = attribute.split(".")[2];

                    if (ANNOTS[name]) {
                        annotationData = annotationData.set(ANNOTS[name], annotationData.get(attribute));
                        annotationData = annotationData.delete(attribute);
                    }
                }
            });

            folder = folder.set("annotationData", annotationData);
            folder = folder.setIn(["annotationData", "folder"], folderPath.get("title"));
            let length = folderPath.get("title").split(">").length;
            if (length === 2 && folderPath.get("title").split(">")[0] === "" && folderPath.get("title").split(">")[1] === "") {
                length = 1;
            }
            if (length > this.pathLength) {
                this.pathLength = length;
            }
            if (folder.has("geoEstimate")) {
                folder = folder.delete("geoEstimate");
            }
            folder = folder.set(ANNOTS.ID, ++id);
            return folder.flatten();
        });
        return calculatedFolders;
    }

    getFlattenedAnnotationExportList(selected, sortedFolderPaths) {
        let index = 1;
        let parsed = this.getAnnotationExportList(selected, sortedFolderPaths);
        parsed = parsed.map((annotation) => {
            if (annotation.has("geoEstimate")) {
                annotation = annotation.delete("geoEstimate");
            }
            annotation = annotation.set(ANNOTS.ID, index);
            annotation = this.initAnnotationForExport(annotation);
            index++;
            return annotation.flatten();
        });
        return parsed;
    }

    getAnnotationExportList(selected, sortedFolderPaths) {
        this.pathLength = -1;
        let parsed = new Immutable.List();
        try {
            let selectedAnnotations = selected;
            let reductionList = new Immutable.List();
            let valueAnnotations = new Immutable.List();

            selectedAnnotations.forEach((annot) => {
                if (annot.get("type") === "Reduction") {
                    // reductionList = reductionList.push(AnnotationStore.calculateValuesForAnnotation(annot, true));
                } else if (annot.get("type") !== "group") {
                    // valueAnnotations = valueAnnotations.push(AnnotationStore.calculateValuesForAnnotation(annot, true));
                }
                return annot;
            });
            sortedFolderPaths.forEach((pathContainer) => {
                let annotationsToAdd = new Immutable.List();
                valueAnnotations.forEach((annotation) => {
                    if (
                        pathContainer.getIn(["folder", "id"]) == annotation.get("parentId") &&
                        annotation.get("type") !== "PeripheralValue" &&
                        annotation.get("type") !== "CenterValue"
                    ) {
                        annotation = annotation.setIn(["annotationData", "folder"], pathContainer.get("title"));
                        let length = pathContainer.get("title").split(">").length;
                        if (length === 2 && pathContainer.get("title").split(">")[0] === "" && pathContainer.get("title").split(">")[1] === "") {
                            length = 1;
                        }
                        if (length > this.pathLength) {
                            this.pathLength = length;
                        }
                        annotationsToAdd = annotationsToAdd.push(annotation);
                        if (annotation.get("type") === "Polygon") {
                            reductionList = reductionList.filter((reduction) => {
                                if (reduction.get("parentId") === annotation.get("annotationId")) {
                                    reduction = reduction.setIn(["annotationData", "folder"], pathContainer.get("title"));
                                    annotationsToAdd = annotationsToAdd.push(reduction);
                                    return false;
                                }
                                return true;
                            });
                        }
                    }
                });
                // Check if any reductions were left for this level
                reductionList = reductionList.filter((reduction) => {
                    const parentAnnotation = AnnotationStore.getAnnotationByAnnotationId(reduction.get("parentId"));
                    if (parentAnnotation) {
                        if (parentAnnotation.get("parentId") == pathContainer.getIn(["folder", "id"])) {
                            reduction = reduction.setIn(["annotationData", "folder"], pathContainer.get("title"));
                            annotationsToAdd = annotationsToAdd.push(reduction);
                            return false;
                        }
                        return true;
                    }
                });
                parsed = parsed.concat(annotationsToAdd);
            });
        } catch (error) {
            console.log("Error | Export Factory: " + error);
        }
        return parsed;
    }

    initAnnotationForExport(annotation) {
        let annotationData = annotation.get("annotationData");
        const type = annotation.get("type");
        switch (type) {
            case "Ellipse":
                annotationData = annotationData.set(ANNOTS.TYPE, i18n.t("Circle"));
                break;
            case "annotation.freeHand":
            case "Free hand":
            case "Free Hand":
                annotationData = annotationData.set(ANNOTS.TYPE, i18n.t("Free Hand"));
                break;
            case "Reduction":
                const parentAnnotation = AnnotationStore.getAnnotationByAnnotationId(annotation.get("parentId"));
                if (parentAnnotation) {
                    annotationData = annotationData.set(
                        "ESTIMATE.ANNOTATION_PROPERTIES.REDUCTION_OF",
                        "(" + parentAnnotation.get("number") + ") " + parentAnnotation.get("name")
                    );
                }
                annotationData = annotationData.set(ANNOTS.TYPE, i18n.t("Reduction"));
                break;
            case "Polygon":
                annotationData = annotationData.set(ANNOTS.TYPE, i18n.t("Area"));
                break;
            case "Polyline":
                annotationData = annotationData.set(ANNOTS.TYPE, i18n.t("Line"));
                break;
            case "Point":
                annotationData = annotationData.set(ANNOTS.TYPE, i18n.t("Point"));
                if (annotation.has("height")) {
                    annotation = annotation.delete("height");
                }
                break;
            default:
                break;
        }

        Object.keys(annotationData.toJS()).forEach((attribute) => {
            if (attribute.includes("ESTIMATE.ANNOTATION_VALUES") || attribute.includes("ESTIMATE.ANNOTATION_PROPERTIES")) {
                const name = attribute.split(".")[2];
                if (ANNOTS[name]) {
                    annotationData = annotationData.set(ANNOTS[name], annotationData.get(attribute));
                    annotationData = annotationData.delete(attribute);
                }
            }
        });

        return annotation.set("annotationData", annotationData);
    }
}
