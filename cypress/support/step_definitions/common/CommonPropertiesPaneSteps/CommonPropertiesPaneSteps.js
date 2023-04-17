import { When } from "cypress-cucumber-preprocessor/steps";
import { CommonPropertiesPanePage } from "../../../../pages/CommonPropertiesPanePage";

When("colour picker is displayed", () => {
    CommonPropertiesPanePage.verifyColourPicker();
});
