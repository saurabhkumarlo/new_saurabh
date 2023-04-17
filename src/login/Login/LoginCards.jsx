import "./login-cards.less";

import { AuthenticationActions } from "../../actions";
import { AuthenticationStore, ErrorStore } from "../../stores";
import { Button, Form, Input } from "antd";
import { emailRegex, passwordRegex } from "../../utils/Validator";

import { LoginWrapper } from "../../components";
import React from "react";
import Reflux from "reflux";
import { httpCodes } from "../../constants/MessageConstants";
import { withRouter } from "react-router";
import { withTranslation } from "react-i18next";
import { Redirect } from "react-router-dom";

class LoginCards extends Reflux.PureComponent {
    constructor() {
        super();
        this.formRef = React.createRef();
        this.state = {
            wrongPassword: false,
            invalidLicense: false,
            tooManyLogins: false,
            loginFilled: false,
            username: "",
            password: "",
            switchCard: true,
        };
    }

    componentDidMount() {
        this.stores = [AuthenticationStore];

        this.unsubscribeAuthenticationStore = AuthenticationStore.listen(this.authenticationStoreUpdated);
        this.unsubscribeErrorStore = ErrorStore.listen(this.errorStoreUpdated);
    }

    componentWillUnmount() {
        this.unsubscribeAuthenticationStore();
        this.unsubscribeErrorStore();
    }

    errorStoreUpdated = (message) => {
        switch (message) {
            case httpCodes.UN_AUTHORIZED:
                this.setState({ wrongPassword: true });
                this.formRef.current.validateFields();
                break;
            case httpCodes.PAYMENT_REQUIRED:
                this.setState({ invalidLicense: true });
                this.formRef.current.validateFields();
                break;
            case httpCodes.TOO_MANY_REQUESTS:
                this.setState({ tooManyLogins: true });
                break;
            default:
                break;
        }
    };

    authenticationStoreUpdated = (message) => {
        switch (message) {
            case httpCodes.UN_AUTHORIZED:
            case httpCodes.NOT_FOUND:
                this.setState({ wrongPassword: true });
                this.formRef.current.validateFields();
                break;
            case httpCodes.PAYMENT_REQUIRED:
                this.setState({ invalidLicense: true });
                this.formRef.current.validateFields();
                break;
            case httpCodes.TOO_MANY_REQUESTS:
                this.setState({ tooManyLogins: true });
                break;
            case "setUserData":
                const termsOfService = AuthenticationStore.getTermsOfSeriveData();
                return termsOfService ? this.props.history.push("/projects") : this.props.history.push("/termsOfService");
            default:
                break;
        }
    };

    onLogin = () => {
        if (this.state.username && this.state.password) {
            try {
                AuthenticationActions.login(this.state.username.toLowerCase(), this.state.password);
            } catch (error) {
                console.error(error);
            }
        }
    };

    onKeyDown = (e) => {
        if (e.key === "Enter") {
            if (this.state.loginFilled) {
                this.onLogin();
            }
        }
    };

    handleChange = (e, name) => {
        this.setState({
            [name]: e.target.value,
        });
        this.setState({ [e.target.id]: e.target.value }, () => {
            if (this.state.username.length > 0 && this.state.password.length > 0) {
                this.setState({
                    loginFilled: true,
                });
            }
        });
        this.setState({ wrongPassword: false });
    };

    render() {
        const { t } = this.props;
        return AuthenticationStore.isCompleteLoggedIn() ? (
            <Redirect to="/projects" />
        ) : (
            <>
                <LoginWrapper cardTitle={t("GENERAL.LOGIN")}>
                    <div className="Login_Container">
                        <Form
                            name="login-form"
                            ref={this.formRef}
                            onFinish={this.onLogin}
                            /* onFinish={() => this.setState({ switchCard: false })} */ layout="vertical"
                        >
                            <Form.Item
                                label={t("GENERAL.EMAIL")}
                                name="username"
                                rules={[{ pattern: emailRegex, message: t("ERROR.ENTER_VALID_EMAIL") }]}
                                validateTrigger="onBlur"
                            >
                                <Input
                                    autoComplete="username"
                                    id="username"
                                    name="username"
                                    className="Input"
                                    value={this.state.username}
                                    onChange={(e) => this.handleChange(e, "username")}
                                    onKeyDown={this.onKeyDown}
                                />
                            </Form.Item>
                            <Form.Item
                                label={t("GENERAL.PASSWORD")}
                                name="password"
                                validateFirst
                                rules={[
                                    {
                                        pattern: passwordRegex,
                                        message: t("ERROR.ENTER_VALID_PASSWORD"),
                                    },
                                    {
                                        validator: () => {
                                            if (this.state.wrongPassword) return Promise.reject(t("ERROR.INCORRECT_USERNAME_OR_PASSWORD"));
                                            if (this.state.invalidLicense) return Promise.reject(t("ERROR.LICENSE_EXPIRED"));
                                            return Promise.resolve();
                                        },
                                    },
                                ]}
                                validateTrigger="onBlur"
                            >
                                <Input.Password
                                    autoComplete="password"
                                    className="Input"
                                    value={this.state.password}
                                    onChange={(e) => this.handleChange(e, "password")}
                                    onKeyDown={this.onKeyDown}
                                    name="password"
                                />
                            </Form.Item>
                            <Form.Item>
                                <Button
                                    className="LoginWrapper_Card_Button"
                                    type="primary"
                                    htmlType="submit"
                                    disabled={this.state.username === ""}
                                    id="login-form_login-button"
                                >
                                    {t("GENERAL.LOG_IN")}
                                </Button>
                            </Form.Item>
                        </Form>
                        <Button
                            className="LoginWrapper_Card_Button LoginWrapper_Card_Button_Default"
                            type="link"
                            disabled={this.state.username === ""}
                            onClick={() => this.props.history.push(`/forgot-password/${Buffer.from(this.state.username).toString("base64")}/forgotPassword`)}
                        >
                            {t("GENERAL.FORGOT_PASSWORD")}
                        </Button>
                        <Button
                            className="LoginWrapper_Card_Button LoginWrapper_Card_Button_Default"
                            type="link"
                            onClick={() => this.props.history.push("/signup")}
                        >
                            {t("GENERAL.SIGN_UP")}
                        </Button>
                    </div>
                </LoginWrapper>
            </>
        );
    }
}

export default withTranslation()(withRouter(LoginCards));
