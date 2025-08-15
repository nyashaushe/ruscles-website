"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { EmptyState } from "@/components/ui/empty-state"
import { StatusBadge } from "@/components/ui/status-badge"
import {
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Plus,
  Calendar,
  User,
  FileText,
  Copy,
  Clock,
  Filter,
  SortAsc,
  SortDesc,
  X,
} from "lucide-react"
import { useBlogList, useBlogPost, useBlogCategories } from "@/hooks/use-blog"
import { BlogPostFilters } from "@/lib/api/blog"
import { formatDate } from "@/lib/utils/date"

export default function BlogListPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<"createdAt" | "updatedAt" | "publishedAt" | "title">("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  const { categories } = useBlogCategories()
  const { duplicate, delete: deleteBlogPost } = useBlogPost()

  // Build filters
  const filters: BlogPostFilters = {}
  if (selectedStatus !== "all") {
    filters.status = [selectedStatus as any]
  }
  if (selectedCategory !== "all") {
    filters.categories = [selectedCategory]
  }
  if (selectedTags.length > 0) {
    filters.tags = selectedTags
  }

  const { posts, loading, error, refresh } = useBlogList({
    search: searchTerm,
    filters,
    sortBy,
    sortOrder,
    limit: 20
  })

  const handleSearch = (value: string) => {
    setSearchTerm(value)
  }

  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status)
  }

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category)
  }

  const handleTagFilter = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const clearTagFilter = (tag: string) => {
    setSelectedTags(prev => prev.filter(t => t !== tag))
  }

  const clearAllFilters = () => {
    setSearchTerm("")
    setSelectedStatus("all")
    setSelectedCategory("all")
    setSelectedTags([])
  }

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("desc")
    }
  }

  const handleDuplicate = async (id: string) => {
    const duplicatedPost = await duplicate(id)
    if (duplicatedPost) {
      refresh()
      router.push(`/admin/content/blog/${duplicatedPost.id}/edit`)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this blog post?")) {
      const success = await deleteBlogPost(id)
      if (success) {
        refresh()
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "success"
      case "draft":
        return "warning"
      case "scheduled":
        return "info"
      case "archived":
        return "secondary"
      default:
        return "secondary"
    }
  }

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return null
    return sortOrder === "asc" ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Blog Posts</h1>
            <p className="text-gray-600 mt-1">Manage your blog content and articles</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <EmptyState
              icon={FileText}
              title="Error loading blog posts"
              description={error}
              action={
                <Button onClick={refresh}>
                  Try Again
                </Button>
              }
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Blog Posts</h1>
          <p className="text-gray-600 mt-1">Manage your blog content and articles</p>
        </div>
        <Button onClick={() => router.push("/admin/content/blog/new")}>
          <Plus className="h-4 w-4 mr-2" />
          New Blog Post
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search blog posts..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={selectedStatus} onValueChange={handleStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedCategory} onValueChange={handleCategoryFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters */}
          {(searchTerm || selectedStatus !== "all" || selectedCategory !== "all" || selectedTags.length > 0) && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {searchTerm && (
                <Badge variant="secondary">
                  Search: {searchTerm}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchTerm("")}
                    className="ml-1 h-3 w-3 p-0 hover:bg-transparent"
                  >
                    <X className="h-2 w-2" />
                  </Button>
                </Badge>
              )}
              {selectedStatus !== "all" && (
                <Badge variant="secondary">
                  Status: {selectedStatus}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedStatus("all")}
                    className="ml-1 h-3 w-3 p-0 hover:bg-transparent"
                  >
                    <X className="h-2 w-2" />
                  </Button>
                </Badge>
              )}
              {selectedCategory !== "all" && (
                <Badge variant="secondary">
                  Category: {selectedCategory}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedCategory("all")}
                    className="ml-1 h-3 w-3 p-0 hover:bg-transparent"
                  >
                    <X className="h-2 w-2" />
                  </Button>
                </Badge>
              )}
              {selectedTags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  Tag: {tag}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearTagFilter(tag)}
                    className="ml-1 h-3 w-3 p-0 hover:bg-transparent"
                  >
                    <X className="h-2 w-2" />
                  </Button>
                </Badge>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="ml-2"
              >
                Clear all
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Blog Posts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Blog Posts ({posts.length})</CardTitle>
          <CardDescription>Manage your blog content and articles</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : posts.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No blog posts found"
              description={searchTerm || selectedStatus !== "all" || selectedCategory !== "all" || selectedTags.length > 0
                ? "No blog posts match your current filters. Try adjusting your search criteria."
                : "Get started by creating your first blog post."
              }
              action={
                <Button onClick={() => router.push("/admin/content/blog/new")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Blog Post
                </Button>
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort("title")}
                  >
                    <div className="flex items-center gap-2">
                      Title
                      {getSortIcon("title")}
                    </div>
                  </TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort("publishedAt")}
                  >
                    <div className="flex items-center gap-2">
                      Published
                      {getSortIcon("publishedAt")}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort("updatedAt")}
                  >
                    <div className="flex items-center gap-2">
                      Updated
                      {getSortIcon("updatedAt")}
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>
                      <div className="font-medium text-gray-900 max-w-xs truncate">
                        {post.title}
                      </div>
                      {post.excerpt && (
                        <div className="text-sm text-gray-500 max-w-xs truncate mt-1">
                          {post.excerpt}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        {post.author}
                      </div>
                    </TableCell>
                    <TableCell>
                      {post.categories.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {post.categories.slice(0, 2).map((category) => (
                            <Badge key={category} variant="outline" className="text-xs">
                              {category}
                            </Badge>
                          ))}
                          {post.categories.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{post.categories.length - 2}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={post.status} variant={getStatusColor(post.status)} />
                      {post.status === "scheduled" && post.scheduledFor && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(new Date(post.scheduledFor))}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {post.viewCount?.toLocaleString() || 0}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar className="h-3 w-3" />
                        {post.publishedAt ? formatDate(new Date(post.publishedAt)) : "Not published"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar className="h-3 w-3" />
                        {formatDate(new Date(post.updatedAt))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => router.push(`/admin/content/blog/${post.id}`)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/admin/content/blog/${post.id}/edit`)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(post.id)}>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDelete(post.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}