import { createActions } from "reflux";

const EstimateActions = createActions(["setEstimates", "setAnnotations", "addEstimate", "deleteEstimate", "editEstimate", "copyEstimate", "lockEstimate"]);

export default EstimateActions;
