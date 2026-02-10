export const PRICING_PLANS = {
  starter: {
    name: 'Starter Pack',
    price: 20,
    credits: 4,
    pricePerSong: 5,
    stripePriceId: process.env.STRIPE_PRICE_ID_STARTER!,
  },
  pro: {
    name: 'Pro Pack',
    price: 80,
    credits: 20,
    pricePerSong: 4,
    stripePriceId: process.env.STRIPE_PRICE_ID_PRO!,
    popular: true,
  },
  corporate: {
    name: 'Corporate Pack',
    price: 175,
    credits: 50,
    pricePerSong: 3.5,
    stripePriceId: process.env.STRIPE_PRICE_ID_CORPORATE!,
  },
} as const

export type PricingPlan = keyof typeof PRICING_PLANS

// Enterprise is handled separately via contact form
export const ENTERPRISE_INFO = {
  name: 'Enterprise',
  description: 'Custom bulk licensing',
  contactEmail: 'sales@songteam.com', // Update with your actual email
  features: [
    '100+ song credits',
    'Volume discounts ($2.50-3 per song)',
    'Priority support',
    'Dedicated account manager',
    'Custom integrations',
    'Annual contracts available',
  ],
}
