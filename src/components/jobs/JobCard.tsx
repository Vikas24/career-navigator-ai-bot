import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { 
  MapPin, 
  Building2, 
  Clock, 
  DollarSign,
  Star,
  ExternalLink,
  Send
} from "lucide-react"

interface JobCardProps {
  job: {
    id: string
    title: string
    company: string
    location: string
    type: string
    salary?: string
    postedDate: string
    description: string
    matchScore?: number
    skills: string[]
    applied?: boolean
    appliedAt?: Date
  }
  onApply?: (jobId: string) => void
  onViewDetails?: (jobId: string) => void
}

export function JobCard({ job, onApply, onViewDetails }: JobCardProps) {
  const getMatchColor = (score: number = 0) => {
    if (score >= 90) return "text-success border-success/20 bg-success/10"
    if (score >= 70) return "text-warning border-warning/20 bg-warning/10" 
    return "text-muted-foreground border-border bg-muted/50"
  }

  return (
    <Card className="p-6 bg-gradient-card backdrop-blur-sm border-border/50 hover:shadow-elegant transition-all duration-300 hover:scale-[1.02] group">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
              {job.title}
            </h3>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Building2 className="w-4 h-4" />
                <span>{job.company}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{job.postedDate}</span>
              </div>
            </div>
          </div>
          
          <div className={cn(
            "px-2 py-1 rounded-lg border text-xs font-medium flex items-center gap-1",
            getMatchColor(job.matchScore || 0)
          )}>
            <Star className="w-3 h-3" />
            <span>{job.matchScore || 0}% match</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {job.description}
        </p>

        {/* Skills */}
        <div className="flex flex-wrap gap-2">
          {job.skills.slice(0, 4).map((skill) => (
            <Badge key={skill} variant="secondary" className="text-xs">
              {skill}
            </Badge>
          ))}
          {job.skills.length > 4 && (
            <Badge variant="outline" className="text-xs">
              +{job.skills.length - 4} more
            </Badge>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-xs">
              {job.type}
            </Badge>
            {job.salary && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <DollarSign className="w-4 h-4" />
                <span>{job.salary}</span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails?.(job.id)}
              className="text-xs"
            >
              <ExternalLink className="w-3 h-3" />
              View
            </Button>
            <Button
              variant={job.applied ? "secondary" : "hero"}
              size="sm"
              onClick={() => onApply?.(job.id)}
              disabled={job.applied}
              className="text-xs"
            >
              {job.applied ? (
                "Applied"
              ) : (
                <>
                  <Send className="w-3 h-3" />
                  Apply
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}