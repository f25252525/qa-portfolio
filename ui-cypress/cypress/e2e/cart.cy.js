/*
 * Flow: Authenticated shopper adds the backpack from the inventory list and inspects the cart summary.
 * Assertions: Uses data-test selectors to confirm navigation to the cart and presence of the chosen item.
 * Risk: Guards against regressions in add-to-cart wiring or cart routing after login.
 */
describe('Cart: Backpack add-to-cart happy path', () => {
  const login = () => {
    cy.visit('/');
    cy.get('[data-test="username"]').type(Cypress.env('USER') || 'standard_user');
    cy.get('[data-test="password"]').type(Cypress.env('PASS') || 'secret_sauce');
    cy.get('[data-test="login-button"]').click();
    cy.contains('Products').should('be.visible');
  };

  it('User adds the backpack and sees it listed in the cart', () => {
    login();

    // Add a deterministic item by data-test id
    cy.get('[data-test="add-to-cart-sauce-labs-backpack"]').click();

    // Navigate to cart and verify item present
    cy.get('[data-test="shopping-cart-link"]').click();
    cy.contains('Your Cart').should('be.visible');
    cy.contains('Sauce Labs Backpack').should('be.visible');
  });
});
