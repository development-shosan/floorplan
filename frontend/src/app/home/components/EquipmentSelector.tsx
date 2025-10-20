"use client";

import { FloorData, PlanElement } from "@/constants/floorPlan";
import Image from "next/image";
import React, { useState } from "react";

interface UploadedImage {
  id: string;
  src: string;
  selected: boolean;
}

interface EquipmentSelectorProps {
  floorData: { 1: FloorData; 2?: FloorData };
  setFloorData: React.Dispatch<
    React.SetStateAction<{ 1: FloorData; 2?: FloorData }>
  >;
}

const EquipmentSelector: React.FC<EquipmentSelectorProps> = ({
  floorData,
  setFloorData,
}) => {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 12;

  const totalPages = Math.ceil(uploadedImages.length / pageSize);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages = Array.from(files).map((file) => ({
      id: crypto.randomUUID(),
      src: URL.createObjectURL(file),
      selected: false,
    }));
    setUploadedImages((prev) => [...prev, ...newImages]);
  };

  const handleSelectToggle = (id: string) => {
    setUploadedImages((prev) =>
      prev.map((img) =>
        img.id === id ? { ...img, selected: !img.selected } : img
      )
    );
  };

  const handleAddSelected = () => {
    const selectedImages = uploadedImages.filter((img) => img.selected);
    if (selectedImages.length === 0) return;

    const newObjects: (PlanElement & { imageUrl?: string })[] =
      selectedImages.map((img) => ({
        name: "カスタム画像",
        x: 1,
        y: 1,
        width: 2,
        height: 2,
        imageUrl: img.src,
      }));

    setFloorData((prev) => ({
      ...prev,
      1: {
        ...prev[1],
        objects: [...(prev[1].objects ?? []), ...newObjects],
      },
    }));

    setUploadedImages((prev) =>
      prev.map((img) => ({ ...img, selected: false }))
    );
  };

  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 0));
  const handleNextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));

  const pagedImages = uploadedImages.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  return (
    <div className="設備選択 bg-gray-50 p-4 rounded-lg border border-gray-300">
      <h3 className="text-lg font-semibold mb-2">設備選択</h3>

      <p className="text-sm mb-2">
        配置済み: {floorData[1].objects?.length ?? 0} 個
      </p>

      <div className="grid grid-cols-4 gap-2">
        {pagedImages.map((img) => (
          <div key={img.id} className="flex flex-col items-center">
            <Image
              src={img.src}
              alt="設備画像"
              width={80}
              height={80}
              className="object-cover rounded border"
              unoptimized
            />
            <label className="flex items-center mt-1 text-sm">
              <input
                type="checkbox"
                checked={img.selected}
                onChange={() => handleSelectToggle(img.id)}
                className="mr-1"
              />
              配置
            </label>
          </div>
        ))}
      </div>

      <div className="flex justify-between mt-2">
        <label className="relative flex items-center justify-center border border-gray-300 rounded p-2 cursor-pointer">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="absolute opacity-0 w-full h-full cursor-pointer"
          />
          <span className="text-sm text-gray-600">＋ 追加</span>
        </label>

        <button
          onClick={handleAddSelected}
          className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
        >
          追加
        </button>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-2 text-sm">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 0}
            className="px-2 py-1 border rounded disabled:opacity-50"
          >
            ◀
          </button>
          <span>
            {currentPage + 1} / {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages - 1}
            className="px-2 py-1 border rounded disabled:opacity-50"
          >
            ▶
          </button>
        </div>
      )}
    </div>
  );
};

export default EquipmentSelector;
