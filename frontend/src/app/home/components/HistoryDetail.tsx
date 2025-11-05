"use client";

import React, { useState } from "react";
import { ArrowLeftIcon } from "@heroicons/react/20/solid";
import { History, HistoryChildren } from "@/constants/history";
import EquipmentSelector from "./EquipmentSelector";
import { FloorData } from "@/constants/floorPlan";
import FloorPlanEditor from "./FloorPlanEditor";
import HistoryPreview from "./HistoryPreview";
import { UserRole } from "@/constants/roles";
import { useUser } from "@/hooks/userContext";

interface HistoryDetailProps {
  history: History;
  child: HistoryChildren;
  onBack: () => void;
}

const HistoryDetail: React.FC<HistoryDetailProps> = ({
  history,
  child,
  onBack,
}) => {
  const { user } = useUser();

  const headerTitle = `対応ID: #${history.id.toString().padStart(6, "0")} - ${
    history.customerName
  }様`;
  const conditions = history.conditions;

  const initialFloorData: { 1: FloorData; 2?: FloorData } = {
    1: {
      ...child.floorplanData?.["1"],
      objects: child.floorplanData?.["1"]?.objects ?? [],
    },
    2: child.floorplanData?.["2"]
      ? {
          ...child.floorplanData["2"],
          objects: child.floorplanData["2"].objects ?? [],
        }
      : undefined,
  };

  const [floorData, setFloorData] = useState(initialFloorData);
  const [previewMode, setPreviewMode] = useState(false);
  const [currentFloor, setCurrentFloor] = useState<1 | 2>(1);
  const [clearSelectionTrigger, setClearSelectionTrigger] = useState(0);

  const viewerData: HistoryChildFloorplanData = {
    '1': floorData[1],
    '2': floorData[2],
    tag: child.floorplanData.tag,
    first_floor_area: child.floorplanData.first_floor_area,
    second_floor_area: child.floorplanData.second_floor_area,
    total_floor_area: child.floorplanData.total_floor_area,
    type: child.floorplanData.type,
  };

  const handleBackFromPreview = () => setPreviewMode(false);

  const handlePreviewClick = () => {
    setClearSelectionTrigger((prev) => prev + 1);
    setPreviewMode(true);
  };

  if (previewMode) {
    return (
      <HistoryPreview
        history={history}
        child={child}
        floorplanData={viewerData}
        onBack={handleBackFromPreview}
      />
    );
  }

  return (
    <div className="bg-white rounded-lg">
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
            onClick={handlePreviewClick}
          >
            プレビュー
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[4fr_6fr] gap-10">
        <div className="space-y-4 bg-gray-50 p-6 rounded-lg border h-200 border-gray-300">
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
          <DetailRow
            label="1階面積:"
            value={`${String(
              child.floorplanData?.first_floor_area ?? "-"
            )} m\u00b2`}
          />
          <DetailRow
            label="2階面積:"
            value={`${String(
              child.floorplanData?.second_floor_area ?? "-"
            )} m\u00b2`}
          />
          <DetailRow
            label="延床面積:"
            value={`${String(
              child.floorplanData?.total_floor_area ?? "-"
            )} m\u00b2`}
          />

          <div className="pt-4">
            <p className="text-gray-500 text-sm mb-1">動線のこだわり:</p>
            <p className="font-medium">
              {conditions.commitment_flow_lines.value}
            </p>
          </div>
        </div>

        <div className="p-6 rounded-lg border border-gray-300 bg-white">
          <h2 className="text-xl font-semibold mb-4">生成された間取り図</h2>
          <div className="w-full h-[calc(100vh-38vh)] flex items-center justify-center text-xl text-gray-600 rounded-lg">
            {viewerData ? (
              <FloorPlanEditor
                originalData={viewerData}
                onChange={(newData) => setFloorData(newData)}
                editable={true}
                currentFloor={currentFloor}
                setCurrentFloor={setCurrentFloor}
                clearSelectionTrigger={clearSelectionTrigger}
              />
            ) : (
              <div className="flex items-center justify-center h-48 text-gray-500 text-sm">
                間取り図データがありません
              </div>
            )}
          </div>

          {user?.role === UserRole.MEMBER && (
            <div className="mt-4">
              <EquipmentSelector
                setFloorData={setFloorData}
                currentFloor={currentFloor}
              />
            </div>
          )}
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
