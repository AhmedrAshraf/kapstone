import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import axios from "axios"
import { supabase } from '../lib/supabase';

type PlanType = 'weekly' | 'monthly' | 'yearly';

interface PlanOption {
  stripePriceId: any;
  type: PlanType;
  price: number;
  originalPrice?: number;
  period: string;
  features: string[];
  popular?: boolean;
  savings?: string;
}

const PaymentPlan: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('monthly');
  const [user, setUser] = useState(null)

  const plans: PlanOption[] = [
    {
      type: 'weekly',
      price: 9.99,
      stripePriceId: 'price_1QygJjAPOlDLh3vrmXTqKjxv', 
      period: 'week',
      features: ['Basic access', 'Up to 5 projects', 'Community support', '1GB storage'],
    },
    {
      type: 'monthly',
      price: 29.99,
      stripePriceId: 'price_1QygKbAPOlDLh3vrqKTWsnYA',
      period: 'month',
      features: ['Full access', 'Unlimited projects', 'Priority support', '15GB storage'],
    },
    {
      type: 'yearly',
      price: 249.99,
      stripePriceId: 'price_1QygNbAPOlDLh3vrWvnmH3vv',
      period: 'year',
      features: ['Everything in Monthly', 'Dedicated support', 'Unlimited storage'],
    }
  ];
  
  useEffect(() => {
    const fetchUser = async () => {
      const { data:{ session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error fetching user:", error);
      } else {
        if(session){
        setUser(session.user)
        }
      }
    };
    fetchUser();
  }, [])

  const handleSelectPlan = async (plan: PlanOption) => {
    setSelectedPlan(plan.type);
    if (!user) {
      alert("No user found! Please log in first.");
      return;
    }

    try {
      // const response = await axios.post('http://localhost:8000/api/create-checkout-session', {
        const response = await axios.post('https://kapstone-sandy.vercel.app/api/create-checkout-session', {
        priceId: plan.stripePriceId,
        userId: user.id        
      });

      if (response.data.url) {
        localStorage.setItem('selectedPlan', plan.type); // Store selected plan
        window.location.href = response.data.url; 
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8 my-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Choose Your Plan
        </h2>
        <p className="mt-4 text-xl text-gray-600">
          Select the perfect plan for your needs
        </p>
      </div>

      <div className="flex justify-center mb-8">
        <div className="inline-flex rounded-md shadow-sm bg-gray-100 p-1">
          {plans.map((plan) => (
            <button
              key={plan.type}
              onClick={() => {setSelectedPlan(plan.type)}}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                selectedPlan === plan.type
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              {plan.type.charAt(0).toUpperCase() + plan.type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
        {plans.map((plan) => (
          <div
            key={plan.type}
            className={`rounded-lg shadow-lg overflow-hidden transition-all duration-300 transform ${
              selectedPlan === plan.type
                ? 'ring-2 ring-blue-500 scale-105'
                : 'hover:scale-[1.02]'
            } ${plan.popular ? 'bg-white' : 'bg-white'}`}
          >
            {plan.popular && (
              <div className="bg-blue-500 text-white text-center py-1 text-sm font-medium">
                Most Popular
              </div>
            )}
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {plan.type.charAt(0).toUpperCase() + plan.type.slice(1)} Plan
              </h3>
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-extrabold text-gray-900">${plan.price}</span>
                <span className="ml-1 text-xl font-semibold text-gray-500">/{plan.period}</span>
              </div>
              {plan.originalPrice && (
                <div className="mt-1 flex items-center">
                  <span className="text-sm text-gray-500 line-through">
                    ${plan.originalPrice}/{plan.period}
                  </span>
                  {plan.savings && (
                    <span className="ml-2 text-sm font-medium text-green-600">
                      {plan.savings}
                    </span>
                  )}
                </div>
              )}
              <ul className="mt-6 space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <div className="flex-shrink-0">
                      <Check className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="ml-3 text-sm text-gray-700">{feature}</p>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <button
                  onClick={() => handleSelectPlan(plan)}
                  className={`w-full rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                    selectedPlan === plan.type
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {selectedPlan === plan.type ? 'Current Plan' : 'Select Plan'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentPlan;