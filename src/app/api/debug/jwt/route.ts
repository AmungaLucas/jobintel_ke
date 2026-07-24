import { NextRequest, NextResponse } from 'next/server'
import { jwtDecrypt } from 'jose'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    const cookie = req.cookies.get('__Secure-next-auth.session-token')
      || req.cookies.get('next-auth.session-token')
    
    if (!cookie) return NextResponse.json({ error: 'No session cookie' })
    
    const secret = process.env.NEXTAUTH_SECRET
    if (!secret) return NextResponse.json({ error: 'No NEXTAUTH_SECRET' })
    
    const secretKey = new TextEncoder().encode(secret)
    
    const { payload } = await jwtDecrypt(cookie.value, secretKey)
    
    return NextResponse.json({
      success: true,
      payloadKeys: Object.keys(payload),
      payload: {
        sub: payload.sub,
        email: payload.email,
        name: payload.name,
        role: payload.role,
        iat: payload.iat,
        exp: payload.exp,
      },
    })
  } catch (e: any) {
    return NextResponse.json({
      error: e.message,
      code: e.code,
    })
  }
}
