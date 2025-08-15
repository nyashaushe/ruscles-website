import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { History, RotateCcw, Eye, User, Calendar } from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"
import { cn } from "@/lib/utils"

export interface ContentVersion {
  id: string
  version: number
  title: string
  content: string
  status: 'draft' | 'published' | 'scheduled' | 'archived'
  createdAt: Date
  createdBy: string
  changeDescription?: string
  isCurrentVersion: boolean
}

interface VersionHistoryProps {
  versions: ContentVersion[]
  onRestore: (versionId: string) => Promise<void>
  onPreview: (version: ContentVersion) => void
  loading?: boolean
}

interface VersionPreviewProps {
  version: ContentVersion | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function VersionPreview({ version, open, onOpenChange }: VersionPreviewProps) {
  if (!version) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Version {version.version} Preview
          </DialogTitle>
          <DialogDescription>
            Created {formatDistanceToNow(version.createdAt, { addSuffix: true })} by {version.createdBy}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{version.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{version.status}</Badge>
                <span className="text-sm text-muted-foreground">
                  {format(version.createdAt, "MMM d, yyyy 'at' h:mm a")}
                </span>
              </div>
            </div>
            
            <Separator />
            
            <div 
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: version.content }}
            />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

export function VersionHistory({ 
  versions, 
  onRestore, 
  onPreview, 
  loading = false 
}: VersionHistoryProps) {
  const [previewVersion, setPreviewVersion] = useState<ContentVersion | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [restoringId, setRestoringId] = useState<string | null>(null)

  const handlePreview = (version: ContentVersion) => {
    setPreviewVersion(version)
    setPreviewOpen(true)
    onPreview(version)
  }

  const handleRestore = async (versionId: string) => {
    setRestoringId(versionId)
    try {
      await onRestore(versionId)
    } finally {
      setRestoringId(null)
    }
  }

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm">
            <History className="w-4 h-4 mr-2" />
            Version History
          </Button>
        </SheetTrigger>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Version History
            </SheetTitle>
            <SheetDescription>
              View and restore previous versions of this content.
            </SheetDescription>
          </SheetHeader>
          
          <ScrollArea className="h-[calc(100vh-120px)] mt-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : versions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No version history available
              </div>
            ) : (
              <div className="space-y-4">
                {versions.map((version, index) => (
                  <div
                    key={version.id}
                    className={cn(
                      "border rounded-lg p-4 space-y-3",
                      version.isCurrentVersion && "border-primary bg-primary/5"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Version {version.version}</span>
                          {version.isCurrentVersion && (
                            <Badge variant="default" className="text-xs">
                              Current
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {version.status}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {version.createdBy}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDistanceToNow(version.createdAt, { addSuffix: true })}
                          </div>
                        </div>
                        
                        {version.changeDescription && (
                          <p className="text-sm text-muted-foreground">
                            {version.changeDescription}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePreview(version)}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Preview
                      </Button>
                      
                      {!version.isCurrentVersion && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRestore(version.id)}
                          disabled={restoringId === version.id}
                        >
                          <RotateCcw className="w-3 h-3 mr-1" />
                          {restoringId === version.id ? 'Restoring...' : 'Restore'}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>
      
      <VersionPreview
        version={previewVersion}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />
    </>
  )
}