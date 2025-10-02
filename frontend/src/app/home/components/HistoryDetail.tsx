"use client";

import React from "react";
import { History } from "@/constants/history";
import { ArrowLeftIcon } from "@heroicons/react/20/solid";

interface HistoryDetailProps {
  history: History;
  onBack: () => void;
}

const dummyInputData = {
  familyMembers: "4人",
  buildingArea: "30坪",
  floors: "2階建て",
  ldkArea: "18帖",
  roomCount: "3室",
  toiletCount: "2個",
  projectTitle: "佐藤様邸間取りプラン",
  commitment:
    "玄関からキッチンまでの動線を短く、洗濯物を干すベランダへの動線を重視",
};

const HistoryDetail: React.FC<HistoryDetailProps> = ({ history, onBack }) => {
  const headerTitle = `対応ID: #${history.id.toString().padStart(6, "0")} - ${
    history.customerName
  }様`;

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
          <button className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800">
            プレビュー
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[4fr_6fr] gap-10">
        <div className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-300">
          <h2 className="text-xl font-semibold pb-2 mb-4">入力内容確認</h2>

          <DetailRow label="ご家族構成:" value={dummyInputData.familyMembers} />

          <DetailRow label="建物面積:" value={dummyInputData.buildingArea} />
          <DetailRow label="階数:" value={dummyInputData.floors} />

          <DetailRow label="LDK希望面積:" value={dummyInputData.ldkArea} />
          <DetailRow label="居室数:" value={dummyInputData.roomCount} />
          <DetailRow label="トイレ:" value={dummyInputData.toiletCount} />

          <DetailRow
            label="プロジェクトタイトル:"
            value={dummyInputData.projectTitle}
          />

          <div className="pt-4">
            <p className="text-gray-500 text-sm mb-1">動線のこだわり:</p>
            <p className="font-medium">{dummyInputData.commitment}</p>
          </div>
        </div>

        <div className="p-6 rounded-lg border border-gray-300 bg-white">
          <h2 className="text-xl font-semibold mb-4">生成された間取り図</h2>
          <div className="w-full h-[calc(100vh-38vh)] bg-gray-300 flex items-center justify-center text-xl text-gray-600 rounded-lg">
            間取り図プレビュー <br />
            2階建て 4LDK
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
