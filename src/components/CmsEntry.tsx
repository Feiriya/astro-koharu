/**
 * CMS Entry Component
 *
 * Component for entering the CMS backend management system.
 */

import { cmsConfig } from '@constants/site-config';
import { Icon } from '@iconify/react';

export function CmsEntry() {
  const handleOpenCms = () => {
    window.open(cmsConfig.url, '_blank');
  };

  return (
    <button
      type="button"
      onClick={handleOpenCms}
      className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full bg-red-500 px-6 py-3 text-white shadow-xl transition-all hover:bg-red-600 hover:scale-110"
      title="打开 CMS 后台管理系统"
      style={{
        position: 'fixed',
        bottom: '16px',
        right: '16px',
        zIndex: 9999,
        padding: '12px 24px',
        borderRadius: '9999px',
        backgroundColor: '#ef4444',
        color: 'white',
        fontWeight: 'bold',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        cursor: 'pointer',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '16px'
      }}
    >
      <Icon icon="ri:dashboard-3-line" className="size-6" />
      <span>CMS</span>
    </button>
  );
}
