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
    const { skills, tools } = await req.json()

    const candidate = await db.candidate.findUnique({ where: { userId } })
    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })
    }

    let skillsCount = 0
    let toolsCount = 0

    if (Array.isArray(skills) && skills.length > 0) {
      await db.candidateSkill.deleteMany({ where: { candidateId: candidate.id } })
      await db.candidateSkill.createMany({
        data: skills.map((s: any) => ({
          candidateId: candidate.id,
          name: s.name,
          level: s.level || 'intermediate',
        })),
      })
      skillsCount = skills.length
    }

    if (Array.isArray(tools) && tools.length > 0) {
      await db.candidateTool.deleteMany({ where: { candidateId: candidate.id } })
      await db.candidateTool.createMany({
        data: tools.map((t: any) => ({
          candidateId: candidate.id,
          name: t.name,
          proficiency: t.proficiency || 'intermediate',
        })),
      })
      toolsCount = tools.length
    }

    return NextResponse.json({ success: true, skillsCount, toolsCount })
  } catch (error: any) {
    console.error('Skills save error:', error)
    return NextResponse.json({ error: 'Failed to save skills' }, { status: 500 })
  }
}
