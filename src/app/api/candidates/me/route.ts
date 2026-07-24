import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id

    const candidate = await db.candidate.findUnique({
      where: { userId },
      include: {
        profile: true,
        preferences: true,
        educations: { orderBy: { startDate: 'desc' } },
        qualifications: true,
        workExperiences: { orderBy: { startDate: 'desc' } },
        skills: true,
        tools: true,
        certifications: true,
        interests: true,
        subcategories: true,
      },
    })

    if (!candidate) {
      return NextResponse.json({ error: 'Candidate profile not found' }, { status: 404 })
    }

    // Compute profile completion percentage
    const checks = [
      !!candidate.profile?.professionalSummary,
      candidate.educations.length > 0,
      candidate.workExperiences.length > 0,
      candidate.skills.length > 0,
      !!candidate.preferences,
      !!candidate.location,
    ]
    const completionPct = Math.round((checks.filter(Boolean).length / checks.length) * 100)

    // Compute segment (derived, not stored)
    const educationOrder: Record<string, number> = {
      primary: 1, secondary: 2, certificate: 3, diploma: 4,
      advanced_diploma: 5, degree: 6, masters: 7, phd: 8, professional: 7,
    }
    const highestEdu = candidate.profile?.highestEducation || 'secondary'
    const eduLevel = educationOrder[highestEdu] || 2
    const expYears = candidate.profile?.yearsOfExperience || 0

    let segment = 'form4'
    if (eduLevel >= 3 && expYears <= 2) segment = 'fresher'
    else if (expYears >= 2 && expYears <= 6) segment = 'mid_level'
    else if (expYears > 6) segment = 'experienced'

    return NextResponse.json({
      ...candidate,
      _meta: { completionPct, segment },
    })
  } catch (error: any) {
    console.error('Fetch candidate error:', error)
    return NextResponse.json({ error: 'Failed to fetch candidate data' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const body = await req.json()

    const candidate = await db.candidate.update({
      where: { userId },
      data: {
        ...(body.phone && { phone: body.phone }),
        ...(body.location && { location: body.location }),
        ...(body.county && { county: body.county }),
      },
    })

    return NextResponse.json({ success: true, candidate })
  } catch (error: any) {
    console.error('Update candidate error:', error)
    return NextResponse.json({ error: 'Failed to update candidate' }, { status: 500 })
  }
}
