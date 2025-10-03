/*
 * Flow: Runs axe-core against the login page, authenticates, then scans the inventory container.
 * Assertions: Filters serious/critical issues, fails immediately, and stores a JSON accessibility report.
 * Risk: Flags regressions in the must-pass shopping journey so accessibility gaps surface early.
 */
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { promises as fs } from 'fs';
import path from 'path';

type AxeViolation = {
  id: string;
  impact?: string;
  description: string;
  helpUrl: string;
  nodes: Array<{ target: string[] }>;
};

const REPORT_PATH = path.resolve(__dirname, '../../a11y-reports/home.json');

const impactsToFlag = new Set(['critical', 'serious']);

const formatViolations = (page: string, violations: AxeViolation[]) => {
  if (!violations.length) {
    return `No serious/critical accessibility violations detected on ${page}.`;
  }

  const details = violations
    .map((violation) => {
      const selectors = violation.nodes.map((node) => `    - ${node.target.join(', ')}`).join('\n');
      return `  - ${violation.id} (${violation.impact ?? 'unknown'})\n${selectors}`;
    })
    .join('\n');

  return [`Accessibility violations detected on ${page}:`, details].join('\n');
};

const filterSeriousViolations = (violations: AxeViolation[]) =>
  violations.filter((violation) => impactsToFlag.has(violation.impact ?? ''));

test.describe('Accessibility: Login and inventory axe coverage (Playwright)', () => {
  test('Authentication journey surfaces no serious accessibility violations', async ({ page }) => {
    const username = process.env.USER ?? 'standard_user';
    const password = process.env.PASS ?? 'secret_sauce';

    const reports: Array<{
      page: string;
      axe: Awaited<ReturnType<AxeBuilder['analyze']>>;
      violations: AxeViolation[];
    }> = [];

    await page.goto('/');

    const loginResults = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    const loginViolations = filterSeriousViolations(loginResults.violations as AxeViolation[]);
    reports.push({ page: 'login page', axe: loginResults, violations: loginViolations });
    expect(loginViolations, formatViolations('login page', loginViolations)).toHaveLength(0);

    await page.getByTestId('username').fill(username);
    await page.getByTestId('password').fill(password);
    await page.getByTestId('login-button').click();

    await page.waitForURL('**/inventory.html');
    await expect(page.getByText('Products')).toBeVisible();

    const inventoryResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .include('[data-test="inventory-container"]')
      .analyze();
    const inventoryViolations = filterSeriousViolations(
      inventoryResults.violations as AxeViolation[],
    );
    reports.push({
      page: 'inventory page',
      axe: inventoryResults,
      violations: inventoryViolations,
    });
    expect(
      inventoryViolations,
      formatViolations('inventory page', inventoryViolations),
    ).toHaveLength(0);

    const reportPayload = {
      generatedAt: new Date().toISOString(),
      pages: reports.map(({ page: pageName, axe, violations }) => ({
        page: pageName,
        summary: {
          total: violations.length,
          serious: violations.filter((issue) => issue.impact === 'serious').length,
          critical: violations.filter((issue) => issue.impact === 'critical').length,
        },
        axe,
      })),
    };

    await fs.mkdir(path.dirname(REPORT_PATH), { recursive: true });
    await fs.writeFile(REPORT_PATH, JSON.stringify(reportPayload, null, 2), 'utf-8');
  });
});
