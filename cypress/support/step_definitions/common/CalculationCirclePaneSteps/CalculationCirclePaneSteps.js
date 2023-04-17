import { When } from "cypress-cucumber-preprocessor/steps";
import { CalculationCirclePanePage } from "../../../../pages/CalculationCirclePanePage";

When("calculation pane contains circle section", () => {
    CalculationCirclePanePage.verifyCircleSection();
});

When("user clicks circle section on calculation pane", () => {
    CalculationCirclePanePage.clickCircleSectionHeader();
});

When("circle section attributes are hiden", () => {
    CalculationCirclePanePage.verifyCircleSectionIsCollapsed();
});

When("user clicks on circle fill colour picker", () => {
    CalculationCirclePanePage.clickCircleFillColourPicker();
});

When("user clicks on circle border colour picker", () => {
    CalculationCirclePanePage.clickCircleBorderColourPicker();
});

When("user clicks on circle border style input", () => {
    CalculationCirclePanePage.clickCircleBorderStyleButton();
});

When("circle border styles dropdown is displayed", () => {
    CalculationCirclePanePage.verifyCircleBorderStylesDropdown();
});
