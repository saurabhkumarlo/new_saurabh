import AnnotationStore from "../stores/AnnotationStore";
import { areBothScalesSet } from "./scaleUtilMethods";
import { ANNOT_TYPES } from "constants/AnnotationConstants";

class AnnotationDeleteHandler {
    deleteAnnotations(selectedAnnotations) {
        let annotationsToRemove = [];
        let scalesToRemove = [];

        selectedAnnotations.forEach((annot) => {
            if (annot.type === ANNOT_TYPES.X_SCALE || annot.type === ANNOT_TYPES.Y_SCALE) {
                scalesToRemove.push(annot);
            } else {
                annotationsToRemove.push(annot);
            }
        });
        if (scalesToRemove.length) {
            const currentAnnotation = selectedAnnotations[0];
            if (
                (areBothScalesSet(AnnotationStore.getActivePageId()) && currentAnnotation.type !== "x-scale") ||
                !areBothScalesSet(AnnotationStore.getActivePageId())
            ) {
                AnnotationStore.onRequestScaleDelete(scalesToRemove);
            }
        }
        if (annotationsToRemove.length) AnnotationStore.onRequestAnnotationDelete(annotationsToRemove);
    }
}

export default AnnotationDeleteHandler;
