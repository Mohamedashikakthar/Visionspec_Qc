"use client"

import { CheckCircle, XCircle, Zap, Activity } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  variant?: "default" | "success" | "danger" | "warning"
}

function StatCard({ title, value, subtitle, icon, variant = "default" }: StatCardProps) {
  const variants = {
    default: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    danger: "bg-destructive/10 text-destructive",
    warning: "bg-warning/10 text-warning",
  }

  return (
    <div className="card-professional p-4 sm:p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">{value}</p>
          {subtitle && (
            <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", variants[variant])}>
          {icon}
        </div>
      </div>
    </div>
  )
}

interface StatsCardsProps {
  totalInspections: number
  passCount: number
  defectCount: number
  avgProcessingTime: number
}

export function StatsCards({
  totalInspections,
  passCount,
  defectCount,
  avgProcessingTime,
}: StatsCardsProps) {
  const passRate = totalInspections > 0 ? (passCount / totalInspections) * 100 : 0
  const defectRate = totalInspections > 0 ? (defectCount / totalInspections) * 100 : 0

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Inspections"
        value={totalInspections}
        subtitle="Today"
        icon={<Activity className="h-5 w-5" />}
        variant="default"
      />
      <StatCard
        title="Pass Rate"
        value={`${passRate.toFixed(1)}%`}
        subtitle={`${passCount} passed`}
        icon={<CheckCircle className="h-5 w-5" />}
        variant="success"
      />
      <StatCard
        title="Defect Rate"
        value={`${defectRate.toFixed(1)}%`}
        subtitle={`${defectCount} defects`}
        icon={<XCircle className="h-5 w-5" />}
        variant="danger"
      />
      <StatCard
        title="Avg Processing"
        value={`${avgProcessingTime}ms`}
        subtitle="Per frame"
        icon={<Zap className="h-5 w-5" />}
        variant="warning"
      />
    </div>
  )
}
