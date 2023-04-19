/// <reference types="Cypress" />

const COLOUR_PICKER_COMPONENT = ".twitter-picker";

export class CommonPropertiesPanePage {
    static verifyColourPicker() {
        cy.get(COLOUR_PICKER_COMPONENT).should("be.visible");
    }
}
