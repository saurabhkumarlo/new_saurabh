import { When } from "cypress-cucumber-preprocessor/steps";
import { CalculationPointPanePage } from "../../../../pages/CalculationPointPage";
import { CommonPropertiesPanePage } from "../../../../pages/CommonPropertiesPanePage";

When("calculation pane contains point section", () => {
    CalculationPointPanePage.verifyPointSection();
});

When("user clicks point section on calculation pane", () => {
    CalculationPointPanePage.clickPointSectionHeader();
});

When("point section attributes are hiden", () => {
    CalculationPointPanePage.verifyPointSectionIsHiden();
});

When("user clicks on point fill colour picker", () => {
    CalculationPointPanePage.clickFillColourPicker();
});

When("user clicks on point icon style input", () => {
    CalculationPointPanePage.clickPointStyleInput();
});

When("point icon styles dropdown is displayed", () => {
    CalculationPointPanePage.verifyPointIconDropdown();
});
