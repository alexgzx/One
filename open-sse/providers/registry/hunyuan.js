export default {
  id: "hunyuan",
  priority: 115,
  alias: "hunyuan",
  aliases: [
    "tencent-hunyuan",
    "tencent",
  ],
  uiAlias: "hy",
  display: {
    name: "腾讯混元",
    icon: "hunyuan",
    color: "#0053E0",
    textIcon: "元",
    website: "https://hunyuan.cloud.tencent.com",
    notice: {
      apiKeyUrl: "https://console.cloud.tencent.com/hunyuan/start",
    },
  },
  category: "apikey",
  transport: {
    baseUrl: "https://api.hunyuan.cloud.tencent.com/v1/chat/completions",
    validateUrl: "https://api.hunyuan.cloud.tencent.com/v1/models",
    reasoningInject: {
      scope: "all",
    },
  },
  models: [
    { id: "hunyuan-turbos-latest", name: "混元 Turbos Latest" },
    { id: "hunyuan-t1-latest", name: "混元 T1 Latest" },
    { id: "hunyuan-lite", name: "混元 Lite" },
    { id: "hunyuan-turbo-s", name: "混元 Turbo S" },
    { id: "hy3", name: "混元 HY3" },
  ],
};
