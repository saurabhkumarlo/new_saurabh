import { urls, urlsStrings } from "../../fixtures/urls/urls";

export const actions = {
    visitLoginPage() {
        cy.visit(urls.loginUrl);
    },

    verifyLoginUrl() {
        cy.url().should("include", urlsStrings.loginUrl);
    },
};
