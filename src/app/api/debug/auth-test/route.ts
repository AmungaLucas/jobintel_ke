import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const email = body.email
    const password = body.password

    const user = await db.user.findUnique({
      where: { email },
    })

    if (!user) return NextResponse.json({ step: 1, error: 'User not found' })
    if (!user.passwordHash) return NextResponse.json({ step: 2, error: 'No passwordHash' })

    const isValid = await bcrypt.compare(password, user.passwordHash)
    if (!isValid) return NextResponse.json({ step: 3, error: 'Password mismatch' })

    return NextResponse.json({
      step: 'success',
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    })
  } catch (e: any) {
    return NextResponse.json({ step: 'error', error: e.message, stack: e.stack?.substring(0, 300) })
  }
}
