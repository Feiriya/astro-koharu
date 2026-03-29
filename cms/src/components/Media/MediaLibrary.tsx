/**
 * Media Library
 *
 * Component for managing media files (upload, list, delete).
 */

import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { MediaUploader } from './MediaUploader';
import { MediaList } from './MediaList';
import type { MediaFile } from '@/types';

export function MediaLibrary() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>(['all']);

  // Fetch media files
  const fetchMediaFiles = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('cms-auth-token');
      console.log('Fetching media files with token:', token ? 'present' : 'missing');
      
      const response = await fetch('/api/cms/media', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Media API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Media API response data:', data);
        
        setFiles(data.files);
        
        // Extract unique categories
        const uniqueCategories = ['all', ...new Set(data.files.map(file => file.category || 'uncategorized'))];
        setCategories(uniqueCategories);
        console.log('Extracted categories:', uniqueCategories);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Media API error:', errorData);
      }
    } catch (error) {
      console.error('Error fetching media files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter files by category
  const filteredFiles = selectedCategory === 'all' 
    ? files 
    : files.filter(file => file.category === selectedCategory);

  // Get category display name
  const getCategoryDisplayName = (category: string): string => {
    const categoryNames: Record<string, string> = {
      'all': '全部',
      'uploads': '上传',
      'cover': '封面',
      'effects': '特效',
      'root': '根目录',
      'uncategorized': '未分类'
    };
    return categoryNames[category] || category;
  };

  // Initial fetch
  useEffect(() => {
    fetchMediaFiles();
  }, []);

  // Handle upload
  const handleUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/cms/media/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('cms-auth-token')}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.file) {
          setFiles(prev => [data.file, ...prev]);
          
          // Update categories if new category is added
          if (data.file.category && !categories.includes(data.file.category)) {
            setCategories(prev => [...prev, data.file.category]);
          }
        }
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsUploading(false);
      setIsUploadDialogOpen(false);
    }
  };

  // Handle delete
  const handleDelete = async (fileId: string) => {
    try {
      const response = await fetch('/api/cms/media', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('cms-auth-token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: fileId }),
      });

      if (response.ok) {
        setFiles(prev => prev.filter(file => file.id !== fileId));
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">媒体库</h2>
        <Button onClick={() => setIsUploadDialogOpen(true)} disabled={isUploading}>
          <Icon icon="ri:upload-line" className="mr-2 size-4" />
          上传文件
        </Button>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            {getCategoryDisplayName(category)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Icon icon="ri:loader-4-line" className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <MediaList files={filteredFiles} onDelete={handleDelete} />
      )}

      <MediaUploader
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        onUpload={handleUpload}
        isUploading={isUploading}
      />
    </div>
  );
}
