import { Button, Form, Input } from "antd";
import React, { useState } from "react";
import { useHistory, useParams } from "react-router-dom";

import { LoginWrapper } from "../../components";
import axios from "axios";
import { passwordRegex } from "../../utils/Validator";
import { useTranslation } from "react-i18next";

const NewPassword = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const { t } = useTranslation();
    const { push } = useHistory();
    const { token, eMail } = useParams();

    const onChangePassword = () => {
        axios.post(`${process.env.REACT_APP_NODE_URL}/set_password`, {
            token,
            eMail,
            newPassword: password,
            confirmedNewPassword: confirmPassword,
        });
        setTimeout(() => push("/login"), 500);
    };

    return (
        <LoginWrapper cardTitle={t("GENERAL.NEW_PASSWORD")}>
            <Form onFinish={onChangePassword} name="password-form">
                <label htmlFor="password" className="Login_Container_Label">
                    {t("GENERAL.NEW_PASSWORD")}
                </label>
                <Form.Item
                    name="password"
                    rules={[
                        {
                            pattern: passwordRegex,
                            message: t("GENERAL.PASSWORD_INSTRUCTION"),
                        },
                        {
                            required: true,
                            message: t("GENERAL.ENTER_PASSWORD Please enter your password"),
                        },
                    ]}
                    validateTrigger="onBlur"
                >
                    <Input.Password className="Input" value={password} onChange={(e) => setPassword(e.target.value)} name="password" />
                </Form.Item>
                <label htmlFor="password" className="Login_Container_Label">
                    {t("GENERAL.CONFIRM_PASSWORD")}
                </label>
                <Form.Item
                    name="confirmPassword"
                    rules={[
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue("password") === value) return Promise.resolve();
                                return Promise.reject(new Error(t("GENERAL.PASSWORDS_DO_NOT_MATCH")));
                            },
                        }),
                    ]}
                    validateTrigger="onBlur"
                >
                    <Input.Password className="Input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} name="confirmPassword" />
                </Form.Item>
                <Form.Item>
                    <Button className="LoginWrapper_Card_Button" type="primary" htmlType="submit">
                        {t("GENERAL.SET_NEW_PASSWORD")}
                    </Button>
                </Form.Item>
            </Form>
        </LoginWrapper>
    );
};

export default NewPassword;
