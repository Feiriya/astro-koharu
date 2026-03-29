/**
 * Theme Form
 *
 * Form component for editing theme configuration.
 */

import { useState } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { ImagePicker } from '@/components';
import type { ThemeConfig } from '@/types';

interface ThemeFormProps {
  config: ThemeConfig;
  onChange: (config: ThemeConfig) => void;
}

export function ThemeForm({ config, onChange }: ThemeFormProps) {
  const [activeTab, setActiveTab] = useState<string>('basic');
  const [showBackgroundPicker, setShowBackgroundPicker] = useState(false);

  const handleChange = (path: string, value: any) => {
    const newConfig = JSON.parse(JSON.stringify(config));
    const keys = path.split('.');
    let current = newConfig;

    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
    onChange(newConfig);
  };

  const handleArrayChange = (path: string, index: number, key: string, value: any) => {
    const newConfig = JSON.parse(JSON.stringify(config));
    const keys = path.split('.');
    let current = newConfig;

    for (let i = 0; i < keys.length; i++) {
      current = current[keys[i]];
    }

    current[index][key] = value;
    onChange(newConfig);
  };

  const handleArrayAdd = (path: string, item: any) => {
    const newConfig = JSON.parse(JSON.stringify(config));
    const keys = path.split('.');
    let current = newConfig;

    for (let i = 0; i < keys.length; i++) {
      current = current[keys[i]];
    }

    current.push(item);
    onChange(newConfig);
  };

  const handleArrayRemove = (path: string, index: number) => {
    const newConfig = JSON.parse(JSON.stringify(config));
    const keys = path.split('.');
    let current = newConfig;

    for (let i = 0; i < keys.length; i++) {
      current = current[keys[i]];
    }

    current.splice(index, 1);
    onChange(newConfig);
  };

  const tabs = [
    { id: 'basic', label: '基本信息', icon: 'ri:info-line' },
    { id: 'content', label: '内容设置', icon: 'ri:file-text-line' },
    { id: 'navigation', label: '导航菜单', icon: 'ri:navigation-line' },
    { id: 'social', label: '社交链接', icon: 'ri:link-line' },
    { id: 'comment', label: '评论系统', icon: 'ri:chat-1-line' },
    { id: 'advanced', label: '高级设置', icon: 'ri:settings-3-line' },
  ];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-border border-b">
        <div className="flex space-x-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-colors ${activeTab === tab.id ? 'border-primary border-b-2 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Icon icon={tab.icon} className="size-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Basic Info Tab */}
        {activeTab === 'basic' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">网站标题</label>
                <input
                  type="text"
                  value={config.site?.title || ''}
                  onChange={(e) => handleChange('site.title', e.target.value)}
                  className="w-full rounded-lg border border-input bg-background py-2 px-3 focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">网站副标题</label>
                <input
                  type="text"
                  value={config.site?.subtitle || ''}
                  onChange={(e) => handleChange('site.subtitle', e.target.value)}
                  className="w-full rounded-lg border border-input bg-background py-2 px-3 focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">作者名称</label>
                <input
                  type="text"
                  value={config.site?.author || ''}
                  onChange={(e) => handleChange('site.author', e.target.value)}
                  className="w-full rounded-lg border border-input bg-background py-2 px-3 focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">网站 URL</label>
                <input
                  type="url"
                  value={config.site?.url || ''}
                  onChange={(e) => handleChange('site.url', e.target.value)}
                  className="w-full rounded-lg border border-input bg-background py-2 px-3 focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">网站描述</label>
              <textarea
                value={config.site?.description || ''}
                onChange={(e) => handleChange('site.description', e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-input bg-background py-2 px-3 focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">SEO 关键词</label>
              <textarea
                value={(config.site?.keywords || []).join(', ')}
                onChange={(e) => handleChange('site.keywords', e.target.value.split(',').map((k) => k.trim()).filter(Boolean))}
                rows={2}
                placeholder="输入关键词，用逗号分隔"
                className="w-full rounded-lg border border-input bg-background py-2 px-3 focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        )}

        {/* Content Tab */}
        {activeTab === 'content' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">文章卡片图片位置</label>
                <select
                  value={config.content?.postCardImagePosition || 'alternating'}
                  onChange={(e) => handleChange('content.postCardImagePosition', e.target.value)}
                  className="w-full rounded-lg border border-input bg-background py-2 px-3 focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="alternating">交替显示</option>
                  <option value="left">左侧</option>
                  <option value="right">右侧</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">预览缓存时间（秒）</label>
                <input
                  type="number"
                  value={config.content?.previewCacheTime || 3600}
                  onChange={(e) => handleChange('content.previewCacheTime', parseInt(e.target.value) || 3600)}
                  className="w-full rounded-lg border border-input bg-background py-2 px-3 focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">内容功能</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="addBlankTarget"
                    checked={config.content?.addBlankTarget || false}
                    onChange={(e) => handleChange('content.addBlankTarget', e.target.checked)}
                  />
                  <label htmlFor="addBlankTarget">在新标签页打开外部链接</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="smoothScroll"
                    checked={config.content?.smoothScroll || false}
                    onChange={(e) => handleChange('content.smoothScroll', e.target.checked)}
                  />
                  <label htmlFor="smoothScroll">启用平滑滚动</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="addHeadingLevel"
                    checked={config.content?.addHeadingLevel || false}
                    onChange={(e) => handleChange('content.addHeadingLevel', e.target.checked)}
                  />
                  <label htmlFor="addHeadingLevel">添加标题锚点</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="enhanceCodeBlock"
                    checked={config.content?.enhanceCodeBlock || false}
                    onChange={(e) => handleChange('content.enhanceCodeBlock', e.target.checked)}
                  />
                  <label htmlFor="enhanceCodeBlock">增强代码块</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="enableCodeCopy"
                    checked={config.content?.enableCodeCopy || false}
                    onChange={(e) => handleChange('content.enableCodeCopy', e.target.checked)}
                  />
                  <label htmlFor="enableCodeCopy">启用代码复制按钮</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="enableLinkEmbed"
                    checked={config.content?.enableLinkEmbed || false}
                    onChange={(e) => handleChange('content.enableLinkEmbed', e.target.checked)}
                  />
                  <label htmlFor="enableLinkEmbed">启用链接嵌入</label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tab */}
        {activeTab === 'navigation' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">导航菜单</h3>
              {config.navigation?.map((item, index) => (
                <div key={index} className="border border-border rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">名称</label>
                      <input
                        type="text"
                        value={item.name || ''}
                        onChange={(e) => handleArrayChange('navigation', index, 'name', e.target.value)}
                        className="w-full rounded-lg border border-input bg-background py-2 px-3 focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">路径</label>
                      <input
                        type="text"
                        value={item.path || ''}
                        onChange={(e) => handleArrayChange('navigation', index, 'path', e.target.value)}
                        className="w-full rounded-lg border border-input bg-background py-2 px-3 focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">图标</label>
                      <input
                        type="text"
                        value={item.icon || ''}
                        onChange={(e) => handleArrayChange('navigation', index, 'icon', e.target.value)}
                        placeholder="例如：ri:home-line"
                        className="w-full rounded-lg border border-input bg-background py-2 px-3 focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </div>
                  
                  {item.children && item.children.length > 0 && (
                    <div className="ml-4 mt-4 space-y-2">
                      <h4 className="text-sm font-medium mb-2">子菜单</h4>
                      {item.children.map((child, childIndex) => (
                        <div key={childIndex} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={child.name || ''}
                            onChange={(e) => handleArrayChange(`navigation.${index}.children`, childIndex, 'name', e.target.value)}
                            className="flex-1 rounded-lg border border-input bg-background py-1 px-2 focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                          <input
                            type="text"
                            value={child.path || ''}
                            onChange={(e) => handleArrayChange(`navigation.${index}.children`, childIndex, 'path', e.target.value)}
                            className="w-48 rounded-lg border border-input bg-background py-1 px-2 focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleArrayRemove(`navigation.${index}.children`, childIndex)}
                          >
                            移除
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleArrayAdd(`navigation.${index}.children`, { name: '', path: '', icon: '' })}
                        className="mt-2"
                      >
                        添加子菜单项
                      </Button>
                    </div>
                  )}
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleArrayRemove('navigation', index)}
                    className="mt-4"
                  >
                    移除菜单项
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => handleArrayAdd('navigation', { name: '', path: '', icon: '' })}
              >
                添加菜单项
              </Button>
            </div>
          </div>
        )}

        {/* Social Links Tab */}
        {activeTab === 'social' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">社交链接</h3>
              {config.social && Object.entries(config.social).map(([key, value]) => (
                <div key={key} className="border border-border rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">平台</label>
                      <input
                        type="text"
                        value={key}
                        readOnly
                        className="w-full rounded-lg border border-input bg-background py-2 px-3 focus:outline-none focus:ring-2 focus:ring-ring bg-muted"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">URL</label>
                      <input
                        type="url"
                        value={(value as any).url || ''}
                        onChange={(e) => handleChange(`social.${key}.url`, e.target.value)}
                        className="w-full rounded-lg border border-input bg-background py-2 px-3 focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">图标</label>
                      <input
                        type="text"
                        value={(value as any).icon || ''}
                        onChange={(e) => handleChange(`social.${key}.icon`, e.target.value)}
                        placeholder="例如：ri:github-fill"
                        className="w-full rounded-lg border border-input bg-background py-2 px-3 focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comments Tab */}
        {activeTab === 'comment' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">评论提供商</label>
              <select
                value={config.comment?.provider || 'none'}
                onChange={(e) => handleChange('comment.provider', e.target.value)}
                className="w-full rounded-lg border border-input bg-background py-2 px-3 focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="none">无</option>
                <option value="giscus">Giscus</option>
                <option value="waline">Waline</option>
                <option value="twikoo">Twikoo</option>
                <option value="remark42">Remark42</option>
              </select>
            </div>

            {config.comment?.provider === 'giscus' && (
              <div className="border border-border rounded-lg p-4 space-y-4">
                <h3 className="text-lg font-medium">Giscus 配置</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">仓库</label>
                    <input
                      type="text"
                      value={config.comment?.giscus?.repo || ''}
                      onChange={(e) => handleChange('comment.giscus.repo', e.target.value)}
                      placeholder="username/repo"
                      className="w-full rounded-lg border border-input bg-background py-2 px-3 focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">仓库 ID</label>
                    <input
                      type="text"
                      value={config.comment?.giscus?.repoId || ''}
                      onChange={(e) => handleChange('comment.giscus.repoId', e.target.value)}
                      className="w-full rounded-lg border border-input bg-background py-2 px-3 focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">分类</label>
                    <input
                      type="text"
                      value={config.comment?.giscus?.category || ''}
                      onChange={(e) => handleChange('comment.giscus.category', e.target.value)}
                      className="w-full rounded-lg border border-input bg-background py-2 px-3 focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">分类 ID</label>
                    <input
                      type="text"
                      value={config.comment?.giscus?.categoryId || ''}
                      onChange={(e) => handleChange('comment.giscus.categoryId', e.target.value)}
                      className="w-full rounded-lg border border-input bg-background py-2 px-3 focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Advanced Tab */}
        {activeTab === 'advanced' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Timezone</label>
                <input
                  type="text"
                  value={config.site?.timezone || 'Asia/Shanghai'}
                  onChange={(e) => handleChange('site.timezone', e.target.value)}
                  className="w-full rounded-lg border border-input bg-background py-2 px-3 focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Start Year</label>
                <input
                  type="number"
                  value={config.site?.startYear || new Date().getFullYear()}
                  onChange={(e) => handleChange('site.startYear', parseInt(e.target.value) || new Date().getFullYear())}
                  className="w-full rounded-lg border border-input bg-background py-2 px-3 focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Default OG Image</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={config.site?.defaultOgImage || ''}
                  onChange={(e) => handleChange('site.defaultOgImage', e.target.value)}
                  className="flex-1 rounded-lg border border-input bg-background py-2 px-3 focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  type="button"
                  onClick={() => setShowBackgroundPicker(true)}
                  className="flex size-10 items-center justify-center rounded border border-input bg-muted/30 hover:bg-muted/50"
                  title="从媒体库选择"
                >
                  <Icon icon="ri:image-line" className="size-5" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Background Image</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={config.site?.backgroundImage || ''}
                  onChange={(e) => handleChange('site.backgroundImage', e.target.value)}
                  className="flex-1 rounded-lg border border-input bg-background py-2 px-3 focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="网站背景图片URL"
                />
                <button
                  type="button"
                  onClick={() => setShowBackgroundPicker(true)}
                  className="flex size-10 items-center justify-center rounded border border-input bg-muted/30 hover:bg-muted/50"
                  title="从媒体库选择"
                >
                  <Icon icon="ri:image-line" className="size-5" />
                </button>
              </div>
            </div>

            {/* Image Picker */}
            <ImagePicker
              isOpen={showBackgroundPicker}
              onClose={() => setShowBackgroundPicker(false)}
              onSelect={(imageUrl) => {
                handleChange('site.backgroundImage', imageUrl);
                setShowBackgroundPicker(false);
              }}
              currentImage={config.site?.backgroundImage}
              title="选择背景图片"
            />
          </div>
        )}
      </div>
    </div>
  );
}
