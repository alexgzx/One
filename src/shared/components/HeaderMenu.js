"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "@/shared/hooks/useTheme";
import { ConfirmModal } from "./Modal";

export default function HeaderMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [shutdownOpen, setShutdownOpen] = useState(false);
  const [isShuttingDown, setIsShuttingDown] = useState(false);
  const { toggleTheme, isDark } = useTheme();
  const menuRef = useRef(null);

  const handleShutdown = async () => {
    setIsShuttingDown(true);
    try {
      await fetch("/api/version/shutdown", { method: "POST" });
    } catch (e) {
      // Expected to fail as server shuts down; ignore error
    }
    setIsShuttingDown(false);
    setShutdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const close = () => setIsOpen(false);

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsOpen((v) => !v)}
          className="flex items-center justify-center p-2 rounded-lg text-text-muted hover:text-text-main hover:bg-black/5 dark:hover:bg-white/5 transition-all"
          title="菜单"
        >
          <span className="material-symbols-outlined">grid_view</span>
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-60 bg-surface border border-black/10 dark:border-white/10 rounded-xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 overflow-hidden py-1">
            <MenuItem
              icon={isDark ? "light_mode" : "dark_mode"}
              label="主题"
              onClick={() => { toggleTheme(); close(); }}
            />
            <MenuItem
              icon="power_settings_new"
              label="关闭"
              danger
              onClick={() => { close(); setShutdownOpen(true); }}
            />
          </div>
        )}
      </div>
      <ConfirmModal
        isOpen={shutdownOpen}
        onClose={() => setShutdownOpen(false)}
        onConfirm={handleShutdown}
        title="关闭代理"
        message="确定要关闭代理服务器吗？"
        confirmText="关闭"
        cancelText="取消"
        variant="danger"
        loading={isShuttingDown}
      />
    </>
  );
}

function MenuItem({ icon, label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-colors ${
        danger
          ? "text-red-500 hover:bg-red-500/10"
          : "text-text-main hover:bg-black/5 dark:hover:bg-white/5"
      }`}
    >
      <span className={`material-symbols-outlined text-[20px] ${danger ? "" : "text-text-muted"}`}>
        {icon}
      </span>
      <span className="flex-1 text-left">{label}</span>
    </button>
  );
}
