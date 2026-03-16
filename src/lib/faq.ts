/**
 * FAQ data for the chat/FAQ widget and FAQ page (no LLM).
 */

export interface FAQItem {
  question: string;
  answer: string;
  /** Optional CTA link (e.g. /pricing, /contact) */
  link?: string;
  linkLabel?: string;
  /** Keywords for simple client-side matching (e.g. ["pricing", "price", "cost"]) */
  keywords?: string[];
}

export const FAQ_ITEMS: FAQItem[] = [
  {
    question: 'What is MeetVault?',
    answer:
      'MeetVault is a client consultation platform for lawyers. Book consultations, collect payments and deposits, run intake and document uploads, and keep client history and notes in one place. It includes built-in CRM and works for solo and small-firm practice.',
    link: '/',
    linkLabel: 'Learn more',
    keywords: ['what', 'meetvault', 'scheduling', 'platform', 'lawyers', 'legal'],
  },
  {
    question: 'How do I book a meeting?',
    answer:
      'Visit the host\'s booking page (they share a link with you), choose an event type, pick a date and time, and confirm. You\'ll get a confirmation email with the details.',
    keywords: ['book', 'booking', 'schedule', 'meeting', 'how'],
  },
  {
    question: 'How do I get started as a host?',
    answer:
      'Sign up with your email and password—no credit card required. Then create your event types, set your weekly availability, and share your booking link. You can start receiving bookings in minutes.',
    link: '/',
    linkLabel: 'Sign up for free',
    keywords: ['start', 'get started', 'host', 'sign up'],
  },
  {
    question: 'Pricing',
    answer:
      'MeetVault is free to start with no credit card required. We offer simple, transparent pricing for individuals and teams. Check our pricing page for current plans.',
    link: '/pricing',
    linkLabel: 'View pricing',
    keywords: ['pricing', 'price', 'cost', 'plan', 'free', 'paid'],
  },
  {
    question: 'Book a demo',
    answer:
      'Want to see MeetVault in action or discuss a Teams or custom plan? Get in touch and we\'ll schedule a demo.',
    link: '/contact',
    linkLabel: 'Schedule a demo',
    keywords: ['demo', 'contact', 'sales', 'team', 'enterprise'],
  },
  {
    question: 'Contact / Support',
    answer:
      'For questions, Teams plans, or custom solutions, reach out via our contact page. We typically respond within one business day.',
    link: '/contact',
    linkLabel: 'Contact us',
    keywords: ['contact', 'support', 'help', 'email'],
  },
];

/**
 * Simple keyword match: find FAQ items whose question or keywords contain the query (case-insensitive).
 */
export function matchFAQ(query: string): FAQItem | null {
  if (!query || !query.trim()) return null;
  const q = query.trim().toLowerCase();
  for (const item of FAQ_ITEMS) {
    if (item.question.toLowerCase().includes(q)) return item;
    if (item.keywords?.some((k) => k.toLowerCase().includes(q) || q.includes(k.toLowerCase())))
      return item;
  }
  return null;
}
