import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Music, FileText, Building2, Scale } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';

const RESOURCE_CATEGORIES = [
  {
    id: 'music',
    name: 'Music Playlists',
    icon: Music,
    description: 'Curated playlists for KAP sessions'
  },
  {
    id: 'articles',
    name: 'KAP Articles',
    icon: FileText,
    description: 'Research and practice articles by theme'
  },
  {
    id: 'clinic',
    name: 'Starting Your Clinic',
    icon: Building2,
    description: 'Guides and resources for clinic setup'
  },
  {
    id: 'forms',
    name: 'Forms',
    icon: FileText,
    description: 'Essential forms and templates'
  },
  {
    id: 'legal',
    name: 'Legal Resources',
    icon: Scale,
    description: 'State regulations and legal guidance'
  }
];

export function NewResource() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    category: '',
    file_url: '',
    is_published: false
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
        .from('resources')
        .insert([
          {
            ...formData,
            author_id: user.id
          }
        ]);

      if (error) throw error;
      navigate('/member-hub/resources');
    } catch (err) {
      setError('Failed to create resource. Please try again.');
      console.error('Error creating resource:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <button
        onClick={() => navigate('/member-hub/resources')}
        className="mb-6 text-kapstone-sage hover:text-kapstone-sage-dark inline-flex items-center"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Resources
      </button>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-kapstone-purple mb-8">
          Add New Resource
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full p-3 border rounded-md focus:ring-kapstone-sage focus:border-kapstone-sage"
              required
            >
              <option value="">Select a category</option>
              {RESOURCE_CATEGORIES.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

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
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full p-3 border rounded-md focus:ring-kapstone-sage focus:border-kapstone-sage"
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={10}
              className="w-full p-3 border rounded-md focus:ring-kapstone-sage focus:border-kapstone-sage"
              required
            />
          </div>

          <div>
            <label htmlFor="file_url" className="block text-sm font-medium text-gray-700 mb-2">
              File URL (optional)
            </label>
            <input
              type="url"
              id="file_url"
              value={formData.file_url}
              onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
              className="w-full p-3 border rounded-md focus:ring-kapstone-sage focus:border-kapstone-sage"
            />
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
              Publish this resource
            </label>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-kapstone-sage text-white rounded-md hover:bg-kapstone-sage-dark disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Resource'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}