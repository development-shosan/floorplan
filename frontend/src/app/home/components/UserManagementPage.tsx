"use client";

import React, { useEffect, useState } from "react";
import Pagination from "./common/Pagination";
import { User, UserFormData } from "@/constants/user";
import UserForm from "./UserForm";
import { useUser } from "@/hooks/userContext";
import { UserRole, UserRoleLabel } from "@/constants/roles";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/16/solid";
import { createUser, getUserList, updateUser } from "@/lib/api";

const UserManagementPage = () => {
  const { user } = useUser();

  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formUser, setFormUser] = useState<UserFormData>({
    name: "",
    companyId: user?.role === UserRole.COMPANY_ADMIN ? user.companyId : 1,
    companyName: "",
    email: "",
    // システム管理者は会社管理者ユーザーのみ、会社管理者は一般ユーザーのみ登録可能
    role: user?.role === UserRole.SYSTEM_ADMIN ? "COMPANY_ADMIN" : "MEMBER",
    department: "",
    phoneNumber: "",
    status: true,
  });
  const [loading, setLoading] = useState(true);
  const [submitError, setSubmitError] = useState<string>("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof User;
    direction: "asc" | "desc";
  } | null>({
    key: "id",
    direction: "asc",
  });

  //ユーザー情報一覧API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getUserList();
      const data: User[] = response.members;
      setUsers(data);
    } catch (error) {
      console.error("ユーザー一覧の取得に失敗しました:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [user]);

  // 新規ユーザー登録
  const handleAddUser = async () => {
    setSubmitError("");

    try {
      if (user?.role === UserRole.SYSTEM_ADMIN) {
        //システム管理者ログイン時、同じ会社アカウントがあるかを確認
        const exists = users.some((u) => u.companyId === formUser.companyId);

        if (exists) {
          alert("この会社にはすでにユーザーが存在します。");
          return;
        }
      }

      setLoading(true);

      const newUser: UserFormData = {
        name: formUser.name,
        companyId:
          user?.role === UserRole.COMPANY_ADMIN
            ? user.companyId
            : formUser.companyId,
        companyName: formUser.companyName,
        email: formUser.email,
        password: formUser.password,
        role: formUser.role,
        department: formUser.department,
        phoneNumber: formUser.phoneNumber,
        status: true,
      };

      //ユーザー情報登録API
      await createUser(newUser);
      //ユーザー一覧取得
      await fetchUsers();
      resetForm();
      alert("ユーザーを登録しました");
    } catch (error) {
      console.error(error);

      let message: string;

      if (error instanceof Error) {
        message = error.message.includes("(406)")
          ? "メールアドレスは既に存在します"
          : `${error.message}`;
      } else {
        message = "⚠️ エラー: 不明なエラーが発生しました";
      }

      setSubmitError(message);
    } finally {
      setLoading(false);
    }
  };

  // ユーザー情報編集
  const handleUpdateUser = async () => {
    if (!editingUser) return;

    try {
      setLoading(true);

      const updatedUser: UserFormData = {
        id: formUser.id,
        name: formUser.name,
        companyId:
          user?.role === UserRole.COMPANY_ADMIN
            ? user.companyId
            : formUser.companyId,
        companyName: formUser.companyName,
        email: formUser.email,
        password: formUser.password,
        role: formUser.role,
        department: formUser.department,
        phoneNumber: formUser.phoneNumber,
        status: true,
      };

      //ユーザー情報登録API
      await updateUser(updatedUser);
      //ユーザー一覧取得
      await fetchUsers();
      resetForm();
      alert("ユーザーを編集しました");
    } catch (error) {
      console.error(error);
      alert("ユーザーの編集に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormUser({
      name: "",
      companyId: user?.role === UserRole.COMPANY_ADMIN ? user.companyId : 1,
      companyName: "",
      email: "",
      role: user?.role === UserRole.SYSTEM_ADMIN ? "COMPANY_ADMIN" : "MEMBER",
      department: "",
      phoneNumber: "",
      status: true,
    });
    setEditingUser(null);
    setIsFormOpen(false);
  };

  // 編集ボタン
  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setFormUser({
      id: user.id,
      name: user.name,
      companyId: user.companyId,
      companyName: user.companyName,
      email: user.email,
      role: user.role,
      department: user.department,
      phoneNumber: user.phoneNumber,
      status: user.status,
    });
    setIsFormOpen(true);
  };

  // ソート
  const filteredUsers = users.filter(
    (u) => u.name.includes(search) || u.email.includes(search)
  );

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

        if (typeof aValue === "boolean" && typeof bValue === "boolean") {
          return sortConfig.direction === "asc"
            ? Number(aValue) - Number(bValue)
            : Number(bValue) - Number(aValue);
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
      ) : isFormOpen ? (
        <UserForm
          formUser={formUser}
          setFormUser={setFormUser}
          editingUser={editingUser}
          onCancel={() => {
            resetForm();
            setIsFormOpen(false);
          }}
          onSubmit={editingUser ? handleUpdateUser : handleAddUser}
          loading={loading}
          submitError={submitError}
        />
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl mb-4">{"登録ユーザー管理"}</h1>
            <button
              className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded mr-4"
              onClick={() => setIsFormOpen(true)}
            >
              <span className="text-white font-bold mr-2">{"＋"}</span>
              {"新規ユーザー登録"}
            </button>
          </div>
          <div className="flex items-center gap-2 w-full mt-5 border border-gray-300 rounded px-3 py-2 focus-within:ring-2 focus-within:ring-blue-400">
            <MagnifyingGlassIcon className="w-6 h-6 text-gray-500" />
            <input
              type="text"
              placeholder="ユーザーを検索..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 outline-none"
            />
          </div>

          {filteredUsers.length === 0 ? (
            <p className="text-gray-500 text-center mt-10">
              {"ユーザーが見つかりません"}
            </p>
          ) : (
            <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-45vh)] mt-10">
              <table className="min-w-full text-center border-collapse">
                <thead className="bg-gray-100">
                  <tr>
                    {[
                      { label: "ID", key: "id" },
                      { label: "氏名", key: "name" },
                      { label: "メールアドレス", key: "email" },
                      {
                        label:
                          user?.role === UserRole.COMPANY_ADMIN
                            ? "部署名"
                            : "会社名",
                        key:
                          user?.role === UserRole.COMPANY_ADMIN
                            ? "department"
                            : "companyName",
                      },
                      { label: "権限", key: "role" },
                      { label: "登録日", key: "createdAt" },
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
                  {paginatedUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="border-b border-gray-300 px-3 py-2">
                        {String(u.id).padStart(3, "0")}
                      </td>
                      <td className="border-b border-gray-300 px-3 py-2">
                        {u.name}
                      </td>
                      <td className="border-b border-gray-300 px-3 py-2">
                        {u.email}
                      </td>
                      <td className="border-b border-gray-300 px-3 py-2">
                        {user?.role === UserRole.COMPANY_ADMIN
                          ? u.department
                          : u.companyName}
                      </td>
                      <td className="border-b border-gray-300 px-3 py-2">
                        {UserRoleLabel[u.role as UserRole]}
                      </td>
                      <td className="border-b border-gray-300 px-3 py-2">
                        {u.createdAt}
                      </td>
                      <td className="border-b border-gray-300 px-3 py-2 flex justify-center gap-2">
                        <button
                          className="bg-gray-300 hover:bg-gray-400 px-3 py-1 rounded text-sm"
                          onClick={() => handleEditClick(u)}
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
                    startIndex + paginatedUsers.length
                  } of ${sortedUsers.length} results`}
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

export default UserManagementPage;
