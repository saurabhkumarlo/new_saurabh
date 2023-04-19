import { Then, When } from "cypress-cucumber-preprocessor/steps";

import { ToolbarPage } from "../../../../pages/ToolbarPage";

Then("toolbar section is displayed", () => {
    ToolbarPage.verifyToolbarButtonsAreVisible();
});

Then("all buttons are clickable", () => {
    ToolbarPage.verifyToolbarButtonsAreClicable();
});

When("user clicks on download button", () => {
    ToolbarPage.clickDownloadButton();
});

Then("project is downloaded", () => {
    ToolbarPage.verifyProjectIsDownloaded();
});

When("user clicks on export button", () => {
    ToolbarPage.clickExportButton();
});

Then("export popup is displayed", () => {
    ToolbarPage.verifyExportPopup();
});

Then("button Export to CSV is displayed", () => {
    ToolbarPage.exportToCSVButtonIsDisplayed();
});

Then("button Copy to Clipboard is displayed", () => {
    ToolbarPage.copyToClipboardIsDisplayed();
});

Then("user can export folder", () => {
    ToolbarPage.exportFolder();
});

Then("user can export object", () => {
    ToolbarPage.clickExportButton();
    ToolbarPage.exportObjects();
});

Then("user can export object - net", () => {
    ToolbarPage.clickExportButton();
    ToolbarPage.exportNetObjects();
});

Then("user can export object - without structure", () => {
    ToolbarPage.clickExportButton();
    ToolbarPage.exportObjectsNoFolder();
});

Then("user can export rows", () => {
    ToolbarPage.clickExportButton();
    ToolbarPage.exportRows();
});

Then("user can export rows - sum", () => {
    ToolbarPage.clickExportButton();
    ToolbarPage.exportRowsSum();
});

Then("user can export rows - sum per project", () => {
    ToolbarPage.clickExportButton();
    ToolbarPage.exportRowsSumPerFolder();
});

Then("user can export BidCon", () => {
    ToolbarPage.clickExportButton();
    ToolbarPage.exportBidCon();
});
