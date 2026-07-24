import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';

test.describe('Dashboard Page', () => {
  let dashboardPage;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    await dashboardPage.navigate();
    await page.waitForLoadState('domcontentloaded');
  });

  test('should load successfully', async () => {
    await expect(dashboardPage.page).toHaveURL(/dashboard/);
  });

  test('should display sidebar navigation', async () => {
    await expect(dashboardPage.sidebar).toBeVisible();
    await expect(dashboardPage.providersLink).toBeVisible();
    await expect(dashboardPage.chatLink).toBeVisible();
    await expect(dashboardPage.usageLink).toBeVisible();
  });

  test('should navigate to providers page', async () => {
    await dashboardPage.page.goto('/dashboard/providers');
    await expect(dashboardPage.page).toHaveURL(/dashboard\/providers/);
  });

  test('should navigate to combos page', async () => {
    await dashboardPage.page.goto('/dashboard/combos');
    await expect(dashboardPage.page).toHaveURL(/dashboard\/combos/);
  });
});
