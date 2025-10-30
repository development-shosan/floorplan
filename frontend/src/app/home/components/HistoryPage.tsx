"use client";

import React, { useEffect, useState } from "react";
import Pagination from "./common/Pagination";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/16/solid";
import { StarIcon as StarOutline } from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import { History } from "@/constants/history";
import { useUser } from "@/hooks/userContext";
import { UserRole } from "@/constants/roles";
import HistoryChild from "./HistoryChild";
import { getHistoryList } from "@/lib/api";

interface HistoryPageProps {
  resetSignal?: number;
  setActiveTab: (tab: string) => void;
}

const HistoryPage: React.FC<HistoryPageProps> = ({
  resetSignal,
  setActiveTab,
}) => {
  const { user } = useUser();

  const [histories, setHistories] = useState<History[]>([]);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startDateInput, setStartDateInput] = useState("");
  const [endDateInput, setEndDateInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [tab, setTab] = useState<"all" | "favorite">("all");

  const [selectedHistory, setSelectedHistory] = useState<History | null>(null);
  const [loading, setLoading] = useState(true);

  const itemsPerPage = 10;

  const [sortConfig, setSortConfig] = useState<{
    key: keyof History;
    direction: "asc" | "desc";
  } | null>(null);

  const fetchHistories = async () => {
    try {
      if (!user) return;

      setLoading(true);
      // 対応履歴一覧API
      const response = await getHistoryList(user.id);
      const data: History[] = response.histories;
      setHistories(data);
    } catch (error) {
      console.error(error);
      alert("対応履歴一覧の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistories();
  }, []);

  useEffect(() => {
    setSelectedHistory(null);
    setSearch("");
    setSearchInput("");
    setStartDate("");
    setStartDateInput("");
    setEndDate("");
    setEndDateInput("");
    setCurrentPage(1);
    setTab("all");
    setSortConfig(null);
  }, [resetSignal]);

  const handleSearch = () => {
    setSearch(searchInput);
    setStartDate(startDateInput);
    setEndDate(endDateInput);
    setCurrentPage(1);
  };

  const filteredHistories = histories.filter((h) => {
    const matchName =
      user?.role === "SYSTEM_ADMIN"
        ? h.companyName?.includes(search)
        : h.title?.includes(search) || h.customerName?.includes(search);
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

  const sortedHistories = React.useMemo(() => {
    const sortableHistories = [...filteredHistories];
    if (sortConfig) {
      sortableHistories.sort((a, b) => {
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
    return sortableHistories;
  }, [filteredHistories, sortConfig]);

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

  const totalPages = Math.ceil(sortedHistories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated = sortedHistories.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div>
      {loading ? (
        <p>{"ロード中..."}</p>
      ) : selectedHistory ? (
        <HistoryChild history={selectedHistory} setActiveTab={setActiveTab} />
      ) : (
        <>
          <div className="flex gap-4 mb-6">
            {(user?.role !== UserRole.SYSTEM_ADMIN
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

          <div className="border border-gray-200 rounded-lg p-6 mb-6 bg-gray-100">
            <div className="flex gap-4 items-end">
              <div className="flex flex-col flex-1">
                <label className="text-sm font-medium text-gray-700 mb-1">
                  {user?.role === "SYSTEM_ADMIN"
                    ? "会社名"
                    : "タイトル / 顧客名"}
                </label>
                <div className="flex items-center gap-2 border border-gray-300 px-3 py-2 rounded bg-white focus-within:ring-2 focus-within:ring-blue-400">
                  <MagnifyingGlassIcon className="w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    placeholder={
                      user?.role === "SYSTEM_ADMIN"
                        ? "会社名で検索"
                        : "タイトル、顧客名で検索"
                    }
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSearch();
                    }}
                    className="flex-1 outline-none text-sm bg-white"
                  />
                </div>
              </div>

              <div className="flex flex-col flex-1">
                <label className="text-sm font-medium text-gray-700 mb-1">
                  開始日
                </label>
                <input
                  type="date"
                  value={startDateInput}
                  onChange={(e) => setStartDateInput(e.target.value)}
                  className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm bg-white"
                />
              </div>

              <div className="flex flex-col flex-1">
                <label className="text-sm font-medium text-gray-700 mb-1">
                  終了日
                </label>
                <input
                  type="date"
                  value={endDateInput}
                  onChange={(e) => setEndDateInput(e.target.value)}
                  className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm bg-white"
                />
              </div>

              <div className="flex flex-col flex-1">
                <button
                  className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800 transition text-sm"
                  onClick={handleSearch}
                >
                  検索
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto overflow-y-auto h-[calc(100vh-35vh)] mt-4">
            <table className="min-w-full text-center border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  {(() => {
                    if (user?.role === UserRole.SYSTEM_ADMIN) {
                      return [
                        { label: "ID", key: "id" },
                        { label: "タイトル", key: "title" },
                        { label: "生成日時", key: "createdAt" },
                        { label: "会社名", key: "companyName" },
                        { label: "担当者", key: "userName" },
                        { label: "操作", key: "" },
                      ];
                    } else if (user?.role === UserRole.COMPANY_ADMIN) {
                      return [
                        { label: "ID", key: "id" },
                        { label: "タイトル", key: "title" },
                        { label: "生成日時", key: "createdAt" },
                        { label: "顧客名", key: "customerName" },
                        { label: "担当者", key: "userName" },
                        { label: "お気に入り", key: "favoriteCount" },
                        { label: "操作", key: "" },
                      ];
                    } else {
                      return [
                        { label: "ID", key: "id" },
                        { label: "タイトル", key: "title" },
                        { label: "生成日時", key: "createdAt" },
                        { label: "修正日時", key: "updatedAt" },
                        { label: "顧客名", key: "customerName" },
                        { label: "お気に入り", key: "favoriteCount" },
                        { label: "操作", key: "" },
                      ];
                    }
                  })().map((th) => (
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
                      {h.createdAt
                        ? new Date(h.createdAt).toLocaleString("ja-JP", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })
                        : "-"}
                    </td>

                    {user?.role === UserRole.SYSTEM_ADMIN && (
                      <>
                        <td className="border-b border-gray-300 px-3 py-2">
                          {h.companyName ?? "-"}
                        </td>
                        <td className="border-b border-gray-300 px-3 py-2">
                          {h.userName ?? "-"}
                        </td>
                      </>
                    )}

                    {user?.role === UserRole.COMPANY_ADMIN && (
                      <>
                        <td className="border-b border-gray-300 px-3 py-2">
                          {h.customerName ?? "-"}
                        </td>
                        <td className="border-b border-gray-300 px-3 py-2">
                          {h.userName ?? "-"}
                        </td>
                        <td className="border-b border-gray-300 px-3 py-2">
                          {Array.from({ length: 3 }).map((_, i) =>
                            i < h.favoriteCount ? (
                              <StarSolid
                                key={i}
                                className="w-6 h-6 text-gray-500 inline"
                              />
                            ) : (
                              <StarOutline
                                key={i}
                                className="w-6 h-6 text-gray-600 inline"
                              />
                            )
                          )}
                        </td>
                      </>
                    )}

                    {user?.role === UserRole.MEMBER && (
                      <>
                        <td className="border-b border-gray-300 px-3 py-2">
                          {h.updatedAt
                            ? new Date(h.updatedAt).toLocaleString("ja-JP", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: false,
                              })
                            : "-"}
                        </td>
                        <td className="border-b border-gray-300 px-3 py-2">
                          {h.customerName ?? "-"}
                        </td>
                        <td className="border-b border-gray-300 px-3 py-2">
                          {Array.from({ length: 3 }).map((_, i) =>
                            i < h.favoriteCount ? (
                              <StarSolid
                                key={i}
                                className="w-6 h-6 text-gray-500 inline"
                              />
                            ) : (
                              <StarOutline
                                key={i}
                                className="w-6 h-6 text-gray-600 inline"
                              />
                            )
                          )}
                        </td>
                      </>
                    )}

                    <td className="border-b border-gray-300 px-3 py-2 flex justify-center gap-2">
                      <button
                        className="bg-gray-300 hover:bg-gray-400 px-3 py-1 rounded text-sm"
                        onClick={() => setSelectedHistory(h)}
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
              } of ${sortedHistories.length} results`}</span>
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
