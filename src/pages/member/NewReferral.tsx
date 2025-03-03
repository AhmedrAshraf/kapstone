import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { useScrollToTop } from '../../hooks/useScrollToTop';
import { MarkdownEditor } from '../../components/editor/MarkdownEditor';

const SPECIALTIES = [
  'Depression',
  'Anxiety',
  'PTSD',
  'OCD',
  'Addiction',
  'Pain Management',
  'End of Life Care',
  'Trauma',
  'Eating Disorders',
  'Mood Disorders'
];

export function NewReferral() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    specialties: [] as string[],
    location: '',
    contact_info: {
      email: '',
      phone: '',
      website: ''
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useScrollToTop();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('referrals')
        .insert([{
          title: formData.title,
          description: formData.description,
          specialties: formData.specialties,
          location: formData.location,
          contact_info: formData.contact_info,
          author_id: user.id,
          content_format: 'markdown'
        }])
        .select()
        .single();

      if (error) throw error;
      navigate('/member-hub/referrals');
    } catch (err) {
      setError('Failed to create referral. Please try again.');
      console.error('Error creating referral:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSpecialty = (specialty: string) => {
    setFormData({
      ...formData,
      specialties: formData.specialties.includes(specialty)
        ? formData.specialties.filter(s => s !== specialty)
        : [...formData.specialties, specialty]
    });
  };

  return (
    <div className="p-8">
      <Link
        to="/member-hub/referrals"
        className="inline-flex items-center text-kapstone-sage hover:text-kapstone-sage-dark mb-8"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Referrals
      </Link>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-kapstone-purple mb-8">
          Post New Referral
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
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <MarkdownEditor
              value={formData.description}
              onChange={(value) => setFormData({ ...formData, description: value })}
              rows={6}
              placeholder="Write your referral description here..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Specialties
            </label>
            <div className="flex flex-wrap gap-2">
              {SPECIALTIES.map((specialty) => (
                <button
                  key={specialty}
                  type="button"
                  onClick={() => toggleSpecialty(specialty)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    formData.specialties.includes(specialty)
                      ? 'bg-kapstone-sage text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {specialty}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full p-3 border rounded-md focus:ring-kapstone-sage focus:border-kapstone-sage"
              placeholder="City, State"
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Contact Information</h3>
            
            <div>
              <label htmlFor="email" className="block text-sm text-gray-600 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={formData.contact_info.email}
                onChange={(e) => setFormData({
                  ...formData,
                  contact_info: { ...formData.contact_info, email: e.target.value }
                })}
                className="w-full p-3 border rounded-md focus:ring-kapstone-sage focus:border-kapstone-sage"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm text-gray-600 mb-1">
                Phone
              </label>
              <input
                type="tel"
                id="phone"
                value={formData.contact_info.phone}
                onChange={(e) => setFormData({
                  ...formData,
                  contact_info: { ...formData.contact_info, phone: e.target.value }
                })}
                className="w-full p-3 border rounded-md focus:ring-kapstone-sage focus:border-kapstone-sage"
              />
            </div>

            <div>
              <label htmlFor="website" className="block text-sm text-gray-600 mb-1">
                Website
              </label>
              <input
                type="url"
                id="website"
                value={formData.contact_info.website}
                onChange={(e) => setFormData({
                  ...formData,
                  contact_info: { ...formData.contact_info, website: e.target.value }
                })}
                className="w-full p-3 border rounded-md focus:ring-kapstone-sage focus:border-kapstone-sage"
                placeholder="https://"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-kapstone-sage text-white rounded-md hover:bg-kapstone-sage-dark disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Post Referral'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}