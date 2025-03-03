import React from 'react';
import { BookOpen, Tag, ExternalLink } from 'lucide-react';
import { JournalArticle } from '../../types/supabase';
import { Link } from 'react-router-dom';

interface JournalArticleCardProps {
  article: JournalArticle;
}

export function JournalArticleCard({ article }: JournalArticleCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <BookOpen className="h-5 w-5 text-kapstone-sage mr-2" />
            <h3 className="text-xl font-semibold text-kapstone-purple">
              {article.title}
            </h3>
          </div>
          <div className="flex gap-2">
            {article.is_peer_reviewed && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                Peer Reviewed
              </span>
            )}
            {article.is_published ? (
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                Published
              </span>
            ) : (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                Draft
              </span>
            )}
          </div>
        </div>

        {article.abstract && (
          <p className="text-gray-600 mb-4 line-clamp-3">{article.abstract}</p>
        )}

        {article.keywords && article.keywords.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <Tag className="h-4 w-4 text-gray-400" />
            <div className="flex flex-wrap gap-2">
              {article.keywords.map((keyword) => (
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
            {article.author?.full_name && (
              <span>By {article.author.full_name} • </span>
            )}
            {article.publish_date ? (
              <span>Published {new Date(article.publish_date).toLocaleDateString()}</span>
            ) : (
              <span>Created {new Date(article.created_at).toLocaleDateString()}</span>
            )}
          </div>
          <div className="flex items-center gap-4">
            {article.doi && (
              <a
                href={`https://doi.org/${article.doi}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-kapstone-purple hover:text-kapstone-sage flex items-center"
              >
                <span className="text-sm">DOI</span>
                <ExternalLink className="h-4 w-4 ml-1" />
              </a>
            )}
            <Link
              to={`/member-hub/journal/${article.id}`}
              className="text-kapstone-sage hover:text-kapstone-sage-dark font-medium"
            >
              Read More →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}