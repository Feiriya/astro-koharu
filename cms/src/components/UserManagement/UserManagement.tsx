/**
 * User Management
 *
 * Component for managing CMS users.
 */

import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import type { User } from '@/types';

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false);
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'user' as 'admin' | 'user' });

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/cms/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('cms-auth-token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        await fetchUsers();
        setNewUser({ username: '', password: '', role: 'user' });
        setIsCreateDialogOpen(false);
      }
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('确定要删除这个用户吗？')) {
      return;
    }

    try {
      const response = await fetch(`/api/cms/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('cms-auth-token')}`,
        },
      });

      if (response.ok) {
        await fetchUsers();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">用户管理</h2>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Icon icon="ri:user-add-line" className="mr-2 size-4" />
          新建用户
        </Button>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Icon icon="ri:loader-4-line" className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : users.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center gap-4 text-muted-foreground">
          <Icon icon="ri:user-line" className="size-12" />
          <p>暂无用户</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-sm font-medium">用户名</th>
                <th className="px-4 py-3 text-left text-sm font-medium">角色</th>
                <th className="px-4 py-3 text-right text-sm font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Icon icon="ri:user-line" className="size-4 text-muted-foreground" />
                      {user.username}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded px-2 py-1 text-xs font-medium ${
                      user.role === 'admin' 
                        ? 'bg-primary/10 text-primary' 
                        : 'bg-secondary/10 text-secondary-foreground'
                    }`}>
                      {user.role === 'admin' ? '管理员' : '普通用户'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={users.length === 1}
                    >
                      <Icon icon="ri:delete-bin-line" className="size-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isCreateDialogOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-card p-6">
            <h3 className="mb-4 text-lg font-bold">新建用户</h3>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium mb-1">
                  用户名
                </label>
                <input
                  type="text"
                  id="username"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  required
                  className="w-full rounded-lg border border-input bg-background py-2 px-3 focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="请输入用户名"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1">
                  密码
                </label>
                <input
                  type="password"
                  id="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  required
                  minLength={6}
                  className="w-full rounded-lg border border-input bg-background py-2 px-3 focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="请输入密码（至少6个字符）"
                />
              </div>
              <div>
                <label htmlFor="role" className="block text-sm font-medium mb-1">
                  角色
                </label>
                <select
                  id="role"
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as 'admin' | 'user' })}
                  className="w-full rounded-lg border border-input bg-background py-2 px-3 focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="user">普通用户</option>
                  <option value="admin">管理员</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  取消
                </Button>
                <Button type="submit">
                  创建
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}