"use client";

import React from "react";
import { ArrowLeftIcon } from "@heroicons/react/20/solid";
import { History, HistoryChildren } from "@/constants/history";

interface HistoryDetailProps {
  history: History;
  child: HistoryChildren;
  onBack: () => void;
  onPreviewClick: (child: HistoryChildren) => void;
}

const HistoryDetail: React.FC<HistoryDetailProps> = ({
  history,
  child,
  onBack,
  onPreviewClick,
}) => {
  const headerTitle = `対応ID: #${history.id.toString().padStart(6, "0")} - ${
    history.customerName
  }様`;

  const conditions = history.conditions;

  return (
    <div className=" bg-white rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{headerTitle}</h1>
        <div className="flex gap-2">
          <button
            onClick={onBack}
            className="flex items-center text-sm text-black border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-100"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            生成一覧へ戻る
          </button>
          <button
            className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
            onClick={() => onPreviewClick(child)}
          >
            プレビュー
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[4fr_6fr] gap-10">
        <div className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-300">
          <h2 className="text-xl font-semibold pb-2 mb-4">入力内容確認</h2>

          <DetailRow
            label="ご家族構成:"
            value={`${conditions.family_composition.value} 人`}
          />

          <DetailRow
            label="建物面積:"
            value={`${conditions.frontage.value}m × ${conditions.depth.value}m`}
          />

          <DetailRow
            label="階数:"
            value={`${conditions.number_of_floors.value} 階`}
          />

          <DetailRow
            label="LDK希望面積:"
            value={`${conditions.desired_LDK_area.value} 畳`}
          />

          <DetailRow
            label="居室数:"
            value={`${conditions.number_of_rooms.value} 室`}
          />

          <DetailRow
            label="トイレ:"
            value={`${conditions.number_of_toilets.value} 箇所`}
          />

          <DetailRow label="プロジェクトタイトル:" value={history.title} />

          <div className="pt-4">
            <p className="text-gray-500 text-sm mb-1">動線のこだわり:</p>
            <p className="font-medium">
              {conditions.commitment_flow_lines.value}
            </p>
          </div>
        </div>

        <div className="p-6 rounded-lg border border-gray-300 bg-white">
          <h2 className="text-xl font-semibold mb-4">生成された間取り図</h2>
          <div className="w-full h-[calc(100vh-38vh)] bg-gray-300 flex items-center justify-center text-xl text-gray-600 rounded-lg">
            間取り図プレビュー <br />
            {"作成中"}
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailRow: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-200">
    <span className="text-gray-500 text-sm">{label}</span>
    <span className="font-medium text-right">{value}</span>
  </div>
);

export default HistoryDetail;
