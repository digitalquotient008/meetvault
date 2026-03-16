const raw = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
export const APP_URL = raw.replace(/\/$/, '');

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
