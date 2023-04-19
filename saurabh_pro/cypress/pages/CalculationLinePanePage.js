/// <reference types="Cypress" />

const LINE_ATTRIBUTES_PANE = "#line_pane";
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
const LINE_THICKNESS_BUTTON = "#autocomplete-thickness--button";
const LINE_SELECT_START_ICON_TITLE = "#select-start--title";
const LINE_SELECT_START_ICON_BUTTON = "#select-start--button";
const LINE_SELECT_END_ICON_TITLE = "#select-end--title";
const LINE_SELECT_END_ICON_BUTTON = "#select-end--button";
const LINE_STYLE_INPUT_TITLE = "#select-style--title";
const LINE_STYLE_INPUT = "#select-style--button";
const SELECT_DROPDOWN = ".Select_Option";

export class CalculationLinePanePage {
    static verifyLineSection() {
        this.verifyLineSectionHeader();
        this.verifyLineSectionQuantityInput();
        this.verifyLineHeightInput();
        this.verifyLineFillColourInput();
        this.verifyLineFillOpacityInput();
        this.verifyLineStyleInput();
        this.verifyLineThicknessInput();
        this.verifyLineStartIconInput();
        this.verifyLineEndIconInput();
    }

    static verifyLineSectionHeader() {
        cy.get(LINE_ATTRIBUTES_PANE).find(SECTION_HEADER).should("exist").and("have.text", "Line");
    }

    static verifyLineSectionQuantityInput() {
        cy.get(LINE_ATTRIBUTES_PANE).find(QUANTITY_INPUT_HEADER).should("exist").and("have.text", "Quantity");
        cy.get(LINE_ATTRIBUTES_PANE).find(QUANTITY_INPUT).should("exist");
    }

    static verifyLineHeightInput() {
        cy.get(LINE_ATTRIBUTES_PANE).find(HEIGHT_INPUT_HEADER).should("exist").and("have.text", "Height");
        cy.get(LINE_ATTRIBUTES_PANE).find(HEIGHT_INPUT).should("exist");
    }

    static verifyLineFillColourInput() {
        cy.get(LINE_ATTRIBUTES_PANE).find(FILL_COLOUR_BUTTON).should("exist").and("have.text", "Fill Colour");
        cy.get(LINE_ATTRIBUTES_PANE).find(FILL_COLOUR_BUTTON).find(COLOUR_PICKER_BUTTON).should("exist");
        cy.get(LINE_ATTRIBUTES_PANE).find(FILL_COLOUR_BUTTON).find(COLOUR_PICKER_INPUT).should("exist");
    }

    static verifyLineFillOpacityInput() {
        cy.get(LINE_ATTRIBUTES_PANE).find(FILL_OPACITY_INPUT_HEADER).should("exist").and("have.text", "Fill Opacity");
        cy.get(LINE_ATTRIBUTES_PANE).find(FILL_OPACITY_INPUT).should("exist");
    }

    static verifyLineStyleInput() {
        cy.get(LINE_ATTRIBUTES_PANE).find(LINE_STYLE_INPUT_TITLE).should("exist").and("have.text", "Style");
        cy.get(LINE_ATTRIBUTES_PANE).find(LINE_STYLE_INPUT).should("exist");
    }

    static verifyLineThicknessInput() {
        cy.get(LINE_ATTRIBUTES_PANE).find(LINE_THICKNESS_BUTTON).should("exist");
    }

    static verifyLineStartIconInput() {
        cy.get(LINE_ATTRIBUTES_PANE).find(LINE_SELECT_START_ICON_TITLE).should("exist").and("have.text", "Start");
        cy.get(LINE_ATTRIBUTES_PANE).find(LINE_SELECT_START_ICON_BUTTON).should("exist");
    }

    static verifyLineEndIconInput() {
        cy.get(LINE_ATTRIBUTES_PANE).find(LINE_SELECT_END_ICON_TITLE).should("exist").and("have.text", "End");
        cy.get(LINE_ATTRIBUTES_PANE).find(LINE_SELECT_END_ICON_BUTTON).should("exist");
    }

    static clickLineSectionHeader() {
        cy.get(LINE_ATTRIBUTES_PANE).find(SECTION_HEADER).click();
    }

    static verifyLineSectionIsHidden() {
        cy.get(LINE_ATTRIBUTES_PANE).find(SECTION_HEADER).should("be.visible");
        cy.get(LINE_ATTRIBUTES_PANE).find(QUANTITY_INPUT_HEADER).should("not.be.visible");
        cy.get(LINE_ATTRIBUTES_PANE).find(QUANTITY_INPUT).should("not.be.visible");
        cy.get(LINE_ATTRIBUTES_PANE).find(HEIGHT_INPUT_HEADER).should("not.be.visible");
        cy.get(LINE_ATTRIBUTES_PANE).find(HEIGHT_INPUT).should("not.be.visible");
        cy.get(LINE_ATTRIBUTES_PANE).find(FILL_COLOUR_BUTTON).should("not.be.visible");
        cy.get(LINE_ATTRIBUTES_PANE).find(FILL_OPACITY_INPUT_HEADER).should("not.be.visible");
        cy.get(LINE_ATTRIBUTES_PANE).find(FILL_OPACITY_INPUT).should("not.be.visible");
        cy.get(LINE_ATTRIBUTES_PANE).find(LINE_STYLE_INPUT_TITLE).should("not.be.visible");
        cy.get(LINE_ATTRIBUTES_PANE).find(LINE_STYLE_INPUT).should("not.be.visible");
        cy.get(LINE_ATTRIBUTES_PANE).find(LINE_SELECT_START_ICON_TITLE).should("not.be.visible");
        cy.get(LINE_ATTRIBUTES_PANE).find(LINE_SELECT_START_ICON_BUTTON).should("not.be.visible");
        cy.get(LINE_ATTRIBUTES_PANE).find(LINE_SELECT_END_ICON_TITLE).should("not.be.visible");
        cy.get(LINE_ATTRIBUTES_PANE).find(LINE_SELECT_END_ICON_BUTTON).should("not.be.visible");
    }

    static clickLineSectionColourPicker() {
        cy.get(LINE_ATTRIBUTES_PANE).find(COLOUR_PICKER_BUTTON).find(COLOUR_PICKER_BUTTON).click();
    }

    static clickLineStylePicker() {
        cy.get(LINE_ATTRIBUTES_PANE).find(LINE_STYLE_INPUT).click();
    }

    static verifyLineStyleDropdown() {
        cy.get(LINE_ATTRIBUTES_PANE).find(SELECT_DROPDOWN).should("be.visible");
    }

    static clickLineStartIconButton() {
        cy.get(LINE_ATTRIBUTES_PANE).find(LINE_SELECT_START_ICON_BUTTON).click();
    }

    static verifyStartIconDropdownIsDisplayed() {
        cy.get(LINE_ATTRIBUTES_PANE).find(LINE_SELECT_START_ICON_BUTTON).find(SELECT_DROPDOWN).should("be.visible");
    }

    static clickLineEndIconButton() {
        cy.get(LINE_ATTRIBUTES_PANE).find(LINE_SELECT_END_ICON_BUTTON).click();
    }

    static verifyEndLineIconDropdownIsDisplayed() {
        cy.get(LINE_ATTRIBUTES_PANE).find(LINE_SELECT_END_ICON_BUTTON).find(SELECT_DROPDOWN).should("be.visible");
    }
}
