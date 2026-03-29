/**
 * Media List
 *
 * Component for displaying list of media files with preview and delete functionality.
 */

import { useState } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import type { MediaFile } from '@/types';

interface MediaListProps {
  files: MediaFile[];
  onDelete: (fileId: string) => Promise<void>;
}

export function MediaList({ files, onDelete }: MediaListProps) {
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);

  // Format file size
  const formatFileSize = (size: number): string => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Get file icon based on extension
  const getFileIcon = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
      case 'svg':
        return 'ri:image-line';
      case 'pdf':
        return 'ri:file-pdf-line';
      case 'txt':
        return 'ri:file-text-line';
      case 'md':
        return 'ri:markdown-line';
      case 'json':
        return 'ri:file-code-line';
      case 'yml':
      case 'yaml':
        return 'ri:file-settings-line';
      default:
        return 'ri:file-line';
    }
  };

  // Handle delete
  const handleDeleteClick = (fileId: string) => {
    setFileToDelete(fileId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (fileToDelete) {
      await onDelete(fileToDelete);
      setIsDeleteDialogOpen(false);
      setFileToDelete(null);
    }
  };

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-input rounded-lg">
        <Icon icon="ri:folder-open-line" className="size-12 text-muted-foreground mb-2" />
        <p className="text-muted-foreground">暂无媒体文件</p>
        <p className="text-xs text-muted-foreground mt-1">上传文件开始使用</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {files.map((file) => (
          <div key={file.id} className="border border-border rounded-lg overflow-hidden">
            <div className="aspect-video bg-muted flex items-center justify-center">
              {file.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ? (
                <img
                  src={file.path}
                  alt={file.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Icon icon={getFileIcon(file.name)} className="size-12 text-muted-foreground" />
              )}
            </div>
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteClick(file.id)}
                >
                  <Icon icon="ri:delete-bin-line" className="size-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{formatFileSize(file.size)}</span>
                <span>{new Date(file.updatedAt).toLocaleDateString()}</span>
              </div>
              {file.category && (
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">分类:</span>
                  <span className="px-2 py-0.5 bg-muted rounded-full text-xs font-medium">
                    {file.category === 'uploads' ? '上传' : 
                     file.category === 'cover' ? '封面' : 
                     file.category === 'effects' ? '特效' : 
                     file.category === 'root' ? '根目录' : 
                     file.category}
                  </span>
                </div>
              )}
              <div className="pt-2">
                <input
                  type="text"
                  value={file.path}
                  readOnly
                  className="w-full text-xs bg-muted rounded p-2"
                  onClick={(e) => {
                    e.target.select();
                    navigator.clipboard.writeText(file.path);
                  }}
                />
                <p className="text-xs text-muted-foreground mt-1">点击复制路径</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>删除文件</DialogTitle>
          </DialogHeader>
          <p>确定要删除此文件吗？此操作无法撤销。</p>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              取消
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDelete}
            >
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
