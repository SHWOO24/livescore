import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  name: string;
  role?: 'USER' | 'ADMIN';
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await api.get('/api/auth/me');
      setUser(response.data.user);
    } catch (error: any) {
      // 401은 정상적인 경우(로그인 전)이므로 조용히 처리
      if (error.response?.status !== 401) {
        console.error('Auth check error:', error);
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      setUser(response.data.user);
      toast.success('로그인 성공!');
    } catch (error: any) {
      const message = error.response?.data?.message || '로그인에 실패했습니다';
      toast.error(message);
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const response = await api.post('/api/auth/register', { email, password, name });
      const message = response.data.message || '회원가입이 완료되었습니다. 관리자 승인 후 로그인할 수 있습니다.';
      toast.success(message);
    } catch (error: any) {
      const message = error.response?.data?.message || '회원가입에 실패했습니다';
      toast.error(message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout', {});
      setUser(null);
      toast.success('로그아웃되었습니다');
    } catch (error) {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
