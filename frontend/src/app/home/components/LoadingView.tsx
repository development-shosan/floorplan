"use client";

import React, { useEffect, useState } from "react";
import { ArrowPathIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { getHistoryList, getMadoriStatus, getMadroriResult } from "@/lib/api";
import { useUser } from "@/hooks/userContext";
import { History, HistoryChildren } from "@/constants/history";

interface LoadingViewProps {
  jobId: string;
  setShowLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setComplete: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedHistory: React.Dispatch<React.SetStateAction<History | null>>;
}

const LoadingView: React.FC<LoadingViewProps> = ({
  jobId,
  setShowLoading,
  setComplete,
  setSelectedHistory,
}) => {
  const { user } = useUser();

  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"processing" | "completed" | "failed">(
    "processing"
  );
  const [estimatedTime, setEstimatedTime] = useState("不明");

  useEffect(() => {
    if (!user) return;

    const fetchProgress = async () => {
      try {
        // 間取り生成ステータス確認API
        const data = await getMadoriStatus(jobId);
        setProgress(data.progress);
        setStatus(data.status);
        setEstimatedTime(data.estimatedTime || "不明");

        if (data.status === "completed" || data.status === "failed") {
          clearInterval(interval);
        }
      } catch (error) {
        console.error("間取り結果取得エラー:", error);
        setStatus("failed");
        clearInterval(interval);
      }
    };

    const interval = setInterval(fetchProgress, 3000);
    fetchProgress();

    return () => clearInterval(interval);
  }, [jobId, user]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    if (status === "completed" && user) {
      const fetchData = async () => {
        setComplete(false);
        try {
          const madoriResponse = await getMadroriResult(jobId);
          const madoriData: HistoryChildren[] = madoriResponse.historyChildren;

          const response = await getHistoryList(user.id);
          const data: History[] = response.histories;

          const parentId = madoriData[0]?.historyParentId;

          if (parentId) {
            const matchedHistory = data.find(
              (history) => history.id === parentId
            );
            if (matchedHistory) setSelectedHistory(matchedHistory);
          }
        } catch (error) {
          alert("間取り再生成に失敗しました");
          console.error("間取り結果取得エラー:", error);
          setStatus("failed");
        } finally {
          timer = setTimeout(() => {
            setComplete(true);
            setShowLoading(false);
          }, 1000);
        }
      };

      fetchData();
    } else if (status === "failed") {
      alert("間取り再生成に失敗しました");
      timer = setTimeout(() => {
        setComplete(false);
        setShowLoading(false);
      }, 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [status, user, jobId, setShowLoading, setComplete, setSelectedHistory]);

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
