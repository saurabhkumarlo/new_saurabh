import { When } from "cypress-cucumber-preprocessor/steps";
import { CalculationLinePanePage } from "../../../../pages/CalculationLinePanePage";

When("calculation pane contains line section", () => {
    CalculationLinePanePage.verifyLineSection();
});

When("user clicks line section on calculation pane", () => {
    CalculationLinePanePage.clickLineSectionHeader();
});

When("line section attributes are hiden", () => {
    CalculationLinePanePage.verifyLineSectionIsHidden();
});

When("user clicks on line fill colour picker", () => {
    CalculationLinePanePage.clickLineSectionColourPicker();
});

When("user clicks on line style input", () => {
    CalculationLinePanePage.clickLineStylePicker();
});

When("styles dropdown is displayed", () => {
    CalculationLinePanePage.verifyLineStyleDropdown();
});

When("user clicks on line start icon style button", () => {
    CalculationLinePanePage.clickLineStartIconButton();
});

When("start icon style dropdown is displayed", () => {
    CalculationLinePanePage.verifyStartIconDropdownIsDisplayed();
});

When("user clicks on line end icon style button", () => {
    CalculationLinePanePage.clickLineEndIconButton();
});

When("end icon style dropdown is displayed", () => {
    CalculationLinePanePage.verifyEndLineIconDropdownIsDisplayed();
});
