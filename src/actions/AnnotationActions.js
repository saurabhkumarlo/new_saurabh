import { createActions } from "reflux";

const AnnotationActions = createActions([
    "initializeEstimates",
    "requestAnnotationUpdate",
    "requestAnnotationCreate",
    "requestAnnotationDelete",
    "requestAnnotationFolderCreate",
    "messageReceived",
    "setActiveFileId",
    "setActivePageId",
    "setActiveParentId",
    "toggleDisplayValues",
    "toggleReductionShowValues",
    "toggleScaleDisplayValues",
    "triggerDeleteScale",
    "focusNameField",
]);

export default AnnotationActions;


// SaurabhKumarlog040@gmail.com
// saurabbh88@gmail.com