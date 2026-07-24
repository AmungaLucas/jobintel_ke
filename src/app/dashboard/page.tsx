'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Briefcase, User, Settings, LogOut, GraduationCap, Building2,
  Wrench, MapPin, Target, TrendingUp, Plus, Search, Bell, ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [candidate, setCandidate] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }
    if (status === 'authenticated') {
      fetchCandidate()
    }
  }, [status, router])

  async function fetchCandidate() {
    try {
      const res = await fetch('/api/candidates/me')
      if (res.status === 401) {
        router.push('/auth/signin')
        return
      }
      if (res.ok) {
        const data = await res.json()
        setCandidate(data)
        // If onboarding not complete, redirect
        if (data.onboardingState !== 'COMPLETED') {
          router.push('/onboarding')
        }
      }
    } catch (err) {
      console.error('Failed to fetch candidate:', err)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    )
  }

  if (!candidate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-gray-500 mb-4">Could not load your profile.</p>
          <Button onClick={fetchCandidate} variant="outline">Try Again</Button>
        </Card>
      </div>
    )
  }

  const profile = candidate.profile || {}
  const meta = candidate._meta || { completionPct: 0, segment: 'form4' }
  const prefs = candidate.preferences
  const segmentLabels: Record<string, string> = {
    form4: 'Form 4 Leaver',
    fresher: 'Fresh Graduate',
    mid_level: 'Mid-Level Professional',
    experienced: 'Experienced Professional',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">JobReady</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-gray-500 hover:text-gray-700">
              <Bell className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-medium text-sm">
              {session?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-gray-400 hover:text-red-500 transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <User className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{session?.user?.name || 'User'}</h3>
                  <p className="text-sm text-gray-500">{session?.user?.email}</p>
                  <Badge variant="secondary" className="mt-2">
                    {segmentLabels[meta.segment] || meta.segment}
                  </Badge>
                </div>
                <Separator />
                <nav className="space-y-1">
                  {[
                    { icon: Target, label: 'Overview', active: true },
                    { icon: Search, label: 'Job Matches', href: '#', soon: true },
                    { icon: User, label: 'Edit Profile', href: '/onboarding' },
                    { icon: Settings, label: 'Preferences', href: '#', soon: true },
                  ].map((item) => (
                    <Link
                      key={item.label}
                      href={item.href || '#'}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        item.active
                          ? 'bg-emerald-50 text-emerald-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                      {item.soon && (
                        <Badge variant="outline" className="ml-auto text-[10px] px-1.5">Soon</Badge>
                      )}
                    </Link>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3 space-y-6">
            {/* Welcome */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {session?.user?.name?.split(' ')[0] || 'there'}
              </h1>
              <p className="text-gray-500 mt-1">Here is an overview of your profile and job readiness.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-500">Profile Completion</span>
                    <Target className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{meta.completionPct}%</div>
                  <Progress value={meta.completionPct} className="mt-2 h-2" />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-500">Readiness Score</span>
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{candidate.readinessScore || 0}<span className="text-base text-gray-400">/100</span></div>
                  <p className="text-xs text-gray-400 mt-2">Based on your profile completeness</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-500">Skills & Tools</span>
                    <Wrench className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {candidate.skills?.length || 0}
                    <span className="text-base text-gray-400"> skills</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">{candidate.tools?.length || 0} tools added</p>
                </CardContent>
              </Card>
            </div>

            {/* Skills Section */}
            {(candidate.skills?.length > 0 || candidate.tools?.length > 0) && (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Skills & Tools</CardTitle>
                    <Link href="/onboarding" className="text-sm text-emerald-600 hover:underline">Edit</Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {candidate.skills?.length > 0 && (
                    <div className="mb-3">
                      <span className="text-xs text-gray-500 uppercase tracking-wide">Skills</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {candidate.skills.map((s: any) => (
                          <Badge key={s.id} variant="secondary">
                            {s.name}
                            <span className="ml-1 text-[10px] text-muted-foreground">{s.level}</span>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {candidate.tools?.length > 0 && (
                    <div>
                      <span className="text-xs text-gray-500 uppercase tracking-wide">Tools</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {candidate.tools.map((t: any) => (
                          <Badge key={t.id} variant="outline">
                            <Wrench className="w-3 h-3 mr-1" />
                            {t.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Experience Section */}
            {candidate.workExperiences?.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Work Experience</CardTitle>
                    <Link href="/onboarding" className="text-sm text-emerald-600 hover:underline">Edit</Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {candidate.workExperiences.slice(0, 3).map((exp: any) => (
                      <div key={exp.id} className="flex gap-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-5 h-5 text-gray-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 text-sm">{exp.jobTitle}</h4>
                          <p className="text-sm text-gray-500">{exp.company}{exp.location ? ` - ${exp.location}` : ''}</p>
                        </div>
                        <div className="text-xs text-gray-400 text-right flex-shrink-0">
                          {exp.startDate && new Date(exp.startDate).getFullYear()}
                          {exp.endDate && !exp.isCurrent
                            ? ` - ${new Date(exp.endDate).getFullYear()}`
                            : exp.isCurrent
                            ? ' - Present'
                            : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Education Section */}
            {candidate.educations?.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Education</CardTitle>
                    <Link href="/onboarding" className="text-sm text-emerald-600 hover:underline">Edit</Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {candidate.educations.map((edu: any) => (
                      <div key={edu.id} className="flex gap-4">
                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <GraduationCap className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 text-sm">
                            {edu.degree && `${edu.degree} in `}{edu.fieldOfStudy || 'General'}
                          </h4>
                          <p className="text-sm text-gray-500">{edu.institution}</p>
                          <p className="text-xs text-gray-400">
                            {edu.startDate && new Date(edu.startDate).getFullYear()}
                            {edu.endDate && !edu.isCurrent
                              ? ` - ${new Date(edu.endDate).getFullYear()}`
                              : edu.isCurrent
                              ? ' - Present'
                              : ''}
                            {edu.grade && ` | ${edu.grade}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Job Matches Placeholder */}
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-700 mb-1">Job Matches Coming Soon</h3>
                <p className="text-sm text-gray-500 max-w-sm mx-auto mb-4">
                  We are building the job matching engine. Once live, you will see personalized job recommendations here based on your profile.
                </p>
                <Badge variant="outline" className="text-emerald-600 border-emerald-200">
                  Phase 2 - In Development
                </Badge>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </div>
  )
}