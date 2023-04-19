/// <reference types="Cypress" />

import { loginErrorTexts, loginTexts } from "../fixtures/text_helpers/LoginTextHelper";

const USERNAME_INPUT = "#username";
const PASSWORD_INPUT = "#password-form_password";
const LOGIN_BUTTON = "[id=login-form_login-button]";
const INCORRECT_CREDENTIALS_ERROR = "[data-cy=login_incorrect-credentials-error--text]";
const languageButton = ".Card_Button";

export class LoginPage {
    static goToLoginPage() {
        cy.visit(Cypress.env("baseUrl"));
    }

    static enterIncorrectUsername() {
        cy.get(USERNAME_INPUT).clear().click().type(loginTexts.incorrectUsername);
    }

    static enterIncorrectPassword() {
        cy.get(PASSWORD_INPUT).clear().click().type(loginTexts.incorrectPassword);
    }

    static clickLoginButton() {
        cy.get(LOGIN_BUTTON).click();
    }

    static verifyIncorrectCredentialsError() {
        cy.get(INCORRECT_CREDENTIALS_ERROR).should("be.visible").and("have.text", loginErrorTexts.incorrectCredentialsErrorText);
    }

    static enterCorrectUsername() {
        cy.get(USERNAME_INPUT).clear().type(Cypress.env("testUserName"));
    }

    static enterCorrectPassword() {
        cy.get(PASSWORD_INPUT).clear().type(Cypress.env("testUserPassword"));
    }

    static selectLanguage(language) {
        cy.get(languageButton).contains(language).click();
        cy.wait(1000);
    }
}
