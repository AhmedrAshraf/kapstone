import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { PaymentMethodSelector } from './PaymentMethodSelector';
import { BillingIntervalSelector } from './BillingIntervalSelector';
import { createCheckoutSession, MembershipType } from '../../lib/stripe';
import { supabase } from "../../lib/supabase";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
const stripePromise = loadStripe("pk_test_51I5T0LAPOlDLh3vr5aVKL58bqsaOY9MazuXznHd9HTWlvK68QdvgVXhsFdnBmNwkWrArzHmcWLG73QElvf4awpuv00SPm5vPto");

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  membershipType: MembershipType;
  email: string;
  metadata?: Record<string, string>;
}

export function CheckoutModal({ 
  isOpen, 
  onClose, 
  membershipType,
  email,
  metadata = {}
}: CheckoutModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'ach' | 'card' | null>(null);
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState(null)

  if (!isOpen) return null;

  // const handleCheckout = async () => {
  //   if (!paymentMethod || !billingInterval) {
  //     setError('Payment integration is temporarily disabled');
  //     return;
  //   }

  //   setError('Payment integration is temporarily disabled. Please check back later.');
  //   return;
  // };

  
useEffect(() => {
    const fetchUser = async () => {
      const {data: { session },error }: any = await supabase.auth.getSession();
      if (error) {
        console.error("Error fetching user:", error);
      } else {
        if (session) {
          setUser(session.user);
        }
      }
    };
    fetchUser();
  }, []);  

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-kapstone-purple">
              Choose Your Payment Plan
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-700">
              1. Select Payment Method
            </h3>
            <PaymentMethodSelector
              selectedMethod={paymentMethod}
              onSelect={setPaymentMethod}
            />
          </div>

          {paymentMethod && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700">
                2. Choose Billing Interval
              </h3>
              <Elements stripe={stripePromise}>
              <BillingIntervalSelector
                user={user}
                selectedInterval={billingInterval}
                onSelect={setBillingInterval}
                membershipType={membershipType}
                paymentMethod={paymentMethod}
              />
              </Elements>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200">
          <div className="flex justify-end">
          </div>
        </div>
      </div>
    </div>
  );
}