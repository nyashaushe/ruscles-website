"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import {
  ArrowLeft,
  Save,
  MessageSquare,
} from "lucide-react"
import { useTestimonials } from "@/hooks/use-testimonials-new"
import Link from "next/link"

export default function NewTestimonialPage() {
  const router = useRouter()
  const { createTestimonial, loading } = useTestimonials()
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    customerName: "",
    customerTitle: "",
    customerCompany: "",
    customerPhoto: "",
    testimonialText: "",
    rating: 5,
    projectType: "",
    isVisible: true,
    isFeatured: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      await createTestimonial(formData)
      router.push("/admin/content/testimonials")
    } catch (error) {
      console.error("Failed to create testimonial:", error)
      setSaving(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/content/testimonials">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Testimonials
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Add New Testimonial</h1>
          <p className="text-gray-600 mt-1">Create a new customer testimonial</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Testimonial Information</CardTitle>
          <CardDescription>Fill in the testimonial details below</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name *</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => handleChange("customerName", e.target.value)}
                  placeholder="Enter customer's full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerTitle">Job Title</Label>
                <Input
                  id="customerTitle"
                  value={formData.customerTitle}
                  onChange={(e) => handleChange("customerTitle", e.target.value)}
                  placeholder="Enter customer's job title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerCompany">Company</Label>
                <Input
                  id="customerCompany"
                  value={formData.customerCompany}
                  onChange={(e) => handleChange("customerCompany", e.target.value)}
                  placeholder="Enter customer's company"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerPhoto">Photo URL</Label>
                <Input
                  id="customerPhoto"
                  value={formData.customerPhoto}
                  onChange={(e) => handleChange("customerPhoto", e.target.value)}
                  placeholder="Enter customer photo URL"
                />
              </div>
            </div>

            {/* Testimonial Content */}
            <div className="space-y-2">
              <Label htmlFor="testimonialText">Testimonial Text *</Label>
              <Textarea
                id="testimonialText"
                value={formData.testimonialText}
                onChange={(e) => handleChange("testimonialText", e.target.value)}
                placeholder="Enter the customer's testimonial..."
                rows={6}
                required
              />
            </div>

            {/* Rating and Project Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="rating">Rating</Label>
                <Select 
                  value={formData.rating.toString()} 
                  onValueChange={(value) => handleChange("rating", parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Star</SelectItem>
                    <SelectItem value="2">2 Stars</SelectItem>
                    <SelectItem value="3">3 Stars</SelectItem>
                    <SelectItem value="4">4 Stars</SelectItem>
                    <SelectItem value="5">5 Stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectType">Project Type</Label>
                <Select 
                  value={formData.projectType} 
                  onValueChange={(value) => handleChange("projectType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ELECTRICAL">Electrical</SelectItem>
                    <SelectItem value="HVAC">HVAC</SelectItem>
                    <SelectItem value="REFRIGERATION">Refrigeration</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Visibility Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="isVisible">Visibility</Label>
                <Select 
                  value={formData.isVisible.toString()} 
                  onValueChange={(value) => handleChange("isVisible", value === "true")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Visible</SelectItem>
                    <SelectItem value="false">Hidden</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="isFeatured">Featured</Label>
                <Select 
                  value={formData.isFeatured.toString()} 
                  onValueChange={(value) => handleChange("isFeatured", value === "true")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select featured status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Featured</SelectItem>
                    <SelectItem value="false">Not Featured</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Button asChild variant="outline">
                <Link href="/admin/content/testimonials">Cancel</Link>
              </Button>
              <Button type="submit" disabled={saving || loading}>
                {saving ? (
                  <>
                    <LoadingSpinner className="mr-2 h-4 w-4" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Create Testimonial
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}