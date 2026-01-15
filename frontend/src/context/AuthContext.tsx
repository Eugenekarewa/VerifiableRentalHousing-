"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Role, User } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (role: Role) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem('vrp_session');
    if (saved) setUser(JSON.parse(saved));
    setIsLoading(false);
  }, []);

  const login = (role: Role) => {
    const mockUser = { id: Date.now().toString(), name: `User_${role}`, role };
    setUser(mockUser);
    localStorage.setItem('vrp_session', JSON.stringify(mockUser));
    router.push(`/dashboards/${role.toLowerCase()}`);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('vrp_session');
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};