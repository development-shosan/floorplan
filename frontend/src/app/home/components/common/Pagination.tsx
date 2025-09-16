"use client";
import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageGroupSize?: number;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  pageGroupSize = 5,
}) => {
  const groupStart =
    Math.floor((currentPage - 1) / pageGroupSize) * pageGroupSize + 1;
  const groupEnd = Math.min(groupStart + pageGroupSize - 1, totalPages);

  const pages = [];
  for (let i = groupStart; i <= groupEnd; i++) pages.push(i);

  return (
    <div className="flex justify-between items-center mt-6 px-4">
      {/* ページの情報 */}
      <span className="text-gray-700 font-medium">
        {currentPage} / {totalPages} ページ
      </span>

      <div className="flex space-x-1">
        {/* 最初のページ */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage <= pageGroupSize}
          className="px-3 py-1 rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          {"<<"}
        </button>

        {/* 前のグループ */}
        <button
          onClick={() => onPageChange(Math.max(groupStart - pageGroupSize, 1))}
          disabled={currentPage <= pageGroupSize}
          className="px-3 py-1 rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          {"<"}
        </button>

        {/* 現在のページ */}
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`px-3 py-1 rounded-md border border-gray-300 transition ${
              currentPage === p
                ? "bg-gray-700 text-white border-gray-700 shadow"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            {p}
          </button>
        ))}

        {/* 次のグループ */}
        <button
          onClick={() =>
            onPageChange(
              groupStart + pageGroupSize <= totalPages
                ? groupStart + pageGroupSize
                : totalPages
            )
          }
          disabled={currentPage >= totalPages}
          className="px-3 py-1 rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          {">"}
        </button>

        {/* 最終のページ */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          {">>"}
        </button>
      </div>
    </div>
  );
};

export default Pagination;
