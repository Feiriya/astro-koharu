/**
 * Image Picker
 *
 * Component for selecting images from media library.
 */

import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { MediaFile } from '@/types';

interface ImagePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (imageUrl: string) => void;
  currentImage?: string;
  title?: string;
}

export function ImagePicker({ isOpen, onClose, onSelect, currentImage, title = '选择图片' }: ImagePickerProps) {
  const [images, setImages] = useState<MediaFile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>(['all']);

  const fetchImages = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/cms/media', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('cms-auth-token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // 只显示图片文件
        const imageFiles = data.files.filter(file => 
          file.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)
        );
        setImages(imageFiles);
        
        // Extract unique categories
        const uniqueCategories = ['all', ...new Set(imageFiles.map(file => file.category || 'uncategorized'))];
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter images by category
  const filteredImages = selectedCategory === 'all' 
    ? images 
    : images.filter(image => image.category === selectedCategory);

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

  useEffect(() => {
    if (isOpen) {
      fetchImages();
      setSelectedImage(currentImage || null);
    }
  }, [isOpen, currentImage]);

  const handleSelect = () => {
    if (selectedImage) {
      onSelect(selectedImage);
      onClose();
    }
  };

  const getImageUrl = (image: MediaFile) => {
    // 使用图片的实际路径
    return image.path;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-4xl rounded-lg bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">{title}</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <Icon icon="ri:close-line" className="size-5" />
          </Button>
        </div>

        {isLoading ? (
          <div className="flex h-96 items-center justify-center">
            <Icon icon="ri:loader-4-line" className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : images.length === 0 ? (
          <div className="flex h-96 flex-col items-center justify-center gap-4 text-muted-foreground">
            <Icon icon="ri:image-line" className="size-12" />
            <p>暂无图片</p>
            <p className="text-sm">请先在媒体库中上传图片</p>
          </div>
        ) : (
          <div className="space-y-4">
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

            <div className="grid max-h-96 grid-cols-2 gap-4 overflow-y-auto md:grid-cols-3 lg:grid-cols-4">
              {filteredImages.map((image) => {
                const imageUrl = getImageUrl(image);
                const isSelected = selectedImage === imageUrl;
                
                return (
                  <div
                    key={image.id}
                    onClick={() => setSelectedImage(imageUrl)}
                    className={cn(
                      'relative cursor-pointer overflow-hidden rounded-lg border-2 transition-all',
                      isSelected
                        ? 'border-primary ring-2 ring-primary ring-offset-2'
                        : 'border-border hover:border-primary'
                    )}
                  >
                    <img
                      src={imageUrl}
                      alt={image.name}
                      className="h-32 w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f0f0f0" width="100" height="100"/%3E%3C/svg%3E';
                      }}
                    />
                    {isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center bg-primary/80">
                        <Icon icon="ri:check-line" className="size-8 text-white" />
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                      <p className="truncate text-xs text-white">{image.name}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 border-t border-border pt-4">
              <Button variant="outline" onClick={onClose}>
                取消
              </Button>
              <Button onClick={handleSelect} disabled={!selectedImage}>
                <Icon icon="ri:check-line" className="mr-2 size-4" />
                确认选择
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}