import { StatsCard } from "@/components/dashboard/StatsCard"
import { JobCard } from "@/components/jobs/JobCard"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAppStore } from "@/store/appStore"
import { aiMatchingService } from "@/services/aiMatchingService"
import { jobDiscoveryService } from "@/services/jobDiscoveryService"
import { useEffect, useMemo } from "react"
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
  const { 
    profile, 
    jobs, 
    applications, 
    addApplication, 
    updateJob,
    addJobs,
    isSearching,
    setIsSearching 
  } = useAppStore()

  // Get top job matches using AI
  const topMatches = useMemo(() => {
    if (!profile || jobs.length === 0) return []
    return aiMatchingService.generateRecommendations(profile, jobs, 3)
  }, [profile, jobs])

  // Calculate statistics
  const stats = useMemo(() => {
    const totalApplications = applications.length
    const responses = applications.filter(app => app.responses.length > 0).length
    const interviews = applications.filter(app => 
      app.status === 'interview' || 
      app.responses.some(r => r.type === 'interview')
    ).length
    const successRate = totalApplications > 0 ? Math.round((responses / totalApplications) * 100) : 0

    return {
      applications: totalApplications,
      responses,
      interviews,
      successRate
    }
  }, [applications])

  // Auto-discover jobs on load if profile exists
  useEffect(() => {
    if (profile && jobs.length === 0 && !isSearching) {
      discoverJobs()
    }
  }, [profile])

  const discoverJobs = async () => {
    if (!profile) {
      toast({
        title: "Profile Required",
        description: "Please upload your resume first to discover relevant jobs.",
        variant: "destructive"
      })
      return
    }

    setIsSearching(true)
    try {
      const result = await jobDiscoveryService.searchJobs({
        query: profile.preferredRoles?.[0] || profile.skills?.[0] || 'developer',
        location: profile.preferredLocations?.[0] || 'remote',
        skills: profile.skills.slice(0, 3),
        limit: 20
      })

      if (result.jobs.length > 0) {
        addJobs(result.jobs)
        toast({
          title: "Jobs Discovered!",
          description: `Found ${result.jobs.length} relevant opportunities from ${result.source}`,
        })
      } else {
        toast({
          title: "No Jobs Found",
          description: "Try updating your skills or location preferences.",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Discovery Failed",
        description: "Unable to search for jobs. Please try again later.",
        variant: "destructive"
      })
    } finally {
      setIsSearching(false)
    }
  }

  const handleApply = async (jobId: string) => {
    const job = jobs.find(j => j.id === jobId)
    if (!job || !profile) return

    // Generate application
    const coverLetter = aiMatchingService.generateCoverLetter(profile, job)
    
    // Add to applications
    addApplication({
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      appliedAt: new Date(),
      status: 'applied',
      coverLetter,
      responses: []
    })

    // Update job status
    updateJob(jobId, { applied: true, appliedAt: new Date() })

    toast({
      title: "Application Submitted!",
      description: `Your tailored application to ${job.company} has been submitted.`,
    })
  }

  const handleViewDetails = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId)
    if (job?.url) {
      window.open(job.url, '_blank')
    } else {
      toast({
        title: "Job Details",
        description: "Opening detailed job information...",
      })
    }
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
              <Button variant="hero" size="lg" className="shadow-glow" onClick={discoverJobs} disabled={isSearching}>
                <Plus className="w-5 h-5" />
                {isSearching ? 'Discovering Jobs...' : 'Discover Jobs'}
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
          value={stats.applications.toString()}
          change={stats.applications > 0 ? "+12%" : "0%"}
          icon={Send}
          trend="up"
        />
        <StatsCard
          title="Responses Received"
          value={stats.responses.toString()}
          change={stats.responses > 0 ? "+25%" : "0%"}
          icon={FileText}
          trend="up"
        />
        <StatsCard
          title="Interview Requests"
          value={stats.interviews.toString()}
          change={stats.interviews > 0 ? "+50%" : "0%"}
          icon={Users}
          trend="up"
        />
        <StatsCard
          title="Success Rate"
          value={`${stats.successRate}%`}
          change={stats.successRate > 0 ? "+8%" : "0%"}
          icon={TrendingUp}
          trend={stats.successRate > 0 ? "up" : "neutral"}
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
            {topMatches.length > 0 ? (
              topMatches.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onApply={handleApply}
                  onViewDetails={handleViewDetails}
                />
              ))
            ) : (
              <Card className="p-8 text-center bg-gradient-card">
                <div className="space-y-4">
                  <Target className="w-12 h-12 mx-auto text-muted-foreground" />
                  <div>
                    <h3 className="text-lg font-medium">No Job Matches Yet</h3>
                    <p className="text-muted-foreground">
                      {!profile ? 'Upload your resume to get personalized job recommendations' : 'Click "Discover Jobs" to find relevant opportunities'}
                    </p>
                  </div>
                  {profile && (
                    <Button onClick={discoverJobs} disabled={isSearching}>
                      {isSearching ? 'Searching...' : 'Discover Jobs'}
                    </Button>
                  )}
                </div>
              </Card>
            )}
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