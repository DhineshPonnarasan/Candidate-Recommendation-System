export interface ExperienceEntry {
  title: string
  company: string
  duration?: string
  dateRange?: string
  responsibilities?: string[]
  achievements?: string[]
  technologies: string[]
  yearsInRole?: number
}
export interface ProjectEntry {
  name: string
  category?: string
  description?: string
  technologies: string[]
  links: string[]
  achievements: string[]
  role?: string
  teamSize?: number
}
export interface Candidate {
  id: string
  name: string
  fullName: string
  email: string
  phone: string
  linkedin: string
  experiences: ExperienceEntry[]
  projects: ProjectEntry[]
  similarity: number
  skills: string[]
  experience: string[]
  summary: string
  fileName: string
  content: string
  experienceAnalysis?: {
    totalYears: number
    seniorityLevel: string
    currentPosition?: string
    industries: string[]
  }
  projectsAnalysis?: {
    categories: string[]
    totalProjects: number
  }
  careerProgression?: {
    progression: 'ascending' | 'lateral' | 'mixed' | 'unclear'
    progressionScore: number
    insights: string[]
  }
}
