import React from 'react';
import { Link } from 'react-router-dom';
import { XCircle, ArrowLeft, HelpCircle } from 'lucide-react';

export function CheckoutCancel() {
  return (
    <div className="min-h-screen pt-32 pb-12 flex flex-col bg-gray-50">
      <div className="flex-grow flex flex-col justify-center max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white px-6 py-8 md:px-12 md:py-16 shadow-xl">
          <div className="text-center">
            <XCircle className="mx-auto h-16 w-16 text-red-500" />
            <h1 className="mt-6 text-3xl font-bold text-gray-900">
              Checkout Cancelled
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Your membership signup was not completed. If you experienced any issues or have questions,
              please don't hesitate to contact us.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/clinic-directory/new"
                className="inline-flex items-center px-6 py-3 bg-kapstone-sage text-white rounded-md hover:bg-kapstone-sage-dark"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Return to Application
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center px-6 py-3 border border-kapstone-sage text-kapstone-sage rounded-md hover:bg-kapstone-sage hover:text-white"
              >
                <HelpCircle className="mr-2 h-5 w-5" />
                Need Help?
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}