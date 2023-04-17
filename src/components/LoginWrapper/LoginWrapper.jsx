import "./login-wrapper.less";

import { Card, Select } from "antd";
import { find, get } from "lodash";

import { AuthenticationStore } from "stores";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import Reflux from "reflux";
import RukkorLogo from "../../assets/images/rukkor-logo.png";
import { withRouter } from "react-router";
import { withTranslation } from "react-i18next";

const initialLanguages = [
    { languageKey: "en", nativeName: "English" },
    { languageKey: "sv", nativeName: "Svenska" },
    { languageKey: "no", nativeName: "Norsk" },

    /* REMOVE AFTER TESTING IS COMPLETE */
    { languageKey: "DEV", nativeName: "DEV" },

    /*  TEMPORARY DISABLED UNTIL TRANSLATIONS ARE COMPLETE
    { languageKey: "da", nativeName: "Danska" },
    { languageKey: "nl", nativeName: "Nederlands" },
    { languageKey: "es", nativeName: "Español" }, */
];

class LoginWrapper extends Reflux.PureComponent {
    state = {
        selectedLanguage: this.initialLanguage(),
        email: "",
        password: "",
        loginFilled: false,
    };

    componentDidMount() {
        const { i18n } = this.props;

        i18n.changeLanguage(this.initialLanguage());

        this.unsubscribeAuthenticationStore = AuthenticationStore.listen(this.authenticationStoreUpdated);
    }

    componentWillUnmount() {
        this.unsubscribeAuthenticationStore();
    }

    authenticationStoreUpdated = (message) => {
        switch (message) {
            case "setLanguage":
                this.onLanguageSelect(AuthenticationStore.getLanguage());
                break;
            default:
                break;
        }
    };

    initialLanguage() {
        return localStorage.getItem("language") || "en";
    }

    onLanguageSelect = (selectedLanguageKey) => {
        const { i18n } = this.props;
        const selectedLanguageName = get(
            find(initialLanguages, (lang) => lang.languageKey === selectedLanguageKey),
            "nativeName"
        );

        i18n.changeLanguage(selectedLanguageKey);
        this.setState({ selectedLanguage: selectedLanguageName });
        localStorage.setItem("language", selectedLanguageKey);
        window._setupTawk();
    };

    capitalizeFirstLetter = (value) => {
        return value[0].toUpperCase() + value.substr(1);
    };

    renderOption = (langDisplayName) => <>{this.capitalizeFirstLetter(langDisplayName)}</>;

    render() {
        const { t } = this.props;

        return (
            <div className="LoginWrapper_Wrapper">
                <Card className={`LoginWrapper_Card ${this.props.horizontalTitle && "LoginWrapper_Card_Horizontal"}`}>
                    {this.props.horizontalTitle ? (
                        <div className="LoginWrapper_Card_Title_Container_Horizontal">
                            <img src={process.env.PUBLIC_URL + "/logo.png"} className="LoginWrapper_Card_GeometraLogo_Horizontal" alt="Geometra-Logo" />
                            <label className="LoginWrapper_Card_Title_Horizontal">{t(this.props.cardTitle)}</label>
                        </div>
                    ) : (
                        <div className="LoginWrapper_Card_Title_Container">
                            <img src={process.env.PUBLIC_URL + "/logo.png"} className="LoginWrapper_Card_GeometraLogo" alt="Geometra-Logo" />
                            <label className="LoginWrapper_Card_Title">{t(this.props.cardTitle)}</label>
                        </div>
                    )}

                    {this.props.children}
                </Card>
                <div>
                    <img src={RukkorLogo} className="LoginWrapper_RukkorLogo" />
                </div>

                <div className="LoginWrapper_LanguageSelect_Wrapper">
                    <Select
                        dropdownMatchSelectWidth={false}
                        menuItemSelectedIcon={<FontAwesomeIcon className="LoginWrapper_LanguageSelect_Option_Icon--selected" icon={["fal", "check-circle"]} />}
                        className="LoginWrapper_LanguageSelect"
                        suffixIcon={<FontAwesomeIcon className="LoginWrapper_LanguageSelect_Icon" icon={["fal", "caret-right"]} />}
                        value={this.state.selectedLanguage}
                        onChange={this.onLanguageSelect}
                    >
                        {initialLanguages.map((lng) => (
                            <Select.Option value={lng.languageKey} key={lng.languageKey}>
                                {this.renderOption(lng.nativeName)}
                            </Select.Option>
                        ))}
                    </Select>
                </div>
            </div>
        );
    }
}

export default withTranslation()(withRouter(LoginWrapper));
