import React, { useState, useEffect } from 'react';
import { Grid, List, Search, Filter, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { BlogPost } from '../types/supabase';
import { Link } from 'react-router-dom';
import { EditableText } from '../components/cms/EditableText';
import { useScrollToTop } from '../hooks/useScrollToTop';

type ViewMode = 'grid' | 'list';
type SortMode = 'newest' | 'oldest' | 'alpha';

export function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortMode, setSortMode] = useState<SortMode>('newest');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  // Add scroll to top functionality
  useScrollToTop();

  useEffect(() => {
    loadPosts();
  }, [sortMode]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('blog_posts')
        .select(`
          *,
          author:users(full_name, email)
        `)
        .eq('published', true);

      // Apply sorting
      switch (sortMode) {
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'alpha':
          query = query.order('title', { ascending: true });
          break;
        default: // newest
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.meta_description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategories = selectedCategories.length === 0 ||
      selectedCategories.every(cat => post.categories?.includes(cat));
    return matchesSearch && matchesCategories;
  });

  const allCategories = Array.from(new Set(
    posts.flatMap(post => post.categories || [])
  )).sort();

  const categoryCounts = allCategories.reduce((acc, category) => {
    acc[category] = posts.filter(post => post.categories?.includes(category)).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-kapstone-purple text-white min-h-[45vh] flex items-center pt-28">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1519682577862-22b62b24e493"
            alt="Open book with coffee"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-kapstone-purple/70 mix-blend-multiply" />
        </div>
        <div className="relative w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <EditableText
                pageId="blog"
                sectionId="hero-title"
                defaultContent="Insights & Updates"
                tag="h1"
                className="text-4xl font-bold sm:text-5xl"
              />
              <EditableText
                pageId="blog"
                sectionId="hero-subtitle"
                defaultContent="Stay informed with the latest developments in ketamine-assisted psychotherapy."
                tag="p"
                className="mt-6 max-w-3xl mx-auto text-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md ${
                viewMode === 'grid'
                  ? 'bg-kapstone-sage text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md ${
                viewMode === 'list'
                  ? 'bg-kapstone-sage text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
          {user?.role === 'super_admin' && (
            <Link
              to="/blog/new"
              className="inline-flex items-center px-4 py-2 bg-kapstone-sage text-white rounded-md hover:bg-kapstone-sage-dark"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Post
            </Link>
          )}
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="col-span-12 md:col-span-3">
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              {/* Search */}
              <div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-kapstone-sage focus:border-kapstone-sage"
                  />
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              {/* Sort */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Sort By</h3>
                <select
                  value={sortMode}
                  onChange={(e) => setSortMode(e.target.value as SortMode)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-kapstone-sage focus:border-kapstone-sage"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="alpha">Alphabetical</option>
                </select>
              </div>

              {/* Categories */}
              {allCategories.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Categories</h3>
                  <div className="space-y-2">
                    {allCategories.map((category) => (
                      <label key={category} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category)}
                          onChange={(e) => {
                            setSelectedCategories(
                              e.target.checked
                                ? [...selectedCategories, category]
                                : selectedCategories.filter(c => c !== category)
                            );
                          }}
                          className="h-4 w-4 text-kapstone-sage focus:ring-kapstone-sage border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-600">
                          {category} ({categoryCounts[category]})
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Posts Grid/List */}
          <div className="col-span-12 md:col-span-9">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-kapstone-sage border-t-transparent"></div>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No posts found
              </div>
            ) : (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {filteredPosts.map((post) => (
                  <Link
                    key={post.id}
                    to={`/blog/${post.slug}`}
                    className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                  >
                    {post.featured_image && (
                      <div className="aspect-w-16 aspect-h-9">
                        <img
                          src={post.featured_image}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-2">
                        {post.categories?.map((category) => (
                          <span
                            key={category}
                            className="px-2 py-1 bg-kapstone-sage/10 text-kapstone-sage rounded-full text-xs"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                      <h2 className="text-xl font-semibold text-kapstone-purple mb-2">
                        {post.title}
                      </h2>
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {post.meta_description || post.content.substring(0, 150)}...
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>By {post.author?.full_name || 'Anonymous'}</span>
                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}