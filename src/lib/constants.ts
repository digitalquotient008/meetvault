// App URL: where the Spring Boot backend (auth, dashboard, subscribe) is hosted.
// Marketing site is typically at meetvault.app; app is usually at app.meetvault.app or your Railway URL.
const raw = process.env.NEXT_PUBLIC_APP_URL || 'https://app.meetvault.app';
export const APP_URL = raw.replace(/\/$/, '');

export const MVP_FEATURES = [
  {
    title: 'Your Booking Link',
    description:
      'One link per barber or service. Share on Instagram, your site, or in the shop. Clients book 24/7.',
    icon: '🔗',
  },
  {
    title: 'Deposits & No-Show Protection',
    description: 'Collect deposits or full payment upfront. Cancellation fees reduce no-shows and protect your time.',
    icon: '💰',
  },
  {
    title: 'Client History & Notes',
    description: 'See who’s coming in, past visits, and notes in one place. No spreadsheets.',
    icon: '👥',
  },
  {
    title: 'Reminders You Control',
    description: 'Appointment reminders only—no spam or marketing blasts. 24h and 1h before, customizable.',
    icon: '🔔',
  },
  {
    title: 'Availability & Buffers',
    description: 'Set your hours and buffer between appointments. No double-books.',
    icon: '⏰',
  },
  {
    title: 'Reliable Payment Confirmation',
    description: 'Payments confirm before the appointment. No “booked but payment failed” surprises.',
    icon: '✅',
  },
];

/** Four-layer feature structure for salons/barbers (Squire-style): Core → Revenue → Workflow → Automation */
export const FEATURE_LAYERS = [
  {
    id: 'core',
    name: 'Core Layer',
    description: 'Get booked without the back-and-forth.',
    items: [
      'Booking calendar',
      'Time zone detection',
      'Individual booking links',
      'Appointment reminders',
    ],
  },
  {
    id: 'revenue',
    name: 'Revenue Layer',
    description: 'Get paid and protect your time with no-show protection.',
    items: [
      'Service payments',
      'Deposits',
      'Cancellation fees',
    ],
  },
  {
    id: 'workflow',
    name: 'Workflow Layer',
    description: 'Client context in one place.',
    items: [
      'Client history',
      'Notes & preferences',
      'Booking history',
    ],
  },
  {
    id: 'automation',
    name: 'Automation Layer',
    description: 'Fill the book and cut no-shows.',
    items: [
      'Reminder emails',
      'Rescheduling',
      'Waitlists',
    ],
  },
];

export const FUTURE_FEATURES = [
  'Waitlist management',
  'Instagram / website embed',
  'Calendar sync (Google, Outlook)',
  'Tap to Pay (in-shop)',
];

export const VALUE_PROPOSITIONS = [
  {
    title: 'Simplicity',
    description: 'Get started in 2 minutes',
  },
  {
    title: 'Built-in CRM',
    description: 'No need for external tools',
  },
  {
    title: 'Self-hosted',
    description: 'Own your data',
  },
  {
    title: 'Free to Start',
    description: 'No credit card required',
  },
  {
    title: 'Built for the chair',
    description: 'Solo barbers and salons',
  },
];

export const HOW_IT_WORKS = [
  {
    step: 1,
    title: 'Sign Up',
    description: 'Create your account in seconds—no credit card required',
  },
  {
    step: 2,
    title: 'Set Services & Hours',
    description: 'Add your services (e.g. cut, fade, beard), set your hours and buffers',
  },
  {
    step: 3,
    title: 'Share Your Link',
    description: 'Clients book online. You get reminders you control—no spam',
  },
];

