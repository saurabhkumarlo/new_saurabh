/// <reference types="Cypress" />

const MOUSE_BUTTON = "[data-icon=mouse-pointer]";
const LOCATION_BUTTON = "[data-icon=location]";
const ARROW_BUTTON = "[data-icon=arrows-alt-h]";
const POLYGON_BUTTON = "[data-icon=draw-polygon]";
const CIRLCE_BUTTON = "[data-icon=circle]";
const TILDE_BUTTON = "[data-icon=tilde]";
const OBJECT_BUTTON = "[data-icon=object-group]";
const COMMENT_BUTTON = "[data-icon=comment-alt-dots]";
const IMAGE_BUTTON = "[data-icon=image]";
const LONG_ARROW_BUTTON = "[data-icon=long-arrow-alt-right]";
const SEARCH_BUTTON = "[data-icon=search]";
const EXPAND_BUTTON = "[data-icon=expand]";
const DOWNLOAD_BUTTON = "[data-icon=file-download]";
const EXPORT_BUTTON = "[data-icon=file-export]";

const EXPORT_TO_CSV_BUTTON = "Export to CSV";
const COPY_TO_CLIPBOARD_BUTTON = "Copy to Clipboard";
const CANCEL_BUTTON = "Cancel";

const FOLDER_EXPORT_RADIO_BUTTON = "Folder Export [Everything]";
const OBJECT_RADIO_BUTTON = "Objects [Selection]";
const NET_OBJECT_RADIO_BUTTON = "Objects (Net) [Selection]";
const OBJECT_NO_FOLDER_STRUCTURE_RADIO_BUTTON = "Objects, no folder structure (Net) [Selection]";
const ROWS_RADIO_BUTTON = "Rows [Selection]";
const ROWS_SUM_RADIO_BUTTON = "Rows (Sum) [Selection]";
const ROWS_SUM_PER_FOLDER_RADIO_BUTTON = "Rows (Sum per Folder) [Everything]";
const BIDCON_EXPORT_RADIO_BUTTON = "BidCon Export [Everything]";

export class ToolbarPage {
    static verifyToolbarButtonsAreVisible() {
        cy.wait(1000);
        cy.itemIsVisible(MOUSE_BUTTON);
        cy.itemIsVisible(ARROW_BUTTON);
        cy.itemIsVisible(CIRLCE_BUTTON);
        cy.itemIsVisible(TILDE_BUTTON);
        cy.itemIsVisible(OBJECT_BUTTON);
        cy.itemIsVisible(COMMENT_BUTTON);
        cy.itemIsVisible(IMAGE_BUTTON);
        cy.itemIsVisible(LONG_ARROW_BUTTON);
        cy.itemIsVisible(SEARCH_BUTTON);
        cy.itemIsVisible(EXPAND_BUTTON);
        cy.itemIsVisible(DOWNLOAD_BUTTON);
        cy.itemIsVisible(EXPORT_BUTTON);
    }

    static verifyToolbarButtonsAreClicable() {
        cy.clickOnButtonAndCheckFocus(MOUSE_BUTTON);
        cy.clickOnButtonAndCheckFocus(LOCATION_BUTTON);
        cy.clickOnButtonAndCheckFocus(ARROW_BUTTON);
        cy.clickOnButtonAndCheckFocus(POLYGON_BUTTON);
        cy.clickOnButtonAndCheckFocus(CIRLCE_BUTTON);
        cy.clickOnButtonAndCheckFocus(TILDE_BUTTON);
        //cy.clickOnButtonAndCheckFocus(OBJECT_BUTTON)
        cy.clickOnButtonAndCheckFocus(COMMENT_BUTTON);
        cy.clickOnButtonAndCheckFocus(IMAGE_BUTTON);
        cy.clickOnButtonAndCheckFocus(LONG_ARROW_BUTTON);
        cy.clickOnButtonAndCheckFocus(SEARCH_BUTTON);
        cy.clickOnButtonAndCheckFocus(EXPAND_BUTTON);
    }

    static clickDownloadButton() {
        cy.wait(15000);
        cy.clickOnButtonAndCheckFocus(DOWNLOAD_BUTTON);
    }

    static clickExportButton() {
        cy.clickOnButtonAndCheckFocus(EXPORT_BUTTON);
    }

    static verifyProjectIsDownloaded() {
        cy.readFile(Cypress.config("projectRoot") + "/cypress/downloads/Facade plan.pdf");
    }

    static verifyExportPopup() {
        cy.get("span").contains("span", CANCEL_BUTTON).should("be.visible");
        cy.get("span").contains("span", EXPORT_TO_CSV_BUTTON).should("be.visible");
        cy.get("span").contains("span", COPY_TO_CLIPBOARD_BUTTON).should("be.visible");
    }

    static exportToCSVButtonIsDisplayed() {
        cy.get("span").contains("span", EXPORT_TO_CSV_BUTTON).should("be.visible");
    }

    static copyToClipboardIsDisplayed() {
        cy.get("span").contains("span", COPY_TO_CLIPBOARD_BUTTON).should("be.visible");
    }

    static clickCancelButton() {
        cy.get("span").contains("span", CANCEL_BUTTON).click();
    }

    static clickExportToCsvButton() {
        cy.get("span").contains("span", EXPORT_TO_CSV_BUTTON).click();
    }

    static clickCopyToClipboardButton() {
        cy.get("span").contains("span", COPY_TO_CLIPBOARD_BUTTON).click();
    }

    static exportFolder() {
        cy.clickElementFromRadioButtonList(FOLDER_EXPORT_RADIO_BUTTON);
        cy.get("span").contains("span", EXPORT_TO_CSV_BUTTON).click();
        cy.get("span").contains("span", EXPORT_TO_CSV_BUTTON).should("not.be.visible");
    }

    static exportObjects() {
        cy.clickElementFromRadioButtonList(OBJECT_RADIO_BUTTON);
        cy.get("span").contains("span", EXPORT_TO_CSV_BUTTON).click();
        cy.get("span").contains("span", EXPORT_TO_CSV_BUTTON).should("not.be.visible");
    }

    static exportNetObjects() {
        cy.clickElementFromRadioButtonList(NET_OBJECT_RADIO_BUTTON);
        cy.get("span").contains("span", EXPORT_TO_CSV_BUTTON).click();
        cy.get("span").contains("span", EXPORT_TO_CSV_BUTTON).should("not.be.visible");
    }

    static exportObjectsNoFolder() {
        cy.clickElementFromRadioButtonList(OBJECT_NO_FOLDER_STRUCTURE_RADIO_BUTTON);
        cy.get("span").contains("span", EXPORT_TO_CSV_BUTTON).click();
        cy.get("span").contains("span", EXPORT_TO_CSV_BUTTON).should("not.be.visible");
    }

    static exportRows() {
        cy.clickElementFromRadioButtonList(ROWS_RADIO_BUTTON);
        cy.get("span").contains("span", EXPORT_TO_CSV_BUTTON).click();
        cy.get("span").contains("span", EXPORT_TO_CSV_BUTTON).should("not.be.visible");
    }

    static exportRowsSum() {
        cy.clickElementFromRadioButtonList(ROWS_SUM_RADIO_BUTTON);
        cy.get("span").contains("span", EXPORT_TO_CSV_BUTTON).click();
        cy.get("span").contains("span", EXPORT_TO_CSV_BUTTON).should("not.be.visible");
    }

    static exportRowsSumPerFolder() {
        cy.clickElementFromRadioButtonList(ROWS_SUM_PER_FOLDER_RADIO_BUTTON);
        cy.get("span").contains("span", EXPORT_TO_CSV_BUTTON).click();
        cy.get("span").contains("span", EXPORT_TO_CSV_BUTTON).should("not.be.visible");
    }

    static exportBidCon() {
        cy.clickElementFromRadioButtonList(BIDCON_EXPORT_RADIO_BUTTON);
        cy.get("span").contains("span", EXPORT_TO_CSV_BUTTON).click();
        cy.get("span").contains("span", EXPORT_TO_CSV_BUTTON).should("not.be.visible");
    }
}
