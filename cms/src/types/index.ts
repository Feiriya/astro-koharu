/**
 * CMS Type Definitions
 */

/**
 * Configuration for a single editor
 */
export interface EditorConfig {
  /** Unique identifier for the editor */
  id: string;
  /** Display name */
  name: string;
  /** Iconify icon identifier (e.g., 'ri:vscode-line') */
  icon: string;
  /** URL template with placeholders: {path}, {line}, {column} */
  urlTemplate: string;
}

/**
 * CMS configuration from cms.yaml
 */
export interface CMSConfig {
  /** Whether CMS features are enabled (dev only) */
  enabled: boolean;
  /** Absolute path to the local project directory */
  localProjectPath: string;
  /** Relative path from project root to content directory (default: 'src/content/blog') */
  contentRelativePath: string;
  /** List of configured editors */
  editors: EditorConfig[];
}

/**
 * Blog post frontmatter schema
 */
export interface BlogSchema {
  title: string;
  date?: Date;
  updated?: Date;
  description?: string;
  categories?: string | string[] | string[][];
  tags?: string[];
  cover?: string;
  link?: string;
  subtitle?: string;
  draft?: boolean;
  sticky?: boolean;
  tocNumbering?: boolean;
  excludeFromSummary?: boolean;
  math?: boolean;
  quiz?: boolean;
}

/**
 * Result from reading a post
 */
export interface ReadPostResult {
  frontmatter: BlogSchema;
  content: string;
}

/**
 * Post list item for dashboard display
 */
export interface PostListItem {
  id: string;
  slug: string;
  title: string;
  date: string;
  updated?: string;
  categories: string[];
  tags: string[];
  draft: boolean;
  sticky: boolean;
}

/**
 * Dashboard statistics
 */
export interface DashboardStats {
  total: number;
  published: number;
  draft: number;
  categoryStats: { name: string; count: number }[];
  tagStats: { name: string; count: number }[];
  recentPosts: PostListItem[];
}

/**
 * Response from list posts API
 */
export interface ListPostsResponse {
  posts: PostListItem[];
  total: number;
  stats: DashboardStats;
  categories: string[];
  tags: string[];
}

/**
 * Parameters for listing posts
 */
export interface ListPostsParams {
  category?: string;
  tag?: string;
  status?: 'all' | 'draft' | 'published';
  search?: string;
  sort?: 'date' | 'title' | 'updated';
  order?: 'asc' | 'desc';
}

/**
 * Parameters for creating a post
 */
export interface CreatePostParams {
  title: string;
  categories?: string[];
  tags?: string[];
  draft?: boolean;
  categoryMappings?: Record<string, string>;
}

/**
 * Response from create post API
 */
export interface CreatePostResponse {
  success: boolean;
  postId: string;
  message?: string;
}

/**
 * Response from toggle draft API
 */
export interface ToggleDraftResponse {
  success: boolean;
  draft: boolean;
}

/**
 * Response from toggle sticky API
 */
export interface ToggleStickyResponse {
  success: boolean;
  sticky: boolean;
}

/**
 * User model
 */
export interface User {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'user';
}

/**
 * Login request
 */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * Register request
 */
export interface RegisterRequest {
  username: string;
  password: string;
  role?: 'admin' | 'user';
}

/**
 * Auth response
 */
export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    username: string;
    role: 'admin' | 'user';
  };
  error?: string;
}

/**
 * Current user response
 */
export interface CurrentUserResponse {
  user: {
    id: string;
    username: string;
    role: 'admin' | 'user';
  };
  error?: string;
}

/**
 * Media file model
 */
export interface MediaFile {
  id: string;
  name: string;
  path: string;
  size: number;
  createdAt: string;
  updatedAt: string;
  category?: string;
}

/**
 * Media list response
 */
export interface MediaListResponse {
  files: MediaFile[];
  total: number;
}

/**
 * Media upload response
 */
export interface MediaUploadResponse {
  success: boolean;
  file?: MediaFile;
  error?: string;
}

/**
 * Media delete response
 */
export interface MediaDeleteResponse {
  success: boolean;
  error?: string;
}


/**
 * Theme config types
 */
export interface ThemeConfig {
  site?: {
    title?: string;
    subtitle?: string;
    author?: string;
    url?: string;
    description?: string;
    keywords?: string[];
    timezone?: string;
    startYear?: number;
    defaultOgImage?: string;
    backgroundImage?: string;
  };
  content?: {
    addBlankTarget?: boolean;
    smoothScroll?: boolean;
    addHeadingLevel?: boolean;
    enhanceCodeBlock?: boolean;
    enableCodeCopy?: boolean;
    enableLinkEmbed?: boolean;
    previewCacheTime?: number;
    postCardImagePosition?: 'alternating' | 'left' | 'right';
  };
  navigation?: Array<{
    name?: string;
    path?: string;
    icon?: string;
    children?: Array<{
      name?: string;
      path?: string;
      icon?: string;
    }>;
  }>;
  social?: Record<string, {
    url?: string;
    icon?: string;
    color?: string;
  }>;
  comment?: {
    provider?: 'none' | 'giscus' | 'waline' | 'twikoo' | 'remark42';
    giscus?: {
      repo?: string;
      repoId?: string;
      category?: string;
      categoryId?: string;
    };
  }>;
  [key: string]: any;
}
