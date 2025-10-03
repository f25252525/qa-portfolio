/*
 * Flow: Authenticates as the standard user, adds the backpack from inventory, and navigates into the cart view.
 * Assertions: Verifies visibility of cart page header and selected product using resilient data-test selectors.
 * Risk: Guards against add-to-cart regressions and routing issues that would block checkout journeys.
 */
import { test, expect } from '@playwright/test';

test('User adds the backpack and confirms it inside the cart', async ({ page }) => {
  const base = process.env.APP_BASE_URL || 'https://www.saucedemo.com';
  await page.goto(base + '/');

  const username = page.locator('[data-test="username"], #user-name');
  await expect(username).toBeVisible();
  await username.fill(process.env.USER ?? 'standard_user');
  await page.locator('[data-test="password"], #password').fill(process.env.PASS ?? 'secret_sauce');
  await page.locator('[data-test="login-button"], #login-button').click();
  await expect(page.getByText('Products')).toBeVisible();

  await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
  await page.locator('[data-test="shopping-cart-link"]').click();

  await expect(page.getByText('Your Cart')).toBeVisible();
  await expect(page.getByText('Sauce Labs Backpack')).toBeVisible();
});
