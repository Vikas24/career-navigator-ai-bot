import { UserProfile } from '@/store/appStore'

// Types for different document formats
interface ParsedContent {
  text: string
  skills: string[]
  experience: string
  education: string[]
  contact: {
    name?: string
    email?: string
    phone?: string
    location?: string
  }
  sections: {
    [key: string]: string
  }
}

class ResumeParsingService {
  private skillKeywords = [
    // Programming Languages
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin',
    // Frontend
    'react', 'vue', 'angular', 'html', 'css', 'sass', 'less', 'tailwind', 'bootstrap', 'jquery',
    // Backend
    'node.js', 'express', 'django', 'flask', 'spring', 'laravel', 'rails', 'asp.net',
    // Databases
    'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'sqlite', 'oracle',
    // Cloud & DevOps
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'github actions', 'terraform',
    // Tools & Technologies
    'git', 'webpack', 'babel', 'jest', 'cypress', 'graphql', 'rest api', 'microservices',
    // Methodologies
    'agile', 'scrum', 'kanban', 'tdd', 'ci/cd', 'devops'
  ]

  // Parse PDF files
  private async parsePDF(file: File): Promise<string> {
    try {
      // Note: pdf-parse requires Node.js environment
      // For browser use, we'll use a simplified text extraction
      const arrayBuffer = await file.arrayBuffer()
      const text = await this.extractTextFromPDF(arrayBuffer)
      return text
    } catch (error) {
      console.error('PDF parsing failed:', error)
      throw new Error('Failed to parse PDF. Please try uploading a Word document instead.')
    }
  }

  // Simplified PDF text extraction (fallback)
  private async extractTextFromPDF(arrayBuffer: ArrayBuffer): Promise<string> {
    // This is a simplified approach - in production you'd use pdf-parse or similar
    const uint8Array = new Uint8Array(arrayBuffer)
    const text = new TextDecoder().decode(uint8Array)
    
    // Extract readable text (very basic approach)
    const textMatch = text.match(/stream\s*(.*?)\s*endstream/gs)
    if (textMatch) {
      return textMatch.join(' ').replace(/[^\w\s@.-]/g, ' ').replace(/\s+/g, ' ')
    }
    
    throw new Error('Could not extract text from PDF')
  }

  // Parse Word documents
  private async parseWord(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer()
      
      // For .docx files (mammoth only works with .docx)
      if (file.name.toLowerCase().endsWith('.docx')) {
        const mammoth = await import('mammoth')
        const result = await mammoth.extractRawText({ arrayBuffer })
        return result.value
      } else {
        // For .doc files, basic extraction
        const uint8Array = new Uint8Array(arrayBuffer)
        const text = new TextDecoder('utf-8', { fatal: false }).decode(uint8Array)
        return this.cleanWordText(text)
      }
    } catch (error) {
      console.error('Word parsing failed:', error)
      throw new Error('Failed to parse Word document')
    }
  }

  private cleanWordText(rawText: string): string {
    return rawText
      .replace(/[^\w\s@.-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  }

  // Extract skills from text
  private extractSkills(text: string): string[] {
    const textLower = text.toLowerCase()
    const foundSkills: string[] = []

    this.skillKeywords.forEach(skill => {
      const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
      if (regex.test(textLower)) {
        foundSkills.push(skill.charAt(0).toUpperCase() + skill.slice(1))
      }
    })

    // Also look for technical terms in uppercase
    const upperCaseSkills = text.match(/\b[A-Z]{2,}\b/g) || []
    const validUpperCase = upperCaseSkills.filter(skill => 
      skill.length <= 10 && !['THE', 'AND', 'FOR', 'ARE', 'YOU'].includes(skill)
    )

    return [...new Set([...foundSkills, ...validUpperCase])]
  }

  // Extract contact information
  private extractContact(text: string): ParsedContent['contact'] {
    const contact: ParsedContent['contact'] = {}

    // Email
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g)
    if (emailMatch) {
      contact.email = emailMatch[0]
    }

    // Phone
    const phoneMatch = text.match(/(\+?1?[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g)
    if (phoneMatch) {
      contact.phone = phoneMatch[0]
    }

    // Name (first line that looks like a name)
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
    for (const line of lines.slice(0, 5)) {
      if (line.match(/^[A-Z][a-z]+ [A-Z][a-z]+/) && line.length < 50 && !line.includes('@')) {
        contact.name = line
        break
      }
    }

    return contact
  }

  // Extract experience section
  private extractExperience(text: string): string {
    const experienceKeywords = ['experience', 'work history', 'employment', 'professional', 'career']
    const sections = this.splitIntoSections(text)
    
    for (const keyword of experienceKeywords) {
      for (const [sectionName, content] of Object.entries(sections)) {
        if (sectionName.toLowerCase().includes(keyword)) {
          return content.slice(0, 500) // Limit length
        }
      }
    }

    // Fallback: look for date patterns indicating work experience
    const datePattern = /\b(19|20)\d{2}\b.*?(?=\b(19|20)\d{2}\b|\n\n|$)/gs
    const dateMatches = text.match(datePattern)
    if (dateMatches && dateMatches.length > 0) {
      return dateMatches.slice(0, 3).join('\n').slice(0, 500)
    }

    return 'Experience details will be extracted from your resume.'
  }

  // Extract education section
  private extractEducation(text: string): string[] {
    const educationKeywords = ['education', 'academic', 'university', 'college', 'school', 'degree']
    const sections = this.splitIntoSections(text)
    
    for (const keyword of educationKeywords) {
      for (const [sectionName, content] of Object.entries(sections)) {
        if (sectionName.toLowerCase().includes(keyword)) {
          return content.split('\n').filter(line => line.trim().length > 10).slice(0, 3)
        }
      }
    }

    // Look for degree keywords
    const degreePattern = /(bachelor|master|phd|doctorate|associate|diploma|certificate).*?(computer science|engineering|business|marketing|design)/gi
    const degreeMatches = text.match(degreePattern)
    if (degreeMatches) {
      return degreeMatches.slice(0, 3)
    }

    return ['Education details extracted from resume']
  }

  // Split text into sections
  private splitIntoSections(text: string): Record<string, string> {
    const sections: Record<string, string> = {}
    const sectionHeaders = [
      'summary', 'objective', 'experience', 'work', 'employment', 'education', 
      'skills', 'projects', 'achievements', 'certifications', 'awards'
    ]

    const lines = text.split('\n')
    let currentSection = 'general'
    let currentContent: string[] = []

    for (const line of lines) {
      const lineLower = line.toLowerCase().trim()
      
      // Check if this line is a section header
      const isHeader = sectionHeaders.some(header => 
        lineLower.includes(header) && line.length < 50
      )

      if (isHeader) {
        // Save previous section
        if (currentContent.length > 0) {
          sections[currentSection] = currentContent.join('\n').trim()
        }
        
        // Start new section
        currentSection = lineLower
        currentContent = []
      } else {
        currentContent.push(line)
      }
    }

    // Save final section
    if (currentContent.length > 0) {
      sections[currentSection] = currentContent.join('\n').trim()
    }

    return sections
  }

  // Main parsing function
  async parseResume(file: File): Promise<ParsedContent> {
    console.log('Starting resume parsing for:', file.name)
    
    let text: string
    
    try {
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        text = await this.parsePDF(file)
      } else if (
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.type === 'application/msword' ||
        file.name.toLowerCase().endsWith('.docx') ||
        file.name.toLowerCase().endsWith('.doc')
      ) {
        text = await this.parseWord(file)
      } else {
        throw new Error('Unsupported file type. Please upload PDF or Word documents.')
      }

      // Extract structured information
      const skills = this.extractSkills(text)
      const contact = this.extractContact(text)
      const experience = this.extractExperience(text)
      const education = this.extractEducation(text)
      const sections = this.splitIntoSections(text)

      console.log('Resume parsing completed successfully')

      return {
        text,
        skills,
        experience,
        education,
        contact,
        sections
      }
    } catch (error) {
      console.error('Resume parsing failed:', error)
      throw error
    }
  }

  // Convert parsed content to user profile
  createProfileFromResume(parsedContent: ParsedContent): Partial<UserProfile> {
    return {
      name: parsedContent.contact.name,
      email: parsedContent.contact.email,
      phone: parsedContent.contact.phone,
      location: parsedContent.contact.location,
      skills: parsedContent.skills,
      experience: parsedContent.experience,
      education: parsedContent.education,
      resumeText: parsedContent.text,
      updatedAt: new Date()
    }
  }
}

export const resumeParsingService = new ResumeParsingService()