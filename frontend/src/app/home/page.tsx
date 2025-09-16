"use client";

import React, { useState, useEffect } from "react";
import UserManagementPage from "./components/UserManagementPage";
import MadoriPage from "./components/MadoriPage";
import HistoryPage from "./components/HistoryPage";
import FavoritePage from "./components/FavoritePage";
import MyPage from "./components/MyPage";
import { useUser } from "@/hooks/userContext";
import { UserRole } from "@/constants/roles";
import Header from "./components/HeaderForm";
import { useRouter } from "next/navigation";
import TopPage from "./components/TopPage";
import CompanyManagementPage from "./components/CompanyManagementPage";

const Home: React.FC = () => {
  const { user, loading, logout } = useUser();
  const router = useRouter();

  const defaultTab = user?.role === UserRole.MEMBER ? "間取り生成" : "トップ";

  const [activeTab, setActiveTab] = useState<string>(defaultTab || "");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) return <p>ロード中...</p>;

  const componentMap: Record<string, React.ReactNode> = {
    トップ: <TopPage user={user} setActiveTab={setActiveTab} />,
    対応履歴: <HistoryPage />,
    ユーザー管理:
      user?.role === UserRole.COMPANY_ADMIN ? (
        <UserManagementPage />
      ) : (
        <CompanyManagementPage
          user={user}
          setActiveTab={setActiveTab}
          topFl={false}
        />
      ),
    間取り生成: <MadoriPage />,
    "⭐ お気に入り": <FavoritePage />,
    マイページ: <MyPage />,
  };

  return (
    <div className="w-full mx-auto bg-gray-200">
      <Header
        user={user}
        loading={loading}
        logout={logout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <main className="bg-white rounded-lg p-6 m-5">
        {componentMap[activeTab] || <p>コンテンツがありません</p>}
      </main>
    </div>
  );
};

export default Home;
