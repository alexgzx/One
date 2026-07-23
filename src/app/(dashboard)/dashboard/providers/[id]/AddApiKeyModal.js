"use client";

import { useState } from "react";
import PropTypes from "prop-types";
import { Button, Badge, Input, Modal, Select } from "@/shared/components";
import { AI_PROVIDERS } from "@/shared/constants/providers";

const BULK_PLACEHOLDER = `name1|sk-key1\nname2|sk-key2\nsk-key-only-auto-named`;

export default function AddApiKeyModal({ isOpen, provider, providerName, isCompatible, isAnthropic, authType, authHint, website, proxyPools, error, onSave, onBulkDone, onClose }) {
  const NONE_PROXY_POOL_VALUE = "__none__";
  const isOllamaLocal = provider === "ollama-local";
  const isCookie = authType === "cookie";
  const isXaiApiKey = provider === "xai" && !isCookie;
  const credentialLabel = isCookie ? "Cookie 值" : "API Key";
  const credentialPlaceholder = isCookie
    ? (provider === "grok-web" ? "sso=xxxxx... or just the raw value" : "eyJhbGciOi...")
    : (isXaiApiKey ? "xai-..." : "");

  const isAzure = provider === "azure";
  const isCloudflareAi = provider === "cloudflare-ai";
  const providerRegions = AI_PROVIDERS?.[provider]?.regions || null;
  const defaultRegion = AI_PROVIDERS?.[provider]?.defaultRegion || providerRegions?.[0]?.id || "";

  const [formData, setFormData] = useState({
    name: "",
    apiKey: "",
    defaultModel: "",
    priority: 1,
    proxyPoolId: NONE_PROXY_POOL_VALUE,
    ollamaHostUrl: "",
  });
  const [azureData, setAzureData] = useState({
    azureEndpoint: "",
    apiVersion: "2024-10-01-preview",
    deployment: "",
    organization: "",
  });
  const [cloudflareData, setCloudflareData] = useState({ accountId: "" });
  const [region, setRegion] = useState(defaultRegion);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState("single"); // "single" | "bulk"
  const [bulkText, setBulkText] = useState("");
  const [bulkResult, setBulkResult] = useState(null); // { success, failed }

  const buildProviderSpecificData = () => {
    if (isOllamaLocal && formData.ollamaHostUrl.trim()) {
      return { baseUrl: formData.ollamaHostUrl.trim() };
    }
    if (isAzure) {
      return {
        azureEndpoint: azureData.azureEndpoint,
        apiVersion: azureData.apiVersion,
        deployment: azureData.deployment,
        organization: azureData.organization,
      };
    }
    if (isCloudflareAi) {
      return { accountId: cloudflareData.accountId };
    }
    if (providerRegions && region) {
      return { region };
    }
    return undefined;
  };

  const handleValidate = async () => {
    setValidating(true);
    try {
      const res = await fetch("/api/providers/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, apiKey: formData.apiKey, providerSpecificData: buildProviderSpecificData() }),
      });
      const data = await res.json();
      setValidationResult(data.valid ? "success" : "failed");
    } catch {
      setValidationResult("failed");
    } finally {
      setValidating(false);
    }
  };

  const handleSubmit = async () => {
    if (!provider) return;
    if (!isOllamaLocal && !formData.apiKey) return;
    if (!isOllamaLocal) {
      // Non-ollama providers require a name
      if (!formData.name) return;
    }
    if (isCompatible && !formData.defaultModel.trim()) return;

    setSaving(true);
    try {
      let isValid = false;
      try {
        setValidating(true);
        setValidationResult(null);
        const res = await fetch("/api/providers/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ provider, apiKey: formData.apiKey, providerSpecificData: buildProviderSpecificData() }),
        });
        const data = await res.json();
        isValid = !!data.valid;
        setValidationResult(isValid ? "success" : "failed");
      } catch {
        setValidationResult("failed");
      } finally {
        setValidating(false);
      }

      await onSave({
        name: formData.name || (isOllamaLocal ? "Ollama Local" : ""),
        apiKey: formData.apiKey,
        defaultModel: isCompatible ? formData.defaultModel.trim() : undefined,
        priority: formData.priority,
        proxyPoolId: formData.proxyPoolId === NONE_PROXY_POOL_VALUE ? null : formData.proxyPoolId,
        testStatus: isValid ? "active" : "unknown",
        providerSpecificData: buildProviderSpecificData()
      });
    } finally {
      setSaving(false);
    }
  };

  const handleBulkSubmit = async () => {
    const lines = bulkText.split("\n").map(l => l.trim()).filter(Boolean);
    if (!lines.length) return;
    setSaving(true);
    setBulkResult(null);
    let success = 0;
    let failed = 0;
    for (let i = 0; i < lines.length; i++) {
      const parts = lines[i].split("|");
      const apiKey = parts.length >= 2 ? parts.slice(1).join("|").trim() : parts[0].trim();
      const baseName = parts.length >= 2 ? parts[0].trim() : "Key";
      const name = `${baseName} ${i + 1}`;
      try {
        const res = await fetch("/api/providers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ provider, apiKey, name, priority: 1, testStatus: "unknown" }),
        });
        if (res.ok) success++;
        else failed++;
      } catch {
        failed++;
      }
    }
    setSaving(false);
    setBulkResult({ success, failed });
    if (success > 0 && onBulkDone) onBulkDone();
  };

  if (!provider) return null;

  return (
    <Modal isOpen={isOpen} title={`添加 ${providerName || provider} ${credentialLabel}`} onClose={onClose}>
      <div className="flex flex-col gap-4">
        {/* Mode switcher */}
        <div className="flex gap-2">
          <Button size="sm" variant={mode === "single" ? "primary" : "ghost"} onClick={() => { setMode("single"); setBulkResult(null); }}>单个添加</Button>
          <Button size="sm" variant={mode === "bulk" ? "primary" : "ghost"} onClick={() => { setMode("bulk"); setBulkResult(null); }}>批量添加</Button>
        </div>

        {mode === "bulk" && (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-text-muted">每行一个密钥。格式：<code>name|apiKey</code> 或仅 <code>apiKey</code>（按索引自动命名）。</p>
            <textarea
              className="w-full rounded border border-accent/30 bg-sidebar p-2 text-sm font-mono resize-y min-h-[140px] focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder={BULK_PLACEHOLDER}
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
            />
            {bulkResult && (
              <div className={`text-sm font-medium ${bulkResult.failed > 0 ? "text-yellow-400" : "text-green-400"}`}>
                ✓ {bulkResult.success} added{bulkResult.failed > 0 ? `, ✗ ${bulkResult.failed} failed` : ""}
              </div>
            )}
            <div className="flex gap-2">
              <Button onClick={handleBulkSubmit} fullWidth disabled={saving || !bulkText.trim()}>
                {saving ? "添加中..." : "添加所有密钥"}
              </Button>
              <Button onClick={onClose} variant="ghost" fullWidth>取消</Button>
            </div>
          </div>
        )}

        {mode === "single" && (<>
        <Input
          label="名称"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder={isOllamaLocal ? "Ollama 本地" : "生产密钥"}
        />
        {isOllamaLocal && (
          <div className="flex gap-2">
            <Input
              label="Ollama 主机地址"
              value={formData.ollamaHostUrl}
              onChange={(e) => setFormData({ ...formData, ollamaHostUrl: e.target.value })}
              placeholder="http://localhost:11434"
              className="flex-1"
            />
            <div className="pt-6">
              <Button onClick={handleValidate} disabled={validating || saving} variant="secondary">
                {validating ? "检查中..." : "检查"}
              </Button>
            </div>
          </div>
        )}
        {!isOllamaLocal && (
          <div className="flex gap-2">
            <Input
              label={credentialLabel}
              type={isCookie ? "text" : "password"}
              value={formData.apiKey}
              onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
              placeholder={credentialPlaceholder}
              className="flex-1"
            />
            <div className="pt-6">
              <Button onClick={handleValidate} disabled={!formData.apiKey || validating || saving} variant="secondary">
                {validating ? "检查中..." : "检查"}
              </Button>
            </div>
          </div>
        )}
        {isXaiApiKey && (
          <p className="text-xs text-text-muted">
            使用来自 console.x.ai 的直接 xAI API 密钥。这与 Grok Build OAuth 是分开的。
          </p>
        )}
        {isCookie && authHint && (
          <p className="text-xs text-text-muted">
            {authHint}
            {website && (
              <>
                {" "}
                <a href={website} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                  Open {website.replace(/^https?:\/\//, "")}
                </a>
              </>
            )}
          </p>
        )}
        {providerRegions && (
          <Select
            label="区域"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            options={providerRegions.map((r) => ({ value: r.id, label: r.label }))}
          />
        )}
        {isCompatible && (
          <Input
            label="默认模型"
            value={formData.defaultModel}
            onChange={(e) => setFormData({ ...formData, defaultModel: e.target.value })}
            placeholder={isAnthropic ? "claude-3-5-sonnet-latest" : "gpt-4o-mini"}
          />
        )}
        {isOllamaLocal && (
          <p className="text-xs text-text-muted">
            留空使用 <code>http://localhost:11434</code>。对于远程 Ollama，请输入完整的主机地址（例如 <code>http://192.168.1.10:11434</code>）。
          </p>
        )}
        {validationResult && (
          <Badge variant={validationResult === "success" ? "success" : "error"}>
            {validationResult === "success" ? "有效" : "无效"}
          </Badge>
        )}
        {error && (
          <p className="text-xs text-red-500 break-words">{error}</p>
        )}
        {isCompatible && (
          <p className="text-xs text-text-muted">
            请按照兼容端点期望的格式输入模型 ID。此模型将作为连接的默认模型保存。
          </p>
        )}
        {isCloudflareAi && (
          <div className="bg-sidebar/50 p-4 rounded-lg border border-accent/20">
            <h3 className="font-semibold mb-3 text-sm">Cloudflare Workers AI</h3>
            <Input
              label="账户 ID"
              value={cloudflareData.accountId}
              onChange={(e) => setCloudflareData({ ...cloudflareData, accountId: e.target.value })}
              placeholder="abc123def456..."
            />
            <p className="text-xs text-text-muted mt-2">
              在 <a href="https://dash.cloudflare.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">dash.cloudflare.com</a> 的右侧边栏中找到您的账户 ID。
            </p>
          </div>
        )}
        {isAzure && (
          <div className="bg-sidebar/50 p-4 rounded-lg border border-accent/20">
            <h3 className="font-semibold mb-3 text-sm">Azure OpenAI 配置</h3>
            <div className="flex flex-col gap-3">
              <Input
                label="Azure 端点"
                value={azureData.azureEndpoint}
                onChange={(e) => setAzureData({ ...azureData, azureEndpoint: e.target.value })}
                placeholder="https://your-resource.openai.azure.com"
              />
              <Input
                label="部署名称"
                value={azureData.deployment}
                onChange={(e) => setAzureData({ ...azureData, deployment: e.target.value })}
                placeholder="gpt-4"
              />
              <Input
                label="API 版本"
                value={azureData.apiVersion}
                onChange={(e) => setAzureData({ ...azureData, apiVersion: e.target.value })}
                placeholder="2024-10-01-preview"
              />
              <Input
                label="组织"
                value={azureData.organization}
                onChange={(e) => setAzureData({ ...azureData, organization: e.target.value })}
                placeholder="组织 ID"
              />
            </div>
          </div>
        )}

        <Input
          label="优先级"
          type="number"
          value={formData.priority}
          onChange={(e) => setFormData({ ...formData, priority: Number.parseInt(e.target.value) || 1 })}
        />

        <Select
          label="代理池"
          value={formData.proxyPoolId}
          onChange={(e) => setFormData({ ...formData, proxyPoolId: e.target.value })}
          options={[
            { value: NONE_PROXY_POOL_VALUE, label: "无" },
            ...(proxyPools || []).map((pool) => ({ value: pool.id, label: pool.name })),
          ]}
          placeholder="无"
        />

        {(proxyPools || []).length === 0 && (
          <p className="text-xs text-text-muted">
            没有可用的活动代理池。请先在代理池页面创建一个。
          </p>
        )}

        <p className="text-xs text-text-muted">
          为了向后兼容，API 仍然接受旧版手动代理字段。
        </p>

        <div className="flex gap-2">
          <Button onClick={handleSubmit} fullWidth disabled={saving || (!isOllamaLocal && (!formData.name || !formData.apiKey)) || (isCompatible && !formData.defaultModel.trim()) || (isAzure && (!azureData.azureEndpoint || !azureData.deployment || !azureData.organization)) || (isCloudflareAi && !cloudflareData.accountId)}>
            {saving ? "保存中..." : "保存"}
          </Button>
          <Button onClick={onClose} variant="ghost" fullWidth>
            取消
          </Button>
        </div>
        </>)}
      </div>
    </Modal>
  );
}

AddApiKeyModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  provider: PropTypes.string,
  providerName: PropTypes.string,
  isCompatible: PropTypes.bool,
  isAnthropic: PropTypes.bool,
  authType: PropTypes.string,
  authHint: PropTypes.string,
  website: PropTypes.string,
  proxyPools: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
  })),
  error: PropTypes.string,
  onSave: PropTypes.func.isRequired,
  onBulkDone: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};
