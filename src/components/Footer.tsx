import React from 'react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-white border-t">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1">
            <img
              className="h-[150px] w-auto"
              src="/logo.svg"
              alt="KAPstone Clinics"
            />
            <p className="mt-4 text-gray-600">
              Empowering minds. Embracing excellence.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
              For Patients
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/for-patients" className="text-gray-600 hover:text-kapstone-sage">
                  Patient Information
                </Link>
              </li>
              <li>
                <Link to="/clinic-directory" className="text-gray-600 hover:text-kapstone-sage">
                  Find a Clinic
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
              For Professionals
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/for-professionals" className="text-gray-600 hover:text-kapstone-sage">
                  Join Network
                </Link>
              </li>
              <li>
                <Link to="/team" className="text-gray-600 hover:text-kapstone-sage">
                  Our Team
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
              Contact & Legal
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/contact" className="text-gray-600 hover:text-kapstone-sage">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-600 hover:text-kapstone-sage">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-600 hover:text-kapstone-sage">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-8">
          <p className="text-center text-gray-400">
            © {new Date().getFullYear()} KAPstone Clinics. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}