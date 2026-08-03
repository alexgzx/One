"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, BookOpen, FileText, Wrench, Gem, Compass, Radar, GripVertical } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import Draggable from "react-draggable";

// 卡片配置
const vibeCards = [
  {
    id: "ai-agent-learn",
    title: "AI Agent学习平台",
    url: "https://www.datawhale.cn/learn",
    icon: Sparkles,
    bgColor: "bg-blue-50 dark:bg-blue-500/15",
    iconColor: "text-blue-500 dark:text-blue-400",
  },
  {
    id: "vibe-tutorial",
    title: "Vibe coding教程",
    url: "https://www.vibevibe.cn/zh/",
    icon: BookOpen,
    bgColor: "bg-violet-50 dark:bg-violet-500/15",
    iconColor: "text-violet-500 dark:text-violet-400",
  },
  {
    id: "vibe-terms",
    title: "Vibe coding专业术语",
    url: "https://vibe-hub.org/",
    icon: FileText,
    bgColor: "bg-amber-50 dark:bg-amber-500/15",
    iconColor: "text-amber-500 dark:text-amber-400",
  },
  {
    id: "workbuddy-guide",
    title: "WorkBuddy指南",
    url: "https://workbuddy.homes/",
    icon: Wrench,
    bgColor: "bg-slate-50 dark:bg-slate-500/15",
    iconColor: "text-slate-600 dark:text-slate-400",
  },
  {
    id: "skillhub",
    title: "Skills宝藏仓库",
    url: "https://skillhub.cn/",
    icon: Gem,
    bgColor: "bg-emerald-50 dark:bg-emerald-500/15",
    iconColor: "text-emerald-500 dark:text-emerald-400",
  },
  {
    id: "ai-nav",
    title: "AI导航库",
    url: "https://ai.codefather.cn/",
    icon: Compass,
    bgColor: "bg-sky-50 dark:bg-sky-500/15",
    iconColor: "text-sky-500 dark:text-sky-400",
  },
  {
    id: "vibe-radar",
    title: "Vibe Coding雷达",
    url: "https://radar.lyihub.com/?track=fun#top",
    icon: Radar,
    bgColor: "bg-rose-50 dark:bg-rose-500/15",
    iconColor: "text-rose-500 dark:text-rose-400",
  },
];

function VibeCard({ title, url, icon: Icon, bgColor, iconColor, onClick }) {
  return (
    <div
      className={cn(
        "group relative flex flex-col items-center justify-center p-8 rounded-2xl min-h-[180px] w-full",
        "bg-gradient-to-br from-white via-white to-zinc-50",
        "dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-800/50",
        "border border-zinc-200/80 dark:border-zinc-700/50",
        "shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06),0_0_0_1px_rgba(255,255,255,0.05)]",
        "hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05),0_0_0_1px_rgba(255,255,255,0.1)]",
        "dark:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3),0_2px_4px_-1px_rgba(0,0,0,0.2),0_0_0_1px_rgba(255,255,255,0.02)]",
        "dark:hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.4),0_4px_6px_-2px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.05)]",
        "hover:border-zinc-300 dark:hover:border-zinc-600",
        "transition-all duration-300 ease-out cursor-pointer",
        "hover:-translate-y-1 hover:scale-[1.02]",
        "backdrop-blur-sm"
      )}
      onClick={onClick}
    >
      {/* 拖拽手柄 */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-30 transition-opacity duration-200 cursor-move">
        <GripVertical size={16} className="text-zinc-400 dark:text-zinc-500" />
      </div>

      {/* 图标 */}
      <div
        className={cn(
          "flex items-center justify-center w-16 h-16 rounded-2xl mb-5",
          bgColor,
          iconColor,
          "shadow-inner",
          "transition-all duration-300",
          "group-hover:scale-105 group-hover:shadow-md"
        )}
      >
        <Icon size={30} strokeWidth={1.5} />
      </div>

      {/* 标题 */}
      <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100 text-center">
        {title}
      </h3>

      {/* 悬停提示 */}
      <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        点击进入 →
      </p>
    </div>
  );
}

export default function VibeCodingPage() {
  const router = useRouter();
  const containerRef = useRef(null);
  const [positions, setPositions] = useState(() => {
    // 从 localStorage 恢复位置
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("vibe-card-positions");
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });

  // 保存位置到 localStorage
  useEffect(() => {
    localStorage.setItem("vibe-card-positions", JSON.stringify(positions));
  }, [positions]);

  const handleCardClick = (url, title) => {
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    router.push(`/dashboard/vibe-coding/viewer?url=${encodedUrl}&title=${encodedTitle}`);
  };

  const handleDragStop = (id, e, data) => {
    setPositions((prev) => ({
      ...prev,
      [id]: { x: data.x, y: data.y },
    }));
  };

  return (
    <div className="min-h-screen p-8" ref={containerRef}>
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-3">
          <Sparkles size={28} className="text-brand-500" strokeWidth={1.5} />
          Vibe coding
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          探索 AI 编程学习资源与教程 · 拖拽卡片可自由移动
        </p>
      </div>

      {/* 卡片网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl relative">
        {vibeCards.map((card) => {
          const position = positions[card.id] || { x: 0, y: 0 };
          return (
            <Draggable
              key={card.id}
              defaultPosition={position}
              position={position}
              onStop={(e, data) => handleDragStop(card.id, e, data)}
              bounds="parent"
              handle=".cursor-move"
            >
              <div className="relative">
                <VibeCard
                  title={card.title}
                  url={card.url}
                  icon={card.icon}
                  bgColor={card.bgColor}
                  iconColor={card.iconColor}
                  onClick={() => handleCardClick(card.url, card.title)}
                />
              </div>
            </Draggable>
          );
        })}
      </div>
    </div>
  );
}