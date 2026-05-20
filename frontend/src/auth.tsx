import React, { createContext, useContext, useState, useEffect } from "react";
import {
  getToken,
  getStoredUser,
  setStoredUser,
  clearToken,
  userApi,
  UserObject,
  UserProfileDashboardResponse,
} from "./api";
import { useNavigate } from "react-router";

type AuthContextType = {
  user: UserObject | null;
  userProfile: UserProfileDashboardResponse | null;
  isLoadingProfile: boolean;
  isAuthenticated: boolean;
  setUser: (u: UserObject | null) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUserState] = useState<UserObject | null>(() =>
    getStoredUser()
  );
  const [userProfile, setUserProfile] = useState<UserProfileDashboardResponse | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  const isAuthenticated = Boolean(getToken());

  useEffect(() => {
    let mounted = true;
    if (isAuthenticated && !userProfile) {
      setIsLoadingProfile(true);
      userApi.getMe()
        .then((profile) => {
          if (mounted) {
            setUserProfile(profile);
            setUserState(profile.user);
            setStoredUser(profile.user);
          }
        })
        .catch(() => {
          if (mounted) {
            clearToken();
            setUserState(null);
          }
        })
        .finally(() => {
          if (mounted) setIsLoadingProfile(false);
        });
    }
    return () => { mounted = false; };
  }, [isAuthenticated, userProfile]);

  const setUser = (u: UserObject | null) => {
    if (u) {
      setStoredUser(u);
    } else {
      clearToken();
      setUserProfile(null);
    }
    setUserState(u);
  };

  const logout = () => {
    clearToken();
    setUserState(null);
    setUserProfile(null);
    sessionStorage.removeItem("quizResult");
    sessionStorage.removeItem("userPredictions");
    // Hard redirect to ensure app resets to login
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, isLoadingProfile, isAuthenticated, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function PrivateRoute({ Component }: { Component: React.ComponentType<any> }) {
  const { isAuthenticated, isLoadingProfile, userProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;
  
  if (isLoadingProfile && !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--viv-beige)' }}>
        <div className="w-10 h-10 border-4 rounded-full animate-spin"
          style={{ borderColor: 'var(--viv-secondary)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return <Component />;
}
