/// <reference types="Cypress" />

const AREA_ATTRIBUTES_PANE = "#area_pane";
const SECTION_HEADER = ".ant-collapse-header";
const QUANTITY_INPUT_HEADER = "#quantity_input-title";
const QUANTITY_INPUT = "#quantity_input";
const HEIGHT_INPUT_HEADER = "#height_input-title";
const HEIGHT_INPUT = "#height_input";
const FILL_COLOUR_BUTTON = "#colour-picker_fill-colour--button";
const COLOUR_PICKER_BUTTON = ".Color_Picker_Icon";
const COLOUR_PICKER_INPUT = ".Color_Picker_Input";
const FILL_OPACITY_INPUT_HEADER = "#fill-opacity_input-title";
const FILL_OPACITY_INPUT = "#fill-opacity_input";
const BORDER_COLOUR_BUTTON = "#colour-picker_border-colour--button";
const BORDER_OPACITY_INPUT_HEADER = "#border-opacity_input-title";
const BORDER_OPACITY_INPUT = "#border-opacity_input";
const BORDER_THICKNESS_BUTTON = "#autocomplete-thickness--button";
const BORDER_STYLE_SELECT_INPUT = "#select-border-style--button";
const SELECTOR_INPUT = ".ant-select-selector";
const BORDER_STYLE_DROPDOWN = ".Select_Option";

export class CalculationAreaPanePage {
    static verifyAreaSection() {
        this.verifyAreaSectionHeader();
        this.verifyAreaSectionQuantityInput();
        this.verifyAreaHeightInput();
        this.verifyAreaFillColourInput();
        this.verifyAreaFillOpacityInput();
        this.verifyAreaBorderColourInput();
        this.verifyAreaBorderOpacityInput();
        this.verifyAreaBorderStyleInput();
        this.verifyAreaThicknessInput();
    }

    static verifyAreaSectionHeader() {
        cy.get(AREA_ATTRIBUTES_PANE).find(SECTION_HEADER).should("be.visible").and("have.text", "Area");
    }

    static verifyAreaSectionQuantityInput() {
        cy.get(AREA_ATTRIBUTES_PANE).find(QUANTITY_INPUT_HEADER).should("be.visible").and("have.text", "Quantity");
        cy.get(AREA_ATTRIBUTES_PANE).find(QUANTITY_INPUT).should("be.visible");
    }

    static verifyAreaHeightInput() {
        cy.get(AREA_ATTRIBUTES_PANE).find(HEIGHT_INPUT_HEADER).should("be.visible").and("have.text", "Height");
        cy.get(AREA_ATTRIBUTES_PANE).find(HEIGHT_INPUT).should("be.visible");
    }

    static verifyAreaFillColourInput() {
        cy.get(AREA_ATTRIBUTES_PANE).find(FILL_COLOUR_BUTTON).should("be.visible").and("have.text", "Fill Colour");
        cy.get(AREA_ATTRIBUTES_PANE).find(FILL_COLOUR_BUTTON).find(COLOUR_PICKER_BUTTON).should("be.visible");
        cy.get(AREA_ATTRIBUTES_PANE).find(FILL_COLOUR_BUTTON).find(COLOUR_PICKER_INPUT).should("be.visible");
    }

    static verifyAreaFillOpacityInput() {
        cy.get(AREA_ATTRIBUTES_PANE).find(FILL_OPACITY_INPUT_HEADER).should("be.visible").and("have.text", "Fill Opacity");
        cy.get(AREA_ATTRIBUTES_PANE).find(FILL_OPACITY_INPUT).should("be.visible");
    }

    static verifyAreaBorderColourInput() {
        cy.get(AREA_ATTRIBUTES_PANE).find(BORDER_COLOUR_BUTTON).should("be.visible").and("have.text", "Border Colour");
        cy.get(AREA_ATTRIBUTES_PANE).find(BORDER_COLOUR_BUTTON).find(COLOUR_PICKER_BUTTON).should("be.visible");
        cy.get(AREA_ATTRIBUTES_PANE).find(BORDER_COLOUR_BUTTON).find(COLOUR_PICKER_INPUT).should("be.visible");
    }

    static verifyAreaBorderOpacityInput() {
        cy.get(AREA_ATTRIBUTES_PANE).find(BORDER_OPACITY_INPUT_HEADER).should("be.visible").and("have.text", "Border Opacity");
        cy.get(AREA_ATTRIBUTES_PANE).find(BORDER_OPACITY_INPUT).should("be.visible");
    }

    static verifyAreaBorderStyleInput() {
        cy.get(AREA_ATTRIBUTES_PANE).find(BORDER_STYLE_SELECT_INPUT).should("be.visible").and("have.text", "Border Style");
    }

    static verifyAreaThicknessInput() {
        cy.get(AREA_ATTRIBUTES_PANE).find(BORDER_THICKNESS_BUTTON).should("be.visible").and("have.text", "Thickness");
    }

    static clickAreaSectionHeader() {
        cy.get(AREA_ATTRIBUTES_PANE).find(SECTION_HEADER).click();
    }

    static verifyAreaSectionIsHiden() {
        cy.get(AREA_ATTRIBUTES_PANE).find(SECTION_HEADER).should("be.visible");
        cy.get(AREA_ATTRIBUTES_PANE).find(QUANTITY_INPUT_HEADER).should("not.be.visible");
        cy.get(AREA_ATTRIBUTES_PANE).find(QUANTITY_INPUT).should("not.be.visible");
        cy.get(AREA_ATTRIBUTES_PANE).find(HEIGHT_INPUT_HEADER).should("not.be.visible");
        cy.get(AREA_ATTRIBUTES_PANE).find(FILL_COLOUR_BUTTON).should("not.be.visible");
        cy.get(AREA_ATTRIBUTES_PANE).find(FILL_OPACITY_INPUT).should("not.be.visible");
        cy.get(AREA_ATTRIBUTES_PANE).find(BORDER_COLOUR_BUTTON).should("not.be.visible");
        cy.get(AREA_ATTRIBUTES_PANE).find(BORDER_OPACITY_INPUT).should("not.be.visible");
        cy.get(AREA_ATTRIBUTES_PANE).find(BORDER_STYLE_SELECT_INPUT).should("not.be.visible");
        cy.get(AREA_ATTRIBUTES_PANE).find(BORDER_THICKNESS_BUTTON).should("not.be.visible");
    }

    static clickFillColourPicker() {
        cy.get(AREA_ATTRIBUTES_PANE).find(FILL_COLOUR_BUTTON).find(COLOUR_PICKER_BUTTON).click();
    }

    static clickBorderStyleInput() {
        cy.get(AREA_ATTRIBUTES_PANE).find(BORDER_STYLE_SELECT_INPUT).find(SELECTOR_INPUT).click();
    }

    static clickBorderColourPicker() {
        cy.get(AREA_ATTRIBUTES_PANE).find(BORDER_COLOUR_BUTTON).find(COLOUR_PICKER_BUTTON).click();
    }

    static verifyAreaBorderStylesDropdown() {
        cy.get(AREA_ATTRIBUTES_PANE).find(BORDER_STYLE_DROPDOWN).should("be.visible");
    }
}
