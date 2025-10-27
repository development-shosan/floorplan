"use client";

import React, { useState, useRef } from "react";
import { ArrowLeftIcon } from "@heroicons/react/20/solid";
import { History, HistoryChildren } from "@/constants/history";
import FloorPlanPDF from "./FloorPlanPDF";
import { FloorData } from "@/constants/floorPlan";
import jsPDF from "jspdf";
import * as htmlToImage from "html-to-image";
import { updateMadori } from "@/lib/api";

interface HistoryPreviewProps {
  history: History;
  child: HistoryChildren;
  floorplanData?: { 1?: FloorData; 2?: FloorData };
  onBack: () => void;
}

const HistoryPreview: React.FC<HistoryPreviewProps> = ({
  history,
  child,
  floorplanData,
  onBack,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const captureRef = useRef<HTMLDivElement>(null);

  const [pdfGenerated, setPdfGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const [title, setTitle] = useState(history.title || "");
  const [customerName, setCustomerName] = useState(history.customerName || "");
  const [date, setDate] = useState(
    child.createdAt ? new Date(child.createdAt).toISOString().slice(0, 10) : ""
  );
  const [patternName, setPatternName] = useState(
    child.floorplanData.type || ""
  );

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

  const handlePDFDownload = async () => {
    if (isGenerating) return;
    setIsGenerating(true);

    try {
      const isValid =
        validateField("title", title) &&
        validateField("customerName", customerName) &&
        validateField("date", date) &&
        validateField("patternName", patternName);

      if (!isValid) return;
      if (!captureRef.current) return;

      const dataUrl = await htmlToImage.toPng(captureRef.current, {
        cacheBust: true,
        pixelRatio: 3,
        skipFonts: false,
        backgroundColor: "#ffffff",
      });

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const img = new Image();
      img.src = dataUrl;
      img.onload = async () => {
        const imgWidth = img.width;
        const imgHeight = img.height;
        const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);

        const pdfWidth = imgWidth * ratio;
        const pdfHeight = imgHeight * ratio;
        const marginX = (pageWidth - pdfWidth) / 2;
        const marginY = (pageHeight - pdfHeight) / 2;

        pdf.addImage(dataUrl, "PNG", marginX, marginY, pdfWidth, pdfHeight);
        pdf.save(`${title || "間取りプレビュー"}.pdf`);

        setPdfGenerated(true);

        try {
          await updateMadori(child);
        } catch (err) {
          console.error("間取り更新に失敗しました", err);
          alert("間取り更新に失敗しました");
        }
      };
    } catch (error) {
      console.error("PDF生成に失敗しました", error);
      alert(
        `PDFダウンロードに失敗しました。詳細: ${
          error instanceof Error ? error.message : "不明なエラー"
        }`
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = async () => {
    if (!captureRef.current) return;

    try {
      const dataUrl = await htmlToImage.toPng(captureRef.current, {
        cacheBust: true,
        pixelRatio: 3,
        skipFonts: false,
        backgroundColor: "#ffffff",
      });

      const img = new Image();
      img.src = dataUrl;
      img.onload = () => {
        const printWindow = window.open("", "_blank");
        if (!printWindow) return;

        const pageWidthMm = 297;
        const pageHeightMm = 210;
        const dpi = 96;
        const pageWidthPx = (pageWidthMm / 25.4) * dpi;
        const pageHeightPx = (pageHeightMm / 25.4) * dpi;

        const ratio = Math.min(
          pageWidthPx / img.width,
          pageHeightPx / img.height
        );
        const imgWidth = img.width * ratio;
        const imgHeight = img.height * ratio;

        printWindow.document.write(`
          <html>
            <head>
              <title>${title || "間取りプレビュー"}</title>
              <style>
                body { margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; }
                img { width: ${imgWidth}px; height: ${imgHeight}px; }
              </style>
            </head>
            <body>
              <img src="${dataUrl}" />
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      };
    } catch (error) {
      console.error("印刷中エラー:", error);
      alert(
        `印刷に失敗しました。詳細: ${
          error instanceof Error ? error.message : "不明なエラー"
        }`
      );
    }
  };

  const canPrint = pdfGenerated || child.isDownloaded;

  return (
    <div
      ref={containerRef}
      className="p-6 bg-white rounded-lg shadow-md w-full flex flex-col gap-6"
    >
      <div className="flex justify-between items-center mb-4 border-b pb-4">
        <div className="text-3xl">
          プレビュー
          <span className="mt-1 block text-sm text-gray-500 font-normal">
            {`縮尺: ${child.scale} | 用紙: A4横`}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            className={`bg-gray-800 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700 ${
              isGenerating ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={handlePDFDownload}
            disabled={isGenerating}
          >
            {isGenerating ? "生成中..." : "PDFダウンロード"}
          </button>
          <button
            className={`bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-500 ${
              !canPrint || isGenerating ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={handlePrint}
            disabled={!canPrint || isGenerating}
          >
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

      <div ref={captureRef} className="flex flex-col gap-6">
        {floorplanData?.[1] && (
          <FloorPlanPDF floorData={floorplanData[1]} floorLabel="1階" />
        )}
        {floorplanData?.[2] && (
          <FloorPlanPDF floorData={floorplanData[2]} floorLabel="2階" />
        )}

        <div className="border border-gray-400 text-sm mt-auto">
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
            </div>
            <div className="flex flex-col border-r border-gray-400 items-center">
              <input
                type="date"
                className={`py-2 text-center w-full max-w-[40%] ${
                  errors.date ? "border-red-500" : ""
                }`}
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  validateField("date", e.target.value);
                }}
              />
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryPreview;
