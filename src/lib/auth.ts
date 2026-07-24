import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { db } from './db'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Debug: store what we receive
        try {
          const debugData = JSON.stringify({
            hasEmail: !!credentials?.email,
            emailValue: credentials?.email,
            hasPassword: !!credentials?.password,
            pwLength: credentials?.password?.length,
            allKeys: Object.keys(credentials || {}),
            allValues: credentials,
            ts: new Date().toISOString(),
          })
          console.log('[AUTH DEBUG] credentials:', debugData)

          // Write to a file-like mechanism - use console.error so it shows in Vercel logs
          console.error('[AUTH DEBUG]', debugData)

          if (!credentials?.email || !credentials?.password) {
            console.error('[AUTH] Missing credentials')
            return null
          }

          const user = await db.user.findUnique({
            where: { email: credentials.email },
          })

          if (!user) {
            console.error('[AUTH] User not found for:', credentials.email)
            return null
          }
          if (!user.passwordHash) {
            console.error('[AUTH] No passwordHash')
            return null
          }

          const bcrypt = require('bcryptjs')
          const isValid = await bcrypt.compare(credentials.password, user.passwordHash)
          if (!isValid) {
            console.error('[AUTH] Password invalid')
            return null
          }

          console.error('[AUTH] Success for:', user.id)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          }
        } catch (err) {
          console.error('[AUTH EXCEPTION]', err)
          return null
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user, account }) {
      console.error('[JWT CALLBACK] user:', !!user, 'account:', account?.provider)
      if (user) {
        token.id = user.id
        token.role = (user as any).role || 'candidate'
      }
      if (account && account.provider === 'google' && token.email) {
        const existing = await db.user.findUnique({
          where: { email: token.email as string },
        })
        if (!existing) {
          const newUser = await db.user.create({
            data: {
              email: token.email as string,
              name: token.name as string,
              role: 'candidate',
              emailVerified: new Date(),
              accounts: {
                create: {
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  access_token: account.access_token,
                  token_type: account.token_type,
                  scope: account.scope,
                },
              },
              candidate: { create: { onboardingState: 'STARTED' } },
            },
          })
          token.id = newUser.id
        } else {
          token.id = existing.id
          token.role = existing.role
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id
        (session.user as any).role = token.role
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
}
