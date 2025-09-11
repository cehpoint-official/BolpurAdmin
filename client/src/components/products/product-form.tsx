import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Package2 } from "lucide-react"
import type { Product, Vendor, Category } from "@/types"
import { TIME_SLOTS } from "@/constants"

interface ProductFormProps {
  product?: Product | null
  vendors: Vendor[]
  categories: Category[]
  onSubmit: (product: Omit<Product, "id">) => Promise<void>
  onCancel: () => void
}

export function ProductForm({ product, vendors, categories, onSubmit, onCancel }: ProductFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
    vendorId: "",
    timeSlot: "",
    description: "",
    tags: "",
    available: true,
  })

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        category: product.category,
        price: product.price.toString(),
        stock: product.stock.toString(),
        vendorId: product.vendorId,
        timeSlot: product.timeSlot,
        description: product.description || "",
        tags: product.tags?.join(", ") || "",
        available: product.available,
      })
    }
  }, [product])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const vendor = vendors.find((v) => v.id === formData.vendorId)
      if (!vendor) {
        throw new Error("Please select a valid vendor")
      }

      const productData = {
        name: formData.name,
        category: formData.category,
        price: Number.parseFloat(formData.price),
        stock: Number.parseInt(formData.stock),
        vendorId: formData.vendorId,
        vendorName: vendor.name,
        timeSlot: formData.timeSlot as "morning" | "afternoon" | "evening",
        description: formData.description,
        tags: formData.tags ? formData.tags.split(",").map((tag) => tag.trim()) : [],
        available: formData.available,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      await onSubmit(productData)
    } catch (error: any) {
      console.error("Error saving product:", error)
      alert(error.message || "Failed to save product. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package2 className="w-5 h-5" />
            {product ? "Edit Product" : "Add New Product"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateFormData("name", e.target.value)}
                placeholder="Enter product name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => updateFormData("category", value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories
                    .filter((cat) => cat.isActive)
                    .map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price (₹) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => updateFormData("price", e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Stock Quantity *</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => updateFormData("stock", e.target.value)}
                placeholder="0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vendor">Vendor *</Label>
              <Select value={formData.vendorId} onValueChange={(value) => updateFormData("vendorId", value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      {vendor.name} - {vendor.location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeSlot">Time Slot *</Label>
              <Select value={formData.timeSlot} onValueChange={(value) => updateFormData("timeSlot", value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select time slot" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_SLOTS.map((slot) => (
                    <SelectItem key={slot.value} value={slot.value}>
                      {slot.icon} {slot.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateFormData("description", e.target.value)}
              placeholder="Enter product description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => updateFormData("tags", e.target.value)}
              placeholder="organic, fresh, premium"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="available"
              checked={formData.available}
              onCheckedChange={(checked) => updateFormData("available", checked)}
            />
            <Label htmlFor="available">Available for sale</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-gradient-to-r from-primary to-accent">
              {loading ? "Saving..." : product ? "Update Product" : "Add Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
