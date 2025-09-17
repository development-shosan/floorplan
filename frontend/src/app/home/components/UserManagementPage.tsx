"use client";

import React, { useEffect, useState } from "react";
import NewUserModal from "./NewUserModal";
import { UserRole } from "@/constants/roles";
import { LoginResponse } from "@/hooks/userContext";
import Pagination from "./common/Pagination";
import { Company } from "@/constants/company";

// Dummy
export interface CreateUser {
  name: string;
  companyId: number;
  email: string;
  password: string;
  role: "営業担当者" | "管理者";
  department: string;
  phoneNumber: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  department: string;
  phoneNumber: string;
  status: "有効" | "無効";
  role: "営業担当者" | "管理者";
  companyId: number;
  createdAt: string;
}

interface UserManagementProps {
  user: LoginResponse;
}

const UserManagementPage: React.FC<UserManagementProps> = ({ user }) => {
  const currentRole = user.role as UserRole;

  const selectRole =
    currentRole === UserRole.COMPANY_ADMIN ? "営業担当者" : "管理者";

  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formUser, setFormUser] = useState<CreateUser>({
    name: "",
    companyId: 0,
    email: "",
    password: "",
    role: selectRole,
    department: "",
    phoneNumber: "",
  });
  const [loading, setLoading] = useState(true);

  const [sortConfig, setSortConfig] = useState<{
    key: keyof User;
    direction: "asc" | "desc";
  } | null>({
    key: "id",
    direction: "asc",
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        // API 호출 가능
      } catch (error) {
        console.error("ユーザー一覧の取得に失敗しました:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchCompanies = async () => {
      try {
        setLoading(true);
        setCompanies([]);
      } catch (error) {
        console.error("会社一覧の取得に失敗しました:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
    fetchCompanies();
  }, []);

  const handleAddUser = async () => {
    try {
      const newUser: User = {
        id: users.length + 1,
        name: formUser.name,
        email: formUser.email,
        department: formUser.department,
        phoneNumber: formUser.phoneNumber,
        role: formUser.role,
        companyId: formUser.companyId,
        status: "有効",
        createdAt: new Date().toISOString().split("T")[0],
      };
      setUsers([...users, newUser]);
      resetForm();
      alert("ユーザーを登録しました");
    } catch (error) {
      console.error(error);
      alert("ユーザーの登録に失敗しました");
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    try {
      const updatedUsers = users.map((u) =>
        u.id === editingUser.id
          ? {
              ...u,
              name: formUser.name,
              email: formUser.email,
              department: formUser.department,
              phoneNumber: formUser.phoneNumber,
              role: formUser.role,
              companyId: formUser.companyId,
            }
          : u
      );
      setUsers(updatedUsers);
      resetForm();
      alert("ユーザーを編集しました");
    } catch (error) {
      console.error(error);
      alert("ユーザーの編集に失敗しました");
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm("本当に削除しますか？")) return;
    try {
      setUsers(users.filter((u) => u.id !== id));
      alert("ユーザーを削除しました");
    } catch (error) {
      console.error(error);
      alert("ユーザーの削除に失敗しました");
    }
  };

  const resetForm = () => {
    setFormUser({
      name: "",
      companyId: 0,
      email: "",
      password: "",
      role: selectRole,
      department: "",
      phoneNumber: "",
    });
    setEditingUser(null);
    setIsModalOpen(false);
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setFormUser({
      name: user.name,
      companyId: user.companyId,
      email: user.email,
      password: "",
      role: user.role,
      department: user.department,
      phoneNumber: user.phoneNumber,
    });
    setIsModalOpen(true);
  };

  const filteredUsers = users.filter(
    (user) => user.name.includes(search) || user.email.includes(search)
  );

  // 정렬
  const sortedUsers = React.useMemo(() => {
    const sortableUsers = [...filteredUsers];
    if (sortConfig !== null) {
      sortableUsers.sort((a, b) => {
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
    return sortableUsers;
  }, [filteredUsers, sortConfig]);

  const handleSort = (key: keyof User) => {
    if (sortConfig && sortConfig.key === key) {
      setSortConfig({
        key,
        direction: sortConfig.direction === "asc" ? "desc" : "asc",
      });
    } else {
      setSortConfig({ key, direction: "desc" });
    }
  };

  // 페이지네이션
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = sortedUsers.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div>
      {loading ? (
        <p>{"ロード中..."}</p>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl mb-4">{"登録ユーザー管理"}</h1>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="名前またはメールアドレスで検索"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 w-96"
              />
            </div>
            <button
              className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded mr-4"
              onClick={() => setIsModalOpen(true)}
            >
              <span className="text-white font-bold mr-2">{"＋"}</span>
              {"新規ユーザー登録"}
            </button>
          </div>
          <p className="mb-2 font-medium">{`登録ユーザー数: ${filteredUsers.length}名`}</p>

          {filteredUsers.length === 0 ? (
            <p className="text-gray-500 text-center mt-10">
              {"ユーザーが見つかりません"}
            </p>
          ) : (
            <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-45vh)]">
              <table className="min-w-full text-center border-collapse">
                <thead className="bg-gray-100">
                  <tr>
                    {[
                      { label: "ID", key: "id" },
                      { label: "氏名", key: "name" },
                      { label: "メールアドレス", key: "email" },
                      { label: "会社名", key: "companyId" },
                      { label: "権限", key: "role" },
                      { label: "登録日", key: "createdAt" },
                      { label: "ステータス", key: "status" },
                      { label: "操作", key: "" },
                    ].map((th) => (
                      <th
                        key={th.label}
                        className="border-b border-gray-300 px-3 py-2 font-medium cursor-pointer select-none"
                        onClick={() =>
                          th.key && handleSort(th.key as keyof User)
                        }
                      >
                        <div className="flex items-center justify-center">
                          <span className="mr-2">{th.label}</span>
                          {th.key
                            ? sortConfig?.key === th.key
                              ? sortConfig.direction === "asc"
                                ? "↑"
                                : "↓"
                              : "↑"
                            : null}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="border-b border-gray-300 px-3 py-2">
                        {user.id}
                      </td>
                      <td className="border-b border-gray-300 px-3 py-2">
                        {user.name}
                      </td>
                      <td className="border-b border-gray-300 px-3 py-2">
                        {user.email}
                      </td>
                      <td className="border-b border-gray-300 px-3 py-2">
                        {companies.find((c) => c.id === user.companyId)?.name ||
                          "-"}
                      </td>
                      <td className="border-b border-gray-300 px-3 py-2">
                        {user.role}
                      </td>
                      <td className="border-b border-gray-300 px-3 py-2">
                        {user.createdAt}
                      </td>
                      <td className="border-b border-gray-300 px-3 py-2">
                        <span
                          className={`px-2 py-1 rounded font-medium ${
                            user.status === "有効"
                              ? "text-[#22543d] bg-[#c6f6d5]"
                              : "text-[#742a2a] bg-[#fed7d7]"
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="border-b border-gray-300 px-3 py-2 flex justify-center gap-2">
                        <button
                          className="bg-gray-300 hover:bg-gray-400 px-3 py-1 rounded text-sm"
                          onClick={() => handleEditClick(user)}
                        >
                          {"編集"}
                        </button>
                        <button
                          className="bg-[#f56565] hover:bg-red-500 text-white px-3 py-1 rounded text-sm"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          {"削除"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}
            </div>
          )}

          <NewUserModal
            isOpen={isModalOpen}
            formUser={formUser}
            setFormUser={setFormUser}
            companies={companies}
            userRole={currentRole}
            editingUser={!!editingUser}
            onClose={resetForm}
            onSubmit={editingUser ? handleUpdateUser : handleAddUser}
          />
        </>
      )}
    </div>
  );
};

export default UserManagementPage;
