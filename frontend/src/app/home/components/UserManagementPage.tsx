"use client";

import React, { useEffect, useState } from "react";
import Pagination from "./common/Pagination";
import { dummyUsers, User, UserFormData } from "@/constants/user";
import UserForm from "./UserForm";
import { useUser } from "@/hooks/userContext";
import { UserRole } from "@/constants/roles";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/16/solid";

const UserManagementPage = () => {
  const { user } = useUser();

  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formUser, setFormUser] = useState<UserFormData>({
    name: "",
    companyId: user?.role === UserRole.COMPANY_ADMIN ? user.companyId : 0,
    companyName: "",
    email: "",
    // システム管理者は会社管理者ユーザーのみ、会社管理者は一般ユーザーのみ登録可能
    role: user?.role === UserRole.SYSTEM_ADMIN ? "COMPANY_ADMIN" : "MEMBER",
    department: "",
    phoneNumber: "",
    status: true,
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
        console.log(user);
        //ユーザー一覧API
        setUsers(dummyUsers);
      } catch (error) {
        console.error("ユーザー一覧の取得に失敗しました:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleAddUser = async () => {
    try {
      if (user?.role === UserRole.SYSTEM_ADMIN) {
        //システム管理者ログイン時、同じ会社アカウントがあるかを確認
        const exists = users.some((u) => u.companyId === formUser.companyId);

        if (exists) {
          alert("この会社にはすでにユーザーが存在します。");
          return;
        }
      }

      const newUser: User = {
        id: users.length + 1,
        name: formUser.name,
        email: formUser.email,
        role: formUser.role,
        companyId:
          user?.role === UserRole.COMPANY_ADMIN
            ? user.companyId
            : formUser.companyId,
        companyName: formUser.companyName,
        department: formUser.department,
        phoneNumber: formUser.phoneNumber,
        createdAt: new Date().toISOString().split("T")[0],
        status: true,
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
      const updatedUser = users.map((val) =>
        val.id === editingUser.id
          ? {
              ...val,
              name: formUser.name,
              companyId:
                user?.role === UserRole.COMPANY_ADMIN
                  ? user.companyId
                  : formUser.companyId,
              companyName: formUser.companyName,
              email: formUser.email,
              role: formUser.role,
              department: formUser.department,
              phoneNumber: formUser.phoneNumber,
              status: formUser.status,
            }
          : val
      );
      setUsers(updatedUser);
      resetForm();
      alert("ユーザーを編集しました");
    } catch (error) {
      console.error(error);
      alert("ユーザーの編集に失敗しました");
    }
  };

  const resetForm = () => {
    setFormUser({
      name: "",
      companyId: user?.role === UserRole.COMPANY_ADMIN ? user.companyId : 0,
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

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setFormUser({
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

  const filteredUsers = users
    .filter((u) => {
      // サーバーから除外されますが念のために
      if (user?.role === UserRole.COMPANY_ADMIN) {
        return u.companyId === user.companyId && u.status;
      }
      return true;
    })
    .filter(
      (u) =>
        String(u.id).includes(search) ||
        u.name.includes(search) ||
        u.email.includes(search)
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
                      { label: "会社名", key: "companyName" },
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
                  {paginatedUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="border-b border-gray-300 px-3 py-2">
                        {String(user.id).padStart(3, "0")}
                      </td>
                      <td className="border-b border-gray-300 px-3 py-2">
                        {user.name}
                      </td>
                      <td className="border-b border-gray-300 px-3 py-2">
                        {user.email}
                      </td>
                      <td className="border-b border-gray-300 px-3 py-2">
                        {user.companyName}
                      </td>
                      <td className="border-b border-gray-300 px-3 py-2">
                        {user.role}
                      </td>
                      <td className="border-b border-gray-300 px-3 py-2">
                        {user.createdAt}
                      </td>
                      <td className="border-b border-gray-300 px-3 py-2 flex justify-center gap-2">
                        <button
                          className="bg-gray-300 hover:bg-gray-400 px-3 py-1 rounded text-sm"
                          onClick={() => handleEditClick(user)}
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
