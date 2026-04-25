"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Camera, CameraOff, Play, Pause, AlertCircle } from "lucide-react"
import type { InspectionStatus } from "./inspection-result"

interface LiveCameraFeedProps {
  isActive: boolean
  onInspectionResult: (result: {
    status: InspectionStatus
    confidence: number
    processingTime: number
    defectType?: string
    imageSnapshot: string
  }) => void
}

const DEFECT_TYPES = [
  "Missing Component",
  "Solder Bridge",
  "Misalignment",
  "Scratch",
  "Open Circuit",
  "Short Circuit",
]

// Sample PCB images for simulation (using placeholder patterns)
const SAMPLE_PCB_COLORS = [
  "#1a5f2a", // Green PCB
  "#2d5a27",
  "#1e6b2f",
  "#24723a",
  "#195525",
]

export function LiveCameraFeed({ isActive, onInspectionResult }: LiveCameraFeedProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [fps, setFps] = useState(0)
  const [frameCount, setFrameCount] = useState(0)
  const [lastResult, setLastResult] = useState<{
    status: InspectionStatus
    confidence: number
  } | null>(null)
  const animationRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number>(0)
  const fpsCounterRef = useRef<number>(0)
  const lastFpsUpdateRef = useRef<number>(0)

  // Generate simulated PCB pattern on canvas
  const drawPCBFrame = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
    // Background - green PCB color
    const bgColorIndex = Math.floor((time / 2000) % SAMPLE_PCB_COLORS.length)
    ctx.fillStyle = SAMPLE_PCB_COLORS[bgColorIndex]
    ctx.fillRect(0, 0, width, height)

    // Add slight noise/texture
    for (let i = 0; i < 500; i++) {
      const x = Math.random() * width
      const y = Math.random() * height
      ctx.fillStyle = `rgba(0, 0, 0, ${Math.random() * 0.1})`
      ctx.fillRect(x, y, 1, 1)
    }

    // Draw circuit traces
    ctx.strokeStyle = "#c0a050"
    ctx.lineWidth = 2
    
    // Horizontal traces
    for (let i = 0; i < 8; i++) {
      const y = 30 + i * 40 + Math.sin(time / 1000 + i) * 2
      ctx.beginPath()
      ctx.moveTo(20, y)
      ctx.lineTo(width - 20, y)
      ctx.stroke()
    }

    // Vertical traces
    for (let i = 0; i < 10; i++) {
      const x = 40 + i * 50 + Math.cos(time / 1200 + i) * 2
      ctx.beginPath()
      ctx.moveTo(x, 20)
      ctx.lineTo(x, height - 20)
      ctx.stroke()
    }

    // Draw components (rectangles and circles)
    const components = [
      { x: 60, y: 60, w: 40, h: 25, type: "chip" },
      { x: 150, y: 100, w: 30, h: 30, type: "chip" },
      { x: 250, y: 80, w: 50, h: 20, type: "chip" },
      { x: 350, y: 120, w: 35, h: 35, type: "chip" },
      { x: 100, y: 200, w: 25, h: 25, type: "chip" },
      { x: 200, y: 180, w: 45, h: 30, type: "chip" },
      { x: 320, y: 220, w: 40, h: 20, type: "chip" },
      { x: 420, y: 160, w: 30, h: 30, type: "chip" },
    ]

    components.forEach((comp, i) => {
      const shimmer = Math.sin(time / 500 + i) * 0.1 + 0.9
      
      // Component body
      ctx.fillStyle = `rgba(20, 20, 20, ${shimmer})`
      ctx.fillRect(comp.x, comp.y, comp.w, comp.h)
      
      // Component pins
      ctx.fillStyle = "#silver"
      const pinCount = Math.floor(comp.w / 8)
      for (let p = 0; p < pinCount; p++) {
        ctx.fillStyle = "#a0a0a0"
        ctx.fillRect(comp.x + 4 + p * 8, comp.y - 4, 4, 4)
        ctx.fillRect(comp.x + 4 + p * 8, comp.y + comp.h, 4, 4)
      }
    })

    // Draw solder points
    for (let i = 0; i < 12; i++) {
      for (let j = 0; j < 8; j++) {
        const x = 50 + i * 40
        const y = 50 + j * 35
        ctx.beginPath()
        ctx.arc(x, y, 3, 0, Math.PI * 2)
        ctx.fillStyle = "#c0c0c0"
        ctx.fill()
      }
    }

    // Simulate potential defect area (randomly appears)
    const showDefect = Math.sin(time / 3000) > 0.7
    if (showDefect) {
      const defectX = 200 + Math.sin(time / 2000) * 50
      const defectY = 150 + Math.cos(time / 2500) * 30
      
      // Red highlight for defect area
      ctx.strokeStyle = "rgba(255, 0, 0, 0.8)"
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      ctx.strokeRect(defectX - 25, defectY - 25, 50, 50)
      ctx.setLineDash([])
      
      // Defect indicator
      ctx.fillStyle = "rgba(255, 0, 0, 0.3)"
      ctx.fillRect(defectX - 25, defectY - 25, 50, 50)
    }

    // Camera timestamp overlay
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
    ctx.fillRect(10, height - 30, 180, 22)
    ctx.fillStyle = "#00ff00"
    ctx.font = "12px monospace"
    const timestamp = new Date().toLocaleTimeString()
    ctx.fillText(`CAM-01 | ${timestamp}`, 15, height - 14)

    return showDefect
  }, [])

  // Animation loop
  useEffect(() => {
    if (!isActive || isPaused || !canvasRef.current) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
      return
    }

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let inspectionInterval: NodeJS.Timeout | null = null

    const animate = (currentTime: number) => {
      // FPS calculation
      fpsCounterRef.current++
      if (currentTime - lastFpsUpdateRef.current >= 1000) {
        setFps(fpsCounterRef.current)
        fpsCounterRef.current = 0
        lastFpsUpdateRef.current = currentTime
      }

      // Draw frame
      const hasDefect = drawPCBFrame(ctx, canvas.width, canvas.height, currentTime)
      setFrameCount((prev) => prev + 1)

      lastTimeRef.current = currentTime
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    // Periodic inspection (every 2 seconds)
    inspectionInterval = setInterval(() => {
      if (!canvasRef.current) return

      const processingTime = Math.floor(Math.random() * 50) + 30 // 30-80ms
      const isPass = Math.random() > 0.25 // 75% pass rate
      const confidence = Math.random() * 10 + 90 // 90-100%
      const status: InspectionStatus = isPass ? "pass" : "defect"
      const defectType = !isPass
        ? DEFECT_TYPES[Math.floor(Math.random() * DEFECT_TYPES.length)]
        : undefined

      // Get snapshot
      const imageSnapshot = canvasRef.current.toDataURL("image/png")

      setLastResult({ status, confidence })

      onInspectionResult({
        status,
        confidence,
        processingTime,
        defectType,
        imageSnapshot,
      })
    }, 2000)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (inspectionInterval) {
        clearInterval(inspectionInterval)
      }
    }
  }, [isActive, isPaused, drawPCBFrame, onInspectionResult])

  if (!isActive) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 p-12">
        <CameraOff className="mb-4 h-16 w-16 text-muted-foreground" />
        <p className="text-lg font-medium text-foreground">Camera Inactive</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Enable Live Mode to start real-time inspection
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Camera Feed */}
      <div className="relative overflow-hidden rounded-lg border border-border bg-black">
        <canvas
          ref={canvasRef}
          width={520}
          height={340}
          className="w-full"
        />
        
        {/* Overlay Stats */}
        <div className="absolute left-3 top-3 flex items-center gap-2 rounded bg-black/70 px-2 py-1 text-xs text-green-400 font-mono">
          <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          LIVE | {fps} FPS
        </div>

        {/* Status Indicator */}
        {lastResult && (
          <div
            className={`absolute right-3 top-3 flex items-center gap-2 rounded px-3 py-1.5 text-sm font-medium ${
              lastResult.status === "pass"
                ? "bg-green-500/90 text-white"
                : "bg-red-500/90 text-white"
            }`}
          >
            {lastResult.status === "pass" ? "PASS" : "DEFECT"}
            <span className="text-xs opacity-80">
              {lastResult.confidence.toFixed(1)}%
            </span>
          </div>
        )}

        {/* Pause Overlay */}
        {isPaused && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <div className="text-center">
              <Pause className="mx-auto h-12 w-12 text-white" />
              <p className="mt-2 text-white font-medium">Paused</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Camera className="h-4 w-4" />
            Frames: {frameCount.toLocaleString()}
          </span>
          <span>Resolution: 520x340</span>
        </div>
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="flex items-center gap-2 rounded-lg bg-muted px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/80"
        >
          {isPaused ? (
            <>
              <Play className="h-4 w-4" />
              Resume
            </>
          ) : (
            <>
              <Pause className="h-4 w-4" />
              Pause
            </>
          )}
        </button>
      </div>

      {/* Info Banner */}
      <div className="flex items-start gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div className="text-sm">
          <p className="font-medium text-foreground">Live Inspection Active</p>
          <p className="mt-0.5 text-muted-foreground">
            Automated inspection runs every 2 seconds. Results are logged to history.
            In production, this would connect to your actual camera feed via OpenCV.
          </p>
        </div>
      </div>
    </div>
  )
}
