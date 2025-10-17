"use client";

import React, { useEffect, useState } from "react";
import { History, HistoryChildren } from "@/constants/history";
import { ArrowLeftIcon, HomeIcon } from "@heroicons/react/16/solid";
import { StarIcon as StarOutline } from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import FloorPlanViewer from "./FloorPlanViewer";
import { TrashIcon } from "@heroicons/react/24/solid";
import { LoginResponse, useUser } from "@/hooks/userContext";
import { UserRole } from "@/constants/roles";
import { getHistoryChildren } from "@/lib/api";

interface HistoryChildProps {
  history: History;
  onBack: () => void;
  onDetailClick: (child: HistoryChildren) => void;
}

const HistoryChild: React.FC<HistoryChildProps> = ({
  history,
  onBack,
  onDetailClick,
}) => {
  const { user } = useUser();

  const [historyChildren, setHistoryChildren] = useState<HistoryChildren[]>([]);
  const [loading, setLoading] = useState(true);

  // 対応履歴詳細API
  const fetchHistoryChildren = React.useCallback(async () => {
    try {
      if (!user) return;

      setLoading(true);
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

  return (
    <div>
      {loading ? (
        <p>{"ロード中..."}</p>
      ) : (
        <div className="p-6 w-[calc(100vw-25vw)] bg-white rounded-lg shadow-md mx-auto">
          <button
            onClick={onBack}
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
              <br />
              {`顧客名：${history.customerName}`}
            </span>
          </div>

          <div className="border border-gray-200 rounded-lg p-6 mb-8 bg-white shadow-sm">
            <h1 className="text-xl mb-2">生成結果 - 3つのパターンをご提案</h1>
            <p className="text-gray-600">
              お客様のご要望に基づき3つの間取りパターンを作成いたしました。お気に入りのパターンをお選びください。
            </p>
          </div>

          <div className="space-y-6">
            {historyChildren.map((child, index) => (
              <ChildCard
                key={index}
                child={child}
                user={user}
                onDetailClick={onDetailClick}
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
}> = ({ child, user, onDetailClick }) => {
  const [isFavorite, setIsFavorite] = React.useState(
    child.isPatternFavorite ?? false
  );

  useEffect(() => {
    setIsFavorite(child.isPatternFavorite ?? false);
  }, [child]);

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newState = !isFavorite;
    setIsFavorite(newState);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
      <h2 className="text-xl font-semibold mb-4">{child.patternName}</h2>
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
        {/* LDK */}
        <div className="flex justify-between">
          <div className="text-gray-500">LDK:</div>
          <div className="text-right font-medium">
            {child.attributes?.ldk ?? null}帖
          </div>
        </div>
        {/* 主寝室 */}
        <div className="flex justify-between">
          <div className="text-gray-500">主寝室:</div>
          <div className="text-right font-medium">
            {child.attributes?.masterBedroom ?? null}帖
          </div>
        </div>
        {/* 子供部屋 */}
        <div className="flex justify-between">
          <div className="text-gray-500">子供部屋:</div>
          <div className="text-right font-medium">
            {child.attributes?.childrensRoom ?? null}帖
          </div>
        </div>
        {/* 延床面積 */}
        <div className="flex justify-between">
          <div className="text-gray-500">延床面積:</div>
          <div className="text-right font-medium">
            {child.attributes?.totalFloorArea ?? null}坪
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
        {child.tag
          ? child.tag.split(",").map((tag, i) => (
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
          onClick={handleFavoriteToggle}
          className={`p-3 border border-gray-300 rounded-lg transition-colors${
            user?.role === UserRole.MEMBER
              ? "border-gray-300 hover:bg-red-50 cursor-pointer"
              : "border-gray-200 bg-gray-100 text-gray-400"
          }`}
          disabled={user?.role !== UserRole.MEMBER}
        >
          {isFavorite ? (
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
          onClick={() => {}}
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
