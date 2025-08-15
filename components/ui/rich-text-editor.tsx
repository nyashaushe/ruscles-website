"use client"

import { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Toggle } from "@/components/ui/toggle"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Quote,
  Code,
  Link,
  Image,
  Undo,
  Redo,
  Type,
  Eye,
  EyeOff
} from "lucide-react"

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  className?: string
  minHeight?: number
  onImageUpload?: (file: File) => Promise<string>
}

export function RichTextEditor({ 
  content, 
  onChange, 
  placeholder = "Start writing...",
  className = "",
  minHeight = 300,
  onImageUpload
}: RichTextEditorProps) {
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false)
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState("")
  const [linkText, setLinkText] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [imageAlt, setImageAlt] = useState("")
  const [selectedText, setSelectedText] = useState("")
  
  const editorRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value)
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }, [onChange])

  const handleContentChange = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }, [onChange])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Handle keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault()
          execCommand('bold')
          break
        case 'i':
          e.preventDefault()
          execCommand('italic')
          break
        case 'u':
          e.preventDefault()
          execCommand('underline')
          break
        case 'z':
          e.preventDefault()
          if (e.shiftKey) {
            execCommand('redo')
          } else {
            execCommand('undo')
          }
          break
      }
    }
  }, [execCommand])

  const handleSelectionChange = useCallback(() => {
    const selection = window.getSelection()
    if (selection && selection.toString()) {
      setSelectedText(selection.toString())
    }
  }, [])

  const insertLink = useCallback(() => {
    if (linkUrl && linkText) {
      const linkHtml = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkText}</a>`
      execCommand('insertHTML', linkHtml)
      setLinkUrl("")
      setLinkText("")
      setIsLinkDialogOpen(false)
    }
  }, [linkUrl, linkText, execCommand])

  const insertImage = useCallback(() => {
    if (imageUrl) {
      const imageHtml = `<img src="${imageUrl}" alt="${imageAlt}" style="max-width: 100%; height: auto;" />`
      execCommand('insertHTML', imageHtml)
      setImageUrl("")
      setImageAlt("")
      setIsImageDialogOpen(false)
    }
  }, [imageUrl, imageAlt, execCommand])

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && onImageUpload) {
      try {
        const uploadedUrl = await onImageUpload(file)
        setImageUrl(uploadedUrl)
        setIsImageDialogOpen(true)
      } catch (error) {
        console.error('Failed to upload image:', error)
      }
    }
  }, [onImageUpload])

  const formatHeading = useCallback((level: number) => {
    execCommand('formatBlock', `h${level}`)
  }, [execCommand])

  const renderPreview = () => {
    return (
      <div 
        className="prose prose-sm max-w-none p-4 border rounded-md bg-gray-50"
        style={{ minHeight }}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    )
  }

  return (
    <div className={`border rounded-md ${className}`}>
      {/* Toolbar - Enhanced for Mobile */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-gray-50 overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          {/* Text Formatting */}
          <div className="flex items-center gap-1">
            <Toggle
              size="sm"
              onClick={() => execCommand('bold')}
              aria-label="Bold"
              className="h-9 w-9 touch-manipulation" // Larger touch targets
            >
              <Bold className="h-4 w-4" />
            </Toggle>
            <Toggle
              size="sm"
              onClick={() => execCommand('italic')}
              aria-label="Italic"
              className="h-9 w-9 touch-manipulation"
            >
              <Italic className="h-4 w-4" />
            </Toggle>
            <Toggle
              size="sm"
              onClick={() => execCommand('underline')}
              aria-label="Underline"
              className="h-9 w-9 touch-manipulation"
            >
              <Underline className="h-4 w-4" />
            </Toggle>
            <Toggle
              size="sm"
              onClick={() => execCommand('strikeThrough')}
              aria-label="Strikethrough"
              className="h-9 w-9 touch-manipulation"
            >
              <Strikethrough className="h-4 w-4" />
            </Toggle>
          </div>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Headings */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => formatHeading(1)}
              className="h-9 px-3 touch-manipulation"
            >
              H1
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => formatHeading(2)}
              className="h-9 px-3 touch-manipulation"
            >
              H2
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => formatHeading(3)}
              className="h-9 px-3 touch-manipulation"
            >
              H3
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Alignment */}
          <div className="flex items-center gap-1">
            <Toggle
              size="sm"
              onClick={() => execCommand('justifyLeft')}
              aria-label="Align Left"
              className="h-9 w-9 touch-manipulation"
            >
              <AlignLeft className="h-4 w-4" />
            </Toggle>
            <Toggle
              size="sm"
              onClick={() => execCommand('justifyCenter')}
              aria-label="Align Center"
              className="h-9 w-9 touch-manipulation"
            >
              <AlignCenter className="h-4 w-4" />
            </Toggle>
            <Toggle
              size="sm"
              onClick={() => execCommand('justifyRight')}
              aria-label="Align Right"
              className="h-9 w-9 touch-manipulation"
            >
              <AlignRight className="h-4 w-4" />
            </Toggle>
          </div>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Lists */}
          <div className="flex items-center gap-1">
            <Toggle
              size="sm"
              onClick={() => execCommand('insertUnorderedList')}
              aria-label="Bullet List"
              className="h-9 w-9 touch-manipulation"
            >
              <List className="h-4 w-4" />
            </Toggle>
            <Toggle
              size="sm"
              onClick={() => execCommand('insertOrderedList')}
              aria-label="Numbered List"
              className="h-9 w-9 touch-manipulation"
            >
              <ListOrdered className="h-4 w-4" />
            </Toggle>
            <Toggle
              size="sm"
              onClick={() => execCommand('formatBlock', 'blockquote')}
              aria-label="Quote"
              className="h-9 w-9 touch-manipulation"
            >
              <Quote className="h-4 w-4" />
            </Toggle>
            <Toggle
              size="sm"
              onClick={() => execCommand('formatBlock', 'pre')}
              aria-label="Code Block"
              className="h-9 w-9 touch-manipulation"
            >
              <Code className="h-4 w-4" />
            </Toggle>
          </div>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Links and Images */}
          <div className="flex items-center gap-1">
            <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const selection = window.getSelection()
                    if (selection && selection.toString()) {
                      setLinkText(selection.toString())
                    }
                    setIsLinkDialogOpen(true)
                  }}
                  className="h-9 w-9 touch-manipulation"
                >
                  <Link className="h-4 w-4" />
                </Button>
              </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Insert Link</DialogTitle>
                <DialogDescription>
                  Add a link to your content
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Link Text</Label>
                  <Input
                    value={linkText}
                    onChange={(e) => setLinkText(e.target.value)}
                    placeholder="Link text"
                  />
                </div>
                <div className="space-y-2">
                  <Label>URL</Label>
                  <Input
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsLinkDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={insertLink} disabled={!linkUrl || !linkText}>
                  Insert Link
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

            <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-9 w-9 touch-manipulation"
                >
                  <Image className="h-4 w-4" />
                </Button>
              </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Insert Image</DialogTitle>
                <DialogDescription>
                  Add an image to your content
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Image URL</Label>
                  <Input
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Alt Text</Label>
                  <Input
                    value={imageAlt}
                    onChange={(e) => setImageAlt(e.target.value)}
                    placeholder="Describe the image"
                  />
                </div>
                {onImageUpload && (
                  <div className="space-y-2">
                    <Label>Or Upload Image</Label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full"
                    >
                      Choose File
                    </Button>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsImageDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={insertImage} disabled={!imageUrl}>
                  Insert Image
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Undo/Redo */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => execCommand('undo')}
              aria-label="Undo"
              className="h-9 w-9 touch-manipulation"
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => execCommand('redo')}
              aria-label="Redo"
              className="h-9 w-9 touch-manipulation"
            >
              <Redo className="h-4 w-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Preview Toggle */}
          <Toggle
            size="sm"
            pressed={isPreviewMode}
            onPressedChange={setIsPreviewMode}
            aria-label="Toggle Preview"
            className="h-9 w-9 touch-manipulation"
          >
            {isPreviewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Toggle>
        </div>
      </div>

      {/* Editor Content */}
      {isPreviewMode ? (
        renderPreview()
      ) : (
        <div
          ref={editorRef}
          contentEditable
          className="p-4 focus:outline-none touch-manipulation text-base leading-relaxed" // Better mobile text editing
          style={{ minHeight }}
          onInput={handleContentChange}
          onKeyDown={handleKeyDown}
          onMouseUp={handleSelectionChange}
          onKeyUp={handleSelectionChange}
          onTouchEnd={handleSelectionChange} // Touch selection support
          dangerouslySetInnerHTML={{ __html: content }}
          data-placeholder={placeholder}
        />
      )}

      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
      `}</style>
    </div>
  )
}