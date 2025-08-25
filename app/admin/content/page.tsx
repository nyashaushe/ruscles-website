"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Plus,
  FileText,
  MessageSquare,
  ImageIcon,
  Calendar,
  User,
} from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { EmptyState } from "@/components/ui/empty-state"
import { useBlog } from "@/hooks/use-blog"
import { useTestimonials } from "@/hooks/use-testimonials-new"
import { usePortfolio } from "@/hooks/use-portfolio-new"
import { formatDate } from "@/lib/utils/date"

export default function ContentPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")

  // Use real data from hooks
  const { blogPosts, loading: blogLoading, error: blogError } = useBlog()
  const { testimonials, loading: testimonialsLoading, error: testimonialsError } = useTestimonials()
  const { portfolioItems, loading: portfolioLoading, error: portfolioError } = usePortfolio()

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800 border-green-200"
      case "draft":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "approved":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Content Management</h1>
          <p className="text-gray-600 mt-1">Manage your website content, blog posts, and testimonials</p>
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="blog" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger
            value="blog"
            className="flex items-center gap-2"
            onClick={() => router.push("/admin/content/blog")}
          >
            <FileText className="h-4 w-4" />
            Blog Posts
          </TabsTrigger>
          <TabsTrigger value="testimonials" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Testimonials
          </TabsTrigger>
          <TabsTrigger value="portfolio" className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Portfolio
          </TabsTrigger>
          <TabsTrigger
            value="pages"
            className="flex items-center gap-2"
            onClick={() => router.push("/admin/content/pages")}
          >
            <FileText className="h-4 w-4" />
            Pages
          </TabsTrigger>
        </TabsList>

        {/* Blog Posts Tab */}
        <TabsContent value="blog" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search blog posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Button onClick={() => router.push("/admin/content/blog/new")}>
              <Plus className="h-4 w-4 mr-2" />
              New Blog Post
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Blog Posts ({blogLoading ? '...' : blogPosts?.length || 0})</CardTitle>
              <CardDescription>Manage your blog content and articles</CardDescription>
            </CardHeader>
            <CardContent>
              {blogLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner size="lg" />
                </div>
              ) : blogError ? (
                <EmptyState
                  title="Error loading blog posts"
                  description={blogError}
                  action={{
                    label: "Try Again",
                    onClick: () => window.location.reload()
                  }}
                />
              ) : !blogPosts || blogPosts.length === 0 ? (
                <EmptyState
                  title="No blog posts found"
                  description="Get started by creating your first blog post."
                  action={{
                    label: "Create Blog Post",
                    onClick: () => router.push("/admin/content/blog/new")
                  }}
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {blogPosts.map((post: any) => (
                      <TableRow key={post.id}>
                        <TableCell>
                          <div className="font-medium text-gray-900 max-w-xs truncate">{post.title}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            {post.author?.name || 'Unknown'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{post.category || 'Uncategorized'}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(post.status)}>{post.status}</Badge>
                        </TableCell>
                        <TableCell>{post.views ? post.views.toLocaleString() : '0'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Calendar className="h-3 w-3" />
                            {post.publishedAt ? formatDate(post.publishedAt) : "Not published"}
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
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
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
        </TabsContent>

        {/* Testimonials Tab */}
        <TabsContent value="testimonials" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input placeholder="Search testimonials..." className="pl-8" />
              </div>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Testimonial
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Testimonials ({testimonialsLoading ? '...' : testimonials?.length || 0})</CardTitle>
              <CardDescription>Customer reviews and feedback</CardDescription>
            </CardHeader>
            <CardContent>
              {testimonialsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner size="lg" />
                </div>
              ) : testimonialsError ? (
                <EmptyState
                  title="Error loading testimonials"
                  description={testimonialsError}
                  action={{
                    label: "Try Again",
                    onClick: () => window.location.reload()
                  }}
                />
              ) : !testimonials || testimonials.length === 0 ? (
                <EmptyState
                  title="No testimonials found"
                  description="Start collecting customer feedback and testimonials."
                  action={{
                    label: "Add Testimonial",
                    onClick: () => router.push("/admin/content/testimonials/new")
                  }}
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Content</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {testimonials.map((testimonial) => (
                      <TableRow key={testimonial.id}>
                        <TableCell>
                          <div className="font-medium text-gray-900">{testimonial.customerName}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {"★".repeat(testimonial.rating || 0)}
                            <span className="text-sm text-gray-500 ml-1">({testimonial.rating || 0}/5)</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate text-sm text-gray-600">{testimonial.testimonialText}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{testimonial.projectType || 'General'}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={testimonial.isVisible ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {testimonial.isVisible ? 'Published' : 'Hidden'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Calendar className="h-3 w-3" />
                            {formatDate(testimonial.createdAt)}
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
                              <DropdownMenuItem onClick={() => router.push(`/admin/content/testimonials/${testimonial.id}`)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Full
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => router.push(`/admin/content/testimonials/${testimonial.id}/edit`)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
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
        </TabsContent>

        {/* Portfolio Tab */}
        <TabsContent value="portfolio" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input placeholder="Search portfolio items..." className="pl-8" />
              </div>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Portfolio Item
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Portfolio Items ({portfolioLoading ? '...' : portfolioItems?.length || 0})</CardTitle>
              <CardDescription>Showcase your completed projects</CardDescription>
            </CardHeader>
            <CardContent>
              {portfolioLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner size="lg" />
                </div>
              ) : portfolioError ? (
                <EmptyState
                  title="Error loading portfolio items"
                  description={portfolioError}
                  action={{
                    label: "Try Again",
                    onClick: () => window.location.reload()
                  }}
                />
              ) : !portfolioItems || portfolioItems.length === 0 ? (
                <EmptyState
                  title="No portfolio items found"
                  description="Start showcasing your work by adding portfolio items."
                  action={{
                    label: "Add Portfolio Item",
                    onClick: () => router.push("/admin/content/portfolio/new")
                  }}
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Featured</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {portfolioItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="font-medium text-gray-900 max-w-xs truncate">{item.title}</div>
                        </TableCell>
                        <TableCell>{item.clientName || 'Not specified'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.serviceCategory || 'General'}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={item.isVisible ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {item.isVisible ? 'Visible' : 'Hidden'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {item.isFeatured ? (
                            <Badge className="bg-blue-100 text-blue-800 border-blue-200">Featured</Badge>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Calendar className="h-3 w-3" />
                            {item.completionDate ? formatDate(item.completionDate) : "Not specified"}
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
                              <DropdownMenuItem onClick={() => router.push(`/admin/content/portfolio/${item.id}`)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Preview
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => router.push(`/admin/content/portfolio/${item.id}/edit`)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
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
        </TabsContent>

        {/* Pages Tab */}
        <TabsContent value="pages" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input placeholder="Search pages..." className="pl-8" />
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Static pages are managed individually. Click on a page to edit its content.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push("/admin/content/pages/about/edit")}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  About Us
                </CardTitle>
                <CardDescription>Company story, mission, and team information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Last updated: Jan 15, 2024</span>
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push("/admin/content/pages/services/edit")}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-green-600" />
                  Services
                </CardTitle>
                <CardDescription>Service descriptions and offerings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Last updated: Jan 12, 2024</span>
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push("/admin/content/pages/contact/edit")}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-600" />
                  Contact
                </CardTitle>
                <CardDescription>Contact information and business details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Last updated: Jan 10, 2024</span>
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
