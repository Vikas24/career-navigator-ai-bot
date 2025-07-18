import { JobListing } from '@/store/appStore'

// Free job board APIs and sources
const JOB_APIS = {
  // Himalayas API (free tier)
  himalayas: 'https://himalayas.app/api/jobs',
  // GitHub Jobs alternative
  adzuna: 'https://api.adzuna.com/v1/api/jobs/gb/search',
  // RemoteOK (has CORS issues, would need proxy)
  remoteok: 'https://remoteok.io/api',
  // JSearch (RapidAPI - would need API key)
  jsearch: 'https://jsearch.p.rapidapi.com/search',
}

interface JobSearchParams {
  query?: string
  location?: string
  jobType?: 'remote' | 'hybrid' | 'onsite' | 'full-time' | 'part-time' | 'contract'
  limit?: number
  skills?: string[]
}

class JobDiscoveryService {
  private async fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 10000) {
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), timeout)
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })
      clearTimeout(id)
      return response
    } catch (error) {
      clearTimeout(id)
      throw error
    }
  }

  // Mock data for development (replace with real API calls)
  private generateMockJobs(params: JobSearchParams): JobListing[] {
    const mockCompanies = [
      'TechCorp', 'StartupX', 'InnovateLabs', 'DataDriven Inc', 'CloudTech',
      'AI Solutions', 'WebFlow Co', 'DevCraft', 'CodeBase', 'TechPioneer',
      'Digital Dynamics', 'FutureCode', 'ByteWorks', 'PixelPerfect', 'NetVision'
    ]

    const mockTitles = [
      'Senior Frontend Developer', 'Full Stack Engineer', 'React Developer',
      'Backend Developer', 'DevOps Engineer', 'Software Engineer',
      'UI/UX Designer', 'Product Manager', 'Data Scientist', 'Mobile Developer',
      'Python Developer', 'JavaScript Developer', 'Cloud Architect', 'QA Engineer'
    ]

    const mockLocations = [
      'Remote', 'San Francisco, CA', 'New York, NY', 'Austin, TX', 'Seattle, WA',
      'London, UK', 'Berlin, Germany', 'Toronto, CA', 'Amsterdam, NL', 'Barcelona, ES'
    ]

    const mockSkills = [
      'React', 'JavaScript', 'TypeScript', 'Node.js', 'Python', 'Java',
      'AWS', 'Docker', 'Kubernetes', 'PostgreSQL', 'MongoDB', 'Redis',
      'GraphQL', 'REST APIs', 'Git', 'CI/CD', 'Agile', 'Scrum'
    ]

    return Array.from({ length: params.limit || 20 }, (_, i) => {
      const company = mockCompanies[Math.floor(Math.random() * mockCompanies.length)]
      const title = mockTitles[Math.floor(Math.random() * mockTitles.length)]
      const location = mockLocations[Math.floor(Math.random() * mockLocations.length)]
      const jobSkills = mockSkills.slice(0, Math.floor(Math.random() * 6) + 3)
      
      return {
        id: `job_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`,
        title: title,
        company: company,
        location: location,
        type: ['Full-time', 'Part-time', 'Contract'][Math.floor(Math.random() * 3)],
        salary: Math.random() > 0.3 ? `$${Math.floor(Math.random() * 100 + 80)}k - $${Math.floor(Math.random() * 100 + 120)}k` : undefined,
        description: `We are looking for a talented ${title} to join our team at ${company}. You will work on exciting projects using cutting-edge technologies and collaborate with a dynamic team of professionals.`,
        requirements: [
          `3+ years of experience in ${jobSkills[0]}`,
          `Strong knowledge of ${jobSkills[1]} and ${jobSkills[2]}`,
          'Bachelor\'s degree in Computer Science or related field',
          'Excellent communication skills',
          'Experience with Agile development methodologies'
        ],
        skills: jobSkills,
        postedDate: `${Math.floor(Math.random() * 7) + 1} days ago`,
        source: 'Mock API',
        url: `https://example.com/jobs/${i}`,
        applied: false
      }
    })
  }

  async searchJobs(params: JobSearchParams): Promise<{ jobs: JobListing[], source: string }> {
    console.log('Searching jobs with params:', params)
    
    try {
      // Try multiple sources
      const results = await Promise.allSettled([
        this.searchHimalayas(params),
        this.searchAdzuna(params),
        this.generateMockJobsAsync(params) // Fallback mock data
      ])

      const allJobs: JobListing[] = []
      let sources: string[] = []

      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.jobs.length > 0) {
          allJobs.push(...result.value.jobs)
          sources.push(result.value.source)
        }
      })

      // If no real APIs worked, use mock data
      if (allJobs.length === 0) {
        const mockResult = await this.generateMockJobsAsync(params)
        allJobs.push(...mockResult.jobs)
        sources.push(mockResult.source)
      }

      // Remove duplicates and limit results
      const uniqueJobs = this.removeDuplicates(allJobs)
      const limitedJobs = uniqueJobs.slice(0, params.limit || 50)

      return {
        jobs: limitedJobs,
        source: sources.join(', ')
      }
    } catch (error) {
      console.error('Job search error:', error)
      // Fallback to mock data
      const mockResult = await this.generateMockJobsAsync(params)
      return mockResult
    }
  }

  private async generateMockJobsAsync(params: JobSearchParams): Promise<{ jobs: JobListing[], source: string }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    return {
      jobs: this.generateMockJobs(params),
      source: 'Mock Data'
    }
  }

  private async searchHimalayas(params: JobSearchParams): Promise<{ jobs: JobListing[], source: string }> {
    try {
      // Note: This would need CORS proxy in production
      const url = new URL('https://himalayas.app/api/jobs/search')
      if (params.query) url.searchParams.set('q', params.query)
      if (params.location) url.searchParams.set('location', params.location)
      
      const response = await this.fetchWithTimeout(url.toString())
      
      if (!response.ok) throw new Error('Himalayas API failed')
      
      const data = await response.json()
      
      const jobs: JobListing[] = (data.jobs || []).map((job: any) => ({
        id: `himalayas_${job.id}`,
        title: job.title,
        company: job.company?.name || 'Unknown Company',
        location: job.location || 'Remote',
        type: job.employment_type || 'Full-time',
        salary: job.salary_range,
        description: job.description || '',
        requirements: job.requirements || [],
        skills: job.skills || [],
        postedDate: new Date(job.created_at).toLocaleDateString(),
        source: 'Himalayas',
        url: job.url,
        applied: false
      }))

      return { jobs, source: 'Himalayas' }
    } catch (error) {
      console.warn('Himalayas API failed:', error)
      return { jobs: [], source: 'Himalayas (failed)' }
    }
  }

  private async searchAdzuna(params: JobSearchParams): Promise<{ jobs: JobListing[], source: string }> {
    try {
      // Note: Adzuna requires API key - using mock structure
      const jobs: JobListing[] = []
      return { jobs, source: 'Adzuna' }
    } catch (error) {
      console.warn('Adzuna API failed:', error)
      return { jobs: [], source: 'Adzuna (failed)' }
    }
  }

  private removeDuplicates(jobs: JobListing[]): JobListing[] {
    const seen = new Set()
    return jobs.filter(job => {
      const key = `${job.title}-${job.company}`.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

  // Schedule automatic job discovery
  async scheduleDiscovery(userProfile: any, intervalHours = 24): Promise<void> {
    const searchParams: JobSearchParams = {
      query: userProfile.preferredRoles?.[0] || 'developer',
      location: userProfile.preferredLocations?.[0] || 'remote',
      skills: userProfile.skills?.slice(0, 3) || [],
      limit: 50
    }

    // Store in localStorage for persistence
    localStorage.setItem('jobflow_auto_search', JSON.stringify({
      params: searchParams,
      nextRun: Date.now() + (intervalHours * 60 * 60 * 1000),
      enabled: true
    }))

    console.log('Scheduled automatic job discovery:', searchParams)
  }
}

export const jobDiscoveryService = new JobDiscoveryService()