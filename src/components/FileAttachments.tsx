import React, { useEffect, useState } from 'react';
import { File, Image, FileText, Film, Music, Archive, Download, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

interface FileAttachment {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  content_type: string;
  author_id: string;
  created_at: string;
}

interface FileAttachmentsProps {
  entityType: 'forum_post' | 'announcement' | 'case_report' | 'referral';
  entityId: string;
  onDelete?: () => void;
}

export function FileAttachments({ entityType, entityId, onDelete }: FileAttachmentsProps) {
  const { user } = useAuthStore();
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAttachments();
  }, [entityId]);

  const loadAttachments = async () => {
    try {
      const { data, error } = await supabase
        .from('file_attachments')
        .select('*')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .order('created_at');

      if (error) throw error;
      setAttachments(data || []);
    } catch (err) {
      console.error('Error loading attachments:', err);
      setError('Failed to load attachments');
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return Image;
    if (type.startsWith('text/')) return FileText;
    if (type.startsWith('video/')) return Film;
    if (type.startsWith('audio/')) return Music;
    if (type.includes('zip') || type.includes('tar') || type.includes('rar')) return Archive;
    return File;
  };

  const handleDownload = async (attachment: FileAttachment) => {
    try {
      const { data, error } = await supabase.storage
        .from('attachments')
        .download(attachment.storage_path);

      if (error) throw error;

      // Create download link
      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.file_name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading file:', err);
      setError('Failed to download file');
    }
  };

  const handleDelete = async (attachment: FileAttachment) => {
    if (!user) return;

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('attachments')
        .remove([attachment.storage_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('file_attachments')
        .delete()
        .eq('id', attachment.id);

      if (dbError) throw dbError;

      await loadAttachments();
      if (onDelete) onDelete();
    } catch (err) {
      console.error('Error deleting file:', err);
      setError('Failed to delete file');
    }
  };

  if (loading) return null;
  if (error) return null;
  if (!attachments.length) return null;

  return (
    <div className="mt-4 space-y-2">
      <h4 className="text-sm font-medium text-gray-700">Attachments</h4>
      <div className="space-y-2">
        {attachments.map((attachment) => {
          const Icon = getFileIcon(attachment.file_type);
          const canDelete = user?.id === attachment.author_id || user?.role === 'super_admin';

          return (
            <div
              key={attachment.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
            >
              <div className="flex items-center">
                <Icon className="h-5 w-5 text-gray-500 mr-2" />
                <span className="text-sm text-gray-700">{attachment.file_name}</span>
                <span className="ml-2 text-xs text-gray-500">
                  ({(attachment.file_size / 1024).toFixed(1)} KB)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownload(attachment)}
                  className="p-1 text-gray-400 hover:text-kapstone-sage rounded-full hover:bg-gray-100"
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </button>
                {canDelete && (
                  <button
                    type="button"
                    onClick={() => handleDelete(attachment)}
                    className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}