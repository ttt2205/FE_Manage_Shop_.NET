"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, Package, Tag, ShoppingCart, UserCog, BarChart3, Receipt, Boxes} from "lucide-react"

const menuItems = [
  {
    title: "Tổng quan",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Khách hàng",
    href: "/admin/customers",
    icon: Users,
  },
  {
    title: "Sản phẩm",
    href: "/admin/products",
    icon: Package,
  },
  {
    title: "Khuyến mãi",
    href: "/admin/promotions",
    icon: Tag,
  },
  {
    title: "Đơn hàng",
    href: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    title: "Nhân viên",
    href: "/admin/staff",
    icon: UserCog,
  },
  {
    title: "Thống kê",
    href: "/admin/statistics",
    icon: BarChart3,
  },
  {
    title: "Hóa đơn",
    href: "/admin/invoices",
    icon: Receipt,
  },
{
    title: "Kiểm kê",
    href: "/admin/audit_store",
    icon: Boxes,
},
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div
      className="d-flex flex-column"
      style={{ width: "256px", borderRight: "2px solid #dee2e6", backgroundColor: "#f8f9fa", height: "100%" }}
    >
      <div
        className="d-flex align-items-center"
        style={{ height: "64px", borderBottom: "2px solid #dee2e6", paddingLeft: "1.5rem", paddingRight: "1.5rem" }}
      >
        <h1 className="fs-5 fw-bold mb-0">Quản Lý Cửa Hàng</h1>
      </div>
      <nav className="flex-grow-1 p-3" style={{ overflowY: "auto" }}>
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`d-flex align-items-center gap-3 px-3 py-2 mb-2 text-decoration-none rounded-2 border-2 transition-all ${
                isActive ? "bg-primary text-white border-primary" : "border-transparent text-dark hover:bg-light"
              }`}
              style={{
                borderColor: isActive ? "#0d6efd" : "transparent",
                backgroundColor: isActive ? "#0d6efd" : "transparent",
                color: isActive ? "white" : "#212529",
              }}
            >
              <Icon size={20} />
              <span className="small fw-medium">{item.title}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
