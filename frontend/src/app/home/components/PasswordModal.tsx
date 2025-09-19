"use client";

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
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const validate = (
    password: string,
    confirmPassword: string
  ): { password?: string; confirmPassword?: string } => {
    const newErrors: { password?: string; confirmPassword?: string } = {};

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

    return newErrors;
  };

  const handleSubmit = async () => {
    if (loading) return;
    setLoading(true);

    const newErrors: { [key: string]: string } = {};

    if (!currentPassword.trim()) {
      newErrors.currentPassword = "現在のパスワードを入力してください。";
    }

    const passwordErrors = validate(newPassword, confirmPassword);
    if (passwordErrors.password)
      newErrors.newPassword = passwordErrors.password;
    if (passwordErrors.confirmPassword)
      newErrors.confirmPassword = passwordErrors.confirmPassword;

    if (Object.keys(newErrors).length > 0) {
      setLoading(false);
      return;
    }

    try {
      console.log(id, currentPassword, newPassword, confirmPassword);
      //   const res = await fetch(`/api/v1/password/${id}`, {
      //     method: "PATCH",
      //     headers: { "Content-Type": "application/json" },
      //     body: JSON.stringify({
      //       currentPassword,
      //       newPassword,
      //       confirmPassword,
      //     }),
      //   });

      //   if (!res.ok) {
      //     const data = await res.json();
      //     alert(data.message || "パスワード変更に失敗しました。");
      //     setLoading(false);
      //     return;
      //   }

      alert("パスワードを変更しました。");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setErrors({});
      onClose();
    } catch (err) {
      console.error(err);
      alert("サーバーエラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-transparent bg-opacity-20 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md transform scale-95 transition duration-200 ease-out">
        <h2 className="text-xl font-medium mb-4">パスワード変更</h2>

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
              disabled={loading}
            />
            {errors.currentPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.currentPassword}
              </p>
            )}
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
                setCurrentPassword("");
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
              className="px-4 py-2 rounded bg-black text-white hover:bg-gray-800"
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
