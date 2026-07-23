"use client";

import { cn } from "@/shared/utils/cn";
import { useState } from "react";

const variants = {
  primary: "relative overflow-hidden bg-gradient-to-r from-brand-500 via-brand-400 to-brand-500 bg-[length:200%_100%] hover:bg-[position:100%_0] text-white shadow-[0_2px_8px_-2px_rgba(229,106,74,0.3),inset_0_1px_0_rgba(255,255,255,0.15)] hover:shadow-[0_6px_20px_-4px_rgba(229,106,74,0.4),inset_0_1px_0_rgba(255,255,255,0.2)] disabled:bg-surface-3 disabled:text-text-muted disabled:bg-none disabled:shadow-none",
  secondary: "bg-surface-2 hover:bg-surface-3 text-text-main border border-border-subtle hover:border-border disabled:opacity-50",
  outline: "border border-border text-text-main hover:bg-surface-2/60 hover:border-brand-500/40 hover:text-primary",
  ghost: "text-text-muted hover:bg-surface-2/60 hover:text-text-main",
  danger: "relative overflow-hidden bg-gradient-to-r from-red-500 via-red-400 to-red-500 bg-[length:200%_100%] hover:bg-[position:100%_0] text-white shadow-sm disabled:bg-surface-3 disabled:text-text-muted disabled:bg-none",
  success: "relative overflow-hidden bg-gradient-to-r from-green-500 via-green-400 to-green-500 bg-[length:200%_100%] hover:bg-[position:100%_0] text-white shadow-sm disabled:bg-surface-3 disabled:text-text-muted disabled:bg-none",
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
  const [ripples, setRipples] = useState([]);

  const createRipple = (e) => {
    if (disabled || loading) return;
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    
    setRipples(prev => [...prev, { id, x, y }]);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 600);
  };

  return (
    <button
      className={cn(
        "relative inline-flex items-center justify-center gap-2 font-semibold transition-all duration-300 ease-out cursor-pointer",
        "active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className
      )}
      disabled={disabled || loading}
      onClick={createRipple}
      {...props}
    >
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-white/30 pointer-events-none animate-ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 10,
            height: 10,
            marginLeft: -5,
            marginTop: -5,
          }}
        />
      ))}
      
      {loading ? (
        <span className="relative z-10 material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
      ) : icon ? (
        <span className="relative z-10 material-symbols-outlined text-[18px] transition-transform duration-200 hover:scale-110">{icon}</span>
      ) : null}
      <span className="relative z-10">{children}</span>
      {iconRight && !loading && (
        <span className="relative z-10 material-symbols-outlined text-[18px] transition-transform duration-200 hover:scale-110">{iconRight}</span>
      )}
    </button>
  );
}
