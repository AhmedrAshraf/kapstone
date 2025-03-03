import React, { useState } from 'react';
import { Edit2, X, Check } from 'lucide-react';
import { MarkdownEditor } from './editor/MarkdownEditor';
import { MarkdownPreview } from './editor/MarkdownPreview';

interface EditableContentProps {
  content: string;
  onSave: (newContent: string) => Promise<void>;
  canEdit: boolean;
  className?: string;
}

export function EditableContent({ content, onSave, canEdit, className = '' }: EditableContentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave(editedContent);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving content:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!canEdit) {
    return <MarkdownPreview content={content} className={className} />;
  }

  return (
    <div className="relative group">
      {!isEditing && (
        <button
          onClick={() => setIsEditing(true)}
          className="absolute -top-4 right-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-kapstone-sage text-white rounded-md hover:bg-kapstone-sage-dark"
        >
          <Edit2 className="h-4 w-4" />
        </button>
      )}

      {isEditing ? (
        <div className="space-y-4">
          <MarkdownEditor
            value={editedContent}
            onChange={setEditedContent}
            placeholder="Enter content..."
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setEditedContent(content);
                setIsEditing(false);
              }}
              className="p-2 text-gray-600 hover:text-gray-800"
              disabled={isSaving}
            >
              <X className="h-4 w-4" />
            </button>
            <button
              onClick={handleSave}
              className="p-2 text-kapstone-sage hover:text-kapstone-sage-dark"
              disabled={isSaving}
            >
              <Check className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <MarkdownPreview content={content} className={className} />
      )}
    </div>
  );
}