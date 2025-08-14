"use client"

import { useState } from "react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MoreHorizontal, Eye, Edit, Phone, Mail, Download, Plus, MapPin, Calendar } from "lucide-react"

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")

  const customers = [
    {
      id: "CUST-001",
      name: "John Mukamuri",
      email: "john@email.com",
      phone: "+263 77 123 4567",
      type: "Residential",
      location: "Borrowdale, Harare",
      totalProjects: 3,
      totalSpent: 4500,
      lastProject: "2024-01-15",
      status: "Active",
      joinDate: "2023-06-15",
    },
    {
      id: "CUST-002",
      name: "Fresh Foods Supermarket",
      email: "manager@freshfoods.co.zw",
      phone: "+263 77 234 5678",
      type: "Commercial",
      location: "CBD, Harare",
      totalProjects: 8,
      totalSpent: 25000,
      lastProject: "2024-01-10",
      status: "Active",
      joinDate: "2022-03-20",
    },
    {
      id: "CUST-003",
      name: "Bella Vista Restaurant",
      email: "info@bellavista.co.zw",
      phone: "+263 77 345 6789",
      type: "Commercial",
      location: "Avondale, Harare",
      totalProjects: 5,
      totalSpent: 12000,
      lastProject: "2024-01-08",
      status: "Active",
      joinDate: "2023-01-10",
    },
    {
      id: "CUST-004",
      name: "Sarah Chikwanha",
      email: "sarah@email.com",
      phone: "+263 77 456 7890",
      type: "Residential",
      location: "Mount Pleasant, Harare",
      totalProjects: 2,
      totalSpent: 3200,
      lastProject: "2023-12-20",
      status: "Inactive",
      joinDate: "2023-08-05",
    },
    {
      id: "CUST-005",
      name: "Industrial Manufacturing Co.",
      email: "procurement@industrial.co.zw",
      phone: "+263 77 567 8901",
      type: "Industrial",
      location: "Industrial Area, Harare",
      totalProjects: 12,
      totalSpent: 45000,
      lastProject: "2024-01-12",
      status: "Active",
      joinDate: "2021-11-30",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 border-green-200"
      case "Inactive":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Residential":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Commercial":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "Industrial":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === "all" || customer.type.toLowerCase() === typeFilter.toLowerCase()

    return matchesSearch && matchesType
  })

  const totalCustomers = customers.length
  const activeCustomers = customers.filter((c) => c.status === "Active").length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600 mt-1">Manage your customer relationships and history</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-gray-900">{totalCustomers}</div>
            </div>
            <p className="text-sm text-gray-600">Total Customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{activeCustomers}</div>
            <p className="text-sm text-gray-600">Active Customers</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search by name, email, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Customer Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="residential">Residential</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="industrial">Industrial</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customers ({filteredCustomers.length})</CardTitle>
          <CardDescription>Complete customer database with project history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Projects</TableHead>

                  <TableHead>Last Project</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900">{customer.name}</div>
                        <div className="text-sm text-gray-500">{customer.email}</div>
                        <div className="text-sm text-gray-500">{customer.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(customer.type)}>{customer.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <MapPin className="h-3 w-3" />
                        {customer.location}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <div className="font-medium">{customer.totalProjects}</div>
                        <div className="text-xs text-gray-500">projects</div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar className="h-3 w-3" />
                        {customer.lastProject}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(customer.status)}>{customer.status}</Badge>
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
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Customer
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Phone className="mr-2 h-4 w-4" />
                            Call Customer
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="mr-2 h-4 w-4" />
                            Send Email
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>View Project History</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
