/**
 * CMS Theme API Handlers
 *
 * Handles theme configuration reading and writing.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import type { Context } from 'hono';
import yaml from 'js-yaml';
import { CONFIG_PATH } from '@/lib/paths';

// Read theme config
export async function readThemeConfigHandler(c: Context) {
  const projectRoot = c.get('projectRoot') as string;
  
  try {
    const configPath = path.join(projectRoot, CONFIG_PATH);
    const content = await fs.readFile(configPath, 'utf-8');
    const config = yaml.load(content) as Record<string, unknown>;
    
    return c.json({ success: true, config });
  } catch (error) {
    console.error('[CMS Theme API] Error reading theme config:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

// Write theme config
export async function writeThemeConfigHandler(c: Context) {
  const projectRoot = c.get('projectRoot') as string;
  
  try {
    const configPath = path.join(projectRoot, CONFIG_PATH);
    const newConfig = await c.req.json();
    
    // Validate config structure
    if (!newConfig || typeof newConfig !== 'object') {
      return c.json({ error: 'Invalid config structure' }, 400);
    }
    
    // Write config to file
    const content = yaml.dump(newConfig, { indent: 2 });
    await fs.writeFile(configPath, content, 'utf-8');
    
    return c.json({ success: true });
  } catch (error) {
    console.error('[CMS Theme API] Error writing theme config:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}
