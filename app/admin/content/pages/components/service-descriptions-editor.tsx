"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { 
  Save, 
  Zap, 
  Wind, 
  Snowflake,
  Plus,
  Trash2,
  GripVertical
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useServiceDescriptions } from "@/hooks/use-service-descriptions"

interface ServiceDescription {
  id: string
  title: string
  description: string
  shortDescription: string
  features: string[]
  icon: 'electrical' | 'hvac' | 'refrigeration'
  displayOrder: number
  isActive: boolean
}

const serviceIcons = {
  electrical: Zap,
  hvac: Wind,
  refrigeration: Snowflake
}

export function ServiceDescriptionsEditor() {
  const { toast } = useToast()
  const { services, updateServices, isLoading } = useServiceDescriptions()
  
  const [serviceList, setServiceList] = useState<ServiceDescription[]>([])
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (services) {
      setServiceList(services)
    }
  }, [services])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateServices(serviceList)
      toast({
        title: "Success",
        description: "Service descriptions updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update service descriptions",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const updateService = (index: number, field: keyof ServiceDescription, value: any) => {
    const updatedServices = [...serviceList]
    updatedServices[index] = { ...updatedServices[index], [field]: value }
    setServiceList(updatedServices)
  }

  const addFeature = (serviceIndex: number, feature: string) => {
    if (feature.trim()) {
      const updatedServices = [...serviceList]
      updatedServices[serviceIndex].features.push(feature.trim())
      setServiceList(updatedServices)
    }
  }

  const removeFeature = (serviceIndex: number, featureIndex: number) => {
    const updatedServices = [...serviceList]
    updatedServices[serviceIndex].features.splice(featureIndex, 1)
    setServiceList(updatedServices)
  }

  const handleImageUpload = async (file: File): Promise<string> => {
    // This would integrate with your image upload service
    return "/placeholder.jpg"
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
          <h2 className="text-xl font-semibold">Service Descriptions</h2>
          <p className="text-gray-600 text-sm">
            Manage detailed descriptions for your electrical, HVAC, and refrigeration services
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

      <div className="space-y-8">
        {serviceList.map((service, serviceIndex) => {
          const IconComponent = serviceIcons[service.icon]
          
          return (
            <Card key={service.id} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-gray-400" />
                      <IconComponent className="h-5 w-5 text-blue-600" />
                    </div>
                    <Input
                      value={service.title}
                      onChange={(e) => updateService(serviceIndex, 'title', e.target.value)}
                      className="text-lg font-semibold border-none p-0 h-auto bg-transparent"
                      placeholder="Service Title"
                    />
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">Active:</Label>
                    <input
                      type="checkbox"
                      checked={service.isActive}
                      onChange={(e) => updateService(serviceIndex, 'isActive', e.target.checked)}
                      className="rounded"
                    />
                  </div>
                </div>
                <CardDescription>
                  <Input
                    value={service.shortDescription}
                    onChange={(e) => updateService(serviceIndex, 'shortDescription', e.target.value)}
                    placeholder="Brief service description for cards and previews"
                    className="border-none p-0 h-auto bg-transparent text-gray-600"
                  />
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Detailed Description */}
                <div className="space-y-2">
                  <Label>Detailed Description</Label>
                  <RichTextEditor
                    content={service.description}
                    onChange={(content) => updateService(serviceIndex, 'description', content)}
                    placeholder="Provide a detailed description of this service..."
                    minHeight={200}
                    onImageUpload={handleImageUpload}
                  />
                </div>

                {/* Service Features */}
                <div className="space-y-4">
                  <Label>Service Features</Label>
                  <div className="space-y-2">
                    {service.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-2">
                        <Input
                          value={feature}
                          onChange={(e) => {
                            const updatedServices = [...serviceList]
                            updatedServices[serviceIndex].features[featureIndex] = e.target.value
                            setServiceList(updatedServices)
                          }}
                          placeholder="Service feature"
                          className="flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFeature(serviceIndex, featureIndex)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addFeature(serviceIndex, '')}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Feature
                    </Button>
                  </div>
                </div>

                {/* Service Categories/Specialties */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm">
                    <span className="font-medium text-gray-700">Service Type:</span>
                    <div className="mt-1 flex items-center gap-2">
                      <IconComponent className="h-4 w-4 text-blue-600" />
                      <span className="capitalize">{service.icon}</span>
                    </div>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium text-gray-700">Display Order:</span>
                    <Input
                      type="number"
                      value={service.displayOrder}
                      onChange={(e) => updateService(serviceIndex, 'displayOrder', parseInt(e.target.value))}
                      className="mt-1 w-20 h-8"
                      min="1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Service Management Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">Service Management Tips</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-700 text-sm space-y-2">
          <p>• Use the detailed description to explain your service offerings comprehensively</p>
          <p>• Add specific features and benefits that set your services apart</p>
          <p>• Include relevant keywords for better SEO performance</p>
          <p>• Use the display order to control how services appear on your website</p>
          <p>• Deactivate services temporarily without deleting their content</p>
        </CardContent>
      </Card>
    </div>
  )
}