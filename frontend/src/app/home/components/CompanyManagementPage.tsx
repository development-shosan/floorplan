"use client";

import React, { useState } from "react";

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

const CompanyManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [formUser, setFormUser] = useState<Omit<User, "id" | "lastLogin">>({
    companyName: "",
    name: "",
    email: "",
    role: "",
    registeredAt: "",
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
      role: "",
      registeredAt: "",
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
      role: user.role,
      registeredAt: user.registeredAt,
      status: user.status,
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
            className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
            検索
          </button>
        </div>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => setIsModalOpen(true)}
        >
          新規ユーザー登録
        </button>
      </div>

      <p className="mb-2 font-medium">
        登録ユーザー数: {filteredUsers.length}名
      </p>

      <div className="overflow-x-auto">
        <table className="min-w-full text-center border-collapse">
          <thead className="bg-gray-100">
            <tr>
              {[
                "ID",
                "氏名",
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
                    className={`px-2 py-1 rounded text-white font-medium ${
                      user.status === "有効" ? "bg-green-500" : "bg-red-500"
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
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
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

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.2)] border border-white/60 backdrop-blur-sm w-[420px] transform transition-all duration-300 animate-[fadeInUp_0.3s_ease-out]">
            <h2 className="text-xl font-semibold mb-6">
              {editingUser ? "ユーザー編集" : "新規ユーザー登録"}
            </h2>

            <div className="flex flex-col gap-4">
              {/* 氏名 */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  氏名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="例: 田中太郎"
                  value={formUser.name}
                  onChange={(e) =>
                    setFormUser({ ...formUser, name: e.target.value })
                  }
                  className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              {/* メールアドレス */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  メールアドレス <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="例: tanaka@company.co.jp"
                  value={formUser.email}
                  onChange={(e) =>
                    setFormUser({ ...formUser, email: e.target.value })
                  }
                  className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              {/* 初期パスワード */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  初期パスワード <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  placeholder="8文字以上の英数字"
                  className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <p className="text-xs text-gray-500 mt-1">
                  ※ 初回ログイン時に変更を促します
                </p>
              </div>

              {/* 権限 */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  権限 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formUser.role}
                  onChange={(e) =>
                    setFormUser({ ...formUser, role: e.target.value })
                  }
                  className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">選択してください</option>
                  <option value="営業担当者">営業担当者</option>
                  <option value="管理者">管理者</option>
                </select>
              </div>

              {/* 部署 */}
              <div>
                <label className="block text-sm font-medium mb-1">部署</label>
                <input
                  type="text"
                  placeholder="例: 営業一課"
                  className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              {/* 電話番号 */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  電話番号
                </label>
                <input
                  type="tel"
                  placeholder="例: 03-1234-5678"
                  className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded"
                onClick={editingUser ? handleUpdateUser : handleAddUser}
              >
                登録する
              </button>
              <button
                className="bg-gray-200 hover:bg-gray-300 px-5 py-2 rounded"
                onClick={resetForm}
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyManagementPage;
