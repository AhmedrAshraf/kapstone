import React, { useState } from 'react';
import { HelpCircle, Smile, Paperclip, X } from 'lucide-react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { FileUpload } from '../FileUpload';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
  entityType?: 'forum_post' | 'announcement' | 'case_report' | 'referral';
  entityId?: string;
}

export function MarkdownEditor({ 
  value, 
  onChange, 
  rows = 6, 
  placeholder,
  entityType,
  entityId
}: MarkdownEditorProps) {
  const [showGuide, setShowGuide] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    const cursorPosition = (document.activeElement as HTMLTextAreaElement)?.selectionStart || value.length;
    const newValue = value.slice(0, cursorPosition) + emojiData.emoji + value.slice(cursorPosition);
    onChange(newValue);
    setShowEmojiPicker(false);
  };

  return (
    <div className="relative">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowGuide(!showGuide)}
            className="text-gray-500 hover:text-gray-700"
            title="Markdown Guide"
          >
            <HelpCircle className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="text-gray-500 hover:text-gray-700"
            title="Add Emoji"
          >
            <Smile className="h-5 w-5" />
          </button>
          {entityType && entityId && (
            <button
              type="button"
              onClick={() => setShowFileUpload(!showFileUpload)}
              className="text-gray-500 hover:text-gray-700"
              title="Attach Files"
            >
              <Paperclip className="h-5 w-5" />
            </button>
          )}
        </div>
        <span className="text-sm text-gray-500">Markdown supported</span>
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full p-3 border rounded-md focus:ring-kapstone-sage focus:border-kapstone-sage font-mono"
      />

      {showGuide && (
        <div className="absolute z-20 top-10 left-0 w-72 bg-white rounded-lg shadow-lg border p-4">
          <h4 className="font-semibold text-gray-700 mb-3">Markdown Guide</h4>
          <div className="space-y-2 text-sm">
            <div>
              <code className="bg-gray-100 px-1 rounded"># Heading 1</code>
              <br />
              <code className="bg-gray-100 px-1 rounded">## Heading 2</code>
            </div>
            <div>
              <code className="bg-gray-100 px-1 rounded">**bold**</code>
              <br />
              <code className="bg-gray-100 px-1 rounded">*italic*</code>
            </div>
            <div>
              <code className="bg-gray-100 px-1 rounded">[link](url)</code>
            </div>
            <div>
              <code className="bg-gray-100 px-1 rounded">* list item</code>
              <br />
              <code className="bg-gray-100 px-1 rounded">1. numbered item</code>
            </div>
            <div>
              <code className="bg-gray-100 px-1 rounded">&gt; quote</code>
            </div>
            <div>
              <code className="bg-gray-100 px-1 rounded">```code block```</code>
            </div>
          </div>
        </div>
      )}

      {showEmojiPicker && (
        <div className="absolute z-20 top-10 right-0">
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </div>
      )}

      {showFileUpload && entityType && entityId && (
        <div className="absolute z-20 top-10 right-0 w-96 bg-white rounded-lg shadow-lg border p-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-gray-700">Attach Files</h4>
            <button
              onClick={() => setShowFileUpload(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <FileUpload
            entityType={entityType}
            entityId={entityId}
            maxFiles={5}
            onUploadComplete={() => setShowFileUpload(false)}
          />
        </div>
      )}
    </div>
  );
}