"use client";

import React from "react";
import {
  createDummyPlanDetails,
  History,
  PlanDetail,
} from "@/constants/history";
import { HomeIcon } from "@heroicons/react/16/solid";
import { StarIcon as StarOutline } from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";

interface HistoryChildProps {
  history: History;
  onBack: () => void;
  onDetailClick: (plan: PlanDetail) => void;
}

const HistoryChild: React.FC<HistoryChildProps> = ({
  history,
  onBack,
  onDetailClick,
}) => {
  const dummyPlanDetails = createDummyPlanDetails(history);
  return (
    <div className="p-6 w-[calc(100vw-25vw)] bg-white rounded-lg shadow-md mx-auto">
      <button onClick={onBack} className="text-gray-500 mb-4 hover:underline">
        {"← 対応履歴一覧に戻る"}
      </button>
      <div className="flex items-center justify-between mb-8">
        <h1 className="flex items-center text-4xl">
          <div className="bg-gray-800 p-2 rounded-lg mr-2">
            <HomeIcon className="w-8 h-8 text-white" />
          </div>
          {`${history.customerName}様邸間取りプラン`}
        </h1>
        <span className="text-gray-500 text-sm border border-gray-300 px-3 py-1 rounded-full">
          {`営業担当：${history.userName}`}
        </span>
      </div>

      <div className="border border-gray-200 rounded-lg p-6 mb-8 bg-white shadow-sm">
        <h1 className="text-xl font-bold mb-2">{history.title}</h1>
        <p className="text-gray-600">
          お客様のご要望に基づき3つの間取りパターンを作成いたしました。お気に入りのパターンをお選びください。
        </p>
      </div>

      <div className="space-y-6">
        {dummyPlanDetails.map((plan, index) => (
          <PlanCard key={index} plan={plan} onDetailClick={onDetailClick} />
        ))}
      </div>
    </div>
  );
};

const PlanCard: React.FC<{
  plan: PlanDetail;
  onDetailClick: (plan: PlanDetail) => void;
}> = ({ plan, onDetailClick }) => {
  const [isFavorite, setIsFavorite] = React.useState(false);

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
      <h2 className="text-xl font-semibold mb-4">{plan.name}</h2>
      <div className="relative mb-4 p-6 bg-gray-100 rounded-lg h-32 flex items-center justify-center text-lg text-gray-700">
        <span className="absolute top-2 right-2 text-xs text-gray-500">
          2F寝室エリア
        </span>
        LDK {plan.ldkArea}
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <div className="text-gray-500">LDK:</div>
        <div className="text-right font-medium">{plan.ldkArea}</div>
        <div className="text-gray-500">主寝室:</div>
        <div className="text-right font-medium">{plan.mainRoom}</div>
        <div className="text-gray-500">子供部屋:</div>
        <div className="text-right font-medium">{plan.childRoom}</div>
        <div className="text-gray-500">延床面積:</div>
        <div className="text-right font-medium">{plan.landArea}</div>
      </div>
      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
        {plan.tag.map((tag, i) => (
          <span
            key={i}
            className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs font-medium"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="flex items-center mt-6">
        <button
          onClick={handleFavoriteToggle}
          className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors mr-3"
        >
          {isFavorite ? (
            <StarSolid className="w-6 h-6 text-yellow-500" />
          ) : (
            <StarOutline className="w-6 h-6 text-gray-600 hover:text-yellow-400" />
          )}
        </button>
        <button
          onClick={() => onDetailClick(plan)}
          className="flex items-center justify-center flex-1 bg-black text-white px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors text-base"
        >
          <span className="mr-2 text-xl font-light">ⓘ</span>詳細表示
        </button>
      </div>
    </div>
  );
};

export default HistoryChild;
