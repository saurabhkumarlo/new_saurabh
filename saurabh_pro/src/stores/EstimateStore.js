import { createStore } from "reflux";
import { get, groupBy, map, find, forEach, includes, findIndex, set } from "lodash";

import { EstimateActions, FileActions } from "../actions";
import AnnotationStore from "./AnnotationStore";
import { ESTIMATE_ACTION_NAME } from "constants/NodeActionsConstants";
import Immutable from "immutable";
import TreeStoreV2 from "./TreeStoreV2";

export default createStore({
    listenables: [EstimateActions],

    init() {
        this.estimates = [];
        this.annotations = [];
        this.activeEstimate = {};
        this.activeAnnotations = [];
    },

    getEstimates() {
        return this.estimates;
    },

    getAnnotations() {
        return this.annotations;
    },

    getActiveEstimate() {
        return this.activeEstimate;
    },

    getActiveAnnotations() {
        return this.activeAnnotations;
    },

    setActiveEstimate(estimate) {
        this.activeEstimate = estimate;
        localStorage.setItem("activeEstimate", JSON.stringify(estimate));
        this.trigger("updateActiveEstimate");
        window.location.reload();
    },

    setActiveAnnotations() {
        this.activeAnnotations = get(
            find(this.annotations, (o) => o.estimateId === AnnotationStore.getActiveEstimate().get("id")),
            "annotations"
        );
    },

    onSetEstimates(estimates) {
        this.annotations = [];
        this.estimates = estimates;
        for (const est of estimates) {
            const savedActiveEstimate = JSON.parse(localStorage.getItem("activeEstimate"));
            if (est.geoProjectId === get(savedActiveEstimate, "geoProjectId") && est.id === get(savedActiveEstimate, "id")) {
                this.activeEstimate = est;
                localStorage.setItem("activeEstimate", JSON.stringify(est));
                this.trigger("updateActiveEstimate");
                break;
            } else if (!savedActiveEstimate || get(savedActiveEstimate, "geoProjectId") !== est.geoProjectId) {
                this.activeEstimate = est;
                localStorage.setItem("activeEstimate", JSON.stringify(est));
                this.trigger("updateActiveEstimate");
            }
        }
        this.trigger("updateEstimates");
    },
    updateAnnotationsInDrive(annotations) {
        const parsedAnnots = annotations
            .toJS()
            .filter((obj) => obj.type !== "group")
            .map(({ type, xfdf, ...annotData }) => {
                return {
                    ...annotData,
                    type,
                    xfdf: type === "3DModel" ? JSON.stringify(xfdf) : xfdf,
                };
            });
        this.onSetAnnotations(parsedAnnots);
    },
    setAnnotationsFromJava(estimateArray) {
        forEach(estimateArray, (estimate) => {
            this.onSetAnnotations(estimate.theGeoAnnotationList);
            FileActions.incrementLoader(50 / estimateArray.length, null, true);
        });
    },
    onSetAnnotations(annotations) {
        const estimateId = get(annotations[0], "geoEstimate.id");
        if (annotations && estimateId) {
            const groupedAnnots = map(
                groupBy(annotations, (o) => get(o, "geoFile.id")),
                (p) => ({ fileId: get(p[0], "geoFile.id"), annotations: p })
            );

            const updatedEstimateObject = { estimateId, annotations: groupedAnnots };
            const index = this.annotations.findIndex((obj) => obj.estimateId === estimateId);
            if (index === -1) {
                this.annotations.push(updatedEstimateObject);
            } else {
                this.annotations[index] = updatedEstimateObject;
            }
            this.setActiveAnnotations();
            this.trigger("annotationsUpdated");
        }
    },

    onSetAnnotationsFromPDF(annotations) {
        const annotationsForGroup = annotations;
        const grouppedAnnots = groupBy(annotationsForGroup, (o) => o.geoFile.id);
        const mappedAnnots = map(grouppedAnnots, (p) => ({ fileId: p[0].geoFile.id, annotations: p }));
        const estimateAnnots = find(this.annotations, (annots) => annots.estimateId === annotations[0].geoEstimate.id);
        estimateAnnots.annotations.push(mappedAnnots[0]);
        this.setActiveAnnotations();
    },

    onAddEstimate({ estimate }) {
        this.estimates.push(estimate);

        this.trigger("updateEstimates");
    },

    onDeleteEstimate({ ids }) {
        this.estimates = this.estimates.filter((item) => !includes(ids, item.id));
        if (includes(ids, this.activeEstimate.id)) {
            this.activeEstimate = this.estimates[0];
            localStorage.setItem("activeEstimate", JSON.stringify(this.estimates[0]));
            this.trigger("updateActiveEstimate");
            window.location.reload();
        }

        this.trigger("updateEstimates");
    },

    onEditEstimate({ ids, parameter, value }) {
        forEach(ids, (id) => {
            const editEstimateId = findIndex(this.estimates, (obj) => obj.id == id);
            set(this.estimates[editEstimateId], parameter, value);

            const localActiveEstimate = JSON.parse(localStorage.getItem("activeEstimate"));
            if (localActiveEstimate.id === id) {
                localStorage.setItem("activeEstimate", JSON.stringify(this.estimates[editEstimateId]));
                this.activeEstimate = this.estimates[editEstimateId];

                if (parameter === "locked") {
                    const ActiveEstimate = AnnotationStore.ActiveEstimate.toJS();
                    AnnotationStore.ActiveEstimate = Immutable.fromJS({ ...ActiveEstimate, locked: value });
                    AnnotationStore.Annotations = Immutable.fromJS(AnnotationStore.parseAnnotations(AnnotationStore.Annotations.toJS()));
                    AnnotationStore.deSelectAllAnnotationsFromGui();
                    TreeStoreV2.clearSelectedAnnotations();
                    AnnotationStore.setToolMode("AnnotationEdit");
                }
            }
        });

        this.trigger("updateEstimates");
    },

    onCopyEstimate(estimate) {
        this.estimates.push(estimate);

        this.trigger("updateEstimates");
    },

    onGeoEstimateMessageHandler(response) {
        const { CREATE, DUPLICATE, DELETE, UPDATE } = ESTIMATE_ACTION_NAME;
        const { payload, action } = response;

        switch (action) {
            case CREATE:
                this.onAddEstimate(payload);
                break;
            case DELETE:
                this.onDeleteEstimate(payload);
                break;
            case DUPLICATE:
                this.onCopyEstimate(payload);
                break;
            case UPDATE:
                this.onEditEstimate(payload);
                break;
            default:
                return;
        }
    },
});
