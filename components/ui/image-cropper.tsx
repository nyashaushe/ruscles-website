"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Crop, 
  RotateCw, 
  RotateCcw, 
  FlipHorizontal, 
  FlipVertical,
  ZoomIn,
  ZoomOut,
  Download,
  Undo,
  Redo
} from "lucide-react"

interface ImageCropperProps {
  imageUrl: string
  onCropComplete: (croppedImageBlob: Blob) => void
  onCancel: () => void
  aspectRatio?: number | null // null for free crop
  outputFormat?: 'jpeg' | 'png' | 'webp'
  outputQuality?: number
  maxWidth?: number
  maxHeight?: number
}

interface CropArea {
  x: number
  y: number
  width: number
  height: number
}

interface Transform {
  scale: number
  rotation: number
  flipX: boolean
  flipY: boolean
}

const ASPECT_RATIOS = [
  { label: "Free", value: null },
  { label: "Square (1:1)", value: 1 },
  { label: "Portrait (3:4)", value: 3/4 },
  { label: "Landscape (4:3)", value: 4/3 },
  { label: "Wide (16:9)", value: 16/9 },
  { label: "Ultra Wide (21:9)", value: 21/9 },
]

export function ImageCropper({
  imageUrl,
  onCropComplete,
  onCancel,
  aspectRatio = null,
  outputFormat = 'jpeg',
  outputQuality = 0.9,
  maxWidth = 1920,
  maxHeight = 1080
}: ImageCropperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const [cropArea, setCropArea] = useState<CropArea>({
    x: 0,
    y: 0,
    width: 100,
    height: 100
  })
  
  const [transform, setTransform] = useState<Transform>({
    scale: 1,
    rotation: 0,
    flipX: false,
    flipY: false
  })
  
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<number | null>(aspectRatio)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const updateTransform = useCallback((updates: Partial<Transform>) => {
    setTransform(prev => ({ ...prev, ...updates }))
  }, [])

  const handleScaleChange = useCallback((value: number[]) => {
    updateTransform({ scale: value[0] })
  }, [updateTransform])

  const handleRotate = useCallback((degrees: number) => {
    updateTransform({ rotation: (transform.rotation + degrees) % 360 })
  }, [transform.rotation, updateTransform])

  const handleFlip = useCallback((axis: 'x' | 'y') => {
    if (axis === 'x') {
      updateTransform({ flipX: !transform.flipX })
    } else {
      updateTransform({ flipY: !transform.flipY })
    }
  }, [transform.flipX, transform.flipY, updateTransform])

  const handleAspectRatioChange = useCallback((ratio: string) => {
    const numericRatio = ratio === "null" ? null : parseFloat(ratio)
    setSelectedAspectRatio(numericRatio)
    
    // Adjust crop area to match new aspect ratio
    if (numericRatio && imageRef.current) {
      const imageWidth = imageRef.current.naturalWidth
      const imageHeight = imageRef.current.naturalHeight
      
      let newWidth = cropArea.width
      let newHeight = cropArea.width / numericRatio
      
      if (newHeight > imageHeight) {
        newHeight = imageHeight
        newWidth = newHeight * numericRatio
      }
      
      setCropArea(prev => ({
        ...prev,
        width: Math.min(newWidth, imageWidth),
        height: Math.min(newHeight, imageHeight)
      }))
    }
  }, [cropArea.width])

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const image = imageRef.current
    if (!canvas || !image) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size to match crop area
    canvas.width = cropArea.width
    canvas.height = cropArea.height

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Save context state
    ctx.save()

    // Apply transformations
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.scale(transform.scale, transform.scale)
    ctx.rotate((transform.rotation * Math.PI) / 180)
    ctx.scale(transform.flipX ? -1 : 1, transform.flipY ? -1 : 1)

    // Draw the cropped portion of the image
    ctx.drawImage(
      image,
      cropArea.x, cropArea.y, cropArea.width, cropArea.height,
      -cropArea.width / 2, -cropArea.height / 2, cropArea.width, cropArea.height
    )

    // Restore context state
    ctx.restore()
  }, [cropArea, transform])

  const handleCrop = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    setIsLoading(true)
    
    try {
      // Redraw canvas with current settings
      drawCanvas()
      
      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob!)
        }, `image/${outputFormat}`, outputQuality)
      })
      
      onCropComplete(blob)
    } catch (error) {
      console.error('Failed to crop image:', error)
    } finally {
      setIsLoading(false)
    }
  }, [drawCanvas, outputFormat, outputQuality, onCropComplete])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !imageRef.current) return

    const deltaX = e.clientX - dragStart.x
    const deltaY = e.clientY - dragStart.y

    setCropArea(prev => ({
      ...prev,
      x: Math.max(0, Math.min(prev.x + deltaX, imageRef.current!.naturalWidth - prev.width)),
      y: Math.max(0, Math.min(prev.y + deltaY, imageRef.current!.naturalHeight - prev.height))
    }))

    setDragStart({ x: e.clientX, y: e.clientY })
  }, [isDragging, dragStart])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Image Preview */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crop className="h-5 w-5" />
              Image Cropper
            </CardTitle>
            <CardDescription>
              Adjust the crop area and apply transformations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative bg-gray-100 rounded-lg overflow-hidden">
              <img
                ref={imageRef}
                src={imageUrl}
                alt="Image to crop"
                className="max-w-full h-auto"
                onLoad={drawCanvas}
                style={{
                  transform: `scale(${transform.scale}) rotate(${transform.rotation}deg) scaleX(${transform.flipX ? -1 : 1}) scaleY(${transform.flipY ? -1 : 1})`
                }}
              />
              
              {/* Crop Overlay */}
              <div
                className="absolute border-2 border-blue-500 bg-blue-500 bg-opacity-20 cursor-move"
                style={{
                  left: `${(cropArea.x / (imageRef.current?.naturalWidth || 1)) * 100}%`,
                  top: `${(cropArea.y / (imageRef.current?.naturalHeight || 1)) * 100}%`,
                  width: `${(cropArea.width / (imageRef.current?.naturalWidth || 1)) * 100}%`,
                  height: `${(cropArea.height / (imageRef.current?.naturalHeight || 1)) * 100}%`
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
              >
                {/* Resize handles */}
                <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 border border-white cursor-nw-resize" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 border border-white cursor-ne-resize" />
                <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 border border-white cursor-sw-resize" />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 border border-white cursor-se-resize" />
              </div>
            </div>
            
            {/* Preview Canvas */}
            <div className="mt-4">
              <Label>Preview</Label>
              <div className="border rounded-lg p-4 bg-gray-50">
                <canvas
                  ref={canvasRef}
                  className="max-w-full h-auto border rounded"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="space-y-4">
        {/* Aspect Ratio */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Aspect Ratio</CardTitle>
          </CardHeader>
          <CardContent>
            <Select 
              value={selectedAspectRatio?.toString() || "null"} 
              onValueChange={handleAspectRatioChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ASPECT_RATIOS.map((ratio) => (
                  <SelectItem key={ratio.label} value={ratio.value?.toString() || "null"}>
                    {ratio.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Transform Controls */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Transform</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Scale */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Scale</Label>
                <span className="text-sm text-gray-500">{transform.scale.toFixed(2)}x</span>
              </div>
              <Slider
                value={[transform.scale]}
                onValueChange={handleScaleChange}
                min={0.1}
                max={3}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Rotation */}
            <div className="space-y-2">
              <Label>Rotation</Label>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRotate(-90)}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRotate(90)}
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-500 ml-auto">
                  {transform.rotation}°
                </span>
              </div>
            </div>

            {/* Flip */}
            <div className="space-y-2">
              <Label>Flip</Label>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={transform.flipX ? "default" : "outline"}
                  onClick={() => handleFlip('x')}
                >
                  <FlipHorizontal className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant={transform.flipY ? "default" : "outline"}
                  onClick={() => handleFlip('y')}
                >
                  <FlipVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Output Settings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Output Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Format</Label>
              <Select value={outputFormat} onValueChange={(value: 'jpeg' | 'png' | 'webp') => {}}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jpeg">JPEG</SelectItem>
                  <SelectItem value="png">PNG</SelectItem>
                  <SelectItem value="webp">WebP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Quality</Label>
                <span className="text-sm text-gray-500">{Math.round(outputQuality * 100)}%</span>
              </div>
              <Slider
                value={[outputQuality]}
                onValueChange={(value) => {}}
                min={0.1}
                max={1}
                step={0.1}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              onClick={handleCrop} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Processing...' : 'Apply Crop'}
            </Button>
            <Button 
              variant="outline" 
              onClick={onCancel}
              className="w-full"
            >
              Cancel
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}