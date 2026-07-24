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
    const { experiences } = await req.json()

    if (!Array.isArray(experiences) || experiences.length === 0) {
      return NextResponse.json({ error: 'Experiences array is required' }, { status: 400 })
    }

    const candidate = await db.candidate.findUnique({ where: { userId } })
    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })
    }

    await db.candidateWorkExperience.deleteMany({ where: { candidateId: candidate.id } })

    const created = await db.candidateWorkExperience.createMany({
      data: experiences.map((e: any) => ({
        candidateId: candidate.id,
        company: e.company,
        jobTitle: e.jobTitle,
        startDate: e.startDate ? new Date(e.startDate) : null,
        endDate: e.endDate ? new Date(e.endDate) : null,
        isCurrent: e.isCurrent || false,
        description: e.description || null,
        location: e.location || null,
      })),
    })

    return NextResponse.json({ success: true, count: created.count })
  } catch (error: any) {
    console.error('Experience save error:', error)
    return NextResponse.json({ error: 'Failed to save experience' }, { status: 500 })
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
      return NextResponse.json({ error: 'Experience ID is required' }, { status: 400 })
    }

    const userId = (session.user as any).id
    const candidate = await db.candidate.findUnique({ where: { userId } })
    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })
    }

    await db.candidateWorkExperience.deleteMany({
      where: { id, candidateId: candidate.id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Experience delete error:', error)
    return NextResponse.json({ error: 'Failed to delete experience' }, { status: 500 })
  }
}