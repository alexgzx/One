export default {
  id: "baidu",
  priority: 115,
  alias: "baidu",
  aliases: [
    "ernie",
    "qianfan",
  ],
  uiAlias: "bd",
  display: {
    name: "百度千帆",
    icon: "baidu",
    color: "#2932E1",
    textIcon: "百",
    website: "https://qianfan.cloud.baidu.com",
    notice: {
      apiKeyUrl: "https://console.bce.baidu.com/qianfan/ais/console/applicationConsole/application/v2",
    },
  },
  category: "apikey",
  transport: {
    baseUrl: "https://qianfan.baidubce.com/v2/chat/completions",
    validateUrl: "https://qianfan.baidubce.com/v2/models",
    reasoningInject: {
      scope: "all",
    },
  },
  models: [
    { id: "ernie-4.5-turbo-32k", name: "ERNIE 4.5 Turbo 32K" },
    { id: "ernie-4.5-turbo-128k", name: "ERNIE 4.5 Turbo 128K" },
    { id: "ernie-3.5-8k", name: "ERNIE 3.5 8K" },
    { id: "ernie-speed-8k", name: "ERNIE Speed 8K" },
    { id: "ernie-lite-8k", name: "ERNIE Lite 8K" },
    { id: "ernie-4.0-turbo-8k", name: "ERNIE 4.0 Turbo 8K" },
  ],
};
