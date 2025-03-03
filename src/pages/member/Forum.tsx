import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, MessageSquare } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { ForumCategory, ForumPost } from '../../types/supabase';
import { ForumPostCard } from '../../components/member/ForumPostCard';
import { useAuthStore } from '../../store/authStore';

export function Forum() {
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    loadCategories();
    loadPosts();
  }, [selectedCategory]);

  async function loadCategories() {
    try {
      const { data, error } = await supabase
        .from('forum_categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }

  async function loadPosts() {
    try {
      setLoading(true);
      let query = supabase
        .from('forum_posts')
        .select(`
          *,
          category:forum_categories(*),
          author:users!forum_posts_author_id_fkey(full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (selectedCategory) {
        query = query.eq('category_id', selectedCategory);
      }

      const { data, error } = await query;
      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-kapstone-sage border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-kapstone-purple">Forum</h1>
        <Link
          to="/member-hub/forum/new"
          className="inline-flex items-center px-4 py-2 bg-kapstone-sage text-white rounded-md hover:bg-kapstone-sage-dark"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Discussion
        </Link>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Categories Sidebar */}
        <div className="col-span-12 md:col-span-3">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold text-kapstone-purple mb-4">Categories</h2>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full text-left px-3 py-2 rounded-md ${
                    !selectedCategory
                      ? 'bg-kapstone-sage text-white'
                      : 'text-gray-700 hover:bg-kapstone-sage hover:text-white'
                  }`}
                >
                  All Discussions
                </button>
              </li>
              {categories.map((category) => (
                <li key={category.id}>
                  <button
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-md ${
                      selectedCategory === category.id
                        ? 'bg-kapstone-sage text-white'
                        : 'text-gray-700 hover:bg-kapstone-sage hover:text-white'
                    }`}
                  >
                    {category.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Posts List */}
        <div className="col-span-12 md:col-span-9">
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search discussions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-kapstone-sage focus:border-kapstone-sage"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div className="space-y-4">
            {filteredPosts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No discussions found
              </div>
            ) : (
              filteredPosts.map((post) => (
                <ForumPostCard
                  key={post.id}
                  post={post}
                  onDelete={loadPosts}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}