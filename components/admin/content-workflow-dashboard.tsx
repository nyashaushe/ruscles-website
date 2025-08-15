"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ContentStatusBadge } from "@/components/ui/content-status-badge"
import { ApprovalWorkflow } from "@/components/ui/approval-workflow"
import { useApprovalRequests } from "@/hooks/use-content-workflow"
import { 
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  User,
  FileText,
  Image,
  MessageSquare
} from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"
import type { ContentItem } from "@/lib/types/content"
import type { ApprovalRequest } from "@/components/ui/approval-workflow"

interface ContentWorkflowDashboardProps {
  content: ContentItem[]
  onCreateNew: (type: ContentItem['type']) => void
  onEdit: (contentId: string) => void
  onView: (contentId: string) => void
  onStatusChange: (contentId: string, status: ContentItem['status']) => void
  userRole?: string
  loading?: boolean
}

const contentTypeIcons = {
  blog_post: FileText,
  testimonial: MessageSquare,
  portfolio_item: Image,
  page_content: FileText,
}

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  published: 'bg-green-100 text-green-800',
  scheduled: 'bg-blue-100 text-blue-800',
  archived: 'bg-gray-100 text-gray-600',
}

export function ContentWorkflowDashboard({
  content,
  onCreateNew,
  onEdit,
  onView,
  onStatusChange,
  userRole = 'admin',
  loading = false,
}: ContentWorkflowDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [selectedApprovalRequest, setSelectedApprovalRequest] = useState<ApprovalRequest | null>(null)
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false)

  // Approval requests hook
  const {
    approvalRequests,
    isLoading: approvalLoading,
    approve,
    reject,
    requestChanges,
  } = useApprovalRequests()

  // Filter content based on search and filters
  const filteredContent = content.filter((item) => {
    const matchesSearch = !searchTerm || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.author.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter
    const matchesType = typeFilter === 'all' || item.type === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  // Group content by status for overview
  const contentByStatus = content.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const handleApprovalAction = async (
    action: 'approve' | 'reject' | 'changes',
    requestId: string,
    comment?: string
  ) => {
    try {
      switch (action) {
        case 'approve':
          await approve({ requestId, comment })
          break
        case 'reject':
          if (comment) await reject({ requestId, comment })
          break
        case 'changes':
          if (comment) await requestChanges({ requestId, comment })
          break
      }
      setApprovalDialogOpen(false)
      setSelectedApprovalRequest(null)
    } catch (error) {
      console.error('Failed to handle approval action:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Content</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{content.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {contentByStatus.published || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {contentByStatus.draft || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {approvalRequests.filter(req => req.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="content" className="space-y-4">
        <TabsList>
          <TabsTrigger value="content">All Content</TabsTrigger>
          <TabsTrigger value="approvals" className="relative">
            Approvals
            {approvalRequests.filter(req => req.status === 'pending').length > 0 && (
              <Badge 
                variant="destructive" 
                className="ml-2 h-5 w-5 rounded-full p-0 text-xs"
              >
                {approvalRequests.filter(req => req.status === 'pending').length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="blog_post">Blog Posts</SelectItem>
                <SelectItem value="testimonial">Testimonials</SelectItem>
                <SelectItem value="portfolio_item">Portfolio</SelectItem>
                <SelectItem value="page_content">Pages</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={() => onCreateNew('blog_post')}>
              <Plus className="h-4 w-4 mr-2" />
              New Content
            </Button>
          </div>

          {/* Content Table */}
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    </TableCell>
                  </TableRow>
                ) : filteredContent.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No content found matching your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredContent.map((item) => {
                    const TypeIcon = contentTypeIcons[item.type]
                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <TypeIcon className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{item.title}</div>
                              {item.excerpt && (
                                <div className="text-sm text-muted-foreground truncate max-w-xs">
                                  {item.excerpt}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {item.type.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <ContentStatusBadge
                            status={item.status}
                            scheduledFor={item.scheduledFor}
                            publishedAt={item.publishedAt}
                            showDropdown={true}
                            onStatusChange={(status) => onStatusChange(item.id, status)}
                            onSchedule={() => {
                              // Handle schedule
                              console.log('Schedule content:', item.id)
                            }}
                            onPublish={() => onStatusChange(item.id, 'published')}
                            onUnpublish={() => onStatusChange(item.id, 'draft')}
                            onArchive={() => onStatusChange(item.id, 'archived')}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3 text-muted-foreground" />
                            {item.author}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatDistanceToNow(item.updatedAt, { addSuffix: true })}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(item.updatedAt, "MMM d, yyyy")}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onView(item.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEdit(item.id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="approvals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Approval Requests</CardTitle>
              <CardDescription>
                Review and approve content submissions from team members.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {approvalLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : approvalRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No approval requests at this time.
                </div>
              ) : (
                <div className="space-y-4">
                  {approvalRequests.map((request) => (
                    <div
                      key={request.id}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h4 className="font-medium">{request.contentTitle}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {request.requestedBy}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDistanceToNow(request.requestedAt, { addSuffix: true })}
                            </div>
                          </div>
                        </div>
                        <Badge 
                          variant={request.status === 'pending' ? 'default' : 'secondary'}
                          className="capitalize"
                        >
                          {request.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      {request.status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedApprovalRequest(request)
                              setApprovalDialogOpen(true)
                            }}
                          >
                            Review
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Approval Dialog */}
      {selectedApprovalRequest && (
        <ApprovalWorkflow
          request={selectedApprovalRequest}
          open={approvalDialogOpen}
          onOpenChange={setApprovalDialogOpen}
          onApprove={(comment) => handleApprovalAction('approve', selectedApprovalRequest.id, comment)}
          onReject={(comment) => handleApprovalAction('reject', selectedApprovalRequest.id, comment)}
          onRequestChanges={(comment) => handleApprovalAction('changes', selectedApprovalRequest.id, comment)}
          currentUser={userRole}
        />
      )}
    </div>
  )
}