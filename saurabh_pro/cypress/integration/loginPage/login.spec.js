import { actions as loginPageActions } from "../../fixtures/loginPage/loginPageActions";
import { actions as urlActions } from "../../fixtures/urls/urlsActions";
import { actions as projectsPageActions } from "../../fixtures/projectsPage/projectsPageActions";
import { actions as generalActions } from "../../fixtures/general/generalActions";

describe("Login tests", () => {
    beforeEach(() => {
        urlActions.visitLoginPage();
        loginPageActions.verifyRukkorBottomLogo();
        urlActions.verifyLoginUrl();
    });

    it("Shows errors on incorrect password", () => {
        loginPageActions.selectLanguage("English");
        generalActions.verifyPageLanguage("en");
        loginPageActions.enterCorrectEmail();
        loginPageActions.clickLoginButton();
        loginPageActions.enterIncorrectPassword();
        loginPageActions.clickLoginButton();
        loginPageActions.verifyIncorrectPasswordMessage();
    });

    it("Shows error on incorrect password format", () => {
        loginPageActions.selectLanguage("English");
        generalActions.verifyPageLanguage("en");
        loginPageActions.enterCorrectEmail();
        loginPageActions.clickLoginButton();
        loginPageActions.enterIncorrectPasswordFormat();
        loginPageActions.clickLoginButton();
        loginPageActions.verifyIncorrectPasswordFormatMessage();
    });

    it("Log user in", () => {
        loginPageActions.selectLanguage("English");
        generalActions.verifyPageLanguage("en");
        loginPageActions.enterCorrectEmail();
        loginPageActions.clickLoginButton();
        loginPageActions.enterCorrectPassword();
        loginPageActions.clickLoginButton();
        projectsPageActions.verifyProjectsPageIsDisplayed();
    });
});
