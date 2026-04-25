"use client"

import { CheckCircle, XCircle, AlertTriangle, Clock, ChevronRight, History } from "lucide-react"
import { cn } from "@/lib/utils"
import type { InspectionStatus } from "./inspection-result"

export interface InspectionRecord {
  id: string
  timestamp: Date
  status: InspectionStatus
  confidence: number
  processingTime: number
  defectType?: string
  imageThumbnail?: string
}

interface InspectionHistoryProps {
  records: InspectionRecord[]
  onSelectRecord?: (record: InspectionRecord) => void
}

const statusIcons = {
  pass: CheckCircle,
  defect: XCircle,
  warning: AlertTriangle,
  pending: Clock,
}

const statusStyles = {
  pass: { color: "text-success", bg: "bg-success/10" },
  defect: { color: "text-destructive", bg: "bg-destructive/10" },
  warning: { color: "text-warning", bg: "bg-warning/10" },
  pending: { color: "text-muted-foreground", bg: "bg-muted" },
}

export function InspectionHistory({ records, onSelectRecord }: InspectionHistoryProps) {
  if (records.length === 0) {
    return (
      <div className="card-professional flex flex-col items-center justify-center p-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <History className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="mt-3 font-medium text-foreground">No inspections yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload a PCB image to start
        </p>
      </div>
    )
  }

  return (
    <div className="card-professional overflow-hidden">
      <div className="border-b border-border px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-medium text-foreground">Inspection History</h3>
          <span className="ml-auto badge-info">{records.length}</span>
        </div>
      </div>
      <div className="max-h-[400px] overflow-y-auto">
        {records.map((record, index) => {
          const Icon = statusIcons[record.status]
          const style = statusStyles[record.status]
          return (
            <button
              key={record.id}
              onClick={() => onSelectRecord?.(record)}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 sm:px-5",
                index !== records.length - 1 && "border-b border-border"
              )}
            >
              {record.imageThumbnail ? (
                <img
                  src={record.imageThumbnail}
                  alt="PCB"
                  className="h-10 w-10 rounded-md bg-muted object-cover"
                  crossOrigin="anonymous"
                />
              ) : (
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-md", style.bg)}>
                  <Icon className={cn("h-5 w-5", style.color)} />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium uppercase",
                    style.bg,
                    style.color
                  )}>
                    <Icon className="h-3 w-3" />
                    {record.status}
                  </span>
                  <span className="text-xs font-medium text-primary">
                    {record.confidence.toFixed(1)}%
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{record.timestamp.toLocaleTimeString()}</span>
                  <span>{record.processingTime}ms</span>
                  {record.defectType && (
                    <span className="truncate text-destructive">{record.defectType}</span>
                  )}
                </div>
              </div>
              <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
            </button>
          )
        })}
      </div>
    </div>
  )
}
