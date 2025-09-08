// components/Header.tsx
"use client";

import React from "react";
import { UserRole, UserRoleLabel } from "@/constants/roles";
import { useUser } from "@/hooks/userContext";

interface MenuItem {
  titleLabel?: string;
  label: string;
  roles: UserRole[];
}

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const { user, loading, logout } = useUser();

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
      {/* 타이틀 */}
      <div className="flex items-center space-x-2">
        <h1 className="text-lg font-bold">{activeTitle}</h1>
      </div>

      {/* 메뉴 버튼 */}
      <nav className="flex items-center space-x-4">
        {menuItems
          .filter((item) => item.roles.includes(currentRole))
          .map((item) => (
            <button
              key={item.label}
              onClick={() => setActiveTab(item.label)}
              className={`px-4 py-1 rounded ${
                activeTab === item.label
                  ? "bg-[#5a6cdb] text-white"
                  : "bg-[#4A5568] hover:bg-[#5a6cdb]"
              }`}
            >
              {item.label}
            </button>
          ))}
      </nav>

      {/* 유저 정보 */}
      <div className="flex items-center space-x-4">
        <p className="text-lg font-semibold">
          {`${UserRoleLabel[currentRole]} : ${user.name}`}
        </p>
        <button
          onClick={logout}
          className="bg-gray-200 text-gray-800 px-2 py-1 text-sm rounded hover:bg-gray-400"
        >
          ログアウト
        </button>
      </div>
    </header>
  );
};

export default Header;
