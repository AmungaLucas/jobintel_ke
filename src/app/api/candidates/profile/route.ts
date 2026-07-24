import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function PATCH(req: NextRequest) {
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

    const profile = await db.candidateProfile.upsert({
      where: { candidateId: candidate.id },
      update: {
        ...(body.professionalSummary !== undefined && { professionalSummary: body.professionalSummary }),
        ...(body.yearsOfExperience !== undefined && { yearsOfExperience: body.yearsOfExperience }),
        ...(body.highestEducation !== undefined && { highestEducation: body.highestEducation }),
        ...(body.currentJobTitle !== undefined && { currentJobTitle: body.currentJobTitle }),
        ...(body.currentEmployer !== undefined && { currentEmployer: body.currentEmployer }),
        ...(body.currentSalaryRange !== undefined && { currentSalaryRange: body.currentSalaryRange }),
        ...(body.preferredSalaryRange !== undefined && { preferredSalaryRange: body.preferredSalaryRange }),
        ...(body.linkedInUrl !== undefined && { linkedInUrl: body.linkedInUrl }),
        ...(body.portfolioUrl !== undefined && { portfolioUrl: body.portfolioUrl }),
        ...(body.githubUrl !== undefined && { githubUrl: body.githubUrl }),
        ...(body.dateOfBirth !== undefined && { dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null }),
        ...(body.gender !== undefined && { gender: body.gender }),
        ...(body.nationality !== undefined && { nationality: body.nationality }),
      },
      create: {
        candidateId: candidate.id,
        ...(body.professionalSummary && { professionalSummary: body.professionalSummary }),
        ...(body.yearsOfExperience !== undefined && { yearsOfExperience: body.yearsOfExperience }),
        ...(body.highestEducation && { highestEducation: body.highestEducation }),
        ...(body.currentJobTitle && { currentJobTitle: body.currentJobTitle }),
        ...(body.currentEmployer && { currentEmployer: body.currentEmployer }),
        ...(body.linkedInUrl && { linkedInUrl: body.linkedInUrl }),
        ...(body.portfolioUrl && { portfolioUrl: body.portfolioUrl }),
        ...(body.githubUrl && { githubUrl: body.githubUrl }),
        ...(body.gender && { gender: body.gender }),
        ...(body.nationality && { nationality: body.nationality }),
      },
    })

    return NextResponse.json({ success: true, profile })
  } catch (error: any) {
    console.error('Update profile error:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
