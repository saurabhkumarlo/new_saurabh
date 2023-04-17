import { When } from "cypress-cucumber-preprocessor/steps";
import { CalculationTreePage } from "../../../../pages/CalculationTreePage";

When("user opens {string} folder in tree", (folderName) => {
    CalculationTreePage.openFolder(folderName);
});

When("user selects {string} object", (elementLabel) => {
    CalculationTreePage.selectElementType(elementLabel);
});

When("user clicks RMB on {string}", (elementLabel) => {
    CalculationTreePage.clickRmbOnElement(elementLabel);
});

When("user selects {string} from tree context menu", (buttonLabel) => {
    CalculationTreePage.clickOnTreeContextMenuButton(buttonLabel);
});
