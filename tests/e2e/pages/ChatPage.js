export class ChatPage {
  constructor(page) {
    this.page = page;
    this.messageInput = page.locator('textarea');
    this.sendButton = page.getByRole('button', { name: 'Send' });
    this.chatMessages = page.locator('[data-testid="chat-message"]');
    this.modelSelector = page.locator('[data-testid="model-selector"]');
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
