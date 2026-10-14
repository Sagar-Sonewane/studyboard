/**
 * Marketing Landing Page Configuration
 * Single source of truth for pricing plans, limits, and feedback links.
 */

export interface PlanFeature {
  text: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  cadence: string;
  badge?: string;
  headline: string;
  description: string;
  buttonText: string;
  buttonActive: boolean; // false = 'Coming soon' (aria-disabled)
  features: string[];
}

/**
 * PLAN_LIMITS configuration.
 * Change numbers in one place when final production tiers are decided.
 */
export const PLAN_LIMITS: Record<'free' | 'dayPass' | 'monthly', PricingPlan> = {
  free: {
    id: 'free',
    name: 'Free Tier',
    price: '$0',
    cadence: '/ forever',
    headline: 'Free for small groups',
    description: 'For spontaneous study sessions, quick brainstorms, and pair planning.',
    buttonText: 'Start free',
    buttonActive: true,
    features: [
      'Up to 5 participants per room', // Free tier cap per PRODUCT.md
      '10MB file & document uploads',  // Free tier cap per PRODUCT.md
      'Infinite shared whiteboard with live voice',
      'Fork private local copies of any board',
    ],
  },
  dayPass: {
    id: 'day-pass',
    name: 'Day Pass',
    price: '$3',
    cadence: '/ one-time 24h',
    badge: '★ 24-hour pass',
    headline: 'Day pass for workshops',
    description: 'For all-day workshops, hackathons, and client project sprints.',
    buttonText: 'Coming soon',
    buttonActive: false, // Billing paused until Stripe integration (Phases 7/8)
    features: [
      'More participants (expanded room size)', // TODO: define exact count before billing launch (PRODUCT.md)
      'Larger file uploads (expanded size cap)', // TODO: define exact size before billing launch (PRODUCT.md)
      '24-hour uninterrupted host pass',
      'Guests still join free without accounts',
    ],
  },
  monthly: {
    id: 'monthly',
    name: 'Monthly Pro',
    price: '$9',
    cadence: '/ month',
    headline: 'Standing rooms for teams',
    description: 'For remote teams, recurring cohorts, and standing project rooms.',
    buttonText: 'Coming soon',
    buttonActive: false, // Billing paused until Stripe integration (Phases 7/8)
    features: [
      'Unlimited persistent rooms',
      'More participants & larger file uploads', // TODO: define exact limits before billing launch
      'Cancel or pause anytime with one click',
      'All Day Pass benefits included',
    ],
  },
};

/**
 * Configurable link for "Send feedback".
 * Update this mailto or feedback form URL as needed.
 */
export const FEEDBACK_URL = 'mailto:hello@studysync.app?subject=StudySync%20Feedback';
