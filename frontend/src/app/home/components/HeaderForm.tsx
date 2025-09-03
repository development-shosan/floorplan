"use client";

import React, { useEffect } from "react";
import { useUser } from "@/hooks/userContext";
import { useRouter } from "next/navigation";
import { UserRole, UserRoleLabel } from "@/constants/roles";

interface MenuItem {
  label: string;
  roles: UserRole[];
}

const Header: React.FC = () => {
  const { user, loading, logout } = useUser();
  const router = useRouter();

  const titles: MenuItem[] = [
    { label: "🏠 間取り生成システム", roles: [UserRole.MEMBER] },
    { label: "👥 ユーザー管理", roles: [UserRole.COMPANY_ADMIN] },
    { label: "👥 会社管理 ", roles: [UserRole.SYSTEM_ADMIN] },
  ];

  const menuItems: MenuItem[] = [
    { label: "間取り生成", roles: [UserRole.MEMBER] },
    {
      label: "対応履歴",
      roles: [UserRole.MEMBER, UserRole.COMPANY_ADMIN, UserRole.SYSTEM_ADMIN],
    },
    { label: "⭐ お気に入り", roles: [UserRole.MEMBER] },
    { label: "マイページ", roles: [UserRole.MEMBER] },
    { label: "ユーザー管理", roles: [UserRole.COMPANY_ADMIN] },
    {
      label: "会社管理",
      roles: [UserRole.SYSTEM_ADMIN],
    },
  ];

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) return <p>ロード中...</p>;
  if (!user) return null;

  const handleLogout = () => {
    logout();
  };

  const currentRole = user.role as UserRole;

  return (
    <header className="flex items-center justify-between bg-[#3C4858] text-white px-6 py-4 rounded-lg text-lg">
      <div className="flex items-center space-x-2">
        {titles
          .filter((item) => item.roles.includes(currentRole))
          .map((item) => (
            <h1 key={item.label} className="text-lg font-bold">
              {item.label}
            </h1>
          ))}
      </div>

      <nav className="flex items-center space-x-4">
        {menuItems
          .filter((item) => item.roles.includes(currentRole))
          .map((item) => (
            <button
              key={item.label}
              className="bg-[#4A5568] hover:bg-[#5a6cdb] px-4 py-1 rounded"
            >
              {item.label}
            </button>
          ))}
      </nav>

      <div className="flex items-center space-x-4">
        <p className="text-lg">
          <span className="font-semibold">
            {`${UserRoleLabel[currentRole]} : ${user.name}`}
          </span>
        </p>
        <button
          onClick={handleLogout}
          className="bg-gray-200 text-gray-800 px-2 py-1 text-sm rounded hover:bg-gray-400"
        >
          ログアウト
        </button>
      </div>
    </header>
  );
};

export default Header;
