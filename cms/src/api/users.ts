/**
 * CMS User Management API Handlers
 *
 * Handles user management operations.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import type { Context } from 'hono';
import yaml from 'js-yaml';
import { USERS_PATH } from '@/lib/paths';
import type { User } from '@/types';

// Load users from config
async function loadUsers(projectRoot: string): Promise<User[]> {
  const usersPath = path.join(projectRoot, USERS_PATH);
  
  try {
    const content = await fs.readFile(usersPath, 'utf-8');
    const config = yaml.load(content) as Record<string, unknown>;
    return (config.users as User[]) || [];
  } catch (error) {
    console.error('[CMS Users API] Error loading users:', error);
    return [];
  }
}

// Save users to config
async function saveUsers(projectRoot: string, users: User[]): Promise<void> {
  const usersPath = path.join(projectRoot, USERS_PATH);
  const content = await fs.readFile(usersPath, 'utf-8');
  const config = yaml.load(content) as Record<string, unknown>;
  
  config.users = users;
  
  await fs.writeFile(usersPath, yaml.dump(config), 'utf-8');
}

// Get all users handler
export async function getUsersHandler(c: Context) {
  const projectRoot = c.get('projectRoot') as string;
  const currentUser = c.get('user') as User;
  
  try {
    // Only admins can view users
    if (currentUser.role !== 'admin') {
      return c.json({ error: 'Forbidden' }, 403);
    }
    
    const users = await loadUsers(projectRoot);
    
    // Remove passwords from response
    const usersWithoutPasswords = users.map(({ password, ...user }) => user);
    
    return c.json({ users: usersWithoutPasswords });
  } catch (error) {
    console.error('[CMS Users API] Get users error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

// Delete user handler
export async function deleteUserHandler(c: Context) {
  const projectRoot = c.get('projectRoot') as string;
  const currentUser = c.get('user') as User;
  const userId = c.req.param('id');
  
  try {
    // Only admins can delete users
    if (currentUser.role !== 'admin') {
      return c.json({ error: 'Forbidden' }, 403);
    }
    
    const users = await loadUsers(projectRoot);
    
    // Prevent deleting the last admin
    const admins = users.filter(u => u.role === 'admin');
    if (admins.length === 1 && userId === admins[0].id) {
      return c.json({ error: 'Cannot delete the last admin user' }, 400);
    }
    
    // Prevent deleting yourself
    if (userId === currentUser.id) {
      return c.json({ error: 'Cannot delete yourself' }, 400);
    }
    
    const filteredUsers = users.filter(u => u.id !== userId);
    
    if (filteredUsers.length === users.length) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    await saveUsers(projectRoot, filteredUsers);
    
    return c.json({ success: true });
  } catch (error) {
    console.error('[CMS Users API] Delete user error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}