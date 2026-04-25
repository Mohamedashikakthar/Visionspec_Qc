"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

interface HeatmapOverlayProps {
  originalImage: string
  isDefect?: boolean
  defectType?: string
  showHeatmap?: boolean
}

// Generate deterministic random position based on defect type
function getDefectPosition(defectType?: string): { x: number; y: number } {
  const positions: Record<string, { x: number; y: number }> = {
    "Missing Component": { x: 0.3, y: 0.4 },
    "Solder Bridge": { x: 0.6, y: 0.3 },
    "Misalignment": { x: 0.5, y: 0.6 },
    "Scratch": { x: 0.4, y: 0.5 },
    "Open Circuit": { x: 0.7, y: 0.4 },
    "Short Circuit": { x: 0.35, y: 0.65 },
  }
  return positions[defectType || ""] || { x: 0.5, y: 0.5 }
}

export function HeatmapOverlay({
  originalImage,
  isDefect = false,
  defectType,
  showHeatmap: initialShowHeatmap = true,
}: HeatmapOverlayProps) {
  const [showHeatmap, setShowHeatmap] = useState(initialShowHeatmap)
  const [opacity, setOpacity] = useState(0.6)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 })
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Get defect position
  const defectPosition = useMemo(() => getDefectPosition(defectType), [defectType])

  // Generate heatmap on canvas when image loads
  useEffect(() => {
    if (!canvasRef.current || !imageLoaded || !isDefect) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const { width, height } = imageDimensions
    canvas.width = width
    canvas.height = height

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Create radial gradient for heatmap effect (Grad-CAM style)
    const centerX = width * defectPosition.x
    const centerY = height * defectPosition.y
    const radius = Math.min(width, height) * 0.35

    // Draw multiple gradient layers for realistic heatmap
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius)
    gradient.addColorStop(0, "rgba(255, 0, 0, 0.9)")
    gradient.addColorStop(0.3, "rgba(255, 100, 0, 0.7)")
    gradient.addColorStop(0.5, "rgba(255, 200, 0, 0.5)")
    gradient.addColorStop(0.7, "rgba(100, 255, 100, 0.3)")
    gradient.addColorStop(0.9, "rgba(0, 100, 255, 0.15)")
    gradient.addColorStop(1, "rgba(0, 0, 255, 0)")

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    // Add secondary hotspot for more realistic look
    const secondaryX = centerX + (Math.random() - 0.5) * radius * 0.5
    const secondaryY = centerY + (Math.random() - 0.5) * radius * 0.5
    const secondaryRadius = radius * 0.4

    const gradient2 = ctx.createRadialGradient(
      secondaryX,
      secondaryY,
      0,
      secondaryX,
      secondaryY,
      secondaryRadius
    )
    gradient2.addColorStop(0, "rgba(255, 50, 0, 0.6)")
    gradient2.addColorStop(0.5, "rgba(255, 150, 0, 0.3)")
    gradient2.addColorStop(1, "rgba(255, 200, 0, 0)")

    ctx.fillStyle = gradient2
    ctx.fillRect(0, 0, width, height)

  }, [imageLoaded, isDefect, imageDimensions, defectPosition])

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight })
    setImageLoaded(true)
  }

  return (
    <div className="space-y-4">
      <div 
        ref={containerRef}
        className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted"
      >
        {/* Original Image */}
        <img
          src={originalImage}
          alt="PCB inspection"
          className="h-full w-full object-contain"
          crossOrigin="anonymous"
          onLoad={handleImageLoad}
        />
        
        {/* Canvas Heatmap Overlay */}
        {isDefect && showHeatmap && imageLoaded && (
          <canvas
            ref={canvasRef}
            className="pointer-events-none absolute inset-0 h-full w-full object-contain mix-blend-screen"
            style={{ opacity }}
          />
        )}

        {/* Defect Marker */}
        {isDefect && showHeatmap && imageLoaded && (
          <div
            className="absolute flex items-center justify-center"
            style={{
              left: `${defectPosition.x * 100}%`,
              top: `${defectPosition.y * 100}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div className="animate-ping absolute h-8 w-8 rounded-full bg-red-500 opacity-50" />
            <div className="relative h-4 w-4 rounded-full border-2 border-white bg-red-500 shadow-lg" />
          </div>
        )}
        
        {/* Controls */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-lg bg-background/80 p-3 backdrop-blur-sm">
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              showHeatmap
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {showHeatmap ? (
              <>
                <Eye className="h-4 w-4" />
                Heatmap On
              </>
            ) : (
              <>
                <EyeOff className="h-4 w-4" />
                Heatmap Off
              </>
            )}
          </button>
          
          {showHeatmap && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Opacity</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={opacity}
                onChange={(e) => setOpacity(parseFloat(e.target.value))}
                className="h-2 w-24 cursor-pointer appearance-none rounded-lg bg-muted accent-primary"
              />
            </div>
          )}
        </div>

        {/* Status Badge */}
        <div className="absolute left-4 top-4">
          <span
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold",
              isDefect
                ? "bg-red-500/90 text-white"
                : "bg-green-500/90 text-white"
            )}
          >
            {isDefect ? `DEFECT: ${defectType}` : "PASS"}
          </span>
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-blue-500" />
          <span className="text-muted-foreground">Low attention</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-yellow-500" />
          <span className="text-muted-foreground">Medium</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-red-500" />
          <span className="text-muted-foreground">High attention (defect)</span>
        </div>
      </div>
    </div>
  )
}
