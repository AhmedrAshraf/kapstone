import React, { useState, useEffect } from 'react';
import { ViewToggle } from '../components/clinics/ViewToggle';
import { Filters } from '../components/clinics/Filters';
import { ClinicCard } from '../components/clinics/ClinicCard';
import { EnhancedClinic } from '../types/supabase';
import { MapPin } from 'lucide-react';
import { useScrollToTop } from '../hooks/useScrollToTop';
import { supabase } from '../lib/supabase';
import { X, Plus } from 'lucide-react';

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
// const mockClinics: EnhancedClinic[] = [
//   {
//     id: '1',
//     name: 'Center for Healing Journeys',
//     description: 'Specialized in ketamine-assisted psychotherapy for mental health treatment.',
//     address: '17 New South St',
//     phone: '(413) 586-1525',
//     email: 'info@healingjourneyskap.com',
//     website: 'https://www.wneketamine.com',
//     location: {
//       lat: 42.319435,
//       lng: -72.631927,
//       address: '17 New South St',
//       city: 'Northampton',
//       state: 'MA',
//       zip: '01060'
//     },
//     services: [
//       { id: '1', name: 'Ketamine Infusion', description: 'Medical ketamine treatment' },
//       { id: '2', name: 'Psychotherapy', description: 'Individual therapy sessions' },
//       { id: '3', name: 'Integration Support', description: 'Post-treatment integration' }
//     ],
//     specialties: ['Depression', 'Anxiety', 'PTSD', 'OCD'],
//     insuranceAccepted: ['Blue Cross', 'Aetna', 'United Healthcare'],
//     teamSize: 8,
//     rating: 4.9,
//     reviewCount: 127,
//     waitTime: '1-2 weeks',
//     acceptingNewPatients: true,
//     virtualConsultation: true,
//     certifications: ['MAPS Certified', 'KAP Certified'],
//     images: [
//       'https://images.unsplash.com/photo-1629909613654-28e377c37b09',
//       'https://images.unsplash.com/photo-1629909615957-be38d48fbbe4'
//     ],
//     is_verified: true,
//     is_published: true,
//     created_at: '2024-01-01',
//     updated_at: '2024-01-01'
//   },
//   // Add more mock clinics here
// ];

export function ClinicDirectory() {
  const [user, setUser] = useState(localStorage.getItem('kapstone-auth') ? JSON.parse(localStorage.getItem('kapstone-auth')).user : null);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [filters, setFilters] = useState(initialFilters);
  const [clinicsData, setClinicData] = useState(null)
  const [filteredClinics, setFilteredClinics] = useState<EnhancedClinic[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [newClinic, setNewClinic] = useState({
    name: '',
    owners: '',
    statement: '',
    location: { city: '', state: '', address: '' },
    website: '',
    phone: '',
    email: '',
    clinic_status: 'pending',
    is_verified: false,
    specialties: [],
    image_url: '',
    user_id: user?.id,
    reviewCount: 0, 
    rating: 0, 
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [editingClinic, setEditingClinic] = useState<EnhancedClinic | null>(null);
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (clinicsData) {
      setFilteredClinics(clinicsData);
    }
  }, [clinicsData]);

  useScrollToTop();

  useEffect(() => {
    // Apply filters to clinics
    const filtered = (clinicsData || []).filter((clinic) => {
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

  const handleAddSpecialty = () => {
    setNewClinic((prev) => ({
      ...prev,
      specialties: [...prev.specialties, ''] 
    }));
  };

  const handleSpecialtyChange = (index, value) => {
    const updatedSpecialties = [...newClinic.specialties];
    updatedSpecialties[index] = value;
    setNewClinic((prev) => ({
      ...prev,
      specialties: updatedSpecialties
    }));
  };
  
  const handleRemoveSpecialty = (index) => {
    const updatedSpecialties = newClinic.specialties.filter((_, i) => i !== index);
    setNewClinic((prev) => ({
      ...prev,
      specialties: updatedSpecialties
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'address') {
      setNewClinic((prev) => ({
        ...prev,
        location: { ...prev.location, address: value }
      }));
    } else {
      setNewClinic((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // const handleImageUpload = async (event) => {
  //   try {
  //     const file = event.target.files[0];
  //     if (!file) return;

  //     setIsUploading(true); 

  //     const filePath = `public/${Date.now()}_${file.name}`;
  //     const { data, error } = await supabase.storage
  //       .from('clinics')
  //       .upload(filePath, file, {
  //         cacheControl: '3600',
  //         upsert: false
  //       });

  //     if (error) {
  //       console.error("Error uploading image", error);
  //       setIsUploading(false);
  //       return;
  //     }

  //     const { data: publicUrl } = supabase.storage.from('clinics').getPublicUrl(filePath);

  //     if (!publicUrl) {
  //       console.error("Error fetching public URL");
  //       setIsUploading(false);
  //       return;
  //     }
  //     console.log("✅ Public URL:", publicUrl.publicUrl);
  //     setNewClinic((prev) => ({
  //       ...prev,
  //       image_url: publicUrl.publicUrl
  //     }));

  //     setIsUploading(false); 
  //   } catch (error) {
  //     console.error("Error ", error);
  //     setIsUploading(false); 
  //   }
  // };

  const handleImageUpload = async (event) => {
    try {
      const file = event.target.files[0];
      if (!file) return;
  
      setIsUploading(true);
  
      const filePath = `public/${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage
        .from('clinics')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });
  
      if (error) {
        console.error("Error uploading image", error);
        setIsUploading(false);
        return;
      }
  
      const { data: publicUrl } = supabase.storage.from('clinics').getPublicUrl(filePath);
  
      if (!publicUrl) {
        console.error("Error fetching public URL");
        setIsUploading(false);
        return;
      }
  
      console.log("✅ Public URL:", publicUrl.publicUrl);
  
      setEditingClinic((prev) => ({
        ...prev,
        image_url: publicUrl.publicUrl,
      }));
  
      setIsUploading(false);
    } catch (error) {
      console.error("Error ", error);
      setIsUploading(false);
    }
  };


  const handleAddClinic = async (e) => {
    e.preventDefault();

    if (user?.id) {
      try {
        if (!newClinic.image_url) {
          alert("Please upload an image before adding the clinic.");
          return;
        }

        console.log('New clinic to be added:', newClinic);
        setModalOpen(false);

        const { error } = await supabase
          .from('clinics')
          .insert([{ ...newClinic }]);

        if (error) {
          console.error("Error occurred when adding clinic", error);
        } else {
          console.log("Clinic added successfully");
          setNewClinic({
            name: '',
            owners: '',
            statement: '',
            location: { city: '', state: '', address: '' },
            website: '',
            phone: '',
            email: '',
            clinic_status: 'pending',
            is_verified: false,
            image_url: '',
            user_id: user?.id
          });
          fetchClinics();
        }
      } catch (error) {
        console.error("Error adding clinic", error);
      }
    } else {
      alert("Please login to add clinic");
    }
  };

  const fetchClinics = async () => {
    try{
      setLoading(true)
    const { data, error } = await supabase
      .from('clinics')
      .select("*");
      
      console.log("🚀 ~ fetchClinics ~ data:", data)
    if (error) {
      console.error("Error fetching clinics:", error);
    } else {
      setClinicData(data);
      setFilteredClinics(data); 
    }
  }catch(err){
    console.log("err", err);
  }finally{
    setLoading(false)
  }
  };
  
  useEffect(() => {
    console.log(loading);
    console.log("clinicsData", clinicsData);
    
    fetchClinics();
  }, []);


  const handleUpdateClinic = async (e) => {
    e.preventDefault();
  
    if (editingClinic) {
      console.log("hello i am editingClinic", editingClinic);
      
      try {
        const { error } = await supabase
          .from('clinics')
          .update(editingClinic)
          .eq('id', editingClinic.id);
  
        if (error) {
          console.error("Error updating clinic", error);
        } else {
          console.log("Clinic updated successfully");
          setEditModalOpen(false);
          fetchClinics(); // Refresh the clinic list
        }
      } catch (error) {
        console.error("Error updating clinic", error);
      }
    }
  };

  const handleEditClinic = (clinic: EnhancedClinic) => {
    setEditingClinic(clinic);
    setEditModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-kapstone-sage border-t-transparent"></div>
      </div>
    );
  }
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
          <div className="lg:w-3/4 ">
            <div className="mb-6 flex justify-between items-center">
              <div className="text-gray-600">
                {filteredClinics.length} clinic{filteredClinics.length !== 1 ? 's' : ''} found
              </div>
            <div className='flex gap-5'>
              <ViewToggle currentView={viewMode} onViewChange={setViewMode} />
              {user && (
              <button onClick={() => setModalOpen(true)} className="w-full bg-kapstone-sage text-white py-3 px-4 rounded-md hover:bg-kapstone-sage-dark transition-colors disabled:opacity-50">Add directory</button>
              )}
            </div>
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
                  <ClinicCard key={clinic.id} clinic={clinic} view={viewMode} onEdit={handleEditClinic} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Clinic Modal */}
      {isModalOpen &&(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-all duration-300">
          <form onSubmit={handleAddClinic}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl transform transition-all duration-300 ease-in-out"
          >
            {/* Header */}
            <div className="relative border-b border-gray-100 px-6 py-5">
              <h2 className="text-2xl font-bold text-gray-800">Add New Clinic</h2>
              <button onClick={() => setModalOpen(false)} className="absolute right-6 top-5 text-gray-400 hover:text-gray-600 transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="sr-only">Close</span>
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-6 space-y-2">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  // required
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 outline-none"
                  name="name"
                  value={newClinic.name}
                  onChange={handleInputChange}
                />
              </div>
        
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <input
                    // required
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 outline-none"
                    name="address"
                    value={newClinic.location.address}
                    onChange={handleInputChange}
                  />
                </div>

              <div className='grid grid-cols-2 w-full gap-2'>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Review Count</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 outline-none"
                    name="reviewCount"
                    value={newClinic.reviewCount}
                    onChange={handleInputChange}
                  />
                </div>


              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Rating (0 - 5)</label>
                <input
                  type="number"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 outline-none"
                  name="rating"
                  value={newClinic.rating}
                  min="0"
                  max="5"
                  step="0.1"
                  onChange={handleInputChange}
                />
              </div>
              </div>


              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    // required
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 outline-none"
                    name="phone"
                    value={newClinic.phone}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    // required
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 outline-none"
                    name="email"
                    value={newClinic.email}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Website</label>
                <input
                  // required
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 outline-none"
                  name="website"
                  value={newClinic.website}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Images</label>
                <input
                  type='file'
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 outline-none"
                  name="images"
                  onChange={handleImageUpload}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Specialties</label>
                {newClinic.specialties.map((specialty, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder={`Enter Specialty ${index + 1}`} 
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 outline-none"
                      value={specialty}
                      onChange={(e) => handleSpecialtyChange(index, e.target.value)}
                    />
                    <button 
                      type="button"
                      onClick={() => handleRemoveSpecialty(index)}
                    >
                      <X/>
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddSpecialty}
                  className="mt-2 px-3 py-2 bg-kapstone-sage text-white font-semibold rounded-md transition flex"
                >
                  <Plus/> Add Specialty
                </button>
              </div>


            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 px-6 py-4 flex justify-end gap-3">
              <button
                className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors duration-200 font-medium"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type='submit'
                className="px-5 py-2.5 rounded-lg bg-kapstone-sage text-white hover:bg-opacity-90 transition-colors duration-200 font-medium shadow-sm"
                disabled={isUploading}
              >
                {isUploading ? "Uploading Image..." : "Add Clinic"}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {isEditModalOpen && editingClinic && (
        console.log("editingClinic", editingClinic),
        
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-all duration-300">
          <form onSubmit={handleUpdateClinic}
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl transform transition-all duration-300 ease-in-out"
        >
          {/* Header */}
          <div className="relative border-b border-gray-100 px-6 py-5">
            <h2 className="text-2xl font-bold text-gray-800">Edit Clinic</h2>
            <button onClick={() => setModalOpen(false)} className="absolute right-6 top-5 text-gray-400 hover:text-gray-600 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="sr-only">Close</span>
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-6 space-y-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                // required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 outline-none"
                name="name"
                value={editingClinic.name}
                onChange={(e) => setEditingClinic({ ...editingClinic, name: e.target.value })}
              />
            </div>
      
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <input
                  // required
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 outline-none"
                  name="address"
                  value={editingClinic.location.address}
                  onChange={(e) => setEditingClinic({ ...editingClinic, location: e.target.value })}
                />
              </div>

            <div className='grid grid-cols-2 w-full gap-2'>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Review Count</label>
                <input
                  type="number"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 outline-none"
                  name="reviewCount"
                  value={editingClinic.reviewCount}
                  onChange={(e) => setEditingClinic({ ...editingClinic, reviewCount: e.target.value })}
                />
              </div>


            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Rating (0 - 5)</label>
              <input
                type="number"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 outline-none"
                name="rating"
                value={editingClinic.rating}
                min="0"
                max="5"
                step="0.1"
                onChange={(e) => setEditingClinic({ ...editingClinic, rating: e.target.value })}
              />
            </div>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  // required
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 outline-none"
                  name="phone"
                  value={editingClinic.phone}
                  onChange={(e) => setEditingClinic({ ...editingClinic, phone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  // required
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 outline-none"
                  name="email"
                  value={editingClinic.email}
                  onChange={(e) => setEditingClinic({ ...editingClinic, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Website</label>
              <input
                // required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 outline-none"
                name="website"
                value={editingClinic.website}
                onChange={(e) => setEditingClinic({ ...editingClinic, website: e.target.value })}
              />
            </div>
            
          {editingClinic.image_url && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Current Image</label>
            <img
              src={editingClinic.image_url}
              alt="Clinic"
              className="w-full h-48 object-cover rounded-lg"
            />
          </div>
        )}

        {/* Image upload input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Upload New Image</label>
          <input
            type="file"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 outline-none"
            name="images"
            onChange={handleImageUpload}
          />
        </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 px-6 py-4 flex justify-end gap-3">
            <button
              className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors duration-200 font-medium"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type='submit'
              className="px-5 py-2.5 rounded-lg bg-kapstone-sage text-white hover:bg-opacity-90 transition-colors duration-200 font-medium shadow-sm"
              disabled={isUploading}
            >
              {isUploading ? "Updating Image..." : "Edit clinic"}
            </button>
          </div>
        </form>
      </div>
    )}
    </div>
  );
}