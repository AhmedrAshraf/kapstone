import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MessageSquare, Edit2, Trash2, Reply, X, Check, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { ForumPost as ForumPostType } from '../../types/supabase';
import { useAuthStore } from '../../store/authStore';
import { MarkdownEditor } from '../../components/editor/MarkdownEditor';
import { MarkdownPreview } from '../../components/editor/MarkdownPreview';
import { FileAttachments } from '../../components/FileAttachments';

interface Reply {
  id: string;
  content: string;
  author_id: string;
  parent_id: string | null;
  post_id: string;
  created_at: string;
  author?: {
    full_name?: string;
    email: string;
  };
}

export function ForumPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [post, setPost] = useState<ForumPostType | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [newReply, setNewReply] = useState('');
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/', { replace: true });
      return;
    }

    if (!id) {
      navigate('/member-hub/forum', { replace: true });
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load post and replies in parallel
        const [postResult, repliesResult] = await Promise.all([
          supabase
            .from('forum_posts')
            .select(`
              *,
              author:users!forum_posts_author_id_fkey(full_name, email),
              category:forum_categories(*)
            `)
            .eq('id', id)
            .single(),

          supabase
            .from('forum_replies')
            .select(`
              *,
              author:users!forum_replies_author_id_fkey(full_name, email)
            `)
            .eq('post_id', id)
            .order('created_at', { ascending: true })
        ]);

        if (postResult.error) throw postResult.error;
        if (repliesResult.error) throw repliesResult.error;

        setPost(postResult.data);
        setReplies(repliesResult.data || []);
      } catch (err) {
        console.error('Error loading forum data:', err);
        setError('Failed to load post. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, user, navigate]);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !newReply.trim() || !id) return;

    try {
      const { error } = await supabase
        .from('forum_replies')
        .insert([{
          post_id: id,
          author_id: user.id,
          content: newReply,
          parent_id: replyToId
        }]);

      if (error) throw error;
      
      setNewReply('');
      setReplyToId(null);
      
      // Reload replies
      const { data: updatedReplies, error: repliesError } = await supabase
        .from('forum_replies')
        .select(`
          *,
          author:users!forum_replies_author_id_fkey(full_name, email)
        `)
        .eq('post_id', id)
        .order('created_at', { ascending: true });

      if (repliesError) throw repliesError;
      setReplies(updatedReplies || []);
    } catch (err) {
      console.error('Error creating reply:', err);
      setError('Failed to post reply. Please try again.');
    }
  };

  const handleEditReply = async (replyId: string) => {
    if (!user?.id || !editedContent.trim()) return;

    try {
      const { error } = await supabase
        .from('forum_replies')
        .update({ content: editedContent })
        .eq('id', replyId)
        .eq('author_id', user.id);

      if (error) throw error;
      
      setEditingReplyId(null);
      setEditedContent('');
      
      // Reload replies
      const { data: updatedReplies, error: repliesError } = await supabase
        .from('forum_replies')
        .select(`
          *,
          author:users!forum_replies_author_id_fkey(full_name, email)
        `)
        .eq('post_id', id)
        .order('created_at', { ascending: true });

      if (repliesError) throw repliesError;
      setReplies(updatedReplies || []);
    } catch (err) {
      console.error('Error updating reply:', err);
      setError('Failed to update reply. Please try again.');
    }
  };

  const handleDeleteReply = async (replyId: string) => {
    if (!user?.id) return;
    
    if (!window.confirm('Are you sure you want to delete this reply?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('forum_replies')
        .delete()
        .eq('id', replyId)
        .eq('author_id', user.id);

      if (error) throw error;
      
      // Reload replies
      const { data: updatedReplies, error: repliesError } = await supabase
        .from('forum_replies')
        .select(`
          *,
          author:users!forum_replies_author_id_fkey(full_name, email)
        `)
        .eq('post_id', id)
        .order('created_at', { ascending: true });

      if (repliesError) throw repliesError;
      setReplies(updatedReplies || []);
    } catch (err) {
      console.error('Error deleting reply:', err);
      setError('Failed to delete reply. Please try again.');
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
        .from('forum_posts')
        .delete()
        .eq('id', post.id);

      if (error) throw error;
      navigate('/member-hub/forum');
    } catch (err) {
      console.error('Error deleting post:', err);
      setError('Failed to delete post. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const canEdit = user?.role === 'super_admin' || user?.id === post?.author_id;

  const canEditReply = (reply: Reply) => {
    if (!user) return false;
    if (user.role === 'super_admin') return true;
    
    const isAuthor = user.id === reply.author_id;
    const isWithin24Hours = (new Date().getTime() - new Date(reply.created_at).getTime()) / (1000 * 60 * 60) <= 24;
    
    return isAuthor && isWithin24Hours;
  };

  const formatQuote = (reply: Reply) => {
    const authorName = reply.author?.full_name || reply.author?.email;
    const lines = reply.content.split('\n');
    const quotedLines = lines.map(line => `> ${line}`).join('\n');
    return `@${authorName} wrote:\n\n${quotedLines}\n\n`;
  };

  const renderReplies = (parentId: string | null = null, depth = 0): JSX.Element[] => {
    return replies
      .filter(reply => reply.parent_id === parentId)
      .map(reply => (
        <div 
          key={reply.id} 
          className={`bg-white rounded-lg shadow-lg p-6 ${
            depth > 0 ? 'ml-8 border-l-4 border-kapstone-sage/20' : ''
          }`}
        >
          {editingReplyId === reply.id ? (
            <div className="space-y-4">
              <MarkdownEditor
                value={editedContent}
                onChange={setEditedContent}
                rows={4}
                placeholder="Edit your reply..."
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setEditingReplyId(null);
                    setEditedContent('');
                  }}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleEditReply(reply.id)}
                  className="p-2 text-kapstone-sage hover:text-kapstone-sage-dark rounded-full hover:bg-gray-100"
                >
                  <Check className="h-5 w-5" />
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="prose prose-lg max-w-none mb-4">
                <MarkdownPreview content={reply.content} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-500">
                  <span>By {reply.author?.full_name || reply.author?.email}</span>
                  <span className="mx-2">•</span>
                  <span>{new Date(reply.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setReplyToId(reply.id);
                      setNewReply(formatQuote(reply));
                      document.getElementById('reply-form')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="p-2 text-gray-500 hover:text-kapstone-sage rounded-full hover:bg-gray-100"
                  >
                    <Reply className="h-5 w-5" />
                  </button>
                  {canEditReply(reply) && (
                    <>
                      <button
                        onClick={() => {
                          setEditingReplyId(reply.id);
                          setEditedContent(reply.content);
                        }}
                        className="p-2 text-gray-500 hover:text-kapstone-sage rounded-full hover:bg-gray-100"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteReply(reply.id)}
                        className="p-2 text-gray-500 hover:text-red-500 rounded-full hover:bg-gray-100"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
          {renderReplies(reply.id, depth + 1)}
        </div>
      ));
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-kapstone-sage border-t-transparent"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="p-8">
        <Link
          to="/member-hub/forum"
          className="inline-flex items-center text-kapstone-sage hover:text-kapstone-sage-dark mb-8"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Forum
        </Link>
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          <p className="text-center font-medium">
            {error || 'Post not found'}
          </p>
          <p className="text-center mt-2">
            <button
              onClick={() => window.location.reload()}
              className="text-kapstone-sage hover:text-kapstone-sage-dark"
            >
              Try again
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <Link
        to="/member-hub/forum"
        className="inline-flex items-center text-kapstone-sage hover:text-kapstone-sage-dark mb-8"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Forum
      </Link>

      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-start justify-between mb-6">
            <h1 className="text-3xl font-bold text-kapstone-purple">
              {post.title}
            </h1>
            {canEdit && !isDeleting && (
              <div className="flex items-center space-x-2">
                <Link
                  to={`/member-hub/forum/edit/${post.id}`}
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

          <div className="prose prose-lg max-w-none mb-4">
            <MarkdownPreview content={post.content} />
          </div>

          <FileAttachments entityType="forum_post" entityId={post.id} />

          <div className="flex items-center justify-between text-sm text-gray-500 mt-6">
            <div className="flex items-center">
              <MessageSquare className="h-4 w-4 mr-2" />
              <span>By {post.author?.full_name || post.author?.email}</span>
              {post.category && (
                <>
                  <span className="mx-2">•</span>
                  <span>{post.category.name}</span>
                </>
              )}
            </div>
            <span>{new Date(post.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="space-y-6">
          {renderReplies()}
        </div>

        <div id="reply-form" className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-xl font-semibold text-kapstone-purple mb-4">
            {replyToId ? 'Reply to Comment' : 'Add a Reply'}
          </h2>
          <form onSubmit={handleReply} className="space-y-4">
            <MarkdownEditor
              value={newReply}
              onChange={setNewReply}
              rows={6}
              placeholder="Write your reply... (Markdown supported)"
              entityType="forum_post"
              entityId={post.id}
            />
            <div className="flex justify-end gap-4">
              {replyToId && (
                <button
                  type="button"
                  onClick={() => {
                    setReplyToId(null);
                    setNewReply('');
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel Reply
                </button>
              )}
              <button
                type="submit"
                className="px-6 py-2 bg-kapstone-sage text-white rounded-md hover:bg-kapstone-sage-dark"
              >
                Post Reply
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}