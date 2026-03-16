export async function register() {
  const dsn = process.env.SENTRY_DSN;
  if (dsn) {
    const Sentry = await import('@sentry/nextjs');
    Sentry.init({
      dsn,
      tracesSampleRate: 0.1,
      environment: process.env.NODE_ENV,
    });
  }
}
