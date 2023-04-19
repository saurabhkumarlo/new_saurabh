/// <reference types="Cypress" />

const COMMENT_ATTRIBUTES_PANE = "#text_pane";
const SECTION_HEADER = ".ant-collapse-header";
const FONT_INPUT_TITLE = "#select-font--title";
const FONT_BUTTON = "#select-font--button";
const FONT_SIZE_TITLE = "#font-size_input-title";
const FONT_SIZE_INPUT = "#font-size_input";
const FONT_DECORATION_TITLE = "#select-decoration--title";
const FONT_DECORATION_INPUT = "#select-decoration--button";
const FONT_DECORATION_BOLD_OPTION = "#select-bold--option";
const FONT_DECORATION_UNDERLINE_OPTION = "#select-underline--option";
const FONT_DECORATION_ITALIC_OPTION = "#select-italic--option";
const FONT_DECORATION_LINE_THROUGH_OPTION = "#select-line-through--option";
const TEXT_COLOUR_BUTTON = "#colour-picker_text-colour--button";
const COLOUR_PICKER_BUTTON = ".Color_Picker_Icon";
const COLOUR_PICKER_INPUT = ".Color_Picker_Input";
const TEXT_OPACITY_TITLE = "#text-opacity_input-title";
const TEXT_OPACITY_INPUT = "#text-opacity_input";
const BORDER_COLOUR_BUTTON = "#colour-picker_border-colour--button";
const BORDER_OPACITY_TITLE = "#border-opacity_input-title";
const BORDER_OPACITY_INPUT = "#border-opacity_input";
const BORDER_THICKNESS_BUTTON = "#autocomplete-thickness--button";
const BORDER_STYLE_SELECT_INPUT = "#select-border-style--button";
const TEXT_INPUT = "#text_input";
const DROPDOWN_LIST = ".ant-select-open";
const DECORATION_DELETE_BUTTON = ".ant-select-selection-item-remove";
const DROPDOWN_OPTION = ".Select_Option";

export class CalculationCommentPanePage {
    static verifyCommentSection() {
        this.verifyCommentSectionHeader();
        this.verifyCommentFontButton();
        this.verifyCommentFontSizeInput();
        this.verifyCommentDecorationInput();
        this.verifyCommentTextColourInput();
        this.verifyCommentTextOpacityInput();
        this.verifyCommentBorderColourInput();
        this.verifyCommentBorderOpacityInput();
        this.verifyCommentBorderStyleInput();
        this.verifyCommentBorderThicknessInput();
        this.verifyCommentTextInput();
    }

    static verifyCommentSectionHeader() {
        cy.get(COMMENT_ATTRIBUTES_PANE).find(SECTION_HEADER).should("be.visible").and("have.text", "Text");
    }

    static verifyCommentFontButton() {
        cy.get(COMMENT_ATTRIBUTES_PANE).find(FONT_BUTTON).should("be.visible");
        cy.get(COMMENT_ATTRIBUTES_PANE).find(FONT_INPUT_TITLE).should("be.visible").and("have.text", "Font");
    }

    static verifyCommentFontSizeInput() {
        cy.get(COMMENT_ATTRIBUTES_PANE).find(FONT_SIZE_TITLE).should("be.visible").and("have.text", "Font Size");
        cy.get(COMMENT_ATTRIBUTES_PANE).find(FONT_SIZE_INPUT).should("be.visible");
    }

    static verifyCommentDecorationInput() {
        cy.get(COMMENT_ATTRIBUTES_PANE).find(FONT_DECORATION_TITLE).should("be.visible").and("have.text", "Decoration");
        cy.get(COMMENT_ATTRIBUTES_PANE).find(FONT_DECORATION_INPUT).should("be.visible");
    }

    static verifyCommentTextColourInput() {
        cy.get(COMMENT_ATTRIBUTES_PANE).find(TEXT_COLOUR_BUTTON).should("be.visible").and("have.text", "Text Colour");
        cy.get(COMMENT_ATTRIBUTES_PANE).find(TEXT_COLOUR_BUTTON).find(COLOUR_PICKER_BUTTON).should("be.visible");
        cy.get(COMMENT_ATTRIBUTES_PANE).find(TEXT_COLOUR_BUTTON).find(COLOUR_PICKER_INPUT).should("be.visible");
    }

    static verifyCommentTextOpacityInput() {
        cy.get(COMMENT_ATTRIBUTES_PANE).find(TEXT_OPACITY_TITLE).should("be.visible").and("have.text", "Text Opacity");
        cy.get(COMMENT_ATTRIBUTES_PANE).find(TEXT_OPACITY_INPUT).should("be.visible");
    }

    static verifyCommentBorderColourInput() {
        cy.get(COMMENT_ATTRIBUTES_PANE).find(BORDER_COLOUR_BUTTON).should("be.visible").and("have.text", "Border Colour");
        cy.get(COMMENT_ATTRIBUTES_PANE).find(BORDER_COLOUR_BUTTON).find(COLOUR_PICKER_BUTTON).should("be.visible");
        cy.get(COMMENT_ATTRIBUTES_PANE).find(BORDER_COLOUR_BUTTON).find(COLOUR_PICKER_INPUT).should("be.visible");
    }

    static verifyCommentBorderOpacityInput() {
        cy.get(COMMENT_ATTRIBUTES_PANE).find(BORDER_OPACITY_TITLE).should("be.visible").and("have.text", "Border Opacity");
        cy.get(COMMENT_ATTRIBUTES_PANE).find(BORDER_OPACITY_INPUT).should("be.visible");
    }

    static verifyCommentBorderStyleInput() {
        cy.get(COMMENT_ATTRIBUTES_PANE).find(BORDER_STYLE_SELECT_INPUT).should("be.visible").and("have.text", "Border Style");
    }

    static verifyCommentBorderThicknessInput() {
        cy.get(COMMENT_ATTRIBUTES_PANE).find(BORDER_THICKNESS_BUTTON).should("be.visible").and("have.text", "Thickness");
    }

    static verifyCommentTextInput() {
        cy.get(COMMENT_ATTRIBUTES_PANE).find(TEXT_INPUT).should("be.visible");
    }

    static clickCommentSectionHeader() {
        cy.get(COMMENT_ATTRIBUTES_PANE).find(SECTION_HEADER).click();
    }

    static verifyCommentSectionIsColapsed() {
        cy.get(COMMENT_ATTRIBUTES_PANE).find(SECTION_HEADER).should("be.visible");
        cy.get(COMMENT_ATTRIBUTES_PANE).find(FONT_BUTTON).should("not.be.visible");
        cy.get(COMMENT_ATTRIBUTES_PANE).find(FONT_SIZE_INPUT).should("not.be.visible");
        cy.get(COMMENT_ATTRIBUTES_PANE).find(FONT_DECORATION_INPUT).should("not.be.visible");
        cy.get(COMMENT_ATTRIBUTES_PANE).find(TEXT_COLOUR_BUTTON).should("not.be.visible");
        cy.get(COMMENT_ATTRIBUTES_PANE).find(TEXT_OPACITY_INPUT).should("not.be.visible");
        cy.get(COMMENT_ATTRIBUTES_PANE).find(BORDER_COLOUR_BUTTON).should("not.be.visible");
        cy.get(COMMENT_ATTRIBUTES_PANE).find(BORDER_OPACITY_INPUT).should("not.be.visible");
        cy.get(COMMENT_ATTRIBUTES_PANE).find(BORDER_STYLE_SELECT_INPUT).should("not.be.visible");
        cy.get(COMMENT_ATTRIBUTES_PANE).find(BORDER_THICKNESS_BUTTON).should("not.be.visible");
        cy.get(COMMENT_ATTRIBUTES_PANE).find(TEXT_INPUT).should("not.be.visible");
    }

    static verifyCommentBorderStylesDropdown() {
        cy.get(COMMENT_ATTRIBUTES_PANE).find(DROPDOWN_OPTION).should("be.visible");
    }

    static clickFontButton() {
        cy.get(COMMENT_ATTRIBUTES_PANE).find(FONT_BUTTON).click();
    }

    static verifyFontDropdownIsDisplayed() {
        cy.get(COMMENT_ATTRIBUTES_PANE).find(FONT_BUTTON).find(DROPDOWN_LIST).should("be.visible");
        cy.get(COMMENT_ATTRIBUTES_PANE).find(FONT_BUTTON).click();
    }

    static clickTextDecorationButton() {
        cy.get(COMMENT_ATTRIBUTES_PANE).find(FONT_DECORATION_INPUT).click("center");
    }

    static verifyDecorationDropdownIsDisplayed() {
        cy.get(FONT_DECORATION_BOLD_OPTION).should("be.visible");
        cy.get(FONT_DECORATION_UNDERLINE_OPTION).should("be.visible");
        cy.get(FONT_DECORATION_ITALIC_OPTION).should("be.visible");
        cy.get(FONT_DECORATION_LINE_THROUGH_OPTION).should("be.visible");
    }

    static selectTextDecoration(decoration) {
        cy.get(`#select-${decoration}--option`).click();
    }

    static verifyDecorationIsAdded(decoration) {
        cy.get(COMMENT_ATTRIBUTES_PANE).find(FONT_DECORATION_INPUT).find(`#selected-${decoration}--option`).should("be.visible");
    }

    static clickCommentTextColourPicker() {
        cy.get(COMMENT_ATTRIBUTES_PANE).find(TEXT_COLOUR_BUTTON).find(COLOUR_PICKER_BUTTON).click();
    }

    static clickCommentBorderColourPicker() {
        cy.get(COMMENT_ATTRIBUTES_PANE).find(BORDER_COLOUR_BUTTON).find(COLOUR_PICKER_BUTTON).click();
    }

    static clickCommentBorderStyleButton() {
        cy.get(COMMENT_ATTRIBUTES_PANE).find(BORDER_STYLE_SELECT_INPUT).click();
    }

    static clickRemoveDecorationButton(decoration) {
        cy.get(COMMENT_ATTRIBUTES_PANE).find(FONT_DECORATION_INPUT).find(`#selected-${decoration}--option`).find(DECORATION_DELETE_BUTTON).click();
    }

    static verifyDecorationIsRemoved() {
        cy.get(COMMENT_ATTRIBUTES_PANE).find(FONT_DECORATION_INPUT).find(`#selected-${decoration}--option`).should("not.be.visible");
    }
}
