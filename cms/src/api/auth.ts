/**
 * CMS Auth API Handlers
 *
 * Handles user authentication, login, and registration.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { Context } from 'hono';
import yaml from 'js-yaml';
import { USERS_PATH } from '@/lib/paths';
import type { LoginRequest, RegisterRequest, AuthResponse, User } from '@/types';

// JWT secret (should be in environment variable in production)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Load users from config
async function loadUsers(projectRoot: string): Promise<User[]> {
  const usersPath = path.join(projectRoot, USERS_PATH);
  
  try {
    const content = await fs.readFile(usersPath, 'utf-8');
    const config = yaml.load(content) as Record<string, unknown>;
    return (config.users as User[]) || [];
  } catch (error) {
    console.error('[CMS Auth API] Error loading users:', error);
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

// Generate JWT token
function generateToken(user: User): string {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Verify JWT token
export function verifyToken(token: string): User | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as User;
    return decoded;
  } catch (error) {
    return null;
  }
}

// Login handler
export async function loginHandler(c: Context) {
  const projectRoot = c.get('projectRoot') as string;
  
  try {
    const body = await c.req.json<LoginRequest>();
    const { username, password } = body;
    
    if (!username || !password) {
      return c.json({ error: 'Username and password are required' }, 400);
    }
    
    const users = await loadUsers(projectRoot);
    const user = users.find(u => u.username === username);
    
    if (!user) {
      return c.json({ error: 'Invalid username or password' }, 401);
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return c.json({ error: 'Invalid username or password' }, 401);
    }
    
    const token = generateToken(user);
    
    const response: AuthResponse = {
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    };
    
    return c.json(response);
  } catch (error) {
    console.error('[CMS Auth API] Login error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

// Register handler
export async function registerHandler(c: Context) {
  const projectRoot = c.get('projectRoot') as string;
  
  try {
    const body = await c.req.json<RegisterRequest>();
    const { username, password, role = 'user' } = body;
    
    if (!username || !password) {
      return c.json({ error: 'Username and password are required' }, 400);
    }
    
    if (password.length < 6) {
      return c.json({ error: 'Password must be at least 6 characters' }, 400);
    }
    
    const users = await loadUsers(projectRoot);
    
    if (users.some(u => u.username === username)) {
      return c.json({ error: 'Username already exists' }, 400);
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser: User = {
      id: Date.now().toString(),
      username,
      password: hashedPassword,
      role
    };
    
    users.push(newUser);
    await saveUsers(projectRoot, users);
    
    const token = generateToken(newUser);
    
    const response: AuthResponse = {
      success: true,
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role
      }
    };
    
    return c.json(response);
  } catch (error) {
    console.error('[CMS Auth API] Register error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

// Get current user handler
export async function getCurrentUserHandler(c: Context) {
  const user = c.get('user') as User;
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  return c.json({
    user: {
      id: user.id,
      username: user.username,
      role: user.role
    }
  });
}
