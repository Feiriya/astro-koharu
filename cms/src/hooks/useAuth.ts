/**
 * Auth Hook
 *
 * Manages authentication state and provides login/logout functionality.
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import type { User, LoginRequest, RegisterRequest, AuthResponse } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface UseAuthReturn extends AuthState {
  login: (credentials: LoginRequest) => Promise<boolean>;
  register: (userData: RegisterRequest) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
}

const TOKEN_KEY = 'cms-auth-token';
const USER_KEY = 'cms-auth-user';

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem(USER_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(TOKEN_KEY);
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const isAuthenticated = !!token && !!user;

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Update localStorage when user or token changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }, [token]);

  const login = useCallback(async (credentials: LoginRequest): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json() as AuthResponse;

      if (data.success && data.token && data.user) {
        setToken(data.token);
        setUser(data.user);
        toast.success('登录成功，正在跳转...');
        
        // 自动跳转到 CMS 后台
        setTimeout(() => {
          window.location.href = '/';
        }, 500);
        
        return true;
      } else {
        toast.error(data.error || '登录失败');
        return false;
      }
    } catch (error) {
      toast.error('登录过程中发生错误');
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (userData: RegisterRequest): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json() as AuthResponse;

      if (data.success && data.token && data.user) {
        setToken(data.token);
        setUser(data.user);
        toast.success('注册成功，正在跳转...');
        
        // 自动跳转到 CMS 后台
        setTimeout(() => {
          window.location.href = '/';
        }, 500);
        
        return true;
      } else {
        toast.error(data.error || '注册失败');
        return false;
      }
    } catch (error) {
      toast.error('注册过程中发生错误');
      console.error('Register error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  }, []);

  const checkAuth = useCallback(async (): Promise<boolean> => {
    if (!token) {
      return false;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setUser(data.user);
          return true;
        }
      }

      // Token is invalid, clear it
      setToken(null);
      setUser(null);
      return false;
    } catch (error) {
      console.error('Auth check error:', error);
      setToken(null);
      setUser(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  return {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuth,
  };
}
