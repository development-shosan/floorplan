"use client";

import React, { useEffect, useState } from "react";
import { ArrowPathIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

interface LoadingViewProps {
  jobId: string;
  setShowLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const LoadingView: React.FC<LoadingViewProps> = ({ jobId, setShowLoading }) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"processing" | "completed" | "failed">(
    "processing"
  );
  const [estimatedTime, setEstimatedTime] = useState("約1分");

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        // const data = await getMadoriStatus(jobId);
        // setProgress(data.progress || 0);
        // setStatus(data.status);
        // setEstimatedTime(data.estimatedTime || "不明");

        const simulatedProgress = Math.floor(Math.random() * 10) + 5;

        setProgress((prev) => {
          if (prev >= 100) return 100;

          let next = prev + simulatedProgress;
          if (next > 100) next = 100;

          const remaining = 100 - next;
          setEstimatedTime(
            remaining > 0 ? `約${Math.ceil(remaining / 2)}秒` : "完了"
          );

          if (next >= 100) {
            setStatus("completed");
          }

          return next;
        });
      } catch (error) {
        console.error("進行状況取得エラー:", error);
        setStatus("failed");
      }
    };

    const interval = setInterval(() => {
      fetchProgress();
    }, 500);

    fetchProgress();

    return () => clearInterval(interval);
  }, [jobId]);

  useEffect(() => {
    if (status === "completed") {
      const timer = setTimeout(() => {
        alert("間取り生成が完了しました！");
        setShowLoading(false);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (status === "failed") {
      const timer = setTimeout(() => {
        alert("間取り生成に失敗しました...");
        setShowLoading(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [status, setShowLoading]);

  return (
    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg shadow-sm">
      <ArrowPathIcon className="w-14 h-14 text-gray-400 animate-spin mb-6" />

      <h2 className="text-2xl font-semibold text-gray-800 mb-2">
        間取り生成中...
      </h2>
      <p className="text-gray-500 mb-8 text-center">
        あなたのご要望に合わせて複数パターンを作成しています
      </p>

      <div className="w-2/3 bg-gray-200 h-2 rounded-full mb-4 overflow-hidden">
        <div
          className="bg-gray-700 h-2 transition-all duration-500 ease-in-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="text-sm text-gray-500 mb-6">
        予想時間: {estimatedTime} ({progress}%)
      </p>

      <div className="text-gray-600 space-y-2 text-sm">
        <StepItem text="構造・法規制チェック" done={progress >= 30} />
        <StepItem text="最適レイアウト計算" done={progress >= 60} />
        <StepItem text="複数パターン生成" done={progress >= 90} />
      </div>
    </div>
  );
};

const StepItem = ({ text, done }: { text: string; done: boolean }) => (
  <div className="flex items-center gap-2">
    {done ? (
      <CheckCircleIcon className="w-4 h-4 text-blue-500" />
    ) : (
      <ArrowPathIcon className="w-4 h-4 text-gray-400 animate-spin-slow" />
    )}
    <span>{text}</span>
  </div>
);

export default LoadingView;
