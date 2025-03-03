import React from 'react';
import { FileText, Tag } from 'lucide-react';
import { CaseReport } from '../../types/supabase';
import { Link } from 'react-router-dom';

interface CaseReportCardProps {
  report: CaseReport;
}

export function CaseReportCard({ report }: CaseReportCardProps) {
  return (
    <Link
      to={`/member-hub/case-reports/${report.id}`}
      className="block bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <FileText className="h-5 w-5 text-kapstone-sage mr-2" />
            <h3 className="text-xl font-semibold text-kapstone-purple">
              {report.title}
            </h3>
          </div>
          {report.is_published ? (
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
              Published
            </span>
          ) : (
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
              Draft
            </span>
          )}
        </div>

        {report.abstract && (
          <p className="text-gray-600 mb-4 line-clamp-3">{report.abstract}</p>
        )}

        {report.keywords && report.keywords.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <Tag className="h-4 w-4 text-gray-400" />
            <div className="flex flex-wrap gap-2">
              {report.keywords.map((keyword) => (
                <span
                  key={keyword}
                  className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {report.author?.full_name && (
              <span>By {report.author.full_name} • </span>
            )}
            <span>{new Date(report.created_at).toLocaleDateString()}</span>
          </div>
          <span className="text-kapstone-sage hover:text-kapstone-sage-dark font-medium">
            Read More →
          </span>
        </div>
      </div>
    </Link>
  );
}