import { useState, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
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
    if (!file.type.includes('pdf') && !file.type.includes('doc')) {
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

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 200)

    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock analysis result
      const mockResult = {
        skills: [
          "JavaScript", "React", "TypeScript", "Node.js", "Python",
          "AWS", "Docker", "Git", "MongoDB", "PostgreSQL"
        ],
        experience: "5+ years",
        education: "Bachelor's in Computer Science",
        roles: ["Full Stack Developer", "Frontend Developer", "Software Engineer"],
        locations: ["Remote", "San Francisco", "New York"],
        summary: "Experienced full-stack developer with expertise in modern web technologies and cloud platforms."
      }
      
      setProgress(100)
      setAnalysisResult(mockResult)
      onUploadSuccess?.(mockResult)
      
      toast({
        title: "Resume analyzed successfully!",
        description: "Your profile has been updated with extracted information.",
      })
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "There was an error processing your resume.",
        variant: "destructive"
      })
    } finally {
      setUploading(false)
      clearInterval(progressInterval)
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
                <h4 className="font-medium text-sm">Skills Detected</h4>
                <div className="flex flex-wrap gap-1">
                  {analysisResult.skills.slice(0, 6).map((skill: string) => (
                    <span 
                      key={skill}
                      className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Experience Level</h4>
                <p className="text-sm text-muted-foreground">{analysisResult.experience}</p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Preferred Roles</h4>
                <div className="flex flex-wrap gap-1">
                  {analysisResult.roles.map((role: string) => (
                    <span 
                      key={role}
                      className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-md"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Locations</h4>
                <div className="flex flex-wrap gap-1">
                  {analysisResult.locations.map((location: string) => (
                    <span 
                      key={location}
                      className="px-2 py-1 bg-accent text-accent-foreground text-xs rounded-md"
                    >
                      {location}
                    </span>
                  ))}
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