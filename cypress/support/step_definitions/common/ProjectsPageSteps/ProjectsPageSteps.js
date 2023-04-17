import { When } from "cypress-cucumber-preprocessor/steps";
import { ProjectsPage } from "../../../../pages/ProjectsPage";

When("projects page is displayed", () => {
    ProjectsPage.verifyProjectsPage();
});

When("filter projects by name button is clicked", () => {
    ProjectsPage.clickFilterByNameButton();
});

When("{string} project name is selected on filters list", (filterName) => {
    ProjectsPage.selectNameFilter(filterName);
});

When("apply filter button is clicked", () => {
    ProjectsPage.clickApplyFilterButton();
});

When("{string} project is only project on list", (projectName) => {
    ProjectsPage.verifyProjectIsVisible(projectName);
});

When("reset filter button is clicked", () => {
    ProjectsPage.clickResetFilterButton();
});

When("all projects are displayed on list", () => {
    ProjectsPage.verifyAllProjects();
});

When("filter projects by lead name button is clicked", () => {
    ProjectsPage.clickFilterByLeadButton();
});

When("{string} project lead name is selected on filters list", (leadName) => {
    ProjectsPage.selectLeadFilter(leadName);
});

When("{string} is only project lead on list", (leadName) => {
    ProjectsPage.verifyLeadNameMatch(leadName);
});

When("filter projects by department button is clicked", () => {
    ProjectsPage.clickFilterByDepartmentButton();
});

When("{string} department is selected on filters list", (departmentName) => {
    ProjectsPage.selectDepartmentButton(departmentName);
});

When("{string} is only department on list", (departmentName) => {
    ProjectsPage.verifyDepartmentMatch(departmentName);
});

When("all project leads are displayed on list", () => {
    ProjectsPage.verifyAllLeadsAreDisplayed();
});

When("sort projects by ID button is clicked", () => {
    ProjectsPage.clickSortByIdButton();
});

When("projects table is sorted ascending by ID", () => {
    ProjectsPage.verifyColumnIsSortedAscending();
});

When("projects table is sorted descending by ID", () => {
    ProjectsPage.verifyColumnIsSortedDescending();
});

When("sort projects by number button is clicked", () => {
    ProjectsPage.clickSortByNumberButton();
});

When("projects table is sorted ascending by number", () => {
    ProjectsPage.verifyColumnIsSortedAscending();
});

When("projects table is sorted descending by number", () => {
    ProjectsPage.verifyColumnIsSortedDescending();
});

When("sort projects by name button is clicked", () => {
    ProjectsPage.clickSortByNameButton();
});

When("projects table is sorted ascending by name", () => {
    ProjectsPage.verifyColumnIsSortedAscending();
});

When("projects table is sorted descending by name", () => {
    ProjectsPage.verifyColumnIsSortedDescending();
});

When("sort projects by lead button is clicked", () => {
    ProjectsPage.clickSortByLeadButton();
});

When("projects table is sorted ascending by lead", () => {
    ProjectsPage.verifyColumnIsSortedAscending();
});

When("projects table is sorted descending by lead", () => {
    ProjectsPage.verifyColumnIsSortedDescending();
});

When("sort projects by department button is clicked", () => {
    ProjectsPage.clickSortByDepartmentButton();
});

When("projects table is sorted ascending by department", () => {
    ProjectsPage.verifyColumnIsSortedAscending();
});

When("projects table is sorted descending by department", () => {
    ProjectsPage.verifyColumnIsSortedDescending();
});
