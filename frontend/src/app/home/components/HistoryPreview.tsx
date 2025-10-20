"use client";

import React, { useState } from "react";
import { ArrowLeftIcon } from "@heroicons/react/20/solid";
import { History, HistoryChildren } from "@/constants/history";
import FloorPlanEditor from "./FloorPlanEditor";
import { FloorData } from "@/constants/floorPlan";

interface HistoryPreviewProps {
  history: History;
  child: HistoryChildren;
  floorData: { 1: FloorData; 2?: FloorData };
  onBack: () => void;
}

const HistoryPreview: React.FC<HistoryPreviewProps> = ({
  history,
  child,
  floorData,
  onBack,
}) => {
  const [title, setTitle] = useState(history.title || "");
  const [customerName, setCustomerName] = useState(history.customerName || "");
  const [date, setDate] = useState(
    child.createdAt
      ? new Date(child.createdAt).toISOString().slice(0, 10) // YYYY-MM-DD
      : ""
  );
  const [patternName, setPatternName] = useState(child.patternName || "");

  const [errors, setErrors] = useState({
    title: "",
    customerName: "",
    date: "",
    patternName: "",
  });

  const validateField = (name: string, value: string) => {
    let error = "";
    switch (name) {
      case "title":
      case "customerName":
      case "patternName":
        if (!value.trim()) error = "必須入力です";
        else if (value.length > 50) error = "50文字以内で入力してください";
        break;
      case "date":
        if (!value) error = "必須入力です";
        break;
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
    return error === "";
  };

  const handlePDFDownload = () => {
    const isValid =
      validateField("title", title) &&
      validateField("customerName", customerName) &&
      validateField("date", date) &&
      validateField("patternName", patternName);

    if (!isValid) {
      console.warn("入力にエラーがあります", errors);
      return;
    }

    console.log("PDFダウンロード:", {
      title,
      customerName,
      date,
      patternName,
      floorData,
    });
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md w-full">
      <div className="flex justify-between items-center mb-4 border-b pb-4">
        <div className="text-3xl">
          プレビュー
          <span className="mt-1 block text-sm text-gray-500 font-normal">
            {`縮尺: ${child.scale} | 用紙: A4横`}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            className="bg-gray-800 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700"
            onClick={handlePDFDownload}
          >
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

      <div className="p-4 border border-gray-300 rounded-lg mb-4">
        {floorData && Object.keys(floorData).length > 0 ? (
          <div className="w-full h-[calc(100vh-38vh)] flex justify-center">
            <div
              className="w-full h-full"
              style={{ maxWidth: "100%", transformOrigin: "top center" }}
            >
              <FloorPlanEditor originalData={floorData} editable={false} />
            </div>
          </div>
        ) : (
          <div className="w-full h-[calc(100vh-38vh)] flex items-center justify-center text-2xl text-gray-600">
            間取り図データがありません
          </div>
        )}
      </div>

      <div className="border border-gray-400 text-sm">
        <div className="grid grid-cols-[3fr_2fr_1fr_1fr_1fr] text-center">
          <div className="py-1 border-r border-b border-gray-400 bg-gray-100">
            タイトル
          </div>
          <div className="py-1 border-r border-b border-gray-400 bg-gray-100">
            顧客名
          </div>
          <div className="py-1 border-r border-b border-gray-400 bg-gray-100">
            日付
          </div>
          <div className="py-1 border-r border-b border-gray-400 bg-gray-100">
            パータン
          </div>
          <div className="py-1 border-b border-gray-400 bg-gray-100 row-span-2"></div>
        </div>

        <div className="grid grid-cols-[3fr_2fr_1fr_1fr_1fr] text-center">
          <div className="flex flex-col border-r border-gray-400">
            <input
              className={`py-2 text-center ${
                errors.title ? "border-red-500" : ""
              }`}
              value={title}
              maxLength={50}
              onChange={(e) => {
                setTitle(e.target.value);
                validateField("title", e.target.value);
              }}
            />
            {errors.title && (
              <span className="text-red-500 text-xs">{errors.title}</span>
            )}
          </div>

          <div className="flex flex-col border-r border-gray-400">
            <input
              className={`py-2 text-center ${
                errors.customerName ? "border-red-500" : ""
              }`}
              value={customerName}
              maxLength={50}
              onChange={(e) => {
                setCustomerName(e.target.value);
                validateField("customerName", e.target.value);
              }}
            />
            {errors.customerName && (
              <span className="text-red-500 text-xs">
                {errors.customerName}
              </span>
            )}
          </div>

          <div className="flex flex-col border-r border-gray-400 items-center">
            <input
              type="date"
              className={`py-2 text-center w-full max-w-[55%] ${
                errors.date ? "border-red-500" : ""
              }`}
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                validateField("date", e.target.value);
              }}
            />
            {errors.date && (
              <span className="text-red-500 text-xs mt-1">{errors.date}</span>
            )}
          </div>

          <div className="flex flex-col border-r border-gray-400">
            <input
              className={`py-2 text-center ${
                errors.patternName ? "border-red-500" : ""
              }`}
              value={patternName}
              maxLength={50}
              onChange={(e) => {
                setPatternName(e.target.value);
                validateField("patternName", e.target.value);
              }}
            />
            {errors.patternName && (
              <span className="text-red-500 text-xs">{errors.patternName}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryPreview;
