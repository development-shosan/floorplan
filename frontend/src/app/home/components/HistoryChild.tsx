"use client";

import React, { useEffect, useState } from "react";
import { History, HistoryChildren } from "@/constants/history";
import { ArrowLeftIcon, HomeIcon } from "@heroicons/react/16/solid";
import { StarIcon as StarOutline } from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import { TrashIcon } from "@heroicons/react/24/solid";
import { LoginResponse, useUser } from "@/hooks/userContext";
import { UserRole } from "@/constants/roles";
import {
  deletePlan,
  getHistoryChildren,
  regeneratePlan,
  togglePlanFavorite,
} from "@/lib/api";
import LoadingView from "./LoadingView";
import FloorPlanViewer from "./FloorPlanViewer";
import HistoryDetail from "./HistoryDetail";

interface HistoryChildProps {
  history: History;
  setActiveTab: (tab: string) => void;
}

const HistoryChild: React.FC<HistoryChildProps> = ({
  history,
  setActiveTab,
}) => {
  const { user } = useUser();

  const [selectedHistory, setSelectedHistory] = useState<History | null>(
    history
  );
  const [historyChildren, setHistoryChildren] = useState<HistoryChildren[]>([]);
  const [selectedChild, setSelectedChild] = useState<HistoryChildren | null>(
    null
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [loadingJobId, setLoadingJobId] = useState<string | null>(null);
  const [complete, setComplete] = useState<boolean>(false);

  const fetchHistoryChildren = React.useCallback(async () => {
    try {
      if (!user) return;

      setLoading(true);
      // 対応履歴詳細API
      const response = await getHistoryChildren(user.id, history);
      const data: HistoryChildren[] = response.historyChildren;
      setHistoryChildren(data);
    } catch (error) {
      console.error(error);
      alert("対応履歴詳細の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, [user, history]);

  useEffect(() => {
    fetchHistoryChildren();
  }, [fetchHistoryChildren]);

  useEffect(() => {
    if (complete) {
      fetchHistoryChildren();
      setComplete(false);
    }
  }, [complete, fetchHistoryChildren]);

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedChild(null);
  };

  const handleGoToDetail = (child: HistoryChildren) => {
    setSelectedChild(child);
    setIsDetailOpen(true);
  };

  // 間取り生成に画面遷移
  const handleCreateNew = () => {
    setActiveTab("間取り生成");
  };

  // 間取り再生成
  const handleRegenerate = async (history: History) => {
    try {
      setShowLoading(true);
      // 間取り再生成API
      const response = await regeneratePlan(history);
      const jobId = response.jobId;

      if (jobId) {
        setLoadingJobId(jobId);
      } else {
        setShowLoading(false);
      }
    } catch (error) {
      console.error(error);
      alert("間取り再生成に失敗しました");
      setShowLoading(false);
    }
  };

  if (isDetailOpen && selectedHistory && selectedChild) {
    return (
      <HistoryDetail
        history={history}
        child={selectedChild}
        onBack={handleCloseDetail}
      />
    );
  }

  return (
    <div className={`bg-gray-50 ${showLoading ? "h-[80vh]" : "min-h-screen"}`}>
      {loading ? (
        <p>{"ロード中..."}</p>
      ) : showLoading && loadingJobId ? (
        <div className="max-w-6xl mx-auto px-8 py-8">
          <LoadingView
            jobId={loadingJobId}
            setShowLoading={setShowLoading}
            setComplete={setComplete}
            setSelectedHistory={setSelectedHistory}
          />
        </div>
      ) : (
        <div className="p-6 w-[calc(100vw-25vw)] bg-white rounded-lg shadow-md mx-auto">
          <button
            onClick={() => {
              setActiveTab("対応履歴");
            }}
            className="flex items-center text-gray mb-4 hover:underline"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            対応履歴一覧に戻る
          </button>
          <div className="flex items-center justify-between mb-8">
            <h1 className="flex items-center text-4xl">
              <div className="bg-gray-800 p-2 rounded-lg mr-2">
                <HomeIcon className="w-8 h-8 text-white" />
              </div>
              {`${history.customerName}様邸間取りプラン`}
            </h1>
            <span className="text-gray-500 text-sm border border-gray-300 px-3 py-1 rounded-full leading-tight inline-block text-left">
              {`営業担当：${history.userName}`}
              {user?.role !== UserRole.SYSTEM_ADMIN && (
                <>
                  <br />
                  {`顧客名：${history.customerName}`}
                </>
              )}
            </span>
          </div>

          <div className="border border-gray-200 rounded-lg p-6 mb-8 bg-white shadow-sm">
            <h1 className="text-xl mb-2">生成結果 - 3つのパターンをご提案</h1>
            <p className="text-gray-600">
              お客様のご要望に基づき3つの間取りパターンを作成いたしました。お気に入りのパターンをお選びください。
            </p>
          </div>

          {user?.role === UserRole.MEMBER && (
            <div className="flex justify-center items-center gap-4 p-6 mb-8 bg-white">
              <button
                onClick={handleCreateNew}
                className="flex items-center justify-center bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors text-lg"
              >
                + 新規生成
              </button>
              <button
                onClick={() => {
                  handleRegenerate(history);
                }}
                className="flex items-center justify-center bg-gray-100 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors text-lg"
              >
                再生成
              </button>
            </div>
          )}

          <div className="space-y-6">
            {historyChildren.map((child) => (
              <ChildCard
                key={child.id}
                child={child}
                user={user}
                onDetailClick={handleGoToDetail}
                setHistoryChildren={setHistoryChildren}
                historyChildren={historyChildren}
                fetchHistoryChildren={fetchHistoryChildren}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const ChildCard: React.FC<{
  child: HistoryChildren;
  user: LoginResponse | null;
  onDetailClick: (child: HistoryChildren) => void;
  setHistoryChildren: React.Dispatch<React.SetStateAction<HistoryChildren[]>>;
  historyChildren: HistoryChildren[];
  fetchHistoryChildren: () => Promise<void>;
}> = ({ child, user, onDetailClick, setHistoryChildren, historyChildren, fetchHistoryChildren }) => {
  // プランお気に入り登録/解除API
  const handleFavoriteToggle = async (child: HistoryChildren) => {
    try {
      await togglePlanFavorite(child);
      await fetchHistoryChildren(); // Re-fetch data after update
    } catch (error) {
      console.error(error);

      let message: string = "不明なエラーが発生しました";

      if (error instanceof Error) {
        message = error.message.includes("(404)")
          ? "指定されたplanIdが見つかりません"
          : error.message;
      }

      alert(message);
    }
  };

  // プラン削除API
  const handleDelete = async (child: HistoryChildren) => {
    const confirmDelete = window.confirm(
      "このプランを削除してもよろしいですか？"
    );
    if (!confirmDelete) return;

    try {
      await deletePlan(child);
      setHistoryChildren(historyChildren.filter((c) => c.id !== child.id));
    } catch (error) {
      console.error(error);

      let message: string = "不明なエラーが発生しました";

      if (error instanceof Error) {
        message = error.message.includes("(404)")
          ? "指定されたplanIdが見つかりません"
          : error.message;
      }

      alert(message);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
      <h2 className="text-xl font-semibold mb-4">{child.floorplanData.type}</h2>
      <div className="relative mb-6 p-2 bg-gray-100 rounded-lg overflow-hidden shadow-inner pointer-events-none">
        {child.floorplanData ? (
          <FloorPlanViewer originalData={child.floorplanData} />
        ) : (
          <div className="flex items-center justify-center h-48 text-gray-500 text-sm">
            間取り図データがありません
          </div>
        )}
      </div>

      <div className="flex flex-col gap-y-2 text-sm">
        {/* 1階面積 */}
        <div className="flex justify-between">
          <div className="text-gray-500">1階面積:</div>
          <div className="text-right font-medium">
            {`${child.floorplanData.first_floor_area ?? null} m\u00b2`}
          </div>
        </div>
        {/* 2階面積 */}
        <div className="flex justify-between">
          <div className="text-gray-500">2階面積:</div>
          <div className="text-right font-medium">
            {`${child.floorplanData.second_floor_area ?? null} m\u00b2`}
          </div>
        </div>
        {/* 延床面積 */}
        <div className="flex justify-between">
          <div className="text-gray-500">延床面積:</div>
          <div className="text-right font-medium">
            {`${child.floorplanData.total_floor_area ?? null} m\u00b2`}
          </div>
        </div>
      </div>

      {/** タグ */}
      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
        {child.floorplanData.tag
          ? child.floorplanData.tag.map((tag, i) => (
              <span
                key={i}
                className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs font-medium"
              >
                {tag}
              </span>
            ))
          : null}
      </div>
      <div className="flex items-center mt-6">
        <button
          onClick={() => handleFavoriteToggle(child)}
          className={`p-3 border border-gray-300 rounded-lg transition-colors${
            user?.role === UserRole.MEMBER
              ? "border-gray-300 hover:bg-red-50 cursor-pointer"
              : "border-gray-200 bg-gray-100 text-gray-400"
          }`}
          disabled={user?.role !== UserRole.MEMBER}
        >
          {child.isPatternFavorite ? (
            <StarSolid className="w-6 h-6 text-yellow-500" />
          ) : (
            <StarOutline
              className={`w-6 h-6 ${
                user?.role === UserRole.MEMBER
                  ? "text-gray-600 hover:text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          )}
        </button>

        <button
          onClick={() => onDetailClick(child)}
          className="flex-1 flex items-center justify-center bg-black text-white px-4 py-3 mx-2 rounded-lg hover:bg-gray-800 transition-colors text-base"
        >
          <span className="mr-2 text-xl font-light">ⓘ</span>詳細表示
        </button>

        <button
          onClick={() => {
            handleDelete(child);
          }}
          disabled={user?.role !== UserRole.MEMBER}
          className={`p-3 border border-gray-300 rounded-lg transition-colors ml-20 ${
            user?.role === UserRole.MEMBER
              ? "hover:bg-red-50 cursor-pointer"
              : "bg-gray-100 text-gray-400"
          }`}
        >
          <TrashIcon
            className={`w-6 h-6 ${
              user?.role === UserRole.MEMBER ? "text-gray-600" : "text-gray-300"
            }`}
          />
        </button>
      </div>
    </div>
  );
};

export default HistoryChild;
