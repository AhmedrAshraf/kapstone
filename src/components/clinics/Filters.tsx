import React from 'react';
import { Filter, Search, X } from 'lucide-react';

interface FiltersProps {
  filters: {
    search: string;
    services: string[];
    specialties: string[];
    insurance: string[];
    acceptingNewPatients: boolean;
    virtualConsultation: boolean;
    distance: number;
  };
  onFilterChange: (filters: any) => void;
  onReset: () => void;
}

export function Filters({ filters, onFilterChange, onReset }: FiltersProps) {
  const services = [
    'Ketamine Infusion',
    'Psychotherapy',
    'Integration Support',
    'Group Therapy',
    'Family Support',
    'Medication Management'
  ];

  const specialties = [
    'Depression',
    'Anxiety',
    'PTSD',
    'OCD',
    'Addiction',
    'Pain Management'
  ];

  const insuranceProviders = [
    'Medicare',
    'Medicaid',
    'Blue Cross',
    'Aetna',
    'United Healthcare',
    'Cigna'
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-kapstone-purple flex items-center">
          <Filter className="h-5 w-5 mr-2" />
          Filters
        </h3>
        <button
          onClick={onReset}
          className="text-sm text-kapstone-sage hover:text-kapstone-sage-dark flex items-center"
        >
          <X className="h-4 w-4 mr-1" />
          Reset
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search clinics..."
          value={filters.search}
          onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-kapstone-sage focus:border-kapstone-sage"
        />
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
      </div>

      {/* Distance Slider */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Distance (miles): {filters.distance === 1000 ? 'Any distance' : filters.distance}
        </label>
        <input
          type="range"
          min="5"
          max="1000"
          step="5"
          value={filters.distance}
          onChange={(e) => onFilterChange({ ...filters, distance: Number(e.target.value) })}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>5 miles</span>
          <span>Any distance</span>
        </div>
      </div>

      {/* Services */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Services</h4>
        <div className="space-y-2">
          {services.map((service) => (
            <label key={service} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.services.includes(service)}
                onChange={(e) => {
                  const newServices = e.target.checked
                    ? [...filters.services, service]
                    : filters.services.filter((s) => s !== service);
                  onFilterChange({ ...filters, services: newServices });
                }}
                className="h-4 w-4 text-kapstone-sage focus:ring-kapstone-sage border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-600">{service}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Specialties */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Specialties</h4>
        <div className="space-y-2">
          {specialties.map((specialty) => (
            <label key={specialty} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.specialties.includes(specialty)}
                onChange={(e) => {
                  const newSpecialties = e.target.checked
                    ? [...filters.specialties, specialty]
                    : filters.specialties.filter((s) => s !== specialty);
                  onFilterChange({ ...filters, specialties: newSpecialties });
                }}
                className="h-4 w-4 text-kapstone-sage focus:ring-kapstone-sage border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-600">{specialty}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Insurance */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Insurance Accepted</h4>
        <div className="space-y-2">
          {insuranceProviders.map((provider) => (
            <label key={provider} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.insurance.includes(provider)}
                onChange={(e) => {
                  const newInsurance = e.target.checked
                    ? [...filters.insurance, provider]
                    : filters.insurance.filter((i) => i !== provider);
                  onFilterChange({ ...filters, insurance: newInsurance });
                }}
                className="h-4 w-4 text-kapstone-sage focus:ring-kapstone-sage border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-600">{provider}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Additional Filters */}
      <div className="space-y-2">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={filters.acceptingNewPatients}
            onChange={(e) =>
              onFilterChange({ ...filters, acceptingNewPatients: e.target.checked })
            }
            className="h-4 w-4 text-kapstone-sage focus:ring-kapstone-sage border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-600">Accepting New Patients</span>
        </label>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={filters.virtualConsultation}
            onChange={(e) =>
              onFilterChange({ ...filters, virtualConsultation: e.target.checked })
            }
            className="h-4 w-4 text-kapstone-sage focus:ring-kapstone-sage border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-600">Virtual Consultation Available</span>
        </label>
      </div>
    </div>
  );
}