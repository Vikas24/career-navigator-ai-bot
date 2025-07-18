import { ResumeUpload } from "@/components/resume/ResumeUpload"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  FileText, 
  Download, 
  Eye, 
  Edit,
  Brain,
  Target,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { useState } from "react"

export default function ResumePage() {
  const [uploadProgress, setUploadProgress] = useState(0)
  const [hasResume, setHasResume] = useState(false)

  const handleUploadSuccess = (data: any) => {
    setHasResume(true)
    console.log("Resume data:", data)
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Resume Management</h1>
        <p className="text-muted-foreground">
          Upload and manage your resume for intelligent job matching and automated applications.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upload Section */}
        <div className="lg:col-span-2 space-y-6">
          <ResumeUpload onUploadSuccess={handleUploadSuccess} />
          
          {/* AI Processing Features */}
          <Card className="p-6 bg-gradient-card backdrop-blur-sm border-border/50">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">AI Processing Features</h3>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span className="text-sm font-medium">Skills Extraction</span>
                  </div>
                  <p className="text-xs text-muted-foreground pl-6">
                    Automatically identifies your technical and soft skills
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span className="text-sm font-medium">Experience Analysis</span>
                  </div>
                  <p className="text-xs text-muted-foreground pl-6">
                    Parses your work experience and achievements
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span className="text-sm font-medium">Role Matching</span>
                  </div>
                  <p className="text-xs text-muted-foreground pl-6">
                    Suggests suitable job titles and positions
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span className="text-sm font-medium">Keyword Optimization</span>
                  </div>
                  <p className="text-xs text-muted-foreground pl-6">
                    Optimizes your profile for ATS systems
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Current Resume Status */}
          <Card className="p-6 bg-gradient-card backdrop-blur-sm border-border/50">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Resume Status</h3>
              
              {hasResume ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-success" />
                    <span className="text-sm font-medium">Resume Active</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Profile Completeness</span>
                      <span className="font-medium">85%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Last updated:</span>
                      <span className="text-muted-foreground">Today</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Skills detected:</span>
                      <span className="text-primary font-medium">12</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Optimization score:</span>
                      <span className="text-success font-medium">Good</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 pt-2 border-t border-border/50">
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="w-4 h-4" />
                      Preview Resume
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      <Download className="w-4 h-4" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      <Edit className="w-4 h-4" />
                      Edit Profile
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-3">
                  <AlertCircle className="w-8 h-8 text-warning mx-auto" />
                  <div>
                    <p className="text-sm font-medium">No resume uploaded</p>
                    <p className="text-xs text-muted-foreground">
                      Upload your resume to get started with AI-powered job matching
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Tips */}
          <Card className="p-6 bg-gradient-card backdrop-blur-sm border-border/50">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Optimization Tips</h3>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p>Use PDF format for best parsing results</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p>Include specific technical skills and tools</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p>Quantify achievements with numbers</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p>Use standard section headings</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}