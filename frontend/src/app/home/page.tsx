"use client";

import React, { useState, useEffect } from "react";
import HistoryPage from "./components/HistoryPage";
import { useUser } from "@/hooks/userContext";
import Header from "./components/HeaderForm";
import { useRouter } from "next/navigation";
import CompanyManagementPage from "./components/CompanyManagementPage";
import UserManagementPage from "./components/UserManagementPage";
import ContactPage from "./components/ContactPage";
import MadoriPage from "./components/MadoriPage";

const Home: React.FC = () => {
  const { user, loading, logout } = useUser();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<string>("対応履歴");
  const [resetSignal, setResetSignal] = useState(0);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === "MEMBER") {
      setActiveTab("間取り生成");
    }
  }, [user]);

  if (loading || !user) return <p>ロード中...</p>;

  const handleTabChange = (tab: string) => {
    if (tab === activeTab) {
      setResetSignal((prev) => prev + 1);
    } else {
      setActiveTab(tab);
    }
  };

  const componentMap: Record<string, React.ReactNode> = {
    間取り生成: <MadoriPage setActiveTab={handleTabChange} resetSignal={resetSignal} />,
    対応履歴: (
      <HistoryPage resetSignal={resetSignal} setActiveTab={handleTabChange} />
    ),
    会社管理: <CompanyManagementPage resetSignal={resetSignal} />,
    ユーザー管理: <UserManagementPage resetSignal={resetSignal} />,
    お問い合わせ: <ContactPage />,
  };

  return (
    <div className="w-full mx-auto bg-gray-200">
      <Header
        user={user}
        loading={loading}
        logout={logout}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onTabReset={() => setResetSignal((prev) => prev + 1)}
      />
      <main className="bg-white rounded-lg p-10 m-4">
        {componentMap[activeTab] || <p>コンテンツがありません</p>}
      </main>
    </div>
  );
};

export default Home;
