import { When } from "cypress-cucumber-preprocessor/steps";
import { CalculationAreaPanePage } from "../../../../pages/CalculationAreaPanePage";
import { CommonPropertiesPanePage } from "../../../../pages/CommonPropertiesPanePage";

When("calculation pane contains area section", () => {
    CalculationAreaPanePage.verifyAreaSection();
});

When("user clicks area section on calculation pane", () => {
    CalculationAreaPanePage.clickAreaSectionHeader();
});

When("area section attributes are hiden", () => {
    CalculationAreaPanePage.verifyAreaSectionIsHiden();
});

When("user clicks on area fill colour picker", () => {
    CalculationAreaPanePage.clickFillColourPicker();
});

When("user clicks on area border style input", () => {
    CalculationAreaPanePage.clickBorderStyleInput();
});

When("user clicks on area border colour picker", () => {
    CalculationAreaPanePage.clickBorderColourPicker();
});

When("area border styles dropdown is displayed", () => {
    CalculationAreaPanePage.verifyAreaBorderStylesDropdown();
});
