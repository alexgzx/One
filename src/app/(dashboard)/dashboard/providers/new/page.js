"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, Button, Input, Select, Toggle } from "@/shared/components";
import { AI_PROVIDERS, AUTH_METHODS } from "@/shared/constants/config";

const providerOptions = Object.values(AI_PROVIDERS).map((p) => ({
  value: p.id,
  label: p.name,
}));

const authMethodOptions = Object.values(AUTH_METHODS).map((m) => ({
  value: m.id,
  label: m.name,
}));

export default function NewProviderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    provider: "",
    authMethod: "api_key",
    apiKey: "",
    displayName: "",
    isActive: true,
  });
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.provider) newErrors.provider = "请选择提供商";
    if (formData.authMethod === "api_key" && !formData.apiKey) {
      newErrors.apiKey = "API Key 是必填项";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await fetch("/api/providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push("/dashboard/providers");
      } else {
        const data = await response.json();
        setErrors({ submit: data.error || "创建提供商失败" });
      }
    } catch (error) {
      setErrors({ submit: "发生错误，请重试。" });
    } finally {
      setLoading(false);
    }
  };

  const selectedProvider = AI_PROVIDERS[formData.provider];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/providers"
          className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-primary transition-colors mb-4"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          返回提供商
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">添加新提供商</h1>
        <p className="text-text-muted mt-2">
          配置新的 AI 提供商以供应用使用。
        </p>
      </div>

      {/* Form */}
      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Provider Selection */}
          <Select
            label="提供商"
            options={providerOptions}
            value={formData.provider}
            onChange={(e) => handleChange("provider", e.target.value)}
            placeholder="选择提供商"
            error={errors.provider}
            required
          />

          {/* Provider Info */}
          {selectedProvider && (
            <Card.Section className="flex items-center gap-3">
              <div
                className="size-10 rounded-lg flex items-center justify-center bg-bg border border-border"
              >
                <span
                  className="material-symbols-outlined text-xl"
                  style={{ color: selectedProvider.color }}
                >
                  {selectedProvider.icon}
                </span>
              </div>
              <div>
                <p className="font-medium">{selectedProvider.name}</p>
                <p className="text-sm text-text-muted">
                  已选择提供商
                </p>
              </div>
            </Card.Section>
          )}

          {/* Auth Method */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium">
              认证方式 <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-3">
              {authMethodOptions.map((method) => (
                <button
                  key={method.value}
                  type="button"
                  onClick={() => handleChange("authMethod", method.value)}
                  className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-lg border transition-all ${
                    formData.authMethod === method.value
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <span className="material-symbols-outlined">
                    {method.value === "api_key" ? "key" : "lock"}
                  </span>
                  <span className="font-medium">{method.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* API Key Input */}
          {formData.authMethod === "api_key" && (
            <Input
            label="API Key"
            type="password"
            placeholder="输入您的 API Key"
            value={formData.apiKey}
            onChange={(e) => handleChange("apiKey", e.target.value)}
            error={errors.apiKey}
            hint="您的 API Key 将被加密并安全存储。"
            required
          />
          )}

          {/* OAuth2 Button */}
          {formData.authMethod === "oauth2" && (
            <Card.Section>
              <p className="text-sm text-text-muted mb-4">
                使用 OAuth2 认证连接您的账户。
              </p>
              <Button type="button" variant="secondary" icon="link">
                使用 OAuth2 连接
              </Button>
            </Card.Section>
          )}

          {/* Display Name */}
          <Input
            label="显示名称"
            placeholder="例如：生产 API，开发环境"
            value={formData.displayName}
            onChange={(e) => handleChange("displayName", e.target.value)}
            hint="可选。用于标识此配置的友好名称。"
          />

          {/* Active Toggle */}
          <Toggle
            checked={formData.isActive}
            onChange={(checked) => handleChange("isActive", checked)}
            label="启用"
            description="启用此提供商以供应用使用"
          />

          {/* Error Message */}
          {errors.submit && (
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
              {errors.submit}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <Link href="/dashboard/providers" className="flex-1">
              <Button type="button" variant="ghost" fullWidth>
                取消
              </Button>
            </Link>
            <Button type="submit" loading={loading} fullWidth className="flex-1">
              创建提供商
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

