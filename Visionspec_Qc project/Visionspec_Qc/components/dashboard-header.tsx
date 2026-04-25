"use client"

import { Cpu, Play, Square, RotateCcw } from "lucide-react"

interface DashboardHeaderProps {
  isLiveMode?: boolean
  onToggleLiveMode?: () => void
}

export function DashboardHeader({ isLiveMode = false, onToggleLiveMode }: DashboardHeaderProps) {
  const handleRefresh = () => {
    window.location.reload()
  }
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container-responsive flex h-16 items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Cpu className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">VisionSpec QC</h1>
            <p className="hidden text-xs text-muted-foreground sm:block">
              PCB Quality Control System
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            className="btn-secondary btn-refresh flex items-center gap-2 rounded-lg px-3 py-2 text-sm sm:px-4"
            title="Refresh Page"
          >
            <RotateCcw className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Mode Toggle */}
          {isLiveMode ? (
            <button
              onClick={onToggleLiveMode}
              className="btn-danger flex items-center gap-2 rounded-lg px-3 py-2 text-sm sm:px-4"
            >
              <Square className="h-4 w-4" />
              <span className="hidden sm:inline">End Live Demo</span>
              <span className="sm:hidden">Stop</span>
            </button>
          ) : (
            <button
              onClick={onToggleLiveMode}
              className="btn-success flex items-center gap-2 rounded-lg px-3 py-2 text-sm sm:px-4"
            >
              <Play className="h-4 w-4" />
              <span className="hidden sm:inline">Start Live Demo</span>
              <span className="sm:hidden">Live</span>
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
