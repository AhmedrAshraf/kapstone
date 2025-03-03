import React from 'react';
import { FileText, Music, Book, Building2, Scale, Bookmark } from 'lucide-react';
import { Resource } from '../../types/supabase';

interface ResourceCardProps {
  resource: Resource;
}

export function ResourceCard({ resource }: ResourceCardProps) {
  const getCategoryIcon = () => {
    switch (resource.category) {
      case 'music':
        return <Music className="h-6 w-6" />;
      case 'articles':
        return <Book className="h-6 w-6" />;
      case 'clinic':
        return <Building2 className="h-6 w-6" />;
      case 'forms':
        return <FileText className="h-6 w-6" />;
      case 'legal':
        return <Scale className="h-6 w-6" />;
      default:
        return <Bookmark className="h-6 w-6" />;
    }
  };

  const getCategoryColor = () => {
    switch (resource.category) {
      case 'music':
        return 'text-purple-500 bg-purple-50';
      case 'articles':
        return 'text-blue-500 bg-blue-50';
      case 'clinic':
        return 'text-green-500 bg-green-50';
      case 'forms':
        return 'text-orange-500 bg-orange-50';
      case 'legal':
        return 'text-red-500 bg-red-50';
      default:
        return 'text-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-lg ${getCategoryColor()}`}>
            {getCategoryIcon()}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-kapstone-purple mb-2">
              {resource.title}
            </h3>
            {resource.description && (
              <p className="text-gray-600 mb-4">{resource.description}</p>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Added {new Date(resource.created_at).toLocaleDateString()}
              </span>
              {resource.file_url && (
                <a
                  href={resource.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-kapstone-sage hover:text-kapstone-sage-dark font-medium"
                >
                  Download →
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}