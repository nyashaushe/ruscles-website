"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import {
  ArrowLeft,
  Upload,
  Star,
  User,
  Building,
  MessageSquare,
  Save,
  Eye,
  EyeOff,
} from "lucide-react"
import { useTestimonial } from "@/hooks/use-testimonials"
import { CreateTestimonialData } from "@/lib/api/testimonials"

const testimonialSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  customerTitle: z.string().optional(),
  customerCompany: z.string().optional(),
  testimonialText: z.string().min(10, "Testimonial must be at least 10 characters"),
  rating: z.number().min(1).max(5).optional(),
  projectType: z.enum(["electrical", "hvac", "refrigeration"]).optional(),
  isVisible: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
})

type TestimonialFormData = z.infer<typeof testimonialSchema>

export default function NewTestimonialPage() {
  const router = useRouter()
  const [customerPhoto, setCustomerPhoto] = useState<string>("")
  const [uploading, setUploading] = useState(false)
  const { create, uploadPhoto } = useTestimonial()

  const form = useForm<TestimonialFormData>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      customerName: "",
      customerTitle: "",
      customerCompany: "",
      testimonialText: "",
      rating: undefined,
      projectType: undefined,
      isVisible: true,
      isFeatured: false,
    },
  })

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      form.setError('root', { message: 'Please select a valid image file' })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      form.setError('root', { message: 'Image must be less than 5MB' })
      return
    }

    try {
      setUploading(true)
      const photoUrl = await uploadPhoto(file)
      if (photoUrl) {
        setCustomerPhoto(photoUrl)
      }
    } catch (error) {
      form.setError('root', { message: 'Failed to upload photo' })
    } finally {
      setUploading(false)
    }
  }

  const onSubmit = async (data: TestimonialFormData) => {
    try {
      const testimonialData: CreateTestimonialData = {
        ...data,
        customerPhoto: customerPhoto || undefined,
      }

      const newTestimonial = await create(testimonialData)
      if (newTestimonial) {
        router.push("/admin/content/testimonials")
      }
    } catch (error) {
      form.setError('root', { message: 'Failed to create testimonial' })
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const renderStars = (rating: number, onRatingChange: (rating: number) => void) => {
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onRatingChange(i + 1)}
            className="focus:outline-none"
          >
            <Star
              className={`h-5 w-5 transition-colors ${
                i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-yellow-300'
              }`}
            />
          </button>
        ))}
        <span className="text-sm text-gray-500 ml-2">
          {rating > 0 ? `${rating} star${rating !== 1 ? 's' : ''}` : 'No rating'}
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Add New Testimonial</h1>
          <p className="text-gray-600 mt-1">Create a new customer testimonial</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Customer Information
                  </CardTitle>
                  <CardDescription>
                    Enter the customer's details and contact information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="customerTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Job Title</FormLabel>
                          <FormControl>
                            <Input placeholder="CEO, Manager, etc." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="customerCompany"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company</FormLabel>
                          <FormControl>
                            <Input placeholder="Company Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Customer Photo Upload */}
                  <div className="space-y-2">
                    <Label>Customer Photo</Label>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={customerPhoto} />
                        <AvatarFallback>
                          {form.watch("customerName") ? getInitials(form.watch("customerName")) : <User className="h-6 w-6" />}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                          id="photo-upload"
                          disabled={uploading}
                        />
                        <Label
                          htmlFor="photo-upload"
                          className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                          {uploading ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <Upload className="h-4 w-4" />
                          )}
                          {uploading ? "Uploading..." : "Upload Photo"}
                        </Label>
                        <p className="text-xs text-gray-500 mt-1">
                          Optional. Max 5MB. JPG, PNG, or GIF.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Testimonial Content */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Testimonial Content
                  </CardTitle>
                  <CardDescription>
                    Enter the customer's testimonial and feedback
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="testimonialText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Testimonial Text *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter the customer's testimonial..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          The customer's feedback about your services
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="rating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rating</FormLabel>
                        <FormControl>
                          <div>
                            {renderStars(field.value || 0, field.onChange)}
                          </div>
                        </FormControl>
                        <FormDescription>
                          Optional star rating from the customer
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="projectType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select project type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="electrical">Electrical</SelectItem>
                            <SelectItem value="hvac">HVAC</SelectItem>
                            <SelectItem value="refrigeration">Refrigeration</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          The type of project this testimonial relates to
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Publish Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Publish Settings</CardTitle>
                  <CardDescription>
                    Control how this testimonial appears on your website
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="isVisible"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="flex items-center gap-2">
                            {field.value ? (
                              <Eye className="h-4 w-4 text-green-600" />
                            ) : (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            )}
                            Visible on Website
                          </FormLabel>
                          <FormDescription>
                            Show this testimonial on your website
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isFeatured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="flex items-center gap-2">
                            <Star className={`h-4 w-4 ${field.value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                            Featured Testimonial
                          </FormLabel>
                          <FormDescription>
                            Highlight this testimonial prominently
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={form.formState.isSubmitting}
                    >
                      {form.formState.isSubmitting ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Create Testimonial
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => router.back()}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Form Errors */}
          {form.formState.errors.root && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <p className="text-sm text-red-600">
                  {form.formState.errors.root.message}
                </p>
              </CardContent>
            </Card>
          )}
        </form>
      </Form>
    </div>
  )
}