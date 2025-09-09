"use client";

import { UserRole } from "@/constants/roles";
import React from "react";

export interface UserForm {
  companyName: string;
  name: string;
  email: string;
  role: string;
  registeredAt: string;
  status: "有効" | "無効";
}

interface NewUserModalProps {
  isOpen: boolean;
  formUser: UserForm;
  setFormUser: React.Dispatch<React.SetStateAction<UserForm>>;
  userRole: UserRole;
  editingUser: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

const NewUserModal: React.FC<NewUserModalProps> = ({
  isOpen,
  formUser,
  setFormUser,
  userRole,
  editingUser,
  onClose,
  onSubmit,
}) => {
  if (!isOpen) return null;

  return (
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

          {/* 会社名 */}
          <div>
            <label className="block text-sm font-medium mb-1">
              会社名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="例: 丸亀製麵"
              value={formUser.companyName}
              onChange={(e) =>
                setFormUser({ ...formUser, companyName: e.target.value })
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

          <div>
            <label className="block text-sm font-medium mb-1">
              権限 <span className="text-red-500">*</span>
            </label>
            <select
              value={
                formUser.role ||
                (userRole === UserRole.SYSTEM_ADMIN
                  ? "管理者"
                  : userRole === UserRole.COMPANY_ADMIN
                  ? "営業担当者"
                  : "")
              }
              className="w-full border border-gray-300 px-2 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
              disabled
            >
              <option value="営業担当者">営業担当者</option>
              <option value="管理者">管理者</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">部署</label>
            <input
              type="text"
              placeholder="例: 営業一課"
              className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">電話番号</label>
            <input
              type="tel"
              placeholder="例: 03-1234-5678"
              className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            className="bg-[#667eea] hover:bg-[#5a6cdb] text-white px-5 py-2 rounded"
            onClick={onSubmit}
          >
            登録する
          </button>
          <button
            className="bg-gray-300 hover:bg-gray-400 px-5 py-2 rounded"
            onClick={onClose}
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewUserModal;
