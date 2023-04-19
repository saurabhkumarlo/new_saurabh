import { buttons as generalButtons } from "../../fixtures/general/generalSelectors";

export const actions = {
    verifySupportChatButtonIsVisible() {
        cy.get(generalButtons.supportChatButton).should("be.visible");
    },

    verifyPageLanguage(language) {
        cy.get("html").should("have.attr", "lang", language);
    },
};
