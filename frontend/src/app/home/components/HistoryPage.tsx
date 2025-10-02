"use client";

import React, { useState } from "react";
import Pagination from "./common/Pagination";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/16/solid";
import { dummyHistories, History } from "@/constants/history";
import { useUser } from "@/hooks/userContext";
import { UserRole } from "@/constants/roles";
import HistoryChild from "./HistoryChild";
import HistoryDetail from "./HistoryDetail";

const HistoryPage: React.FC = () => {
  const { user } = useUser();

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startDateInput, setStartDateInput] = useState("");
  const [endDateInput, setEndDateInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [tab, setTab] = useState<"all" | "favorite">("all");
  const [isChildOpen, setIsChildOpen] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<History | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const itemsPerPage = 10;

  const [sortConfig, setSortConfig] = useState<{
    key: keyof History;
    direction: "asc" | "desc";
  } | null>(null);

  const handleSearch = () => {
    setSearch(searchInput);
    setStartDate(startDateInput);
    setEndDate(endDateInput);
    setCurrentPage(1);
  };

  const filtered = dummyHistories.filter((h) => {
    const matchName = h.customerName.includes(search);
    const matchTab = tab === "all" ? true : h.favoriteCount >= 1;

    const createdDate = new Date(h.createdAt);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    const matchStart = start ? createdDate >= start : true;
    const matchEnd = end
      ? createdDate <= new Date(end.getTime() + 24 * 60 * 60 * 1000 - 1)
      : true;

    return matchName && matchTab && matchStart && matchEnd;
  });

  const sorted = React.useMemo(() => {
    const sortable = [...filtered];
    if (sortConfig) {
      sortable.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortConfig.direction === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortConfig.direction === "asc"
            ? aValue - bValue
            : bValue - aValue;
        }
        return 0;
      });
    }
    return sortable;
  }, [filtered, sortConfig]);

  const handleSort = (key: keyof History) => {
    if (sortConfig?.key === key) {
      setSortConfig({
        key,
        direction: sortConfig.direction === "asc" ? "desc" : "asc",
      });
    } else {
      setSortConfig({ key, direction: "desc" });
    }
  };

  const handleDetailClick = (history: History) => {
    setSelectedHistory(history);
    setIsChildOpen(true);
  };

  const handleCloseChild = () => {
    setSelectedHistory(null);
    setIsChildOpen(false);
  };

  const handleGoToDetail = (history: History) => {
    setSelectedHistory(history);
    setIsChildOpen(false);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setIsChildOpen(true);
  };

  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated = sorted.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div>
      {isDetailOpen && selectedHistory ? (
        <HistoryDetail history={selectedHistory} onBack={handleCloseDetail} />
      ) : isChildOpen && selectedHistory ? (
        <HistoryChild
          history={selectedHistory}
          onBack={handleCloseChild}
          onDetailClick={handleGoToDetail}
        />
      ) : (
        <>
          <div className="flex gap-4 mb-6">
            {(user?.role === UserRole.COMPANY_ADMIN
              ? ["all", "favorite"]
              : ["all"]
            ).map((item) => {
              const label = item === "all" ? "すべて" : "お気に入り";
              const isActive = tab === item;

              return (
                <button
                  key={item}
                  onClick={() => setTab(item as "all" | "favorite")}
                  className={`relative text-lg transition-transform duration-200 cursor-pointer ${
                    isActive
                      ? "text-black translate-y-[-2px] after:scale-x-100"
                      : "text-gray-400 hover:text-black after:scale-x-0"
                  } after:content-[''] after:absolute after:-bottom-1 after:left-0 after:right-0 after:h-[2px] after:bg-black after:origin-left after:transition-transform after:duration-200 hover:scale-110`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className="flex gap-2 mb-6">
            <div className="flex items-center gap-2 border border-gray-300 px-3 py-2 rounded flex-1 focus-within:ring-2 focus-within:ring-blue-400">
              <MagnifyingGlassIcon className="w-6 h-6 text-gray-500" />
              <input
                type="text"
                placeholder="顧客名で検索"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="flex-1 outline-none"
              />
            </div>
            <input
              type="date"
              value={startDateInput}
              onChange={(e) => setStartDateInput(e.target.value)}
              className="border border-gray-300 px-3 py-2 rounded flex-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="date"
              value={endDateInput}
              onChange={(e) => setEndDateInput(e.target.value)}
              className="border border-gray-300 px-3 py-2 rounded flex-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 flex-1"
              onClick={handleSearch}
            >
              検索
            </button>
          </div>

          <div className="overflow-x-auto overflow-y-auto h-[calc(100vh-35vh)] mt-4">
            <table className="min-w-full text-center border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  {[
                    { label: "ID", key: "id" },
                    { label: "タイトル", key: "title" },
                    { label: "生成日時", key: "createdAt" },
                    {
                      label:
                        user?.role === UserRole.SYSTEM_ADMIN
                          ? "会社名"
                          : "顧客名",
                      key:
                        user?.role === UserRole.SYSTEM_ADMIN
                          ? "companyName"
                          : "customerName",
                    },
                    { label: "担当者", key: "userName" },
                    ...(user?.role === UserRole.COMPANY_ADMIN
                      ? [{ label: "お気に入り", key: "favoriteCount" }]
                      : []),
                    { label: "操作", key: "" },
                  ].map((th) => (
                    <th
                      key={th.label}
                      className="border-b border-gray-300 px-3 py-2 font-medium cursor-pointer select-none"
                      onClick={() =>
                        th.key && handleSort(th.key as keyof History)
                      }
                    >
                      <div className="flex items-center justify-center">
                        <span className="mr-2">{th.label}</span>
                        {th.key &&
                          (sortConfig?.key === th.key ? (
                            sortConfig.direction === "asc" ? (
                              <ChevronUpIcon className="w-4 h-4 text-gray-500" />
                            ) : (
                              <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                            )
                          ) : (
                            <ChevronUpIcon className="w-4 h-4 text-gray-500" />
                          ))}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((h) => (
                  <tr key={h.id} className="hover:bg-gray-50">
                    <td className="border-b border-gray-300 px-3 py-2">
                      #{h.id.toString().padStart(6, "0")}
                    </td>
                    <td className="border-b border-gray-300 px-3 py-2">
                      {h.title}
                    </td>
                    <td className="border-b border-gray-300 px-3 py-2">
                      {h.createdAt}
                    </td>
                    <td className="border-b border-gray-300 px-3 py-2">
                      {user?.role === UserRole.SYSTEM_ADMIN
                        ? h.companyName
                        : h.customerName}
                    </td>
                    <td className="border-b border-gray-300 px-3 py-2">
                      {h.userName}
                    </td>
                    {user?.role === UserRole.COMPANY_ADMIN && (
                      <td className="border-b border-gray-300 px-3 py-2 text-yellow-500">
                        {"★".repeat(h.favoriteCount) +
                          "☆".repeat(3 - h.favoriteCount)}
                      </td>
                    )}
                    <td className="border-b border-gray-300 px-3 py-2 flex justify-center gap-2">
                      <button
                        className="bg-gray-300 hover:bg-gray-400 px-3 py-1 rounded text-sm"
                        onClick={() => handleDetailClick(h)}
                      >
                        詳細
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-between mt-4 text-sm text-gray-500">
              <span>{`Showing ${startIndex + 1} to ${
                startIndex + paginated.length
              } of ${sorted.length} results`}</span>
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default HistoryPage;
