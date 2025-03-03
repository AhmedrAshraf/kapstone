import React from 'react';
import { MapPin, Phone, Globe, Star, Clock, Users, CheckCircle, Video } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EnhancedClinic } from '../../types/supabase';

interface ClinicCardProps {
  clinic: EnhancedClinic;
  view: 'grid' | 'list';
}

export function ClinicCard({ clinic, view }: ClinicCardProps) {
  return (
    <div className={`bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 ${
      view === 'grid' ? 'h-full' : ''
    }`}>
      <div className={view === 'list' ? 'flex gap-6' : ''}>
        <div className={view === 'list' ? 'w-1/3' : 'mb-4'}>
          <div className="relative pb-[75%]">
            <Link to={`/clinic/${clinic.id}`} className="block absolute inset-0">
              <img
                src={clinic.images[0]}
                alt={clinic.name}
                className="w-full h-full object-cover rounded-lg hover:opacity-90 transition-opacity"
              />
            </Link>
          </div>
        </div>
        <div className={view === 'list' ? 'w-2/3' : ''}>
          <div className="flex items-center justify-between mb-2">
            <Link 
              to={`/clinic/${clinic.id}`}
              className="text-xl font-semibold text-kapstone-purple hover:text-kapstone-sage"
            >
              {clinic.name}
            </Link>
            <div className="flex items-center">
              <Star className="h-5 w-5 text-kapstone-gold fill-current" />
              <span className="ml-1 text-gray-600">{clinic.rating}</span>
              <span className="ml-1 text-gray-400">({clinic.reviewCount})</span>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-kapstone-sage mr-2 mt-1" />
              <p className="text-gray-600">
                {clinic.location.address}, {clinic.location.city}, {clinic.location.state}{' '}
                {clinic.location.zip}
              </p>
            </div>
            {clinic.phone && (
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-kapstone-sage mr-2" />
                <a href={`tel:${clinic.phone}`} className="text-kapstone-purple hover:text-kapstone-sage">
                  {clinic.phone}
                </a>
              </div>
            )}
            {clinic.website && (
              <div className="flex items-center">
                <Globe className="h-5 w-5 text-kapstone-sage mr-2" />
                <a
                  href={clinic.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-kapstone-purple hover:text-kapstone-sage"
                >
                  {new URL(clinic.website).hostname}
                </a>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {clinic.specialties.slice(0, 3).map((specialty) => (
              <span
                key={specialty}
                className="px-2 py-1 bg-kapstone-sage/10 text-kapstone-sage rounded-full text-sm"
              >
                {specialty}
              </span>
            ))}
            {clinic.specialties.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                +{clinic.specialties.length - 3} more
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-kapstone-sage mr-1" />
              Wait time: {clinic.waitTime}
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 text-kapstone-sage mr-1" />
              Team size: {clinic.teamSize}
            </div>
            {clinic.acceptingNewPatients && (
              <div className="flex items-center text-kapstone-sage">
                <CheckCircle className="h-4 w-4 mr-1" />
                Accepting patients
              </div>
            )}
            {clinic.virtualConsultation && (
              <div className="flex items-center text-kapstone-sage">
                <Video className="h-4 w-4 mr-1" />
                Virtual consults
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}