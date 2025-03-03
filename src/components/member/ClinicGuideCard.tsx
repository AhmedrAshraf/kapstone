import React from 'react';
import { Building2, ArrowRight } from 'lucide-react';
import { ClinicGuide } from '../../types/supabase';
import { Link } from 'react-router-dom';

interface ClinicGuideCardProps {
  guide: ClinicGuide;
}

export function ClinicGuideCard({ guide }: ClinicGuideCardProps) {
  const getCategoryColor = () => {
    switch (guide.category) {
      case 'getting-started':
        return 'text-green-500 bg-green-50';
      case 'team-building':
        return 'text-blue-500 bg-blue-50';
      case 'operations':
        return 'text-purple-500 bg-purple-50';
      case 'compliance':
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
            <Building2 className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-kapstone-purple mb-2">
              {guide.title}
            </h3>
            <p className="text-gray-600 mb-4 line-clamp-2">
              {guide.content.substring(0, 150)}...
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Last updated {new Date(guide.updated_at).toLocaleDateString()}
              </span>
              <Link
                to={`/member-hub/clinic-guides/${guide.id}`}
                className="inline-flex items-center text-kapstone-sage hover:text-kapstone-sage-dark font-medium"
              >
                Read Guide
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}