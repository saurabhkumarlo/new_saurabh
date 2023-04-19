/// <reference types="Cypress" />

const CIRCLE_ATTRIBUTES_PANE = "#ellipse_pane";
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

export class CalculationCirclePanePage {
    static verifyCircleSection() {
        this.verifyCircleSectionHeader();
        this.verifyCircleSectionQuantityInput();
        this.verifyCircleHeightInput();
        this.verifyCircleFillColourInput();
        this.verifyCircleFillOpacityInput();
        this.verifyCircleBorderColourInput();
        this.verifyCircleBorderOpacityInput();
        this.verifyCircleBorderStyleInput();
        this.verifyCircleThicknessInput();
    }

    static verifyCircleSectionHeader() {
        cy.get(CIRCLE_ATTRIBUTES_PANE).find(SECTION_HEADER).should("be.visible").and("have.text", "Ellipse");
    }

    static verifyCircleSectionQuantityInput() {
        cy.get(CIRCLE_ATTRIBUTES_PANE).find(QUANTITY_INPUT_HEADER).should("be.visible").and("have.text", "Quantity");
        cy.get(CIRCLE_ATTRIBUTES_PANE).find(QUANTITY_INPUT).should("be.visible");
    }

    static verifyCircleHeightInput() {
        cy.get(CIRCLE_ATTRIBUTES_PANE).find(HEIGHT_INPUT_HEADER).should("be.visible").and("have.text", "Height");
        cy.get(CIRCLE_ATTRIBUTES_PANE).find(HEIGHT_INPUT).should("be.visible");
    }

    static verifyCircleFillColourInput() {
        cy.get(CIRCLE_ATTRIBUTES_PANE).find(FILL_COLOUR_BUTTON).should("be.visible").and("have.text", "Fill Colour");
        cy.get(CIRCLE_ATTRIBUTES_PANE).find(FILL_COLOUR_BUTTON).find(COLOUR_PICKER_BUTTON).should("be.visible");
        cy.get(CIRCLE_ATTRIBUTES_PANE).find(FILL_COLOUR_BUTTON).find(COLOUR_PICKER_INPUT).should("be.visible");
    }

    static verifyCircleFillOpacityInput() {
        cy.get(CIRCLE_ATTRIBUTES_PANE).find(FILL_OPACITY_INPUT_HEADER).should("be.visible").and("have.text", "Fill Opacity");
        cy.get(CIRCLE_ATTRIBUTES_PANE).find(FILL_OPACITY_INPUT).should("be.visible");
    }

    static verifyCircleBorderColourInput() {
        cy.get(CIRCLE_ATTRIBUTES_PANE).find(BORDER_COLOUR_BUTTON).should("be.visible").and("have.text", "Border Colour");
        cy.get(CIRCLE_ATTRIBUTES_PANE).find(BORDER_COLOUR_BUTTON).find(COLOUR_PICKER_BUTTON).should("be.visible");
        cy.get(CIRCLE_ATTRIBUTES_PANE).find(BORDER_COLOUR_BUTTON).find(COLOUR_PICKER_INPUT).should("be.visible");
    }

    static verifyCircleBorderOpacityInput() {
        cy.get(CIRCLE_ATTRIBUTES_PANE).find(BORDER_OPACITY_INPUT_HEADER).should("be.visible").and("have.text", "Border Opacity");
        cy.get(CIRCLE_ATTRIBUTES_PANE).find(BORDER_OPACITY_INPUT).should("be.visible");
    }

    static verifyCircleBorderStyleInput() {
        cy.get(CIRCLE_ATTRIBUTES_PANE).find(BORDER_STYLE_SELECT_INPUT).should("be.visible").and("have.text", "Border Style");
    }

    static verifyCircleThicknessInput() {
        cy.get(CIRCLE_ATTRIBUTES_PANE).find(BORDER_THICKNESS_BUTTON).should("be.visible").and("have.text", "Thickness");
    }

    static clickCircleSectionHeader() {
        cy.get(CIRCLE_ATTRIBUTES_PANE).find(SECTION_HEADER).click();
    }

    static verifyCircleSectionIsCollapsed() {
        cy.get(CIRCLE_ATTRIBUTES_PANE).find(SECTION_HEADER).should("be.visible");
        cy.get(CIRCLE_ATTRIBUTES_PANE).find(QUANTITY_INPUT_HEADER).should("not.be.visible");
        cy.get(CIRCLE_ATTRIBUTES_PANE).find(QUANTITY_INPUT).should("not.be.visible");
        cy.get(CIRCLE_ATTRIBUTES_PANE).find(HEIGHT_INPUT_HEADER).should("not.be.visible");
        cy.get(CIRCLE_ATTRIBUTES_PANE).find(FILL_COLOUR_BUTTON).should("not.be.visible");
        cy.get(CIRCLE_ATTRIBUTES_PANE).find(FILL_OPACITY_INPUT).should("not.be.visible");
        cy.get(CIRCLE_ATTRIBUTES_PANE).find(BORDER_COLOUR_BUTTON).should("not.be.visible");
        cy.get(CIRCLE_ATTRIBUTES_PANE).find(BORDER_OPACITY_INPUT).should("not.be.visible");
        cy.get(CIRCLE_ATTRIBUTES_PANE).find(BORDER_STYLE_SELECT_INPUT).should("not.be.visible");
        cy.get(CIRCLE_ATTRIBUTES_PANE).find(BORDER_THICKNESS_BUTTON).should("not.be.visible");
    }

    static clickCircleFillColourPicker() {
        cy.get(CIRCLE_ATTRIBUTES_PANE).find(FILL_COLOUR_BUTTON).find(COLOUR_PICKER_BUTTON).click();
    }

    static clickCircleBorderColourPicker() {
        cy.get(CIRCLE_ATTRIBUTES_PANE).find(BORDER_COLOUR_BUTTON).find(COLOUR_PICKER_BUTTON).click();
    }

    static clickCircleBorderStyleButton() {
        cy.get(CIRCLE_ATTRIBUTES_PANE).find(BORDER_STYLE_SELECT_INPUT).should("be.visible");
    }

    static verifyCircleBorderStylesDropdown() {
        cy.get(CIRCLE_ATTRIBUTES_PANE).find(BORDER_STYLE_DROPDOWN).should("be.visible");
    }
}
