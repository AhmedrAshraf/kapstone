import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import { useScrollToTop } from '../hooks/useScrollToTop';

export function Privacy() {
  // Add scroll to top functionality
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
            <Shield className="h-8 w-8 text-kapstone-sage mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-kapstone-purple">Privacy Policy</h1>
              <p className="text-gray-600 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <div className="prose prose-lg max-w-none space-y-8">
            {/* Introduction */}
            <section className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-2xl font-bold text-kapstone-purple mb-4">1. Introduction</h2>
              <p>
                KAPstone Clinics ("we," "our," or "us"), located at 94 King St, Northampton, MA 01060, United States, is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
              </p>
            </section>

            {/* Information Collection */}
            <section className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-2xl font-bold text-kapstone-purple mb-4">2. Information We Collect</h2>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3">2.1 Personal Information</h3>
                <p className="mb-3">We may collect personal information that you voluntarily provide, including but not limited to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Name, email address, and phone number</li>
                  <li>Medical history and treatment information</li>
                  <li>Insurance information</li>
                  <li>Professional credentials (for healthcare providers)</li>
                  <li>Communications between you and KAPstone Clinics</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">2.2 Automatically Collected Information</h3>
                <p className="mb-3">When you visit our website, we automatically collect certain information, including:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>IP addresses</li>
                  <li>Browser type and version</li>
                  <li>Operating system</li>
                  <li>Referring website addresses</li>
                  <li>Access times and dates</li>
                  <li>Pages viewed</li>
                </ul>
              </div>
            </section>

            {/* Rest of the sections with similar formatting... */}

            {/* Contact Information */}
            <section className="bg-kapstone-purple/5 p-6 rounded-lg">
              <h2 className="text-2xl font-bold text-kapstone-purple mb-4">10. Contact Information</h2>
              <p className="mb-4">
                If you have questions about this Privacy Policy, please contact us at:
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