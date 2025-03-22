import React, { useState, useRef } from 'react';
import { Edit2, Check, X, Upload, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { usePageContent } from '../../hooks/usePageContent';

interface EditableImageProps {
  pageId: string;
  sectionId: string;
  defaultSrc: string;
  alt: string;
  className?: string;
  maxSize?: number; // in bytes, defaults to 10MB
  allowedTypes?: string[]; // e.g. ['image/jpeg', 'image/png', 'image/webp']
}

export function EditableImage({ 
  pageId, 
  sectionId, 
  defaultSrc,
  alt,
  className = '',
  maxSize = 10 * 1024 * 1024, // 10MB default
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
}: EditableImageProps) {
  const { user } = useAuthStore();
  const { content, updateContent, initialized } = usePageContent(pageId);
  const [isEditing, setIsEditing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initialLoadRef = useRef(false);

  const isSuperAdmin = user?.role === 'super_admin';
  const displaySrc = content.find(c => c.section_id === sectionId)?.content || defaultSrc;

  React.useEffect(() => {
    if (initialized && !initialLoadRef.current) {
      const dbContent = content.find(c => c.section_id === sectionId)?.content;
      if (dbContent) {
        setPreviewUrl(null);
        setSelectedFile(null);
      }
      initialLoadRef.current = true;
    }
  }, [content, sectionId, initialized]);

  const validateFile = (file: File): string | null => {
    if (!allowedTypes.includes(file.type)) {
      return `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`;
    }
    if (file.size > maxSize) {
      return `File too large. Maximum size: ${Math.round(maxSize / 1024 / 1024)}MB`;
    }
    return null;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!user?.id || !selectedFile || isSaving) return;

    try {
      setIsSaving(true);
      setError(null);
      console.log(isSaving);
      

      // Convert image to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });
      reader.readAsDataURL(selectedFile);
      
      const base64Data = await base64Promise;

      await updateContent({
        id: content.find(c => c.section_id === sectionId)?.id || crypto.randomUUID(),
        page_id: pageId,
        section_id: sectionId,
        content: base64Data,
        content_type: 'image',
        updated_by: user.id
      });

      setIsEditing(false);
      setPreviewUrl(null);
      setSelectedFile(null);
    } catch (error) {
      console.error('Error saving image:', error);
      setError('Failed to save image. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setPreviewUrl(null);
    setSelectedFile(null);
    setError(null);
  };

  // For non-admin users, render static image
  if (!isSuperAdmin) {
    return <img src={displaySrc} alt={alt} className={className} />;
  }

  return (
    <div className="group relative">
      <img 
        src={previewUrl || displaySrc} 
        alt={alt} 
        className={`${className} ${isEditing ? 'opacity-75' : ''} ${!isEditing ? 'group-hover:opacity-90' : ''}`}
      />

      {!isEditing && (
        <button
          onClick={() => setIsEditing(true)}
          className="absolute -top-4 -right-4 opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-kapstone-sage text-white rounded-full hover:bg-kapstone-sage-dark"
        >
          <Edit2 className="h-4 w-4" />
        </button>
      )}

      {isEditing && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-white p-4 rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Update Image</h3>
                <button
                  onClick={handleCancel}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 p-2 rounded">
                  <AlertTriangle className="h-4 w-4" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <div className="flex flex-col items-center gap-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  disabled={isSaving}
                >
                  <Upload className="h-5 w-5" />
                  Choose Image
                </button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={allowedTypes.join(',')}
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {selectedFile && (
                  <div className="text-sm text-gray-500">
                    Selected: {selectedFile.name} ({Math.round(selectedFile.size / 1024)}KB)
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!selectedFile || isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-kapstone-sage text-white rounded-md hover:bg-kapstone-sage-dark disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Save
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}