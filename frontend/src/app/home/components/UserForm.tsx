"use client";

import { Company } from "@/constants/company";
import { UserRole, UserRoleLabel } from "@/constants/roles";
import { User, UserFormData } from "@/constants/user";
import { useUser } from "@/hooks/userContext";
import React, { useEffect, useState } from "react";
import PasswordModal from "./PasswordModal";
import { getCompanyList } from "@/lib/api";

interface UserFormProps {
  formUser: UserFormData;
  setFormUser: React.Dispatch<React.SetStateAction<UserFormData>>;
  editingUser: User | null;
  onCancel: () => void;
  onSubmit: () => void;
  loading: boolean;
  submitError: string;
}

const UserForm: React.FC<UserFormProps> = ({
  formUser,
  setFormUser,
  editingUser,
  onCancel,
  onSubmit,
  loading,
  submitError,
}) => {
  const { user } = useUser();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const fetchCompanies = async () => {
    try {
      const response = await getCompanyList();
      const data: Company[] = response.companies;
      setCompanies(data);
    } catch (error) {
      console.error("会社一覧の取得に失敗しました:", error);
    }
  };

  useEffect(() => {
    if (user?.role === UserRole.SYSTEM_ADMIN && !editingUser) {
      fetchCompanies();
    }
  }, [user?.role, editingUser, companies]);

  // 権限別編集可能
  const isReadOnly = Boolean(
    editingUser &&
      ((user?.role === UserRole.SYSTEM_ADMIN &&
        editingUser.role === UserRole.COMPANY_ADMIN) ||
        (user?.role === UserRole.SYSTEM_ADMIN &&
          editingUser.role === UserRole.MEMBER) ||
        (user?.role === UserRole.COMPANY_ADMIN &&
          editingUser.role !== UserRole.MEMBER))
  );

  // 暗証番号変更制御
  const canChangePassword =
    !editingUser ||
    (user?.role === UserRole.SYSTEM_ADMIN &&
      editingUser.role === UserRole.COMPANY_ADMIN) ||
    !isReadOnly;

  // バリデーションチェック
  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formUser.name.trim()) {
      newErrors.name = "氏名を入力してください。";
    }

    if (user?.role === UserRole.SYSTEM_ADMIN && !editingUser) {
      if (formUser.companyId === 1) {
        newErrors.companyId = "会社を選択してください。";
      }
    }

    if (!formUser.department.trim()) {
      newErrors.department = "部署名を入力してください。";
    }

    if (!formUser.phoneNumber.trim()) {
      newErrors.phoneNumber = "電話番号を入力してください。";
    } else if (!/^0\d{1,4}-\d{1,4}-\d{3,4}$/.test(formUser.phoneNumber)) {
      newErrors.phoneNumber =
        "正しい形式で入力してください。(例: 03-1234-5678)";
    }

    if (!formUser.email.trim()) {
      newErrors.email = "メールアドレスを入力してください。";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formUser.email)) {
      newErrors.email = "正しいメールアドレスを入力してください。";
    }

    if (!editingUser) {
      if (!password) {
        newErrors.password = "パスワードを入力してください。";
      } else if (password.length < 8) {
        newErrors.password = "パスワードは8文字以上で入力してください。";
      } else if (!/(?=.*[A-Za-z])(?=.*\d)/.test(password)) {
        newErrors.password = "パスワードは英字と数字を含めてください。";
      }

      if (!confirmPassword) {
        newErrors.confirmPassword = "確認用パスワードを入力してください。";
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = "パスワードが一致しません。";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit();
  };

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
                  !isReadOnly &&
                  setFormUser({ ...formUser, name: e.target.value })
                }
                readOnly={isReadOnly}
                className={`w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  isReadOnly ? "bg-gray-100" : ""
                }`}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>
          </div>

          {user?.role === UserRole.SYSTEM_ADMIN && !editingUser && (
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">会社名</label>
                <select
                  value={formUser.companyId}
                  onChange={(e) => {
                    if (isReadOnly) return;
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
                  disabled={isReadOnly}
                  className={`w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    isReadOnly ? "bg-gray-100" : ""
                  }`}
                >
                  <option value="">会社を選択</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {`${c.id} : ${c.name}`}
                    </option>
                  ))}
                </select>
                {errors.companyId && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.companyId}
                  </p>
                )}
              </div>
            </div>
          )}

          {editingUser && user?.role === UserRole.SYSTEM_ADMIN && (
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">権限</label>
                <select
                  value={formUser.role}
                  onChange={(e) =>
                    !isReadOnly &&
                    setFormUser({
                      ...formUser,
                      role: e.target.value as
                        | UserRole.MEMBER
                        | UserRole.COMPANY_ADMIN,
                    })
                  }
                  disabled={isReadOnly}
                  className={`w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    isReadOnly ? "bg-gray-100" : ""
                  }`}
                >
                  {Object.values(UserRole)
                    .filter(
                      (role) =>
                        role === UserRole.MEMBER ||
                        role === UserRole.COMPANY_ADMIN
                    )
                    .map((role) => (
                      <option key={role} value={role}>
                        {UserRoleLabel[role]}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">部署名</label>
              <input
                type="text"
                value={formUser.department}
                onChange={(e) =>
                  !isReadOnly &&
                  setFormUser({ ...formUser, department: e.target.value })
                }
                readOnly={isReadOnly}
                className={`w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  isReadOnly ? "bg-gray-100" : ""
                }`}
              />
              {errors.department && (
                <p className="text-red-500 text-sm mt-1">{errors.department}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">電話番号</label>
              <input
                type="text"
                value={formUser.phoneNumber}
                onChange={(e) =>
                  !isReadOnly &&
                  setFormUser({ ...formUser, phoneNumber: e.target.value })
                }
                readOnly={isReadOnly}
                className={`w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  isReadOnly ? "bg-gray-100" : ""
                }`}
              />
              {errors.phoneNumber && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.phoneNumber}
                </p>
              )}
            </div>
          </div>

          {editingUser && (
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  ステータス
                </label>
                <select
                  value={formUser.status ? "true" : "false"}
                  onChange={(e) =>
                    !isReadOnly &&
                    setFormUser({
                      ...formUser,
                      status: e.target.value === "true",
                    })
                  }
                  disabled={isReadOnly}
                  className={`w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    isReadOnly ? "bg-gray-100" : ""
                  }`}
                >
                  <option value="true">有効</option>
                  <option value="false">無効</option>
                </select>
              </div>
            </div>
          )}
        </section>

        {/* アカウント設定 */}
        <section className="space-y-4">
          <h2 className="text-xl font-medium border-b border-gray-300 pb-2">
            アカウント設定
          </h2>

          <div className="grid grid-cols-1 gap-4">
            <div className="flex flex-col md:flex-row md:items-end md:gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">
                  メールアドレス
                </label>
                <input
                  type="text"
                  value={formUser.email}
                  onChange={(e) =>
                    !isReadOnly &&
                    setFormUser({ ...formUser, email: e.target.value })
                  }
                  disabled={!!editingUser || isReadOnly}
                  className={`w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    editingUser || isReadOnly ? "bg-gray-100" : ""
                  }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {editingUser && canChangePassword && (
                <div className="mt-4 md:mt-0">
                  <button
                    type="button"
                    onClick={() => setIsPasswordModalOpen(true)}
                    className={`px-5 py-2 rounded ${
                      canChangePassword
                        ? "bg-gray-800 text-white hover:bg-gray-700"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                    disabled={!canChangePassword}
                  >
                    パスワード変更
                  </button>
                  <PasswordModal
                    id={editingUser.id}
                    isOpen={isPasswordModalOpen}
                    onClose={() => setIsPasswordModalOpen(false)}
                  />
                </div>
              )}
            </div>

            {!editingUser && (
              <>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      パスワード
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setFormUser({ ...formUser, password: e.target.value });
                      }}
                      className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    {errors.password && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.password}
                      </p>
                    )}
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
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

        {/* エラー表示 */}
        {submitError && (
          <div className="mt-8 p-4 bg-[#FDF9F2] border-l-4 border-[#E5933C] rounded-md">
            <p className="flex items-center text-[#B07020] text-[15px]">
              {submitError}
            </p>
          </div>
        )}

        {/* ボタン */}
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onCancel}
            className="px-5 py-2 rounded border border-gray-300 hover:bg-gray-100"
          >
            キャンセル
          </button>
          <button
            onClick={handleSubmit}
            className={`px-5 py-2 rounded ${
              isReadOnly || loading
                ? "bg-gray-300 text-gray-500"
                : "bg-black text-white hover:bg-gray-800"
            }`}
            disabled={isReadOnly || loading}
          >
            {editingUser ? "変更を保存" : "登録する"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserForm;
