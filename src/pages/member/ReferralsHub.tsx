import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, MapPin, Tag } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Referral } from '../../types/supabase';
import { ReferralCard } from '../../components/member/ReferralCard';
import { useAuthStore } from '../../store/authStore';

export function ReferralsHub() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const { user } = useAuthStore();

  useEffect(() => {
    loadReferrals();
  }, []);

  async function loadReferrals() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('referrals')
        .select(`
          *,
          author:users!referrals_author_id_fkey(full_name, email)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReferrals(data || []);
    } catch (error) {
      console.error('Error loading referrals:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredReferrals = referrals.filter(referral => {
    const matchesSearch = (
      referral.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      referral.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      referral.location?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const matchesSpecialties = selectedSpecialties.length === 0 || 
      selectedSpecialties.every(specialty => 
        referral.specialties.includes(specialty)
      );

    return matchesSearch && matchesSpecialties;
  });

  const allSpecialties = Array.from(new Set(
    referrals.flatMap(referral => referral.specialties)
  )).sort();

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-kapstone-sage border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-kapstone-purple mb-2">Referrals Hub</h1>
          <p className="text-gray-600">
            Connect with other professionals and find referral opportunities.
          </p>
        </div>
        <Link
          to="/member-hub/referrals/new"
          className="inline-flex items-center px-4 py-2 bg-kapstone-sage text-white rounded-md hover:bg-kapstone-sage-dark"
        >
          <Plus className="h-5 w-5 mr-2" />
          Post Referral
        </Link>
      </div>

      <div className="mb-8">
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search referrals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-kapstone-sage focus:border-kapstone-sage"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        {allSpecialties.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {allSpecialties.map((specialty) => (
              <button
                key={specialty}
                onClick={() => {
                  setSelectedSpecialties(
                    selectedSpecialties.includes(specialty)
                      ? selectedSpecialties.filter(s => s !== specialty)
                      : [...selectedSpecialties, specialty]
                  );
                }}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedSpecialties.includes(specialty)
                    ? 'bg-kapstone-sage text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {specialty}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-6">
        {filteredReferrals.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No referrals found
          </div>
        ) : (
          filteredReferrals.map((referral) => (
            <ReferralCard
              key={referral.id}
              referral={referral}
              onDelete={loadReferrals}
            />
          ))
        )}
      </div>
    </div>
  );
}