import { createStore } from "reflux";
import { Manager } from "socket.io-client";
import AuthenticationStore from "./AuthenticationStore";
import { AnnotationStore, ProjectsStore } from "stores";
import { GROUP_NAME, PROJECT_ACTION_NAME, SOCKET_EVENT_TYPE } from "constants/NodeActionsConstants";
import CalculationStore from "./CalculationStore";
import EstimateStore from "./EstimateStore";
import ScaleStore from "./ScaleStore";
import { AuthenticationActions } from "actions";
import FileStore from "./FileStore";

export default createStore({
    init() {
        this.socket = null;
        this.Manager = null;
    },

    getSocketStatus() {
        if (!this.socket) return false;
        return this.socket.connected;
    },

    onInitSocket() {
        if (!this.socket || !this.Manager) {
            this.Manager = new Manager(`${process.env.REACT_APP_NODE_URL}`, {
                reconnectionDelay: process.env.REACT_APP_NODE_SOCKET_RECONNECTION_DELAY,
                reconnectionDelayMax: process.env.REACT_APP_NODE_SOCKET_RECONNECTION_DELAY_MAX,
                closeOnBeforeunload: false,
            });
            this.socket = this.Manager.socket("/", {
                auth: {
                    token: AuthenticationStore.getJwt(),
                },
            });
            this.socket.on(SOCKET_EVENT_TYPE.CONNECT, () => {
                console.log(`Connected to socket. Connection id: ${this.socket.id}`);
                AuthenticationActions.messageReceived(200);
            });
            this.socket.on(SOCKET_EVENT_TYPE.RECONNECT, () => console.log("Reconnecting.."));
            this.socket.on(SOCKET_EVENT_TYPE.DISCONNECT, () => console.log("Socket disconnected"));
            this.socket.on(SOCKET_EVENT_TYPE.RECONNECT_ERR, (error) => console.log("Reconect error", error));
            this.socket.on(SOCKET_EVENT_TYPE.ERROR, (res) => console.log(res));
            this.socket.on(SOCKET_EVENT_TYPE.BUNDLE_REFRESH, () => AuthenticationStore.setIsNewAppVersion(true));

            this.socket.on(GROUP_NAME.GEO_PROJECT, (res) => ProjectsStore.onGeoProjectMessageHandler(res));
            this.socket.on(GROUP_NAME.GEO_FILE, (res) => FileStore.onGeoFileMessageHandler(res));
            this.socket.on(GROUP_NAME.GEO_ANNOTATION, (res) => AnnotationStore.onGeoAnnotationMessageHandler(res));
            this.socket.on(GROUP_NAME.GEO_ANNOTATION_ROW, (res) => CalculationStore.onGeoAnnotationRowMessageHandler(res));
            this.socket.on(GROUP_NAME.GEO_ESTIMATE, (res) => EstimateStore.onGeoEstimateMessageHandler(res));
            this.socket.on(GROUP_NAME.GEO_SCALE, (res) => ScaleStore.onGeoScaleMessageHandler(res));
            this.socket.on(GROUP_NAME.GEO_ROW_LIBRARY, (res) => CalculationStore.onGeoRowLibraryMessageHandler(res));
            this.socket.on(GROUP_NAME.AUTH, (res) => AuthenticationStore.onAuthMessageHandler(res));
        }
    },

    onSendMessage(event, message) {
        try {
            if (this.socket?.connected) this.socket.emit(event, message);
        } catch (err) {
            console.log(err);
        }
    },
    onSetActiveProjectId(id) {
        this.onSendMessage(GROUP_NAME.GEO_PROJECT, { action: PROJECT_ACTION_NAME.OPEN, geoProjectId: id });
    },
    closeSocket() {
        if (this.socket && this.socket.connected) this.socket.disconnect();
        this.socket = null;
        this.Manager = null;
    },
});
