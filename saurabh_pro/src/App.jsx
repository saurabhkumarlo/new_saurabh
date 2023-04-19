import "flag-icon-css/css/flag-icons.min.css";

import { ForgotPassword, LoginCards, NewPassword, SignUpCard, TermsOfService } from "./login";
import { Redirect, Route, BrowserRouter as Router, Switch } from "react-router-dom";

import { AuthenticationStore } from "stores";
import Calculate from "./calculate/calculate/Calculate";
import Drive from "./drive/Drive";
import LanguageModal from "components/LanguageModal";
import { Modal } from "antd";
import Overview from "./overview/Overview";
import Projects from "./projects/Projects";
import React from "react";
import { withTranslation } from "react-i18next";

class App extends React.PureComponent {
    state = {
        isSelectLanguageDialogOpen: false,
        isSetNewAppVersionDialogOpened: false,
    };

    componentDidMount() {
        if (window.location.protocol === "http:" && !process.env.REACT_APP_IS_LOCAL_ENVIROMENT) {
            const newHref = window.location.href.replace(/^http:\/\//i, "https://");
            window.location.href = newHref;
        } else if (!localStorage.getItem("language")) {
            this.setState({ isSelectLanguageDialogOpen: true });
        }
        this.unsubscribeAuthenticationStore = AuthenticationStore.listen(this.authenticationStoreUpdated);
    }

    componentWillUnmount() {
        this.unsubscribeAuthenticationStore();
    }

    authenticationStoreUpdated = (message) => {
        switch (message) {
            case "setNewAppVersion":
                this.setState({ isSetNewAppVersionDialogOpened: true });
                break;
            default:
                break;
        }
    };

    onLanguageModalClose = () => this.setState({ isSelectLanguageDialogOpen: false });
    onNewAppVersionModalClose = () => this.setState({ isSetNewAppVersionDialogOpened: false });
    onAcceptNewVersion = () => {
        caches.keys().then((names) => {
            names.forEach((name) => {
                caches.delete(name);
            });
            window.location.reload(true);
        });
    };

    render() {
        const { t } = this.props;
        return (
            <>
                <LanguageModal isOpen={this.state.isSelectLanguageDialogOpen} onClose={this.onLanguageModalClose} />
                <Modal
                    visible={this.state.isSetNewAppVersionDialogOpened}
                    title={t("GENERAL.NEW_VERSION_OF_APP")}
                    onCancel={this.onNewAppVersionModalClose}
                    onOk={this.onAcceptNewVersion}
                >
                    <p>{t("GENERAL.APPLY_NEW_APP_VERSION")}</p>
                </Modal>
                <Router>
                    <Switch>
                        <Route exact path="/login">
                            <LoginCards />
                        </Route>
                        <Route exact path="/termsOfService">
                            <TermsOfService />
                        </Route>
                        <Route exact path="/forgot-password/:eMail/:action">
                            <ForgotPassword />
                        </Route>
                        <Route exact path="/set-password/:token/:eMail">
                            <NewPassword />
                        </Route>
                        <Route exact path="/signup">
                            <SignUpCard />
                        </Route>
                        <Route exact path="/projects">
                            <Projects />
                        </Route>
                        <Route exact path="/projects/:projectId/overview">
                            <Overview />
                        </Route>
                        <Route exact path="/projects/:projectId/drive">
                            <Drive />
                        </Route>
                        <Route exact path="/projects/:projectId/calculate/:fileId">
                            <Calculate />
                        </Route>
                        <Redirect from="*" to="/login" />
                    </Switch>
                </Router>
            </>
        );
    }
}

export default withTranslation()(App);
