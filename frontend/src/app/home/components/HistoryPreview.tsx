"use client";

import React from "react";
import { ArrowLeftIcon } from "@heroicons/react/20/solid";
import { PlanDetail } from "@/constants/history";

interface HistoryPreviewProps {
  plan: PlanDetail;
  onBack: () => void;
}

const HistoryPreview: React.FC<HistoryPreviewProps> = ({ plan, onBack }) => {
  const { previewData } = plan;
  return (
    <div className="p-6 bg-white rounded-lg shadow-md w-full">
      <div className="flex justify-between items-center mb-4 border-b pb-4">
        <div className="text-3xl">
          プレビュー
          <span className="mt-1 block text-sm text-gray-500 font-normal">
            縮尺: 1/100 | 用紙: A4横
          </span>
        </div>
        <div className="flex gap-2">
          <button className="bg-gray-800 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700">
            PDFダウンロード
          </button>
          <button className="border border-gray-300 px-4 py-2 rounded-md text-sm hover:bg-gray-100">
            印刷
          </button>
          <button
            onClick={onBack}
            className="flex items-center border border-gray-300 px-4 py-2 rounded-md text-sm hover:bg-gray-100"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            戻る
          </button>
        </div>
      </div>

      <div className="p-4 border border-gray-300 rounded-lg">
        <div className="aspect-[1.414/1] w-full bg-gray-300 flex flex-col items-center justify-center text-2xl text-gray-600 rounded-md">
          間取り図プレビュー
          <span className="text-base mt-2">{previewData.floorsRooms}K</span>
        </div>

        <hr className="my-4 border-t-2 border-gray-800" />

        <div className="mt-4 border border-gray-400 text-sm">
          <div className="grid grid-cols-[3fr_2fr_1fr_1fr_1fr_1fr_1fr_1fr] text-center border-b border-gray-400">
            <div className="py-1 border-r border-gray-400 bg-gray-100">
              {previewData.title}
            </div>
            <div className="py-1 border-r border-gray-400 bg-gray-100">
              {previewData.drawingNumber}
            </div>
            <div className="py-1 border-r border-gray-400 bg-gray-100">
              {previewData.scale}
            </div>
            <div className="py-1 border-r border-gray-400 bg-gray-100"></div>
            <div className="py-1 border-r border-gray-400 bg-gray-100"></div>
            <div className="py-1 border-r border-gray-400 bg-gray-100"></div>
            <div className="py-1 border-r border-gray-400 bg-gray-100">
              日付
            </div>
            <div className="py-1 bg-gray-100">図番</div>
          </div>

          <div className="grid grid-cols-[3fr_2fr_1fr_1fr_1fr_1fr_1fr_1fr] text-center">
            <div className="py-2 border-r border-gray-400 font-medium">
              サンプル様邸 新築工事
            </div>
            <div className="py-2 border-r border-gray-400">平面図</div>
            <div className="py-2 border-r border-gray-400">S=1/100</div>
            <div className="py-2 border-r border-gray-400"></div>
            <div className="py-2 border-r border-gray-400"></div>
            <div className="py-2 border-r border-gray-400"></div>
            <div className="py-2 border-r border-gray-400"></div>
            <div className="py-2"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryPreview;
