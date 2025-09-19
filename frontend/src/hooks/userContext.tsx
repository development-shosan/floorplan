"use client";

import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";

export interface LoginResponse {
  id: number;
  name: string;
  token: string;
  role: "MEMBER" | "COMPANY_ADMIN" | "SYSTEM_ADMIN";
  companyId?: number;
}

interface UserContextProps {
  user: LoginResponse | null;
  loading: boolean;
  setUser: (user: LoginResponse | null) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextProps>({
  user: null,
  loading: true,
  setUser: () => {},
  logout: () => {},
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<LoginResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // ページリフレッシュ時　sessionStorageから復元
  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      setUserState(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const setUser = (userData: LoginResponse | null) => {
    setUserState(userData);
    if (userData) {
      sessionStorage.setItem("user", JSON.stringify(userData));
    } else {
      sessionStorage.removeItem("user");
    }
  };

  const logout = () => setUser(null);

  return (
    <UserContext.Provider value={{ user, loading, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
