"use client";

import React, { useState, useEffect } from "react";
import HistoryPage from "./components/HistoryPage";
import { useUser } from "@/hooks/userContext";
import { UserRole } from "@/constants/roles";
import Header from "./components/HeaderForm";
import { useRouter } from "next/navigation";
import CompanyManagementPage from "./components/CompanyManagementPage";
import UserManagementPage from "./components/UserManagementPage";

const Home: React.FC = () => {
  const { user, loading, logout } = useUser();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<string>("");

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else {
        switch (user.role) {
          case UserRole.SYSTEM_ADMIN:
            setActiveTab("会社管理");
            break;
          case UserRole.COMPANY_ADMIN:
            setActiveTab("ユーザー管理");
            break;
          default:
            setActiveTab("間取り生成");
        }
      }
    }
  }, [user, loading, router]);

  if (loading || !user) return <p>ロード中...</p>;

  const componentMap: Record<string, React.ReactNode> = {
    対応履歴: <HistoryPage />,
    会社管理: <CompanyManagementPage />,
    ユーザー管理: <UserManagementPage user={user} />,
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
      <main className="bg-white rounded-lg p-10 m-4">
        {componentMap[activeTab] || <p>コンテンツがありません</p>}
      </main>
    </div>
  );
};

export default Home;
