import { createStore } from "reflux";

import AnnotationStore from "./AnnotationStore";
import { SCALE_ACTION_NAME } from "constants/NodeActionsConstants";
import { X_SCALE_NAME, Y_SCALE_NAME } from "constants/ScaleConstants";
import ObjectsStore from "./ObjectsStore";

export default createStore({
    init() {
        this.lengthX = "";
        this.lengthY = "";
        this.selection = null;
    },

    getScale(type, page) {
        if (page) {
            const geoEstimateId = AnnotationStore.getActiveEstimate() === -1 ? null : AnnotationStore.getActiveEstimate().get("id");
            const geoFileId = AnnotationStore.getActiveFileId();
            const scale = ObjectsStore.getScaleByPDFTronAnnot({ geoEstimateId, geoFileId, annotationType: type, pageNumber: page });
            if (scale && type === X_SCALE_NAME) {
                this.lengthX = scale.length;
            }
            if (scale && type === Y_SCALE_NAME) {
                this.lengthY = scale.length;
            }
            return scale;
        }
        return null;
    },

    getSelection() {
        return this.selection;
    },

    getLength(type) {
        if (type === X_SCALE_NAME) {
            return this.lengthX;
        }
        if (type === Y_SCALE_NAME) {
            return this.lengthY;
        }
    },

    // setSelection(type) {
    //     this.selection = type;
    // },

    // selectScale(type) {
    //     if (type) {
    //         TreeStore.setTreeSelection([]);
    //         AnnotationStore.setScaleTypeMap(type);
    //     }
    //     this.setSelection(type);
    // },

    onGeoScaleMessageHandler({ action, payload }) {
        switch (action) {
            case SCALE_ACTION_NAME.CREATE:
                AnnotationStore.onScaleCreate(payload);
                break;
            case SCALE_ACTION_NAME.DELETE:
                AnnotationStore.onScaleDelete(payload);
                break;
            case SCALE_ACTION_NAME.UPDATE:
                AnnotationStore.onScaleUpdate(payload);
                break;
        }
    },
});
