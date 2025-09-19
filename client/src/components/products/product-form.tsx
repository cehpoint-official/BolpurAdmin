import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Package2, Upload, X, Loader2, Image as ImageIcon, Check } from "lucide-react"
import type { Product, Vendor, Category } from "@/types"
import { Command, CommandGroup, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

interface ProductFormProps {
  product?: Product | null
  vendors: Vendor[]
  categories: Category[]
  onSubmit: (product: Omit<Product, "id">) => Promise<void>
  onCancel: () => void
}

interface MultiSelectProps {
  options: { value: string; label: string; data?: any }[]
  selected: any[]
  onChange: (selected: any[]) => void
  placeholder: string
  disabled?: boolean
  displayField: string
  valueField: string
}

function MultiSelect({ 
  options, 
  selected, 
  onChange, 
  placeholder, 
  disabled, 
  displayField, 
  valueField 
}: MultiSelectProps) {
  const [open, setOpen] = useState(false)

  const handleSelect = (option: any) => {
    const isSelected = selected.some(item => item[valueField] === option.data[valueField])
    
    if (isSelected) {
      onChange(selected.filter((item) => item[valueField] !== option.data[valueField]))
    } else {
      onChange([...selected, option.data])
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {selected.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {selected.map((item) => (
                <Badge key={item[valueField]} variant="secondary" className="mr-1">
                  {item[displayField]}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-1 h-4 w-4 p-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      onChange(selected.filter(i => i[valueField] !== item[valueField]))
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          ) : (
            placeholder
          )}
          <Package2 className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandGroup>
            {options.map((option) => {
              const isSelected = selected.some(item => item[valueField] === option.data[valueField])
              return (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => handleSelect(option)}
                >
                  <Check
                    className={`mr-2 h-4 w-4 ${
                      isSelected ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  {option.label}
                </CommandItem>
              )
            })}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export function ProductForm({ product, vendors, categories, onSubmit, onCancel }: ProductFormProps) {
  const [loading, setLoading] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    categories: [] as Category[],
    price: "",
    stock: "",
    vendors: [] as Vendor[],
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
        categories: product.categories || [],
        price: product.price.toString(),
        stock: product.stock.toString(),
        vendors: product.vendors || [],
        description: product.description || "",
        tags: product.tags?.join(", ") || "",
        available: product.available,
        imageUrl: product.imageUrl || "",
      })
      setImagePreview(product.imageUrl || "")
    }
  }, [product])

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

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
    if (!validTypes.includes(file.type)) {
      alert("Please upload a valid image file (JPEG, PNG, GIF, WebP)")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB")
      return
    }

    try {
      setImageUploading(true)
      
      const previewUrl = URL.createObjectURL(file)
      setImagePreview(previewUrl)

      const cloudinaryUrl = await uploadImageToCloudinary(file)
      
      updateFormData("imageUrl", cloudinaryUrl)
      
      URL.revokeObjectURL(previewUrl)
      setImagePreview(cloudinaryUrl)
      
    } catch (error: any) {
      console.error("Error uploading image:", error)
      alert("Failed to upload image. Please try again.")
      setImagePreview("")
      updateFormData("imageUrl", "")
    } finally {
      setImageUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setImagePreview("")
    updateFormData("imageUrl", "")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (formData.vendors.length === 0) {
        throw new Error("Please select at least one vendor")
      }

      if (formData.categories.length === 0) {
        throw new Error("Please select at least one category")
      }

      const productData = {
        name: formData.name,
        categories: formData.categories,
        price: Number.parseFloat(formData.price),
        stock: Number.parseInt(formData.stock),
        vendors: formData.vendors,
        description: formData.description,
        tags: formData.tags ? formData.tags.split(",").map((tag) => tag.trim()) : [],
        available: formData.available,
        imageUrl: formData.imageUrl,
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
              <Label htmlFor="categories">Categories *</Label>
              <MultiSelect
                options={categories
                  .filter((cat) => cat.isActive)
                  .map((cat) => ({
                    value: cat.id,
                    label: cat.name,
                    data: cat
                  }))}
                selected={formData.categories}
                onChange={(value) => updateFormData("categories", value)}
                placeholder="Select categories"
                disabled={loading}
                displayField="name"
                valueField="id"
              />
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

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="vendors">Vendors *</Label>
              <MultiSelect
                options={vendors
                  .filter((vendor) => vendor.isActive)
                  .map((vendor) => ({
                    value: vendor.id,
                    label: `${vendor.name} - ${vendor.location}`,
                    data: vendor
                  }))}
                selected={formData.vendors}
                onChange={(value) => updateFormData("vendors", value)}
                placeholder="Select vendors"
                disabled={loading}
                displayField="name"
                valueField="id"
              />
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
