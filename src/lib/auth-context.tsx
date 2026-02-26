import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { UserProfile } from "./types";
import { demoUser } from "./seed-data";

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfile | null;
  login: (email: string, password: string) => boolean;
  signup: (name: string, email: string, password: string) => boolean;
  logout: () => void;
  updateUser: (updates: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: () => false,
  signup: () => false,
  logout: () => {},
  updateUser: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("skillbridge-auth");
    if (stored) {
      const parsed = JSON.parse(stored);
      setIsAuthenticated(true);
      setUser(parsed);
    }
  }, []);

  const login = (email: string, password: string): boolean => {
    if (email === "demo@skillbridge.com" && password === "password123") {
      const savedUser = localStorage.getItem("skillbridge-user");
      const userData = savedUser ? JSON.parse(savedUser) : demoUser;
      setIsAuthenticated(true);
      setUser(userData);
      localStorage.setItem("skillbridge-auth", JSON.stringify(userData));
      return true;
    }
    // Accept any credentials for demo
    const newUser: UserProfile = {
      name: email.split("@")[0],
      email,
      completedCourses: [],
      completedMilestones: [],
    };
    setIsAuthenticated(true);
    setUser(newUser);
    localStorage.setItem("skillbridge-auth", JSON.stringify(newUser));
    return true;
  };

  const signup = (name: string, email: string, _password: string): boolean => {
    const newUser: UserProfile = {
      name,
      email,
      completedCourses: [],
      completedMilestones: [],
    };
    setIsAuthenticated(true);
    setUser(newUser);
    localStorage.setItem("skillbridge-auth", JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem("skillbridge-auth");
  };

  const updateUser = (updates: Partial<UserProfile>) => {
    if (user) {
      const updated = { ...user, ...updates };
      setUser(updated);
      localStorage.setItem("skillbridge-auth", JSON.stringify(updated));
      localStorage.setItem("skillbridge-user", JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
