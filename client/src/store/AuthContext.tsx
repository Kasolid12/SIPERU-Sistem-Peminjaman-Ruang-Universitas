import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User, Role } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (...roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('siperu_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('siperu_token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verifikasi token masih valid saat mount
    if (token && !user) {
      setIsLoading(true);
      import('../services/auth').then(({ authService }) => {
        authService.me()
          .then((u) => {
            setUser(u);
            localStorage.setItem('siperu_user', JSON.stringify(u));
          })
          .catch(() => {
            logout();
          })
          .finally(() => setIsLoading(false));
      });
    } else {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback((newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('siperu_token', newToken);
    localStorage.setItem('siperu_user', JSON.stringify(newUser));
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('siperu_token');
    localStorage.removeItem('siperu_user');
  }, []);

  const hasRole = useCallback((...roles: Role[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        isAuthenticated: !!token && !!user,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}