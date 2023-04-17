/// <reference types="Cypress" />
const { _ } = Cypress;
const NAME_FILTER_BUTTON = "[id=projects-filter_name]";
const LEAD_FILTER_BUTTON = "[id=projects-filter_lead]";
const DEPARTMENT_FILTER_BUTTON = "[id=projects-filter_department]";
const E2E_FILTER_LABEL = "e2e";
const PROJECT_TABLE_BODY = '[class="ant-table-tbody"]';
const RESET_FILTER_BUTTON = '[class="ant-btn ant-btn-link ant-btn-sm"]';
const ADAM_HEROK_FILTER_LABEL = "Adam Herok";
const EUVIC_FILTER_LABEL = "Euvic";
const APPLY_FILTERS_BUTTON_LABEL = "OK";
const PROJECT_TABLE_ID_LABEL = "ID";
const PROJECT_TABLE_NUMBER_LABEL = "Project Number";
const PROJECT_TABLE_NAME_LABEL = "Project Name";
const PROJECT_TABLE_LEAD_LABEL = "Project Lead";
const PROJECT_TABLE_DEPARTMENT_LABEL = "Department";
const PROJECT_TABLE_CREATED_LABEL = "Created";
const HEADER_TITLE = ".Header_Title";

export class ProjectsPage {
    static verifyProjectsPage() {
        cy.get(HEADER_TITLE).contains("Euvic");
        cy.location().should((loc) => {
            expect(loc.pathname).to.eq("/projects");
        });
    }

    static clickFilterByNameButton() {
        cy.get(NAME_FILTER_BUTTON).click();
    }

    static selectNameFilter(filterName) {
        switch (filterName) {
            case "e2e":
                cy.get("span").contains(E2E_FILTER_LABEL).click();
                break;
            default:
                break;
        }
    }

    static clickApplyFilterButton() {
        cy.wait(500);
        cy.get("span").contains(APPLY_FILTERS_BUTTON_LABEL).click({ force: true });
    }

    static verifyProjectIsVisible(projectName) {
        switch (projectName) {
            case "e2e":
                cy.get(PROJECT_TABLE_BODY).should("have.length", 1);
                break;
            default:
                break;
        }
    }

    static clickResetFilterButton() {
        cy.get(RESET_FILTER_BUTTON).click();
    }

    static verifyAllProjects() {
        cy.get(PROJECT_TABLE_BODY).find("tr").should("have.length.above", 1);
    }

    static clickFilterByLeadButton() {
        cy.get(LEAD_FILTER_BUTTON).click();
    }

    static selectLeadFilter(leadName) {
        switch (leadName) {
            case "Adam Herok":
                cy.get("span").contains(ADAM_HEROK_FILTER_LABEL).click();
                break;
            default:
                break;
        }
    }

    static verifyLeadNameMatch(leadName) {
        cy.get(PROJECT_TABLE_BODY)
            .find("tr :nth-child(5)")
            .each((cell) => {
                expect(cell).to.contain(leadName);
            });
    }

    static clickFilterByDepartmentButton() {
        cy.clickOnButton(DEPARTMENT_FILTER_BUTTON);
    }

    static selectDepartmentButton(departmentName) {
        switch (departmentName) {
            case "Euvic":
                cy.get("span").contains(EUVIC_FILTER_LABEL).click();
                break;
            default:
                break;
        }
    }

    static verifyDepartmentMatch(departmentName) {
        cy.get(PROJECT_TABLE_BODY)
            .find("tr :nth-child(6)")
            .each((cell) => {
                expect(cell).to.contain(departmentName);
            });
    }

    static verifyAllLeadsAreDisplayed() {
        cy.get(PROJECT_TABLE_BODY).find("tr :nth-child(5)").contains("Dawid Ostafin").should("be.visible");
    }

    static clickSortByIdButton() {
        cy.get("span").contains(PROJECT_TABLE_ID_LABEL).click();
    }

    static verifyColumnIsSortedAscending() {
        const toStrings = (cells$) => _.map(cells$, "textContent");
        const toNumbers = (values) => _.map(values, Number);
        cy.get(PROJECT_TABLE_BODY)
            .find(".ant-table-column-sort")
            .then(toStrings)
            .then(toNumbers)
            .then((values) => {
                const sorted = _.sortBy(values);

                expect(values).to.deep.equal(sorted);
            });
    }

    static verifyColumnIsSortedDescending() {
        const toStrings = (cells$) => _.map(cells$, "textContent");
        const toNumbers = (values) => _.map(values, Number);
        cy.get(PROJECT_TABLE_BODY)
            .find(".ant-table-column-sort")
            .then(toStrings)
            .then(toNumbers)
            .then((values) => {
                const sorted = _.sortBy(values).reverse();

                expect(values).to.deep.equal(sorted);
            });
    }

    static clickSortByNumberButton() {
        cy.get("span").contains(PROJECT_TABLE_NUMBER_LABEL).click();
    }

    static clickSortByNameButton() {
        cy.get("span").contains(PROJECT_TABLE_NAME_LABEL).click();
    }

    static clickSortByLeadButton() {
        cy.get("span").contains(PROJECT_TABLE_LEAD_LABEL).click();
    }

    static clickSortByDepartmentButton() {
        cy.get("span").contains(PROJECT_TABLE_DEPARTMENT_LABEL).click();
    }
}
