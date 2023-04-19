import { When } from "cypress-cucumber-preprocessor/steps";
import { CalculateRowsPage } from "../../../../pages/CalculateRowsPage";

When("user clicks on add new row input", () => {
    CalculateRowsPage.clickNewRowInput();
});

When("user enters new row data", () => {
    CalculateRowsPage.enterNewRowData();
});

When("new row is added to annotation", () => {
    CalculateRowsPage.verifyNewRowIsEntered();
});

When("user selects recently added row", () => {
    CalculateRowsPage.selectFirstRow();
});

When("user clicks RMB on selected row", () => {
    CalculateRowsPage.clickRmbOnRow();
});

When("user selects {string} from rows context menu", (buttonLabel) => {
    CalculateRowsPage.selectButtonFronRowsContextMenu(buttonLabel);
});

When("selected row is deleted", () => {
    CalculateRowsPage.verifyRowsTableIsEmpty();
});

When("copied rows are added to annotation", () => {
    CalculateRowsPage.verifyCopiedRowsAreAdded();
});

When("copied rows replaces previous one", () => {
    CalculateRowsPage.verifyRowsAreReplacedWithCopied();
});

When("confirmation screen for deleting multiple rows is displayed", () => {
    CalculateRowsPage.verifyDeleteMultipleRowsPopupIsDisplayed();
});

When("user confirms to delete multiple rows", () => {
    CalculateRowsPage.clickDeleteOnConfirmationPopup();
});
When("replace rows confirmation screen is displayed", () => {
    CalculateRowsPage.verifyReplaceMultipleRowsPopupIsDisplayed();
});

When("user confirms to replace rows", () => {
    CalculateRowsPage.confirmRowsReplacement();
});

When("user selects all rows", () => {
    CalculateRowsPage.selectAllRows();
});
