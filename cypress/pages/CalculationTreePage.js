/// <reference types="Cypress" />

const CALCULATION_PAGE_HEADER = "[data-cy=calculate_header]";
const CALCULATION_TREE_ELEMENT_LABEL = "label";
const CALCULATION_TREE_CONTEXT_BUTTON = "span";

export class CalculationTreePage {
    static selectElementType(elementLabel) {
        cy.get(CALCULATION_PAGE_HEADER, { timeout: 60000 }).should("be.visible");
        cy.get(CALCULATION_TREE_ELEMENT_LABEL).contains(elementLabel).click();
    }

    static clickRmbOnElement(elementLabel) {
        cy.get(CALCULATION_PAGE_HEADER, { timeout: 60000 }).should("be.visible");
        cy.get(CALCULATION_TREE_ELEMENT_LABEL).contains(elementLabel).click();
        cy.get(CALCULATION_TREE_ELEMENT_LABEL).contains(elementLabel).rightclick();
    }

    static clickOnTreeContextMenuButton(buttonLabel) {
        cy.get(CALCULATION_TREE_CONTEXT_BUTTON).contains(buttonLabel).click();
    }
}
