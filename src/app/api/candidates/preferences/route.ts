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
    const body = await req.json()

    const candidate = await db.candidate.findUnique({ where: { userId } })
    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })
    }

    const preferences = await db.candidatePreferences.upsert({
      where: { candidateId: candidate.id },
      update: {
        preferredJobTypes: JSON.stringify(body.preferredJobTypes || []),
        preferredLocations: JSON.stringify(body.preferredLocations || []),
        ...(body.preferredIndustries && { preferredIndustries: JSON.stringify(body.preferredIndustries) }),
        ...(body.preferredRemote !== undefined && { preferredRemote: body.preferredRemote }),
        ...(body.minSalary !== undefined && { minSalary: body.minSalary }),
        ...(body.maxSalary !== undefined && { maxSalary: body.maxSalary }),
        ...(body.openToRelocation !== undefined && { openToRelocation: body.openToRelocation }),
        ...(body.alertFrequency && { alertFrequency: body.alertFrequency }),
      },
      create: {
        candidateId: candidate.id,
        preferredJobTypes: JSON.stringify(body.preferredJobTypes || []),
        preferredLocations: JSON.stringify(body.preferredLocations || []),
        preferredIndustries: body.preferredIndustries ? JSON.stringify(body.preferredIndustries) : null,
        preferredRemote: body.preferredRemote || false,
        minSalary: body.minSalary || null,
        maxSalary: body.maxSalary || null,
        openToRelocation: body.openToRelocation || false,
        alertFrequency: body.alertFrequency || 'daily',
      },
    })

    // Mark onboarding complete if requested
    if (body.markComplete) {
      await db.candidate.update({
        where: { id: candidate.id },
        data: { onboardingState: 'COMPLETED' },
      })
    }

    return NextResponse.json({ success: true, preferences })
  } catch (error: any) {
    console.error('Preferences save error:', error)
    return NextResponse.json({ error: 'Failed to save preferences' }, { status: 500 })
  }
}
