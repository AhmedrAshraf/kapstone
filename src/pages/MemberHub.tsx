import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { MessageSquare, Users, Bell, BookOpen, FileText, Music, BookMarked, Megaphone } from 'lucide-react';
import { useScrollToTop } from '../hooks/useScrollToTop';

export function MemberHub() {
  const location = useLocation();
  const [selectedPath, setSelectedPath] = useState(location.pathname);
  useScrollToTop();
  
  const navigation = [
    {
      name: 'Forum',
      to: '/member-hub/forum',
      icon: MessageSquare,
      description: 'Discussion, Help, Supervision, Inquiry'
    },
    {
      name: 'Referrals Hub',
      to: '/member-hub/referrals',
      icon: Users,
      description: 'Connect with other professionals'
    },
    {
      name: 'Announcements',
      to: '/member-hub/announcements',
      icon: Bell,
      description: 'Programs and Training Updates'
    },
    {
      name: 'Case Reports',
      to: '/member-hub/case-reports',
      icon: FileText,
      description: 'Searchable by keywords/themes'
    },
    {
      name: 'Resources',
      to: '/member-hub/resources',
      icon: BookMarked,
      description: 'Music, Articles, Forms, and More'
    },
    {
      name: 'Kapstone Journal',
      to: '/member-hub/journal',
      icon: BookOpen,
      description: 'Case Reports, Studies, Data Presentations'
    },
    {
      name: 'Kapstone Voice',
      to: '/member-hub/voice',
      icon: Megaphone,
      description: 'KAP Activism and Advocacy'
    }
  ];

  // Show grid view only on the main member hub page
  const isMainHub = location.pathname === '/member-hub';

  if (isMainHub) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold text-kapstone-purple mb-8">Member Hub</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.to}
                  onClick={() => setSelectedPath(item.to)}
                  className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-kapstone-sage/10 rounded-lg">
                      <Icon className="h-6 w-6 text-kapstone-sage" />
                    </div>
                    <h2 className="ml-4 text-xl font-semibold text-kapstone-purple">{item.name}</h2>
                  </div>
                  <p className="text-gray-600">{item.description}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="col-span-12 lg:col-span-3">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden sticky top-24">
              <div className="p-6 bg-kapstone-sage text-white">
                <h2 className="text-xl font-semibold">Member Hub</h2>
              </div>
              <nav className="p-4">
                <ul className="space-y-2">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.to;
                    
                    return (
                      <li key={item.name}>
                        <Link
                          to={item.to}
                          className={`flex items-center p-3 rounded-md transition-colors ${
                            isActive
                              ? 'bg-kapstone-sage text-white'
                              : 'text-gray-700 hover:bg-kapstone-sage hover:text-white'
                          }`}
                        >
                          <Icon className="h-5 w-5 mr-3" />
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm opacity-75">{item.description}</div>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-12 lg:col-span-9">
            <div className="bg-white rounded-lg shadow-lg">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}