import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { PageContent, ContentCache } from '../types/supabase';
import { useAuthStore } from '../store/authStore';

// Cache for storing content
const contentCache: Record<string, PageContent[]> = {};
const staticCache: Record<string, ContentCache[]> = {};

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export function usePageContent(pageId: string) {
  const [content, setContent] = useState<PageContent[]>(() => contentCache[pageId] || []);
  const [loading, setLoading] = useState(!contentCache[pageId]);
  const [error, setError] = useState<Error | null>(null);
  const [initialized, setInitialized] = useState(!!contentCache[pageId]);
  const { user } = useAuthStore();

  const loadContent = useCallback(async () => {
    // Return early if appropriate cache exists
    if ((user?.role === 'super_admin' && contentCache[pageId]) || 
        (!user?.role && staticCache[pageId])) {
      return;
    }

    let retryCount = 0;
    let lastError: Error | null = null;

    while (retryCount < MAX_RETRIES) {
      try {
        setLoading(true);
        setError(null);

        // Use different queries for authenticated vs non-authenticated users
        const { data, error: fetchError } = user?.role === 'super_admin'
          ? await supabase
              .from('page_content')
              .select('*')
              .eq('page_id', pageId)
              .order('created_at')
          : await supabase
              .from('content_cache')
              .select('*')
              .eq('page_id', pageId)
              .eq('is_default', true)
              .order('last_modified');

        if (fetchError) throw fetchError;
        
        if (user?.role === 'super_admin') {
          contentCache[pageId] = data || [];
          setContent(data || []);
        } else {
          staticCache[pageId] = data || [];
          setContent(data.map(cache => ({
            id: cache.id,
            page_id: cache.page_id,
            section_id: cache.section_id,
            content: cache.rendered_content,
            content_type: 'text',
            version: 1,
            is_published: true,
            created_at: cache.last_modified,
            updated_at: cache.last_modified,
            created_by: '',
            updated_by: ''
          })));
        }

        setInitialized(true);
        return; // Success, exit retry loop
      } catch (err) {
        lastError = err instanceof Error ? err : new Error('Failed to load content');
        console.warn(`Attempt ${retryCount + 1} failed:`, lastError);
        retryCount++;
        
        if (retryCount < MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * retryCount));
        }
      }
    }

    // All retries failed
    console.error('Error loading content:', lastError);
    setError(lastError);
    setContent([]);
    setLoading(false);
  }, [pageId, user?.role]);

  useEffect(() => {
    loadContent();
  }, [loadContent, user?.role]);

  const updateContent = async (updatedContent: Partial<PageContent>) => {
    if (!updatedContent.page_id || !updatedContent.section_id) {
      throw new Error('Missing required fields: page_id and section_id');
    }

    try {
      // Optimistically update cache and state
      const newContent = {
        ...updatedContent,
        version: 1,
        is_published: true,
        published_at: new Date().toISOString()
      };

      const updatedCache = [...(contentCache[pageId] || [])];
      const index = updatedCache.findIndex(item => 
        item.page_id === updatedContent.page_id && 
        item.section_id === updatedContent.section_id
      );

      if (index >= 0) {
        updatedCache[index] = { ...updatedCache[index], ...newContent };
      } else {
        updatedCache.push(newContent as PageContent);
      }

      contentCache[pageId] = updatedCache;
      setContent(updatedCache);

      // Perform the actual update
      const { data, error: updateError } = await supabase
        .from('page_content')
        .upsert(newContent, {
          onConflict: 'page_id,section_id',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (updateError) throw updateError;

      // Update cache with server response
      const finalCache = [...(contentCache[pageId] || [])];
      const finalIndex = finalCache.findIndex(item => 
        item.page_id === data.page_id && 
        item.section_id === data.section_id
      );

      if (finalIndex >= 0) {
        finalCache[finalIndex] = data;
      } else {
        finalCache.push(data);
      }

      contentCache[pageId] = finalCache;
      setContent(finalCache);

      return data;
    } catch (err) {
      console.error('Error updating content:', err);
      // Revert cache and state on error
      await loadContent();
      throw err;
    }
  };

  return { content, loading, error, initialized, updateContent };
}