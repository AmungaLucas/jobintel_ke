'use client'

import { useSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import {
  Briefcase,
  GraduationCap,
  Brain,
  FileText,
  ArrowRight,
  Search,
  Users,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const features = [
  {
    icon: Briefcase,
    title: 'Jobs & Opportunities',
    description: 'Browse curated jobs from top Kenyan companies, NGOs, and government portals.',
  },
  {
    icon: GraduationCap,
    title: 'Scholarships & Attachments',
    description: 'Find scholarships, internships, attachments, and graduate trainee programs.',
  },
  {
    icon: Brain,
    title: 'AI Job Matching',
    description: 'Upload your CV and get matched with jobs that fit your skills and experience.',
  },
  {
    icon: FileText,
    title: 'Career Services',
    description: 'Professional CV writing, LinkedIn optimization, and cover letter services.',
  },
]

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard')
    }
  }, [status, router])

  if (status === 'loading' || status === 'authenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">JobReady</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => router.push('/auth/signin')}>
              Sign In
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => router.push('/auth/signup')}
            >
              Sign Up Free
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/50" />
          <div className="relative max-w-6xl mx-auto px-4 py-20 sm:py-28 text-center">
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              AI-Powered Job Matching for Kenya
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight mb-6">
              The Place Where Kenyans
              <br />
              <span className="text-emerald-600">Check Opportunities Daily</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10">
              Jobs, scholarships, attachments, and career services — all in one
              platform built for the Kenyan job market.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 h-12 text-base"
                onClick={() => router.push('/auth/signin')}
              >
                Find Opportunities
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="px-8 h-12 text-base border-gray-300"
                onClick={() => router.push('/auth/signup')}
              >
                Sign Up Free
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="max-w-6xl mx-auto px-4 py-16 sm:py-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Everything You Need to Land Your Next Role
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              From job discovery to application readiness, JobReady has you covered.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="border-gray-200 hover:border-emerald-200 hover:shadow-md transition-all duration-200"
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-emerald-600 py-12">
          <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center text-white">
            <div>
              <Search className="w-6 h-6 mx-auto mb-2 opacity-80" />
              <div className="text-3xl font-bold">500+</div>
              <div className="text-emerald-100 text-sm">Active Opportunities</div>
            </div>
            <div>
              <Users className="w-6 h-6 mx-auto mb-2 opacity-80" />
              <div className="text-3xl font-bold">47</div>
              <div className="text-emerald-100 text-sm">Kenyan Counties Covered</div>
            </div>
            <div>
              <Sparkles className="w-6 h-6 mx-auto mb-2 opacity-80" />
              <div className="text-3xl font-bold">AI</div>
              <div className="text-emerald-100 text-sm">Smart Job Matching</div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} JobReady Kenya. All rights reserved.
        </div>
      </footer>
    </div>
  )
}