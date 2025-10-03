/*
 * Flow: Standard user authenticates through the Saucedemo login form using data-test selectors only.
 * Assertions: Confirms the Products dashboard renders after submit without relying on brittle waits.
 * Risk: Detects broken credentials, login button regressions, or routing away from the inventory page.
 */
describe('Smoke: User signs in via primary login flow', () => {
  it('User logs in and lands on the products dashboard', () => {
    cy.visit('/');
    cy.get('[data-test="username"]').type(Cypress.env('USER') || 'standard_user');
    cy.get('[data-test="password"]').type(Cypress.env('PASS') || 'secret_sauce');
    cy.get('[data-test="login-button"]').click();
    cy.contains('Products').should('be.visible');
  });
});
