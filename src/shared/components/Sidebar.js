"use client";

import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/utils/cn";
import { MEDIA_PROVIDER_KINDS } from "@/shared/constants/providers";

// ============================================================
// Lucide 图标 (Linear 风格：1.5px 线宽，无填充)
// ============================================================
import {
  Cable,
  Server,
  Layers3,
  BarChart3,
  Gauge,
  Image as ImageIcon,
  Brush,
  Mic,
  Volume2,
  Search,
  Globe,
  Film,
  Music,
  ScanText,
  Terminal,
  Languages,
  Settings,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

// ============================================================
// 自定义品牌图标
// ============================================================
function OneIcon({ size = 15, className }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 1024 1024"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M487.904 6.528L88.128 238.208a48.32 48.32 0 0 0-24.032 41.952V743.68c0 17.248 9.184 33.28 24.064 41.888l399.776 231.904c14.944 8.672 33.28 8.672 48.224 0l399.616-231.808c14.944-8.736 24.064-24.672 24.096-41.888V280.16a48.64 48.64 0 0 0-24.16-41.984L536.192 6.496a47.936 47.936 0 0 0-48.224 0z"
        fill="#339933"
      />
    </svg>
  );
}

// 主导航图标映射
const iconMap = {
  api: Cable,
  dns: Server,
  layers: Layers3,
  bar_chart: BarChart3,
  data_usage: Gauge,
  terminal: Terminal,
  translate: Languages,
  settings: Settings,
  perm_media: ImageIcon,
};

// 媒体子项图标映射
const mediaIconMap = {
  data_array: Layers3,
  brush: Brush,
  image_search: ScanText,
  record_voice_over: Volume2,
  mic: Mic,
  travel_explore: Search,
  language: Globe,
  movie: Film,
  music_note: Music,
};

// 中文 Label 映射
const labelMap = {
  endpoint: "端点",
  providers: "提供商",
  combos: "组合",
  usage: "使用情况",
  quota: "配额跟踪器",
  console_log: "控制台日志",
  translator: "翻译器",
  settings: "设置",
  embedding: "向量嵌入",
  image: "文本生图",
  imageToText: "图片识文",
  tts: "文本转语音",
  stt: "语音转文本",
  webSearch: "网页搜索",
  webFetch: "网页抓取",
  video: "视频生成",
  music: "音乐生成",
};

const CONFIG = {
  iconSize: 16,
  iconStrokeWidth: 1.5,
  fontSize: "text-[13.5px]",
  itemPadding: "py-1.5 px-3",
  itemRadius: "rounded-lg",
};

const navItems = [
  { href: "/dashboard/endpoint", id: "endpoint", icon: "api" },
  { href: "/dashboard/providers", id: "providers", icon: "dns" },
  { href: "/dashboard/combos", id: "combos", icon: "layers" },
  { href: "/dashboard/usage", id: "usage", icon: "bar_chart" },
  { href: "/dashboard/quota", id: "quota", icon: "data_usage" },
];

const debugItems = [
  { href: "/dashboard/console-log", id: "console_log", icon: "terminal" },
  { href: "/dashboard/translator", id: "translator", icon: "translate" },
];

function resolveIcon(iconName) {
  return iconMap[iconName] || mediaIconMap[iconName] || Layers3;
}

// ============================================================
// 导航项（支持 collapsed 模式）
// ============================================================
function NavItem({ href, icon, label, active, onClose, indent = false, collapsed = false }) {
  const IconComponent = resolveIcon(icon);

  if (collapsed) {
    return (
      <Link
        href={href}
        onClick={onClose}
        title={label}
        className={cn(
          "flex items-center justify-center mx-auto size-9 rounded-lg transition-colors duration-150",
          active
            ? "bg-zinc-100 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100"
            : "text-zinc-400 dark:text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 hover:text-zinc-700 dark:hover:text-zinc-200"
        )}
      >
        <IconComponent size={CONFIG.iconSize} strokeWidth={CONFIG.iconStrokeWidth} />
      </Link>
    );
  }

  return (
    <Link
      href={href}
      onClick={onClose}
      className={cn(
        "flex items-center gap-2.5 transition-colors duration-100 ease-out",
        indent ? "pl-9 pr-3 py-1" : CONFIG.itemPadding,
        CONFIG.itemRadius,
        active
          ? "bg-zinc-100 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 font-medium"
          : "text-zinc-500 dark:text-zinc-400 font-normal hover:bg-zinc-50 dark:hover:bg-zinc-800/40 hover:text-zinc-700 dark:hover:text-zinc-200"
      )}
    >
      <IconComponent
        size={indent ? 14 : CONFIG.iconSize}
        strokeWidth={CONFIG.iconStrokeWidth}
        className={cn(
          "flex-shrink-0",
          active ? "text-zinc-700 dark:text-zinc-200" : "text-zinc-400 dark:text-zinc-500"
        )}
      />
      <span className={CONFIG.fontSize}>{label}</span>
    </Link>
  );
}

NavItem.propTypes = {
  href: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  active: PropTypes.bool,
  onClose: PropTypes.func,
  indent: PropTypes.bool,
  collapsed: PropTypes.bool,
};

// ============================================================
// 媒体提供商折叠组
// ============================================================
function MediaProvidersGroup({ pathname, onClose, collapsed }) {
  const [isOpen, setIsOpen] = useState(false);
  const isAnyMediaActive = pathname.startsWith("/dashboard/media-providers");

  const VISIBLE_MEDIA_KINDS = ["embedding", "image", "tts", "stt"];
  const visibleMediaItems = MEDIA_PROVIDER_KINDS.filter((k) =>
    VISIBLE_MEDIA_KINDS.includes(k.id)
  );

  if (collapsed) {
    return (
      <Link
        href="/dashboard/media-providers/embedding"
        onClick={onClose}
        title="媒体提供商"
        className={cn(
          "flex items-center justify-center mx-auto size-9 rounded-lg transition-colors duration-150",
          isAnyMediaActive
            ? "bg-zinc-100 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100"
            : "text-zinc-400 dark:text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 hover:text-zinc-700 dark:hover:text-zinc-200"
        )}
      >
        <ImageIcon size={CONFIG.iconSize} strokeWidth={CONFIG.iconStrokeWidth} />
      </Link>
    );
  }

  return (
    <div className="space-y-0.5">
      <button
        onClick={() => setIsOpen((v) => !v)}
        className={cn(
          "w-full flex items-center gap-2.5 transition-colors duration-100 ease-out",
          CONFIG.itemPadding,
          CONFIG.itemRadius,
          isAnyMediaActive
            ? "bg-zinc-100 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 font-medium"
            : "text-zinc-500 dark:text-zinc-400 font-normal hover:bg-zinc-50 dark:hover:bg-zinc-800/40 hover:text-zinc-700 dark:hover:text-zinc-200"
        )}
      >
        <ImageIcon
          size={CONFIG.iconSize}
          strokeWidth={CONFIG.iconStrokeWidth}
          className={cn(
            "flex-shrink-0",
            isAnyMediaActive ? "text-zinc-700 dark:text-zinc-200" : "text-zinc-400 dark:text-zinc-500"
          )}
        />
        <span className={CONFIG.fontSize}>媒体提供商</span>
        <ChevronRight
          size={14}
          strokeWidth={1.5}
          className={cn(
            "ml-auto flex-shrink-0 transition-transform duration-200",
            isAnyMediaActive ? "text-zinc-500" : "text-zinc-400",
            isOpen && "rotate-90"
          )}
        />
      </button>

      {isOpen && visibleMediaItems.map((kind) => (
        <NavItem
          key={kind.id}
          href={`/dashboard/media-providers/${kind.id}`}
          icon={kind.icon}
          label={labelMap[kind.id] || kind.label}
          active={pathname.startsWith(`/dashboard/media-providers/${kind.id}`)}
          onClose={onClose}
          indent
        />
      ))}
    </div>
  );
}

MediaProvidersGroup.propTypes = {
  pathname: PropTypes.string.isRequired,
  onClose: PropTypes.func,
  collapsed: PropTypes.bool,
};

// ============================================================
// 主 Sidebar
// ============================================================
export default function Sidebar({ onClose, collapsed = false, onToggleCollapse }) {
  const pathname = usePathname();
  const [enableTranslator, setEnableTranslator] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.enableTranslator) setEnableTranslator(true);
      })
      .catch(() => {});
  }, []);

  const isActive = (href) => {
    if (href === "/dashboard/endpoint") {
      return pathname === "/dashboard" || pathname.startsWith("/dashboard/endpoint");
    }
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        "relative flex flex-col min-h-full border-r border-zinc-200/80 dark:border-zinc-800/80",
        "bg-white/90 dark:bg-zinc-900/90 transition-[width] duration-300 ease-in-out",
        collapsed ? "w-[68px]" : "w-60"
      )}
    >
      {/* 顶部品牌区 + 折叠按钮 */}
      <div className={cn("flex items-center pt-4 pb-3", collapsed ? "px-3 justify-center" : "px-3 justify-between")}>
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center size-7">
              <OneIcon size={28} />
            </div>
            <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 tracking-tight">
              One
            </span>
          </div>
        )}
        {collapsed && (
          <div className="flex items-center justify-center size-7">
            <OneIcon size={28} />
          </div>
        )}
      </div>

      {/* 折叠按钮 - 边缘悬浮按钮 */}
      {onToggleCollapse && (
        <button
          onClick={onToggleCollapse}
          className={cn(
            "absolute top-6 -right-3 z-10 flex items-center justify-center size-6 rounded-full",
            "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700",
            "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100",
            "shadow-sm hover:shadow-md transition-all duration-200",
            "opacity-0 group-hover/sidebar:opacity-100"
          )}
          title={collapsed ? "展开侧边栏" : "收起侧边栏"}
        >
          {collapsed ? (
            <PanelLeftOpen size={13} strokeWidth={1.8} />
          ) : (
            <PanelLeftClose size={13} strokeWidth={1.8} />
          )}
        </button>
      )}

      {/* 细分割线 */}
      <div className="mx-3 h-px bg-zinc-200/60 dark:bg-zinc-800/60" />

      {/* 主导航 */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5 custom-scrollbar">
        {/* 分组标题 */}
        {!collapsed && (
          <p className="px-3 mb-1.5 text-[11px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.1em]">
            功能
          </p>
        )}

        {navItems.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={labelMap[item.id] || item.id}
            active={isActive(item.href)}
            onClose={onClose}
            collapsed={collapsed}
          />
        ))}

        {/* 分组分割 */}
        <div className="my-3 mx-1 h-px bg-zinc-200/40 dark:bg-zinc-800/40" />

        {/* 分组标题 */}
        {!collapsed && (
          <p className="px-3 mb-1.5 text-[11px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.1em]">
            系统
          </p>
        )}

        {/* 媒体提供商 - 暂时隐藏，后期改造后启用
        <MediaProvidersGroup pathname={pathname} onClose={onClose} collapsed={collapsed} />
        */}

        {/* 调试项 */}
        {debugItems.map((item) => {
          const show = item.href !== "/dashboard/translator" || enableTranslator;
          return show ? (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={labelMap[item.id] || item.id}
              active={isActive(item.href)}
              onClose={onClose}
              collapsed={collapsed}
            />
          ) : null;
        })}

        {/* 设置 */}
        <NavItem
          href="/dashboard/profile"
          icon="settings"
          label="设置"
          active={isActive("/dashboard/profile")}
          onClose={onClose}
          collapsed={collapsed}
        />
      </nav>

      {/* 底部：服务状态 */}
      <div className={cn("border-t border-zinc-200/60 dark:border-zinc-800/60", collapsed ? "p-2" : "p-3")}>
        {collapsed ? (
          <div className="flex justify-center" title="服务运行中">
            <div className="relative">
              <span className="size-2 rounded-full bg-emerald-500 block" />
              <span className="absolute inset-0 rounded-full bg-emerald-500/40 animate-ping" />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/40">
            <div className="relative">
              <span className="size-2 rounded-full bg-emerald-500 block" />
              <span className="absolute inset-0 rounded-full bg-emerald-500/40 animate-ping" />
            </div>
            <span className="text-[12px] text-zinc-500 dark:text-zinc-400 font-medium">
              服务运行中
            </span>
          </div>
        )}
      </div>
    </aside>
  );
}

Sidebar.propTypes = {
  onClose: PropTypes.func,
  collapsed: PropTypes.bool,
  onToggleCollapse: PropTypes.func,
};
