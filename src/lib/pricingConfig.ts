export interface PlanConfig {
  id: string;
  name: string;
  price: number;
  currency: string;
  currencySymbol: string;
  interval: 'month' | 'year';
}

export interface PricingConfig {
  currency: string;
  currencySymbol: string;
  plans: {
    monthly: PlanConfig;
    yearly: PlanConfig;
  };
  features: string[];
}

export const pricingConfig: PricingConfig = {
  currency: 'INR',
  currencySymbol: '₹',
  plans: {
    monthly: {
      id: 'plan_monthly',
      name: 'Deven Premium - Monthly',
      price: 299,
      currency: 'INR',
      currencySymbol: '₹',
      interval: 'month',
    },
    yearly: {
      id: 'plan_yearly',
      name: 'Deven Premium - Yearly',
      price: 2999, // Reserved for future annual plan
      currency: 'INR',
      currencySymbol: '₹',
      interval: 'year',
    },
  },
  features: [
    'Unlimited Articles & Archive access',
    'AI Executive Briefings',
    'Audio Articles (TTS narrated voice)',
    'Weekly Premium Founder Reports',
    'Priority Support & Early Access',
  ],
};
