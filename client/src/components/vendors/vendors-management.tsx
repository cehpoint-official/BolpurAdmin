"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { VendorForm } from "./vendor-form"
import { Plus, Building2, MapPin, User, Phone, Mail, Eye, Edit } from "lucide-react"
import type { Category, Vendor } from "@/types"

interface VendorsManagementProps {
  vendors: Vendor[]
  loading?: boolean
  categories: Category[]
  onCreateVendor: (vendor: Omit<Vendor, "id">) => Promise<void>
  onUpdateVendor: (id: string, vendor: Partial<Vendor>) => Promise<void>
  onDeleteVendor: (id: string) => Promise<void>
}

export function VendorsManagement({
  vendors,
  loading,
  categories, 
  onCreateVendor,
  onUpdateVendor,
  onDeleteVendor,
}: VendorsManagementProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null)

  const handleEdit = (vendor: Vendor) => {
    setEditingVendor(vendor)
    setShowAddForm(true)
  }

  const handleFormSubmit = async (vendorData: Omit<Vendor, "id">) => {
    if (editingVendor) {
      await onUpdateVendor(editingVendor.id, vendorData)
    } else {
      await onCreateVendor(vendorData)
    }
    setShowAddForm(false)
    setEditingVendor(null)
  }

  const handleFormCancel = () => {
    setShowAddForm(false)
    setEditingVendor(null)
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 bg-muted rounded w-48"></div>
            <div className="h-4 bg-muted rounded w-64"></div>
          </div>
          <div className="h-10 bg-muted rounded w-32"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-muted rounded-xl"></div>
                    <div className="space-y-2">
                      <div className="h-5 bg-muted rounded w-24"></div>
                      <div className="h-4 bg-muted rounded w-20"></div>
                    </div>
                  </div>
                  <div className="h-6 bg-muted rounded w-16"></div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-4 bg-muted rounded w-full"></div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="text-center space-y-1">
                    <div className="h-6 bg-muted rounded w-8"></div>
                    <div className="h-3 bg-muted rounded w-12"></div>
                  </div>
                  <div className="text-center space-y-1">
                    <div className="h-6 bg-muted rounded w-8"></div>
                    <div className="h-3 bg-muted rounded w-12"></div>
                  </div>
                  <div className="text-center space-y-1">
                    <div className="h-6 bg-muted rounded w-8"></div>
                    <div className="h-3 bg-muted rounded w-12"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Vendor Management</h1>
          <p className="text-muted-foreground">Manage your supplier network and partnerships</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="gap-2 bg-gradient-to-r from-primary to-accent">
          <Plus className="w-4 h-4" />
          Add Vendor
        </Button>
      </div>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vendors.map((vendor) => (
          <Card key={vendor.id} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{vendor.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{vendor.specialty.join(", ")}</p>
                  </div>
                </div>
                <Badge className={vendor.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                  {vendor.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 mr-2" />
                  {vendor.location}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <User className="w-4 h-4 mr-2" />
                  {vendor.contactPerson}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Phone className="w-4 h-4 mr-2" />
                  {vendor.phone}
                </div>
                {vendor.email && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Mail className="w-4 h-4 mr-2" />
                    {vendor.email}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{vendor.commission}%</p>
                  <p className="text-xs text-muted-foreground">Commission</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{vendor.totalProducts || 0}</p>
                  <p className="text-xs text-muted-foreground">Products</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{vendor.totalOrders || 0}</p>
                  <p className="text-xs text-muted-foreground">Orders</p>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-transparent"
                  onClick={() => handleEdit(vendor)}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {vendors.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No vendors added yet</h3>
            <p className="text-muted-foreground mb-4">Start building your supplier network by adding vendors</p>
            <Button onClick={() => setShowAddForm(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Your First Vendor
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Vendor Form Modal */}
      {showAddForm && <VendorForm vendor={editingVendor} categories={categories} onSubmit={handleFormSubmit} onCancel={handleFormCancel} />}
    </div>
  )
}
