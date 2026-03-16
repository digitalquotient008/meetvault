import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/features',
  '/pricing',
  '/about',
  '/contact',
  '/faq',
  '/terms',
  '/privacy',
  '/integrations',
  '/polls',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/book(.*)',
  '/api(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ['/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ico|woff2?|map)).*)', '/(api|trpc)(.*)'],
};
