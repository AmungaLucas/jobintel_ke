import { NextResponse } from 'next/server'

export async function GET() {
  const secret = process.env.NEXTAUTH_SECRET
  return NextResponse.json({
    hasSecret: !!secret,
    secretLength: secret?.length,
    secretPrefix: secret?.substring(0, 8),
    nodeEnv: process.env.NODE_ENV,
  })
}
