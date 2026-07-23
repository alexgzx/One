"use client";

import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Badge, Button, Input, Modal, Select } from "@/shared/components";

const VARIANT_CONFIG = {
  openai: {
    title: "添加 OpenAI 兼容",
    type: "openai-compatible",
    defaultBaseUrl: "https://api.openai.com/v1",
    namePlaceholder: "OpenAI 兼容 (生产)",
    prefixPlaceholder: "oc-prod",
    baseUrlHint: "使用 OpenAI 兼容 API 的基础 URL（以 /v1 结尾）。",
    modelIdPlaceholder: "例如 gpt-4, claude-3-opus",
    errorLabel: "OpenAI 兼容",
    hasApiType: true,
  },
  anthropic: {
    title: "添加 Anthropic 兼容",
    type: "anthropic-compatible",
    defaultBaseUrl: "https://api.anthropic.com/v1",
    namePlaceholder: "Anthropic 兼容 (生产)",
    prefixPlaceholder: "ac-prod",
    baseUrlHint: "使用 Anthropic 兼容 API 的基础 URL（以 /v1 结尾）。系统将追加 /messages。",
    modelIdPlaceholder: "例如 claude-3-opus",
    errorLabel: "Anthropic 兼容",
    hasApiType: false,
  },
};

const API_TYPE_OPTIONS = [
  { value: "chat", label: "Chat Completions" },
  { value: "responses", label: "Responses API" },
];

function AddCompatibleModal({ variant, isOpen, onClose, onCreated }) {
  const config = VARIANT_CONFIG[variant];
  const initialFormData = () => ({
    name: "",
    prefix: "",
    ...(config.hasApiType ? { apiType: "chat" } : {}),
    baseUrl: config.defaultBaseUrl,
  });

  const [formData, setFormData] = useState(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [checkKey, setCheckKey] = useState("");
  const [checkModelId, setCheckModelId] = useState("");
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  // openai: reset baseUrl when apiType changes; anthropic: reset checks when opened
  useEffect(() => {
    if (config.hasApiType) {
      setFormData((prev) => ({ ...prev, baseUrl: config.defaultBaseUrl }));
    } else if (isOpen) {
      setValidationResult(null);
      setCheckKey("");
      setCheckModelId("");
    }
  }, [config.hasApiType ? formData.apiType : isOpen]);

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.prefix.trim() || !formData.baseUrl.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/provider-nodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          prefix: formData.prefix,
          ...(config.hasApiType ? { apiType: formData.apiType } : {}),
          baseUrl: formData.baseUrl,
          type: config.type,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        onCreated(data.node);
        setFormData(initialFormData());
        setCheckKey("");
        setValidationResult(null);
      }
    } catch (error) {
      console.log(`Error creating ${config.errorLabel} node:`, error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleValidate = async () => {
    setValidating(true);
    try {
      const res = await fetch("/api/provider-nodes/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baseUrl: formData.baseUrl,
          apiKey: checkKey,
          type: config.type,
          modelId: checkModelId.trim() || undefined,
        }),
      });
      const data = await res.json();
      setValidationResult(data);
    } catch {
      setValidationResult({ valid: false, error: "Network error" });
    } finally {
      setValidating(false);
    }
  };

  const renderValidationResult = () => {
    if (!validationResult) return null;
    const { valid, error, method } = validationResult;
    if (valid) {
      return (
        <>
          <Badge variant="success">有效</Badge>
          {method === "chat" && (
            <span className="text-sm text-text-muted">(通过推理测试)</span>
          )}
        </>
      );
    }
    return (
      <div className="flex flex-col gap-1">
        <Badge variant="error">无效</Badge>
        {error && <span className="text-sm text-red-500">{error}</span>}
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} title={config.title} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <Input
          label="名称"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder={config.namePlaceholder}
          hint="必填。此节点的友好标签。"
        />
        <Input
          label="前缀"
          value={formData.prefix}
          onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
          placeholder={config.prefixPlaceholder}
          hint="必填。用作模型 ID 的提供商前缀。"
        />
        {config.hasApiType && (
          <Select
            label="API 类型"
            options={API_TYPE_OPTIONS}
            value={formData.apiType}
            onChange={(e) => setFormData({ ...formData, apiType: e.target.value })}
          />
        )}
        <Input
          label="基础 URL"
          value={formData.baseUrl}
          onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
          placeholder={config.defaultBaseUrl}
          hint={config.baseUrlHint}
        />
        <Input
          label="API Key（用于检查）"
          type="password"
          value={checkKey}
          onChange={(e) => setCheckKey(e.target.value)}
        />
        <Input
          label="模型 ID（可选）"
          value={checkModelId}
          onChange={(e) => setCheckModelId(e.target.value)}
          placeholder={config.modelIdPlaceholder}
          hint="如果提供商缺少 /models 端点，请输入模型 ID 通过 chat/completions 进行验证。"
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            onClick={handleValidate}
            disabled={!checkKey || validating || !formData.baseUrl.trim()}
            variant="secondary"
            className="w-full sm:w-auto"
          >
            {validating ? "检查中..." : "检查"}
          </Button>
          {renderValidationResult()}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            onClick={handleSubmit}
            fullWidth
            disabled={
              !formData.name.trim() ||
              !formData.prefix.trim() ||
              !formData.baseUrl.trim() ||
              submitting
            }
          >
            {submitting ? "创建中..." : "创建"}
          </Button>
          <Button onClick={onClose} variant="ghost" fullWidth>
            取消
          </Button>
        </div>
      </div>
    </Modal>
  );
}

AddCompatibleModal.propTypes = {
  variant: PropTypes.oneOf(["openai", "anthropic"]).isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCreated: PropTypes.func.isRequired,
};

export default AddCompatibleModal;
