export class ChatPage {
  constructor(page) {
    this.page = page;
    this.messageInput = page.locator('textarea[placeholder="Message AI"]');
    this.sendButton = page.locator('button:has(span.material-symbols-outlined:has-text("arrow_upward"))');
    this.chatMessages = page.locator('.flex.w-full');
    this.modelSelector = page.locator('button.flex.items-center.gap-3.rounded-2xl.border');
    this.clearButton = page.getByRole('button', { name: 'Clear' });
  }

  async navigate() {
    await this.page.goto('/dashboard/basic-chat');
  }

  async sendMessage(message) {
    await this.messageInput.fill(message);
    await this.sendButton.click();
  }

  async getMessageCount() {
    return await this.chatMessages.count();
  }

  async getLastMessage() {
    const count = await this.chatMessages.count();
    if (count > 0) {
      return await this.chatMessages.nth(count - 1).textContent();
    }
    return null;
  }

  async selectModel(modelName) {
    await this.modelSelector.click();
    await this.page.getByRole('option', { name: modelName }).click();
  }

  async clearChat() {
    await this.clearButton.click();
  }
}
