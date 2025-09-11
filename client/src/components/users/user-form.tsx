import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { User } from "lucide-react"
import type { User as UserType } from "@/types"
import { USER_ROLES, DEFAULT_CATEGORIES } from "@/constants"

interface UserFormProps {
  user?: UserType | null
  onSubmit: (user: Omit<UserType, "id">) => Promise<void>
  onCancel: () => void
}

export function UserForm({ user, onSubmit, onCancel }: UserFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "manager" as UserType["role"],
    managedCategory: "all", // Updated default value to be a non-empty string
    isActive: true,
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        managedCategory: user.managedCategory || "all", // Updated default value to be a non-empty string
        isActive: user.isActive,
      })
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        managedCategory: formData.role === "manager" ? formData.managedCategory : undefined,
        isActive: formData.isActive,
        avatar: user?.avatar,
        lastLogin: user?.lastLogin || new Date(),
        createdAt: user?.createdAt || new Date(),
      }

      await onSubmit(userData)
    } catch (error: any) {
      console.error("Error saving user:", error)
      alert(error.message || "Failed to save user. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            {user ? "Edit User" : "Add New User"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => updateFormData("name", e.target.value)}
              placeholder="Enter full name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => updateFormData("email", e.target.value)}
              placeholder="Enter email address"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Select value={formData.role} onValueChange={(value) => updateFormData("role", value)} required>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {USER_ROLES.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.role === "manager" && (
            <div className="space-y-2">
              <Label htmlFor="managedCategory">Managed Category</Label>
              <Select
                value={formData.managedCategory}
                onValueChange={(value) => updateFormData("managedCategory", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category to manage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {DEFAULT_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => updateFormData("isActive", checked)}
            />
            <Label htmlFor="isActive">Active User</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-gradient-to-r from-primary to-accent">
              {loading ? "Saving..." : user ? "Update User" : "Add User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
