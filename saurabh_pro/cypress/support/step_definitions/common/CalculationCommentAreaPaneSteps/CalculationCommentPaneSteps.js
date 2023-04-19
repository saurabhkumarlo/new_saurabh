import { When } from "cypress-cucumber-preprocessor/steps";
import { CalculationCommentPanePage } from "../../../../pages/CalculationCommentPanePage";

When("calculation pane contains comment section", () => {
    CalculationCommentPanePage.verifyCommentSection();
});

When("user clicks comment section on calculation pane", () => {
    CalculationCommentPanePage.clickCommentSectionHeader();
});

When("comment section attributes are hiden", () => {
    CalculationCommentPanePage.verifyCommentSectionIsColapsed();
});

When("text border styles dropdown is displayed", () => {
    CalculationCommentPanePage.verifyCommentBorderStylesDropdown();
});

When("user clicks on font button", () => {
    CalculationCommentPanePage.clickFontButton();
});

When("text fonts dropdown is displayed", () => {
    CalculationCommentPanePage.verifyFontDropdownIsDisplayed();
});

When("user clicks on text decoration button", () => {
    CalculationCommentPanePage.clickTextDecorationButton();
});

When("decoration dropdown is displayed", () => {
    CalculationCommentPanePage.verifyDecorationDropdownIsDisplayed();
});

When("user selects {string} decoration", (decoration) => {
    CalculationCommentPanePage.selectTextDecoration(decoration);
});

When("{string} decoration is added", (decoration) => {
    CalculationCommentPanePage.verifyDecorationIsAdded(decoration);
});

When("user clicks on comment text colour picker", () => {
    CalculationCommentPanePage.clickCommentTextColourPicker();
});

When("user clicks on comment border colour picker", () => {
    CalculationCommentPanePage.clickCommentBorderColourPicker();
});

When("user clicks on comment border style input", () => {
    CalculationCommentPanePage.clickCommentBorderStyleButton();
});

When("user clicks delete icon for {string} decoration", (decoration) => {
    CalculationCommentPanePage.clickRemoveDecorationButton(decoration);
});

When("{string} decoration is removed", (decoration) => {
    CalculationCommentPanePage.verifyDecorationIsRemoved(decoration);
});
