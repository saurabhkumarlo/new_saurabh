import { createStore } from "reflux";

import AuthenticationStore from "./AuthenticationStore";
import { actions } from "../constants/MessageConstants";
import { SocketV2Actions, ErrorActions, MessageHandlerV2Actions } from "../actions";

export default createStore({
    listenables: [SocketV2Actions],

    init() {
        this.listenables = SocketV2Actions;
        this.socket = null;
    },

    onInitSocket(loginMessage) {
        if (this.socket === null) {
            try {
                this.socket = new window.WebSocket(`${process.env.REACT_APP_FILE_V2_SOCKET_URL}?Auth=${AuthenticationStore.getJwt()}`);
            } catch (e) {
                e.reason = "The server is unreachable at this time";
                e.code = 1005;
                ErrorActions.socketError(e);
            }
            this.socket.onclose = (event) => {
                AuthenticationStore.tryReconnectV2();
            };
            this.socket.onerror = (event) => {
                ErrorActions.error(event);
            };
            this.socket.onopen = (event) => {
                AuthenticationStore.resetNrConnectTriesV2();
                this.onSendMessage(loginMessage);
            };

            this.socket.onmessage = (data) => {
                try {
                    const message = JSON.parse(data.data);

                    switch (message.group) {
                        case "error":
                            ErrorActions.errorReceived(message);
                            break;
                        case actions.login:
                            MessageHandlerV2Actions.messageReceived(message);
                            break;
                        case actions.heartbeat:
                            break;
                        default:
                            MessageHandlerV2Actions.messageReceived(message);
                            break;
                    }
                } catch (e) {
                    ErrorActions.error(e);
                }
            };
        }
    },

    onSendMessage(message) {
        if (message)
            this.waitForConnection(() => {
                this.socket.send(JSON.stringify(message));
            }, 5000);
    },

    waitForConnection(callback, interval) {
        if (this.socket && this.socket.readyState === 1) {
            callback();
        } else {
            const that = this;
            that.onInitSocket();
            setTimeout(() => {
                that.waitForConnection(callback, interval);
            }, interval);
        }
    },

    getSocketReadyState() {
        if (this.socket) {
            return this.socket.readyState;
        }
        return 3;
    },

    onCloseSocket() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    },
});
