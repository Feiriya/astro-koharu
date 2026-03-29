/**
 * Login Form
 *
 * Form component for user login.
 */

import { useState } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import type { LoginRequest } from '@/types';

interface LoginFormProps {
  onLogin: (credentials: LoginRequest) => Promise<boolean>;
  isLoading: boolean;
}

export function LoginForm({ onLogin, isLoading }: LoginFormProps) {
  const [formData, setFormData] = useState<LoginRequest>({
    username: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onLogin(formData);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-center">登录</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium mb-1">
            用户名
          </label>
          <div className="relative">
            <Icon icon="ri:user-line" className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-input bg-background py-2 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="请输入用户名"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            密码
          </label>
          <div className="relative">
            <Icon icon="ri:lock-line" className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-input bg-background py-2 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="请输入密码"
            />
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Icon icon="ri:loader-4-line" className="mr-2 size-4 animate-spin" />
              登录中...
            </>
          ) : (
            <>
              <Icon icon="ri:login-box-line" className="mr-2 size-4" />
              登录
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
