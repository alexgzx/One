import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';

test.describe('Dashboard Page', () => {
  let dashboardPage;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    await dashboardPage.navigate();
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
    await dashboardPage.goToProviders();
    await expect(dashboardPage.page).toHaveURL(/providers/);
  });

  test('should navigate to chat page', async () => {
    await dashboardPage.goToChat();
    await expect(dashboardPage.page).toHaveURL(/basic-chat/);
  });

  test('should navigate to usage page', async () => {
    await dashboardPage.goToUsage();
    await expect(dashboardPage.page).toHaveURL(/usage/);
  });

  test('should navigate to quota page', async () => {
    await dashboardPage.goToQuota();
    await expect(dashboardPage.page).toHaveURL(/quota/);
  });
});
