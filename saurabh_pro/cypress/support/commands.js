// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

Cypress.Commands.add("clickOnButton", (buttonName) => {
    cy.get(buttonName).click();
});

Cypress.Commands.add("itemIsVisible", (itemName) => {
    cy.get(itemName).should("be.visible");
});

Cypress.Commands.add("clickOnButtonAndCheckFocus", (buttonName) => {
    cy.get(buttonName).parent("button").click();
    cy.get(buttonName).parent("button").should("have.attr", "ant-click-animating-without-extra-node", "true");
});

Cypress.Commands.add("clickElementFromRadioButtonList", (buttonName) => {
    //cy.get('input').contains('class', 'ant-radio').click()
    //should('have.attr', 'type', 'radio')
    cy.get("span").contains("span", buttonName).siblings("span.ant-radio").click();
    //cy.get('span.ant-radio').next().should('have.attr', 'ant-click-animating-without-extra-node', 'true').click()
});
