"use client";

import React, { useState, useEffect } from "react";
import CompanyManagementPage from "./components/CompanyManagementPage";
import UserManagementPage from "./components/UserManagementPage";
import MadoriPage from "./components/MadoriPage";
import HistoryPage from "./components/HistoryPage";
import FavoritePage from "./components/FavoritePage";
import MyPage from "./components/MyPage";
import { useUser } from "@/hooks/userContext";
import { UserRole } from "@/constants/roles";
import Header from "./components/HeaderForm";
import { useRouter } from "next/navigation";

const Home: React.FC = () => {
  const { user, loading, logout } = useUser();
  const router = useRouter();

  const defaultTab =
    user?.role === UserRole.MEMBER
      ? "間取り生成"
      : user?.role === UserRole.COMPANY_ADMIN
      ? "ユーザー管理"
      : "会社管理";

  const [activeTab, setActiveTab] = useState<string>(defaultTab || "");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) return <p>ロード中...</p>;

  const componentMap: Record<string, React.ReactNode> = {
    間取り生成: <MadoriPage />,
    対応履歴: <HistoryPage />,
    "⭐ お気に入り": <FavoritePage />,
    マイページ: <MyPage />,
    ユーザー管理: <UserManagementPage />,
    会社管理: <CompanyManagementPage user={user} />,
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto rounded-lg bg-gray-50 shadow-sm px-5 py-6 border-2 border-dashed border-gray-300 h-[calc(100vh-10vh)]">
      <Header
        user={user}
        loading={loading}
        logout={logout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className="mt-6">
        {componentMap[activeTab] || <p>コンテンツがありません</p>}
      </main>
    </div>
  );
};

export default Home;
