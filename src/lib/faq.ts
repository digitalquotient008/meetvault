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
    question: 'What is MeetingVault?',
    answer:
      'MeetingVault is booking and payments software for salons and barbers. Clients book online, pay deposits to reduce no-shows, and you get appointment reminders you control—no spam. Includes client history and notes. Built for solo barbers and salons.',
    link: '/',
    linkLabel: 'Learn more',
    keywords: ['what', 'meetingvault', 'salon', 'barber', 'booking', 'scheduling'],
  },
  {
    question: 'How do I book an appointment?',
    answer:
      'Visit the barber or salon\'s booking page (they share a link), choose a service, pick a date and time, and confirm. You\'ll get a confirmation email. Pay online or in-person depending on how they set it up.',
    keywords: ['book', 'booking', 'schedule', 'appointment', 'how'],
  },
  {
    question: 'How do I get started as a barber or salon?',
    answer:
      'Sign up with your email and password—no credit card required. Create your services, set your availability, and share your booking link. Start taking bookings in minutes.',
    link: '/',
    linkLabel: 'Sign up for free',
    keywords: ['start', 'get started', 'host', 'sign up'],
  },
  {
    question: 'What makes MeetingVault different?',
    answer:
      'We focus on: payments confirm before the appointment (no “booked but payment failed”), and reminders are appointment-only—no spam or marketing blasts you can’t turn off. Booking, deposits, no-show protection, and client history. Built for solo barbers and salons, with optional self-hosting.',
    keywords: ['different', 'vs', 'compare', 'why'],
  },
  {
    question: 'Pricing',
    answer:
      'MeetingVault is free to start with no credit card required. We offer simple, transparent pricing for solo barbers and salons. Check our pricing page for current plans.',
    link: '/pricing',
    linkLabel: 'View pricing',
    keywords: ['pricing', 'price', 'cost', 'plan', 'free', 'paid'],
  },
  {
    question: 'Book a demo',
    answer:
      'Want to see MeetingVault in action or discuss a Teams or custom plan? Get in touch and we\'ll schedule a demo.',
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
