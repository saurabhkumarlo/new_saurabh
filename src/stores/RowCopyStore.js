import { createStore } from "reflux";
import Immutable from "immutable";
import AnnotationStore from "./AnnotationStore";
import CalculationStore from "./CalculationStore";
import CalculateActions from "../actions/CalculationActions";
import _, { map, uniqBy } from "lodash";
import { ANNOT_TYPES } from "constants/AnnotationConstants";

export default createStore({
    init() {
        this.copiedRows = [];
    },

    getCopyAnnotationRows() {
        return this.copiedRows;
    },

    copySelectedRows(selectedRows) {
        this.copiedRows = selectedRows;
    },

    copyAnnotationRows(selectedAnnotations) {
        this.copiedRows = [];
        _.forEach(selectedAnnotations, (annot) => {
            const rows = _.values(annot.rows);
            this.copiedRows = _.concat(this.copiedRows, rows);
        });
    },

    pasteAnnotationRows(selectedAnnotations) {
        const annotsToPasteRows = _.filter(selectedAnnotations, (annot) => annot.type !== ANNOT_TYPES.GROUP);

        if (this.copiedRows.length) {
            const annotsToPasteRowsIds = _.map(annotsToPasteRows, (annot) => annot.id);
            const rowsToPasteIds = this.copiedRows.map((row) => row.id);
            if (annotsToPasteRowsIds.length > 0) CalculationStore.onRequestPasteRows(annotsToPasteRowsIds, rowsToPasteIds);
        }
    },

    replaceSelectedRows(selectedAnnotations, selectedRows) {
        if (this.copiedRows.length) {
            const rowsToInsert = [];
            const annotIds = _.map(
                _.filter(selectedAnnotations, (annot) => annot.type !== ANNOT_TYPES.GROUP),
                (annot) => annot.id
            );
            _.forEach(annotIds, (annotId) => {
                this.copiedRows.forEach((row) => {
                    row.geoAnnotation = { id: annotId };
                    rowsToInsert.push(row);
                });
            });

            if (rowsToInsert.length > 0) {
                CalculationStore.onRequestDeleteSelectedRows(selectedRows);
                CalculateActions.requestCreateRow({ annotationIds: annotIds, newRows: rowsToInsert });
            }
        }
    },

    replaceAnnotationRows(selectedAnnotations) {
        if (this.copiedRows.size) {
            let rowsToInsert = new Immutable.List();
            const annotations = this.getAnnotationsToUpdate(selectedAnnotations, true);
            annotations.forEach((annot) => {
                this.copiedRows.forEach((row) => {
                    row = row.set("geoAnnotation", Immutable.fromJS({ id: annot.id }));
                    row = row.set("annotationRow", JSON.stringify(row.get("annotationRow")));
                    rowsToInsert = rowsToInsert.push(row);
                });
            });
            if (rowsToInsert.size > 0) {
                const newRows = map(this.copiedRows.toJS(), (o) => ({ ...o, annotationRow: JSON.stringify(o.annotationRow) }));
                CalculationStore.onRequestDeleteRowsForAnnotations(Immutable.fromJS(annotations));
                CalculateActions.requestCreateRow({ annotationIds: map(annotations, (o) => o.id), newRows });
            }
        }
    },

    getAllAnnotationRows(selectedAnnotations) {
        let rowsArray = [];

        const annotations = this.getAnnotationsToUpdate(selectedAnnotations, true);
        annotations.forEach((annot) => {
            const rows = CalculationStore.getAllRowsForAnnotation(Immutable.fromJS(annot)).toJS();
            rows.forEach((row) => rowsArray.push(row));
        });

        return rowsArray;
    },

    getAnnotationsToUpdate(selectedAnnotations, withoutDuplicates = false) {
        let annotationsToUpdate = new Immutable.List();
        selectedAnnotations.forEach((annot) => {
            if (annot.get("type") === "group") {
                const children = AnnotationStore.getAllAnnotationsFromParent(annot.get("id")).filter((_annot) => {
                    return _annot.get("type") !== "group";
                });
                annotationsToUpdate = annotationsToUpdate.concat(children);
            } else {
                annotationsToUpdate = annotationsToUpdate.push(annot);
            }
        });
        if (withoutDuplicates) return uniqBy(annotationsToUpdate.toJS(), "id");
        return annotationsToUpdate;
    },
});
