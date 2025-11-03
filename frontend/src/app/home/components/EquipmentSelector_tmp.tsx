"use client";

import { FloorData, PlanElement } from "@/constants/floorPlan";
import { XMarkIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import React, { useState, useMemo, useEffect } from "react";
import { deleteEquipmentImage } from "@/lib/api";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

interface UploadedImage {
  id: string;
  src: string;
  name: string;
  selected: boolean;
}

// interface EquipmentImage {
//   name: string;
//   url: string;
// }

interface EquipmentSelectorProps {
  setFloorData: React.Dispatch<
    React.SetStateAction<{ 1: FloorData; 2?: FloorData }>
  >;
  currentFloor: 1 | 2;
}

const EquipmentSelector: React.FC<EquipmentSelectorProps> = ({
  setFloorData,
  currentFloor,
}) => {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>(() =>
    Array.from({ length: 15 }, (_, i) => ({
      id: crypto.randomUUID(),
      src: `https://picsum.photos/80/80?random=${i + 1}`,
      name: `dummy${i + 1}_タグ`,
      selected: false,
    }))
  );
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const pageSize = 12;

  useEffect(() => {
    const fetchImages = async () => {
      try {
        // 設備イメージリストAPI
        // const res = await getEquipmentImages();
        // const images: EquipmentImage[] = (res?.images ??
        //   []) as EquipmentImage[];
        // setUploadedImages(
        //   images.map((img) => ({
        //     id: crypto.randomUUID(),
        //     src: img.url,
        //     name: img.name,
        //     selected: false,
        //   }))
        // );
      } catch (err) {
        console.error("設備画像取得エラー:", err);
        alert("設備イメージリスト取得に失敗しました");
      }
    };
    fetchImages();
  }, []);

  const totalPages = Math.ceil(
    uploadedImages.filter((img) =>
      selectedTag ? img.name.split("_")[1] === selectedTag : true
    ).length / pageSize
  );

  const tags = useMemo(() => {
    const tagSet = new Set<string>();
    uploadedImages.forEach((img) => {
      const parts = img.name.split("_");
      if (parts[1]) {
        tagSet.add(parts[1].split(".")[0]);
      }
    });
    return Array.from(tagSet);
  }, [uploadedImages]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    try {
      const uploaded: UploadedImage[] = [];
      // for (const file of Array.from(files)) {
      //   // 設備イメージ追加API
      //   const res = await uploadEquipmentImage(file);
      //   uploaded.push({
      //     id: crypto.randomUUID(),
      //     src: res.url,
      //     name: res.name,
      //     selected: false,
      //   });
      // }

      for (const file of Array.from(files)) {
        // 서버 없이 로컬에서 바로 이미지 미리보기
        uploaded.push({
          id: crypto.randomUUID(),
          src: URL.createObjectURL(file), // 로컬 이미지 URL
          name: file.name, // 파일명을 이름으로 사용
          selected: false,
        });
      }
      setUploadedImages((prev) => [...uploaded, ...prev]);
      setCurrentPage(0);
    } catch (err) {
      console.error("設備画像アップロードエラー:", err);
      alert("設備イメージ追加に失敗しました");
    }
  };

  const handleTagSelect = (tag: string | null) => {
    setSelectedTag(tag);
    setCurrentPage(0);
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
        name: img.name,
        x: 1,
        y: 1,
        width: 2,
        height: 2,
        imageUrl: img.src,
      }));

    setFloorData((prev) => ({
      ...prev,
      [currentFloor]: {
        ...prev[currentFloor],
        objects: [...(prev[currentFloor]?.objects ?? []), ...newObjects],
      },
    }));

    setUploadedImages((prev) =>
      prev.map((img) =>
        selectedImages.find((s) => s.id === img.id)
          ? { ...img, selected: false }
          : img
      )
    );
  };

  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 0));
  const handleNextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));

  const filteredImages = uploadedImages.filter((img) =>
    selectedTag ? img.name.split("_")[1]?.split(".")[0] === selectedTag : true
  );

  const pagedImages = filteredImages.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  const handleDeleteImage = async (id: string, name: string) => {
    try {
      // 設備イメージ削除
      await deleteEquipmentImage(name);
      setUploadedImages((prev) => prev.filter((img) => img.id !== id));
      alert("設備を削除しました");
    } catch (err) {
      console.error("設備イメージ削除:", err);
      alert("設備イメージ削除に失敗しました");
    }
  };

  return (
    <div className="flex">
      <div className="設備選択 bg-gray-50 p-4 rounded-lg border border-gray-300 flex-1">
        <h3 className="text-lg font-semibold mb-2">設備選択</h3>
        <div className="mt-2 flex gap-2 overflow-x-auto">
          <button
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap text-sm font-medium transition-colors ${
              selectedTag === null
                ? "bg-gray-800 text-white shadow-md"
                : "bg-gray-200 text-gray-800"
            }`}
            onClick={() => handleTagSelect(null)}
          >
            全て
          </button>
          {tags.map((tag) => (
            <button
              key={tag}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap text-sm font-medium transition-colors ${
                selectedTag === tag
                  ? "bg-gray-800 text-white shadow-md"
                  : "bg-gray-200 text-gray-800"
              }`}
              onClick={() => handleTagSelect(tag)}
            >
              {tag}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-2 mt-4 relative px-10">
          {totalPages > 1 && (
            <>
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 0}
                className="absolute left-0 top-1/2 -translate-y-1/2
                           w-8 h-8 flex items-center justify-center
                           bg-white border border-gray-300 rounded-full shadow
                           hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed z-20"
              >
                <ChevronLeftIcon className="w-5 h-5 text-gray-700" />
              </button>

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages - 1}
                className="absolute right-0 top-1/2 -translate-y-1/2
                           w-8 h-8 flex items-center justify-center
                           bg-white border border-gray-300 rounded-full shadow
                           hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed z-20"
              >
                <ChevronRightIcon className="w-5 h-5 text-gray-700" />
              </button>
            </>
          )}
          {pagedImages.map((img) => (
            <div
              key={img.id}
              className="border border-gray-300 relative flex flex-col items-center p-2 rounded-md bg-white"
            >
              <label className="flex items-center mt-2 text-sm">
                <input
                  type="checkbox"
                  checked={img.selected}
                  onChange={() => handleSelectToggle(img.id)}
                  className="mr-1"
                />
              </label>
              <Image
                src={img.src}
                alt={img.name.split("_")[1]}
                width={80}
                height={80}
                className="object-cover rounded border mb-1"
                unoptimized
              />
              {img.name.split("_")[0] || img.name}
              <span className="text-xs text-gray-500 mb-1">
                {img.name.split("_")[1]?.split(".")[0] || "タグなし"}
              </span>
              <button
                type="button"
                onClick={() => handleDeleteImage(img.id, img.name)}
                className="absolute top-1 right-1
             w-6 h-6
             bg-white border border-red-400
             rounded-full
             flex items-center justify-center
             shadow-sm
             hover:bg-red-500 hover:text-white
             transition-colors
             z-10"
                title="削除"
              >
                <XMarkIcon className="w-4 h-4 text-red-500 hover:text-white" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-4 gap-2">
          <label
            className="relative flex items-center justify-center 
                    border border-gray-400 rounded-lg p-2 cursor-pointer 
                    bg-white hover:bg-gray-100 transition-colors shadow-sm"
          >
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="absolute opacity-0 w-full h-full cursor-pointer"
            />
            <span className="text-sm text-gray-700 font-medium">
              イメージ追加
            </span>
          </label>
          <div className="flex gap-2">
            <button
              onClick={handleAddSelected}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors shadow-md text-sm font-medium"
            >
              配置
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentSelector;
