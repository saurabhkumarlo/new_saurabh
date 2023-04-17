import { SCALE_LENGTH, X_SCALE_NAME, Y_SCALE_NAME } from "../constants/ScaleConstants";
import ProjectsStore from "../stores/ProjectsStore";
import ScaleStore from "../stores/ScaleStore";
import { AnnotationStore, ObjectsStore } from "stores";
import Immutable from "immutable";
import numeral from "numeral";
import { isNumber } from "lodash";
import { ANNOT_TYPES } from "constants/AnnotationConstants";

export const getScalesFromAnnotationStore = (activePage) => {
    if (!activePage || activePage == -1) return { xScale: null, yScale: null };
    const geoEstimateId = AnnotationStore.getActiveEstimate() === -1 ? null : AnnotationStore.getActiveEstimate().get("id");
    const geoFileId = AnnotationStore.getActiveFileId();
    const xScale = ObjectsStore.getScaleByPDFTronAnnot({ geoEstimateId, geoFileId, annotationType: ANNOT_TYPES.X_SCALE, pageNumber: activePage });
    const yScale = ObjectsStore.getScaleByPDFTronAnnot({ geoEstimateId, geoFileId, annotationType: ANNOT_TYPES.Y_SCALE, pageNumber: activePage });

    return { xScale: Immutable.fromJS(xScale), yScale: Immutable.fromJS(yScale) };
};

export const getCurrentlySelectedScale = () => ScaleStore.getSelection();

export const areBothScalesSet = (activePage) => {
    const { xScale, yScale } = getScalesFromAnnotationStore(activePage);
    if (xScale && yScale) {
        return xScale.size > 0 && yScale.size > 0;
    }
    return false;
};

const translateImperial = (value) => {
    return isNumber(numeral(Number(value)).value()) ? numeral(Number(value)).value() : null;
};

export const saveScale = (selectedScale, scaleValue) => {
    if (scaleValue === selectedScale[SCALE_LENGTH]) return;
    if (ProjectsStore.getProjectUnitsByID() === "imperial") {
        if (selectedScale[SCALE_LENGTH] === translateImperial(scaleValue)) return;
        AnnotationStore.onRequestScaleUpdate2({ id: selectedScale.id, value: String(translateImperial(scaleValue)), parameter: "length" });
    }
    if (ProjectsStore.getProjectUnitsByID() !== "imperial") {
        AnnotationStore.onRequestScaleUpdate2({ id: selectedScale.id, value: String(scaleValue), parameter: "length" });
    }
};
