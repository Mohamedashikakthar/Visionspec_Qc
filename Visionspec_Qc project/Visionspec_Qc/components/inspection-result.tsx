"use client"

import { CheckCircle, XCircle, AlertTriangle, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

export type InspectionStatus = "pass" | "defect" | "warning" | "pending"

interface InspectionResultProps {
  status: InspectionStatus
  confidence: number
  processingTime?: number
  defectType?: string
}

const statusConfig = {
  pass: {
    icon: CheckCircle,
    label: "PASS",
    color: "text-success",
    bgColor: "bg-success/10",
    borderColor: "border-success/20",
    barColor: "bg-success",
  },
  defect: {
    icon: XCircle,
    label: "DEFECT",
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    borderColor: "border-destructive/20",
    barColor: "bg-destructive",
  },
  warning: {
    icon: AlertTriangle,
    label: "WARNING",
    color: "text-warning",
    bgColor: "bg-warning/10",
    borderColor: "border-warning/20",
    barColor: "bg-warning",
  },
  pending: {
    icon: Clock,
    label: "PENDING",
    color: "text-muted-foreground",
    bgColor: "bg-muted",
    borderColor: "border-border",
    barColor: "bg-muted-foreground",
  },
}

export function InspectionResult({
  status,
  confidence,
  processingTime,
  defectType,
}: InspectionResultProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <div className={cn("card-professional overflow-hidden border", config.borderColor)}>
      <div className={cn("p-4 sm:p-6", config.bgColor)}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("flex h-12 w-12 items-center justify-center rounded-lg", config.bgColor)}>
              <Icon className={cn("h-7 w-7", config.color)} />
            </div>
            <div>
              <p className={cn("text-xl font-bold", config.color)}>
                {config.label}
              </p>
              {defectType && status === "defect" && (
                <p className="text-sm text-muted-foreground">
                  Type: <span className="font-medium text-destructive">{defectType}</span>
                </p>
              )}
            </div>
          </div>
          
          <div className="text-left sm:text-right">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Confidence
            </p>
            <p className={cn("text-3xl font-bold", config.color)}>
              {confidence.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Confidence Bar */}
      <div className="h-1.5 w-full bg-muted">
        <div 
          className={cn("h-full transition-all duration-500", config.barColor)}
          style={{ width: `${confidence}%` }}
        />
      </div>

      {/* Processing Time */}
      {processingTime && (
        <div className="flex items-center justify-between border-t border-border px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Processing time</span>
          </div>
          <span className="font-medium text-foreground">{processingTime}ms</span>
        </div>
      )}
    </div>
  )
}
