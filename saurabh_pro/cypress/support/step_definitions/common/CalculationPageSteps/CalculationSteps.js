import { When } from "cypress-cucumber-preprocessor/steps";
import { CalculationPage } from "../../../../pages/CalculationPage";

When("user goes to calculate view", () => {
    CalculationPage.navigateToCalculationPage();
});
