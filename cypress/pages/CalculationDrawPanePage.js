/// <reference types="Cypress" />

const DRAW_ATTRIBUTES_PANE = "#draw_pane";
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

export class CalculationDrawPanePage {
    static verifyDrawSection() {
        this.verifyDrawSectionHeader();
        this.verifyDrawSectionQuantityInput();
        this.verifyDrawHeightInput();
        this.verifyDrawFillColourInput();
        this.verifyDrawFillOpacityInput();
        this.verifyDrawBorderColourInput();
        this.verifyDrawBorderOpacityInput();
        this.verifyDrawBorderStyleInput();
        this.verifyDrawThicknessInput();
    }

    static verifyDrawSectionHeader() {
        cy.get(DRAW_ATTRIBUTES_PANE).find(SECTION_HEADER).should("exist").and("have.text", "Draw");
    }

    static verifyDrawSectionQuantityInput() {
        cy.get(DRAW_ATTRIBUTES_PANE).find(QUANTITY_INPUT_HEADER).should("exist").and("have.text", "Quantity");
        cy.get(DRAW_ATTRIBUTES_PANE).find(QUANTITY_INPUT).should("exist");
    }

    static verifyDrawHeightInput() {
        cy.get(DRAW_ATTRIBUTES_PANE).find(HEIGHT_INPUT_HEADER).should("exist").and("have.text", "Height");
        cy.get(DRAW_ATTRIBUTES_PANE).find(HEIGHT_INPUT).should("exist");
    }

    static verifyDrawFillColourInput() {
        cy.get(DRAW_ATTRIBUTES_PANE).find(FILL_COLOUR_BUTTON).should("exist").and("have.text", "Fill Colour");
        cy.get(DRAW_ATTRIBUTES_PANE).find(FILL_COLOUR_BUTTON).find(COLOUR_PICKER_BUTTON).should("exist");
        cy.get(DRAW_ATTRIBUTES_PANE).find(FILL_COLOUR_BUTTON).find(COLOUR_PICKER_INPUT).should("exist");
    }

    static verifyDrawFillOpacityInput() {
        cy.get(DRAW_ATTRIBUTES_PANE).find(FILL_OPACITY_INPUT_HEADER).should("exist").and("have.text", "Fill Opacity");
        cy.get(DRAW_ATTRIBUTES_PANE).find(FILL_OPACITY_INPUT).should("exist");
    }

    static verifyDrawBorderColourInput() {
        cy.get(DRAW_ATTRIBUTES_PANE).find(BORDER_COLOUR_BUTTON).should("exist").and("have.text", "Border Colour");
        cy.get(DRAW_ATTRIBUTES_PANE).find(BORDER_COLOUR_BUTTON).find(COLOUR_PICKER_BUTTON).should("exist");
        cy.get(DRAW_ATTRIBUTES_PANE).find(BORDER_COLOUR_BUTTON).find(COLOUR_PICKER_INPUT).should("exist");
    }

    static verifyDrawBorderOpacityInput() {
        cy.get(DRAW_ATTRIBUTES_PANE).find(BORDER_OPACITY_INPUT_HEADER).should("exist").and("have.text", "Border Opacity");
        cy.get(DRAW_ATTRIBUTES_PANE).find(BORDER_OPACITY_INPUT).should("exist");
    }

    static verifyDrawBorderStyleInput() {
        cy.get(DRAW_ATTRIBUTES_PANE).find(BORDER_STYLE_SELECT_INPUT).should("exist").and("have.text", "Border Style");
    }

    static verifyDrawThicknessInput() {
        cy.get(DRAW_ATTRIBUTES_PANE).find(BORDER_THICKNESS_BUTTON).should("exist").and("have.text", "Thickness");
    }

    static clickDrawSectionHeader() {
        cy.get(DRAW_ATTRIBUTES_PANE).find(SECTION_HEADER).click();
    }

    static verifyDrawSectionIsHiden() {
        cy.get(DRAW_ATTRIBUTES_PANE).find(SECTION_HEADER).should("exist");
        cy.get(DRAW_ATTRIBUTES_PANE).find(QUANTITY_INPUT_HEADER).should("not.be.visible");
        cy.get(DRAW_ATTRIBUTES_PANE).find(QUANTITY_INPUT).should("not.be.visible");
        cy.get(DRAW_ATTRIBUTES_PANE).find(HEIGHT_INPUT_HEADER).should("not.be.visible");
        cy.get(DRAW_ATTRIBUTES_PANE).find(FILL_COLOUR_BUTTON).should("not.be.visible");
        cy.get(DRAW_ATTRIBUTES_PANE).find(FILL_OPACITY_INPUT).should("not.be.visible");
        cy.get(DRAW_ATTRIBUTES_PANE).find(BORDER_COLOUR_BUTTON).should("not.be.visible");
        cy.get(DRAW_ATTRIBUTES_PANE).find(BORDER_OPACITY_INPUT).should("not.be.visible");
        cy.get(DRAW_ATTRIBUTES_PANE).find(BORDER_STYLE_SELECT_INPUT).should("not.be.visible");
        cy.get(DRAW_ATTRIBUTES_PANE).find(BORDER_THICKNESS_BUTTON).should("not.be.visible");
    }

    static clickDrawFillColourPicker() {
        cy.get(DRAW_ATTRIBUTES_PANE).find(FILL_COLOUR_BUTTON).find(COLOUR_PICKER_BUTTON).click();
    }

    static clickDrawBorderStyleInput() {
        cy.get(DRAW_ATTRIBUTES_PANE).find(BORDER_STYLE_SELECT_INPUT).find(SELECTOR_INPUT).click();
    }

    static clickDrawBorderColourPicker() {
        cy.get(DRAW_ATTRIBUTES_PANE).find(BORDER_COLOUR_BUTTON).find(COLOUR_PICKER_BUTTON).click();
    }

    static verifyDrawBorderStylesDropdown() {
        cy.get(DRAW_ATTRIBUTES_PANE).find(BORDER_STYLE_DROPDOWN).should("be.visible");
    }
}
