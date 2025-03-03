import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Announcement } from '../../types/supabase';
import { AnnouncementCard } from '../../components/member/AnnouncementCard';
import { useAuthStore } from '../../store/authStore';

export function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const { user } = useAuthStore();

  useEffect(() => {
    loadAnnouncements();
  }, [user?.id]);

  async function loadAnnouncements() {
    try {
      setLoading(true);
      console.log('Fetching announcements...'); // Debug log

      // Basic query without any filters
      const { data, error } = await supabase
        .from('announcements')
        .select(`
          *,
          author:users!announcements_author_id_fkey(full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching announcements:', error); // Debug log
        throw error;
      }

      console.log('Fetched announcements:', data); // Debug log
      setAnnouncements(data || []);
    } catch (error) {
      console.error('Error loading announcements:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === 'all' || announcement.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const canCreate = user?.role === 'super_admin';

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
          <h1 className="text-3xl font-bold text-kapstone-purple mb-2">Announcements</h1>
          <p className="text-gray-600">
            Stay updated with the latest news and updates from KAPstone Clinics.
          </p>
        </div>
        {canCreate && (
          <Link
            to="/member-hub/announcements/new"
            className="inline-flex items-center px-4 py-2 bg-kapstone-sage text-white rounded-md hover:bg-kapstone-sage-dark"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Announcement
          </Link>
        )}
      </div>

      <div className="mb-8">
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search announcements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-kapstone-sage focus:border-kapstone-sage"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
          
          <div className="relative">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:ring-kapstone-sage focus:border-kapstone-sage appearance-none bg-white"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="normal">Normal Priority</option>
              <option value="low">Low Priority</option>
            </select>
            <Filter className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {filteredAnnouncements.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No announcements found
          </div>
        ) : (
          filteredAnnouncements.map((announcement) => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
              onDelete={loadAnnouncements}
            />
          ))
        )}
      </div>
    </div>
  );
}