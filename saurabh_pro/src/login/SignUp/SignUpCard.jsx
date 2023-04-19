import "./signup.less";
import { Button, Form, Input, notification } from "antd";
import { TooltipDescription, TooltipMessage } from "../../components/Tooltip/components";
import { emailRegex, passwordRegex, phoneReqex, normalRegex } from "../../utils/Validator";

import { CalculationStore, AuthenticationStore } from "stores";
import { LoginWrapper } from "../../components";
import React from "react";
import Reflux from "reflux";
import axios from "axios";
import { withRouter } from "react-router";
import { withTranslation } from "react-i18next";
import { Redirect } from "react-router-dom";

class SignUpCard extends Reflux.PureComponent {
    formRef = React.createRef();

    state = {
        email: "",
        password: "",
        company: "",
        userName: "",
        phone: "",
        requiredFieldFilled: false,
        responseErr: "",
    };

    handleChange = (e, name) => {
        this.setState(
            {
                [name]: e.target.value,
            },
            () => {
                if (this.state.email.length > 0 && this.state.password.length > 0) {
                    this.setState({
                        requiredFieldFilled: true,
                    });
                } else {
                    this.setState({
                        requiredFieldFilled: false,
                    });
                }
            }
        );
    };
    onTryRegister = (e) => {
        axios
            .post(`${process.env.REACT_APP_NODE_URL}/signup`, {
                eMail: this.state.email.toLowerCase(),
                company: this.state.company,
                name: this.state.userName,
                password: this.state.password,
                phone: this.state.phone,
                language: CalculationStore.getIntlLang(),
            })
            .then((res) => {
                if (res.data.statusCode !== 200) {
                    this.setState({
                        responseErr: res.data.body,
                        requiredFieldFilled: false,
                    });
                    this.formRef.current.validateFields();
                } else this.props.history.push("/login");
            })
            .catch((err) =>
                notification.open({
                    message: <TooltipMessage message={"Error"} />,
                    description: <TooltipDescription description={err.response.data} />,
                    placement: "bottomRight",
                    className: "Tooltip",
                })
            );
    };
    onKeyDown = () => {};
    render() {
        const { t } = this.props;

        return AuthenticationStore.isCompleteLoggedIn() ? (
            <Redirect to="/projects" />
        ) : (
            <LoginWrapper cardTitle={t("GENERAL.SIGN_UP")}>
                <Form
                    onChange={() => {
                        this.setState({ responseErr: "" });
                    }}
                    onFinish={(e) => this.onTryRegister(e)}
                    ref={this.formRef}
                    className="SignUpForm"
                >
                    <label htmlFor="email" className="Login_Container_Label">
                        {t("GENERAL.EMAIL_REQUIRED")}
                    </label>
                    <Form.Item
                        name="email"
                        rules={[
                            {
                                pattern: emailRegex,
                                message: t("ERROR.ENTER_VALID_EMAIL"),
                            },
                            {
                                required: true,
                                message: t("GENERAL.ENTER_YOUR_EMAIL"),
                            },
                            {
                                message: this.state.responseErr,
                                validator: (_, value) => {
                                    if (this.state.responseErr) {
                                        return Promise.reject(this.state.responseErr);
                                    }
                                    return Promise.resolve();
                                },
                            },
                        ]}
                        validateTrigger="onBlur"
                    >
                        <Input className="Input" value={this.state.email} onKeyDown={this.onKeyDown} onChange={(e) => this.handleChange(e, "email")} />
                    </Form.Item>
                    <label htmlFor="password" className="Login_Container_Label">
                        {t("GENERAL.PASSWORD_REQUIRED")}
                    </label>
                    <Form.Item
                        name="password"
                        rules={[
                            {
                                pattern: passwordRegex,
                                message: t("ERROR.PASSWORD_LENGTH_AND_CHARACTERS"),
                            },
                            {
                                required: true,
                                message: t("GENERAL.ENTER_PASSWORD"),
                            },
                        ]}
                        validateTrigger="onBlur"
                    >
                        <Input.Password
                            className="Input"
                            value={this.state.password}
                            onChange={(e) => this.handleChange(e, "password")}
                            onKeyDown={this.onKeyDown}
                            name="password"
                        />
                    </Form.Item>
                    <label htmlFor="company" className="Login_Container_Label">
                        {t("GENERAL.ORGANISATION")}
                    </label>
                    <Form.Item
                        name="company"
                        rules={[
                            {
                                pattern: normalRegex,
                                message: t("ERROR.ENTER_VALID_COMPANY_NAME"),
                            },
                        ]}
                        validateTrigger="onBlur"
                    >
                        <Input className="Input" value={this.state.company} onKeyDown={this.onKeyDown} onChange={(e) => this.handleChange(e, "company")} />
                    </Form.Item>
                    <label className="Login_Container_Label">{t("GENERAL.NAME")}</label>
                    <Form.Item
                        name="fullName"
                        rules={[
                            {
                                pattern: normalRegex,
                                message: t("ERROR.ENTER_VALID_NAME"),
                            },
                        ]}
                        validateTrigger="onBlur"
                    >
                        <Input className="Input" value={this.state.userName} onKeyDown={this.onKeyDown} onChange={(e) => this.handleChange(e, "userName")} />
                    </Form.Item>
                    <label htmlFor="phone" className="Login_Container_Label">
                        {t("GENERAL.PHONE")}
                    </label>
                    <Form.Item
                        name="phone"
                        rules={[
                            {
                                pattern: phoneReqex,
                                message: t("ERROR.ENTER_VALID_PHONE"),
                            },
                        ]}
                        validateTrigger="onBlur"
                    >
                        <Input
                            className="Input"
                            type="number"
                            min="1"
                            value={this.state.phone}
                            onKeyDown={this.onKeyDown}
                            onChange={(e) => this.handleChange(e, "phone")}
                        />
                    </Form.Item>
                    <Form.Item>
                        <Button className="LoginWrapper_Card_Button" type="primary" htmlType="submit" disabled={!this.state.requiredFieldFilled}>
                            {t("GENERAL.SIGN_UP")}
                        </Button>
                    </Form.Item>
                </Form>
                <Button className="LoginWrapper_Card_Button LoginWrapper_Card_Button_Default" type="link" onClick={() => this.props.history.push("/login")}>
                    {t("GENERAL.BACK_TO_LOGIN")}
                </Button>
            </LoginWrapper>
        );
    }
}

export default withTranslation()(withRouter(SignUpCard));
