"use client";

import React, { useState, useEffect } from "react";
import HistoryPage from "./components/HistoryPage";
import { useUser } from "@/hooks/userContext";
import Header from "./components/HeaderForm";
import { useRouter } from "next/navigation";
import CompanyManagementPage from "./components/CompanyManagementPage";
import UserManagementPage from "./components/UserManagementPage";
import ContactPage from "./components/ContactPage";

const Home: React.FC = () => {
  const { user, loading, logout } = useUser();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<string>("対応履歴");

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      }
    }
  }, [user, loading, router]);

  if (loading || !user) return <p>ロード中...</p>;

  const componentMap: Record<string, React.ReactNode> = {
    対応履歴: <HistoryPage />,
    会社管理: <CompanyManagementPage />,
    ユーザー管理: <UserManagementPage />,
    お問い合わせ: <ContactPage />,
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
