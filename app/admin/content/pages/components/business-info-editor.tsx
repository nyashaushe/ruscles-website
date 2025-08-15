"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { 
  Save, 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  Plus,
  Trash2
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useBusinessInfo } from "@/hooks/use-business-info"

interface BusinessHours {
  day: string
  isOpen: boolean
  openTime: string
  closeTime: string
}

interface BusinessInfo {
  companyName: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
  }
  phone: string
  email: string
  emergencyPhone?: string
  businessHours: BusinessHours[]
  serviceAreas: string[]
  description: string
}

const defaultBusinessHours: BusinessHours[] = [
  { day: 'Monday', isOpen: true, openTime: '08:00', closeTime: '17:00' },
  { day: 'Tuesday', isOpen: true, openTime: '08:00', closeTime: '17:00' },
  { day: 'Wednesday', isOpen: true, openTime: '08:00', closeTime: '17:00' },
  { day: 'Thursday', isOpen: true, openTime: '08:00', closeTime: '17:00' },
  { day: 'Friday', isOpen: true, openTime: '08:00', closeTime: '17:00' },
  { day: 'Saturday', isOpen: false, openTime: '09:00', closeTime: '15:00' },
  { day: 'Sunday', isOpen: false, openTime: '09:00', closeTime: '15:00' },
]

export function BusinessInfoEditor() {
  const { toast } = useToast()
  const { businessInfo, updateBusinessInfo, isLoading } = useBusinessInfo()
  
  const [formData, setFormData] = useState<BusinessInfo>({
    companyName: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    phone: '',
    email: '',
    emergencyPhone: '',
    businessHours: defaultBusinessHours,
    serviceAreas: [],
    description: ''
  })
  
  const [newServiceArea, setNewServiceArea] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (businessInfo) {
      setFormData(businessInfo)
    }
  }, [businessInfo])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateBusinessInfo(formData)
      toast({
        title: "Success",
        description: "Business information updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update business information",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const updateBusinessHours = (index: number, field: keyof BusinessHours, value: string | boolean) => {
    const updatedHours = [...formData.businessHours]
    updatedHours[index] = { ...updatedHours[index], [field]: value }
    setFormData({ ...formData, businessHours: updatedHours })
  }

  const addServiceArea = () => {
    if (newServiceArea.trim()) {
      setFormData({
        ...formData,
        serviceAreas: [...formData.serviceAreas, newServiceArea.trim()]
      })
      setNewServiceArea('')
    }
  }

  const removeServiceArea = (index: number) => {
    setFormData({
      ...formData,
      serviceAreas: formData.serviceAreas.filter((_, i) => i !== index)
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Business Information</h2>
          <p className="text-gray-600 text-sm">
            Manage your company details, contact information, and business hours
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <LoadingSpinner size="sm" className="mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Company Information
            </CardTitle>
            <CardDescription>
              Basic company details and location
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="Your Company Name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="street">Street Address</Label>
              <Input
                id="street"
                value={formData.address.street}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  address: { ...formData.address, street: e.target.value }
                })}
                placeholder="123 Main Street"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.address.city}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    address: { ...formData.address, city: e.target.value }
                  })}
                  placeholder="City"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.address.state}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    address: { ...formData.address, state: e.target.value }
                  })}
                  placeholder="State"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="zipCode">ZIP Code</Label>
              <Input
                id="zipCode"
                value={formData.address.zipCode}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  address: { ...formData.address, zipCode: e.target.value }
                })}
                placeholder="12345"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Company Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of your company..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Contact Information
            </CardTitle>
            <CardDescription>
              Phone numbers and email addresses
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Main Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(555) 123-4567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyPhone">Emergency Phone (Optional)</Label>
              <Input
                id="emergencyPhone"
                type="tel"
                value={formData.emergencyPhone || ''}
                onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                placeholder="(555) 987-6543"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contact@company.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Business Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Business Hours
            </CardTitle>
            <CardDescription>
              Set your operating hours for each day of the week
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.businessHours.map((hours, index) => (
              <div key={hours.day} className="flex items-center gap-4">
                <div className="w-20 text-sm font-medium">
                  {hours.day}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={hours.isOpen}
                    onChange={(e) => updateBusinessHours(index, 'isOpen', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Open</span>
                </div>
                {hours.isOpen && (
                  <>
                    <Input
                      type="time"
                      value={hours.openTime}
                      onChange={(e) => updateBusinessHours(index, 'openTime', e.target.value)}
                      className="w-32"
                    />
                    <span className="text-sm text-gray-500">to</span>
                    <Input
                      type="time"
                      value={hours.closeTime}
                      onChange={(e) => updateBusinessHours(index, 'closeTime', e.target.value)}
                      className="w-32"
                    />
                  </>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Service Areas */}
        <Card>
          <CardHeader>
            <CardTitle>Service Areas</CardTitle>
            <CardDescription>
              Cities and regions where you provide services
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newServiceArea}
                onChange={(e) => setNewServiceArea(e.target.value)}
                placeholder="Add service area..."
                onKeyPress={(e) => e.key === 'Enter' && addServiceArea()}
              />
              <Button onClick={addServiceArea} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {formData.serviceAreas.map((area, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">{area}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeServiceArea(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}