// Education levels for Kenyan context
export const EDUCATION_LEVELS = [
  { value: 'primary', label: 'Primary Education' },
  { value: 'secondary', label: 'KCSE / O-Level' },
  { value: 'certificate', label: 'Certificate' },
  { value: 'diploma', label: 'Diploma' },
  { value: 'advanced_diploma', label: 'Advanced Diploma' },
  { value: 'degree', label: 'Bachelor\'s Degree' },
  { value: 'masters', label: 'Master\'s Degree' },
  { value: 'phd', label: 'PhD / Doctorate' },
  { value: 'professional', label: 'Professional Certification' },
] as const

// Proficiency levels
export const PROFICIENCY_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' },
] as const

// Job types
export const JOB_TYPES = [
  { value: 'full_time', label: 'Full Time' },
  { value: 'part_time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
  { value: 'attachment', label: 'Attachment' },
  { value: 'volunteer', label: 'Volunteer' },
  { value: 'freelance', label: 'Freelance' },
] as const

// Kenyan counties
export const KENYAN_COUNTIES = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Uasin Gishu',
  'Kiambu', 'Machakos', 'Meru', 'Kakamega', 'Embu',
  'Nyeri', 'Murang\'a', 'Kilifi', 'Kitui', 'Mandera',
  'Garissa', 'Marsabit', 'Isiolo', 'Turkana', 'West Pokot',
  'Samburu', 'Trans Nzoia', 'Elgeyo Marakwet', 'Nandi',
  'Baringo', 'Laikipia', 'Nakuru', 'Nyamira', 'Kisii',
  'Migori', 'Homa Bay', 'Siaya', 'Busia', 'Bungoma',
  'Vihiga', 'Kakamega', 'Kericho', 'Bomet', 'Narok',
  'Kajiado', 'Makueni', 'Kwale', 'Taita Taveta', 'Tana River',
  'Lamu', 'Wajir', 'Mandera', 'Marsabit', 'Tharaka Nithi',
] as const

// Alert frequencies
export const ALERT_FREQUENCIES = [
  { value: 'instant', label: 'Instant' },
  { value: 'daily', label: 'Daily Digest' },
  { value: 'weekly', label: 'Weekly Digest' },
] as const

// Onboarding states
export const ONBOARDING_STATES = [
  'STARTED',
  'CV_RECEIVED',
  'EXTRACTION_COMPLETE',
  'PROFILE_REVIEWED',
  'DOMAIN_CONFIRMED',
  'INTERESTS_SELECTED',
  'PREFERENCES_SET',
  'COMPLETED',
] as const

// Segment computation thresholds
export const SEGMENT_THRESHOLDS = {
  form4: { maxExperienceYears: 0, maxEducation: 'secondary' },
  fresher: { maxExperienceYears: 2, minEducation: 'certificate' },
  midLevel: { minExperienceYears: 2, maxExperienceYears: 6 },
  experienced: { minExperienceYears: 7 },
} as const

// Education level ordering for comparison
export const EDUCATION_ORDER: Record<string, number> = {
  primary: 1,
  secondary: 2,
  certificate: 3,
  diploma: 4,
  advanced_diploma: 5,
  degree: 6,
  masters: 7,
  phd: 8,
  professional: 7, // treated same as masters
}
