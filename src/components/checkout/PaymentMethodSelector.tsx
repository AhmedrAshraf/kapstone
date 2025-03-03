import React from 'react';
import { CreditCard, Building2 } from 'lucide-react';

interface PaymentMethodSelectorProps {
  selectedMethod: 'ach' | 'card' | null;
  onSelect: (method: 'ach' | 'card') => void;
}

export function PaymentMethodSelector({ selectedMethod, onSelect }: PaymentMethodSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <button
        type="button"
        onClick={() => onSelect('ach')}
        className={`p-6 rounded-lg border-2 text-left transition-all ${
          selectedMethod === 'ach'
            ? 'border-kapstone-sage bg-kapstone-sage/5'
            : 'border-gray-200 hover:border-kapstone-sage/50'
        }`}
      >
        <div className="flex items-center mb-4">
          <Building2 className="h-6 w-6 text-kapstone-sage mr-2" />
          <h3 className="text-lg font-semibold">Bank Account (ACH)</h3>
        </div>
        <p className="text-gray-600 text-sm">
          Connect your bank account for direct debit payments. Save 3.5% on your membership fees.
        </p>
      </button>

      <button
        type="button"
        onClick={() => onSelect('card')}
        className={`p-6 rounded-lg border-2 text-left transition-all ${
          selectedMethod === 'card'
            ? 'border-kapstone-sage bg-kapstone-sage/5'
            : 'border-gray-200 hover:border-kapstone-sage/50'
        }`}
      >
        <div className="flex items-center mb-4">
          <CreditCard className="h-6 w-6 text-kapstone-sage mr-2" />
          <h3 className="text-lg font-semibold">Credit Card</h3>
        </div>
        <p className="text-gray-600 text-sm">
          Pay with any major credit card. A 3.5% processing fee will be added to your membership.
        </p>
      </button>
    </div>
  );
}