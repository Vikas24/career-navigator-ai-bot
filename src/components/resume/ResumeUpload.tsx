import { useState, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { resumeParsingService } from "@/services/resumeParsingService"
import { useAppStore } from "@/store/appStore"
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Download,
  Eye
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ResumeUploadProps {
  onUploadSuccess?: (data: any) => void
}

export function ResumeUpload({ onUploadSuccess }: ResumeUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const { toast } = useToast()
  const { profile, setProfile, updateProfile } = useAppStore()

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFileUpload(files[0])
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      handleFileUpload(files[0])
    }
  }

  const handleFileUpload = async (file: File) => {
    if (!file.type.includes('pdf') && !file.type.includes('doc') && !file.name.match(/\.(pdf|doc|docx)$/i)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or Word document",
        variant: "destructive"
      })
      return
    }

    setUploading(true)
    setUploadedFile(file)
    setProgress(0)

    try {
      console.log('Starting file upload and parsing...')
      
      // Update progress as we parse
      setProgress(20)
      
      // Parse the resume using our service
      const parsedContent = await resumeParsingService.parseResume(file)
      setProgress(60)
      
      // Create profile from parsed content
      const profileUpdates = resumeParsingService.createProfileFromResume(parsedContent)
      setProgress(80)
      
      // Update the global store
      if (profile) {
        updateProfile({
          ...profileUpdates,
          resumeFile: file
        })
      } else {
        setProfile({
          id: `user_${Date.now()}`,
          skills: [],
          experience: '',
          education: [],
          preferredRoles: [],
          preferredLocations: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          ...profileUpdates,
          resumeFile: file
        })
      }
      
      setProgress(100)
      setAnalysisResult({
        skills: parsedContent.skills,
        experience: parsedContent.experience,
        education: parsedContent.education,
        contact: parsedContent.contact,
        sections: Object.keys(parsedContent.sections)
      })
      
      onUploadSuccess?.(parsedContent)
      
      toast({
        title: "Resume analyzed successfully!",
        description: `Extracted ${parsedContent.skills.length} skills and profile information.`,
      })
      
    } catch (error) {
      console.error('Resume upload/parsing error:', error)
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "There was an error processing your resume.",
        variant: "destructive"
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card 
        className={cn(
          "relative border-2 border-dashed transition-all duration-300 cursor-pointer",
          dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
          uploading && "pointer-events-none"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />
        
        <div className="p-8 text-center space-y-4">
          {uploading ? (
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center animate-pulse-glow">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-medium">Analyzing your resume...</p>
                <p className="text-sm text-muted-foreground">
                  Our AI is extracting skills, experience, and preferences
                </p>
                <Progress value={progress} className="max-w-xs mx-auto" />
              </div>
            </div>
          ) : uploadedFile ? (
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-success/10 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <div>
                <p className="text-lg font-medium">Resume uploaded successfully!</p>
                <p className="text-sm text-muted-foreground">{uploadedFile.name}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="text-lg font-medium">Upload your resume</p>
                <p className="text-sm text-muted-foreground">
                  Drag and drop your resume here, or click to browse
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Supports PDF, DOC, DOCX (max 10MB)
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Analysis Results */}
      {analysisResult && (
        <Card className="p-6 bg-gradient-card backdrop-blur-sm border-border/50">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-success" />
              <h3 className="text-lg font-semibold">Profile Analysis</h3>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Skills Detected ({analysisResult.skills?.length || 0})</h4>
                <div className="flex flex-wrap gap-1">
                  {(analysisResult.skills || []).slice(0, 8).map((skill: string) => (
                    <span 
                      key={skill}
                      className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md"
                    >
                      {skill}
                    </span>
                  ))}
                  {(analysisResult.skills || []).length > 8 && (
                    <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md">
                      +{analysisResult.skills.length - 8} more
                    </span>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Contact Information</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  {analysisResult.contact?.name && (
                    <p>Name: {analysisResult.contact.name}</p>
                  )}
                  {analysisResult.contact?.email && (
                    <p>Email: {analysisResult.contact.email}</p>
                  )}
                  {analysisResult.contact?.phone && (
                    <p>Phone: {analysisResult.contact.phone}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Sections Found</h4>
                <div className="flex flex-wrap gap-1">
                  {(analysisResult.sections || []).map((section: string) => (
                    <span 
                      key={section}
                      className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-md capitalize"
                    >
                      {section}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Education</h4>
                <div className="text-sm text-muted-foreground">
                  {analysisResult.education?.length > 0 ? (
                    analysisResult.education.slice(0, 2).map((edu: string, idx: number) => (
                      <p key={idx} className="truncate">{edu}</p>
                    ))
                  ) : (
                    <p>Education details extracted</p>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border/50">
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4" />
                  Preview Profile
                </Button>
                <Button variant="secondary" size="sm">
                  <Download className="w-4 h-4" />
                  Export Data
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}