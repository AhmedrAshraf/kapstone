import React, { useState, useRef, useEffect } from 'react';
import { Edit2, Check, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { usePageContent } from '../../hooks/usePageContent';

interface EditableTextProps {
  pageId: string;
  sectionId: string;
  defaultContent: string;
  tag?: keyof JSX.IntrinsicElements;
  className?: string;
  disableButton?: boolean
}

export function EditableText({ 
  pageId, 
  sectionId, 
  defaultContent,
  tag = 'div',
  className = '',
  disableButton = false
}: EditableTextProps) {
  const { user } = useAuthStore();
  const { content, updateContent, initialized } = usePageContent(pageId);
  const [isEditing, setIsEditing] = useState(false);
  const [displayContent, setDisplayContent] = useState(defaultContent);
  const [isSaving, setIsSaving] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const initialLoadRef = useRef(false);

  const isSuperAdmin = user?.role === 'super_admin';

  // Update display content when database content is loaded
  useEffect(() => {
    if (initialized && !initialLoadRef.current) {
      const dbContent = content.find(c => c.section_id === sectionId)?.content;
      if (dbContent) {
        setDisplayContent(dbContent);
      }
      initialLoadRef.current = true;
    }
  }, [content, sectionId, initialized]);

  const handleSave = async () => {
    if (!user?.id || isSaving) return;

    try {
      setIsSaving(true);
      await updateContent({
        id: content.find(c => c.section_id === sectionId)?.id || crypto.randomUUID(),
        page_id: pageId,
        section_id: sectionId,
        content: displayContent,
        content_type: 'text',
        updated_by: user.id
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving content:', error);
      // Revert to previous content on error
      const dbContent = content.find(c => c.section_id === sectionId)?.content;
      setDisplayContent(dbContent || defaultContent);
    } finally {
      setIsSaving(false);
    }
  };

  const Tag = tag;

  // For non-admin users, render static content immediately
  if (!isSuperAdmin) {
    return <Tag className={className}>{displayContent}</Tag>;
  }

  return (
    <div className="group relative">
      <Tag
        ref={editorRef}
        className={`${className} ${isEditing ? 'border border-kapstone-sage rounded-md p-2' : ''}`}
        contentEditable={isEditing}
        onBlur={(e) => setDisplayContent(e.currentTarget.textContent || '')}
        suppressContentEditableWarning
        onClick={() => !isEditing && setIsEditing(true)}
      >
        {displayContent}
      </Tag>

      {isEditing && (
        <div className="absolute -top-4 -right-4 flex space-x-2">
          <button
            onClick={() => {
              const dbContent = content.find(c => c.section_id === sectionId)?.content;
              setDisplayContent(dbContent || defaultContent);
              setIsEditing(false);
            }}
            className="p-2 bg-red-500 text-white rounded-full shadow hover:bg-red-600"
            disabled={isSaving}
          >
            <X className="h-4 w-4" />
          </button>
          <button
            onClick={handleSave}
            className={`p-2 ${
              isSaving 
                ? 'bg-gray-400' 
                : 'bg-kapstone-sage hover:bg-kapstone-sage-dark'
            } text-white rounded-full shadow`}
            disabled={isSaving}
          >
            <Check className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}