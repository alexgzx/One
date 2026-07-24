# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: providers.test.js >> Providers Page >> should display section headers
- Location: specs\providers.test.js:21:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.textContent: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('[data-testid="free-tier-section"]').locator('h2')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
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
      - generic [ref=e60]:
        - generic [ref=e62]:
          - generic [ref=e63]:
            - generic [ref=e64]: dns
            - heading "提供商" [level=1] [ref=e65]
          - paragraph [ref=e66]: 管理您的 AI 提供商连接
        - generic [ref=e68]:
          - generic: search
          - textbox "搜索提供商..." [ref=e69]
      - generic [ref=e72]:
        - generic [ref=e73]:
          - generic [ref=e74]:
            - heading "自定义提供商（OpenAI / Anthropic 兼容）" [level=2] [ref=e75]
            - generic [ref=e76]:
              - button "add 添加 Anthropic 兼容" [ref=e77] [cursor=pointer]:
                - generic [ref=e78]: add
                - generic [ref=e79]: 添加 Anthropic 兼容
              - button "add 添加 OpenAI 兼容" [ref=e80] [cursor=pointer]:
                - generic [ref=e81]: add
                - generic [ref=e82]: 添加 OpenAI 兼容
          - generic [ref=e83]:
            - generic [ref=e84]: extension
            - generic [ref=e85]: 暂无自定义提供商 — 使用上方按钮添加 OpenAI / Anthropic 兼容端点
        - generic [ref=e86]:
          - heading "OAuth 提供商" [level=2] [ref=e88]
          - generic [ref=e89]:
            - link "Claude Code Claude Code 无连接" [ref=e91] [cursor=pointer]:
              - /url: /dashboard/providers/claude
              - generic [ref=e94]:
                - generic [ref=e95]:
                  - img "Claude Code" [ref=e97]
                  - generic [ref=e98]:
                    - heading "Claude Code" [level=3] [ref=e99]
                    - generic [ref=e101]: 无连接
                - button "拖拽排序" [ref=e103]
            - link "Antigravity Antigravity 无连接" [ref=e113] [cursor=pointer]:
              - /url: /dashboard/providers/antigravity
              - generic [ref=e116]:
                - generic [ref=e117]:
                  - img "Antigravity" [ref=e119]
                  - generic [ref=e120]:
                    - heading "Antigravity" [level=3] [ref=e121]
                    - generic [ref=e123]: 无连接
                - button "拖拽排序" [ref=e125]
            - link "OpenAI Codex OpenAI Codex 无连接" [ref=e135] [cursor=pointer]:
              - /url: /dashboard/providers/codex
              - generic [ref=e138]:
                - generic [ref=e139]:
                  - img "OpenAI Codex" [ref=e141]
                  - generic [ref=e142]:
                    - heading "OpenAI Codex" [level=3] [ref=e143]
                    - generic [ref=e145]: 无连接
                - button "拖拽排序" [ref=e147]
            - link "GitHub Copilot GitHub Copilot 无连接" [ref=e157] [cursor=pointer]:
              - /url: /dashboard/providers/github
              - generic [ref=e160]:
                - generic [ref=e161]:
                  - img "GitHub Copilot" [ref=e163]
                  - generic [ref=e164]:
                    - heading "GitHub Copilot" [level=3] [ref=e165]
                    - generic [ref=e167]: 无连接
                - button "拖拽排序" [ref=e169]
            - link "Cursor IDE Cursor IDE 无连接" [ref=e179] [cursor=pointer]:
              - /url: /dashboard/providers/cursor
              - generic [ref=e182]:
                - generic [ref=e183]:
                  - img "Cursor IDE" [ref=e185]
                  - generic [ref=e186]:
                    - heading "Cursor IDE" [level=3] [ref=e187]
                    - generic [ref=e189]: 无连接
                - button "拖拽排序" [ref=e191]
            - link "Kilo Code Kilo Code 无连接" [ref=e201] [cursor=pointer]:
              - /url: /dashboard/providers/kilocode
              - generic [ref=e204]:
                - generic [ref=e205]:
                  - img "Kilo Code" [ref=e207]
                  - generic [ref=e208]:
                    - heading "Kilo Code" [level=3] [ref=e209]
                    - generic [ref=e211]: 无连接
                - button "拖拽排序" [ref=e213]
            - link "Cline Cline 无连接" [ref=e223] [cursor=pointer]:
              - /url: /dashboard/providers/cline
              - generic [ref=e226]:
                - generic [ref=e227]:
                  - img "Cline" [ref=e229]
                  - generic [ref=e230]:
                    - heading "Cline" [level=3] [ref=e231]
                    - generic [ref=e233]: 无连接
                - button "拖拽排序" [ref=e235]
            - link "xAI (Grok) xAI (Grok) 无连接" [ref=e245] [cursor=pointer]:
              - /url: /dashboard/providers/xai
              - generic [ref=e248]:
                - generic [ref=e249]:
                  - img "xAI (Grok)" [ref=e251]
                  - generic [ref=e252]:
                    - heading "xAI (Grok)" [level=3] [ref=e253]
                    - generic [ref=e255]: 无连接
                - button "拖拽排序" [ref=e257]
          - status [ref=e266]
        - generic [ref=e267]:
          - heading "免费提供商" [level=2] [ref=e269]
          - generic [ref=e270]:
            - link "OpenCode Free OpenCode Free 就绪" [ref=e272] [cursor=pointer]:
              - /url: /dashboard/providers/opencode
              - generic [ref=e275]:
                - generic [ref=e276]:
                  - img "OpenCode Free" [ref=e279]
                  - generic [ref=e280]:
                    - heading "OpenCode Free" [level=3] [ref=e281]
                    - generic [ref=e283]: 就绪
                - button "拖拽排序" [ref=e286]
            - link "MiMo Code Free MiMo Code Free 就绪" [ref=e296] [cursor=pointer]:
              - /url: /dashboard/providers/mimo-free
              - generic [ref=e299]:
                - generic [ref=e300]:
                  - img "MiMo Code Free" [ref=e303]
                  - generic [ref=e304]:
                    - heading "MiMo Code Free" [level=3] [ref=e305]
                    - generic [ref=e307]: 就绪
                - button "拖拽排序" [ref=e310]
            - link "KF Kilo Code Free 就绪" [ref=e320] [cursor=pointer]:
              - /url: /dashboard/providers/kilo-free
              - generic [ref=e323]:
                - generic [ref=e324]:
                  - generic [ref=e327]: KF
                  - generic [ref=e328]:
                    - heading "Kilo Code Free" [level=3] [ref=e329]
                    - generic [ref=e331]: 就绪
                - button "拖拽排序" [ref=e334]
            - link "Kiro AI Kiro AI 无连接" [ref=e344] [cursor=pointer]:
              - /url: /dashboard/providers/kiro
              - generic [ref=e347]:
                - generic [ref=e348]:
                  - img "Kiro AI" [ref=e350]
                  - generic [ref=e351]:
                    - heading "Kiro AI" [level=3] [ref=e352]
                    - generic [ref=e354]: 无连接
                - button "拖拽排序" [ref=e356]
            - link "Gemini CLI Gemini CLI 无连接" [ref=e366] [cursor=pointer]:
              - /url: /dashboard/providers/gemini-cli
              - generic [ref=e369]:
                - generic [ref=e370]:
                  - img "Gemini CLI" [ref=e372]
                  - generic [ref=e373]:
                    - heading "Gemini CLI" [level=3] [ref=e374]
                    - generic [ref=e376]: 无连接
                - button "拖拽排序" [ref=e378]
            - link "Qoder Qoder 无连接" [ref=e388] [cursor=pointer]:
              - /url: /dashboard/providers/qoder
              - generic [ref=e391]:
                - generic [ref=e392]:
                  - img "Qoder" [ref=e394]
                  - generic [ref=e395]:
                    - heading "Qoder" [level=3] [ref=e396]
                    - generic [ref=e398]: 无连接
                - button "拖拽排序" [ref=e400]
            - link "OpenRouter OpenRouter 无连接" [ref=e410] [cursor=pointer]:
              - /url: /dashboard/providers/openrouter
              - generic [ref=e413]:
                - generic [ref=e414]:
                  - img "OpenRouter" [ref=e416]
                  - generic [ref=e417]:
                    - heading "OpenRouter" [level=3] [ref=e418]
                    - generic [ref=e420]: 无连接
                - button "拖拽排序" [ref=e422]
            - link "NVIDIA NIM NVIDIA NIM 无连接" [ref=e432] [cursor=pointer]:
              - /url: /dashboard/providers/nvidia
              - generic [ref=e435]:
                - generic [ref=e436]:
                  - img "NVIDIA NIM" [ref=e438]
                  - generic [ref=e439]:
                    - heading "NVIDIA NIM" [level=3] [ref=e440]
                    - generic [ref=e442]: 无连接
                - button "拖拽排序" [ref=e444]
            - link "Ollama Cloud Ollama Cloud 无连接" [ref=e454] [cursor=pointer]:
              - /url: /dashboard/providers/ollama
              - generic [ref=e457]:
                - generic [ref=e458]:
                  - img "Ollama Cloud" [ref=e460]
                  - generic [ref=e461]:
                    - heading "Ollama Cloud" [level=3] [ref=e462]
                    - generic [ref=e464]: 无连接
                - button "拖拽排序" [ref=e466]
            - link "Vertex AI Vertex AI 无连接" [ref=e476] [cursor=pointer]:
              - /url: /dashboard/providers/vertex
              - generic [ref=e479]:
                - generic [ref=e480]:
                  - img "Vertex AI" [ref=e482]
                  - generic [ref=e483]:
                    - heading "Vertex AI" [level=3] [ref=e484]
                    - generic [ref=e486]: 无连接
                - button "拖拽排序" [ref=e488]
            - link "Gemini Gemini 无连接" [ref=e498] [cursor=pointer]:
              - /url: /dashboard/providers/gemini
              - generic [ref=e501]:
                - generic [ref=e502]:
                  - img "Gemini" [ref=e504]
                  - generic [ref=e505]:
                    - heading "Gemini" [level=3] [ref=e506]
                    - generic [ref=e508]: 无连接
                - button "拖拽排序" [ref=e510]
            - link "Cloudflare Cloudflare 无连接" [ref=e520] [cursor=pointer]:
              - /url: /dashboard/providers/cloudflare-ai
              - generic [ref=e523]:
                - generic [ref=e524]:
                  - img "Cloudflare" [ref=e526]
                  - generic [ref=e527]:
                    - heading "Cloudflare" [level=3] [ref=e528]
                    - generic [ref=e530]: 无连接
                - button "拖拽排序" [ref=e532]
            - link "BytePlus ModelArk BytePlus ModelArk 无连接" [ref=e542] [cursor=pointer]:
              - /url: /dashboard/providers/byteplus
              - generic [ref=e545]:
                - generic [ref=e546]:
                  - img "BytePlus ModelArk" [ref=e548]
                  - generic [ref=e549]:
                    - heading "BytePlus ModelArk" [level=3] [ref=e550]
                    - generic [ref=e552]: 无连接
                - button "拖拽排序" [ref=e554]
          - status [ref=e563]
        - generic [ref=e564]:
          - heading "API Key 提供商" [level=2] [ref=e566]
          - generic [ref=e567]:
            - link "Alibaba Alibaba 无连接" [ref=e569] [cursor=pointer]:
              - /url: /dashboard/providers/alicode
              - generic [ref=e572]:
                - generic [ref=e573]:
                  - img "Alibaba" [ref=e575]
                  - generic [ref=e576]:
                    - heading "Alibaba" [level=3] [ref=e577]
                    - generic [ref=e579]: 无连接
                - button "拖拽排序" [ref=e581]
            - link "Alibaba Intl Alibaba Intl 无连接" [ref=e591] [cursor=pointer]:
              - /url: /dashboard/providers/alicode-intl
              - generic [ref=e594]:
                - generic [ref=e595]:
                  - img "Alibaba Intl" [ref=e597]
                  - generic [ref=e598]:
                    - heading "Alibaba Intl" [level=3] [ref=e599]
                    - generic [ref=e601]: 无连接
                - button "拖拽排序" [ref=e603]
            - link "Anthropic Anthropic 无连接" [ref=e613] [cursor=pointer]:
              - /url: /dashboard/providers/anthropic
              - generic [ref=e616]:
                - generic [ref=e617]:
                  - img "Anthropic" [ref=e619]
                  - generic [ref=e620]:
                    - heading "Anthropic" [level=3] [ref=e621]
                    - generic [ref=e623]: 无连接
                - button "拖拽排序" [ref=e625]
            - link "Azure OpenAI Azure OpenAI 无连接" [ref=e635] [cursor=pointer]:
              - /url: /dashboard/providers/azure
              - generic [ref=e638]:
                - generic [ref=e639]:
                  - img "Azure OpenAI" [ref=e641]
                  - generic [ref=e642]:
                    - heading "Azure OpenAI" [level=3] [ref=e643]
                    - generic [ref=e645]: 无连接
                - button "拖拽排序" [ref=e647]
            - link "Blackbox AI Blackbox AI 无连接" [ref=e657] [cursor=pointer]:
              - /url: /dashboard/providers/blackbox
              - generic [ref=e660]:
                - generic [ref=e661]:
                  - img "Blackbox AI" [ref=e663]
                  - generic [ref=e664]:
                    - heading "Blackbox AI" [level=3] [ref=e665]
                    - generic [ref=e667]: 无连接
                - button "拖拽排序" [ref=e669]
            - link "Cerebras Cerebras 无连接" [ref=e679] [cursor=pointer]:
              - /url: /dashboard/providers/cerebras
              - generic [ref=e682]:
                - generic [ref=e683]:
                  - img "Cerebras" [ref=e685]
                  - generic [ref=e686]:
                    - heading "Cerebras" [level=3] [ref=e687]
                    - generic [ref=e689]: 无连接
                - button "拖拽排序" [ref=e691]
            - link "Chutes AI Chutes AI 无连接" [ref=e701] [cursor=pointer]:
              - /url: /dashboard/providers/chutes
              - generic [ref=e704]:
                - generic [ref=e705]:
                  - img "Chutes AI" [ref=e707]
                  - generic [ref=e708]:
                    - heading "Chutes AI" [level=3] [ref=e709]
                    - generic [ref=e711]: 无连接
                - button "拖拽排序" [ref=e713]
            - link "Cohere Cohere 无连接" [ref=e723] [cursor=pointer]:
              - /url: /dashboard/providers/cohere
              - generic [ref=e726]:
                - generic [ref=e727]:
                  - img "Cohere" [ref=e729]
                  - generic [ref=e730]:
                    - heading "Cohere" [level=3] [ref=e731]
                    - generic [ref=e733]: 无连接
                - button "拖拽排序" [ref=e735]
            - link "Command Code Command Code 无连接" [ref=e745] [cursor=pointer]:
              - /url: /dashboard/providers/commandcode
              - generic [ref=e748]:
                - generic [ref=e749]:
                  - img "Command Code" [ref=e751]
                  - generic [ref=e752]:
                    - heading "Command Code" [level=3] [ref=e753]
                    - generic [ref=e755]: 无连接
                - button "拖拽排序" [ref=e757]
            - link "DeepSeek DeepSeek 无连接" [ref=e767] [cursor=pointer]:
              - /url: /dashboard/providers/deepseek
              - generic [ref=e770]:
                - generic [ref=e771]:
                  - img "DeepSeek" [ref=e773]
                  - generic [ref=e774]:
                    - heading "DeepSeek" [level=3] [ref=e775]
                    - generic [ref=e777]: 无连接
                - button "拖拽排序" [ref=e779]
            - link "Fireworks AI Fireworks AI 无连接" [ref=e789] [cursor=pointer]:
              - /url: /dashboard/providers/fireworks
              - generic [ref=e792]:
                - generic [ref=e793]:
                  - img "Fireworks AI" [ref=e795]
                  - generic [ref=e796]:
                    - heading "Fireworks AI" [level=3] [ref=e797]
                    - generic [ref=e799]: 无连接
                - button "拖拽排序" [ref=e801]
            - link "GLM (China) GLM (China) 无连接" [ref=e811] [cursor=pointer]:
              - /url: /dashboard/providers/glm-cn
              - generic [ref=e814]:
                - generic [ref=e815]:
                  - img "GLM (China)" [ref=e817]
                  - generic [ref=e818]:
                    - heading "GLM (China)" [level=3] [ref=e819]
                    - generic [ref=e821]: 无连接
                - button "拖拽排序" [ref=e823]
            - link "GLM Coding GLM Coding 无连接" [ref=e833] [cursor=pointer]:
              - /url: /dashboard/providers/glm
              - generic [ref=e836]:
                - generic [ref=e837]:
                  - img "GLM Coding" [ref=e839]
                  - generic [ref=e840]:
                    - heading "GLM Coding" [level=3] [ref=e841]
                    - generic [ref=e843]: 无连接
                - button "拖拽排序" [ref=e845]
            - link "Groq Groq 无连接" [ref=e855] [cursor=pointer]:
              - /url: /dashboard/providers/groq
              - generic [ref=e858]:
                - generic [ref=e859]:
                  - img "Groq" [ref=e861]
                  - generic [ref=e862]:
                    - heading "Groq" [level=3] [ref=e863]
                    - generic [ref=e865]: 无连接
                - button "拖拽排序" [ref=e867]
            - link "Hyperbolic Hyperbolic 无连接" [ref=e877] [cursor=pointer]:
              - /url: /dashboard/providers/hyperbolic
              - generic [ref=e880]:
                - generic [ref=e881]:
                  - img "Hyperbolic" [ref=e883]
                  - generic [ref=e884]:
                    - heading "Hyperbolic" [level=3] [ref=e885]
                    - generic [ref=e887]: 无连接
                - button "拖拽排序" [ref=e889]
            - link "Kimi Kimi 无连接" [ref=e899] [cursor=pointer]:
              - /url: /dashboard/providers/kimi
              - generic [ref=e902]:
                - generic [ref=e903]:
                  - img "Kimi" [ref=e905]
                  - generic [ref=e906]:
                    - heading "Kimi" [level=3] [ref=e907]
                    - generic [ref=e909]: 无连接
                - button "拖拽排序" [ref=e911]
            - link "Minimax (China) Minimax (China) 无连接" [ref=e921] [cursor=pointer]:
              - /url: /dashboard/providers/minimax-cn
              - generic [ref=e924]:
                - generic [ref=e925]:
                  - img "Minimax (China)" [ref=e927]
                  - generic [ref=e928]:
                    - heading "Minimax (China)" [level=3] [ref=e929]
                    - generic [ref=e931]: 无连接
                - button "拖拽排序" [ref=e933]
            - link "Minimax Coding Minimax Coding 无连接" [ref=e943] [cursor=pointer]:
              - /url: /dashboard/providers/minimax
              - generic [ref=e946]:
                - generic [ref=e947]:
                  - img "Minimax Coding" [ref=e949]
                  - generic [ref=e950]:
                    - heading "Minimax Coding" [level=3] [ref=e951]
                    - generic [ref=e953]: 无连接
                - button "拖拽排序" [ref=e955]
            - link "Mistral Mistral 无连接" [ref=e965] [cursor=pointer]:
              - /url: /dashboard/providers/mistral
              - generic [ref=e968]:
                - generic [ref=e969]:
                  - img "Mistral" [ref=e971]
                  - generic [ref=e972]:
                    - heading "Mistral" [level=3] [ref=e973]
                    - generic [ref=e975]: 无连接
                - button "拖拽排序" [ref=e977]
            - link "Nebius AI Nebius AI 无连接" [ref=e987] [cursor=pointer]:
              - /url: /dashboard/providers/nebius
              - generic [ref=e990]:
                - generic [ref=e991]:
                  - img "Nebius AI" [ref=e993]
                  - generic [ref=e994]:
                    - heading "Nebius AI" [level=3] [ref=e995]
                    - generic [ref=e997]: 无连接
                - button "拖拽排序" [ref=e999]
          - status [ref=e1008]
          - button "expand_more 显示全部 31 个提供商" [ref=e1009] [cursor=pointer]:
            - generic [ref=e1010]: expand_more
            - text: 显示全部 31 个提供商
  - button "Open Next.js Dev Tools" [ref=e1016] [cursor=pointer]:
    - generic [ref=e1019]:
      - text: Compiling
      - generic [ref=e1020]:
        - generic [ref=e1021]: .
        - generic [ref=e1022]: .
        - generic [ref=e1023]: .
  - alert [ref=e1024]: 提供商
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
  21 |     await this.searchInput.fill(query);
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
> 41 |       return await sections[section].locator('h2').textContent();
     |                                                    ^ Error: locator.textContent: Test timeout of 30000ms exceeded.
  42 |     }
  43 |     return null;
  44 |   }
  45 | }
  46 | 
```