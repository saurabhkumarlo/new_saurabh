import { createActions } from "reflux";

const SocketV2Actions = createActions(["initSocket", "sendMessage", "closeSocket"]);

export default SocketV2Actions;
