"use client";

import React, { useEffect, useState } from "react";
import Pagination from "./common/Pagination";
import { Company, CompanyFormData } from "@/constants/company";
import CompanyForm from "./CompanyForm";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/16/solid";
import {
  createCompany,
  deleteCompany,
  getCompanyList,
  updateCompany,
} from "@/lib/api";
import { redirect } from "next/navigation";

const CompanyManagementPage = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [formCompany, setFormCompany] = useState<CompanyFormData>({
    name: "",
    nameKana: "",
    representative: "",
    email: "",
    postalCode: "",
    prefecture: "",
    city: "",
    streetAddress: "",
    status: true,
  });
  const [loading, setLoading] = useState(true);

  const [sortConfig, setSortConfig] = useState<{
    key: keyof Company;
    direction: "asc" | "desc";
  } | null>({
    key: "id",
    direction: "asc",
  });

  //会社情報一覧API
  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await getCompanyList();
      const data: Company[] = response.companies;
      setCompanies(data);
    } catch (error) {
      console.error(error);
      alert("会社一覧の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  // 新規会社登録
  const handleAddCompany = async () => {
    try {
      // 同じ会社が存在するか確認
      const exists = companies.some(
        (c) => c.name.trim() === formCompany.name.trim()
      );

      if (exists) {
        alert("同じ会社名が既に登録されています。");
        return;
      }

      setLoading(true);

      const newCompany: CompanyFormData = {
        name: formCompany.name,
        nameKana: formCompany.nameKana,
        representative: formCompany.representative,
        email: formCompany.email,
        postalCode: formCompany.postalCode,
        prefecture: formCompany.prefecture,
        city: formCompany.city,
        streetAddress: formCompany.streetAddress,
        status: true,
      };
      // 会社情報登録API
      await createCompany(newCompany);
      // 会社一覧取得
      await fetchCompanies();
      resetForm();
      alert("会社を登録しました");
    } catch (error) {
      console.error(error);
      alert("会社の登録に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  // 会社情報編集
  const handleUpdateCompany = async () => {
    if (!editingCompany) return;

    try {
      // 同じ会社が存在するか確認
      const exists = companies.some(
        (c) =>
          c.id !== editingCompany.id &&
          c.name.trim() === formCompany.name.trim()
      );

      if (exists) {
        alert("同じ会社名が既に登録されています。");
        return;
      }

      setLoading(true);

      const updatedCompany: CompanyFormData = {
        id: formCompany.id,
        name: formCompany.name,
        nameKana: formCompany.nameKana,
        representative: formCompany.representative,
        email: formCompany.email,
        postalCode: formCompany.postalCode,
        prefecture: formCompany.prefecture,
        city: formCompany.city,
        streetAddress: formCompany.streetAddress,
        status: formCompany.status,
      };
      // 会社情報編集API
      await updateCompany(updatedCompany);
      // 会社一覧取得
      await fetchCompanies();
      resetForm();
      alert("会社を編集しました");
    } catch (error) {
      console.error(error);
      alert("会社の編集に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormCompany({
      name: "",
      nameKana: "",
      representative: "",
      email: "",
      postalCode: "",
      prefecture: "",
      city: "",
      streetAddress: "",
      status: true,
    });
    setEditingCompany(null);
    setIsFormOpen(false);
  };

  // 編集ボタン
  const handleEditClick = (company: Company) => {
    setEditingCompany(company);
    setFormCompany({
      id: company.id,
      name: company.name,
      nameKana: company.nameKana,
      representative: company.representative,
      email: company.email,
      postalCode: company.postalCode,
      prefecture: company.prefecture,
      city: company.city,
      streetAddress: company.streetAddress,
      status: company.status,
    });
    setIsFormOpen(true);
  };

  // 会社情報削除
  const handleDelete = async () => {
    if (!editingCompany) return;

    try {
      setLoading(true);
      // 会社情報削除API
      await deleteCompany(formCompany);
      // 会社一覧取得
      await fetchCompanies();
      resetForm();
      alert("会社を削除しました");
    } catch (error) {
      console.error(error);
      alert("会社の削除に失敗しました");
    } finally {
      setLoading(false);
      redirect("/home");
    }
  };

  // ソート
  const filteredCompanies = companies.filter(
    (company) =>
      company.name.includes(search) || company.representative.includes(search)
  );

  const sortedCompanies = React.useMemo(() => {
    const sortableCompanies = [...filteredCompanies];
    if (sortConfig !== null) {
      sortableCompanies.sort((a, b) => {
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

        if (typeof aValue === "boolean" && typeof bValue === "boolean") {
          return sortConfig.direction === "asc"
            ? Number(aValue) - Number(bValue)
            : Number(bValue) - Number(aValue);
        }

        return 0;
      });
    }
    return sortableCompanies;
  }, [filteredCompanies, sortConfig]);

  const handleSort = (key: keyof Company) => {
    if (sortConfig && sortConfig.key === key) {
      setSortConfig({
        key,
        direction: sortConfig.direction === "asc" ? "desc" : "asc",
      });
    } else {
      setSortConfig({ key, direction: "desc" });
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(sortedCompanies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCompanies = sortedCompanies.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div>
      {loading ? (
        <p>{"ロード中..."}</p>
      ) : isFormOpen ? (
        <CompanyForm
          formCompany={formCompany}
          setFormCompany={setFormCompany}
          editingCompany={editingCompany}
          onCancel={() => {
            resetForm();
            setIsFormOpen(false);
          }}
          onSubmit={editingCompany ? handleUpdateCompany : handleAddCompany}
          handleDelete={handleDelete}
          loading={loading}
        />
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl mb-4">{"登録会社管理"}</h1>
            <button
              className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded mr-4"
              onClick={() => setIsFormOpen(true)}
            >
              <span className="text-white font-bold mr-2">{"＋"}</span>
              {"新規会社登録"}
            </button>
          </div>
          <div className="flex items-center gap-2 w-full mt-5 border border-gray-300 rounded px-3 py-2 focus-within:ring-2 focus-within:ring-blue-400">
            <MagnifyingGlassIcon className="w-6 h-6 text-gray-500" />
            <input
              type="text"
              placeholder="会社を検索..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 outline-none"
            />
          </div>

          {filteredCompanies.length === 0 ? (
            <p className="text-gray-500 text-center mt-10">
              {"会社が見つかりません"}
            </p>
          ) : (
            <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-45vh)] mt-10">
              <table className="min-w-full text-center border-collapse">
                <thead className="bg-gray-100">
                  <tr>
                    {[
                      { label: "ID", key: "id" },
                      { label: "会社名", key: "name" },
                      { label: "管理者名", key: "representative" },
                      { label: "ユーザー数", key: "members" },
                      { label: "登録日", key: "createdAt" },
                      { label: "操作", key: "" },
                    ].map((th) => (
                      <th
                        key={th.label}
                        className="border-b border-gray-300 px-3 py-2 font-medium cursor-pointer select-none"
                        onClick={() =>
                          th.key && handleSort(th.key as keyof Company)
                        }
                      >
                        <div className="flex items-center justify-center">
                          <span className="mr-2">{th.label}</span>
                          {th.key ? (
                            sortConfig?.key === th.key ? (
                              sortConfig.direction === "asc" ? (
                                <ChevronUpIcon className="w-4 h-4 text-gray-500" />
                              ) : (
                                <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                              )
                            ) : (
                              <ChevronUpIcon className="w-4 h-4 text-gray-500" />
                            )
                          ) : null}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedCompanies.map((company) => (
                    <tr key={company.id} className="hover:bg-gray-50">
                      <td className="border-b border-gray-300 px-3 py-2">
                        {String(company.id).padStart(3, "0")}
                      </td>
                      <td className="border-b border-gray-300 px-3 py-2">
                        {company.name}
                      </td>
                      <td className="border-b border-gray-300 px-3 py-2">
                        {company.representative}
                      </td>
                      <td className="border-b border-gray-300 px-3 py-2">
                        {company.members}
                      </td>
                      <td className="border-b border-gray-300 px-3 py-2">
                        {company.createdAt}
                      </td>
                      <td className="border-b border-gray-300 px-3 py-2 flex justify-center gap-2">
                        <button
                          className="bg-gray-300 hover:bg-gray-400 px-3 py-1 rounded text-sm"
                          onClick={() => handleEditClick(company)}
                        >
                          {"編集"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
                <span>
                  {`Showing ${startIndex + 1} to ${
                    startIndex + paginatedCompanies.length
                  } of ${sortedCompanies.length} results`}
                </span>
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CompanyManagementPage;
