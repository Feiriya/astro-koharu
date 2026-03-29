/**
 * Media Uploader
 *
 * Dialog component for uploading media files.
 */

import { useState } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface MediaUploaderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (file: File) => Promise<void>;
  isUploading: boolean;
}

export function MediaUploader({ open, onOpenChange, onUpload, isUploading }: MediaUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file size (10MB limit)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('文件大小超过 10MB 限制');
        setFile(null);
        return;
      }

      // Validate file type
      const allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
        'application/pdf', 'text/plain', 'text/markdown', 'application/json',
        'application/yml', 'application/yaml'
      ];

      if (!allowedTypes.includes(selectedFile.type)) {
        setError('不支持的文件类型');
        setFile(null);
        return;
      }

      setFile(selectedFile);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (file) {
      await onUpload(file);
      setFile(null);
      setError(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>上传文件</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="border-2 border-dashed border-input rounded-lg p-6 text-center">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileChange}
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer"
            >
              <div className="flex flex-col items-center justify-center">
                <Icon icon="ri:upload-cloud-2-line" className="size-12 text-muted-foreground mb-2" />
                <p className="text-sm font-medium">点击上传或拖放文件</p>
                <p className="text-xs text-muted-foreground mt-1">
                  支持格式：JPG, PNG, GIF, WebP, SVG, PDF, TXT, MD, JSON, YAML
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  最大大小：10MB
                </p>
              </div>
            </label>
          </div>

          {file && (
            <div className="bg-muted rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Icon icon="ri:file-line" className="size-6 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {Math.round(file.size / 1024)} KB
                  </p>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => setFile(null)}
                >
                  移除
                </Button>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-destructive text-sm">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                setFile(null);
                setError(null);
              }}
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={!file || isUploading}
            >
              {isUploading ? (
                <>
                  <Icon icon="ri:loader-4-line" className="mr-2 size-4 animate-spin" />
                  上传中...
                </>
              ) : (
                <>
                  <Icon icon="ri:upload-line" className="mr-2 size-4" />
                  上传
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
