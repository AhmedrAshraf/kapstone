// Add to existing types
export interface PageContent {
  id: string;
  page_id: string;
  section_id: string;
  content: string;
  content_type: 'text' | 'image';
  version: number;
  file_info?: {
    size: number;
    type: string;
    dimensions?: {
      width: number;
      height: number;
    };
  };
  is_published: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

export interface ContentVersion {
  id: string;
  content_id: string;
  content: string;
  version: number;
  created_at: string;
  created_by: string;
  metadata: {
    reason?: string;
    changes?: string[];
  };
}

export interface ContentCache {
  id: string;
  page_id: string;
  section_id: string;
  rendered_content: string;
  cache_key: string;
  last_modified: string;
}

export interface ContentAuditLog {
  id: string;
  content_id: string;
  action: 'create' | 'update' | 'publish' | 'rollback' | 'delete';
  user_id: string;
  details: {
    from_version?: number;
    to_version?: number;
    changes?: string[];
  };
  created_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  meta_title?: string;
  meta_description?: string;
  schema_markup?: string;
  featured_image?: string;
  categories?: string[];
  published: boolean;
  author_id: string;
  author?: {
    full_name?: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
}