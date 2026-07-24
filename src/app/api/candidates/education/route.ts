import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { educations } = await req.json()

    if (!Array.isArray(educations) || educations.length === 0) {
      return NextResponse.json({ error: 'Educations array is required' }, { status: 400 })
    }

    const candidate = await db.candidate.findUnique({ where: { userId } })
    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })
    }

    // Delete existing and recreate
    await db.candidateEducation.deleteMany({ where: { candidateId: candidate.id } })

    const created = await db.candidateEducation.createMany({
      data: educations.map((e: any) => ({
        candidateId: candidate.id,
        institution: e.institution,
        degree: e.degree || null,
        fieldOfStudy: e.fieldOfStudy || null,
        startDate: e.startDate ? new Date(e.startDate) : null,
        endDate: e.endDate ? new Date(e.endDate) : null,
        grade: e.grade || null,
        description: e.description || null,
        isCurrent: e.isCurrent || false,
      })),
    })

    // Update onboarding state
    await db.candidate.update({
      where: { id: candidate.id },
      data: { onboardingState: 'PROFILE_REVIEWED' },
    })

    return NextResponse.json({ success: true, count: created.count })
  } catch (error: any) {
    console.error('Education save error:', error)
    return NextResponse.json({ error: 'Failed to save education' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'Education ID is required' }, { status: 400 })
    }

    const userId = (session.user as any).id
    const candidate = await db.candidate.findUnique({ where: { userId } })
    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })
    }

    await db.candidateEducation.deleteMany({
      where: { id, candidateId: candidate.id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Education delete error:', error)
    return NextResponse.json({ error: 'Failed to delete education' }, { status: 500 })
  }
}
