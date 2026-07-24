'use client'

import { useState, useEffect } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Upload, ClipboardPaste, UserPlus, ArrowRight, ArrowLeft,
  Briefcase, GraduationCap, Wrench, Check, Loader2, Sparkles,
  MapPin, Building2, DollarSign, Radio, RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { EDUCATION_LEVELS, JOB_TYPES, KENYAN_COUNTIES } from '@/lib/constants'

type OnboardingMethod = 'upload' | 'paste' | 'manual'

interface EducationEntry {
  institution: string
  degree: string
  fieldOfStudy: string
  startDate: string
  endDate: string
  grade: string
  isCurrent: boolean
}

interface ExperienceEntry {
  company: string
  jobTitle: string
  startDate: string
  endDate: string
  isCurrent: boolean
  description: string
  location: string
}

interface SkillEntry {
  name: string
  level: string
}

const emptyEducation = (): EducationEntry => ({
  institution: '', degree: '', fieldOfStudy: '',
  startDate: '', endDate: '', grade: '', isCurrent: false,
})

const emptyExperience = (): ExperienceEntry => ({
  company: '', jobTitle: '', startDate: '', endDate: '',
  isCurrent: false, description: '', location: '',
})

export default function OnboardingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [step, setStep] = useState(0)
  const [method, setMethod] = useState<OnboardingMethod | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Personal info
  const [summary, setSummary] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [county, setCounty] = useState('')

  // Education
  const [educations, setEducations] = useState<EducationEntry[]>([emptyEducation()])

  // Experience
  const [experiences, setExperiences] = useState<ExperienceEntry[]>([emptyExperience()])

  // Skills & Tools
  const [skills, setSkills] = useState<SkillEntry[]>([])
  const [tools, setTools] = useState<SkillEntry[]>([])
  const [newSkill, setNewSkill] = useState('')
  const [newTool, setNewTool] = useState('')

  // CV Input
  const [cvText, setCvText] = useState('')
  const [cvFile, setCvFile] = useState<File | null>(null)

  // Preferences
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([])
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [locationInput, setLocationInput] = useState('')
  const [remoteWork, setRemoteWork] = useState(false)
  const [minSalary, setMinSalary] = useState('')
  const [maxSalary, setMaxSalary] = useState('')
  const [openToRelocation, setOpenToRelocation] = useState(false)

  const totalSteps = 5
  const stepLabels = ['Method', 'CV Input', 'Profile', 'Preferences', 'Done']
  const progressPct = Math.round((step / (totalSteps - 1)) * 100)

  // Redirect if already completed
  useEffect(() => {
    if (status === 'unauthenticated') {
      signIn()
    }
  }, [status, signIn])

  // Handle file upload for CV parsing
  async function handleParseCV() {
    setLoading(true)
    setError('')
    try {
      const formData = new FormData()
      if (cvFile) {
        formData.append('file', cvFile)
      } else if (cvText.trim()) {
        formData.append('text', cvText)
      }

      const res = await fetch('/api/candidates/parse-cv', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        // If parse-cv route doesn't exist yet, skip parsing and go to manual
        setStep(2)
        setLoading(false)
        return
      }

      const data = await res.json()
      if (data.parsed) {
        const p = data.parsed
        if (p.summary) setSummary(p.summary)
        if (p.phone) setPhone(p.phone)
        if (p.location) setLocation(p.location)
        if (p.educations?.length) {
          setEducations(p.educations.map((e: any) => ({
            institution: e.institution || '',
            degree: e.degree || '',
            fieldOfStudy: e.fieldOfStudy || '',
            startDate: e.startDate || '',
            endDate: e.endDate || '',
            grade: e.grade || '',
            isCurrent: e.isCurrent || false,
          })))
        }
        if (p.experiences?.length) {
          setExperiences(p.experiences.map((e: any) => ({
            company: e.company || '',
            jobTitle: e.jobTitle || '',
            startDate: e.startDate || '',
            endDate: e.endDate || '',
            isCurrent: e.isCurrent || false,
            description: e.description || '',
            location: e.location || '',
          })))
        }
        if (p.skills?.length) {
          setSkills(p.skills.map((s: any) => ({ name: s.name || s, level: s.level || 'intermediate' })))
        }
        if (p.tools?.length) {
          setTools(p.tools.map((t: any) => ({ name: t.name || t, level: t.level || 'intermediate' })))
        }
      }
      setStep(2)
    } catch {
      setError('Failed to parse CV. You can fill in your details manually.')
      setStep(2)
    } finally {
      setLoading(false)
    }
  }

  // Save all data and complete onboarding
  async function handleComplete() {
    setSaving(true)
    setError('')

    try {
      // Save profile
      const highestEdu = educations.find(e => e.degree)?.degree || 'secondary'
      const yearsExp = experiences.filter(e => !e.isCurrent).length

      await Promise.all([
        fetch('/api/candidates/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            professionalSummary: summary,
            yearsOfExperience: yearsExp,
            highestEducation: highestEdu,
          }),
        }),
        fetch('/api/candidates/me', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, location, county }),
        }),
      ])

      // Save education
      const validEducations = educations.filter(e => e.institution.trim())
      if (validEducations.length > 0) {
        await fetch('/api/candidates/education', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ educations: validEducations }),
        })
      }

      // Save experience
      const validExperiences = experiences.filter(e => e.company.trim() && e.jobTitle.trim())
      if (validExperiences.length > 0) {
        await fetch('/api/candidates/experience', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ experiences: validExperiences }),
        })
      }

      // Save skills
      if (skills.length > 0 || tools.length > 0) {
        await fetch('/api/candidates/skills', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ skills, tools }),
        })
      }

      // Save preferences
      await fetch('/api/candidates/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferredJobTypes: selectedJobTypes,
          preferredLocations: selectedLocations,
          preferredRemote: remoteWork,
          minSalary: minSalary ? parseInt(minSalary) : null,
          maxSalary: maxSalary ? parseInt(maxSalary) : null,
          openToRelocation,
          alertFrequency: 'daily',
          markComplete: true,
        }),
      })

      setStep(4)
    } catch {
      setError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  function addSkill() {
    if (newSkill.trim()) {
      setSkills([...skills, { name: newSkill.trim(), level: 'intermediate' }])
      setNewSkill('')
    }
  }

  function addTool() {
    if (newTool.trim()) {
      setTools([...tools, { name: newTool.trim(), level: 'intermediate' }])
      setNewTool('')
    }
  }

  function addLocation() {
    const loc = locationInput.trim()
    if (loc && !selectedLocations.includes(loc)) {
      setSelectedLocations([...selectedLocations, loc])
      setLocationInput('')
    }
  }

  function toggleJobType(type: string) {
    setSelectedLocations(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    )
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">JobReady</span>
          </div>
          <span className="text-sm text-gray-500">Setup your profile</span>
        </div>
        <Progress value={progressPct} className="h-1 rounded-none" />
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Step indicator */}
        <div className="flex items-center justify-between mb-8">
          {stepLabels.map((label, i) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                i < step ? 'bg-emerald-600 text-white' :
                i === step ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-600' :
                'bg-gray-100 text-gray-400'
              }`}>
                {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <span className={`text-xs hidden sm:block ${i === step ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-6">{error}</div>
        )}

        {/* STEP 0: Choose Method */}
        {step === 0 && (
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">How would you like to set up your profile?</CardTitle>
              <CardDescription>Choose the easiest way for you to get started</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              {[{
                method: 'upload' as OnboardingMethod,
                icon: Upload, title: 'Upload CV',
                desc: 'Upload your CV file and we will extract your details automatically using AI.',
              }, {
                method: 'paste' as OnboardingMethod,
                icon: ClipboardPaste, title: 'Paste CV Text',
                desc: 'Copy and paste your CV content and we will parse it for you.',
              }, {
                method: 'manual' as OnboardingMethod,
                icon: UserPlus, title: 'Fill Manually',
                desc: 'Enter your details by hand. Best if you don\'t have a CV ready.',
              }].map((opt) => (
                <button
                  key={opt.method}
                  onClick={() => {
                    setMethod(opt.method)
                    if (opt.method === 'manual') setStep(2)
                    else setStep(1)
                  }}
                  className="text-left p-5 border rounded-xl hover:border-emerald-300 hover:shadow-md transition-all group"
                >
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-emerald-200 transition-colors">
                    <opt.icon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{opt.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{opt.desc}</p>
                </button>
              ))}
            </CardContent>
          </Card>
        )}

        {/* STEP 1: CV Input */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">
                {method === 'upload' ? 'Upload your CV' : 'Paste your CV content'}
              </CardTitle>
              <CardDescription>
                {method === 'upload'
                  ? 'We support PDF, DOCX, DOC, and TXT files.'
                  : 'Paste the full text of your CV below.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {method === 'upload' ? (
                <div>
                  <label className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-400 transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">
                      {cvFile ? cvFile.name : 'Click to upload or drag and drop'}
                    </span>
                    <span className="text-xs text-gray-400 mt-1">PDF, DOCX, DOC, TXT (max 5MB)</span>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                    />
                  </label>
                </div>
              ) : (
                <Textarea
                  placeholder="Paste your CV content here..."
                  value={cvText}
                  onChange={(e) => setCvText(e.target.value)}
                  rows={12}
                  className="resize-none"
                />
              )}

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(0)}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={handleParseCV}
                  disabled={loading || (method === 'upload' ? !cvFile : !cvText.trim())}
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Parsing...</>
                  ) : (
                    <><Sparkles className="w-4 h-4 mr-2" /> Parse & Continue</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 2: Review Profile */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Review Your Profile</CardTitle>
              <CardDescription>
                {method === 'manual'
                  ? 'Fill in your details below.'
                  : 'Review and edit the details we extracted from your CV.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="w-full grid grid-cols-4">
                  <TabsTrigger value="personal">Personal</TabsTrigger>
                  <TabsTrigger value="education">Education</TabsTrigger>
                  <TabsTrigger value="experience">Experience</TabsTrigger>
                  <TabsTrigger value="skills">Skills</TabsTrigger>
                </TabsList>

                {/* Personal Tab */}
                <TabsContent value="personal" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Professional Summary</Label>
                    <Textarea
                      placeholder="Brief summary of your professional background..."
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      rows={4}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Phone (optional)</Label>
                      <Input
                        placeholder="0712 345 678"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input
                        placeholder="Nairobi, Kenya"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>County</Label>
                      <select
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={county}
                        onChange={(e) => setCounty(e.target.value)}
                      >
                        <option value="">Select county</option>
                        {KENYAN_COUNTIES.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </TabsContent>

                {/* Education Tab */}
                <TabsContent value="education" className="space-y-4 mt-4">
                  {educations.map((edu, i) => (
                    <div key={i} className="border rounded-lg p-4 space-y-3 relative">
                      <div className="flex justify-between items-start">
                        <h4 className="text-sm font-medium text-gray-700">
                          <GraduationCap className="w-4 h-4 inline mr-1" />
                          Education {i + 1}
                        </h4>
                        {educations.length > 1 && (
                          <button
                            onClick={() => setEducations(educations.filter((_, idx) => idx !== i))}
                            className="text-red-500 text-xs hover:underline"
                          >Remove</button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Institution</Label>
                          <Input
                            placeholder="University of Nairobi"
                            value={edu.institution}
                            onChange={(e) => {
                              const updated = [...educations]
                              updated[i].institution = e.target.value
                              setEducations(updated)
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Degree / Certificate</Label>
                          <select
                            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                            value={edu.degree}
                            onChange={(e) => {
                              const updated = [...educations]
                              updated[i].degree = e.target.value
                              setEducations(updated)
                            }}
                          >
                            <option value="">Select level</option>
                            {EDUCATION_LEVELS.map(l => (
                              <option key={l.value} value={l.value}>{l.label}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Field of Study</Label>
                          <Input
                            placeholder="Computer Science"
                            value={edu.fieldOfStudy}
                            onChange={(e) => {
                              const updated = [...educations]
                              updated[i].fieldOfStudy = e.target.value
                              setEducations(updated)
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Grade</Label>
                          <Input
                            placeholder="First Class / A"
                            value={edu.grade}
                            onChange={(e) => {
                              const updated = [...educations]
                              updated[i].grade = e.target.value
                              setEducations(updated)
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Start Date</Label>
                          <Input
                            type="month"
                            value={edu.startDate}
                            onChange={(e) => {
                              const updated = [...educations]
                              updated[i].startDate = e.target.value
                              setEducations(updated)
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">End Date</Label>
                          <Input
                            type="month"
                            value={edu.endDate}
                            disabled={edu.isCurrent}
                            onChange={(e) => {
                              const updated = [...educations]
                              updated[i].endDate = e.target.value
                              setEducations(updated)
                            }}
                          />
                          <label className="flex items-center gap-2 text-xs mt-1">
                            <input
                              type="checkbox"
                              checked={edu.isCurrent}
                              onChange={(e) => {
                                const updated = [...educations]
                                updated[i].isCurrent = e.target.checked
                                if (e.target.checked) updated[i].endDate = ''
                                setEducations(updated)
                              }}
                            />
                            Currently studying here
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEducations([...educations, emptyEducation()])}
                  >
                    + Add Education
                  </Button>
                </TabsContent>

                {/* Experience Tab */}
                <TabsContent value="experience" className="space-y-4 mt-4">
                  {experiences.map((exp, i) => (
                    <div key={i} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <h4 className="text-sm font-medium text-gray-700">
                          <Building2 className="w-4 h-4 inline mr-1" />
                          Experience {i + 1}
                        </h4>
                        {experiences.length > 1 && (
                          <button
                            onClick={() => setExperiences(experiences.filter((_, idx) => idx !== i))}
                            className="text-red-500 text-xs hover:underline"
                          >Remove</button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Company</Label>
                          <Input
                            placeholder="Safaricom"
                            value={exp.company}
                            onChange={(e) => {
                              const updated = [...experiences]
                              updated[i].company = e.target.value
                              setExperiences(updated)
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Job Title</Label>
                          <Input
                            placeholder="Software Engineer"
                            value={exp.jobTitle}
                            onChange={(e) => {
                              const updated = [...experiences]
                              updated[i].jobTitle = e.target.value
                              setExperiences(updated)
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Location</Label>
                          <Input
                            placeholder="Nairobi"
                            value={exp.location}
                            onChange={(e) => {
                              const updated = [...experiences]
                              updated[i].location = e.target.value
                              setExperiences(updated)
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Start Date</Label>
                          <Input
                            type="month"
                            value={exp.startDate}
                            onChange={(e) => {
                              const updated = [...experiences]
                              updated[i].startDate = e.target.value
                              setExperiences(updated)
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">End Date</Label>
                          <Input
                            type="month"
                            value={exp.endDate}
                            disabled={exp.isCurrent}
                            onChange={(e) => {
                              const updated = [...experiences]
                              updated[i].endDate = e.target.value
                              setExperiences(updated)
                            }}
                          />
                          <label className="flex items-center gap-2 text-xs mt-1">
                            <input
                              type="checkbox"
                              checked={exp.isCurrent}
                              onChange={(e) => {
                                const updated = [...experiences]
                                updated[i].isCurrent = e.target.checked
                                if (e.target.checked) updated[i].endDate = ''
                                setExperiences(updated)
                              }}
                            />
                            I currently work here
                          </label>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Description</Label>
                        <Textarea
                          placeholder="Key responsibilities and achievements..."
                          value={exp.description}
                          onChange={(e) => {
                            const updated = [...experiences]
                            updated[i].description = e.target.value
                            setExperiences(updated)
                          }}
                          rows={3}
                        />
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setExperiences([...experiences, emptyExperience()])}
                  >
                    + Add Experience
                  </Button>
                </TabsContent>

                {/* Skills Tab */}
                <TabsContent value="skills" className="space-y-6 mt-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Skills</h4>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {skills.map((s, i) => (
                        <Badge key={i} variant="secondary" className="pl-3 pr-1 py-1.5 gap-2">
                          {s.name}
                          <select
                            className="text-xs bg-transparent border-none outline-none text-muted-foreground"
                            value={s.level}
                            onChange={(e) => {
                              const updated = [...skills]
                              updated[i].level = e.target.value
                              setSkills(updated)
                            }}
                          >
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                            <option value="expert">Expert</option>
                          </select>
                          <button
                            onClick={() => setSkills(skills.filter((_, idx) => idx !== i))}
                            className="text-muted-foreground hover:text-red-500 ml-1"
                          >x</button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a skill (e.g. JavaScript, Project Management)"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                        className="flex-1"
                      />
                      <Button variant="outline" size="sm" onClick={addSkill}>Add</Button>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Tools & Software</h4>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {tools.map((t, i) => (
                        <Badge key={i} variant="secondary" className="pl-3 pr-1 py-1.5 gap-2">
                          <Wrench className="w-3 h-3" />
                          {t.name}
                          <button
                            onClick={() => setTools(tools.filter((_, idx) => idx !== i))}
                            className="text-muted-foreground hover:text-red-500 ml-1"
                          >x</button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a tool (e.g. Excel, Figma, Jira)"
                        value={newTool}
                        onChange={(e) => setNewTool(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTool())}
                        className="flex-1"
                      />
                      <Button variant="outline" size="sm" onClick={addTool}>Add</Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => setStep(0)}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => setStep(3)}
                >
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 3: Preferences */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Job Preferences</CardTitle>
              <CardDescription>Tell us what kind of opportunities you are looking for</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Job Types */}
              <div>
                <Label className="text-sm font-medium mb-3 block">What type of work are you looking for?</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {JOB_TYPES.map((jt) => (
                    <label
                      key={jt.value}
                      className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedJobTypes.includes(jt.value)
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'hover:border-gray-300'
                      }`}
                    >
                      <Checkbox
                        checked={selectedJobTypes.includes(jt.value)}
                        onCheckedChange={() => {
                          setSelectedJobTypes(prev =>
                            prev.includes(jt.value)
                              ? prev.filter(t => t !== jt.value)
                              : [...prev, jt.value]
                          )
                        }}
                      />
                      <span className="text-sm">{jt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Locations */}
              <div>
                <Label className="text-sm font-medium mb-3 block">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Preferred Locations
                </Label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedLocations.map((loc) => (
                    <Badge key={loc} variant="secondary" className="pl-3 pr-1 py-1.5 gap-1">
                      {loc}
                      <button
                        onClick={() => setSelectedLocations(prev => prev.filter(l => l !== loc))}
                        className="text-muted-foreground hover:text-red-500"
                      >x</button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Type and add a location"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addLocation())}
                    className="flex-1"
                    list="counties-list"
                  />
                  <datalist id="counties-list">
                    {KENYAN_COUNTIES.map(c => <option key={c} value={c} />)}
                  </datalist>
                  <Button variant="outline" size="sm" onClick={addLocation}>Add</Button>
                </div>
              </div>

              {/* Remote & Relocation */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Radio className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium">Open to Remote Work</div>
                      <div className="text-xs text-gray-500">Include remote/online opportunities</div>
                    </div>
                  </div>
                  <Switch checked={remoteWork} onCheckedChange={setRemoteWork} />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <RefreshCw className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium">Open to Relocation</div>
                      <div className="text-xs text-gray-500">Willing to move for the right opportunity</div>
                    </div>
                  </div>
                  <Switch checked={openToRelocation} onCheckedChange={setOpenToRelocation} />
                </div>
              </div>

              {/* Salary */}
              <div>
                <Label className="text-sm font-medium mb-3 block">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Expected Salary Range (KES/month)
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs">Minimum</Label>
                    <Input
                      type="number"
                      placeholder="e.g. 30000"
                      value={minSalary}
                      onChange={(e) => setMinSalary(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Maximum</Label>
                    <Input
                      type="number"
                      placeholder="e.g. 100000"
                      value={maxSalary}
                      onChange={(e) => setMaxSalary(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={handleComplete}
                  disabled={saving}
                >
                  {saving ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                  ) : (
                    <><Check className="w-4 h-4 mr-2" /> Complete Setup</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 4: Complete */}
        {step === 4 && (
          <Card className="text-center">
            <CardContent className="py-12">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">You are all set!</h2>
              <p className="text-gray-600 mb-8 max-w-sm mx-auto">
                Your profile is ready. We will start matching you with relevant opportunities across Kenya.
              </p>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8"
                onClick={() => router.push('/dashboard')}
              >
                Go to Dashboard <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}