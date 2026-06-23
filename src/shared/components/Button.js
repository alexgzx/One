"use client";

import { cn } from "@/shared/utils/cn";

const variants = {
  primary: "bg-gradient-to-b from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-600 text-white shadow-[0_1px_2px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.15)] hover:shadow-[0_4px_12px_-2px_rgba(229,106,74,0.4),inset_0_1px_0_rgba(255,255,255,0.2)] disabled:bg-surface-3 disabled:text-text-muted disabled:bg-none",
  secondary: "bg-surface-2 hover:bg-surface-3 text-text-main border border-border-subtle hover:border-border disabled:opacity-50",
  outline: "border border-border text-text-main hover:bg-surface-2/60 hover:border-brand-500/40 hover:text-primary",
  ghost: "text-text-muted hover:bg-surface-2/60 hover:text-text-main",
  danger: "bg-gradient-to-b from-red-500 to-red-600 hover:from-red-400 hover:to-red-600 text-white shadow-sm disabled:bg-surface-3 disabled:text-text-muted disabled:bg-none",
  success: "bg-gradient-to-b from-green-500 to-green-700 hover:from-green-400 hover:to-green-700 text-white shadow-sm disabled:bg-surface-3 disabled:text-text-muted disabled:bg-none",
};

const sizes = {
  sm: "h-7 px-3 text-xs rounded-lg",
  md: "h-9 px-4 text-[13px] rounded-xl",
  lg: "h-11 px-6 text-sm rounded-xl",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  icon,
  iconRight,
  disabled = false,
  loading = false,
  fullWidth = false,
  className,
  ...props
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150 ease-out cursor-pointer",
        "active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
      ) : icon ? (
        <span className="material-symbols-outlined text-[18px]">{icon}</span>
      ) : null}
      {children}
      {iconRight && !loading && (
        <span className="material-symbols-outlined text-[18px]">{iconRight}</span>
      )}
    </button>
  );
}
