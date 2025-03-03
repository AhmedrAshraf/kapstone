import React, { useState } from 'react';
import { X } from 'lucide-react';
import { PaymentMethodSelector } from './PaymentMethodSelector';
import { BillingIntervalSelector } from './BillingIntervalSelector';
import { createCheckoutSession, MembershipType } from '../../lib/stripe';

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

  if (!isOpen) return null;

  const handleCheckout = async () => {
    if (!paymentMethod || !billingInterval) {
      setError('Payment integration is temporarily disabled');
      return;
    }

    setError('Payment integration is temporarily disabled. Please check back later.');
    return;
  };

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
              <BillingIntervalSelector
                selectedInterval={billingInterval}
                onSelect={setBillingInterval}
                membershipType={membershipType}
                paymentMethod={paymentMethod}
              />
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleCheckout}
              disabled={!paymentMethod || !billingInterval || loading}
              className="inline-flex items-center px-6 py-3 bg-kapstone-sage text-white rounded-md hover:bg-kapstone-sage-dark disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Processing...
                </>
              ) : (
                'Proceed to Checkout'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}