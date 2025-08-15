"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageUpload } from "./image-upload"
import { MediaLibrary } from "./media-library"
import { ImageCropper } from "./image-cropper"
import { 
  Image as ImageIcon, 
  Upload, 
  Crop,
  FolderOpen
} from "lucide-react"

interface MediaFile {
  id: string
  name: string
  url: string
  thumbnailUrl?: string
  size: number
  type: string
  uploadedAt: Date
  uploadedBy: string
  alt?: string
  caption?: string
  folder?: string
  tags: string[]
}

interface MediaManagerProps {
  files: MediaFile[]
  onUpload: (file: File) => Promise<string>
  onDelete?: (fileIds: string[]) => Promise<void>
  onUpdate?: (fileId: string, updates: Partial<MediaFile>) => Promise<void>
  onSelect?: (files: MediaFile[]) => void
  selectionMode?: boolean
  maxSelection?: number
  acceptedTypes?: string[]
  children?: React.ReactNode
  title?: string
  description?: string
}

export function MediaManager({
  files,
  onUpload,
  onDelete,
  onUpdate,
  onSelect,
  selectionMode = false,
  maxSelection = 1,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  children,
  title = "Media Manager",
  description = "Upload, organize, and manage your media files"
}: MediaManagerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("library")
  const [cropImage, setCropImage] = useState<string | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])

  const handleUploadComplete = useCallback((urls: string[]) => {
    setUploadedFiles(urls)
    if (urls.length > 0) {
      setActiveTab("library")
    }
  }, [])

  const handleCropImage = useCallback((imageUrl: string) => {
    setCropImage(imageUrl)
  }, [])

  const handleCropComplete = useCallback(async (croppedBlob: Blob) => {
    try {
      // Convert blob to file
      const file = new File([croppedBlob], 'cropped-image.jpg', { type: 'image/jpeg' })
      const url = await onUpload(file)
      
      // Add to uploaded files list
      setUploadedFiles(prev => [...prev, url])
      setCropImage(null)
      setActiveTab("library")
    } catch (error) {
      console.error('Failed to upload cropped image:', error)
    }
  }, [onUpload])

  const handleSelect = useCallback((selectedFiles: MediaFile[]) => {
    if (onSelect) {
      onSelect(selectedFiles)
    }
    setIsOpen(false)
  }, [onSelect])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline">
            <FolderOpen className="h-4 w-4 mr-2" />
            Open Media Library
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-7xl max-h-[90vh] w-[95vw] md:w-full overflow-hidden">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {cropImage ? (
          <ImageCropper
            imageUrl={cropImage}
            onCropComplete={handleCropComplete}
            onCancel={() => setCropImage(null)}
          />
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="library" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
                <FolderOpen className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Library</span>
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
                <Upload className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Upload</span>
              </TabsTrigger>
              <TabsTrigger value="crop" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
                <Crop className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Crop</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="library" className="h-full overflow-auto">
              <MediaLibrary
                files={files}
                onUpload={onUpload}
                onDelete={onDelete}
                onUpdate={onUpdate}
                onSelect={handleSelect}
                selectionMode={selectionMode}
                maxSelection={maxSelection}
                acceptedTypes={acceptedTypes}
              />
            </TabsContent>

            <TabsContent value="upload" className="h-full overflow-auto">
              <div className="space-y-6">
                <ImageUpload
                  onUpload={onUpload}
                  onUploadComplete={handleUploadComplete}
                  acceptedTypes={acceptedTypes}
                  multiple={true}
                  showPreview={true}
                />
                
                {uploadedFiles.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-medium">Recently Uploaded</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                      {uploadedFiles.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`Uploaded ${index + 1}`}
                            className="w-full h-24 md:h-32 object-cover rounded border touch-manipulation"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 md:group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleCropImage(url)}
                              className="touch-manipulation"
                            >
                              <Crop className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                              <span className="text-xs md:text-sm">Crop</span>
                            </Button>
                          </div>
                          {/* Mobile tap overlay */}
                          <div className="md:hidden absolute inset-0 rounded" onClick={() => handleCropImage(url)} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="crop" className="h-full overflow-auto">
              <div className="text-center py-12">
                <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Image Selected for Cropping
                </h3>
                <p className="text-gray-500 mb-4">
                  Upload an image or select one from the library to start cropping
                </p>
                <div className="flex items-center justify-center gap-2">
                  <Button onClick={() => setActiveTab("upload")}>
                    Upload Image
                  </Button>
                  <Button variant="outline" onClick={() => setActiveTab("library")}>
                    Browse Library
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  )
}