/// <reference types="Cypress" />

const baseUrl = Cypress.env("baseUrl");

export class CalculationPage {
    static navigateToCalculationPage() {
        cy.wait(5000);
        cy.visit(`${baseUrl}projects/150218/calculate/1001116`);
    }
}
