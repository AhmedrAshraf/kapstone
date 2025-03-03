import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';

export function NewJournalArticle() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    title: '',
    abstract: '',
    content: '',
    doi: '',
    keywords: [] as string[],
    is_peer_reviewed: false,
    is_published: false,
    publish_date: ''
  });
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('journal_articles')
        .insert([
          {
            ...formData,
            author_id: user.id,
            publish_date: formData.publish_date || null
          }
        ]);

      if (error) throw error;
      navigate('/member-hub/journal');
    } catch (err) {
      setError('Failed to create article. Please try again.');
      console.error('Error creating article:', err);
    } finally {
      setLoading(false);
    }
  };

  const addKeyword = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && keyword.trim()) {
      e.preventDefault();
      if (!formData.keywords.includes(keyword.trim())) {
        setFormData({
          ...formData,
          keywords: [...formData.keywords, keyword.trim()]
        });
      }
      setKeyword('');
    }
  };

  const removeKeyword = (keywordToRemove: string) => {
    setFormData({
      ...formData,
      keywords: formData.keywords.filter(k => k !== keywordToRemove)
    });
  };

  return (
    <div className="p-8">
      <button
        onClick={() => navigate('/member-hub/journal')}
        className="mb-6 text-kapstone-sage hover:text-kapstone-sage-dark inline-flex items-center"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Journal
      </button>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-kapstone-purple mb-8">
          Submit New Article
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
            <label htmlFor="abstract" className="block text-sm font-medium text-gray-700 mb-2">
              Abstract
            </label>
            <textarea
              id="abstract"
              value={formData.abstract}
              onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
              rows={4}
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
            <label htmlFor="doi" className="block text-sm font-medium text-gray-700 mb-2">
              DOI (optional)
            </label>
            <input
              type="text"
              id="doi"
              value={formData.doi}
              onChange={(e) => setFormData({ ...formData, doi: e.target.value })}
              className="w-full p-3 border rounded-md focus:ring-kapstone-sage focus:border-kapstone-sage"
              placeholder="e.g., 10.1000/xyz123"
            />
          </div>

          <div>
            <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 mb-2">
              Keywords
            </label>
            <div className="space-y-2">
              <input
                type="text"
                id="keywords"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={addKeyword}
                className="w-full p-3 border rounded-md focus:ring-kapstone-sage focus:border-kapstone-sage"
                placeholder="Type keyword and press Enter"
              />
              <div className="flex flex-wrap gap-2">
                {formData.keywords.map((kw) => (
                  <span
                    key={kw}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-kapstone-sage/10 text-kapstone-sage"
                  >
                    {kw}
                    <button
                      type="button"
                      onClick={() => removeKeyword(kw)}
                      className="ml-2 text-kapstone-sage hover:text-kapstone-sage-dark"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="publish_date" className="block text-sm font-medium text-gray-700 mb-2">
              Publish Date (optional)
            </label>
            <input
              type="date"
              id="publish_date"
              value={formData.publish_date}
              onChange={(e) => setFormData({ ...formData, publish_date: e.target.value })}
              className="w-full p-3 border rounded-md focus:ring-kapstone-sage focus:border-kapstone-sage"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_peer_reviewed"
                checked={formData.is_peer_reviewed}
                onChange={(e) => setFormData({ ...formData, is_peer_reviewed: e.target.checked })}
                className="h-4 w-4 text-kapstone-sage focus:ring-kapstone-sage border-gray-300 rounded"
              />
              <label htmlFor="is_peer_reviewed" className="ml-2 text-sm text-gray-700">
                This article has been peer reviewed
              </label>
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
                Publish this article
              </label>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-kapstone-sage text-white rounded-md hover:bg-kapstone-sage-dark disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Article'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}