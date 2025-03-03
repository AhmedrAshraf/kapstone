import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Calendar, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Announcement } from '../../types/supabase';
import { useAuthStore } from '../../store/authStore';
import { MarkdownPreview } from '../../components/editor/MarkdownPreview';
import { useScrollToTop } from '../../hooks/useScrollToTop';

export function AnnouncementDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useScrollToTop();

  useEffect(() => {
    loadAnnouncement();
  }, [id]);

  const loadAnnouncement = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('announcements')
        .select(`
          *,
          author:users!announcements_author_id_fkey(full_name, email)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setAnnouncement(data);
    } catch (err) {
      console.error('Error loading announcement:', err);
      setError('Failed to load announcement');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!user?.id || !announcement || isDeleting) return;
    
    if (!window.confirm('Are you sure you want to delete this announcement?')) {
      return;
    }

    try {
      setIsDeleting(true);
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', announcement.id);

      if (error) throw error;
      navigate('/member-hub/announcements');
    } catch (err) {
      console.error('Error deleting announcement:', err);
      setError('Failed to delete announcement. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const canEdit = user?.role === 'super_admin';

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-kapstone-sage border-t-transparent"></div>
      </div>
    );
  }

  if (error || !announcement) {
    return (
      <div className="p-8">
        <div className="text-center text-red-600">
          {error || 'Announcement not found'}
        </div>
      </div>
    );
  }

  const priorityColors = {
    high: 'bg-red-100 text-red-800',
    normal: 'bg-blue-100 text-blue-800',
    low: 'bg-gray-100 text-gray-800'
  };

  return (
    <div className="p-8">
      <Link
        to="/member-hub/announcements"
        className="inline-flex items-center text-kapstone-sage hover:text-kapstone-sage-dark mb-8"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Announcements
      </Link>

      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center">
            <AlertCircle className={`h-5 w-5 mr-2 ${
              announcement.priority === 'high' ? 'text-red-500' : 'text-blue-500'
            }`} />
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              priorityColors[announcement.priority as keyof typeof priorityColors]
            }`}>
              {announcement.priority.charAt(0).toUpperCase() + announcement.priority.slice(1)} Priority
            </span>
          </div>
          {canEdit && !isDeleting && (
            <div className="flex items-center space-x-2">
              <Link
                to={`/member-hub/announcements/edit/${announcement.id}`}
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

        <h1 className="text-3xl font-bold text-kapstone-purple mb-6">
          {announcement.title}
        </h1>

        <div className="prose prose-lg max-w-none mb-6">
          <MarkdownPreview content={announcement.content} />
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            {announcement.publish_date ? (
              <span>Scheduled for {new Date(announcement.publish_date).toLocaleDateString()}</span>
            ) : (
              <span>Posted {new Date(announcement.created_at).toLocaleDateString()}</span>
            )}
            {announcement.expiry_date && (
              <>
                <span className="mx-2">•</span>
                <span>Expires {new Date(announcement.expiry_date).toLocaleDateString()}</span>
              </>
            )}
          </div>
        </div>

        {announcement.author && (
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Posted by {announcement.author.full_name || announcement.author.email}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}