import React from 'react';
import { Calendar, AlertCircle, Edit2, Trash2 } from 'lucide-react';
import { Announcement } from '../../types/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import { MarkdownPreview } from '../editor/MarkdownPreview';

interface AnnouncementCardProps {
  announcement: Announcement;
  onDelete?: () => void;
}

export function AnnouncementCard({ announcement, onDelete }: AnnouncementCardProps) {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const isScheduled = announcement.publish_date && new Date(announcement.publish_date) > new Date();
  const canEdit = user?.role === 'super_admin' || announcement.author_id === user?.id;

  const priorityColors = {
    high: 'bg-red-100 text-red-800',
    normal: 'bg-blue-100 text-blue-800',
    low: 'bg-gray-100 text-gray-800'
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!window.confirm('Are you sure you want to delete this announcement?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', announcement.id);

      if (error) throw error;
      if (onDelete) onDelete();
    } catch (err) {
      console.error('Error deleting announcement:', err);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/member-hub/announcements/edit/${announcement.id}`);
  };

  return (
    <Link
      to={`/member-hub/announcements/${announcement.id}`}
      className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow"
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
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
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1 text-gray-400" />
              {isScheduled && user?.role === 'super_admin' ? (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Scheduled for {new Date(announcement.publish_date!).toLocaleDateString()}
                </span>
              ) : (
                <span className="text-sm text-gray-500">
                  {new Date(announcement.publish_date || announcement.created_at).toLocaleDateString()}
                </span>
              )}
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
        </div>

        <h3 className="text-xl font-semibold text-kapstone-purple mb-2">
          {announcement.title}
        </h3>

        <div className="prose prose-sm max-w-none text-gray-600 line-clamp-3">
          <MarkdownPreview content={announcement.content} />
        </div>

        {announcement.author && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Posted by {announcement.author.full_name || announcement.author.email}
            </p>
          </div>
        )}
      </div>
    </Link>
  );
}