import { Given, When } from "cypress-cucumber-preprocessor/steps";
import { LoginPage } from "../../../../pages/LoginPage";
import { ProjectsPage } from "../../../../pages/ProjectsPage";

Given("user is on login page", () => {
    LoginPage.goToLoginPage();
});

When("incorrect email is entered into login form", () => {
    LoginPage.enterIncorrectUsername();
});

When("incorrect password is entered into login form", () => {
    LoginPage.enterIncorrectPassword();
});

When("login button is clicked", () => {
    LoginPage.clickLoginButton();
});

When("incorrect credentials error is displayed", () => {
    LoginPage.verifyIncorrectCredentialsError();
});

When("correct email is entered into login form", () => {
    LoginPage.enterCorrectUsername();
});

When("correct password is entered into login form", () => {
    LoginPage.enterCorrectPassword();
});

When("projects page is displayed", () => {
    ProjectsPage.verifyProjectsPage();
});

When("user selects {string} language", (language) => {
    LoginPage.selectLanguage(language);
});

When("user logs in", () => {
    LoginPage.enterCorrectUsername();
    LoginPage.clickLoginButton();
    LoginPage.enterCorrectPassword();
    LoginPage.clickLoginButton();
    ProjectsPage.verifyProjectsPage();
});
