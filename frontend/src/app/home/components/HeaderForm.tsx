// components/Header.tsx
"use client";

import React from "react";
import { UserRole, UserRoleLabel } from "@/constants/roles";
import { LoginResponse } from "@/hooks/userContext";

interface MenuItem {
  titleLabel?: string;
  label: string;
  roles: UserRole[];
}

interface HeaderProps {
  user: LoginResponse;
  loading: boolean;
  logout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Header: React.FC<HeaderProps> = ({
  user,
  loading,
  logout,
  activeTab,
  setActiveTab,
}) => {
  const menuItems: MenuItem[] = [
    {
      titleLabel: "🏠 間取り生成システム",
      label: "間取り生成",
      roles: [UserRole.MEMBER],
    },
    {
      titleLabel: "📋 対応履歴管理",
      label: "対応履歴",
      roles: [UserRole.MEMBER, UserRole.COMPANY_ADMIN, UserRole.SYSTEM_ADMIN],
    },
    {
      titleLabel: "⭐ お気に入り",
      label: "⭐ お気に入り",
      roles: [UserRole.MEMBER],
    },
    { label: "マイページ", roles: [UserRole.MEMBER] },
    {
      titleLabel: "👥 ユーザー管理",
      label: "ユーザー管理",
      roles: [UserRole.COMPANY_ADMIN],
    },
    {
      titleLabel: "👥 会社管理",
      label: "会社管理",
      roles: [UserRole.SYSTEM_ADMIN],
    },
  ];

  if (loading) return <p>ロード中...</p>;
  if (!user) return null;

  const currentRole = user.role as UserRole;

  const activeTitle =
    menuItems.find((item) => item.label === activeTab)?.titleLabel || activeTab;

  return (
    <header className="flex items-center justify-between bg-[#3C4858] text-white px-6 py-4 rounded-lg text-lg">
      <div className="flex items-center space-x-2">
        <h1 className="text-lg font-bold">{activeTitle}</h1>
      </div>

      <nav className="absolute left-[35%] flex items-center space-x-4">
        {menuItems
          .filter((item) => item.roles.includes(currentRole))
          .map((item) => (
            <button
              key={item.label}
              onClick={() => setActiveTab(item.label)}
              className={`px-4 py-1 rounded ${
                activeTab === item.label
                  ? "bg-gray-500 text-white"
                  : "bg-gray-600 hover:bg-gray-500"
              }`}
            >
              {item.label}
            </button>
          ))}
      </nav>

      <div className="flex items-center space-x-4">
        <p className="text-lg">
          {`${UserRoleLabel[currentRole]} : ${user.name}`}
        </p>
        <button
          onClick={logout}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-2 py-1 text-sm rounded"
        >
          ログアウト
        </button>
      </div>
    </header>
  );
};

export default Header;
