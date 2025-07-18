import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Types
export interface UserProfile {
  id: string
  name?: string
  email?: string
  phone?: string
  location?: string
  skills: string[]
  experience: string
  education: string[]
  preferredRoles: string[]
  preferredLocations: string[]
  salaryRange?: string
  workType?: 'remote' | 'hybrid' | 'onsite'
  resumeText?: string
  resumeFile?: File
  createdAt: Date
  updatedAt: Date
}

export interface JobListing {
  id: string
  title: string
  company: string
  location: string
  type: string
  salary?: string
  description: string
  requirements: string[]
  skills: string[]
  postedDate: string
  url?: string
  source: string
  matchScore?: number
  applied?: boolean
  appliedAt?: Date
}

export interface Application {
  id: string
  jobId: string
  jobTitle: string
  company: string
  appliedAt: Date
  status: 'pending' | 'applied' | 'reviewing' | 'interview' | 'rejected' | 'accepted'
  coverLetter?: string
  customResume?: string
  notes?: string
  responses: {
    date: Date
    type: 'email' | 'call' | 'interview'
    content: string
  }[]
}

interface AppState {
  // User Profile
  profile: UserProfile | null
  setProfile: (profile: UserProfile) => void
  updateProfile: (updates: Partial<UserProfile>) => void
  
  // Jobs
  jobs: JobListing[]
  setJobs: (jobs: JobListing[]) => void
  addJobs: (jobs: JobListing[]) => void
  updateJob: (jobId: string, updates: Partial<JobListing>) => void
  
  // Applications
  applications: Application[]
  addApplication: (application: Omit<Application, 'id'>) => void
  updateApplication: (id: string, updates: Partial<Application>) => void
  
  // Search/Filter state
  searchQuery: string
  setSearchQuery: (query: string) => void
  locationFilter: string
  setLocationFilter: (location: string) => void
  jobTypeFilter: string
  setJobTypeFilter: (type: string) => void
  
  // UI State
  isSearching: boolean
  setIsSearching: (searching: boolean) => void
  lastSearchTime: Date | null
  setLastSearchTime: (time: Date) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Profile
      profile: null,
      setProfile: (profile) => set({ profile }),
      updateProfile: (updates) => set((state) => ({
        profile: state.profile ? {
          ...state.profile,
          ...updates,
          updatedAt: new Date()
        } : null
      })),
      
      // Jobs
      jobs: [],
      setJobs: (jobs) => set({ jobs }),
      addJobs: (newJobs) => set((state) => {
        const existingIds = new Set(state.jobs.map(j => j.id))
        const uniqueNewJobs = newJobs.filter(job => !existingIds.has(job.id))
        return { jobs: [...state.jobs, ...uniqueNewJobs] }
      }),
      updateJob: (jobId, updates) => set((state) => ({
        jobs: state.jobs.map(job => 
          job.id === jobId ? { ...job, ...updates } : job
        )
      })),
      
      // Applications
      applications: [],
      addApplication: (application) => set((state) => ({
        applications: [...state.applications, {
          ...application,
          id: `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }]
      })),
      updateApplication: (id, updates) => set((state) => ({
        applications: state.applications.map(app =>
          app.id === id ? { ...app, ...updates } : app
        )
      })),
      
      // Search/Filter
      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),
      locationFilter: '',
      setLocationFilter: (location) => set({ locationFilter: location }),
      jobTypeFilter: '',
      setJobTypeFilter: (type) => set({ jobTypeFilter: type }),
      
      // UI State
      isSearching: false,
      setIsSearching: (searching) => set({ isSearching: searching }),
      lastSearchTime: null,
      setLastSearchTime: (time) => set({ lastSearchTime: time }),
    }),
    {
      name: 'jobflow-storage',
      partialize: (state) => ({
        profile: state.profile,
        jobs: state.jobs,
        applications: state.applications,
        searchQuery: state.searchQuery,
        locationFilter: state.locationFilter,
        jobTypeFilter: state.jobTypeFilter,
        lastSearchTime: state.lastSearchTime,
      }),
    }
  )
)