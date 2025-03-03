import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (!sessionId) {
      setError('No session ID found');
      setLoading(false);
      return;
    }

    const verifySession = async () => {
      try {
        const { data, error: verifyError } = await supabase.functions.invoke(
          'verify-checkout-session',
          {
            body: { sessionId }
          }
        );

        if (verifyError) throw verifyError;
        setSubscription(data.subscription);
      } catch (err) {
        console.error('Error verifying session:', err);
        setError('Failed to verify checkout session');
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-12 flex flex-col bg-gray-50">
        <div className="flex-grow flex flex-col justify-center max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex-shrink-0 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-kapstone-sage border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-32 pb-12 flex flex-col bg-gray-50">
        <div className="flex-grow flex flex-col justify-center max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg bg-white px-6 py-8 md:px-12 md:py-16 shadow-xl">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-red-600 mb-4">
                Verification Failed
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                {error}
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center text-kapstone-sage hover:text-kapstone-sage-dark"
              >
                Contact Support
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-12 flex flex-col bg-gray-50">
      <div className="flex-grow flex flex-col justify-center max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white px-6 py-8 md:px-12 md:py-16 shadow-xl">
          <div className="text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-kapstone-sage" />
            <h1 className="mt-6 text-3xl font-bold text-kapstone-purple">
              Welcome to KAPstone Clinics!
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Your membership has been successfully activated. Thank you for joining our community!
            </p>
            <div className="mt-8 space-y-4">
              <Link
                to="/member-hub"
                className="inline-flex items-center px-6 py-3 bg-kapstone-sage text-white rounded-md hover:bg-kapstone-sage-dark"
              >
                Go to Member Hub
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}