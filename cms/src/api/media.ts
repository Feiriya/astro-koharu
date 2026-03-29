/**
 * CMS Media API Handlers
 *
 * Handles media file uploads, listing, and management.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import type { Context } from 'hono';
import { UPLOAD_DIR } from '@/lib/paths';
import type { MediaFile, MediaListResponse } from '@/types';

// Allowed file types
const ALLOWED_MIME_TYPES = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'image/svg+xml': '.svg',
  'application/pdf': '.pdf',
  'text/plain': '.txt',
  'text/markdown': '.md',
  'application/json': '.json',
  'application/yml': '.yml',
  'application/yaml': '.yaml',
};

// Maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Ensure upload directory exists
async function ensureUploadDir(projectRoot: string): Promise<string> {
  const uploadDir = path.join(projectRoot, UPLOAD_DIR);
  try {
    await fs.mkdir(uploadDir, { recursive: true });
  } catch (error) {
    console.error('[CMS Media API] Error creating upload directory:', error);
  }
  return uploadDir;
}

// List media files
export async function listMediaHandler(c: Context) {
  const projectRoot = c.get('projectRoot') as string;
  console.log('[CMS Media API] Project root:', projectRoot);
  
  try {
    const uploadDir = await ensureUploadDir(projectRoot);
    console.log('[CMS Media API] Upload directory:', uploadDir);
    
    let mediaFiles: MediaFile[] = [];
    
    // Scan upload directory
    try {
      const files = await fs.readdir(uploadDir, { withFileTypes: true });
      console.log('[CMS Media API] Upload files found:', files.length);
      
      for (const file of files) {
        if (file.isFile()) {
          const filePath = path.join(uploadDir, file.name);
          const stats = await fs.stat(filePath);
          
          mediaFiles.push({
            id: file.name,
            name: file.name,
            path: `/${UPLOAD_DIR}/${file.name}`,
            size: stats.size,
            createdAt: stats.birthtime.toISOString(),
            updatedAt: stats.mtime.toISOString(),
            category: 'uploads',
          });
        }
      }
    } catch (error) {
      console.log('[CMS Media API] Error reading upload directory:', error);
    }
    
    // Scan existing img directory for additional images
    const imgDir = path.join(projectRoot, 'public/img');
    console.log('[CMS Media API] Image directory:', imgDir);
    
    try {
      const imgFiles = await fs.readdir(imgDir, { withFileTypes: true });
      console.log('[CMS Media API] Image files found:', imgFiles.length);
      
      for (const file of imgFiles) {
        if (file.isDirectory()) {
          // Handle subdirectories (categories)
          const categoryDir = path.join(imgDir, file.name);
          console.log('[CMS Media API] Category directory:', categoryDir);
          
          try {
            const categoryFiles = await fs.readdir(categoryDir, { withFileTypes: true });
            console.log('[CMS Media API] Files in', file.name, ':', categoryFiles.length);
            
            for (const categoryFile of categoryFiles) {
              if (categoryFile.isFile()) {
                const filePath = path.join(categoryDir, categoryFile.name);
                const stats = await fs.stat(filePath);
                
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
            console.log('[CMS Media API] Error reading category directory:', error);
          }
        } else if (file.isFile()) {
          // Handle files in root img directory
          const filePath = path.join(imgDir, file.name);
          const stats = await fs.stat(filePath);
          
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
      console.error('[CMS Media API] Error reading img directory:', error);
    }
    
    console.log('[CMS Media API] Total media files found:', mediaFiles.length);
    
    // Sort by updatedAt descending
    mediaFiles.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    
    const response: MediaListResponse = {
      files: mediaFiles,
      total: mediaFiles.length,
    };
    
    return c.json(response);
  } catch (error) {
    console.error('[CMS Media API] Error listing media:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

// Upload media file
export async function uploadMediaHandler(c: Context) {
  const projectRoot = c.get('projectRoot') as string;
  
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }
    
    if (file.size > MAX_FILE_SIZE) {
      return c.json({ error: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit` }, 400);
    }
    
    const mimeType = file.type;
    const fileExtension = ALLOWED_MIME_TYPES[mimeType as keyof typeof ALLOWED_MIME_TYPES];
    
    if (!fileExtension) {
      return c.json({ error: 'File type not allowed' }, 400);
    }
    
    const uploadDir = await ensureUploadDir(projectRoot);
    const fileName = `${randomUUID()}${fileExtension}`;
    const filePath = path.join(uploadDir, fileName);
    
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);
    
    const stats = await fs.stat(filePath);
    
    const mediaFile: MediaFile = {
      id: fileName,
      name: fileName,
      path: `/${UPLOAD_DIR}/${fileName}`,
      size: stats.size,
      createdAt: stats.birthtime.toISOString(),
      updatedAt: stats.mtime.toISOString(),
      category: 'uploads',
    };
    
    return c.json({ success: true, file: mediaFile });
  } catch (error) {
    console.error('[CMS Media API] Error uploading media:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

// Delete media file
export async function deleteMediaHandler(c: Context) {
  const projectRoot = c.get('projectRoot') as string;
  
  try {
    const { id } = await c.req.json();
    
    if (!id) {
      return c.json({ error: 'No file ID provided' }, 400);
    }
    
    const uploadDir = await ensureUploadDir(projectRoot);
    const filePath = path.join(uploadDir, id);
    
    try {
      await fs.unlink(filePath);
      return c.json({ success: true });
    } catch (error) {
      return c.json({ error: 'File not found' }, 404);
    }
  } catch (error) {
    console.error('[CMS Media API] Error deleting media:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}
