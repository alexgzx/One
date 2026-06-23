"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import PropTypes from "prop-types";
import ProviderIcon from "@/shared/components/ProviderIcon";
import HeaderMenu from "@/shared/components/HeaderMenu";
import HeaderLanguage from "@/shared/components/HeaderLanguage";
import ThemeToggle from "@/shared/components/ThemeToggle";

import { useHeaderSearchStore } from "@/store/headerSearchStore";
import { OAUTH_PROVIDERS, APIKEY_PROVIDERS } from "@/shared/constants/config";
import { MEDIA_PROVIDER_KINDS, AI_PROVIDERS } from "@/shared/constants/providers";
import { translate } from "@/i18n/runtime";

const getPageInfo = (pathname) => {
  if (!pathname) return { title: "", description: "", breadcrumbs: [] };

  // Media provider detail: /dashboard/media-providers/[kind]/[id]
  const mediaDetailMatch = pathname.match(/\/media-providers\/([^/]+)\/([^/]+)$/);
  if (mediaDetailMatch) {
    const kindId = mediaDetailMatch[1];
    const providerId = mediaDetailMatch[2];
    const kindConfig = MEDIA_PROVIDER_KINDS.find((k) => k.id === kindId);
    const provider = AI_PROVIDERS[providerId];
    return {
      title: provider?.name || providerId,
      description: "",
      breadcrumbs: [
        { label: "Media Providers", href: `/dashboard/media-providers/${kindId}` },
        { label: kindConfig?.label || kindId, href: `/dashboard/media-providers/${kindId}` },
        { label: provider?.name || providerId, image: `/providers/${providerId}.png` },
      ],
    };
  }

  // Media provider kind: /dashboard/media-providers/[kind]
  const mediaKindMatch = pathname.match(/\/media-providers\/([^/]+)$/);
  if (mediaKindMatch) {
    const kindId = mediaKindMatch[1];
    const kindConfig = MEDIA_PROVIDER_KINDS.find((k) => k.id === kindId);
    return {
      title: kindConfig?.label || kindId,
      description: `Manage your ${kindConfig?.label || kindId} providers`,
      icon: kindConfig?.icon || "perm_media",
      breadcrumbs: [],
    };
  }

  // Provider detail page: /dashboard/providers/[id]
  const providerMatch = pathname.match(/\/providers\/([^/]+)$/);
  if (providerMatch) {
    const providerId = providerMatch[1];
    const providerInfo =
      OAUTH_PROVIDERS[providerId] || APIKEY_PROVIDERS[providerId];
    if (providerInfo) {
      return {
        title: providerInfo.name,
        description: "",
        breadcrumbs: [
          { label: "Providers", href: "/dashboard/providers" },
          {
            label: providerInfo.name,
            image: `/providers/${providerInfo.id}.png`,
          },
        ],
      };
    }
  }

  if (pathname.includes("/providers") && !pathname.includes("/media-providers"))
    return {
      title: "Providers",
      description: "Manage your AI provider connections",
      icon: "dns",
      breadcrumbs: [],
    };
  if (pathname.includes("/combos"))
    return {
      title: "Combos",
      description: "Model combos with fallback",
      icon: "layers",
      breadcrumbs: [],
    };
  if (pathname.includes("/usage"))
    return {
      title: "Usage & Analytics",
      description:
        "Monitor your API usage, token consumption, and request logs",
      icon: "bar_chart",
      breadcrumbs: [],
    };
  if (pathname.includes("/auth-files"))
    return {
      title: "Auth Files",
      description: "Map provider credentials stored in the local database",
      icon: "vpn_key",
      breadcrumbs: [],
    };
  if (pathname.includes("/quota"))
    return {
      title: "Quota Tracker",
      description: "Track and manage your API quota limits",
      icon: "data_usage",
      breadcrumbs: [],
    };
  if (pathname.includes("/mitm"))
    return {
      title: "MITM Proxy",
      description: "Intercept CLI tool traffic and route through 9Router",
      icon: "security",
      breadcrumbs: [],
    };
  if (pathname.includes("/cli-tools"))
    return {
      title: "CLI Tools",
      description: "Configure CLI tools",
      icon: "terminal",
      breadcrumbs: [],
    };
  if (pathname.includes("/proxy-pools"))
    return {
      title: "Proxy Pools",
      description: "Manage your proxy pool configurations",
      icon: "lan",
      breadcrumbs: [],
    };
  if (pathname.includes("/skills"))
    return {
      title: "Agent Skills",
      description: "Copy a link and paste to your AI to use 9Router — no install needed",
      icon: "extension",
      breadcrumbs: [],
    };
  if (pathname.includes("/endpoint"))
    return {
      title: "Endpoint",
      description: "API endpoint configuration",
      icon: "api",
      breadcrumbs: [],
    };
  if (pathname.includes("/profile"))
    return {
      title: "Settings",
      description: "Manage your preferences",
      icon: "settings",
      breadcrumbs: [],
    };
  if (pathname.includes("/translator"))
    return {
      title: "Translator",
      description: "Debug translation flow between formats",
      icon: "translate",
      breadcrumbs: [],
    };
  if (pathname.includes("/console-log"))
    return {
      title: "Console Log",
      description: "Live server console output",
      icon: "monitor",
      breadcrumbs: [],
    };
  if (pathname === "/dashboard")
    return {
      title: "Endpoint",
      description: "API endpoint configuration",
      icon: "api",
      breadcrumbs: [],
    };
  return { title: "", description: "", breadcrumbs: [] };
};

export default function Header({ onMenuClick, showMenuButton = true }) {
  const pathname = usePathname();
  const router = useRouter();

  // Memoize page info to prevent unnecessary recalculations
  const pageInfo = useMemo(() => getPageInfo(pathname), [pathname]);
  const { title, description, icon, breadcrumbs } = pageInfo;

  return (
    <header className="relative shrink-0 flex items-center justify-between gap-3 px-5 lg:px-7 py-4 border-b border-border-subtle/60 bg-vibrancy backdrop-blur-2xl z-20">
      {/* 细装饰渐变 */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/[0.08] to-transparent" />
      
      {/* Mobile menu button */}
      <div className="flex items-center gap-3 lg:hidden shrink-0">
        {showMenuButton && (
          <button
            onClick={onMenuClick}
            className="flex items-center justify-center size-8 rounded-xl text-text-muted hover:text-primary hover:bg-surface-2/60 transition-all"
          >
            <span className="material-symbols-outlined text-[19px]">menu</span>
          </button>
        )}
      </div>

      {/* Page title with breadcrumbs */}
      <div className="flex flex-col min-w-0 flex-1">
        {breadcrumbs.length > 0 ? (
          <div className="flex items-center gap-2">
            {breadcrumbs.map((crumb, index) => (
              <div
                key={`${crumb.label}-${crumb.href || "current"}`}
                className="flex items-center gap-2"
              >
                {index > 0 && (
                  <span className="material-symbols-outlined text-text-subtle text-[14px]">
                    chevron_right
                  </span>
                )}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="text-text-muted hover:text-primary transition-colors text-[13px]"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <div className="flex items-center gap-2">
                    {crumb.image && (
                      <ProviderIcon
                        src={crumb.image}
                        alt={crumb.label}
                        size={28}
                        className="object-contain rounded max-w-[28px] max-h-[28px]"
                        fallbackText={crumb.label.slice(0, 2).toUpperCase()}
                      />
                    )}
                    <h1 className="text-[13.5px] lg:text-[17px] font-semibold text-text-main tracking-tight truncate">
                      {translate(crumb.label)}
                    </h1>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : title ? (
          <div>
            <div className="flex items-center gap-2.5">
              {icon && (
                <span className="material-symbols-outlined text-primary text-[18px] lg:text-[20px] fill-1">
                  {icon}
                </span>
              )}
              <h1 className="text-[14px] lg:text-[17px] font-semibold tracking-tight truncate">
                {translate(title)}
              </h1>
            </div>
            {description && (
              <p className="hidden lg:block text-[12px] text-text-muted truncate mt-0.5">
                {translate(description)}
              </p>
            )}
          </div>
        ) : null}
      </div>

      {/* Right actions - 精致按钮组 */}
      <div className="flex items-center gap-1.5 shrink-0">
        <HeaderSearch />
        <ThemeToggle />
        <HeaderLanguage />
        <HeaderMenu />
      </div>
    </header>
  );
}

function HeaderSearch() {
  const visible = useHeaderSearchStore((s) => s.visible);
  const query = useHeaderSearchStore((s) => s.query);
  const placeholder = useHeaderSearchStore((s) => s.placeholder);
  const setQuery = useHeaderSearchStore((s) => s.setQuery);

  if (!visible) return null;

  return (
    <div className="relative w-[160px] sm:w-[220px]">
      <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-text-muted text-[16px] pointer-events-none">
        search
      </span>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full h-8 pl-7 pr-7 rounded-lg border border-border bg-surface/60 text-sm focus:outline-none focus:border-primary/50 transition-colors"
      />
      {query && (
        <button
          type="button"
          onClick={() => setQuery("")}
          className="absolute right-1 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main p-0.5 rounded"
          aria-label="Clear search"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
        </button>
      )}
    </div>
  );
}

Header.propTypes = {
  onMenuClick: PropTypes.func,
  showMenuButton: PropTypes.bool,
};
