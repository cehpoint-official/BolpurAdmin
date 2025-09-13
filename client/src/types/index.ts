export interface User {
  id: string
  name: string
  email: string
  password: string
  role: "admin" | "subadmin"
  avatar?: string
  isActive: boolean
  lastLogin: Date
  createdAt: Date
  managedCategory?: string
}

export interface Category {
  id: string
  name: string
  description: string
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date
}

// ✅ Updated TimeSlot interface
export interface TimeSlot {
  id: string
  name: string
  label: string
  icon: string
  startTime: string // Format: "HH:MM"
  endTime: string // Format: "HH:MM"
  isActive: boolean
  order: number // For sorting
  createdAt?: Date
  updatedAt?: Date
}

export interface Product {
  id: string
  name: string
  category: string
  price: number
  stock: number
  vendorId: string
  vendorName: string
  timeSlotId: string 
  description: string
  tags: string[]
  available: boolean
  createdAt?: Date
  updatedAt?: Date
  imageUrl?: string
}

export interface Vendor {
  id: string
  name: string
  location: string
  commission: number
  category: string[]
  contactPerson: string
  phone: string
  email: string
  address: string
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date
  totalProducts: number
  totalOrders: number
  rating: number
}

export interface OrderItem {
  productId: string
  productName: string
  quantity: number
  price: number
  total: number
}

export interface Order {
  id: string
  customerName: string
  customerPhone: string
  customerAddress: string
  items: OrderItem[]
  total: number
  status: "pending" | "confirmed" | "preparing" | "ready" | "delivered" | "cancelled"
  paymentStatus: "pending" | "paid" | "failed"
  paymentMethod: "cash" | "online"
  createdAt: Date
  updatedAt: Date
  deliveryTime?: Date
  notes?: string
}

export interface TimeRules {
  [timeSlotId: string]: string[] // timeSlotId -> category IDs
}

export interface DashboardMetrics {
  totalOrders: number
  dailyRevenue: number
  totalProducts: number
  pendingOrders: number
  orderGrowth: number
  revenueGrowth: number
}

export interface PaginationState {
  page: number
  pageSize: number
  total: number
}

export interface FilterState {
  search: string
  category: string
  status: string
  dateRange: string
  vendor: string
  priceRange: { min: string; max: string }
}
