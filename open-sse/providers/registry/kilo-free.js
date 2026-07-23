export default {
  id: "kilo-free",
  priority: 60,
  hasFree: true,
  alias: "kf",
  uiAlias: "kf",
  display: {
    name: "Kilo Code Free",
    icon: "code",
    color: "#FF6B35",
    textIcon: "KF",
  },
  category: "free",
  noAuth: true,
  transport: {
    baseUrl: "https://api.kilo.ai/api/openrouter/chat/completions",
    headers: {},
    noAuth: true,
  },
  models: [],
  modelsFetcher: { url: "https://api.kilo.ai/api/gateway/models", type: "kilo-free" },
  passthroughModels: true,
};