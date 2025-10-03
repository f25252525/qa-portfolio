/*
 * Flow: Opens the Saucedemo login page, authenticates with env-driven creds, and lands on the inventory view.
 * Assertions: Ensures login fields are visible, credentials validate via helper, and Products text appears.
 * Risk: Detects regressions in the primary login path before other suites depend on it.
 */
import { test, expect } from '@playwright/test';
import { isValidLogin } from '../../src/authLogic';

test('User signs in and reaches the products dashboard', async ({ page }) => {
  const base = process.env.APP_BASE_URL || 'https://www.saucedemo.com';
  await page.goto(base + '/');
  const username = page.locator('[data-test="username"], #user-name');
  await expect(username).toBeVisible();
  const user = process.env.USER ?? 'standard_user';
  const pass = process.env.PASS ?? 'secret_sauce';
  expect(isValidLogin(user, pass)).toBe(true);
  await username.fill(user);
  await page.locator('[data-test="password"], #password').fill(pass);
  await page.locator('[data-test="login-button"], #login-button').click();
  await expect(page.getByText('Products')).toBeVisible();
});
