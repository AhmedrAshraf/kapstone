import React from 'react';
import { MapPin, Tag, Edit2, Trash2 } from 'lucide-react';
import { Referral } from '../../types/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import { MarkdownPreview } from '../editor/MarkdownPreview';

interface ReferralCardProps {
  referral: Referral;
  onDelete?: () => void;
}

export function ReferralCard({ referral, onDelete }: ReferralCardProps) {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const canEdit = user?.role === 'super_admin' || user?.id === referral.author_id;

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!window.confirm('Are you sure you want to delete this referral?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('referrals')
        .delete()
        .eq('id', referral.id);

      if (error) throw error;
      if (onDelete) onDelete();
    } catch (err) {
      console.error('Error deleting referral:', err);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/member-hub/referrals/edit/${referral.id}`);
  };

  return (
    <Link
      to={`/member-hub/referrals/${referral.id}`}
      className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow"
    >
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold text-kapstone-purple mb-2">
              {referral.title}
            </h3>
            <div className="text-gray-600 mb-4 line-clamp-2">
              <MarkdownPreview content={referral.description} />
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              {referral.location && (
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 text-kapstone-sage mr-1" />
                  {referral.location}
                </div>
              )}
              
              {referral.specialties.length > 0 && (
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-kapstone-sage" />
                  <div className="flex flex-wrap gap-2">
                    {referral.specialties.map((specialty) => (
                      <span
                        key={specialty}
                        className="px-2 py-0.5 bg-kapstone-sage/10 text-kapstone-sage rounded-full text-xs"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          {canEdit && (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleEdit}
                className="p-1 text-gray-500 hover:text-kapstone-sage rounded-full hover:bg-gray-100"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                onClick={handleDelete}
                className="p-1 text-gray-500 hover:text-red-500 rounded-full hover:bg-gray-100"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Posted by {referral.author?.full_name || referral.author?.email}
            </div>
            <div className="text-sm text-gray-500">
              {new Date(referral.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}