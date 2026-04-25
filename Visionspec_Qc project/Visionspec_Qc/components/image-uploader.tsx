"use client"

import { useCallback, useState } from "react"
import { Upload, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface ImageUploaderProps {
  onImageSelect: (file: File) => void
  isLoading?: boolean
}

export function ImageUploader({ onImageSelect, isLoading }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file && file.type.startsWith("image/")) {
        onImageSelect(file)
      }
    },
    [onImageSelect]
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        onImageSelect(file)
      }
    },
    [onImageSelect]
  )

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      className={cn(
        "relative flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-8 sm:p-12 transition-all duration-200",
        isDragging 
          ? "border-primary bg-primary/5" 
          : "border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/50"
      )}
    >
      <div className={cn(
        "flex h-16 w-16 items-center justify-center rounded-full transition-colors",
        isDragging ? "bg-primary/10" : "bg-muted"
      )}>
        {isLoading ? (
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary border-t-transparent" />
        ) : (
          <Upload className={cn(
            "h-8 w-8 transition-colors",
            isDragging ? "text-primary" : "text-muted-foreground"
          )} />
        )}
      </div>
      
      <div className="text-center">
        <p className="text-base font-medium text-foreground">
          {isLoading ? "Analyzing image..." : "Drop PCB image here"}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          or click to browse files
        </p>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <ImageIcon className="h-4 w-4" />
        <span>Supports JPG, PNG, WebP</span>
      </div>

      <input
        type="file"
        accept="image/*"
        onChange={handleChange}
        disabled={isLoading}
        className="absolute inset-0 cursor-pointer opacity-0"
      />
    </div>
  )
}
