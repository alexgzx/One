export default {
  id: "sensenova",
  priority: 115,
  alias: "sensenova",
  aliases: [
    "sensetime",
    "sensechat",
  ],
  uiAlias: "sn",
  display: {
    name: "商汤日日新",
    icon: "sensenova",
    color: "#00B2A2",
    textIcon: "商",
    website: "https://platform.sensenova.cn",
    notice: {
      apiKeyUrl: "https://platform.sensenova.cn/console/keys",
    },
  },
  category: "apikey",
  transport: {
    baseUrl: "https://api.sensenova.cn/compatible-mode/v2/chat/completions",
    validateUrl: "https://api.sensenova.cn/compatible-mode/v2/models",
    reasoningInject: {
      scope: "all",
    },
  },
  models: [
    { id: "SenseChat-5", name: "SenseChat 5" },
    { id: "SenseNova-V6-Pro", name: "SenseNova V6 Pro" },
    { id: "sensenova-6.7-flash-lite", name: "SenseNova 6.7 Flash Lite" },
    { id: "deepseek-v4-flash", name: "DeepSeek V4 Flash" },
  ],
};
