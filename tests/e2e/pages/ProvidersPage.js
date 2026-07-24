export class ProvidersPage {
  constructor(page) {
    this.page = page;
    this.providerCards = page.locator('[data-testid="provider-card"]');
    this.searchInput = page.locator('input[type="search"]');
    this.addProviderButton = page.getByRole('button', { name: '添加提供商' });
    this.freeTierSection = page.locator('[data-testid="free-tier-section"]');
    this.apiKeySection = page.locator('[data-testid="apikey-section"]');
    this.oauthSection = page.locator('[data-testid="oauth-section"]');
  }

  async navigate() {
    await this.page.goto('/dashboard/providers');
  }

  async getProviderCount() {
    return await this.providerCards.count();
  }

  async searchProvider(query) {
    await this.searchInput.fill(query);
    await this.page.waitForTimeout(500);
  }

  async clickProviderCard(name) {
    const card = this.page.getByRole('button', { name: new RegExp(name, 'i') });
    await card.click();
  }

  async clickAddProvider() {
    await this.addProviderButton.click();
  }

  async getSectionTitle(section) {
    const sections = {
      freeTier: this.freeTierSection,
      apiKey: this.apiKeySection,
      oauth: this.oauthSection
    };
    if (sections[section]) {
      return await sections[section].locator('h2').textContent();
    }
    return null;
  }
}
