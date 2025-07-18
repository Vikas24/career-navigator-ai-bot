import { StatsCard } from "@/components/dashboard/StatsCard"
import { JobCard } from "@/components/jobs/JobCard"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  FileText, 
  Send, 
  TrendingUp, 
  Users,
  Plus,
  Target,
  Clock,
  CheckCircle,
  ArrowRight
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function Dashboard() {
  const { toast } = useToast()

  const mockJobs = [
    {
      id: "1",
      title: "Senior Frontend Developer",
      company: "TechCorp",
      location: "Remote",
      type: "Full-time",
      salary: "$120k - $150k",
      postedDate: "2 days ago",
      description: "We're looking for a Senior Frontend Developer to join our team...",
      matchScore: 95,
      skills: ["React", "TypeScript", "Tailwind CSS", "Next.js"],
      applied: false
    },
    {
      id: "2", 
      title: "Full Stack Engineer",
      company: "StartupX",
      location: "San Francisco, CA",
      type: "Full-time",
      salary: "$140k - $180k",
      postedDate: "1 day ago",
      description: "Join our fast-growing startup as a Full Stack Engineer...",
      matchScore: 87,
      skills: ["Node.js", "React", "PostgreSQL", "AWS"],
      applied: true
    }
  ]

  const handleApply = (jobId: string) => {
    toast({
      title: "Application Submitted!",
      description: "Your tailored application has been sent successfully.",
    })
  }

  const handleViewDetails = (jobId: string) => {
    toast({
      title: "Job Details",
      description: "Opening detailed job information...",
    })
  }

  return (
    <div className="p-6 space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-hero rounded-3xl p-8 border border-border/50">
        <div className="absolute inset-0 bg-gradient-card opacity-50"></div>
        <div className="relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              Welcome to JobFlow AI
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Your intelligent job application assistant. We automatically discover, match, and apply to jobs that fit your profile.
            </p>
            <div className="flex gap-4">
              <Button variant="hero" size="lg" className="shadow-glow">
                <Plus className="w-5 h-5" />
                Upload Resume
              </Button>
              <Button variant="outline" size="lg">
                <Target className="w-5 h-5" />
                Set Preferences
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute top-4 right-4 w-32 h-32 bg-primary/10 rounded-full animate-float"></div>
        <div className="absolute bottom-4 right-12 w-20 h-20 bg-primary-glow/10 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Applications Sent"
          value="24"
          change="+12%"
          icon={Send}
          trend="up"
        />
        <StatsCard
          title="Responses Received"
          value="8"
          change="+25%"
          icon={FileText}
          trend="up"
        />
        <StatsCard
          title="Interview Requests"
          value="3"
          change="+50%"
          icon={Users}
          trend="up"
        />
        <StatsCard
          title="Success Rate"
          value="33%"
          change="+8%"
          icon={TrendingUp}
          trend="up"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Top Job Matches</h2>
            <Button variant="outline">
              View All
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="space-y-4">
            {mockJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onApply={handleApply}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="p-6 bg-gradient-card backdrop-blur-sm border-border/50">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="w-4 h-4" />
                Upload New Resume
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Target className="w-4 h-4" />
                Update Preferences
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="w-4 h-4" />
                View Applications
              </Button>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="p-6 bg-gradient-card backdrop-blur-sm border-border/50">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-success" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Application sent to TechCorp</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Target className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Found 5 new job matches</p>
                  <p className="text-xs text-muted-foreground">4 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-warning/10 rounded-full flex items-center justify-center">
                  <Clock className="w-4 h-4 text-warning" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Resume analysis completed</p>
                  <p className="text-xs text-muted-foreground">1 day ago</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}