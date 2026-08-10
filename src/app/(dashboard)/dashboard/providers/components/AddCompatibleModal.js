"use client";

import { useState, useMemo } from "react";
import PropTypes from "prop-types";
import { Button, Input, Modal } from "@/shared/components";

const VARIANT_CONFIG = {
  openai: {
    title: "添加 OpenAI 兼容",
    type: "openai-compatible",
    defaultBaseUrl: "https://api.openai.com/v1",
    namePlaceholder: "OpenAI 兼容 (生产)",
    baseUrlHint: "使用 OpenAI 兼容 API 的基础 URL（以 /v1 结尾）。",
    errorLabel: "OpenAI 兼容",
    defaultApiType: "chat",
  },
  anthropic: {
    title: "添加 Anthropic 兼容",
    type: "anthropic-compatible",
    defaultBaseUrl: "https://api.anthropic.com/v1",
    namePlaceholder: "Anthropic 兼容 (生产)",
    baseUrlHint: "使用 Anthropic 兼容 API 的基础 URL（以 /v1 结尾）。系统将追加 /messages。",
    errorLabel: "Anthropic 兼容",
    defaultApiType: null,
  },
};

function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32) || "provider";
}

function AddCompatibleModal({ variant, isOpen, onClose, onCreated }) {
  const config = VARIANT_CONFIG[variant];

  const [name, setName] = useState("");
  const [baseUrl, setBaseUrl] = useState(config.defaultBaseUrl);
  const [submitting, setSubmitting] = useState(false);

  const autoPrefix = useMemo(() => {
    const slug = slugify(name);
    if (variant === "openai") return `oc-${slug}`;
    return `ac-${slug}`;
  }, [name, variant]);

  // 重置逻辑移至父组件：仅在 isOpen 时挂载本组件，使其每次打开都是全新的实例，
  // 不再需要在 effect 内同步 setState，避免 react-hooks/set-state-in-effect 警告。

  const handleSubmit = async () => {
    if (!name.trim() || !baseUrl.trim()) return;
    setSubmitting(true);
    try {
      const body = {
        name: name.trim(),
        prefix: autoPrefix,
        baseUrl: baseUrl.trim(),
        type: config.type,
      };
      if (config.defaultApiType) {
        body.apiType = config.defaultApiType;
      }
      const res = await fetch("/api/provider-nodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        onCreated(data.node);
        setName("");
        setBaseUrl(config.defaultBaseUrl);
      }
    } catch (error) {
      console.log(`Error creating ${config.errorLabel} node:`, error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} title={config.title} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <Input
          label="名称"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={config.namePlaceholder}
          hint="必填。此节点的友好标签。"
          autoFocus
        />
        <Input
          label="基础 URL"
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          placeholder={config.defaultBaseUrl}
          hint={config.baseUrlHint}
        />
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            onClick={handleSubmit}
            fullWidth
            disabled={!name.trim() || !baseUrl.trim() || submitting}
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
