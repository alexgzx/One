# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dashboard.test.js >> Dashboard Page >> should navigate to combos page
- Location: specs\dashboard.test.js:29:3

# Error details

```
Error: page.goto: net::ERR_ABORTED at http://localhost:20127/dashboard/combos
Call log:
  - navigating to "http://localhost:20127/dashboard/combos", waiting until "load"

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
        - img [ref=e17]
        - generic [ref=e21]: 端点
      - link "提供商" [ref=e22] [cursor=pointer]:
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
        - generic [ref=e64]: api
        - heading "Endpoint" [level=1] [ref=e65]
      - paragraph [ref=e66]: API endpoint configuration
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { DashboardPage } from '../pages/DashboardPage';
  3  | 
  4  | test.describe('Dashboard Page', () => {
  5  |   let dashboardPage;
  6  | 
  7  |   test.beforeEach(async ({ page }) => {
  8  |     dashboardPage = new DashboardPage(page);
  9  |     await dashboardPage.navigate();
  10 |     await page.waitForLoadState('domcontentloaded');
  11 |   });
  12 | 
  13 |   test('should load successfully', async () => {
  14 |     await expect(dashboardPage.page).toHaveURL(/dashboard/);
  15 |   });
  16 | 
  17 |   test('should display sidebar navigation', async () => {
  18 |     await expect(dashboardPage.sidebar).toBeVisible();
  19 |     await expect(dashboardPage.providersLink).toBeVisible();
  20 |     await expect(dashboardPage.chatLink).toBeVisible();
  21 |     await expect(dashboardPage.usageLink).toBeVisible();
  22 |   });
  23 | 
  24 |   test('should navigate to providers page', async () => {
  25 |     await dashboardPage.page.goto('/dashboard/providers');
  26 |     await expect(dashboardPage.page).toHaveURL(/dashboard\/providers/);
  27 |   });
  28 | 
  29 |   test('should navigate to combos page', async () => {
> 30 |     await dashboardPage.page.goto('/dashboard/combos');
     |                              ^ Error: page.goto: net::ERR_ABORTED at http://localhost:20127/dashboard/combos
  31 |     await expect(dashboardPage.page).toHaveURL(/dashboard\/combos/);
  32 |   });
  33 | });
  34 | 
```