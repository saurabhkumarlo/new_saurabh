import { createActions } from "reflux";

const AuthenticationActions = createActions(["login", "logout", "messageReceived", "loginWithStoredCredentials", "requestNewPassword", "setUserData"]);

export default AuthenticationActions;
