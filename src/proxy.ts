import { withAuth } from 'next-auth/middleware';

const authMiddleware = withAuth({
  pages: {
    signIn: '/login',
  },
});

// Next.js v16 Proxy convention
export function proxy(req: any, event: any) {
  return authMiddleware(req, event);
}

export const config = {
  matcher: [
    '/profile/:path*',
    '/admin/:path*',
  ],
};
