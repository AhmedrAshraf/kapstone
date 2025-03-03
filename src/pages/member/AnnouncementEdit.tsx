import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { MarkdownEditor } from '../../components/editor/MarkdownEditor';
import { useScrollToTop } from '../../hooks/useScrollToTop';

export function AnnouncementEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'normal',
    is_published: false,
    publish_date: '',
    expiry_date: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useScrollToTop();

  useEffect(() => {
    if (!id) {
      navigate('/member-hub/announcements');
      return;
    }
    loadAnnouncement();
  }, [id]);

  const loadAnnouncement = async () => {
    if (!id || !user?.id) {
      navigate('/member-hub/announcements');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      // Check if user has permission to edit
      if (user.role !== 'super_admin') {
        navigate('/member-hub/announcements');
        return;
      }

      setFormData({
        title: data.title || '',
        content: data.content || '',
        priority: data.priority || 'normal',
        is_published: data.is_published || false,
        publish_date: data.publish_date ? new Date(data.publish_date).toISOString().slice(0, 16) : '',
        expiry_date: data.expiry_date ? new Date(data.expiry_date).toISOString().slice(0, 16) : ''
      });
    } catch (err) {
      console.error('Error loading announcement:', err);
      setError('Failed to load announcement');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !id || saving) return;

    try {
      setSaving(true);
      setError(null);

      const { error } = await supabase
        .from('announcements')
        .update({
          title: formData.title,
          content: formData.content,
          priority: formData.priority,
          is_published: formData.is_published,
          publish_date: formData.publish_date || null,
          expiry_date: formData.expiry_date || null,
          updated_at: new Date().toISOString(),
          content_format: 'markdown'
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      navigate(`/member-hub/announcements/${id}`);
    } catch (err) {
      console.error('Error updating announcement:', err);
      setError('Failed to update announcement. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-kapstone-sage border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <Link
        to={`/member-hub/announcements/${id}`}
        className="inline-flex items-center text-kapstone-sage hover:text-kapstone-sage-dark mb-8"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Announcement
      </Link>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-kapstone-purple mb-8">
          Edit Announcement
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-3 border rounded-md focus:ring-kapstone-sage focus:border-kapstone-sage"
              required
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <MarkdownEditor
              value={formData.content}
              onChange={(value) => setFormData({ ...formData, content: value })}
              rows={10}
              placeholder="Write your announcement content here..."
            />
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              id="priority"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full p-3 border rounded-md focus:ring-kapstone-sage focus:border-kapstone-sage"
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label htmlFor="publish_date" className="block text-sm font-medium text-gray-700 mb-2">
                Publish Date (optional)
              </label>
              <input
                type="datetime-local"
                id="publish_date"
                value={formData.publish_date}
                onChange={(e) => setFormData({ ...formData, publish_date: e.target.value })}
                className="w-full p-3 border rounded-md focus:ring-kapstone-sage focus:border-kapstone-sage"
              />
            </div>

            <div>
              <label htmlFor="expiry_date" className="block text-sm font-medium text-gray-700 mb-2">
                Expiry Date (optional)
              </label>
              <input
                type="datetime-local"
                id="expiry_date"
                value={formData.expiry_date}
                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                className="w-full p-3 border rounded-md focus:ring-kapstone-sage focus:border-kapstone-sage"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_published"
              checked={formData.is_published}
              onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
              className="h-4 w-4 text-kapstone-sage focus:ring-kapstone-sage border-gray-300 rounded"
            />
            <label htmlFor="is_published" className="ml-2 text-sm text-gray-700">
              Publish this announcement
            </label>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-kapstone-sage text-white rounded-md hover:bg-kapstone-sage-dark disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}