export default {
  id: "xunfei",
  priority: 115,
  alias: "xunfei",
  aliases: [
    "spark",
    "xfyun",
  ],
  uiAlias: "xf",
  display: {
    name: "讯飞星火",
    icon: "xunfei",
    color: "#00B4A0",
    textIcon: "讯",
    website: "https://xinghuo.xfyun.cn",
    notice: {
      apiKeyUrl: "https://console.xfyun.cn/services/bmAgent",
    },
  },
  category: "apikey",
  transport: {
    baseUrl: "https://spark-api-open.xf-yun.com/v1/chat/completions",
    validateUrl: "https://spark-api-open.xf-yun.com/v1/models",
    reasoningInject: {
      scope: "all",
    },
  },
  models: [
    { id: "4.0Ultra", name: "星火 4.0 Ultra" },
    { id: "generalv3.5", name: "星火 V3.5" },
    { id: "max-32k", name: "星火 Max 32K" },
    { id: "generalv3", name: "星火 V3" },
    { id: "pro-128k", name: "星火 Pro 128K" },
    { id: "lite", name: "星火 Lite" },
    { id: "spark-x", name: "星火 X" },
  ],
};
