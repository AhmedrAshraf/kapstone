import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';

const ADVOCACY_CATEGORIES = [
  {
    id: 'standards',
    name: 'Standards of Care',
    description: 'Advancing KAP treatment standards'
  },
  {
    id: 'insurance',
    name: 'Insurance Coverage',
    description: 'Expanding insurance coverage for KAP'
  },
  {
    id: 'research',
    name: 'Research',
    description: 'Supporting KAP research initiatives'
  },
  {
    id: 'policy',
    name: 'Policy',
    description: 'Influencing healthcare policy'
  },
  {
    id: 'education',
    name: 'Education',
    description: 'Professional and public education'
  },
  {
    id: 'access',
    name: 'Access',
    description: 'Improving treatment accessibility'
  }
];

export function NewAdvocacyPost() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    action_items: [] as string[],
    is_published: false
  });
  const [actionItem, setActionItem] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('advocacy_posts')
        .insert([
          {
            ...formData,
            author_id: user.id,
            action_items: { items: formData.action_items }
          }
        ]);

      if (error) throw error;
      navigate('/member-hub/voice');
    } catch (err) {
      setError('Failed to create advocacy post. Please try again.');
      console.error('Error creating advocacy post:', err);
    } finally {
      setLoading(false);
    }
  };

  const addActionItem = () => {
    if (actionItem.trim()) {
      setFormData({
        ...formData,
        action_items: [...formData.action_items, actionItem.trim()]
      });
      setActionItem('');
    }
  };

  const removeActionItem = (index: number) => {
    setFormData({
      ...formData,
      action_items: formData.action_items.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="p-8">
      <button
        onClick={() => navigate('/member-hub/voice')}
        className="mb-6 text-kapstone-sage hover:text-kapstone-sage-dark inline-flex items-center"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to KAPstone Voice
      </button>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-kapstone-purple mb-8">
          Create New Advocacy Post
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
              {ADVOCACY_CATEGORIES.map((category) => (
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
              rows={10}
              className="w-full p-3 border rounded-md focus:ring-kapstone-sage focus:border-kapstone-sage"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Action Items
            </label>
            <div className="space-y-4">
              <div className="flex gap-2">
                <input <boltAction type="file" filePath="src/pages/member/NewAdvocacyPost.tsx">
                  type="text"
                  value={actionItem}
                  onChange={(e) => setActionItem(e.target.value)}
                  className="flex-1 p-3 border rounded-md focus:ring-kapstone-sage focus:border-kapstone-sage"
                  placeholder="Add an action item"
                />
                <button
                  type="button"
                  onClick={addActionItem}
                  className="px-4 py-2 bg-kapstone-sage text-white rounded-md hover:bg-kapstone-sage-dark"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-2">
                {formData.action_items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                  >
                    <span className="text-gray-700">{item}</span>
                    <button
                      type="button"
                      onClick={() => removeActionItem(index)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
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
              Publish this advocacy post
            </label>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-kapstone-sage text-white rounded-md hover:bg-kapstone-sage-dark disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}