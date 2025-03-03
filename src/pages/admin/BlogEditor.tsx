import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Save, ArrowLeft, Image, Code, X, Upload } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { BlogPost } from '../../types/supabase';
import { useAuthStore } from '../../store/authStore';
import { slugify } from '../../utils/string';
import { MarkdownEditor } from '../../components/editor/MarkdownEditor';
import { MarkdownPreview } from '../../components/editor/MarkdownPreview';

const BLOG_CATEGORIES = [
  'Clinical Practice',
  'Research',
  'Patient Stories',
  'Industry News',
  'Treatment Insights',
  'Professional Development',
  'Policy & Advocacy',
  'Integration Techniques'
];

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function BlogEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [post, setPost] = useState<Partial<BlogPost>>({
    title: '',
    slug: '',
    content: '',
    meta_title: '',
    meta_description: '',
    schema_markup: '',
    featured_image: '',
    categories: [],
    published: false
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (id) {
      loadPost();
    }
  }, [id]);

  const loadPost = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        setPost(data);
      }
    } catch (err) {
      console.error('Error loading post:', err);
      setError('Failed to load post');
    }
  };

  const handleContentChange = (newContent: string) => {
    setPost(prev => ({ ...prev, content: newContent }));

    // Clear existing timer
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }

    // Set new timer for auto-save
    const timer = setTimeout(() => {
      handleAutoSave(newContent);
    }, 3000);

    setAutoSaveTimer(timer);
  };

  const handleAutoSave = async (content: string) => {
    if (!user?.id || !id) return;

    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({
          content,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Error auto-saving:', err);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!user?.id) return;

    // Validate file
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError(`Invalid file type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`);
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError(`File too large. Maximum size: ${MAX_IMAGE_SIZE / 1024 / 1024}MB`);
      return;
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).slice(2)}.${fileExt}`;
      const filePath = `blog/${id || 'new'}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('attachments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('attachments')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Failed to upload image');
      return null;
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || saving) return;

    try {
      setSaving(true);
      setError(null);

      const slug = post.slug || slugify(post.title || '');
      const postData = {
        ...post,
        slug,
        author_id: user.id,
        updated_at: new Date().toISOString()
      };

      if (id) {
        const { error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('blog_posts')
          .insert([{ ...postData, created_at: new Date().toISOString() }]);

        if (error) throw error;
      }

      navigate('/blog');
    } catch (err) {
      setError('Failed to save post');
      console.error('Error saving post:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/blog')}
                className="mr-4 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                {id ? 'Edit Post' : 'New Post'}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                {previewMode ? 'Edit' : 'Preview'}
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center px-4 py-2 bg-kapstone-sage text-white rounded-md hover:bg-kapstone-sage-dark disabled:opacity-50"
              >
                <Save className="h-5 w-5 mr-2" />
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {previewMode ? (
          <div className="bg-white rounded-lg shadow-lg p-8">
            {post.featured_image && (
              <img
                src={post.featured_image}
                alt={post.title}
                className="w-full h-64 object-cover rounded-lg mb-8"
              />
            )}
            <h1 className="text-3xl font-bold text-kapstone-purple mb-4">
              {post.title}
            </h1>
            <div className="flex gap-2 mb-6">
              {post.categories?.map((category) => (
                <span
                  key={category}
                  className="px-2 py-1 bg-kapstone-sage/10 text-kapstone-sage rounded-full text-sm"
                >
                  {category}
                </span>
              ))}
            </div>
            <div className="prose prose-lg max-w-none">
              <MarkdownPreview content={post.content || ''} />
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={post.title}
                onChange={(e) => setPost({ ...post, title: e.target.value })}
                className="w-full p-3 border rounded-md focus:ring-kapstone-sage focus:border-kapstone-sage"
                placeholder="Enter post title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categories
              </label>
              <div className="flex flex-wrap gap-2">
                {BLOG_CATEGORIES.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      const categories = post.categories || [];
                      setPost({
                        ...post,
                        categories: categories.includes(category)
                          ? categories.filter(c => c !== category)
                          : [...categories, category]
                      });
                    }}
                    className={`px-3 py-1 rounded-full text-sm ${
                      post.categories?.includes(category)
                        ? 'bg-kapstone-sage text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Featured Image
              </label>
              <div className="flex gap-4">
                <input
                  type="url"
                  value={post.featured_image || ''}
                  onChange={(e) => setPost({ ...post, featured_image: e.target.value })}
                  className="flex-1 p-3 border rounded-md focus:ring-kapstone-sage focus:border-kapstone-sage"
                  placeholder="https://example.com/image.jpg"
                />
                <button
                  type="button"
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = ALLOWED_IMAGE_TYPES.join(',');
                    input.onchange = async (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) {
                        const url = await handleImageUpload(file);
                        if (url) {
                          setPost({ ...post, featured_image: url });
                        }
                      }
                    };
                    input.click();
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  <Upload className="h-5 w-5" />
                </button>
              </div>
              {post.featured_image && (
                <div className="mt-2 relative">
                  <img
                    src={post.featured_image}
                    alt="Featured"
                    className="w-full h-48 object-cover rounded-md"
                  />
                  <button
                    onClick={() => setPost({ ...post, featured_image: '' })}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <MarkdownEditor
                value={post.content || ''}
                onChange={handleContentChange}
                rows={20}
                placeholder="Write your post content here... (Markdown supported)"
              />
            </div>

            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="inline-flex items-center text-kapstone-purple hover:text-kapstone-sage"
              >
                <Code className="h-5 w-5 mr-2" />
                {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
              </button>
            </div>

            {showAdvanced && (
              <div className="space-y-6 pt-6 border-t">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={post.slug || slugify(post.title || '')}
                    onChange={(e) => setPost({ ...post, slug: e.target.value })}
                    className="w-full p-3 border rounded-md focus:ring-kapstone-sage focus:border-kapstone-sage"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    value={post.meta_title || ''}
                    onChange={(e) => setPost({ ...post, meta_title: e.target.value })}
                    className="w-full p-3 border rounded-md focus:ring-kapstone-sage focus:border-kapstone-sage"
                    placeholder="SEO title (optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Description
                  </label>
                  <textarea
                    value={post.meta_description || ''}
                    onChange={(e) => setPost({ ...post, meta_description: e.target.value })}
                    className="w-full p-3 border rounded-md focus:ring-kapstone-sage focus:border-kapstone-sage"
                    rows={3}
                    placeholder="SEO description (optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Schema Markup
                  </label>
                  <textarea
                    value={post.schema_markup || ''}
                    onChange={(e) => setPost({ ...post, schema_markup: e.target.value })}
                    className="w-full p-3 border rounded-md focus:ring-kapstone-sage focus:border-kapstone-sage font-mono"
                    rows={10}
                    placeholder="JSON-LD Schema markup (optional)"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="published"
                    checked={post.published || false}
                    onChange={(e) => setPost({ ...post, published: e.target.checked })}
                    className="h-4 w-4 text-kapstone-sage focus:ring-kapstone-sage border-gray-300 rounded"
                  />
                  <label htmlFor="published" className="ml-2 text-sm text-gray-700">
                    Publish this post
                  </label>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}