import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { BlogPost as BlogPostType } from '../types/supabase';
import { useAuthStore } from '../store/authStore';
import { MarkdownPreview } from '../components/editor/MarkdownPreview';
import { useScrollToTop } from '../hooks/useScrollToTop';

export function BlogPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Add scroll to top functionality
  useScrollToTop();

  useEffect(() => {
    loadPost();
  }, [slug]);

  const loadPost = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          *,
          author:users(full_name, email)
        `)
        .eq('slug', slug)
        .single();

      if (error) throw error;
      setPost(data);

      // Update schema if provided
      if (data.schema_markup) {
        try {
          const script = document.createElement('script');
          script.type = 'application/ld+json';
          script.text = data.schema_markup;
          document.head.appendChild(script);
        } catch (err) {
          console.error('Error adding schema markup:', err);
        }
      }

      // Update meta tags
      document.title = data.meta_title || data.title;
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', data.meta_description || '');
      }
    } catch (err) {
      console.error('Error loading post:', err);
      setError('Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!user?.id || !post || isDeleting) return;
    
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      setIsDeleting(true);
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', post.id);

      if (error) throw error;
      navigate('/blog');
    } catch (err) {
      console.error('Error deleting post:', err);
      setError('Failed to delete post. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-12">
          <div className="animate-pulse space-y-8">
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-12">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center text-red-600">
              {error || 'Post not found'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-12">
        <Link
          to="/blog"
          className="inline-flex items-center text-kapstone-sage hover:text-kapstone-sage-dark mb-8"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Blog
        </Link>

        <article className="bg-white rounded-lg shadow-lg overflow-hidden">
          {post.featured_image && (
            <div className="aspect-w-16 aspect-h-9">
              <img
                src={post.featured_image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex gap-2 mb-4">
                  {post.categories?.map((category) => (
                    <span
                      key={category}
                      className="px-2 py-1 bg-kapstone-sage/10 text-kapstone-sage rounded-full text-sm"
                    >
                      {category}
                    </span>
                  ))}
                </div>
                <h1 className="text-3xl font-bold text-kapstone-purple">
                  {post.title}
                </h1>
              </div>
              {user?.role === 'super_admin' && !isDeleting && (
                <div className="flex items-center space-x-2">
                  <Link
                    to={`/blog/edit/${post.id}`}
                    className="p-2 text-gray-500 hover:text-kapstone-sage rounded-full hover:bg-gray-100"
                  >
                    <Edit2 className="h-5 w-5" />
                  </Link>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="p-2 text-gray-500 hover:text-red-500 rounded-full hover:bg-gray-100 disabled:opacity-50"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center text-sm text-gray-500 mb-8">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                <span>{post.author?.full_name || 'Anonymous'}</span>
              </div>
              <span className="mx-2">•</span>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{new Date(post.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="prose prose-lg max-w-none">
              <MarkdownPreview content={post.content} />
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}