import { test, expect } from '@playwright/test';
import { ChatPage } from '../pages/ChatPage';

test.describe('Chat Page', () => {
  let chatPage;

  test.beforeEach(async ({ page }) => {
    chatPage = new ChatPage(page);
    await chatPage.navigate();
  });

  test('should load successfully', async () => {
    await expect(chatPage.page).toHaveURL(/basic-chat/);
  });

  test('should display message input', async () => {
    await expect(chatPage.messageInput).toBeVisible();
    await expect(chatPage.sendButton).toBeVisible();
  });

  test('should display model selector', async () => {
    await expect(chatPage.modelSelector).toBeVisible();
  });
});
