import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import { db } from './db'

export const authOptions: NextAuthOptions = {
  trustHost: true,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log('[AUTH] Missing credentials')
            return null
          }

          console.log('[AUTH] Looking up user:', credentials.email)
          const user = await db.user.findUnique({
            where: { email: credentials.email },
          })

          if (!user) {
            console.log('[AUTH] User not found')
            return null
          }
          if (!user.passwordHash) {
            console.log('[AUTH] No passwordHash for user')
            return null
          }

          console.log('[AUTH] Comparing password...')
          const isValid = await bcrypt.compare(credentials.password, user.passwordHash)
          if (!isValid) {
            console.log('[AUTH] Password mismatch')
            return null
          }

          console.log('[AUTH] Login success:', user.id)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          }
        } catch (error) {
          console.error('[AUTH] Authorize error:', error)
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
              candidate: {
                create: { onboardingState: 'STARTED' },
              },
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
