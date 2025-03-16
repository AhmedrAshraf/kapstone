import React, { useState, useEffect } from 'react';
import { ViewToggle } from '../components/clinics/ViewToggle';
import { Filters } from '../components/clinics/Filters';
import { ClinicCard } from '../components/clinics/ClinicCard';
import { EnhancedClinic } from '../types/supabase';
import { MapPin } from 'lucide-react';
import { useScrollToTop } from '../hooks/useScrollToTop';

const initialFilters = {
  search: '',
  services: [],
  specialties: [],
  insurance: [],
  acceptingNewPatients: false,
  virtualConsultation: false,
  distance: 1000 // Set default to maximum (any distance)
};

// Mock data for demonstration
const mockClinics: EnhancedClinic[] = [
  {
    id: '1',
    name: 'Center for Healing Journeys',
    description: 'Specialized in ketamine-assisted psychotherapy for mental health treatment.',
    address: '17 New South St',
    phone: '(413) 586-1525',
    email: 'info@healingjourneyskap.com',
    website: 'https://www.wneketamine.com',
    location: {
      lat: 42.319435,
      lng: -72.631927,
      address: '17 New South St',
      city: 'Northampton',
      state: 'MA',
      zip: '01060'
    },
    services: [
      { id: '1', name: 'Ketamine Infusion', description: 'Medical ketamine treatment' },
      { id: '2', name: 'Psychotherapy', description: 'Individual therapy sessions' },
      { id: '3', name: 'Integration Support', description: 'Post-treatment integration' }
    ],
    specialties: ['Depression', 'Anxiety', 'PTSD', 'OCD'],
    insuranceAccepted: ['Blue Cross', 'Aetna', 'United Healthcare'],
    teamSize: 8,
    rating: 4.9,
    reviewCount: 127,
    waitTime: '1-2 weeks',
    acceptingNewPatients: true,
    virtualConsultation: true,
    certifications: ['MAPS Certified', 'KAP Certified'],
    images: [
      'https://images.unsplash.com/photo-1629909613654-28e377c37b09',
      'https://images.unsplash.com/photo-1629909615957-be38d48fbbe4'
    ],
    is_verified: true,
    is_published: true,
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  },
  // Add more mock clinics here
];

export function ClinicDirectory() {
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [filters, setFilters] = useState(initialFilters);
  const [filteredClinics, setFilteredClinics] = useState<EnhancedClinic[]>(mockClinics);

  // Add scroll to top functionality
  useScrollToTop();

  useEffect(() => {
    // Apply filters to clinics
    const filtered = mockClinics.filter((clinic) => {
      // Search filter
      if (filters.search && !clinic.name.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }

      // Services filter
      if (filters.services.length > 0 && !filters.services.every(service => 
        clinic.services.some(s => s.name === service)
      )) {
        return false;
      }

      // Specialties filter
      if (filters.specialties.length > 0 && !filters.specialties.every(specialty =>
        clinic.specialties.includes(specialty)
      )) {
        return false;
      }

      // Insurance filter
      if (filters.insurance.length > 0 && !filters.insurance.every(insurance =>
        clinic.insuranceAccepted.includes(insurance)
      )) {
        return false;
      }

      // Accepting new patients filter
      if (filters.acceptingNewPatients && !clinic.acceptingNewPatients) {
        return false;
      }

      // Virtual consultation filter
      if (filters.virtualConsultation && !clinic.virtualConsultation) {
        return false;
      }

      return true;
    });

    setFilteredClinics(filtered);
  }, [filters]);

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const handleFilterReset = () => {
    setFilters(initialFilters);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Radial Gradient */}
      <section className="relative text-white min-h-[45vh] flex items-center pt-28">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1527613426441-4da17471b66d"
            alt="Healing environment"
            className="w-full h-full object-cover brightness-100"
          />
          <div className="absolute inset-0 bg-gray-900/10" />
        </div>
        <div className="relative w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold sm:text-5xl text-shadow-lg">Find a KAPstone Clinic</h1>
              <p className="mt-6 max-w-3xl mx-auto text-xl text-shadow">
                Connect with verified clinics offering the highest standard of ketamine-assisted psychotherapy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <Filters
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleFilterReset}
            />
          </div>

          {/* Results */}
          <div className="lg:w-3/4">
            <div className="mb-6 flex justify-between items-center">
              <div className="text-gray-600">
                {filteredClinics.length} clinic{filteredClinics.length !== 1 ? 's' : ''} found
              </div>
              <ViewToggle currentView={viewMode} onViewChange={setViewMode} />
            </div>

            {viewMode === 'map' ? (
              <div className="bg-white rounded-lg shadow-lg p-6 h-[600px] flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MapPin className="h-12 w-12 mx-auto mb-4" />
                  <p>Map view coming soon</p>
                </div>
              </div>
            ) : (
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                {filteredClinics.map((clinic) => (
                  <ClinicCard key={clinic.id} clinic={clinic} view={viewMode} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}