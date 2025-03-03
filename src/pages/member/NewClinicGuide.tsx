import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';

const GUIDE_CATEGORIES = [
  {
    id: 'getting-started',
    name: 'Getting Started',
    description: 'Essential steps for establishing a KAP clinic'
  },
  {
    id: 'legal',
    name: 'Legal & Compliance',
    description: 'Legal requirements and regulatory compliance'
  },
  {
    id: 'operations',
    name: 'Operations',
    description: 'Day-to-day clinic operations and management'
  },
  {
    id: 'team-building',
    name: 'Team Building',
    description: 'Building and managing your clinical team'
  },
  {
    id: 'protocols',
    name: 'Clinical Protocols',
    description: 'Treatment protocols and best practices'
  },
  {
    id: 'marketing',
    name: 'Marketing & Growth',
    description: 'Marketing strategies and business development'
  }
];

export function NewClinicGuide() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    order_index: 0,
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
        .from('clinic_guides')
        .insert([
          {
            ...formData,
            author_id: user.id
          }
        ]);

      if (error) throw error;
      navigate('/member-hub/start-clinic');
    } catch (err) {
      setError('Failed to create guide. Please try again.');
      console.error('Error creating guide:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <button
        onClick={() => navigate('/member-hub/start-clinic')}
        className="mb-6 text-kapstone-sage hover:text-kapstone-sage-dark inline-flex items-center"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Clinic Guides
      </button>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-kapstone-purple mb-8">
          Create New Clinic Guide
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
              {GUIDE_CATEGORIES.map((category) => (
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
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={15}
              className="w-full p-3 border rounded-md focus:ring-kapstone-sage focus:border-kapstone-sage"
              required
            />
          </div>

          <div>
            <label htmlFor="order_index" className="block text-sm font-medium text-gray-700 mb-2">
              Display Order
            </label>
            <input
              type="number"
              id="order_index"
              value={formData.order_index}
              onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
              className="w-full p-3 border rounded-md focus:ring-kapstone-sage focus:border-kapstone-sage"
              min="0"
            />
            <p className="mt-1 text-sm text-gray-500">
              Lower numbers will appear first in the list
            </p>
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
              Publish this guide
            </label>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-kapstone-sage text-white rounded-md hover:bg-kapstone-sage-dark disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Guide'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}