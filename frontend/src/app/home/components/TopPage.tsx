"use client";

import React from "react";
import { LoginResponse } from "@/hooks/userContext";
import CompanyManagementPage from "./CompanyManagementPage";
import UserManagementPage from "./UserManagementPage";
import { UserRole } from "@/constants/roles";

interface CompanyManagementProps {
  user: LoginResponse;
  setActiveTab: (tab: string) => void;
}

const TopPage: React.FC<CompanyManagementProps> = ({ user, setActiveTab }) => {
  return user?.role === UserRole.COMPANY_ADMIN ? (
    <UserManagementPage />
  ) : (
    <CompanyManagementPage
      user={user}
      setActiveTab={setActiveTab}
      topFl={true}
    />
  );
};

export default TopPage;
