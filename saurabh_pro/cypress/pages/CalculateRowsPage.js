/// <reference types="Cypress" />

import { rowsData } from "../fixtures/text_helpers/RowsTextHelper";

const ENTER_NEW_ROW_INPUT = ".Calculate_Rows_Add_Row";
const ROWS_TABLE_CONTAINER = ".Calculate_Rows_Container";
const ROWS_TABLE_BODY = ".ant-table-tbody";
const ROWS_TABLE_CELL = "td";
const ROWS_TABLE_CHECKBOX = '[type="checkbox"]';
const ROWS_CONTEXT_MENU = "li";
const DIALOG_BODY = ".ant-modal-content";
const DIALOG_TITLE = ".ant-modal-title";
const REPLACE_DIALOG_SECOND_TITLE = "p";
const DIALOG_TABLE_HEADER = ".ant-table-header";
const DIALOG_TABLE_CONTENT = ".ant-table-tbody";
const DIALOG_BUTTON = "button";
const DIALOG_TABLE_BODY = ".ant-table-body";

export class CalculateRowsPage {
    static clickNewRowInput() {
        cy.get(ENTER_NEW_ROW_INPUT).click();
    }

    static enterNewRowData() {
        cy.get(ENTER_NEW_ROW_INPUT).click().type(`${rowsData.newRowInputData}{enter}`);
    }

    static verifyNewRowIsEntered() {
        cy.get(ROWS_TABLE_CONTAINER)
            .find(ROWS_TABLE_BODY)
            .find(ROWS_TABLE_CELL)
            .should(($lis) => {
                expect($lis).to.have.length(13);
                expect($lis.eq(1)).to.have.text("Not started");
                expect($lis.eq(2)).to.have.descendants("[value=PROFFESION1]");
                expect($lis.eq(3)).to.have.descendants("[value=E2E-TESTS]");
                expect($lis.eq(4)).to.have.descendants("[value=SEGMENT-E2E]");
                expect($lis.eq(5)).to.have.descendants("[value=ACTION-E2E]");
                expect($lis.eq(6)).to.have.descendants("[value=MATERIAL-E2E]");
                expect($lis.eq(7)).to.have.descendants('[value="1.456"]');
                expect($lis.eq(8)).to.have.descendants("[value=ST]");
                expect($lis.eq(9)).to.have.descendants("[value=1000]");
                expect($lis.eq(10)).to.have.descendants('[value="10:10"]');
            });
    }

    static selectFirstRow() {
        cy.get(ROWS_TABLE_CONTAINER).find(ROWS_TABLE_BODY).find(ROWS_TABLE_CELL).find(ROWS_TABLE_CHECKBOX).click();
    }

    static clickRmbOnRow() {
        cy.get(ROWS_TABLE_CONTAINER).find(ROWS_TABLE_BODY).find(ROWS_TABLE_CELL).find("#rc_select_2").rightclick();
    }

    static selectButtonFronRowsContextMenu(buttonLabel) {
        cy.get(ROWS_CONTEXT_MENU).contains(buttonLabel).click();
    }

    static verifyRowsTableIsEmpty() {
        cy.get(ROWS_TABLE_CONTAINER)
            .find(ROWS_TABLE_BODY)
            .find(ROWS_TABLE_CELL)
            .should(($lis) => {
                expect($lis).to.have.length(1);
            });
    }

    static verifyCopiedRowsAreAdded() {
        cy.get(ROWS_TABLE_CONTAINER)
            .find(ROWS_TABLE_BODY)
            .find(ROWS_TABLE_CELL)
            .should(($lis) => {
                expect($lis).to.have.length(26);
                expect($lis.eq(1)).to.have.text("Review");
                expect($lis.eq(2)).to.have.descendants("[value=ROW_TO_COPY1]");
                expect($lis.eq(3)).to.have.descendants("[value=PHASE_TO_COPY1]");
                expect($lis.eq(4)).to.have.descendants("[value=SEGMENT_TO_COPY1]");
                expect($lis.eq(5)).to.have.descendants("[value=ACTION_TO_COPY1]");
                expect($lis.eq(6)).to.have.descendants("[value=MATERIAL_TO_COPY1]");
                expect($lis.eq(7)).to.have.descendants('[value="1.000"]');
                expect($lis.eq(8)).to.have.descendants("[value=st]");
                expect($lis.eq(10)).to.have.descendants('[value="01:01"]');
                expect($lis.eq(14)).to.have.text("In Progress");
                expect($lis.eq(15)).to.have.descendants("[value=ROW_TO_COPY2]");
                expect($lis.eq(16)).to.have.descendants("[value=PHASE_TO_COPY2]");
                expect($lis.eq(17)).to.have.descendants("[value=SEGMENT_TO_COPY2]");
                expect($lis.eq(18)).to.have.descendants("[value=ACTION_TO_COPY2]");
                expect($lis.eq(19)).to.have.descendants("[value=MATERIAL_TO_COPY2]");
                expect($lis.eq(20)).to.have.descendants('[value="2.000"]');
                expect($lis.eq(21)).to.have.descendants("[value=m2]");
                expect($lis.eq(23)).to.have.descendants('[value="22:22"]');
            });
    }

    static verifyOldRowsAreRemoved() {
        cy.get(ROWS_TABLE_CONTAINER)
            .find(ROWS_TABLE_BODY)
            .find(ROWS_TABLE_CELL)
            .should(($lis) => {
                expect($lis).to.not.have.descendants("[value=ROW_TO_COPY1]");
                expect($lis).to.not.have.descendants("[value=PHASE_TO_COPY1]");
                expect($lis).to.not.have.descendants("[value=SEGMENT_TO_COPY1]");
                expect($lis).to.not.have.descendants("[value=ACTION_TO_COPY1]");
                expect($lis).to.not.have.descendants("[value=MATERIAL_TO_COPY1]");
                expect($lis).to.not.have.descendants('[value="1.000"]');
                expect($lis).to.not.have.descendants("[value=ST]");
                expect($lis).to.not.have.descendants("[value=1]");
                expect($lis).to.not.have.descendants('[value="01:01"]');
                expect($lis).to.not.have.descendants("[value=ROW_TO_COPY2]");
                expect($lis).to.not.have.descendants("[value=PHASE_TO_COPY2]");
                expect($lis).to.not.have.descendants("[value=SEGMENT_TO_COPY2]");
                expect($lis).to.not.have.descendants("[value=ACTION_TO_COPY2]");
                expect($lis).to.not.have.descendants("[value=MATERIAL_TO_COPY2]");
                expect($lis).to.not.have.descendants('[value="2.000"]');
                expect($lis).to.not.have.descendants("[value=M2]");
                expect($lis).to.not.have.descendants("[value=2]");
                expect($lis).to.not.have.descendants('[value="22:22"]');
            });
    }

    static verifyNewRowsReplacedOld() {
        cy.get(ROWS_TABLE_CONTAINER)
            .find(ROWS_TABLE_BODY)
            .find(ROWS_TABLE_CELL)
            .should(($lis) => {
                expect($lis).to.have.descendants("[value=REPLACED_ROW1]");
                expect($lis).to.have.descendants("[value=REPLACED_PHASE1]");
                expect($lis).to.have.descendants("[value=REPLACED_SEGMENT1]");
                expect($lis).to.have.descendants("[value=REPLACED_ACTION1]");
                expect($lis).to.have.descendants("[value=REPLACED_MATERIAL1]");
                expect($lis).to.have.descendants('[value="99.000"]');
                expect($lis).to.have.descendants('[value="m3"]');
                expect($lis).to.have.descendants('[value="99.000"]');
                expect($lis).to.have.descendants('[value="23:59"]');
                expect($lis).to.have.descendants("[value=REPLACED_ROW2]");
                expect($lis).to.have.descendants("[value=REPLACED_PHASE2]");
                expect($lis).to.have.descendants("[value=REPLACED_SEGMENT2]");
                expect($lis).to.have.descendants("[value=REPLACED_ACTION2]");
                expect($lis).to.have.descendants("[value=REPLACED_MATERIAL2]");
                expect($lis).to.have.descendants('[value="77.000"]');
                expect($lis).to.have.descendants('[value="m"]');
                expect($lis).to.have.descendants('[value="23:57"]');
            });
    }

    static verifyRowsAreReplacedWithCopied() {
        this.verifyOldRowsAreRemoved();
        this.verifyNewRowsReplacedOld();
    }

    static verifyDeleteConfirmationPopupLayout() {
        cy.wait(500);
        cy.get(DIALOG_BODY)
            .find(DIALOG_TITLE)
            .should(($lis) => {
                expect($lis).to.have.text("Delete Rows");
            });
        cy.get(DIALOG_BODY).find(DIALOG_TABLE_HEADER).should("be.visible");
        cy.get(DIALOG_BODY).find(DIALOG_TABLE_CONTENT).should("be.visible");
        cy.get(DIALOG_BODY).find(DIALOG_BUTTON).contains("Cancel").should("be.visible");
        cy.get(DIALOG_BODY).find(DIALOG_BUTTON).contains("Delete").should("be.visible");
    }

    static verifyDeleteConfirmationPopupData() {
        cy.get(DIALOG_TABLE_BODY)
            .find(ROWS_TABLE_CELL)
            .should(($lis) => {
                expect($lis).to.contain.text("REPLACED_ROW1");
                expect($lis).to.contain.text("REPLACED_PHASE1");
                expect($lis).to.contain.text("REPLACED_SEGMENT1");
                expect($lis).to.contain.text("REPLACED_ACTION1");
                expect($lis).to.contain.text("REPLACED_MATERIAL1");
                expect($lis).to.contain.text("99.000");
                expect($lis).to.contain.text("m3");
                expect($lis).to.contain.text("23:59");
                expect($lis).to.contain.text("REPLACED_ROW2");
                expect($lis).to.contain.text("REPLACED_PHASE2");
                expect($lis).to.contain.text("REPLACED_SEGMENT2");
                expect($lis).to.contain.text("REPLACED_ACTION2");
                expect($lis).to.contain.text("REPLACED_MATERIAL2");
                expect($lis).to.contain.text("77.000");
                expect($lis).to.contain.text("m");
                expect($lis).to.contain.text("23:57");
            });
    }

    static verifyDeleteMultipleRowsPopupIsDisplayed() {
        this.verifyDeleteConfirmationPopupLayout();
        this.verifyDeleteConfirmationPopupData();
    }

    static clickDeleteOnConfirmationPopup() {
        cy.get(DIALOG_BODY).find(DIALOG_BUTTON).contains("Delete").click();
    }

    static verifyReplaceMultipleRowsPopupIsDisplayed() {
        cy.wait(500);
        cy.get(DIALOG_BODY)
            .find(DIALOG_TITLE)
            .should(($lis) => {
                expect($lis).to.have.text("Replacing rows in current selection");
            });
        cy.get(DIALOG_BODY)
            .find(REPLACE_DIALOG_SECOND_TITLE)
            .should(($lis) => {
                expect($lis).to.have.text("Will be replace with following");
            });
        cy.get(DIALOG_BODY).find(DIALOG_TABLE_HEADER).should("be.visible");
        cy.get(DIALOG_BODY).find(DIALOG_TABLE_CONTENT).should("be.visible");
        cy.get(DIALOG_BODY).find(DIALOG_BUTTON).contains("Cancel").should("be.visible");
        cy.get(DIALOG_BODY).find(DIALOG_BUTTON).contains("Replace").should("be.visible");
    }

    static confirmRowsReplacement() {
        cy.get(DIALOG_BODY).find(DIALOG_BUTTON).contains("Replace").click();
    }

    static selectAllRows() {
        cy.get(ROWS_TABLE_CONTAINER).find(ROWS_TABLE_BODY).find(ROWS_TABLE_CELL).find(ROWS_TABLE_CHECKBOX).click({ multiple: true });
    }
}
