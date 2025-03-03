import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Tag, Filter } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { CaseReport } from '../../types/supabase';
import { CaseReportCard } from '../../components/member/CaseReportCard';
import { useAuthStore } from '../../store/authStore';

const DIAGNOSTIC_CATEGORIES = [
  'PTSD',
  'OCD',
  'Anxiety',
  'End of Life',
  'Adolescents',
  'SI',
  "Women's Issues",
  "Men's Issues",
  'Couples/Relationship',
  'Sexual'
];

export function CaseReports() {
  const [reports, setReports] = useState<CaseReport[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadReports();
  }, [searchQuery, selectedCategories]);

  async function loadReports() {
    let query = supabase
      .from('case_reports')
      .select(`
        *,
        author:users!case_reports_author_id_fkey(full_name)
      `)
      .order('created_at', { ascending: false });

    if (searchQuery) {
      query = query.or(`title.ilike.%${searchQuery}%,keywords.cs.{${searchQuery}}`);
    }

    if (selectedCategories.length > 0) {
      query = query.contains('diagnostic_categories', selectedCategories);
    }

    const { data } = await query;
    if (data) setReports(data);
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-kapstone-purple">Case Reports</h1>
        <Link
          to="/member-hub/case-reports/new"
          className="inline-flex items-center px-4 py-2 bg-kapstone-sage text-white rounded-md hover:bg-kapstone-sage-dark"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Case Report
        </Link>
      </div>

      <div className="mb-8">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search case reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-kapstone-sage focus:border-kapstone-sage"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 p-4 bg-white rounded-lg shadow">
            <h3 className="text-lg font-semibold text-kapstone-purple mb-4">
              Diagnostic Categories
            </h3>
            <div className="flex flex-wrap gap-2">
              {DIAGNOSTIC_CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    if (selectedCategories.includes(category)) {
                      setSelectedCategories(selectedCategories.filter((c) => c !== category));
                    } else {
                      setSelectedCategories([...selectedCategories, category]);
                    }
                  }}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedCategories.includes(category)
                      ? 'bg-kapstone-sage text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {reports.map((report) => (
          <CaseReportCard key={report.id} report={report} />
        ))}
      </div>
    </div>
  );
}