"use client";

import React, { useState } from "react";
import NewUserModal from "./NewUserModal";
import { UserRole } from "@/constants/roles";
import { LoginResponse } from "@/hooks/userContext";

interface User {
  id: string;
  companyName: string;
  name: string;
  email: string;
  role: string;
  registeredAt: string;
  status: "有効" | "無効";
  lastLogin: string;
}

const initialUsers: User[] = [
  {
    id: "001",
    companyName: "丸亀製麵",
    name: "田中太郎",
    email: "tanaka@company.co.jp",
    role: "営業担当者",
    registeredAt: "2023/04/01",
    status: "有効",
    lastLogin: "2024/01/20 15:30",
  },
  {
    id: "002",
    companyName: "松屋",
    name: "佐藤次郎",
    email: "sato@company.co.jp",
    role: "営業担当者",
    registeredAt: "2023/05/15",
    status: "有効",
    lastLogin: "2024/01/19 10:15",
  },
  {
    id: "003",
    companyName: "マクドナルド",
    name: "鈴木花子",
    email: "suzuki@company.co.jp",
    role: "営業担当者",
    registeredAt: "2023/06/01",
    status: "無効",
    lastLogin: "2024/01/10 14:20",
  },
];

interface CompanyManagementProps {
  user: LoginResponse;
}

const CompanyManagementPage: React.FC<CompanyManagementProps> = ({ user }) => {
  const currentRole = user.role as UserRole;

  const selectRole =
    currentRole === UserRole.COMPANY_ADMIN
      ? "営業担当者"
      : currentRole === UserRole.SYSTEM_ADMIN
      ? "管理者"
      : "";

  const formatDateTime = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}/${mm}/${dd}`;
  };

  const [users, setUsers] = useState<User[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [formUser, setFormUser] = useState<Omit<User, "id" | "lastLogin">>({
    companyName: "",
    name: "",
    email: "",
    role: selectRole,
    registeredAt: formatDateTime(new Date()),
    status: "有効",
  });

  const filteredUsers = users.filter(
    (user) => user.name.includes(search) || user.email.includes(search)
  );

  // 新規登録
  const handleAddUser = () => {
    const nextId = (users.length + 1).toString().padStart(3, "0");
    setUsers([
      ...users,
      {
        id: nextId,
        ...formUser,
        lastLogin: "-",
      },
    ]);
    resetForm();
  };

  // 編集
  const handleUpdateUser = () => {
    if (!editingUser) return;
    setUsers(
      users.map((u) =>
        u.id === editingUser.id
          ? { ...editingUser, ...formUser, lastLogin: u.lastLogin }
          : u
      )
    );
    resetForm();
  };

  // 削除
  const handleDeleteUser = (id: string) => {
    if (confirm("本当に削除しますか？")) {
      setUsers(users.filter((u) => u.id !== id));
    }
  };

  // 初期化
  const resetForm = () => {
    setFormUser({
      companyName: "",
      name: "",
      email: "",
      role: selectRole,
      registeredAt: formatDateTime(new Date()),
      status: "有効",
    });
    setEditingUser(null);
    setIsModalOpen(false);
  };

  // 編集モード
  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setFormUser({
      companyName: user.companyName,
      name: user.name,
      email: user.email,
      role: selectRole,
      registeredAt: formatDateTime(new Date()),
      status: "有効",
    });
    setIsModalOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="名前またはメールアドレスで検索"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 w-96"
          />
          <button className="bg-[#667eea] hover:bg-[#5a6cdb] text-white px-4 py-2 rounded">
            検索
          </button>
        </div>
        <button
          className="bg-[#667eea] hover:bg-[#5a6cdb] text-white px-4 py-2 rounded"
          onClick={() => setIsModalOpen(true)}
        >
          ➕ 新規ユーザー登録
        </button>
      </div>

      <p className="mb-2 font-medium">
        登録ユーザー数: {filteredUsers.length}名
      </p>

      <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-45vh)]">
        <table className="min-w-full text-center border-collapse">
          <thead className="bg-gray-100">
            <tr>
              {[
                "ID",
                "氏名",
                "会社名",
                "メールアドレス",
                "権限",
                "登録日",
                "ステータス",
                "最終ログイン",
                "操作",
              ].map((th) => (
                <th
                  key={th}
                  className="border-b border-gray-300 px-3 py-2 font-medium"
                >
                  {th}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="border-b border-gray-300 px-3 py-2">
                  {user.id}
                </td>
                <td className="border-b border-gray-300 px-3 py-2">
                  {user.name}
                </td>
                <td className="border-b border-gray-300 px-3 py-2">
                  {user.companyName}
                </td>
                <td className="border-b border-gray-300 px-3 py-2">
                  {user.email}
                </td>
                <td className="border-b border-gray-300 px-3 py-2">
                  {user.role}
                </td>
                <td className="border-b border-gray-300 px-3 py-2">
                  {user.registeredAt}
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
                <td className="border-b border-gray-300 px-3 py-2">
                  {user.lastLogin}
                </td>
                <td className="border-b border-gray-300 px-3 py-2 flex justify-center gap-2">
                  <button
                    className="bg-gray-300 hover:bg-gray-400 px-3 py-1 rounded text-sm"
                    onClick={() => handleEditClick(user)}
                  >
                    編集
                  </button>
                  <button
                    className="bg-[#f56565] hover:bg-red-500 text-white px-3 py-1 rounded text-sm"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    削除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <NewUserModal
        isOpen={isModalOpen}
        formUser={formUser}
        setFormUser={setFormUser}
        userRole={currentRole}
        editingUser={!!editingUser}
        onClose={resetForm}
        onSubmit={editingUser ? handleUpdateUser : handleAddUser}
      />
    </div>
  );
};

export default CompanyManagementPage;
