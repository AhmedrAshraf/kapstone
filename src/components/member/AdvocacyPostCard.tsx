import React from 'react';
import { Megaphone, CheckCircle } from 'lucide-react';
import { AdvocacyPost } from '../../types/supabase';
import { Link } from 'react-router-dom';

interface AdvocacyPostCardProps {
  post: AdvocacyPost;
}

export function AdvocacyPostCard({ post }: AdvocacyPostCardProps) {
  const actionItems = post.action_items as { items: string[] };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <Megaphone className="h-5 w-5 text-kapstone-sage mr-2" />
            <h3 className="text-xl font-semibold text-kapstone-purple">
              {post.title}
            </h3>
          </div>
          <span className="px-2 py-1 bg-kapstone-sage/10 text-kapstone-sage rounded-full text-xs font-medium">
            {post.category}
          </span>
        </div>

        <p className="text-gray-600 mb-6 line-clamp-3">{post.content}</p>

        {actionItems?.items && actionItems.items.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Action Items:</h4>
            <ul className="space-y-2">
              {actionItems.items.map((item, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-kapstone-sage mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {post.author?.full_name && (
              <span>By {post.author.full_name} • </span>
            )}
            <span>{new Date(post.created_at).toLocaleDateString()}</span>
          </div>
          <Link
            to={`/member-hub/advocacy/${post.id}`}
            className="text-kapstone-sage hover:text-kapstone-sage-dark font-medium"
          >
            Learn More →
          </Link>
        </div>
      </div>
    </div>
  );
}