/**
 * Theme Settings
 *
 * Component for managing theme configuration.
 */

import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { ThemeForm } from './ThemeForm';
import type { ThemeConfig } from '@/types';

export function ThemeSettings() {
  const [config, setConfig] = useState<ThemeConfig | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [hasChanges, setHasChanges] = useState<boolean>(false);

  // Fetch theme config
  const fetchThemeConfig = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/cms/theme', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('cms-auth-token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setConfig(data.config);
      }
    } catch (error) {
      console.error('Error fetching theme config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchThemeConfig();
  }, []);

  // Handle config change
  const handleConfigChange = (newConfig: ThemeConfig) => {
    setConfig(newConfig);
    setHasChanges(true);
  };

  // Handle save
  const handleSave = async () => {
    if (!config) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/cms/theme', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('cms-auth-token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        setHasChanges(false);
      }
    } catch (error) {
      console.error('Error saving theme config:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle reset
  const handleReset = () => {
    fetchThemeConfig();
    setHasChanges(false);
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Icon icon="ri:loader-4-line" className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!config) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <Icon icon="ri:error-warning-line" className="size-12 text-destructive mb-2" />
          <p className="text-destructive">加载主题配置失败</p>
          <Button variant="outline" onClick={fetchThemeConfig} className="mt-4">
            重试
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">主题设置</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} disabled={isSaving}>
            <Icon icon="ri:refresh-line" className="mr-2 size-4" />
            重置
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges || isSaving}>
            {isSaving ? (
              <>
                <Icon icon="ri:loader-4-line" className="mr-2 size-4 animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <Icon icon="ri:save-line" className="mr-2 size-4" />
                保存更改
              </>
            )}
          </Button>
        </div>
      </div>

      <ThemeForm config={config} onChange={handleConfigChange} />
    </div>
  );
}
