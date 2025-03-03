// Temporarily disabled Stripe integration
export type MembershipType = 'clinic' | 'solo' | 'affiliate';
export type BillingInterval = 'monthly' | 'annual';
export type PaymentMethod = 'ach' | 'card';

export const createCheckoutSession = async () => {
  throw new Error('Payment integration is temporarily disabled');
};