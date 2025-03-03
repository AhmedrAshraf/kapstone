import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { MarkdownEditor } from '../../components/editor/MarkdownEditor';

const DIAGNOSTIC_CATEGORIES = [
  'Depression',
  'Anxiety',
  'PTSD',
  'OCD',
  'Addiction',
  'Pain Management',
  'End of Life',
  'Trauma',
  'Eating Disorders',
  'Mood Disorders'
];

export function CaseReportEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    title: '',
    patient_info: {
      age: null as number | null,
      gender: '',
      presenting_issues: [] as string[],
      medications: [] as string[],
      previous_treatments: [] as string[]
    },
    assessment: '',
    treatment_plan: '',
    session_notes: '',
    outcomes: '',
    recommendations: '',
    diagnostic_categories: [] as string[],
    keywords: [] as string[],
    is_published: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id || !user?.id) {
      navigate('/member-hub/case-reports');
      return;
    }
    loadCaseReport();
  }, [id]);

  const loadCaseReport = async () => {
    try {
      const { data, error } = await supabase
        .from('case_reports')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      // Check if user has permission to edit
      const canEdit = user.role === 'super_admin' || user.id === data.author_id;
      if (!canEdit) {
        navigate('/member-hub/case-reports');
        return;
      }

      setFormData(data);
    } catch (err) {
      console.error('Error loading case report:', err);
      setError('Failed to load case report');
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
        .from('case_reports')
        .update({
          ...formData,
          updated_at: new Date().toISOString(),
          content_format: 'markdown'
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      navigate(`/member-hub/case-reports/${id}`);
    } catch (err) {
      console.error('Error updating case report:', err);
      setError('Failed to update case report. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const toggleDiagnosticCategory = (category: string) => {
    setFormData({
      ...formData,
      diagnostic_categories: formData.diagnostic_categories.includes(category)
        ? formData.diagnostic_categories.filter(c => c !== category)
        : [...formData.diagnostic_categories, category]
    });
  };

  const handleKeywordInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
      const newKeyword = (e.target as HTMLInputElement).value.trim();
      if (!formData.keywords.includes(newKeyword)) {
        setFormData({
          ...formData,
          keywords: [...formData.keywords, newKeyword]
        });
      }
      (e.target as HTMLInputElement).value = '';
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData({
      ...formData,
      keywords: formData.keywords.filter(k => k !== keyword)
    });
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
        to={`/member-hub/case-reports/${id}`}
        className="inline-flex items-center text-kapstone-sage hover:text-kapstone-sage-dark mb-8"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Case Report
      </Link>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-kapstone-purple mb-8">
          Edit Case Report
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

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-700">Patient Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
                  Age
                </label>
                <input
                  type="number"
                  id="age"
                  value={formData.patient_info.age || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    patient_info: {
                      ...formData.patient_info,
                      age: e.target.value ? parseInt(e.target.value) : null
                    }
                  })}
                  className="w-full p-3 border rounded-md focus:ring-kapstone-sage focus:border-kapstone-sage"
                />
              </div>

              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <input
                  type="text"
                  id="gender"
                  value={formData.patient_info.gender}
                  onChange={(e) => setFormData({
                    ...formData,
                    patient_info: {
                      ...formData.patient_info,
                      gender: e.target.value
                    }
                  })}
                  className="w-full p-3 border rounded-md focus:ring-kapstone-sage focus:border-kapstone-sage"
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="assessment" className="block text-sm font-medium text-gray-700 mb-2">
              Assessment
            </label>
            <MarkdownEditor
              value={formData.assessment}
              onChange={(value) => setFormData({ ...formData, assessment: value })}
              rows={6}
              placeholder="Write your assessment here..."
            />
          </div>

          <div>
            <label htmlFor="treatment_plan" className="block text-sm font-medium text-gray-700 mb-2">
              Treatment Plan
            </label>
            <MarkdownEditor
              value={formData.treatment_plan}
              onChange={(value) => setFormData({ ...formData, treatment_plan: value })}
              rows={6}
              placeholder="Write your treatment plan here..."
            />
          </div>

          <div>
            <label htmlFor="session_notes" className="block text-sm font-medium text-gray-700 mb-2">
              Session Notes
            </label>
            <MarkdownEditor
              value={formData.session_notes}
              onChange={(value) => setFormData({ ...formData, session_notes: value })}
              rows={8}
              placeholder="Write your session notes here..."
            />
          </div>

          <div>
            <label htmlFor="outcomes" className="block text-sm font-medium text-gray-700 mb-2">
              Outcomes
            </label>
            <MarkdownEditor
              value={formData.outcomes}
              onChange={(value) => setFormData({ ...formData, outcomes: value })}
              rows={6}
              placeholder="Write the outcomes here..."
            />
          </div>

          <div>
            <label htmlFor="recommendations" className="block text-sm font-medium text-gray-700 mb-2">
              Recommendations
            </label>
            <MarkdownEditor
              value={formData.recommendations}
              onChange={(value) => setFormData({ ...formData, recommendations: value })}
              rows={6}
              placeholder="Write your recommendations here..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Diagnostic Categories
            </label>
            <div className="flex flex-wrap gap-2">
              {DIAGNOSTIC_CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => toggleDiagnosticCategory(category)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    formData.diagnostic_categories.includes(category)
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
            <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 mb-2">
              Keywords
            </label>
            <div className="space-y-2">
              <input
                type="text"
                id="keywords"
                onKeyDown={handleKeywordInput}
                className="w-full p-3 border rounded-md focus:ring-kapstone-sage focus:border-kapstone-sage"
                placeholder="Type keyword and press Enter"
              />
              <div className="flex flex-wrap gap-2">
                {formData.keywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-kapstone-sage/10 text-kapstone-sage"
                  >
                    {keyword}
                    <button
                      type="button"
                      onClick={() => removeKeyword(keyword)}
                      className="ml-2 text-kapstone-sage hover:text-kapstone-sage-dark"
                    >
                      ×
                    </button>
                  </span>
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
              Publish this case report
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