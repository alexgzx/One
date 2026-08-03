"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/shared/utils/cn";

function VibeCodingViewerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const iframeRef = useRef(null);
  const [isElectron, setIsElectron] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const url = searchParams.get("url");
  const title = searchParams.get("title") || "Vibe coding";

  useEffect(() => {
    const electronAPI = window.electronAPI;
    if (electronAPI) {
      setIsElectron(true);
      electronAPI.openBrowserView(url);
      setIsLoading(false);
    }
  }, [url]);

  const handleBack = async () => {
    if (isElectron && window.electronAPI) {
      await window.electronAPI.closeBrowserView();
    }
    router.push("/dashboard/vibe-coding");
  };

  if (isLoading && !isElectron) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-zinc-500 dark:text-zinc-400">加载中...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* 顶部返回按钮 */}
      <div className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <button
          onClick={handleBack}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg",
            "text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100",
            "hover:bg-zinc-100 dark:hover:bg-zinc-800",
            "transition-colors duration-150"
          )}
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          <span className="text-sm font-medium">返回 {title}</span>
        </button>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 relative">
        {isElectron ? (
          <div className="flex items-center justify-center h-full text-zinc-400 dark:text-zinc-500">
            <p>网页已在独立进程中打开</p>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            src={url}
            className="w-full h-full border-0"
            title={title}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
            allow="accelerometer; camera; encrypted-media; geolocation; gyroscope; microphone"
          />
        )}
      </div>
    </div>
  );
}

export default function VibeCodingViewerPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-zinc-500 dark:text-zinc-400">加载中...</div>
      </div>
    }>
      <VibeCodingViewerContent />
    </Suspense>
  );
}