"use client";

import React, { useEffect, useRef, useState } from "react";
import { UserRole, UserRoleLabel } from "@/constants/roles";
import { LoginResponse } from "@/hooks/userContext";
import { HomeIcon } from "@heroicons/react/20/solid";

interface MenuItem {
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
  const [menuOpen, setMenuOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const menuItems: MenuItem[] = [
    {
      label: "対応履歴",
      roles: [UserRole.SYSTEM_ADMIN, UserRole.COMPANY_ADMIN, UserRole.MEMBER],
    },
    {
      label: "会社管理",
      roles: [UserRole.SYSTEM_ADMIN],
    },
    {
      label: "ユーザー管理",
      roles: [UserRole.SYSTEM_ADMIN, UserRole.COMPANY_ADMIN],
    },
  ];

  if (loading) return <p>{"ロード中..."}</p>;
  if (!user) return null;

  const currentRole = user.role as UserRole;
  const initials = user.name.charAt(0).toUpperCase();

  return (
    <header
      className={`flex items-center justify-between ${
        currentRole === UserRole.SYSTEM_ADMIN ? "bg-[#ec6361]" : "bg-black"
      } text-white px-6 py-3 relative`}
    >
      <div className="flex items-center space-x-4">
        <h1 className="flex items-center text-xl font-semibold space-x-2">
          <HomeIcon className="w-6 h-6 transform scale-x-120" />
          <span>Plan Butler</span>
        </h1>
        <span className="text-sm text-gray-300">
          {`${UserRoleLabel[currentRole]}用`}
        </span>
      </div>

      <nav className="flex space-x-10">
        {menuItems
          .filter((item) => item.roles.includes(currentRole))
          .map((item) => (
            <button
              key={item.label}
              onClick={() => setActiveTab(item.label)}
              className={`relative text-lg ${
                activeTab === item.label
                  ? "text-white translate-y-[-4px] after:scale-x-100"
                  : "text-gray-300 hover:text-white after:scale-x-0"
              } after:content-[''] after:absolute after:-bottom-1 after:left-0 after:right-0 after:h-[2px] after:bg-white after:origin-left after:transition-transform after:duration-200 cursor-pointer transition-transform duration-200 hover:scale-110 hover:brightness-120`}
            >
              {item.label}
            </button>
          ))}
      </nav>

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          className="flex items-center space-x-2 focus:outline-none cursor-pointer
               transition-transform duration-200 hover:scale-105 hover:brightness-110"
        >
          <div className="w-9 h-9 flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold shadow-md">
            {initials}
          </div>
          <p className="text-sm">{user.name}</p>
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-32 bg-white text-black rounded shadow-lg transition-all duration-200">
            <button
              onClick={logout}
              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 "
            >
              {"ログアウト"}
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
