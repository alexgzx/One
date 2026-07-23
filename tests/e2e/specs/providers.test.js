import { test, expect } from '@playwright/test';
import { ProvidersPage } from '../pages/ProvidersPage';

test.describe('Providers Page', () => {
  let providersPage;

  test.beforeEach(async ({ page }) => {
    providersPage = new ProvidersPage(page);
    await providersPage.navigate();
  });

  test('should load successfully', async () => {
    await expect(providersPage.page).toHaveURL(/providers/);
  });

  test('should display provider cards', async () => {
    const count = await providersPage.getProviderCount();
    expect(count).toBeGreaterThan(0);
  });

  test('should display section headers', async () => {
    const freeTierTitle = await providersPage.getSectionTitle('freeTier');
    expect(freeTierTitle).toBeTruthy();
  });

  test('should allow searching providers', async () => {
    await providersPage.searchProvider('open');
    const count = await providersPage.getProviderCount();
    expect(count).toBeGreaterThan(0);
  });
});
