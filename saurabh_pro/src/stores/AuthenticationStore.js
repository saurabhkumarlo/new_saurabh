import AuthenticationActions from "../actions/AuthenticationActions";
import DepartmentActions from "../actions/DepartmentActions";
import Moment from "moment";
import ProjectsActions from "../actions/ProjectsActions";
import ProjectsStore from "./ProjectsStore";
import SocketV2Actions from "../actions/SocketV2Actions";
import SocketV2Store from "./SocketV2Store";
import { createStore } from "reflux";
import i18n from "../i18nextInitialized.js";
import jwt from "jwt-simple";
import { NodeSocketStore } from "stores";
import axios from "axios";
import { AUTH_ACTION_NAME } from "constants/NodeActionsConstants";
import TemplatesStore from "./TemplatesStore";

//---------------------------------------------
// TODO: change and maybe store some other place
const SECRET = "geometra3";

export default createStore({
    listenables: [AuthenticationActions],

    init() {
        this.credentials = {
            username: "",
            password: "",
            jwt: null,
            userId: -1,
            isLoggedIn: false,
            role: "",
        };
        this.nrReconnectTriesV2 = 0;
        this.activeProjectAtReconnect = undefined;
        this.activeProjectAtReconnectV2 = undefined;
        this.termsOfService = undefined;
        this.language = null;
        this.isNewAppVersion = false;
        this.isLogin = false;
        this.disconnectAnotherLogins = false;
    },

    setIsNewAppVersion(value) {
        this.isNewAppVersion = value;
        this.trigger("setNewAppVersion");
    },

    getIsNewAppVersion() {
        return this.isNewAppVersion;
    },

    setLanguage(language) {
        this.language = language;
        this.trigger("setLanguage");
    },

    getLanguage() {
        return this.language;
    },
    onAuthMessageHandler({ action, payload }) {
        const { LICENSE_ACTIVATED_FROM_ELSEWHERE, SESSION_EXPIRED, ACCEPT_TERMS_OF_SERVICE } = AUTH_ACTION_NAME;

        switch (action) {
            case LICENSE_ACTIVATED_FROM_ELSEWHERE:
                this.onLogout();
                alert(i18n.t("Your license has been activated from elsewhere. You will be logged out."));
                window.location.href = "/";
                break;
            case SESSION_EXPIRED:
                const { expired } = payload;
                if (expired) {
                    this.onLogout();
                    alert(i18n.t("Your session expired. You will be logged out."));
                    window.location.href = "/";
                }
                break;
            case ACCEPT_TERMS_OF_SERVICE:
                this.onAcceptTermsOfService();
                break;
            default:
                break;
        }
    },
    onSetUserData(termsOfService) {
        this.termsOfService = termsOfService;
        localStorage.setItem("acceptedTermsOfSerivce", termsOfService);
        this.trigger("setUserData");
    },
    onAcceptTermsOfService() {
        this.termsOfService = true;
        localStorage.setItem("acceptedTermsOfSerivce", true);
        this.trigger("updateTermsOfService");
    },
    getTermsOfSerive() {
        return localStorage.getItem("acceptedTermsOfSerivce") === "true" ? true : false;
    },
    getTermsOfSeriveData() {
        return this.termsOfService;
    },
    isLoggedIn() {
        return this.credentials.isLoggedIn;
    },
    getUser() {
        return this.credentials.username;
    },

    getUserId() {
        return this.credentials.userId;
    },
    getRole() {
        switch (this.credentials.role) {
            case "creator":
                return true;
            case "viewer":
                return false;
            default:
                return true;
        }
    },
    getJwt() {
        return this.credentials.jwt || localStorage.getItem("jwt");
    },

    async onLogin(username, password) {
        await this.postLogin({ username, password });
        this.disconnectAnotherLogins = true;
    },
    async onLoginWithStoredCredentials() {
        const storedUser = localStorage.getItem("credentials");
        if (storedUser && !this.isLogin) {
            this.isLogin = true;
            this.credentials = jwt.decode(storedUser, SECRET).credentials;
            await this.postLogin({ username: this.credentials.username, token: localStorage.getItem("jwt") });
            this.disconnectAnotherLogins = false;
        }
    },

    async postLogin({ username, password, token }) {
        await axios
            .post(`${process.env.REACT_APP_NODE_URL}/login`, { username, jwt: token, password })
            .then((response) => {
                const { role, userId, username, termsOfService } = response.data;

                this.credentials.username = username;
                this.credentials.jwt = response.data.jwt;
                this.credentials.userId = userId;
                this.credentials.role = role;
                localStorage.setItem("jwt", response.data.jwt);
                localStorage.setItem("credentials", jwt.encode({ credentials: { username, userId, date: new Moment().add(8, "h"), role } }, SECRET));
                this.credentials.isLoggedIn = true;
                this.onSetUserData(termsOfService);
                DepartmentActions.requestDepartmentUserAccess();
                TemplatesStore.onRequestTemplates();
                NodeSocketStore.onInitSocket();
                if (this.activeProjectAtReconnect) {
                    ProjectsStore.setActiveProjectId(this.activeProjectAtReconnect.get("id"));
                    ProjectsActions.requestOpenProject(this.activeProjectAtReconnect.get("id"));
                    this.activeProjectAtReconnect = undefined;
                }

                this.trigger(response.httpCode);
            })
            .catch((e) => {
                this.isLogin = false;
                if (e.response?.status) {
                    this.trigger(String(e.response.status));
                    if (e.response.status === 401 && window.location.pathname !== "/login") {
                        this.onLogout();
                        window.location.href = "/";
                    }
                }
            });
    },

    tryReconnectV2() {
        const self = this;
        if (!this.activeProjectAtReconnectV2) {
            this.activeProjectAtReconnectV2 = ProjectsStore.getActiveProject();
        }
        if (this.nrReconnectTriesV2 < 6 && SocketV2Store.getSocketReadyState() !== 1) {
            setTimeout(() => {
                self.nrReconnectTriesV2++;
                SocketV2Actions.closeSocket();
                SocketV2Actions.initSocket();
            }, 5000);
        } else {
            this.resetNrConnectTriesV2();
            this.onLogout();
            alert(i18n.t("Connection to servers lost."));
            window.location.reload(true);
        }
    },

    onLogout() {
        this.credentials = {
            username: "",
            userId: -1,
            date: null,
            role: "",
            isLoggedIn: false,
        };
        localStorage.removeItem("jwt");
        localStorage.removeItem("credentials");
        localStorage.removeItem("acceptedTermsOfSerivce");
        sessionStorage.clear();
        NodeSocketStore.closeSocket();
    },

    resetNrConnectTriesV2() {
        this.nrReconnectTriesV2 = 0;
    },

    isCompleteLoggedIn() {
        return localStorage.getItem("credentials") && localStorage.getItem("acceptedTermsOfSerivce") === "true" ? true : false;
    },
});
