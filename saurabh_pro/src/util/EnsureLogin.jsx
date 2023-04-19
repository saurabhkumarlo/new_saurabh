/**
 * Ensures the user is logged in before rendering a component,
 * If the user is not logged in, it redirects to the login page
 * @TODO Make this save the page the user was at before redirecting to login, then once redirected back, put user back at previous page.
 */

import AuthenticationActions from "../actions/AuthenticationActions";
import AuthenticationStore from "../stores/AuthenticationStore";
import React from "react";
import { NodeSocketStore } from "stores";
import { Redirect } from "react-router-dom";

const ensureLogin = (WrappedComponent) => {
    return class EnsureLogin extends React.PureComponent {
        state = {
            hasLoggedIn: AuthenticationStore.isLoggedIn(),
            acceptedTermsOfSerivce: AuthenticationStore.getTermsOfSerive(),
        };

        componentDidMount() {
            this.unsubscribeMessageReceived = AuthenticationActions.messageReceived.listen((statusCode) => {
                if (statusCode !== 200) return;

                if (this.state.acceptedTermsOfSerivce) {
                    this.setState({
                        hasLoggedIn: true,
                    });
                    if (!NodeSocketStore.getSocketStatus()) NodeSocketStore.onInitSocket();
                }
            });
        }

        componentWillUnmount() {
            this.unsubscribeMessageReceived();
        }

        render() {
            if (this.state.hasLoggedIn) {
                return <WrappedComponent {...this.props} />;
            } else {
                const credentials = localStorage.getItem("credentials");
                if (!credentials || !this.state.acceptedTermsOfSerivce) {
                    return <Redirect to="/" />;
                }

                AuthenticationActions.loginWithStoredCredentials();
                return null;
            }
        }
    };
};

export default ensureLogin;
