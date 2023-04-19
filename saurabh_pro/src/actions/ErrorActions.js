import { createActions } from "reflux";

const ErrorActions = createActions(["error", "socketError", "errorReceived"]);

export default ErrorActions;
