import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Tag, Phone, Globe, Mail, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Referral } from '../../types/supabase';
import { useAuthStore } from '../../store/authStore';
import { MarkdownPreview } from '../../components/editor/MarkdownPreview';
import { useScrollToTop } from '../../hooks/useScrollToTop';

export function ReferralDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [referral, setReferral] = useState<Referral | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Add scroll to top functionality
  useScrollToTop();

  useEffect(() => {
    loadReferral();
  }, [id]);

  const loadReferral = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('referrals')
        .select(`
          *,
          author:users!referrals_author_id_fkey(full_name, email)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setReferral(data);
    } catch (err) {
      console.error('Error loading referral:', err);
      setError('Failed to load referral');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!user?.id || !referral || isDeleting) return;
    
    if (!window.confirm('Are you sure you want to delete this referral?')) {
      return;
    }

    try {
      setIsDeleting(true);
      const { error } = await supabase
        .from('referrals')
        .delete()
        .eq('id', referral.id);

      if (error) throw error;
      navigate('/member-hub/referrals');
    } catch (err) {
      console.error('Error deleting referral:', err);
      setError('Failed to delete referral. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const canEdit = user?.role === 'super_admin' || user?.id === referral?.author_id;

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-kapstone-sage border-t-transparent"></div>
      </div>
    );
  }

  if (error || !referral) {
    return (
      <div className="p-8">
        <div className="text-center text-red-600">
          {error || 'Referral not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <Link
        to="/member-hub/referrals"
        className="inline-flex items-center text-kapstone-sage hover:text-kapstone-sage-dark mb-8"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Referrals
      </Link>

      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-start justify-between mb-6">
          <h1 className="text-3xl font-bold text-kapstone-purple">
            {referral.title}
          </h1>
          {canEdit && !isDeleting && (
            <div className="flex items-center space-x-2">
              <Link
                to={`/member-hub/referrals/edit/${referral.id}`}
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

        <div className="prose prose-lg max-w-none mb-8">
          <MarkdownPreview content={referral.description} />
        </div>

        <div className="space-y-6">
          {referral.specialties && referral.specialties.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Specialties</h3>
              <div className="flex flex-wrap gap-2">
                {referral.specialties.map((specialty) => (
                  <span
                    key={specialty}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-kapstone-sage/10 text-kapstone-sage"
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          )}

          {referral.location && (
            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-kapstone-sage mr-2 mt-1" />
              <p className="text-gray-600">{referral.location}</p>
            </div>
          )}

          {referral.contact_info && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Contact Information</h3>
              <div className="space-y-3">
                {referral.contact_info.email && (
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-kapstone-sage mr-2" />
                    <a
                      href={`mailto:${referral.contact_info.email}`}
                      className="text-kapstone-purple hover:text-kapstone-sage"
                    >
                      {referral.contact_info.email}
                    </a>
                  </div>
                )}
                {referral.contact_info.phone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-kapstone-sage mr-2" />
                    <a
                      href={`tel:${referral.contact_info.phone}`}
                      className="text-kapstone-purple hover:text-kapstone-sage"
                    >
                      {referral.contact_info.phone}
                    </a>
                  </div>
                )}
                {referral.contact_info.website && (
                  <div className="flex items-center">
                    <Globe className="h-4 w-4 text-kapstone-sage mr-2" />
                    <a
                      href={referral.contact_info.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-kapstone-purple hover:text-kapstone-sage"
                    >
                      {new URL(referral.contact_info.website).hostname}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {referral.author && (
            <div className="border-t pt-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Posted by {referral.author.full_name || referral.author.email}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(referral.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}