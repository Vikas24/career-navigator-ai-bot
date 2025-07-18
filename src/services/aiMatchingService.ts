import { UserProfile, JobListing } from '@/store/appStore'

// Simple client-side AI matching using keyword similarity
class AIMatchingService {
  // Extract skills and keywords from text
  private extractKeywords(text: string): string[] {
    const commonWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 
      'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had',
      'will', 'would', 'could', 'should', 'may', 'might', 'can', 'must', 'shall'
    ])

    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !commonWords.has(word))
      .filter((word, index, arr) => arr.indexOf(word) === index) // unique
  }

  // Calculate similarity between two text arrays
  private calculateSimilarity(userKeywords: string[], jobKeywords: string[]): number {
    if (userKeywords.length === 0 || jobKeywords.length === 0) return 0

    const userSet = new Set(userKeywords.map(k => k.toLowerCase()))
    const jobSet = new Set(jobKeywords.map(k => k.toLowerCase()))
    
    const intersection = new Set([...userSet].filter(x => jobSet.has(x)))
    const union = new Set([...userSet, ...jobSet])
    
    return intersection.size / union.size
  }

  // Calculate job match score
  calculateJobMatch(userProfile: UserProfile, job: JobListing): number {
    let totalScore = 0
    let weights = 0

    // Skills matching (40% weight)
    if (userProfile.skills.length > 0 && job.skills.length > 0) {
      const skillsScore = this.calculateSimilarity(userProfile.skills, job.skills)
      totalScore += skillsScore * 0.4
      weights += 0.4
    }

    // Role/title matching (30% weight)
    if (userProfile.preferredRoles.length > 0) {
      const roleKeywords = userProfile.preferredRoles.flatMap(role => 
        this.extractKeywords(role)
      )
      const jobTitleKeywords = this.extractKeywords(job.title)
      const roleScore = this.calculateSimilarity(roleKeywords, jobTitleKeywords)
      totalScore += roleScore * 0.3
      weights += 0.3
    }

    // Location matching (15% weight)
    if (userProfile.preferredLocations.length > 0) {
      const locationMatch = userProfile.preferredLocations.some(loc => 
        job.location.toLowerCase().includes(loc.toLowerCase()) ||
        loc.toLowerCase().includes('remote') && job.location.toLowerCase().includes('remote')
      )
      totalScore += (locationMatch ? 1 : 0) * 0.15
      weights += 0.15
    }

    // Experience level matching (15% weight)
    const userExperienceKeywords = this.extractKeywords(userProfile.experience)
    const jobRequirementKeywords = job.requirements.flatMap(req => 
      this.extractKeywords(req)
    )
    if (userExperienceKeywords.length > 0 && jobRequirementKeywords.length > 0) {
      const expScore = this.calculateSimilarity(userExperienceKeywords, jobRequirementKeywords)
      totalScore += expScore * 0.15
      weights += 0.15
    }

    // Normalize score
    const finalScore = weights > 0 ? (totalScore / weights) : 0
    return Math.round(finalScore * 100)
  }

  // Rank jobs by match score
  rankJobs(userProfile: UserProfile, jobs: JobListing[]): JobListing[] {
    return jobs
      .map(job => ({
        ...job,
        matchScore: this.calculateJobMatch(userProfile, job)
      }))
      .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
  }

  // Generate personalized job recommendations
  generateRecommendations(userProfile: UserProfile, jobs: JobListing[], limit = 10): JobListing[] {
    const rankedJobs = this.rankJobs(userProfile, jobs)
    
    // Filter for high-quality matches (>50% score)
    const highQualityMatches = rankedJobs.filter(job => (job.matchScore || 0) >= 50)
    
    return highQualityMatches.slice(0, limit)
  }

  // Analyze user profile completeness
  analyzeProfileCompleteness(profile: UserProfile): {
    score: number
    missing: string[]
    suggestions: string[]
  } {
    const checks = [
      { field: 'name', weight: 5, label: 'Full name' },
      { field: 'email', weight: 10, label: 'Email address' },
      { field: 'phone', weight: 5, label: 'Phone number' },
      { field: 'location', weight: 10, label: 'Location preference' },
      { field: 'skills', weight: 25, label: 'Skills list' },
      { field: 'experience', weight: 20, label: 'Experience description' },
      { field: 'education', weight: 10, label: 'Education background' },
      { field: 'preferredRoles', weight: 15, label: 'Preferred job roles' },
    ]

    let totalWeight = 0
    let achievedWeight = 0
    const missing: string[] = []
    const suggestions: string[] = []

    checks.forEach(check => {
      totalWeight += check.weight
      const value = profile[check.field as keyof UserProfile]
      
      if (Array.isArray(value) ? value.length > 0 : Boolean(value)) {
        achievedWeight += check.weight
      } else {
        missing.push(check.label)
      }
    })

    // Generate suggestions based on missing fields
    if (profile.skills.length < 5) {
      suggestions.push('Add more technical skills to improve job matching')
    }
    if (!profile.resumeText) {
      suggestions.push('Upload your resume for automated parsing')
    }
    if (profile.preferredRoles.length < 2) {
      suggestions.push('Add multiple job role preferences')
    }

    const score = Math.round((achievedWeight / totalWeight) * 100)

    return { score, missing, suggestions }
  }

  // Generate customized cover letter
  generateCoverLetter(userProfile: UserProfile, job: JobListing): string {
    const template = `Dear Hiring Manager,

I am writing to express my interest in the ${job.title} position at ${job.company}. With my background in ${userProfile.experience}, I am excited about the opportunity to contribute to your team.

My key qualifications include:
${userProfile.skills.slice(0, 5).map(skill => `• Proficiency in ${skill}`).join('\n')}

I am particularly drawn to this role because ${job.location.includes('Remote') ? 'of the remote work flexibility' : `it's located in ${job.location}`}, and I believe my skills in ${userProfile.skills.slice(0, 3).join(', ')} align well with your requirements.

I would welcome the opportunity to discuss how my experience can benefit ${job.company}. Thank you for your consideration.

Best regards,
${userProfile.name || 'Job Seeker'}`

    return template
  }
}

export const aiMatchingService = new AIMatchingService()