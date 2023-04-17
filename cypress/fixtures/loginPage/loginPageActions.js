import {
    buttons as loginPageButtons,
    inputs as loginPageInputs,
    images as loginPageImages,
    components as loginPageComponents,
    labels as loginPageLabels,
} from "../../fixtures/loginPage/loginPageSelectors";
import { data as loginData } from "../../fixtures/loginPage/loginPageConstans";
import { errors as loginPageErrors } from "../../fixtures/loginPage/loginPageConstans";

export const actions = {
    selectLanguage(language) {
        cy.get(loginPageButtons.languageButton).contains(language).click();
    },

    enterCorrectEmail() {
        cy.get(loginPageInputs.emailInput).type(Cypress.env("testUserName"));
    },

    clickLoginButton() {
        cy.get(loginPageButtons.loginButton).click();
    },

    enterCorrectPassword() {
        cy.get(loginPageInputs.passwordInput).clear().type(Cypress.env("testUserPassword"));
    },

    verifyRukkorBottomLogo() {
        cy.get(loginPageImages.rukkorBottomLogo).should("be.exist");
    },

    verifyUsernameInputIsVisible() {
        cy.get(loginPageInputs.emailInput).should("be.visible");
    },

    enterIncorrectPassword() {
        cy.get(loginPageInputs.passwordInput).type(loginData.incorrectPassword);
    },

    verifyIncorrectPasswordMessage() {
        cy.get(loginPageComponents.loginForm).find(loginPageLabels.passwordError).should("have.text", loginPageErrors.incorrectCredentialsError);
    },

    enterIncorrectPasswordFormat() {
        cy.get(loginPageInputs.passwordInput).type(loginData.incorrectPasswordFormat);
    },
    verifyIncorrectPasswordFormatMessage() {
        cy.get(loginPageComponents.loginForm).find(loginPageLabels.passwordError).should("have.text", loginPageErrors.incorrectPasswordFormatError);
    },
};
