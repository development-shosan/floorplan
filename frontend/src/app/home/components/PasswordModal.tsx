"use client";

import { changePassword } from "@/lib/api";
import React, { useState } from "react";

interface PasswordModalProps {
  id: number;
  isOpen: boolean;
  onClose: () => void;
}

const PasswordModal: React.FC<PasswordModalProps> = ({
  id,
  isOpen,
  onClose,
}) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const validatePassword = () => {
    const newErrors: { [key: string]: string } = {};

    if (!newPassword) {
      newErrors.newPassword = "パスワードを入力してください。";
    } else if (newPassword.length < 8) {
      newErrors.newPassword = "パスワードは8文字以上で入力してください。";
    } else if (!/(?=.*[A-Za-z])(?=.*\d)/.test(newPassword)) {
      newErrors.newPassword = "パスワードは英字と数字を含めてください。";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "確認用パスワードを入力してください。";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "パスワードが一致しません。";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 変更
  const handleSubmit = async () => {
    if (!validatePassword()) return;
    if (loading) return;
    try {
      setLoading(true);
      //ユーザーパスワード変更API
      await changePassword(id, newPassword);

      alert("パスワードを変更しました");
      setNewPassword("");
      setConfirmPassword("");
      setErrors({});
      onClose();
    } catch (err) {
      console.error(err);
      alert("パスワードの変更に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md transform scale-95 transition duration-200 ease-out">
        <h2 className="text-xl font-medium mb-4">パスワード変更</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              新しいパスワード
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              disabled={loading}
            />
            {errors.newPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>
            )}
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
              disabled={loading}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={() => {
                setNewPassword("");
                setConfirmPassword("");
                setErrors({});
                onClose();
              }}
              className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
              disabled={loading}
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className={`px-4 py-2 rounded ${
                loading
                  ? "bg-gray-300 text-gray-500"
                  : "bg-black text-white hover:bg-gray-800"
              }`}
              disabled={loading}
            >
              {loading ? "変更中..." : "変更"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordModal;
