"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { 
  Smartphone, 
  Tablet, 
  Monitor, 
  Wifi, 
  WifiOff, 
  Zap,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  GripVertical,
  Upload,
  Image as ImageIcon
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useDeviceType } from "@/hooks/use-mobile"
import { 
  useConnectionAware, 
  useTouchOptimized, 
  useHapticFeedback,
  useMobilePagination 
} from "@/hooks/use-mobile-optimizations"

// Mock data for demonstration
const mockFormSubmissions = Array.from({ length: 50 }, (_, i) => ({
  id: `form-${i + 1}`,
  customerName: `Customer ${i + 1}`,
  email: `customer${i + 1}@example.com`,
  company: i % 3 === 0 ? `Company ${i + 1}` : undefined,
  type: ['contact', 'service_inquiry', 'quote_request'][i % 3] as const,
  status: ['new', 'in_progress', 'responded', 'completed'][i % 4] as const,
  priority: ['low', 'medium', 'high', 'urgent'][i % 4] as const,
  submittedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
  message: `This is a sample message from customer ${i + 1}. It contains some details about their inquiry.`
}))

export function MobileOptimizationDemo() {
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  
  // Mobile optimization hooks
  const deviceType = useDeviceType()
  const connectionAware = useConnectionAware()
  const touchOptimized = useTouchOptimized()
  const hapticFeedback = useHapticFeedback()
  
  // Filter items based on search
  const filteredItems = mockFormSubmissions.filter(item =>
    item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.email.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  // Mobile pagination
  const pagination = useMobilePagination(filteredItems, 10, 5)
  
  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, id])
      hapticFeedback.lightTap()
    } else {
      setSelectedItems(prev => prev.filter(item => item !== id))
    }
  }
  
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(pagination.currentItems.map(item => item.id))
      hapticFeedback.mediumTap()
    } else {
      setSelectedItems([])
    }
  }
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      case 'responded': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6 p-4">
      {/* Device and Connection Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {deviceType.isMobile && <Smartphone className="h-5 w-5" />}
            {deviceType.isTablet && <Tablet className="h-5 w-5" />}
            {deviceType.isDesktop && <Monitor className="h-5 w-5" />}
            Mobile Optimization Demo
          </CardTitle>
          <CardDescription>
            Demonstrating mobile-responsive components and touch interactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">Device Type</div>
              <div className="flex flex-wrap gap-1">
                {deviceType.isMobile && <Badge variant="outline">Mobile</Badge>}
                {deviceType.isTablet && <Badge variant="outline">Tablet</Badge>}
                {deviceType.isDesktop && <Badge variant="outline">Desktop</Badge>}
                {deviceType.isTouchDevice && <Badge variant="outline">Touch</Badge>}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Connection</div>
              <div className="flex items-center gap-2">
                {connectionAware.connectionSpeed === 'fast' && <Wifi className="h-4 w-4 text-green-600" />}
                {connectionAware.connectionSpeed === 'medium' && <Wifi className="h-4 w-4 text-yellow-600" />}
                {connectionAware.connectionSpeed === 'slow' && <WifiOff className="h-4 w-4 text-red-600" />}
                <Badge variant="outline" className="capitalize">
                  {connectionAware.connectionSpeed}
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Memory</div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <Badge variant="outline" className="capitalize">
                  {connectionAware.deviceMemory}
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Optimizations</div>
              <div className="space-y-1">
                {connectionAware.shouldReduceAnimations && (
                  <Badge variant="outline" className="text-xs">Reduced Animations</Badge>
                )}
                {connectionAware.shouldOptimizeImages && (
                  <Badge variant="outline" className="text-xs">Image Optimization</Badge>
                )}
                {connectionAware.shouldLazyLoad && (
                  <Badge variant="outline" className="text-xs">Lazy Loading</Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mobile-Optimized Search */}
      <Card>
        <CardHeader>
          <CardTitle>Mobile Search</CardTitle>
          <CardDescription>
            Touch-optimized search with proper input sizing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mobile-search">
            <Input
              type="search"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mobile-form-input"
            />
          </div>
        </CardContent>
      </Card>

      {/* Mobile-Optimized Form */}
      <Card>
        <CardHeader>
          <CardTitle>Touch-Optimized Form</CardTitle>
          <CardDescription>
            Form elements sized for touch interaction
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="mobile-form-group">
            <label className="block text-sm font-medium mb-2">Customer Name</label>
            <Input 
              placeholder="Enter customer name"
              className="mobile-form-input"
            />
          </div>
          <div className="mobile-form-group">
            <label className="block text-sm font-medium mb-2">Message</label>
            <Textarea 
              placeholder="Enter your message"
              className="mobile-form-textarea"
            />
          </div>
          <div className="flex items-center gap-3">
            <Switch />
            <label className="text-sm">Send email notification</label>
          </div>
          <div className="flex gap-2">
            <Button 
              className={`mobile-button mobile-button-primary flex-1 ${touchOptimized.getTouchClasses()}`}
              style={{ minHeight: touchOptimized.getTouchTargetSize(44) }}
            >
              Submit
            </Button>
            <Button 
              variant="outline"
              className={`mobile-button mobile-button-secondary flex-1 ${touchOptimized.getTouchClasses()}`}
              style={{ minHeight: touchOptimized.getTouchTargetSize(44) }}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Mobile-Optimized Data Display */}
      <Card>
        <CardHeader>
          <CardTitle>Responsive Data Table</CardTitle>
          <CardDescription>
            Desktop table with mobile card fallback ({filteredItems.length} items)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Desktop Table */}
          <div className="hidden md:block mobile-table-container">
            <table className="mobile-table w-full">
              <thead>
                <tr>
                  <th className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === pagination.currentItems.length && pagination.currentItems.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="touch-target"
                    />
                  </th>
                  <th>Customer</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Submitted</th>
                  <th className="w-12">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pagination.currentItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                        className="touch-target"
                      />
                    </td>
                    <td>
                      <div>
                        <div className="font-medium">{item.customerName}</div>
                        <div className="text-sm text-gray-500">{item.email}</div>
                        {item.company && (
                          <div className="text-xs text-gray-400">{item.company}</div>
                        )}
                      </div>
                    </td>
                    <td>
                      <Badge variant="outline" className="capitalize">
                        {item.type.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td>
                      <Badge className={getStatusColor(item.status)}>
                        {item.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td>
                      <Badge className={getPriorityColor(item.priority)}>
                        {item.priority}
                      </Badge>
                    </td>
                    <td>
                      <div className="text-sm">
                        {item.submittedAt.toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className={`touch-target ${touchOptimized.getTouchClasses()}`}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedItems.length === pagination.currentItems.length && pagination.currentItems.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="h-5 w-5"
                />
                <span className="text-sm text-gray-600 font-medium">
                  {selectedItems.length > 0 ? `${selectedItems.length} selected` : 'Select all'}
                </span>
              </div>
            </div>

            {pagination.currentItems.map((item) => (
              <div key={item.id} className="mobile-card">
                <div className="mobile-card-header">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                      className="mt-1 h-5 w-5 flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-gray-900 truncate">
                        {item.customerName}
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        {item.email}
                      </div>
                      {item.company && (
                        <div className="text-xs text-gray-400 truncate">
                          {item.company}
                        </div>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className={`h-9 w-9 p-0 flex-shrink-0 ${touchOptimized.getTouchClasses()}`}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mobile-card-content">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs px-2 py-1 capitalize">
                      {item.type.replace('_', ' ')}
                    </Badge>
                    <Badge className={`${getStatusColor(item.status)} text-xs px-2 py-1`}>
                      {item.status.replace('_', ' ')}
                    </Badge>
                    <Badge className={`${getPriorityColor(item.priority)} text-xs px-2 py-1`}>
                      {item.priority}
                    </Badge>
                  </div>
                </div>

                <div className="mobile-card-footer">
                  <div className="text-sm text-gray-500">
                    {item.submittedAt.toLocaleDateString()}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className={`${touchOptimized.getTouchClasses()}`}
                      onClick={() => hapticFeedback.lightTap()}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button 
                      size="sm" 
                      className={`${touchOptimized.getTouchClasses()}`}
                      onClick={() => hapticFeedback.mediumTap()}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Pagination */}
          <div className="mobile-pagination">
            <Button
              variant="outline"
              onClick={pagination.prevPage}
              disabled={!pagination.hasPrevPage}
              className={`mobile-pagination-button ${touchOptimized.getTouchClasses()}`}
            >
              Previous
            </Button>
            
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const pageNum = i + 1
                return (
                  <Button
                    key={pageNum}
                    variant={pagination.currentPage === pageNum ? "default" : "outline"}
                    onClick={() => pagination.goToPage(pageNum)}
                    className={`mobile-pagination-button ${touchOptimized.getTouchClasses()}`}
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>
            
            <Button
              variant="outline"
              onClick={pagination.nextPage}
              disabled={!pagination.hasNextPage}
              className={`mobile-pagination-button ${touchOptimized.getTouchClasses()}`}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Haptic Feedback Demo */}
      {hapticFeedback.isSupported && (
        <Card>
          <CardHeader>
            <CardTitle>Haptic Feedback</CardTitle>
            <CardDescription>
              Test different haptic feedback patterns (mobile only)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                onClick={hapticFeedback.lightTap}
                className={`${touchOptimized.getTouchClasses()}`}
              >
                Light Tap
              </Button>
              <Button 
                variant="outline" 
                onClick={hapticFeedback.mediumTap}
                className={`${touchOptimized.getTouchClasses()}`}
              >
                Medium Tap
              </Button>
              <Button 
                variant="outline" 
                onClick={hapticFeedback.heavyTap}
                className={`${touchOptimized.getTouchClasses()}`}
              >
                Heavy Tap
              </Button>
              <Button 
                variant="outline" 
                onClick={hapticFeedback.doubleTap}
                className={`${touchOptimized.getTouchClasses()}`}
              >
                Double Tap
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}