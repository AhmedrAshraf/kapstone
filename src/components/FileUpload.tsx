import React, { useState, useRef } from 'react';
import { Upload, X, File, Image, FileText, Film, Music, Archive } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

interface FileUploadProps {
  entityType: 'forum_post' | 'announcement' | 'case_report' | 'referral';
  entityId: string;
  onUploadComplete?: () => void;
  maxFiles?: number;
  acceptedTypes?: string;
}

export function FileUpload({ 
  entityType, 
  entityId, 
  onUploadComplete,
  maxFiles = 10,
  acceptedTypes = '*'
}: FileUploadProps) {
  const { user } = useAuthStore();
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return Image;
    if (type.startsWith('text/')) return FileText;
    if (type.startsWith('video/')) return Film;
    if (type.startsWith('audio/')) return Music;
    if (type.includes('zip') || type.includes('tar') || type.includes('rar')) return Archive;
    return File;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length + files.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return;
    }
    setFiles([...files, ...selectedFiles]);
    setError(null);
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (!user?.id || !files.length) return;

    setUploading(true);
    setError(null);

    try {
      for (const file of files) {
        // Upload file to storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).slice(2)}.${fileExt}`;
        const filePath = `${entityType}/${entityId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('attachments')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Create file attachment record
        const { error: dbError } = await supabase
          .from('file_attachments')
          .insert({
            file_name: file.name,
            file_type: file.type,
            file_size: file.size,
            storage_path: filePath,
            content_type: file.type,
            entity_type: entityType,
            entity_id: entityId,
            author_id: user.id
          });

        if (dbError) throw dbError;
      }

      setFiles([]);
      if (onUploadComplete) onUploadComplete();
    } catch (err) {
      console.error('Error uploading files:', err);
      setError('Failed to upload files. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center px-4 py-2 bg-kapstone-sage text-white rounded-md hover:bg-kapstone-sage-dark disabled:opacity-50"
        >
          <Upload className="h-5 w-5 mr-2" />
          Select Files
        </button>
        {files.length > 0 && (
          <button
            type="button"
            onClick={uploadFiles}
            disabled={uploading}
            className="px-4 py-2 bg-kapstone-purple text-white rounded-md hover:bg-opacity-90 disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Upload Files'}
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes}
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => {
            const Icon = getFileIcon(file.type);
            return (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
              >
                <div className="flex items-center">
                  <Icon className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="text-sm text-gray-700">{file.name}</span>
                  <span className="ml-2 text-xs text-gray-500">
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}