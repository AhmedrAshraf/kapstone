import React, { useState, useEffect } from 'react';
import { Music, FileText, Building2, Scale, Bookmark, Search, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Resource } from '../../types/supabase';
import { ResourceCard } from '../../components/member/ResourceCard';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const RESOURCE_CATEGORIES = [
  {
    id: 'music',
    name: 'Music Playlists',
    icon: Music,
    description: 'Curated playlists for KAP sessions'
  },
  {
    id: 'articles',
    name: 'KAP Articles',
    icon: FileText,
    description: 'Research and practice articles by theme'
  },
  {
    id: 'clinic',
    name: 'Starting Your Clinic',
    icon: Building2,
    description: 'Guides and resources for clinic setup'
  },
  {
    id: 'forms',
    name: 'Forms',
    icon: FileText,
    description: 'Essential forms and templates'
  },
  {
    id: 'legal',
    name: 'Legal Resources',
    icon: Scale,
    description: 'State regulations and legal guidance'
  }
];

export function Resources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    loadResources();
  }, [selectedCategory]);

  async function loadResources() {
    try {
      setLoading(true);
      let query = supabase
        .from('resources')
        .select(`
          *,
          author:users(full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (selectedCategory) {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query;
      if (error) throw error;
      setResources(data || []);
    } catch (error) {
      console.error('Error loading resources:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredResources = resources.filter(resource =>
    resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (resource.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isAdmin = user?.role === 'clinic_admin' || user?.role === 'super_admin';

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
        <div>
          <h1 className="text-3xl font-bold text-kapstone-purple mb-2">Resources</h1>
          <p className="text-gray-600">
            Access our comprehensive collection of resources to support your KAP practice.
          </p>
        </div>
        {isAdmin && (
          <Link
            to="/member-hub/resources/new"
            className="inline-flex items-center px-4 py-2 bg-kapstone-sage text-white rounded-md hover:bg-kapstone-sage-dark"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Resource
          </Link>
        )}
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
                  All Resources
                </button>
              </li>
              {RESOURCE_CATEGORIES.map((category) => {
                const Icon = category.icon;
                return (
                  <li key={category.id}>
                    <button
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-3 py-2 rounded-md ${
                        selectedCategory === category.id
                          ? 'bg-kapstone-sage text-white'
                          : 'text-gray-700 hover:bg-kapstone-sage hover:text-white'
                      }`}
                    >
                      <div className="flex items-center">
                        <Icon className="h-4 w-4 mr-2" />
                        {category.name}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Resources List */}
        <div className="col-span-12 md:col-span-9">
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-kapstone-sage focus:border-kapstone-sage"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div className="grid gap-6">
            {filteredResources.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No resources found
              </div>
            ) : (
              filteredResources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}