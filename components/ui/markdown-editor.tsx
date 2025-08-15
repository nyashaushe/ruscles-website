"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Bold, 
  Italic, 
  Link, 
  Image, 
  List, 
  ListOrdered,
  Quote,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Eye,
  Edit
} from "lucide-react"

interface MarkdownEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  className?: string
  minHeight?: number
}

export function MarkdownEditor({ 
  content, 
  onChange, 
  placeholder = "Start writing...",
  className = "",
  minHeight = 300
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write")

  const insertMarkdown = useCallback((before: string, after: string = "", placeholder: string = "") => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    const textToInsert = selectedText || placeholder
    
    const newContent = 
      content.substring(0, start) + 
      before + textToInsert + after + 
      content.substring(end)
    
    onChange(newContent)

    // Set cursor position after insertion
    setTimeout(() => {
      const newCursorPos = start + before.length + textToInsert.length + after.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
      textarea.focus()
    }, 0)
  }, [content, onChange])

  const toolbarButtons = [
    {
      icon: Bold,
      label: "Bold",
      action: () => insertMarkdown("**", "**", "bold text")
    },
    {
      icon: Italic,
      label: "Italic", 
      action: () => insertMarkdown("*", "*", "italic text")
    },
    {
      icon: Heading1,
      label: "Heading 1",
      action: () => insertMarkdown("# ", "", "Heading 1")
    },
    {
      icon: Heading2,
      label: "Heading 2",
      action: () => insertMarkdown("## ", "", "Heading 2")
    },
    {
      icon: Heading3,
      label: "Heading 3",
      action: () => insertMarkdown("### ", "", "Heading 3")
    },
    {
      icon: Link,
      label: "Link",
      action: () => insertMarkdown("[", "](https://example.com)", "link text")
    },
    {
      icon: Image,
      label: "Image",
      action: () => insertMarkdown("![", "](https://example.com/image.jpg)", "alt text")
    },
    {
      icon: List,
      label: "Bullet List",
      action: () => insertMarkdown("- ", "", "list item")
    },
    {
      icon: ListOrdered,
      label: "Numbered List",
      action: () => insertMarkdown("1. ", "", "list item")
    },
    {
      icon: Quote,
      label: "Quote",
      action: () => insertMarkdown("> ", "", "quote text")
    },
    {
      icon: Code,
      label: "Code",
      action: () => insertMarkdown("`", "`", "code")
    }
  ]

  const renderMarkdownPreview = (markdown: string) => {
    // Simple markdown to HTML conversion
    let html = markdown
      // Headers
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // Bold
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      // Code
      .replace(/`(.*?)`/gim, '<code>$1</code>')
      // Links
      .replace(/\[([^\]]*)\]\(([^\)]*)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      // Images
      .replace(/!\[([^\]]*)\]\(([^\)]*)\)/gim, '<img src="$2" alt="$1" style="max-width: 100%; height: auto;" />')
      // Line breaks
      .replace(/\n/gim, '<br>')
      // Lists
      .replace(/^\- (.*$)/gim, '<li>$1</li>')
      .replace(/^1\. (.*$)/gim, '<li>$1</li>')
      // Quotes
      .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')

    // Wrap list items in ul/ol tags (simplified)
    html = html.replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>')

    return html
  }

  return (
    <div className={`border rounded-md ${className}`}>
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "write" | "preview")}>
        <div className="flex items-center justify-between border-b bg-gray-50 p-2">
          <div className="flex items-center gap-1">
            {toolbarButtons.map((button, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                onClick={button.action}
                title={button.label}
                disabled={activeTab === "preview"}
              >
                <button.icon className="h-4 w-4" />
              </Button>
            ))}
          </div>
          
          <TabsList className="grid w-fit grid-cols-2">
            <TabsTrigger value="write" className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Write
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="write" className="m-0">
          <Textarea
            value={content}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="border-0 resize-none focus-visible:ring-0"
            style={{ minHeight }}
          />
        </TabsContent>

        <TabsContent value="preview" className="m-0">
          <div 
            className="prose prose-sm max-w-none p-4"
            style={{ minHeight }}
            dangerouslySetInnerHTML={{ 
              __html: content ? renderMarkdownPreview(content) : '<p class="text-gray-500">Nothing to preview</p>' 
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Markdown Help */}
      <div className="border-t bg-gray-50 p-2 text-xs text-gray-500">
        <details>
          <summary className="cursor-pointer hover:text-gray-700">Markdown Help</summary>
          <div className="mt-2 space-y-1">
            <div><code>**bold**</code> → <strong>bold</strong></div>
            <div><code>*italic*</code> → <em>italic</em></div>
            <div><code># Heading 1</code> → <h1 className="text-sm font-bold">Heading 1</h1></div>
            <div><code>[link](url)</code> → <a href="#" className="text-blue-600">link</a></div>
            <div><code>![image](url)</code> → Image</div>
            <div><code>- item</code> → Bullet list</div>
            <div><code>1. item</code> → Numbered list</div>
            <div><code>&gt; quote</code> → <blockquote className="border-l-2 border-gray-300 pl-2">quote</blockquote></div>
            <div><code>`code`</code> → <code>code</code></div>
          </div>
        </details>
      </div>
    </div>
  )
}