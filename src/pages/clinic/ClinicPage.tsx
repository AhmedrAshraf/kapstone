import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Phone, Globe, Star, Clock, Users, CheckCircle, Video, ArrowLeft, Shield, Award, Stethoscope } from 'lucide-react';
import { EnhancedClinic } from '../../types/supabase';
// import { ImageSlider } from '../../components//clinics/ImageSlider';
import { supabase } from '../../lib/supabase'; // Import Supabase client


// Mock data for demonstration
// const mockClinic: EnhancedClinic = {
//   id: '1',
//   name: 'Center for Healing Journeys',
//   description: `The Center for Healing Journeys specializes in Ketamine Assisted Psychotherapy (KAP) for mental health treatment. Our approach combines the therapeutic benefits of ketamine with professional psychotherapy to create lasting positive change.

// Our team of experienced professionals provides comprehensive care in a safe, supportive environment. We believe in treating the whole person, not just symptoms, and work closely with each patient to develop personalized treatment plans that address their unique needs and goals.

// The center features state-of-the-art treatment rooms designed for comfort and safety, a dedicated integration space for post-session processing, and a team of specialists including psychiatrists, psychotherapists, and trained KAP facilitators.`,
//   address: '17 New South St',
//   phone: '(413) 586-1525',
//   email: 'info@healingjourneyskap.com',
//   website: 'https://www.wneketamine.com',
//   location: {
//     lat: 42.319435,
//     lng: -72.631927,
//     address: '17 New South St',
//     city: 'Northampton',
//     state: 'MA',
//     zip: '01060'
//   },
//   services: [
//     { id: '1', name: 'Ketamine Infusion', description: 'Medical ketamine treatment administered by our experienced medical team in a safe, monitored environment.' },
//     { id: '2', name: 'Psychotherapy', description: 'Individual therapy sessions with licensed mental health professionals specializing in ketamine-assisted treatment.' },
//     { id: '3', name: 'Integration Support', description: 'Structured support to help process and integrate insights gained during treatment into daily life.' }
//   ],
//   specialties: ['Depression', 'Anxiety', 'PTSD', 'OCD'],
//   insuranceAccepted: ['Blue Cross', 'Aetna', 'United Healthcare'],
//   teamSize: 8,
//   rating: 4.9,
//   reviewCount: 127,
//   waitTime: '1-2 weeks',
//   acceptingNewPatients: true,
//   virtualConsultation: true,
//   certifications: ['MAPS Certified', 'KAP Certified'],
//   images: [
//     'https://images.unsplash.com/photo-1629909613654-28e377c37b09',
//     'https://images.unsplash.com/photo-1629909615957-be38d48fbbe4',
//     'https://images.unsplash.com/photo-1629909615678-20db842f2853',
//     'https://images.unsplash.com/photo-1629909615789-123456789012'
//   ],
//   is_verified: true,
//   is_published: true,
//   created_at: '2024-01-01',
//   updated_at: '2024-01-01'
// };

// const teamMembers = [
//   {
//     name: 'Dr. Sarah Johnson',
//     role: 'Lead Psychiatrist',
//     image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2',
//     bio: 'Dr. Johnson has over 15 years of experience in psychiatry with a special focus on ketamine-assisted therapy.',
//     certifications: ['Board Certified Psychiatrist', 'MAPS Trained', 'KAP Certified']
//   },
//   {
//     name: 'Michael Chen, LMHC',
//     role: 'Lead Psychotherapist',
//     image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
//     bio: 'Michael specializes in integration therapy and has helped hundreds of patients process their ketamine experiences.',
//     certifications: ['Licensed Mental Health Counselor', 'KAP Certified', 'IFS Trained']
//   }
// ];

export function ClinicPage() {
  const { id } = useParams();
  const [clinic, setClinic] = useState<EnhancedClinic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch clinic data based on the ID
    const fetchClinic = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('clinics')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          throw error;
        }

        setClinic(data);
      } catch (err) {
        console.error('Error fetching clinic:', err);
        setError('Failed to fetch clinic details.');
      } finally {
        setLoading(false);
      }
    };

    fetchClinic();
  }, [id]);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-red-500">{error}</div>;
  }

  if (!clinic) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Clinic not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Image Slider */}
      <img className='w-full h-[50vh] object-cover' src={clinic?.image_url} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          to="/clinic-directory"
          className="inline-flex items-center text-kapstone-sage hover:text-kapstone-sage-dark mb-8"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Directory
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-kapstone-purple mb-2">
                    {clinic?.name}
                  </h1>
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-kapstone-gold fill-current" />
                    <span className="ml-1 text-gray-600">{clinic?.rating}</span>
                    <span className="ml-1 text-gray-400">({clinic?.reviewCount} reviews)</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {clinic?.is_verified && (
                    <div className="flex items-center text-kapstone-sage bg-kapstone-sage/10 px-3 py-1 rounded-full">
                      <Shield className="h-4 w-4 mr-1" />
                      <span className="text-sm">Verified</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="prose prose-lg max-w-none mb-8">
                <p className="text-gray-600">{clinic?.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-kapstone-sage mr-2 mt-1" />
                    <p className="text-gray-600">
                      {clinic?.location.address}, {clinic?.location.city}, {clinic?.location.state}{' '}
                      {clinic?.location.zip}
                    </p>
                  </div>
                  {clinic?.phone && (
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-kapstone-sage mr-2" />
                      <a href={`tel:${clinic?.phone}`} className="text-kapstone-purple hover:text-kapstone-sage">
                        {clinic?.phone}
                      </a>
                    </div>
                  )}
                  {clinic?.website && (
                    <div className="flex items-center">
                      <Globe className="h-5 w-5 text-kapstone-sage mr-2" />
                      <a
                        href={clinic?.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-kapstone-purple hover:text-kapstone-sage"
                      >
                        {new URL(clinic?.website).hostname}
                      </a>
                    </div>
                  )}
                </div>

                {/* <div className="space-y-4">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-kapstone-sage mr-2" />
                    <span className="text-gray-600">Wait time: {clinic?.waitTime}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-kapstone-sage mr-2" />
                    <span className="text-gray-600">Team size: {clinic?.teamSize}</span>
                  </div>
                  {clinic?.acceptingNewPatients && (
                    <div className="flex items-center text-kapstone-sage">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      <span>Accepting new patients</span>
                    </div>
                  )}
                  {clinic?.virtualConsultation && (
                    <div className="flex items-center text-kapstone-sage">
                      <Video className="h-5 w-5 mr-2" />
                      <span>Virtual consultations available</span>
                    </div>
                  )}
                </div> */}
              </div>
            </div>

            {/* Services */}
            {/* <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-kapstone-purple mb-6">Our Services</h2>
              <div className="grid gap-6">
                {clinic?.services.map((service) => (
                  <div key={service.id} className="border-b border-gray-200 last:border-0 pb-6 last:pb-0">
                    <h3 className="text-xl font-semibold text-kapstone-purple mb-2">{service.name}</h3>
                    <p className="text-gray-600">{service.description}</p>
                  </div>
                ))}
              </div>
            </div> */}

            {/* Team Members */}
            {/* <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-kapstone-purple mb-6">Our Team</h2>
              <div className="grid gap-8">
                {clinic?.teamMembers?.map((member) => (
                  <div key={member.name} className="flex gap-6">
                    <div className="w-32 h-32 flex-shrink-0">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-kapstone-purple mb-1">{member.name}</h3>
                      <p className="text-kapstone-sage mb-2">{member.role}</p>
                      <p className="text-gray-600 mb-4">{member.bio}</p>
                      <div className="flex flex-wrap gap-2">
                        {member.certifications.map((cert) => (
                          <div
                            key={cert}
                            className="flex items-center bg-kapstone-sage/10 text-kapstone-sage px-3 py-1 rounded-full text-sm"
                          >
                            <Award className="h-4 w-4 mr-1" />
                            {cert}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div> */}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            {/* Quick Info Card */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-kapstone-purple mb-4">Quick Info</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Specialties</h4>
                  <div className="flex flex-wrap gap-2">
                    {clinic?.specialties.map((specialty) => (
                      <span
                        key={specialty}
                        className="px-2 py-1 bg-kapstone-sage/10 text-kapstone-sage rounded-full text-sm"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
                {/* <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Insurance Accepted</h4>
                  <div className="flex flex-wrap gap-2">
                    {clinic?.insuranceAccepted.map((insurance) => (
                      <span
                        key={insurance}
                        className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-sm"
                      >
                        {insurance}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Certifications</h4>
                  <div className="flex flex-wrap gap-2">
                    {clinic?.certifications.map((cert) => (
                      <div
                        key={cert}
                        className="flex items-center bg-kapstone-purple/10 text-kapstone-purple px-3 py-1 rounded-full text-sm"
                      >
                        <Award className="h-4 w-4 mr-1" />
                        {cert}
                      </div>
                    ))}
                  </div> */}
              {/* </div> */}
                </div>
            </div>

            {/* Contact Card */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-kapstone-purple mb-4">Contact Us</h3>
              <form className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-kapstone-sage focus:ring-kapstone-sage"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-kapstone-sage focus:ring-kapstone-sage"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-kapstone-sage focus:ring-kapstone-sage"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-kapstone-sage text-white py-2 px-4 rounded-md hover:bg-kapstone-sage-dark transition-colors"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}