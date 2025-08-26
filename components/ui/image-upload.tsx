"use client"

import { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  File, 
  AlertCircle,
  Check,
  Loader2
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
  onUpload: (file: File) => Promise<string>
  onUploadComplete?: (urls: string[]) => void
  maxSize?: number // in MB
  maxFiles?: number
  acceptedTypes?: string[]
  className?: string
  multiple?: boolean
  showPreview?: boolean
}

interface UploadFile {
  file: File
  id: string
  status: 'pending' | 'uploading' | 'success' | 'error'
  progress: number
  url?: string
  error?: string
}

export function ImageUpload({
  onUpload,
  onUploadComplete,
  maxSize = 5, // 5MB default
  maxFiles = 10,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  className = "",
  multiple = true,
  showPreview = true
}: ImageUploadProps) {
  const [files, setFiles] = useState<UploadFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const generateId = () => Math.random().toString(36).substr(2, 9)

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `File type ${file.type} is not supported`
    }
    
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`
    }
    
    return null
  }

  const handleFiles = useCallback(async (fileList: FileList) => {
    const newFiles: UploadFile[] = []
    
    for (let i = 0; i < Math.min(fileList.length, maxFiles - files.length); i++) {
      const file = fileList[i]
      const error = validateFile(file)
      
      newFiles.push({
        file,
        id: generateId(),
        status: error ? 'error' : 'pending',
        progress: 0,
        error
      })
    }
    
    setFiles(prev => [...prev, ...newFiles])
    
    // Start uploading valid files
    for (const uploadFile of newFiles) {
      if (uploadFile.status === 'pending') {
        uploadSingleFile(uploadFile)
      }
    }
  }, [files.length, maxFiles, maxSize, acceptedTypes])

  const uploadSingleFile = async (uploadFile: UploadFile) => {
    setFiles(prev => prev.map(f => 
      f.id === uploadFile.id 
        ? { ...f, status: 'uploading', progress: 0 }
        : f
    ))

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setFiles(prev => prev.map(f => 
          f.id === uploadFile.id && f.progress < 90
            ? { ...f, progress: f.progress + 10 }
            : f
        ))
      }, 200)

      const url = await onUpload(uploadFile.file)
      
      clearInterval(progressInterval)
      
      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { ...f, status: 'success', progress: 100, url }
          : f
      ))

      // Call completion callback if all files are done
      const updatedFiles = files.map(f => 
        f.id === uploadFile.id 
          ? { ...f, status: 'success' as const, progress: 100, url }
          : f
      )
      
      const allComplete = updatedFiles.every(f => f.status === 'success' || f.status === 'error')
      if (allComplete && onUploadComplete) {
        const successUrls = updatedFiles
          .filter(f => f.status === 'success' && f.url)
          .map(f => f.url!)
        onUploadComplete(successUrls)
      }
    } catch (error) {
      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { 
              ...f, 
              status: 'error', 
              progress: 0, 
              error: error instanceof Error ? error.message : 'Upload failed' 
            }
          : f
      ))
    }
  }

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const retryUpload = (uploadFile: UploadFile) => {
    uploadSingleFile(uploadFile)
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const droppedFiles = e.dataTransfer.files
    if (droppedFiles.length > 0) {
      handleFiles(droppedFiles)
    }
  }, [handleFiles])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (selectedFiles && selectedFiles.length > 0) {
      handleFiles(selectedFiles)
    }
    // Reset input value to allow selecting the same file again
    e.target.value = ''
  }, [handleFiles])

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="h-8 w-8 text-blue-500" />
    }
    return <File className="h-8 w-8 text-gray-500" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area - Enhanced for Mobile */}
      <div
        data-testid="drop-zone"
        className={cn(
          "border-2 border-dashed rounded-lg p-6 md:p-8 text-center transition-colors touch-manipulation",
          isDragOver 
            ? "border-blue-500 bg-blue-50" 
            : "border-gray-300 hover:border-gray-400 active:border-blue-400"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()} // Make entire area clickable on mobile
      >
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 md:w-12 md:h-12 bg-gray-100 rounded-full flex items-center justify-center">
            <Upload className="h-8 w-8 md:h-6 md:w-6 text-gray-600" />
          </div>
          
          <div>
            <h3 className="text-lg md:text-xl font-medium text-gray-900">
              Tap to upload or drop files here
            </h3>
            <p className="text-sm md:text-base text-gray-500 mt-2">
              {acceptedTypes.includes('image/jpeg') ? 'Images' : 'Files'} up to {maxSize}MB each
              {multiple && `, maximum ${maxFiles} files`}
            </p>
          </div>
          
          <Button
            onClick={(e) => {
              e.stopPropagation() // Prevent double trigger
              fileInputRef.current?.click()
            }}
            disabled={files.length >= maxFiles}
            size="lg"
            className="touch-manipulation"
          >
            Choose Files
          </Button>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple={multiple}
            accept={acceptedTypes.join(',')}
            onChange={handleFileSelect}
            className="hidden"
            data-testid="file-input"
          />
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">
            Uploaded Files ({files.length}/{maxFiles})
          </h4>
          
          <div className="space-y-2">
            {files.map((uploadFile) => (
              <Card key={uploadFile.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 md:gap-4">
                    {/* File Icon/Preview - Larger on mobile */}
                    <div className="flex-shrink-0">
                      {showPreview && uploadFile.url ? (
                        <img
                          src={uploadFile.url}
                          alt={uploadFile.file.name}
                          className="w-16 h-16 md:w-12 md:h-12 object-cover rounded border touch-manipulation"
                        />
                      ) : (
                        <div className="w-16 h-16 md:w-12 md:h-12 flex items-center justify-center">
                          {getFileIcon(uploadFile.file)}
                        </div>
                      )}
                    </div>
                    
                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {uploadFile.file.name}
                        </p>
                        <Badge 
                          variant={
                            uploadFile.status === 'success' ? 'default' :
                            uploadFile.status === 'error' ? 'destructive' :
                            uploadFile.status === 'uploading' ? 'secondary' : 'outline'
                          }
                        >
                          {uploadFile.status === 'uploading' && (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          )}
                          {uploadFile.status === 'success' && (
                            <Check className="h-3 w-3 mr-1" />
                          )}
                          {uploadFile.status === 'error' && (
                            <AlertCircle className="h-3 w-3 mr-1" />
                          )}
                          {uploadFile.status}
                        </Badge>
                      </div>
                      
                      <p className="text-xs text-gray-500">
                        {formatFileSize(uploadFile.file.size)}
                      </p>
                      
                      {uploadFile.status === 'uploading' && (
                        <Progress value={uploadFile.progress} className="mt-2" />
                      )}
                      
                      {uploadFile.error && (
                        <p className="text-xs text-red-600 mt-1">
                          {uploadFile.error}
                        </p>
                      )}
                    </div>
                    
                    {/* Actions - Enhanced for mobile */}
                    <div className="flex items-center gap-2">
                      {uploadFile.status === 'error' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => retryUpload(uploadFile)}
                          className="h-9 px-3 touch-manipulation"
                        >
                          Retry
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFile(uploadFile.id)}
                        className="h-9 w-9 touch-manipulation"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}