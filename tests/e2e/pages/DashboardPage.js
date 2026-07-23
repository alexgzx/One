export class DashboardPage {
  constructor(page) {
    this.page = page;
    this.sidebar = page.locator('nav');
    this.dashboardLink = page.getByRole('link', { name: 'Dashboard' });
    this.providersLink = page.getByRole('link', { name: 'Providers' });
    this.chatLink = page.getByRole('link', { name: 'Chat' });
    this.usageLink = page.getByRole('link', { name: 'Usage' });
    this.quotaLink = page.getByRole('link', { name: 'Quota' });
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
