"use client";

import { cn } from "@/shared/utils/cn";

export default function Card({
  children,
  title,
  subtitle,
  icon,
  action,
  padding = "md",
  hover = false,
  elev = false,
  className,
  ...props
}) {
  const paddings = {
    none: "",
    xs: "p-3",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <div
      className={cn(
        "relative bg-surface border border-border-subtle overflow-hidden",
        elev
          ? "rounded-2xl shadow-[var(--shadow-elev)]"
          : "rounded-2xl shadow-[var(--shadow-card)]",
        hover && "card-hover cursor-pointer",
        paddings[padding],
        className
      )}
      {...props}
    >
      {/* 卡片顶部高光线条 - 高级质感 */}
      <div className="pointer-events-none absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/40 dark:via-white/8 to-transparent" />
      {(title || action) && (
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-border-subtle/60">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="relative flex items-center justify-center size-9 rounded-xl bg-gradient-to-br from-brand-50 to-brand-100/60 dark:from-brand-500/15 dark:to-brand-500/5 text-primary border border-brand-200/40 dark:border-brand-500/20">
                <span className="material-symbols-outlined text-[18px] fill-1">{icon}</span>
              </div>
            )}
            <div>
              {title && (
                <h3 className="text-text-main font-semibold tracking-tight text-[15px] leading-tight">{title}</h3>
              )}
              {subtitle && (
                <p className="text-[12.5px] text-text-muted mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

Card.Section = function CardSection({ children, className, ...props }) {
  return (
    <div
      className={cn(
        "p-4 rounded-[10px]",
        "bg-bg border border-border-subtle",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

Card.Row = function CardRow({ children, className, ...props }) {
  return (
    <div
      className={cn(
        "p-3 -mx-3 px-3 transition-colors",
        "border-b border-border-subtle last:border-b-0",
        "hover:bg-surface-2/50",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

Card.ListItem = function CardListItem({
  children,
  actions,
  className,
  ...props
}) {
  return (
    <div
      className={cn(
        "group flex items-center justify-between p-3 -mx-3 px-3",
        "border-b border-border-subtle last:border-b-0",
        "hover:bg-surface-2/50 transition-colors",
        className
      )}
      {...props}
    >
      <div className="flex-1 min-w-0">{children}</div>
      {actions && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {actions}
        </div>
      )}
    </div>
  );
};
