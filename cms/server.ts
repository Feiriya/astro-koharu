/**
 * CMS Server
 *
 * Hono-based server that provides both API routes and serves the Vite dev frontend.
 */

import fs from 'node:fs';
import fsPromises from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { Readable } from 'node:stream';
import { fileURLToPath } from 'node:url';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import yaml from 'js-yaml';
import { createServer as createViteServer } from 'vite';

import {
  createHandler,
  listHandler,
  ogCacheHandler,
  ogDataHandler,
  readHandler,
  toggleDraftHandler,
  toggleStickyHandler,
  writeHandler,
  loginHandler,
  registerHandler,
  getCurrentUserHandler,
  verifyToken,
  listMediaHandler,
  uploadMediaHandler,
  deleteMediaHandler,
  readThemeConfigHandler,
  writeThemeConfigHandler,
  getUsersHandler,
  deleteUserHandler,
} from './src/api';
import { setCategoryMap } from './src/lib/category';
import { CMS_PORT } from './src/lib/config';

// Type for Hono context variables
type AppVariables = {
  projectRoot: string;
  user: any;
};

// Load project configuration
const CMS_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(CMS_DIR, '..');

// Load site config for category map
function loadSiteConfig() {
  const configPath = path.join(PROJECT_ROOT, 'config', 'site.yaml');
  if (!fs.existsSync(configPath)) {
    console.warn('[CMS] config/site.yaml not found');
    return {};
  }
  const content = fs.readFileSync(configPath, 'utf-8');
  return yaml.load(content) as Record<string, unknown>;
}

async function main() {
  const siteConfig = loadSiteConfig();

  // Set category map from config
  const categoryMap = (siteConfig.categoryMap as Record<string, string>) || {};
  setCategoryMap(categoryMap);

  // Create Hono app for API routes
  const app = new Hono<{ Variables: AppVariables }>();

  // Middleware
  app.use('*', logger());
  app.use('*', cors());

  // Inject project root into context
  app.use('*', async (c, next) => {
    c.set('projectRoot', PROJECT_ROOT);
    await next();
  });

  // Security: localhost-only and optional API key authentication
  const CMS_API_KEY = process.env.CMS_API_KEY;
  app.use('/api/*', async (c, next) => {
    // Validate Host header to prevent DNS rebinding attacks
    const host = c.req.header('host') || '';
    const isLocalhost = /^(localhost|127\.0\.1|::1)(:\d+)?$/.test(host);
    if (!isLocalhost) {
      return c.json({ error: 'CMS is only accessible from localhost' }, 403);
    }

    // Optional API key authentication
    if (CMS_API_KEY) {
      const authHeader = c.req.header('authorization');
      const providedKey = authHeader?.replace('Bearer ', '');
      if (providedKey !== CMS_API_KEY) {
        return c.json({ error: 'Invalid or missing API key' }, 401);
      }
    }

    await next();
  });

  // Media routes (temporarily without auth for testing)
  app.get('/api/cms/media', listMediaHandler);

  // Auth middleware for protected routes
  app.use('/api/cms/*', async (c, next) => {
    const authHeader = c.req.header('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const user = verifyToken(token);
    if (!user) {
      return c.json({ error: 'Invalid token' }, 401);
    }
    
    c.set('user', user);
    await next();
  });

  // Auth middleware for /api/auth/me (optional auth)
  app.use('/api/auth/me', async (c, next) => {
    const authHeader = c.req.header('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const user = verifyToken(token);
    if (!user) {
      return c.json({ error: 'Invalid token' }, 401);
    }
    
    c.set('user', user);
    await next();
  });

  // Auth routes (not protected by auth middleware)
  app.post('/api/auth/login', loginHandler);
  app.post('/api/auth/register', registerHandler);
  app.get('/api/auth/me', getCurrentUserHandler);

  // API routes (protected by auth middleware)
  app.get('/api/cms/list', listHandler);
  app.get('/api/cms/read', readHandler);
  app.post('/api/cms/write', writeHandler);
  app.post('/api/cms/create', createHandler);
  app.post('/api/cms/toggle-draft', toggleDraftHandler);
  app.post('/api/cms/toggle-sticky', toggleStickyHandler);
  app.get('/api/cms/og-data', ogDataHandler);
  app.get('/api/cms/og-cache', ogCacheHandler);

  // Protected media routes
  app.post('/api/cms/media/upload', uploadMediaHandler);
  app.delete('/api/cms/media', deleteMediaHandler);


  // Test endpoint for media (no auth required)
  app.get('/api/test/media', async (c) => {
    const projectRoot = c.get('projectRoot') as string;
    
    try {
      const uploadDir = path.join(projectRoot, 'public/uploads');
      const imgDir = path.join(projectRoot, 'public/img');
      
      console.log('[Test] Project root:', projectRoot);
      console.log('[Test] Upload directory:', uploadDir);
      console.log('[Test] Image directory:', imgDir);
      
      let mediaFiles: any[] = [];
      
      // Scan upload directory
      try {
        const files = await fsPromises.readdir(uploadDir, { withFileTypes: true });
        console.log('[Test] Upload files found:', files.length);
        
        for (const file of files) {
          if (file.isFile()) {
            const filePath = path.join(uploadDir, file.name);
            const stats = await fsPromises.stat(filePath);
            
            mediaFiles.push({
              id: file.name,
              name: file.name,
              path: `/public/uploads/${file.name}`,
              size: stats.size,
              createdAt: stats.birthtime.toISOString(),
              updatedAt: stats.mtime.toISOString(),
              category: 'uploads',
            });
          }
        }
      } catch (error) {
        console.log('[Test] Error reading upload directory:', error);
      }
      
      // Scan img directory
      try {
        const imgFiles = await fsPromises.readdir(imgDir, { withFileTypes: true });
        console.log('[Test] Image files found:', imgFiles.length);
        
        for (const file of imgFiles) {
          if (file.isDirectory()) {
            const categoryDir = path.join(imgDir, file.name);
            console.log('[Test] Category directory:', categoryDir);
            
            try {
              const categoryFiles = await fsPromises.readdir(categoryDir, { withFileTypes: true });
              console.log('[Test] Files in', file.name, ':', categoryFiles.length);
              
              for (const categoryFile of categoryFiles) {
                if (categoryFile.isFile()) {
                  const filePath = path.join(categoryDir, categoryFile.name);
                  const stats = await fsPromises.stat(filePath);
                  
                  mediaFiles.push({
                    id: `img-${file.name}-${categoryFile.name}`,
                    name: categoryFile.name,
                    path: `/img/${file.name}/${categoryFile.name}`,
                    size: stats.size,
                    createdAt: stats.birthtime.toISOString(),
                    updatedAt: stats.mtime.toISOString(),
                    category: file.name,
                  });
                }
              }
            } catch (error) {
              console.log('[Test] Error reading category directory:', error);
            }
          } else if (file.isFile()) {
            const filePath = path.join(imgDir, file.name);
            const stats = await fsPromises.stat(filePath);
            
            mediaFiles.push({
              id: `img-root-${file.name}`,
              name: file.name,
              path: `/img/${file.name}`,
              size: stats.size,
              createdAt: stats.birthtime.toISOString(),
              updatedAt: stats.mtime.toISOString(),
              category: 'root',
            });
          }
        }
      } catch (error) {
        console.error('[Test] Error reading img directory:', error);
      }
      
      console.log('[Test] Total media files found:', mediaFiles.length);
      
      return c.json({
        files: mediaFiles,
        total: mediaFiles.length,
      });
    } catch (error) {
      console.error('[Test] Error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  });

  // Theme routes (protected by auth middleware)
  app.get('/api/cms/theme', readThemeConfigHandler);
  app.post('/api/cms/theme', writeThemeConfigHandler);

  // User management routes (protected by auth middleware)
  app.get('/api/cms/users', getUsersHandler);
  app.delete('/api/cms/users/:id', deleteUserHandler);

  // Config endpoint - returns project configuration for client use
  app.get('/api/cms/config', (c) => {
    return c.json({
      projectRoot: PROJECT_ROOT,
      contentDir: 'src/content/blog',
      categoryMap,
    });
  });

  // Create Vite dev server
  const vite = await createViteServer({
    root: CMS_DIR,
    server: { middlewareMode: true },
    appType: 'spa',
  });

  // Create native Node.js HTTP server
  const server = http.createServer(async (req, res) => {
    const url = req.url || '/';

    // Route API requests to Hono
    if (url.startsWith('/api/')) {
      // Convert Node.js IncomingMessage to Web ReadableStream for request body
      const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
      const body = hasBody ? (Readable.toWeb(req) as ReadableStream<Uint8Array>) : undefined;

      const response = await app.fetch(
        new Request(`http://localhost${url}`, {
          method: req.method,
          headers: req.headers as HeadersInit,
          body,
          // @ts-expect-error - duplex is required for streaming body
          duplex: 'half',
        }),
      );

      // Send Hono response back
      res.statusCode = response.status;
      response.headers.forEach((value, key) => {
        res.setHeader(key, value);
      });

      if (response.body) {
        const reader = response.body.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(value);
        }
      }
      res.end();
      return;
    }

    // Serve static files from project's public directory
    if (url.startsWith('/img/') || url.startsWith('/public/')) {
      // Map /img/* to PROJECT_ROOT/public/img/*
      const relativePath = url.startsWith('/img/') 
        ? path.join('public', url) 
        : url.substring(1); // Remove leading / for /public/*
      const filePath = path.join(PROJECT_ROOT, relativePath);
      console.log('[Static] Requested:', url, '-> File path:', filePath);
      try {
        const stat = await fsPromises.stat(filePath);
        console.log('[Static] File exists:', filePath, 'isFile:', stat.isFile());
        if (stat.isFile()) {
          const ext = path.extname(filePath).toLowerCase();
          const mimeTypes: Record<string, string> = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp',
            '.svg': 'image/svg+xml',
          };
          const contentType = mimeTypes[ext] || 'application/octet-stream';
          
          res.setHeader('Content-Type', contentType);
          res.setHeader('Cache-Control', 'public, max-age=3600');
          
          const fileStream = fs.createReadStream(filePath);
          fileStream.pipe(res);
          return;
        }
      } catch (error) {
        // File not found, fall through to Vite
      }
    }

    // All other requests go to Vite
    vite.middlewares(req, res);
  });

  console.log(`\n🚀 CMS running at http://localhost:${CMS_PORT}\n`);

  server.listen(CMS_PORT);
}

main().catch(console.error);
