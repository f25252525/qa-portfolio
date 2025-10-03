/*
 * Flow: Exercises login and inventory pages to maintain Eyes baselines for critical shopper journeys.
 * Assertions: Uses Eyes window snapshots with batch 'Cypress Visual AI' and fully captured windows for strict comparisons.
 * Risk: Catches visual regressions across authentication and product grid before release.
 */
// CI note: Visual suite runs on GitHub Actions
const loginSelectors = {
  username: '[data-test="username"]',
  password: '[data-test="password"]',
  submit: '[data-test="login-button"]',
};

const resolveApplitoolsKey = () => {
  return (
    Cypress.env('APPLITOOLS_API_KEY') ||
    Cypress.env('applitoolsApiKey') ||
    Cypress.env('applitools_api_key') ||
    Cypress.env('APPLITOOLS_API_KEY'.toLowerCase()) ||
    process.env.CYPRESS_APPLITOOLS_API_KEY ||
    process.env.APPLITOOLS_API_KEY
  );
};

describe('Visual AI: Applitools Eyes', () => {
  before(function () {
    const apiKey = resolveApplitoolsKey();

    if (!apiKey) {
      Cypress.log({
        name: 'applitools',
        message: 'APPLITOOLS_API_KEY not set. Skipping Applitools Eyes spec.',
      });
      this.skip();
    }
  });

  it('captures login and inventory pages', function () {
    const username = Cypress.env('USER') || 'standard_user';
    const password = Cypress.env('PASS') || 'secret_sauce';

    cy.visit('/');

    cy.eyesOpen({
      appName: 'Sauce Demo',
      batchName: 'Cypress Visual AI',
      testName: this.test?.title || 'Applitools Eyes capture',
    });

    cy.eyesCheckWindow({
      tag: 'Login page',
      target: 'window',
      fully: true,
    });

    cy.get(loginSelectors.username).clear().type(username);
    cy.get(loginSelectors.password).clear().type(password, { log: false });
    cy.get(loginSelectors.submit).click();

    cy.contains('Products').should('be.visible');

    cy.eyesCheckWindow({
      tag: 'Inventory page',
      target: 'window',
      fully: true,
    });

    cy.eyesClose();
  });
});
