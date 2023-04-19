import { When } from "cypress-cucumber-preprocessor/steps";
import { CalculationDrawPanePage } from "../../../../pages/CalculationDrawPanePage";
import { CommonPropertiesPanePage } from "../../../../pages/CommonPropertiesPanePage";

When("calculation pane contains draw section", () => {
    CalculationDrawPanePage.verifyDrawSection();
});

When("user clicks draw section on calculation pane", () => {
    CalculationDrawPanePage.clickDrawSectionHeader();
});

When("draw section attributes are hiden", () => {
    CalculationDrawPanePage.verifyDrawSectionIsHiden();
});

When("user clicks on draw fill colour picker", () => {
    CalculationDrawPanePage.clickDrawFillColourPicker();
});

When("user clicks on draw border style input", () => {
    CalculationDrawPanePage.clickDrawBorderStyleInput();
});

When("user clicks on draw border colour picker", () => {
    CalculationDrawPanePage.clickDrawBorderColourPicker();
});

When("draw border styles dropdown is displayed", () => {
    CalculationDrawPanePage.verifyDrawBorderStylesDropdown();
});
