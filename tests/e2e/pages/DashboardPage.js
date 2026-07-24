export class DashboardPage {
  constructor(page) {
    this.page = page;
    this.sidebar = page.locator('aside nav').first();
    this.dashboardLink = page.getByRole('link', { name: '端点' });
    this.providersLink = page.getByRole('link', { name: '提供商' });
    this.chatLink = page.getByRole('link', { name: '组合' });
    this.usageLink = page.getByRole('link', { name: '使用情况' });
    this.quotaLink = page.getByRole('link', { name: '配额跟踪器' });
    this.headerTitle = page.locator('header h1');
  }

  async navigate() {
    await this.page.goto('/dashboard');
  }

  async goToProviders() {
    await this.providersLink.click();
  }

  async goToChat() {
    await this.chatLink.click();
  }

  async goToUsage() {
    await this.usageLink.click();
  }

  async goToQuota() {
    await this.quotaLink.click();
  }

  async getHeaderTitle() {
    return await this.headerTitle.textContent();
  }
}
