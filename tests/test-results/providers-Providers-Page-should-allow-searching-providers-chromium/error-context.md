# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: providers.test.js >> Providers Page >> should allow searching providers
- Location: specs\providers.test.js:26:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('input[type="search"]')

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - complementary [ref=e4]:
    - generic [ref=e7]: One
    - button "收起侧边栏" [ref=e8] [cursor=pointer]:
      - img [ref=e9]
    - navigation [ref=e13]:
      - paragraph [ref=e14]: 功能
      - link "端点" [ref=e15] [cursor=pointer]:
        - /url: /dashboard/endpoint
        - img [ref=e16]
        - generic [ref=e20]: 端点
      - link "提供商" [ref=e21] [cursor=pointer]:
        - /url: /dashboard/providers
        - img [ref=e23]
        - generic [ref=e26]: 提供商
      - link "组合" [ref=e27] [cursor=pointer]:
        - /url: /dashboard/combos
        - img [ref=e28]
        - generic [ref=e32]: 组合
      - link "使用情况" [ref=e33] [cursor=pointer]:
        - /url: /dashboard/usage
        - img [ref=e34]
        - generic [ref=e36]: 使用情况
      - link "配额跟踪器" [ref=e37] [cursor=pointer]:
        - /url: /dashboard/quota
        - img [ref=e38]
        - generic [ref=e41]: 配额跟踪器
      - paragraph [ref=e43]: 系统
      - link "控制台日志" [ref=e44] [cursor=pointer]:
        - /url: /dashboard/console-log
        - img [ref=e45]
        - generic [ref=e47]: 控制台日志
      - link "设置" [ref=e48] [cursor=pointer]:
        - /url: /dashboard/profile
        - img [ref=e49]
        - generic [ref=e52]: 设置
    - generic [ref=e58]: 服务运行中
  - main [ref=e59]:
    - generic [ref=e62]:
      - generic [ref=e63]:
        - generic [ref=e64]: dns
        - heading "Providers" [level=1] [ref=e65]
      - paragraph [ref=e66]: Manage your AI provider connections
```

# Test source

```ts
  1  | export class ProvidersPage {
  2  |   constructor(page) {
  3  |     this.page = page;
  4  |     this.providerCards = page.locator('[data-testid="provider-card"]');
  5  |     this.searchInput = page.locator('input[type="search"]');
  6  |     this.addProviderButton = page.getByRole('button', { name: '添加提供商' });
  7  |     this.freeTierSection = page.locator('[data-testid="free-tier-section"]');
  8  |     this.apiKeySection = page.locator('[data-testid="apikey-section"]');
  9  |     this.oauthSection = page.locator('[data-testid="oauth-section"]');
  10 |   }
  11 | 
  12 |   async navigate() {
  13 |     await this.page.goto('/dashboard/providers');
  14 |   }
  15 | 
  16 |   async getProviderCount() {
  17 |     return await this.providerCards.count();
  18 |   }
  19 | 
  20 |   async searchProvider(query) {
> 21 |     await this.searchInput.fill(query);
     |                            ^ Error: locator.fill: Test timeout of 30000ms exceeded.
  22 |     await this.page.waitForTimeout(500);
  23 |   }
  24 | 
  25 |   async clickProviderCard(name) {
  26 |     const card = this.page.getByRole('button', { name: new RegExp(name, 'i') });
  27 |     await card.click();
  28 |   }
  29 | 
  30 |   async clickAddProvider() {
  31 |     await this.addProviderButton.click();
  32 |   }
  33 | 
  34 |   async getSectionTitle(section) {
  35 |     const sections = {
  36 |       freeTier: this.freeTierSection,
  37 |       apiKey: this.apiKeySection,
  38 |       oauth: this.oauthSection
  39 |     };
  40 |     if (sections[section]) {
  41 |       return await sections[section].locator('h2').textContent();
  42 |     }
  43 |     return null;
  44 |   }
  45 | }
  46 | 
```