/*
 * Flow: Executes axe-core scans on the login page, signs in, and repeats on the inventory grid.
 * Assertions: Filters for serious/critical violations, fails fast, and persists a JSON summary for both views.
 * Risk: Surfaces accessibility regressions in the primary shop path that would block inclusive access.
 */
const reportPath = 'cypress/reports/a11y/home.json';

const formatViolationSummary = (page, violations) => {
  if (!violations.length) {
    return `No serious/critical accessibility violations detected on ${page}.`;
  }

  const details = violations
    .map((violation) => {
      const nodes = violation.nodes.map((node) => `    - ${node.target.join(', ')}`).join('\n');
      return `  - ${violation.id} (${violation.impact})\n${nodes}`;
    })
    .join('\n');

  return [`Accessibility violations detected on ${page}:`, details].join('\n');
};

describe('Accessibility: Login and inventory axe scan', () => {
  it('User journey surfaces no serious accessibility violations', () => {
    const username = Cypress.env('USER') || 'standard_user';
    const password = Cypress.env('PASS') || 'secret_sauce';
    const pages = [];
    const axeOptions = {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa'],
      },
    };
    const impactsToFlag = ['critical', 'serious'];

    const captureResults = (pageName, contextSelector) => {
      cy.window({ log: false }).then((win) => {
        const contextElement =
          typeof contextSelector === 'string'
            ? win.document.querySelector(contextSelector) || win.document
            : contextSelector || win.document;

        return win.axe.run(contextElement, axeOptions).then((results) => {
          const violations = results.violations.filter((violation) =>
            impactsToFlag.includes(violation.impact || ''),
          );
          pages.push({ page: pageName, violations, axe: results });
          expect(violations, formatViolationSummary(pageName, violations)).to.have.length(0);
        });
      });
    };

    cy.visit('/');
    cy.injectAxe();
    captureResults('login page');

    cy.get('[data-test="username"]').clear().type(username);
    cy.get('[data-test="password"]').clear().type(password, { log: false });
    cy.get('[data-test="login-button"]').click();
    cy.contains('Products').should('be.visible');

    cy.injectAxe();
    captureResults('inventory page', "[data-test='inventory-container']");

    cy.then(() => {
      const summary = pages.map(({ page, violations }) => ({
        page,
        total: violations.length,
        serious: violations.filter((v) => v.impact === 'serious').length,
        critical: violations.filter((v) => v.impact === 'critical').length,
      }));

      const report = {
        generatedAt: new Date().toISOString(),
        summary,
        pages,
      };

      cy.writeFile(reportPath, report, { log: false });
    });
  });
});
