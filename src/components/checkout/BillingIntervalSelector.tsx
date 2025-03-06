import React from 'react';
import { Calendar, CalendarDays, LogIn } from 'lucide-react';
import axios from "axios"

interface BillingIntervalSelectorProps {
  selectedInterval: 'monthly' | 'annual' | null;
  onSelect: (interval: 'monthly' | 'annual') => void;
  membershipType: 'clinic' | 'solo' | 'affiliate';
  paymentMethod: 'ach' | 'card';
}

const PRICES = {
  clinic: {
    monthly: { 
      base: 100, 
      card: 103.50,
      stripePriceId: 'price_1QygJjAPOlDLh3vrmXTqKjxv'
    },
    annual: { 
      base: 1000, 
      card: 1035,
      stripePriceId: 'price_1QygKbAPOlDLh3vrqKTWsnYA' 
    }
  },
  solo: {
    monthly: { 
      base: 100, 
      card: 103.50,
      stripePriceId: 'price_1QygNbAPOlDLh3vrWvnmH3vv' 
    },
    annual: { 
      base: 1000, 
      card: 1035,
      stripePriceId: 'price_1QygJjAPOlDLh3vrmXTqKjxv' 
    }
  },
  affiliate: {
    monthly: { 
      base: 30, 
      card: 31.05,
      stripePriceId: 'price_1QygNbAPOlDLh3vrWvnmH3vv' 
    },
    annual: { 
      base: 300, 
      card: 310.50,
      stripePriceId: 'price_1QygJjAPOlDLh3vrmXTqKjxv' 
    }
  }
};


export function BillingIntervalSelector({ 
  selectedInterval, 
  onSelect, 
  membershipType,
  paymentMethod ,
  user,
}: BillingIntervalSelectorProps) {

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const prices = PRICES[membershipType];
  const plan = PRICES[membershipType][selectedInterval];
  const monthlyPrice = paymentMethod === 'card' ? prices.monthly.card : prices.monthly.base;
  const annualPrice = paymentMethod === 'card' ? prices.annual.card : prices.annual.base;
  const annualSavings = (monthlyPrice * 12 - annualPrice).toFixed(2);

  const handleSelectPlan = async () => {
    if (!user) {
      alert('No user found! Please log in first.');
      return;
    }

  if(paymentMethod==="card"){
    try {
      const response = await axios.post( 'https://kapstone-sandy.vercel.app/api/create-checkout-session', {priceId: plan?.stripePriceId, userId: user?.id});
        // const response = await axios.post('http://localhost:8000/api/create-checkout-session', {priceId: plan?.stripePriceId, userId: user?.id})
      if (response.data.url) {
        localStorage.setItem('selectedPlan', plan?.type);
        window.location.href = response?.data?.url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
    }
    }else if (paymentMethod === "ach") {
      try {
        console.log(plan?.stripePriceId);
        console.log(user?.id);
        
      const response = await axios.post('https://kapstone-sandy.vercel.app/api/create-ach-checkout-session', {priceId: plan?.stripePriceId,userId: user?.id});
        if (response.data.url) {
          localStorage.setItem('selectedPlan', selectedInterval || '');
          window.location.href = response.data.url;
        }
      } catch (error) {
        console.error("Error while posting api:", error);
      }
  } else {
    console.log("Invalid payment method selected.");
  }
  };

  return (
    <div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <button
        type="button"
        onClick={() => onSelect('monthly')}
        className={`p-6 rounded-lg border-2 text-left transition-all ${
          selectedInterval === 'monthly'
            ? 'border-kapstone-sage bg-kapstone-sage/5'
            : 'border-gray-200 hover:border-kapstone-sage/50'
        }`}
      >
        <div className="flex items-center mb-4">
          <Calendar className="h-6 w-6 text-kapstone-sage mr-2" />
          <h3 className="text-lg font-semibold">Monthly</h3>
        </div>
        <div className="space-y-2">
          <p className="text-2xl font-bold text-kapstone-purple">
            {formatPrice(monthlyPrice)}<span className="text-sm font-normal text-gray-600">/month</span>
          </p>
          <p className="text-gray-600 text-sm">
            Flexible monthly billing with no long-term commitment
          </p>
        </div>
      </button>

      <button
        type="button"
        onClick={() => onSelect('annual')}
        className={`p-6 rounded-lg border-2 text-left transition-all ${
          selectedInterval === 'annual'
            ? 'border-kapstone-sage bg-kapstone-sage/5'
            : 'border-gray-200 hover:border-kapstone-sage/50'
        }`}
      >
        <div className="flex items-center mb-4">
          <CalendarDays className="h-6 w-6 text-kapstone-sage mr-2" />
          <h3 className="text-lg font-semibold">Annual</h3>
        </div>
        <div className="space-y-2">
          <p className="text-2xl font-bold text-kapstone-purple">
            {formatPrice(annualPrice)}<span className="text-sm font-normal text-gray-600">/year</span>
          </p>
          <p className="text-gray-600 text-sm">
            Save ${annualSavings} per year with annual billing
          </p>
        </div>
      </button>
      </div>

      <div className="flex justify-end mt-10">
        <button
          onClick={handleSelectPlan}
          className="inline-flex text-center justify-self-center items-center px-6 py-3 bg-kapstone-sage text-white rounded-md hover:bg-kapstone-sage-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >Proceed to Checkout
        </button>
      </div>

    </div>
  );
}