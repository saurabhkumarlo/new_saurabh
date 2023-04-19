import "./terms-of-service.less";

import { AUTH_ACTION_NAME, GROUP_NAME } from "constants/NodeActionsConstants";
import { AuthenticationStore, NodeSocketStore } from "../../stores";

import { Button } from "antd";
import { LoginWrapper } from "../../components";
import React from "react";
import Reflux from "reflux";
import marked from "marked";
import { withRouter } from "react-router";
import { withTranslation } from "react-i18next";
import { Redirect } from "react-router-dom";

class TermsOfService extends Reflux.PureComponent {
    state = {
        markdown: "",
    };

    componentDidMount() {
        const readmePath = require("./Terms_Of_Service.md");

        fetch(readmePath)
            .then((response) => {
                return response.text();
            })
            .then((text) => {
                this.setState({
                    markdown: marked(text),
                });
            });
        this.unsubscribeAuthenticationStore = AuthenticationStore.listen(this.authenticationStoreUpdated);
    }

    componentWillUnmount() {
        this.unsubscribeAuthenticationStore();
    }

    acceptTerms = () => {
        NodeSocketStore.onSendMessage(GROUP_NAME.AUTH, { action: AUTH_ACTION_NAME.ACCEPT_TERMS_OF_SERVICE });
    };

    authenticationStoreUpdated = (message) => {
        if (message === "updateTermsOfService") {
            this.props.history.push("/projects");
        }
    };

    declineTerms = () => {
        this.props.history.push("/");
        AuthenticationStore.onLogout();
    };

    render() {
        const { t } = this.props;
        const { markdown } = this.state;

        return AuthenticationStore.getTermsOfSerive() ? (
            <Redirect to="/projects" />
        ) : (
            <LoginWrapper cardTitle={t("GENERAL.TERMS_OF_SERVICE")} horizontalTitle>
                <div className="TermsOfService_Card_File_Container">
                    <article className="TermsOfService_Card_Article" dangerouslySetInnerHTML={{ __html: markdown }}></article>
                </div>
                <div className="TermsOfService_Card_Button_Wrapper">
                    <Button className="TermsOfService_Card_Button TermsOfService_Card_Button_Default" type="default" onClick={this.declineTerms}>
                        {t("GENERAL.DECLINE")}
                    </Button>
                    <Button className="TermsOfService_Card_Button" type="primary" onClick={this.acceptTerms}>
                        {t("GENERAL.ACCEPT")}
                    </Button>
                </div>
            </LoginWrapper>
        );
    }
}

export default withTranslation()(withRouter(TermsOfService));
