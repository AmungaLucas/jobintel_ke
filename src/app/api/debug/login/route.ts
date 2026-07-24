import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const user = await db.user.findUnique({ where: { email: 'amungalucas@gmail.com' } })
    if (!user) return NextResponse.json({ step: 'find', error: 'User not found' })
    if (!user.passwordHash) return NextResponse.json({ step: 'hash', error: 'No password hash' })
    const match = await bcrypt.compare('Admincyber', user.passwordHash)
    return NextResponse.json({
      step: 'match',
      match,
      userId: user.id,
      name: user.name,
      hashPrefix: user.passwordHash.substring(0, 15),
    })
  } catch (e: any) {
    return NextResponse.json({ step: 'error', error: e.message })
  }
}
