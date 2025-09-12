import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Package2, Upload, X, Loader2, Image as ImageIcon } from "lucide-react"
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
  const [imageUploading, setImageUploading] = useState(false)
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
    imageUrl: "",
  })
  const [imagePreview, setImagePreview] = useState<string>("")

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
        imageUrl: product.imageUrl || "",
      })
      setImagePreview(product.imageUrl || "")
    }
  }, [product])

// Cloudinary upload function
const uploadImageToCloudinary = async (file: File) => {
  const cloudinaryData = new FormData()
  cloudinaryData.append("file", file)
  cloudinaryData.append("upload_preset", "Images")
  cloudinaryData.append("asset_folder", "ProductsImage")
  cloudinaryData.append("cloud_name", "dqoo1d1ip")
  
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/dqoo1d1ip/image/upload`,
    {
      method: 'POST',
      body: cloudinaryData,
    }
  )

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  return data.secure_url
}

  // Handle image file selection and upload
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
    if (!validTypes.includes(file.type)) {
      alert("Please upload a valid image file (JPEG, PNG, GIF, WebP)")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB")
      return
    }

    try {
      setImageUploading(true)
      
      // Create preview
      const previewUrl = URL.createObjectURL(file)
      setImagePreview(previewUrl)

      // Upload to Cloudinary
      const cloudinaryUrl = await uploadImageToCloudinary(file)
      
      // Update form data
      updateFormData("imageUrl", cloudinaryUrl)
      
      // Clean up preview URL and set Cloudinary URL
      URL.revokeObjectURL(previewUrl)
      setImagePreview(cloudinaryUrl)
      
    } catch (error: any) {
      console.error("Error uploading image:", error)
      alert("Failed to upload image. Please try again.")
      setImagePreview("")
      updateFormData("imgUrl", "")
    } finally {
      setImageUploading(false)
    }
  }

  // Remove uploaded image
  const handleRemoveImage = () => {
    setImagePreview("")
    updateFormData("imgUrl", "")
  }

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
        imageUrl: formData.imageUrl || "",
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
          {/* Image Upload Section */}
          <div className="space-y-2">
            <Label>Product Image</Label>
            
            {!imagePreview ? (
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
                <div className="space-y-4">
                  <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                  <div className="space-y-2">
                    <Label htmlFor="image-upload" className="cursor-pointer">
                      <div className="flex items-center justify-center gap-2">
                        {imageUploading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4" />
                            Click to upload image
                          </>
                        )}
                      </div>
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      PNG, JPG, GIF, WebP up to 5MB
                    </p>
                  </div>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={imageUploading || loading}
                    className="sr-only"
                  />
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className="relative w-full h-48 rounded-lg overflow-hidden bg-muted">
                  <img
                    src={imagePreview}
                    alt="Product preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={handleRemoveImage}
                      disabled={imageUploading || loading}
                      className="gap-1"
                    >
                      <X className="h-3 w-3" />
                      Remove
                    </Button>
                  </div>
                </div>
                <div className="mt-2 text-center">
                  <Label htmlFor="image-replace" className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                    Click to replace image
                  </Label>
                  <Input
                    id="image-replace"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={imageUploading || loading}
                    className="sr-only"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateFormData("name", e.target.value)}
                placeholder="Enter product name"
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => updateFormData("category", value)} required disabled={loading}>
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
                disabled={loading}
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
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vendor">Vendor *</Label>
              <Select value={formData.vendorId} onValueChange={(value) => updateFormData("vendorId", value)} required disabled={loading}>
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
              <Select value={formData.timeSlot} onValueChange={(value) => updateFormData("timeSlot", value)} required disabled={loading}>
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
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => updateFormData("tags", e.target.value)}
              placeholder="organic, fresh, premium"
              disabled={loading}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="available"
              checked={formData.available}
              onCheckedChange={(checked) => updateFormData("available", checked)}
              disabled={loading}
            />
            <Label htmlFor="available">Available for sale</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || imageUploading} 
              className="bg-gradient-to-r from-primary to-accent min-w-[120px]"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                product ? "Update Product" : "Add Product"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
