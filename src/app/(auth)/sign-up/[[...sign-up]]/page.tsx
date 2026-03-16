import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <SignUp
      appearance={{
        elements: {
          rootBox: 'w-full',
          card: 'bg-slate-900 border border-slate-700 shadow-xl',
        },
        variables: {
          colorPrimary: '#d97706',
          colorBackground: '#0f172a',
          colorText: '#e2e8f0',
          colorInputBackground: '#1e293b',
          colorInputText: '#f8fafc',
        },
      }}
    />
  );
}
