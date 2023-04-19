import AuthenticationActions from "../actions/AuthenticationActions";
import ErrorActions from "../actions/ErrorActions";
import Logger from "../utils/Logger.js";
import { createStore } from "reflux";
import { httpCodes } from "../constants/MessageConstants";

export default createStore({
    listenables: [ErrorActions],

    init() {},

    onErrorReceived(receivedError) {
        if (receivedError.payload && receivedError.payload.httpCode) {
            switch (receivedError.payload.httpCode) {
                case httpCodes.UN_AUTHORIZED:
                    this.trigger(httpCodes.UN_AUTHORIZED);
                    break;
                case httpCodes.PAYMENT_REQUIRED:
                    this.trigger(httpCodes.PAYMENT_REQUIRED);
                    break;
                case httpCodes.TOO_MANY_REQUESTS:
                    this.trigger(httpCodes.TOO_MANY_REQUESTS);
                    break;
                default:
                    Logger.d("Error | Store could not received message" + JSON.stringify(receivedError));
            }
        }
        if ((receivedError.action = "jwtParsing")) {
            this.trigger(httpCodes.jwtParsing);
            AuthenticationActions.logout();
        }
    },
    onSocketError(event) {
        switch (event.code) {
            case 1005:
                //No status code was actually present
                Logger.d("ErrorStore.onSocketError error code: " + 1005);
                Logger.d("ErrorStore.onSocketError error reason: " + event.reason);
                break;
            case 1001:
            //An endpoint is \"going away\", such as a server going down or a browser having navigated away from a page
            case 1002:
            //An endpoint is terminating the connection due to a protocol error
            case 1003:
            //An endpoint is terminating the connection because it has received a type of data it cannot accept (e.g., an endpoint that understands only text data MAY send this if it receives a binary message)
            case 1004:
            //Reserved. The specific meaning might be defined in the future.

            case 1006:
            //The connection was closed abnormally, e.g., without sending or receiving a Close control frame
            case 1007:
            //An endpoint is terminating the connection because it has received data within a message that was not consistent with the type of the message (e.g., non-UTF-8 [http://tools.ietf.org/html/rfc3629] data within a text message)
            case 1008:
            ////An endpoint is terminating the connection because it has received a message that \"violates its policy\". This reason is given either if there is no other sutible reason, or if there is a need to hide specific details about the policy.
            case 1009:
            //An endpoint is terminating the connection because it has received a message that is too big for it to process
            case 1010:
            //An endpoint (client) is terminating the connection because it has expected the server to negotiate one or more extension, but the server didn't return them in the response message of the WebSocket handshake. <br /> Specifically, the extensions that are needed are: " + event.reason;
            case 1011:
            //A server is terminating the connection because it encountered an unexpected condition that prevented it from fulfilling the request.
            case 1015:
                //The connection was closed due to a failure to perform a TLS handshake (e.g., the server certificate can't be verified)
                AuthenticationActions.logout();
                break;
            default:
                Logger.d("onSocketError default: " + event.reason);
                AuthenticationActions.logout();
        }
    },
    onError(event) {
        Logger.d("ErrorStore onError!!");
        if (event && event.reason) {
            console.log("ErrorStore onError reason: " + event.reason);
        }
    },
});
