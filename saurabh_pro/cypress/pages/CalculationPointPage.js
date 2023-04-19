/// <reference types="Cypress" />

const POINT_ATTRIBUTES_PANE = "#point_pane";
const SECTION_HEADER = ".ant-collapse-header";
const QUANTITY_INPUT_HEADER = "#quantity_input-title";
const QUANTITY_INPUT = "#quantity_input";
const POINT_ICON_INPUT_HEADER = "#select-icon--title";
const POINT_ICON_INPUT = "#select-icon--button";
const FILL_COLOUR_BUTTON = "#colour-picker_fill-colour--button";
const COLOUR_PICKER_BUTTON = ".Color_Picker_Icon";
const COLOUR_PICKER_INPUT = ".Color_Picker_Input";
const FILL_OPACITY_INPUT_HEADER = "#fill-opacity_input-title";
const FILL_OPACITY_INPUT = "#fill-opacity_input";
const SIZE_INPUT_HEADER = "#size_input-title";
const SIZE_INPUT = "#size_input";
const ICON_STYLE_DROPDOWN = ".Select_Option";

export class CalculationPointPanePage {
    static verifyPointSection() {
        this.verifyPointSectionHeader();
        this.verifyPointSectionQuantityInput();
        this.verifyPointSectionIconInput();
        this.verifyPointSectionColourPicker();
        this.verifyPointSectionFillOpacityInput();
        this.verifyPointSectionSizeInput();
    }

    static verifyPointSectionHeader() {
        cy.get(POINT_ATTRIBUTES_PANE).find(SECTION_HEADER).should("exist").and("have.text", "Point");
    }

    static verifyPointSectionQuantityInput() {
        cy.get(POINT_ATTRIBUTES_PANE).find(QUANTITY_INPUT_HEADER).should("exist").and("have.text", "Quantity");
        cy.get(POINT_ATTRIBUTES_PANE).find(QUANTITY_INPUT).should("exist");
    }

    static verifyPointSectionIconInput() {
        cy.get(POINT_ATTRIBUTES_PANE).find(POINT_ICON_INPUT_HEADER).should("exist").and("have.text", "Icon");
        cy.get(POINT_ATTRIBUTES_PANE).find(POINT_ICON_INPUT).should("exist");
    }

    static verifyPointSectionColourPicker() {
        cy.get(POINT_ATTRIBUTES_PANE).find(FILL_COLOUR_BUTTON).should("exist").and("have.text", "Fill Colour");
        cy.get(POINT_ATTRIBUTES_PANE).find(FILL_COLOUR_BUTTON).find(COLOUR_PICKER_BUTTON).should("exist");
        cy.get(POINT_ATTRIBUTES_PANE).find(FILL_COLOUR_BUTTON).find(COLOUR_PICKER_INPUT).should("exist");
    }

    static verifyPointSectionFillOpacityInput() {
        cy.get(POINT_ATTRIBUTES_PANE).find(FILL_OPACITY_INPUT_HEADER).should("exist").and("have.text", "Fill Opacity");
        cy.get(POINT_ATTRIBUTES_PANE).find(FILL_OPACITY_INPUT).should("exist");
    }

    static verifyPointSectionSizeInput() {
        cy.get(POINT_ATTRIBUTES_PANE).find(SIZE_INPUT_HEADER).should("exist").and("have.text", "Size");
        cy.get(POINT_ATTRIBUTES_PANE).find(SIZE_INPUT).should("exist");
    }

    static clickPointSectionHeader() {
        cy.get(POINT_ATTRIBUTES_PANE).find(SECTION_HEADER).click();
    }

    static verifyPointSectionIsHiden() {
        cy.get(POINT_ATTRIBUTES_PANE).find(SECTION_HEADER).should("exist");
        cy.get(POINT_ATTRIBUTES_PANE).find(QUANTITY_INPUT_HEADER).should("not.be.visible");
        cy.get(POINT_ATTRIBUTES_PANE).find(QUANTITY_INPUT).should("not.be.visible");
        cy.get(POINT_ATTRIBUTES_PANE).find(POINT_ICON_INPUT_HEADER).should("not.be.visible");
        cy.get(POINT_ATTRIBUTES_PANE).find(POINT_ICON_INPUT).should("not.be.visible");
        cy.get(POINT_ATTRIBUTES_PANE).find(FILL_COLOUR_BUTTON).should("not.be.visible");
        cy.get(POINT_ATTRIBUTES_PANE).find(FILL_OPACITY_INPUT_HEADER).should("not.be.visible");
        cy.get(POINT_ATTRIBUTES_PANE).find(FILL_OPACITY_INPUT).should("not.be.visible");
        cy.get(POINT_ATTRIBUTES_PANE).find(SIZE_INPUT_HEADER).should("not.be.visible");
        cy.get(POINT_ATTRIBUTES_PANE).find(SIZE_INPUT).should("not.be.visible");
    }

    static clickFillColourPicker() {
        cy.get(POINT_ATTRIBUTES_PANE).find(FILL_COLOUR_BUTTON).find(COLOUR_PICKER_BUTTON).click();
    }

    static clickPointStyleInput() {
        cy.get(POINT_ATTRIBUTES_PANE).find(POINT_ICON_INPUT).click();
    }

    static verifyPointIconDropdown() {
        cy.get(POINT_ATTRIBUTES_PANE).find(ICON_STYLE_DROPDOWN).should("exist");
    }
}
