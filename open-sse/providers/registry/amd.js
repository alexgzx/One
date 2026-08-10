export default {
  id: "amd",
  priority: 115,
  alias: "amd",
  aliases: [
    "amd-gpu-cloud",
    "radeon",
  ],
  uiAlias: "amd",
  display: {
    name: "AMD GPU Cloud",
    icon: "memory",
    color: "#ED1C24",
    textIcon: "AMD",
    website: "https://developer.amd.com.cn/radeon",
    notice: {
      apiKeyUrl: "https://developer.amd.com.cn/",
    },
  },
  category: "apikey",
  transport: {
    baseUrl: "https://developer.amd.com.cn/radeon/v1/chat/completions",
    validateUrl: "https://developer.amd.com.cn/radeon/v1/models",
    reasoningInject: {
      scope: "all",
    },
  },
  models: [
    { id: "amd-llama-3.1-8b", name: "AMD Llama 3.1 8B" },
    { id: "amd-llama-3.1-70b", name: "AMD Llama 3.1 70B" },
    { id: "amd-mistral-7b", name: "AMD Mistral 7B" },
  ],
};
