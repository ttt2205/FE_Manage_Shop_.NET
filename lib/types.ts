// API Response Types
export interface ApiResponse<T> {
  success: boolean
  status: number
  message: string
  data?: T
}

export interface ApiListResponse<T> {
  success: boolean
  status: number
  message: string
  results: T[]
}

export interface ApiErrorResponse {
  success: boolean
  status: number
  error: string
  message: string
}

// Entity Types
export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address: string
  totalPurchases: number
  createdAt: string
}

export interface Product {
  id: string
  name: string
  sku: string
  category: string
  price: number
  stock: number
  image: string
  description: string
  createdAt: string
}

export interface Promotion {
  id: string
  code: string
  description: string
  discountType: "percentage" | "fixed"
  discountValue: number
  minPurchase: number
  maxDiscount?: number
  startDate: string
  endDate: string
  isActive: boolean
  usageCount: number
  usageLimit?: number
}

export interface Staff {
  id: string
  name: string
  email: string
  role: "admin" | "staff"
  phone: string
  createdAt: string
  isActive: boolean
}

export interface OrderItem {
  productId: string
  productName: string
  quantity: number
  price: number
  subtotal: number
}

export interface Order {
  id: string
  customerId: string
  customerName: string
  staffId: string
  staffName: string
  items: OrderItem[]
  subtotal: number
  discount: number
  promotionCode?: string
  total: number
  paymentMethod: "cash" | "card" | "transfer"
  status: "completed" | "refunded" | "cancelled"
  createdAt: string
}

export interface RevenueStats {
  totalRevenue: number
  totalOrders: number
  averageOrderValue: number
  topProducts: Array<{
    productId: string
    productName: string
    quantity: number
    revenue: number
  }>
  revenueByDay: Array<{
    date: string
    revenue: number
    orders: number
  }>
}
