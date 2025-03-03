import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Scale } from 'lucide-react';
import { useScrollToTop } from '../hooks/useScrollToTop';

export function Terms() {
  // Add smooth scroll to top
  useScrollToTop();

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          to="/"
          className="inline-flex items-center text-kapstone-sage hover:text-kapstone-sage-dark mb-8"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Home
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center mb-8 pb-6 border-b border-gray-200">
            <Scale className="h-8 w-8 text-kapstone-sage mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-kapstone-purple">Terms of Service</h1>
              <p className="text-gray-600 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <div className="prose prose-lg max-w-none space-y-8">
            {/* Agreement to Terms */}
            <section className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-2xl font-bold text-kapstone-purple mb-4">1. Agreement to Terms</h2>
              <p>
                By accessing or using KAPstone Clinics' website and services, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing our services.
              </p>
            </section>

            {/* Healthcare Services */}
            <section className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-2xl font-bold text-kapstone-purple mb-4">2. Healthcare Services</h2>
              <p className="mb-4">
                KAPstone Clinics provides ketamine-assisted psychotherapy and related mental health services. Our services are subject to the following conditions:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>All treatment is provided by licensed healthcare professionals</li>
                <li>Treatment requires proper medical evaluation and screening</li>
                <li>Services are available only to eligible patients who meet our criteria</li>
                <li>Emergency services are not provided - call 911 for emergencies</li>
                <li>Treatment success is not guaranteed</li>
              </ul>
            </section>

            {/* Rest of the sections with similar formatting... */}

            {/* Contact Information */}
            <section className="bg-kapstone-purple/5 p-6 rounded-lg">
              <h2 className="text-2xl font-bold text-kapstone-purple mb-4">13. Contact Information</h2>
              <p className="mb-4">
                Questions about the Terms of Service should be sent to us at:
              </p>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="space-y-1">
                  <strong>KAPstone Clinics</strong><br />
                  94 King St<br />
                  Northampton, MA 01060<br />
                  United States<br />
                  Phone: (413) 567-1110<br />
                  Email: kapstoneclinics@gmail.com
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}