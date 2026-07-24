import { withAuth } from 'next-auth/middleware'

export default withAuth({
  callbacks: {
    authorized({ req, token }) {
      const { pathname } = req.nextUrl

      // Public routes
      if (pathname === '/' || pathname.startsWith('/auth/')) {
        // If user is authenticated, redirect to dashboard
        if (token && pathname.startsWith('/auth/')) {
          return false // This will trigger redirect in the pages
        }
        return true
      }

      // Protected routes
      if (pathname.startsWith('/onboarding') || pathname.startsWith('/dashboard') || pathname.startsWith('/api/candidates')) {
        return !!token
      }

      return true
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
})

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|logo.svg|robots.txt).*)',
  ],
}