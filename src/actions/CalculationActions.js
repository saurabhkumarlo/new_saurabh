import { createActions } from "reflux";

export default createActions([
    "messageReceived",
    "requestDeleteRowsForFeature",
    "requestDeleteRow",
    "requestCreateRow",
    "requestUpdateRow",
    "requestDeleteSelectedRows",
    "updateRowTemplate",
]);
