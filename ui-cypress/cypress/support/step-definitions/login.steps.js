const { Given, When, Then } = require('@badeball/cypress-cucumber-preprocessor');

const usernameField = '[data-test="username"]';
const passwordField = '[data-test="password"]';
const loginButton = '[data-test="login-button"]';

// Ensure the form is ready before entering credentials so later steps don't race the UI load.
Given('I am on the login page', () => {
  cy.visit('/');
  cy.get(loginButton).should('be.visible');
});

When('I sign in with valid credentials', () => {
  // Use env-driven creds so CI and local runs stay consistent without hardcoding secrets.
  const username = Cypress.env('USER') || 'standard_user';
  const password = Cypress.env('PASS') || 'secret_sauce';

  cy.get(usernameField).clear().type(username);
  cy.get(passwordField).clear().type(password, { log: false });
  cy.get(loginButton).click();
});

Then('I should see the products page', () => {
  // Verify both visible copy and the inventory route to catch partial page loads.
  cy.contains('Products').should('be.visible');
  cy.location('pathname').should('eq', '/inventory.html');
});
