"use client";

import { Company, dummyCompanies } from "@/constants/company";
import { UserRole } from "@/constants/roles";
import { User, UserFormData } from "@/constants/user";
import { useUser } from "@/hooks/userContext";
import React, { useEffect, useState } from "react";

interface UserFormProps {
  formUser: UserFormData;
  setFormUser: React.Dispatch<React.SetStateAction<UserFormData>>;
  editingUser: User | null;
  onCancel: () => void;
  onSubmit: () => void;
}

const UserForm: React.FC<UserFormProps> = ({
  formUser,
  setFormUser,
  editingUser,
  onCancel,
  onSubmit,
}) => {
  const { user } = useUser();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [password, setPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    // TODO: fetch("/api/companies").then(...)
    setCompanies(dummyCompanies);
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={onCancel} className="text-gray-500 mb-4 hover:underline">
        {"← ユーザー一覧に戻る"}
      </button>

      <h1 className="text-2xl font-semibold mb-2">
        {editingUser ? "ユーザー情報編集" : "新規ユーザー登録"}
      </h1>
      {editingUser && (
        <p className="text-gray-500 mb-6">
          {`${editingUser.name} (ID: ${String(editingUser.id).padStart(
            3,
            "0"
          )}) の情報を編集します。`}
        </p>
      )}

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* 基本情報 */}
        <section className="space-y-4">
          <h2 className="text-xl font-medium border-b border-gray-300 pb-2">
            基本情報
          </h2>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">氏名</label>
              <input
                type="text"
                value={formUser.name}
                onChange={(e) =>
                  setFormUser({ ...formUser, name: e.target.value })
                }
                className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">会社名</label>
              <select
                value={formUser.companyId}
                onChange={(e) => {
                  const selectedId = Number(e.target.value);
                  const selectedCompany = companies.find(
                    (c) => c.id === selectedId
                  );

                  setFormUser({
                    ...formUser,
                    companyId: selectedId,
                    companyName: selectedCompany ? selectedCompany.name : "",
                  });
                }}
                className={`w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  user?.role === UserRole.COMPANY_ADMIN ? "bg-gray-100" : ""
                }`}
                disabled={user?.role === UserRole.COMPANY_ADMIN}
              >
                <option value="">会社を選択</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {`${c.id} : ${c.name}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">部署名</label>
              <input
                type="text"
                value={formUser.department}
                onChange={(e) =>
                  setFormUser({ ...formUser, department: e.target.value })
                }
                className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                ステータス
              </label>
              <select
                value={formUser.status ? "true" : "false"}
                onChange={(e) =>
                  setFormUser({
                    ...formUser,
                    status: e.target.value === "true",
                  })
                }
                className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="true">有効</option>
                <option value="false">無効</option>
              </select>
            </div>
          </div>
        </section>

        {/* アカウント設定 */}
        <section className="space-y-4">
          <h2 className="text-xl font-medium border-b border-gray-300 pb-2">
            アカウント設定
          </h2>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                メールアドレス
              </label>
              <input
                type="text"
                value={formUser.email}
                onChange={(e) =>
                  setFormUser({
                    ...formUser,
                    email: e.target.value,
                  })
                }
                disabled={!!editingUser}
                className={`w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  editingUser ? "bg-gray-100" : ""
                }`}
              />
            </div>
          </div>

          {editingUser ? (
            <section className="mt-6">
              <h2 className="text-xl font-medium mb-2">パスワード変更</h2>
              <div className="bg-white shadow rounded-lg p-6 space-y-4 border border-gray-200">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      現在のパスワード
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      新しいパスワード
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      新しいパスワード（確認）
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        console.log("パスワード変更リクエスト:", {
                          currentPassword,
                          newPassword,
                          confirmPassword,
                        });
                      }}
                      className="px-5 py-2 rounded bg-black text-white hover:bg-gray-800"
                    >
                      変更
                    </button>
                  </div>
                </div>
              </div>
            </section>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    パスワード
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    パスワード（確認）
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </div>
            </>
          )}
        </section>

        {/* ボタン */}
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onCancel}
            className="px-5 py-2 rounded border border-gray-300 hover:bg-gray-100"
          >
            キャンセル
          </button>
          <button
            onClick={onSubmit}
            className="px-5 py-2 rounded bg-black text-white hover:bg-gray-800"
          >
            {editingUser ? "変更を保存" : "登録する"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserForm;
