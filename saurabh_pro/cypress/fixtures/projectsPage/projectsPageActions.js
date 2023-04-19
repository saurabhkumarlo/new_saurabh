import { labels as projectsPageLabels } from "../../fixtures/projectsPage/projectsPageSelectors";

export const actions = {
    verifyProjectsPageIsDisplayed() {
        cy.get(projectsPageLabels.headerOrganisationLabel).should("be.visible");
    },
};
