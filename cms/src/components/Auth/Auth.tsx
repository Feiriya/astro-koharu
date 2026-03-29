/**
 * Auth Component
 *
 * Manages authentication state and renders login form.
 */

import { Icon } from '@iconify/react';
import { LoginForm } from './LoginForm';
import { useAuth } from '@/hooks';

export function Auth() {
  const { login, isLoading } = useAuth();

  const handleLogin = async (credentials: any) => {
    await login(credentials);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Icon icon="ri:dashboard-3-line" className="mx-auto size-12" />
          <h1 className="text-2xl font-bold">Koharu CMS</h1>
          <p className="text-muted-foreground">管理您的博客内容</p>
        </div>

        <div className="bg-card rounded-lg border border-border p-6 space-y-4">
          <LoginForm
            onLogin={handleLogin}
            isLoading={isLoading}
          />
        </div>

        <div className="text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Koharu CMS
        </div>
      </div>
    </div>
  );
}
