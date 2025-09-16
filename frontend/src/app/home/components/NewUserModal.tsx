"use client";

import { UserRole } from "@/constants/roles";
import React from "react";
import { Company, CreateUser } from "./CompanyManagementPage";

interface NewUserModalProps {
  isOpen: boolean;
  formUser: CreateUser;
  companies: Company[];
  setFormUser: React.Dispatch<React.SetStateAction<CreateUser>>;
  userRole: UserRole;
  editingUser: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

const NewUserModal: React.FC<NewUserModalProps> = ({
  isOpen,
  formUser,
  companies,
  setFormUser,
  userRole,
  editingUser,
  onClose,
  onSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/30"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-[90vw] sm:w-[80vw] md:w-[60vw] lg:w-[420px] max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold p-5">
          {editingUser ? "ユーザー編集" : "新規ユーザー登録"}
        </h2>

        <div className="px-6 overflow-y-auto flex-1">
          <div className="flex flex-col gap-4">
            {/* 氏名 */}
            <div>
              <label className="block text-sm font-medium mb-1">
                {"氏名"} <span className="text-red-500">*</span>
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
                {"メールアドレス"} <span className="text-red-500">*</span>
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

            {/* パスワード */}
            <div>
              <label className="block text-sm font-medium mb-1">
                {editingUser ? "パスワード" : "初期パスワード"}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                placeholder="8文字以上の英数字"
                className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              {!editingUser && (
                <p className="text-xs text-gray-500 mt-1">
                  {"※ 初回ログイン時に変更を促します"}
                </p>
              )}
            </div>

            {/* パスワード確認 */}
            <div>
              <label className="block text-sm font-medium mb-1">
                {"パスワード確認"}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                placeholder="8文字以上の英数字"
                className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* 権限 */}
            <div>
              <label className="block text-sm font-medium mb-1">
                {"権限"} <span className="text-red-500">*</span>
              </label>
              <div className="w-full border border-gray-300 px-3 py-2 rounded bg-gray-100 text-gray-700">
                {formUser.role ||
                  (userRole === UserRole.SYSTEM_ADMIN
                    ? "管理者"
                    : userRole === UserRole.COMPANY_ADMIN
                    ? "営業担当者"
                    : "")}
              </div>
            </div>

            {/* 会社 */}
            <div>
              <label className="block text-sm font-medium mb-1">
                {"会社"} <span className="text-red-500">*</span>
              </label>
              <select
                value={formUser.companyId}
                onChange={(e) =>
                  setFormUser({
                    ...formUser,
                    companyId: Number(e.target.value),
                  })
                }
                className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
              >
                <option value="">{"会社を選択してください"}</option>
                {companies.map((company: Company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 部署 */}
            <div>
              <label className="block text-sm font-medium mb-1">
                {"部署"} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="例: 営業一課"
                value={formUser.department}
                onChange={(e) =>
                  setFormUser({ ...formUser, department: e.target.value })
                }
                className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* 電話番号 */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">
                {"電話番号"} <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                placeholder="例: 03-1234-5678"
                value={formUser.phoneNumber}
                onChange={(e) =>
                  setFormUser({ ...formUser, phoneNumber: e.target.value })
                }
                className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 pt-4 border-gray-200">
          <button
            className="bg-black hover:bg-gray-800 text-white px-5 py-2 rounded"
            onClick={onSubmit}
          >
            {editingUser ? "編集する" : "登録する"}
          </button>
          <button
            className="bg-gray-300 hover:bg-gray-400 px-5 py-2 rounded"
            onClick={onClose}
          >
            {"キャンセル"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewUserModal;
