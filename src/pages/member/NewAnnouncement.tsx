import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { MarkdownEditor } from '../../components/editor/MarkdownEditor';

export function NewAnnouncement() {
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('announcements')
        .insert([
          {
            ...formData,
            author_id: user.id,
            publish_date: formData.publish_date || null,
            expiry_date: formData.expiry_date || null,
            content_format: 'markdown'
          }
        ]);

      if (error) throw error;
      navigate('/member-hub/announcements');
    } catch (err) {
      setError('Failed to create announcement. Please try again.');
      console.error('Error creating announcement:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <button
        onClick={() => navigate('/member-hub/announcements')}
        className="mb-6 text-kapstone-sage hover:text-kapstone-sage-dark inline-flex items-center"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Announcements
      </button>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-kapstone-purple mb-8">
          Create New Announcement
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
              Publish immediately
            </label>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-kapstone-sage text-white rounded-md hover:bg-kapstone-sage-dark disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Announcement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}