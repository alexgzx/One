export default {
  id: "stepfun",
  priority: 115,
  alias: "stepfun",
  aliases: [
    "step-fun",
    "step",
  ],
  uiAlias: "sf",
  display: {
    name: "阶跃星辰",
    icon: "stepfun",
    color: "#165DFF",
    textIcon: "阶",
    website: "https://platform.stepfun.com",
    notice: {
      apiKeyUrl: "https://platform.stepfun.com/interface-key",
    },
  },
  category: "apikey",
  transport: {
    baseUrl: "https://api.stepfun.com/v1/chat/completions",
    validateUrl: "https://api.stepfun.com/v1/models",
    reasoningInject: {
      scope: "all",
    },
  },
  models: [
    { id: "step-3.7-flash", name: "Step 3.7 Flash" },
    { id: "step-3.5-flash", name: "Step 3.5 Flash" },
    { id: "step-2", name: "Step 2" },
    { id: "step-1o-vision-32k", name: "Step 1o Vision 32K" },
  ],
};
