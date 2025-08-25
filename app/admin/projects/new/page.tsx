"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useProjects } from "@/hooks/use-projects"

export default function NewProjectPage() {
    const router = useRouter()
    const { createProject } = useProjects()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        projectType: "",
        status: "PLANNING",
        priority: "MEDIUM",
        location: "",
        startDate: "",
        endDate: "",
        estimatedHours: "",
        budget: "",
        progress: 0,
        notes: "",
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            await createProject({
                ...formData,
                estimatedHours: formData.estimatedHours ? parseInt(formData.estimatedHours) : undefined,
                budget: formData.budget ? parseFloat(formData.budget) : undefined,
                progress: formData.progress,
                attachments: [],
                tags: [],
            })
            router.push("/admin/projects")
        } catch (error) {
            console.error("Failed to create project:", error)
            setLoading(false)
        }
    }

    const handleChange = (field: string, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button asChild variant="ghost" size="sm">
                    <Link href="/admin/projects">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Projects
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Create New Project</h1>
                    <p className="text-gray-600 mt-1">Add a new project to your portfolio</p>
                </div>
            </div>

            {/* Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Project Details</CardTitle>
                    <CardDescription>Fill in the project information below</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="title">Project Title *</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => handleChange("title", e.target.value)}
                                    placeholder="Enter project title"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="customerName">Customer Name *</Label>
                                <Input
                                    id="customerName"
                                    value={formData.customerName}
                                    onChange={(e) => handleChange("customerName", e.target.value)}
                                    placeholder="Enter customer name"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="customerEmail">Customer Email</Label>
                                <Input
                                    id="customerEmail"
                                    type="email"
                                    value={formData.customerEmail}
                                    onChange={(e) => handleChange("customerEmail", e.target.value)}
                                    placeholder="Enter customer email"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="customerPhone">Customer Phone</Label>
                                <Input
                                    id="customerPhone"
                                    value={formData.customerPhone}
                                    onChange={(e) => handleChange("customerPhone", e.target.value)}
                                    placeholder="Enter customer phone"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="projectType">Project Type *</Label>
                                <Select value={formData.projectType} onValueChange={(value) => handleChange("projectType", value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select project type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ELECTRICAL">Electrical</SelectItem>
                                        <SelectItem value="HVAC">HVAC</SelectItem>
                                        <SelectItem value="REFRIGERATION">Refrigeration</SelectItem>
                                        <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                                        <SelectItem value="INSTALLATION">Installation</SelectItem>
                                        <SelectItem value="REPAIR">Repair</SelectItem>
                                        <SelectItem value="UPGRADE">Upgrade</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="location">Location</Label>
                                <Input
                                    id="location"
                                    value={formData.location}
                                    onChange={(e) => handleChange("location", e.target.value)}
                                    placeholder="Enter project location"
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => handleChange("description", e.target.value)}
                                placeholder="Enter project description"
                                rows={4}
                            />
                        </div>

                        {/* Project Details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PLANNING">Planning</SelectItem>
                                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                        <SelectItem value="ACTIVE">Active</SelectItem>
                                        <SelectItem value="ON_HOLD">On Hold</SelectItem>
                                        <SelectItem value="COMPLETED">Completed</SelectItem>
                                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="priority">Priority</Label>
                                <Select value={formData.priority} onValueChange={(value) => handleChange("priority", value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="LOW">Low</SelectItem>
                                        <SelectItem value="MEDIUM">Medium</SelectItem>
                                        <SelectItem value="HIGH">High</SelectItem>
                                        <SelectItem value="URGENT">Urgent</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="progress">Progress (%)</Label>
                                <Input
                                    id="progress"
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={formData.progress}
                                    onChange={(e) => handleChange("progress", parseInt(e.target.value) || 0)}
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="startDate">Start Date</Label>
                                <Input
                                    id="startDate"
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => handleChange("startDate", e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="endDate">End Date</Label>
                                <Input
                                    id="endDate"
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) => handleChange("endDate", e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Budget and Hours */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="estimatedHours">Estimated Hours</Label>
                                <Input
                                    id="estimatedHours"
                                    type="number"
                                    min="0"
                                    value={formData.estimatedHours}
                                    onChange={(e) => handleChange("estimatedHours", e.target.value)}
                                    placeholder="Enter estimated hours"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="budget">Budget</Label>
                                <Input
                                    id="budget"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.budget}
                                    onChange={(e) => handleChange("budget", e.target.value)}
                                    placeholder="Enter budget amount"
                                />
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                value={formData.notes}
                                onChange={(e) => handleChange("notes", e.target.value)}
                                placeholder="Enter any additional notes"
                                rows={3}
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end gap-4">
                            <Button asChild variant="outline">
                                <Link href="/admin/projects">Cancel</Link>
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? (
                                    <>
                                        <LoadingSpinner className="mr-2 h-4 w-4" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Create Project
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
