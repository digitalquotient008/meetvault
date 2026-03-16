export interface FAQItem {
  question: string;
  answer: string;
  link?: string;
  linkLabel?: string;
  keywords?: string[];
}

export const FAQ_ITEMS: FAQItem[] = [
  {
    question: 'What is MeetingVault?',
    answer:
      'MeetingVault is booking and payments software for independent barbers. Clients book online, pay deposits to reduce no-shows, and you get appointment reminders — no spam. Includes client history, walk-in queue, and growth tools.',
    link: '/features',
    linkLabel: 'See all features',
    keywords: ['what', 'meetingvault', 'barber', 'booking', 'scheduling'],
  },
  {
    question: 'How do clients book an appointment?',
    answer:
      'You share your booking link (e.g. meetingvault.app/book/your-shop). Clients pick a service, choose a barber, select a time, and confirm. They get a confirmation email automatically.',
    keywords: ['book', 'booking', 'schedule', 'appointment', 'how', 'client'],
  },
  {
    question: 'How do I get started?',
    answer:
      'Sign up with your email — no credit card required. You get a 14-day free trial with full access. Create your shop, pick from common services (or add your own), set your hours, and share your booking link. Takes about 5 minutes.',
    link: '/sign-up',
    linkLabel: 'Start 14-day free trial',
    keywords: ['start', 'get started', 'sign up', 'setup'],
  },
  {
    question: 'How much does it cost?',
    answer:
      'One plan: $25/month. Everything included — online booking, deposits, no-show protection, client CRM, walk-in queue, waitlist, reminders, growth tools, reports, and custom branding. 14-day free trial, no credit card required.',
    link: '/pricing',
    linkLabel: 'View pricing',
    keywords: ['pricing', 'price', 'cost', 'plan', 'free', 'paid', 'how much'],
  },
  {
    question: 'How do payments and deposits work?',
    answer:
      'Deposits and payments are processed through Stripe. Money goes directly to your Stripe account — we never hold your funds. You can require deposits at booking to protect against no-shows.',
    keywords: ['payment', 'deposit', 'stripe', 'money', 'pay'],
  },
  {
    question: 'Can I use my own branding?',
    answer:
      'Yes. Your booking page uses your shop name, logo, colors, and custom URL slug. Clients see your brand, not ours.',
    link: '/features',
    linkLabel: 'See features',
    keywords: ['brand', 'branding', 'logo', 'custom', 'white label'],
  },
  {
    question: 'How do I contact support?',
    answer:
      'Reach out via the contact page. We typically respond within one business day.',
    link: '/contact',
    linkLabel: 'Contact us',
    keywords: ['contact', 'support', 'help', 'email'],
  },
];

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
