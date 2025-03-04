import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Building2, User, Users, Tag, MessageSquare, CheckCircle, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CheckoutModal } from '../../components/checkout/CheckoutModal';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
// Form step types
type FormStep = 'basic' | 'specialties' | 'services' | 'contact';
type MembershipType = 'clinic' | 'solo' | 'affiliate';

// Organized specialties into categories for better UX
const SPECIALTIES = {
  mentalHealth: [
    'Depression',
    'Anxiety',
    'PTSD',
    'cPTSD',
    'OCD',
    'Bipolar Disorder',
    'Mood Disorders',
    'Thought Disorders'
  ],
  addiction: [
    'Alcohol Use/Abuse',
    'Substance Use/Abuse',
    'Chronic Relapse',
    'Gambling',
    'Internet Addiction'
  ],
  relationships: [
    'Couples',
    'Family Conflict',
    'Intimacy, Sexuality',
    'Communication',
    'Divorce',
    'Infidelity'
  ],
  trauma: [
    'PTSD',
    'cPTSD',
    'Domestic Violence/Abuse',
    'Traumatic Brain Injury'
  ],
  medical: [
    'Chronic Illness',
    'Cancer',
    'End of Life',
    'Pain Management',
    'Medication Management'
  ]
};

const THERAPY_TYPES = [
  'Internal Family Systems (IFS)',
  'EMDR',
  'Cognitive Behavioral (CBT)',
  'Somatic',
  'Psychodynamic',
  'Mindfulness Based (MBCT)',
  'Trauma Focused',
  'Integrative',
  'Art Therapy',
  'Music Therapy'
];

const POPULATIONS = [
  'Adults',
  'Couples',
  'Children',
  'Teens / Adolescents',
  'Veterans',
  'First Responders',
  'LGBTQ+',
  'Elderly'
];

export function NewClinicForm() {
  const formRef = useRef<HTMLDivElement>(null);
  const [currentStep, setCurrentStep] = useState<FormStep>('basic');
  const [membershipType, setMembershipType] = useState<MembershipType | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [userDetail, setUserDetail] =  useState(null)
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    owners: '',
    statement: '',
    location: '',
    specialties: [] as string[],
    therapyTypes: [] as string[],
    populations: [] as string[],
    website: '',
    email: '',
    phone: ''
  });

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleArrayItem = (field: string, item: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field as keyof typeof prev].includes(item)
        ? (prev[field as keyof typeof prev] as string[]).filter(i => i !== item)
        : [...(prev[field as keyof typeof prev] as string[]), item]
    }));
  };

  const scrollToTop = () => {
    if (formRef.current) {
      const offset = formRef.current.offsetTop - 100; // Add offset to show progress bar
      window.scrollTo({
        top: offset,
        behavior: 'smooth'
      });
    }
  };

  const handleStepChange = (step: FormStep) => {
    setCurrentStep(step);
    scrollToTop();
  };

  // const handleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   alert('Payment integration is temporarily disabled. Please check back later.');
  // };

  const renderStep = () => {
    switch (currentStep) {
      case 'basic':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700">
                I am applying as a:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setMembershipType('clinic')}
                  className={`relative p-6 text-left rounded-lg border-2 transition-colors ${
                    membershipType === 'clinic'
                      ? 'border-kapstone-sage bg-kapstone-sage/5'
                      : 'border-gray-200 hover:border-kapstone-sage/50'
                  }`}
                >
                  <div className="flex items-center mb-4">
                    <div className={`p-3 rounded-lg ${
                      membershipType === 'clinic' 
                        ? 'bg-kapstone-sage text-white' 
                        : 'bg-kapstone-sage/10 text-kapstone-sage'
                    }`}>
                      <Building2 className="h-6 w-6" />
                    </div>
                  </div>
                  <h4 className="text-lg font-semibold mb-2">Clinic</h4>
                  <p className="text-sm text-gray-600">
                    Multi-disciplinary practice with a team of providers
                  </p>
                  {membershipType === 'clinic' && (
                    <div className="absolute top-4 right-4 text-kapstone-sage">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setMembershipType('solo')}
                  className={`relative p-6 text-left rounded-lg border-2 transition-colors ${
                    membershipType === 'solo'
                      ? 'border-kapstone-sage bg-kapstone-sage/5'
                      : 'border-gray-200 hover:border-kapstone-sage/50'
                  }`}
                >
                  <div className="flex items-center mb-4">
                    <div className={`p-3 rounded-lg ${
                      membershipType === 'solo' 
                        ? 'bg-kapstone-sage text-white' 
                        : 'bg-kapstone-sage/10 text-kapstone-sage'
                    }`}>
                      <User className="h-6 w-6" />
                    </div>
                  </div>
                  <h4 className="text-lg font-semibold mb-2">Solo Practitioner</h4>
                  <p className="text-sm text-gray-600">
                    Individual provider with both medical and therapy expertise
                  </p>
                  {membershipType === 'solo' && (
                    <div className="absolute top-4 right-4 text-kapstone-sage">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setMembershipType('affiliate')}
                  className={`relative p-6 text-left rounded-lg border-2 transition-colors ${
                    membershipType === 'affiliate'
                      ? 'border-kapstone-sage bg-kapstone-sage/5'
                      : 'border-gray-200 hover:border-kapstone-sage/50'
                  }`}
                >
                  <div className="flex items-center mb-4">
                    <div className={`p-3 rounded-lg ${
                      membershipType === 'affiliate' 
                        ? 'bg-kapstone-sage text-white' 
                        : 'bg-kapstone-sage/10 text-kapstone-sage'
                    }`}>
                      <Users className="h-6 w-6" />
                    </div>
                  </div>
                  <h4 className="text-lg font-semibold mb-2">Affiliate</h4>
                  <p className="text-sm text-gray-600">
                    Access member resources without a directory listing
                  </p>
                  {membershipType === 'affiliate' && (
                    <div className="absolute top-4 right-4 text-kapstone-sage">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                  )}
                </button>
              </div>
            </div>

            {membershipType && (
              <>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    {membershipType === 'clinic' ? 'Clinic Name' : 'Full Name'} *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateFormData('name', e.target.value)}
                    className="w-full p-3 border rounded-md focus:ring-kapstone-sage focus:border-kapstone-sage"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="owners" className="block text-sm font-medium text-gray-700 mb-2">
                    {membershipType === 'clinic' ? 'Clinic Owner(s)' : 'Professional Credentials'} *
                  </label>
                  <textarea
                    id="owners"
                    value={formData.owners}
                    onChange={(e) => updateFormData('owners', e.target.value)}
                    className="w-full p-3 border rounded-md focus:ring-kapstone-sage focus:border-kapstone-sage"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="statement" className="block text-sm font-medium text-gray-700 mb-2">
                    Professional Statement *
                  </label>
                  <textarea
                    id="statement"
                    value={formData.statement}
                    onChange={(e) => updateFormData('statement', e.target.value)}
                    className="w-full p-3 border rounded-md focus:ring-kapstone-sage focus:border-kapstone-sage"
                    rows={6}
                    placeholder="Share your approach to ketamine-assisted psychotherapy..."
                    required
                  />
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    id="location"
                    value={formData.location}
                    onChange={(e) => updateFormData('location', e.target.value)}
                    className="w-full p-3 border rounded-md focus:ring-kapstone-sage focus:border-kapstone-sage"
                    placeholder="City, State, Country"
                    required
                  />
                </div>
              </>
            )}
          </div>
        );

      case 'specialties':
        return (
          <div className="space-y-8">
            {Object.entries(SPECIALTIES).map(([category, items]) => (
              <div key={category}>
                <h3 className="text-lg font-semibold text-kapstone-purple mb-4 capitalize">
                  {category.replace(/([A-Z])/g, ' $1').trim()}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {items.map((specialty) => (
                    <button
                      key={specialty}
                      type="button"
                      onClick={() => toggleArrayItem('specialties', specialty)}
                      className={`px-4 py-2 rounded-full text-sm ${
                        formData.specialties.includes(specialty)
                          ? 'bg-kapstone-sage text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {specialty}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );

      case 'services':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-kapstone-purple mb-4">
                Types of Therapy
              </h3>
              <div className="flex flex-wrap gap-2">
                {THERAPY_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleArrayItem('therapyTypes', type)}
                    className={`px-4 py-2 rounded-full text-sm ${
                      formData.therapyTypes.includes(type)
                        ? 'bg-kapstone-sage text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-kapstone-purple mb-4">
                Populations Served
              </h3>
              <div className="flex flex-wrap gap-2">
                {POPULATIONS.map((population) => (
                  <button
                    key={population}
                    type="button"
                    onClick={() => toggleArrayItem('populations', population)}
                    className={`px-4 py-2 rounded-full text-sm ${
                      formData.populations.includes(population)
                        ? 'bg-kapstone-sage text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {population}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                Website *
              </label>
              <input
                type="url"
                id="website"
                value={formData.website}
                onChange={(e) => updateFormData('website', e.target.value)}
                className="w-full p-3 border rounded-md focus:ring-kapstone-sage focus:border-kapstone-sage"
                placeholder="https://"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Contact Email *
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => updateFormData('email', e.target.value)}
                className="w-full p-3 border rounded-md focus:ring-kapstone-sage focus:border-kapstone-sage"
                required
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => updateFormData('phone', e.target.value)}
                className="w-full p-3 border rounded-md focus:ring-kapstone-sage focus:border-kapstone-sage"
                required
              />
            </div>
          </div>
        );
    }
  };

  const steps: FormStep[] = ['basic', 'specialties', 'services', 'contact'];
  const currentStepIndex = steps.indexOf(currentStep);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session?.user) {
          console.error("No active session found");
          return;
        }
    
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('auth_id', session.user.id)
          .maybeSingle();
    
        if (error) throw error;
    
        setUserDetail(data);
      } catch (error) {
        console.error("Error verifying payment:", error);
      }
    };
    
  
    verifyPayment();
  }, []);
  

// const handlePayment = () =>{
//   if(formData.website.trim() && formData.phone.trim()){
//     if(userDetail?.subscription_id && userDetail?.subscription_status === 'true'){
//       // navigate('/')
//   }else{
//     // navigate('/checkout') 
//     if(userDetail.canceled_at){
//       const currentDate = new Date();
//       const endDate = new Date(data.canceled_at);
//       if (currentDate < endDate) {
//         setShowSubscriptionModal(true);
//       }
//     }
//   }
// }else{
//   alert("please fill all the details first")
// }
// }

const handlePayment = () => {
    if (formData.website.trim() && formData.phone.trim()) {
      if (userDetail?.subscription_id && userDetail?.subscription_status === 'true') {
        navigate('/'); // User already has an active subscription
      } else {
        if (userDetail?.canceled_at) {
          const currentDate = new Date();
          const endDate = new Date(userDetail.canceled_at);
          if (currentDate < endDate) {
            alert("Your session period is not over yet.");
            navigate('/'); 
            return;
          }
        }
        navigate('/checkout'); // Allow navigation to checkout if no active subscription
      }
    } else {
      alert('Please fill all the details first');
    }
  };  

  return (
    <div className="min-h-screen">
      {/* Full-height background section */}
      <div className="relative min-h-screen">
        {/* Background image and overlay */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1497366754035-f200968a6e72"
            alt="Modern clinic interior"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-kapstone-purple/70 mix-blend-multiply" />
        </div>

        {/* Content */}
        <div className="relative pt-24 pb-12">
          {/* Title Section */}
          <div className="text-center text-white mb-12">
            <h1 className="text-4xl font-bold sm:text-5xl">Clinic Application</h1>
            <p className="mt-6 max-w-3xl mx-auto text-xl">
              Join our network of exceptional ketamine-assisted psychotherapy clinics.
            </p>
          </div>

          {/* Form Section */}
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div ref={formRef} className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-8 mb-12">
              {/* Progress Steps */}
              <div className="mb-8">
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <Building2 className={`h-6 w-6 ${currentStep === 'basic' ? 'text-kapstone-sage' : 'text-gray-400'}`} />
                    <span className="ml-2 text-sm font-medium">Basic Info</span>
                  </div>
                  <div className="flex items-center">
                    <Tag className={`h-6 w-6 ${currentStep === 'specialties' ? 'text-kapstone-sage' : 'text-gray-400'}`} />
                    <span className="ml-2 text-sm font-medium">Specialties</span>
                  </div>
                  <div className="flex items-center">
                    <Users className={`h-6 w-6 ${currentStep === 'services' ? 'text-kapstone-sage' : 'text-gray-400'}`} />
                    <span className="ml-2 text-sm font-medium">Services</span>
                  </div>
                  <div className="flex items-center">
                    <MessageSquare className={`h-6 w-6 ${currentStep === 'contact' ? 'text-kapstone-sage' : 'text-gray-400'}`} />
                    <span className="ml-2 text-sm font-medium">Contact</span>
                  </div>
                </div>
                <div className="mt-4 h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-full bg-kapstone-sage rounded-full transition-all duration-300"
                    style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
                  />
                </div>
              </div>

              <form >
                {renderStep()}

                <div className="mt-8 flex justify-between">
                  {currentStepIndex > 0 ? (
                    <button
                      type="button"
                      onClick={() => handleStepChange(steps[currentStepIndex - 1])}
                      className="inline-flex items-center px-4 py-2 border border-kapstone-sage text-kapstone-sage rounded-md hover:bg-kapstone-sage hover:text-white"
                    >
                      <ArrowLeft className="h-5 w-5 mr-2" />
                      Previous
                    </button>
                  ) : (
                    <div />
                  )}

                  {currentStepIndex < steps.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => handleStepChange(steps[currentStepIndex + 1])}
                      className="inline-flex items-center px-4 py-2 bg-kapstone-sage text-white rounded-md hover:bg-kapstone-sage-dark"
                    >
                      Next
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </button>
                  ) : (
                    <button
                    onClick={handlePayment}
                      type="submit"
                      className="inline-flex items-center px-4 py-2 bg-kapstone-sage text-white rounded-md hover:bg-kapstone-sage-dark"
                    >
                      Continue to Payment
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && membershipType && (
        <CheckoutModal
          isOpen={showCheckout}
          onClose={() => setShowCheckout(false)}
          membershipType={membershipType}
          email={formData.email}
          metadata={{
            name: formData.name,
            location: formData.location,
            type: membershipType
          }}
        />
      )}
    </div>
  );
}