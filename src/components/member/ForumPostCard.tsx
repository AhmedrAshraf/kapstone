import React from 'react';
import { MessageSquare, Edit2, Trash2 } from 'lucide-react';
import { ForumPost } from '../../types/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import { MarkdownPreview } from '../editor/MarkdownPreview';

interface ForumPostCardProps {
  post: ForumPost;
  onDelete?: () => void;
}

export function ForumPostCard({ post, onDelete }: ForumPostCardProps) {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const canEdit = user?.role === 'super_admin' || 
    (user?.id === post.author_id && 
    (new Date().getTime() - new Date(post.created_at).getTime()) / (1000 * 60 * 60) <= 24);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('forum_posts')
        .delete()
        .eq('id', post.id);

      if (error) throw error;
      if (onDelete) onDelete();
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/member-hub/forum/edit/${post.id}`);
  };

  return (
    <Link
      to={`/member-hub/forum/${post.id}`}
      className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow"
    >
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-kapstone-purple mb-2">
              {post.title}
            </h3>
            <div className="text-gray-600 line-clamp-2 mb-4">
              <MarkdownPreview content={post.content} />
            </div>
            <div className="flex items-center text-sm text-gray-500">
              {post.author?.full_name || post.author?.email}
              <span className="mx-2">•</span>
              {new Date(post.created_at).toLocaleDateString()}
            </div>
          </div>
          <div className="flex items-start gap-4 ml-4">
            {post.category && (
              <span className="px-3 py-1 bg-kapstone-sage/10 text-kapstone-sage rounded-full text-sm">
                {post.category.name}
              </span>
            )}
            {canEdit && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleEdit}
                  className="p-1 text-gray-500 hover:text-kapstone-sage rounded-full hover:bg-gray-100"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-1 text-gray-500 hover:text-red-500 rounded-full hover:bg-gray-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}