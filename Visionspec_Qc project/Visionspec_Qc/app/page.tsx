"use client"

import { useState, useCallback } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { ImageUploader } from "@/components/image-uploader"
import { InspectionResult, type InspectionStatus } from "@/components/inspection-result"
import { HeatmapOverlay } from "@/components/heatmap-overlay"
import { StatsCards } from "@/components/stats-cards"
import { InspectionHistory, type InspectionRecord } from "@/components/inspection-history"
import { LiveCameraFeed } from "@/components/live-camera-feed"
import { Cpu, Eye, Zap, RotateCcw } from "lucide-react"

const DEFECT_TYPES = [
  "Missing Component",
  "Solder Bridge",
  "Misalignment",
  "Scratch",
  "Open Circuit",
  "Short Circuit",
]

export default function QCDashboard() {
  const [isLiveMode, setIsLiveMode] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentImage, setCurrentImage] = useState<string | null>(null)
  const [currentResult, setCurrentResult] = useState<{
    status: InspectionStatus
    confidence: number
    processingTime: number
    defectType?: string
  } | null>(null)
  const [history, setHistory] = useState<InspectionRecord[]>([])

  const totalInspections = history.length
  const passCount = history.filter((r) => r.status === "pass").length
  const defectCount = history.filter((r) => r.status === "defect").length
  const avgProcessingTime =
    history.length > 0
      ? Math.round(history.reduce((acc, r) => acc + r.processingTime, 0) / history.length)
      : 0

  const resetInspection = useCallback(() => {
    setCurrentImage(null)
    setCurrentResult(null)
  }, [])

  const processImage = useCallback((imageUrl: string) => {
    setIsProcessing(true)
    setCurrentImage(imageUrl)
    setCurrentResult(null)

    const processingTime = Math.floor(Math.random() * 150) + 50

    setTimeout(() => {
      const randomValue = Math.random()
      const isPass = randomValue > 0.5
      const confidence = Math.random() * 15 + 85
      const status: InspectionStatus = isPass ? "pass" : "defect"
      const defectType = !isPass
        ? DEFECT_TYPES[Math.floor(Math.random() * DEFECT_TYPES.length)]
        : undefined

      const result = {
        status,
        confidence,
        processingTime,
        defectType,
      }

      setCurrentResult(result)
      setIsProcessing(false)

      const record: InspectionRecord = {
        id: Date.now().toString(),
        timestamp: new Date(),
        status,
        confidence,
        processingTime,
        defectType,
        imageThumbnail: imageUrl,
      }
      setHistory((prev) => [record, ...prev])
    }, processingTime)
  }, [])

  const handleImageSelect = useCallback(
    (file: File) => {
      const imageUrl = URL.createObjectURL(file)
      processImage(imageUrl)
    },
    [processImage]
  )

  const handleSelectRecord = useCallback((record: InspectionRecord) => {
    setCurrentImage(record.imageThumbnail || null)
    setCurrentResult({
      status: record.status,
      confidence: record.confidence,
      processingTime: record.processingTime,
      defectType: record.defectType,
    })
  }, [])

  const handleLiveInspectionResult = useCallback(
    (result: {
      status: InspectionStatus
      confidence: number
      processingTime: number
      defectType?: string
      imageSnapshot: string
    }) => {
      const record: InspectionRecord = {
        id: Date.now().toString(),
        timestamp: new Date(),
        status: result.status,
        confidence: result.confidence,
        processingTime: result.processingTime,
        defectType: result.defectType,
        imageThumbnail: result.imageSnapshot,
      }
      setHistory((prev) => [record, ...prev])
    },
    []
  )

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        isLiveMode={isLiveMode}
        onToggleLiveMode={() => setIsLiveMode(!isLiveMode)}
      />

      <main className="container-responsive py-6">
        {/* Stats Overview */}
        <div className="mb-6">
          <StatsCards
            totalInspections={totalInspections}
            passCount={passCount}
            defectCount={defectCount}
            avgProcessingTime={avgProcessingTime}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Live Camera Feed */}
            {isLiveMode && (
              <div className="card-professional p-4 sm:p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="live-indicator" />
                  <h2 className="text-lg font-semibold text-foreground">
                    Live Camera Feed
                  </h2>
                </div>
                <LiveCameraFeed
                  isActive={isLiveMode}
                  onInspectionResult={handleLiveInspectionResult}
                />
              </div>
            )}

            {/* Upload Section */}
            {!isLiveMode && !currentImage && (
              <div className="card-professional p-4 sm:p-6">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                  <Cpu className="h-5 w-5 text-primary" />
                  Upload PCB Image for Inspection
                </h2>
                <ImageUploader
                  onImageSelect={handleImageSelect}
                  isLoading={isProcessing}
                />
              </div>
            )}

            {/* Image Display with Heatmap */}
            {!isLiveMode && currentImage && (
              <div className="card-professional p-4 sm:p-6">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                    <Eye className="h-5 w-5 text-primary" />
                    Inspection Analysis
                  </h2>
                  <button
                    onClick={resetInspection}
                    className="btn-primary flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm"
                  >
                    <RotateCcw className="h-4 w-4" />
                    New Inspection
                  </button>
                </div>
                <HeatmapOverlay
                  originalImage={currentImage}
                  isDefect={currentResult?.status === "defect"}
                  defectType={currentResult?.defectType}
                  showHeatmap={true}
                />
              </div>
            )}

            {/* Result Display */}
            {!isLiveMode && currentResult && (
              <InspectionResult
                status={currentResult.status}
                confidence={currentResult.confidence}
                processingTime={currentResult.processingTime}
                defectType={currentResult.defectType}
              />
            )}

            {/* Processing State */}
            {!isLiveMode && isProcessing && (
              <div className="card-professional flex items-center justify-center p-10">
                <div className="text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <div className="h-7 w-7 animate-spin rounded-full border-3 border-primary border-t-transparent" />
                  </div>
                  <p className="mt-4 text-lg font-semibold text-foreground">
                    Analyzing PCB Image
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Running AI defect detection model
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - History */}
          <div className="lg:col-span-1">
            <InspectionHistory
              records={history}
              onSelectRecord={handleSelectRecord}
            />
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 card-professional p-4 sm:p-6">
          <h2 className="mb-6 text-lg font-semibold text-foreground">
            About VisionSpec QC
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Cpu className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mb-1.5 font-medium text-foreground">Transfer Learning</h3>
              <p className="text-sm text-muted-foreground">
                Uses MobileNetV2/ResNet50 pre-trained models fine-tuned for PCB defect detection
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                <Eye className="h-5 w-5 text-accent" />
              </div>
              <h3 className="mb-1.5 font-medium text-foreground">Grad-CAM Visualization</h3>
              <p className="text-sm text-muted-foreground">
                Heatmap overlays show exactly where the model detects potential defects
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-4 sm:col-span-2 lg:col-span-1">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <Zap className="h-5 w-5 text-warning" />
              </div>
              <h3 className="mb-1.5 font-medium text-foreground">Real-time Inference</h3>
              <p className="text-sm text-muted-foreground">
                Optimized for production speeds with processing at 10+ frames per second
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
