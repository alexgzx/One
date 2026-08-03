"use client";

import { useRouter } from "next/navigation";
import { Sparkles, BookOpen, FileText } from "lucide-react";
import { cn } from "@/shared/utils/cn";

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
];

function VibeCard({ title, url, icon: Icon, bgColor, iconColor, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex flex-col items-center justify-center p-8 rounded-2xl min-h-[180px]",
        "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800",
        "hover:border-zinc-300 dark:hover:border-zinc-700",
        "hover:shadow-lg hover:shadow-zinc-200/40 dark:hover:shadow-zinc-900/40",
        "transition-all duration-300 ease-out cursor-pointer",
        "hover:-translate-y-0.5"
      )}
    >
      {/* 图标 */}
      <div
        className={cn(
          "flex items-center justify-center w-16 h-16 rounded-2xl mb-5",
          bgColor,
          iconColor,
          "transition-colors duration-300"
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
    </button>
  );
}

export default function VibeCodingPage() {
  const router = useRouter();

  const handleCardClick = (url, title) => {
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    router.push(`/dashboard/vibe-coding/viewer?url=${encodedUrl}&title=${encodedTitle}`);
  };

  return (
    <div className="min-h-screen p-8">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-3">
          <Sparkles size={28} className="text-brand-500" strokeWidth={1.5} />
          Vibe coding
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          探索 AI 编程学习资源与教程
        </p>
      </div>

      {/* 卡片网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl">
        {vibeCards.map((card) => (
          <VibeCard
            key={card.id}
            title={card.title}
            url={card.url}
            icon={card.icon}
            color={card.color}
            onClick={() => handleCardClick(card.url, card.title)}
          />
        ))}
      </div>
    </div>
  );
}