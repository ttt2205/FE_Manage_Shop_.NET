import type { Staff } from "../types"

export const staffData: Staff[] = [
  {
    id: "STF001",
    name: "Admin User",
    email: "admin@store.com",
    role: "admin",
    phone: "0900000001",
    createdAt: "2024-01-01T00:00:00Z",
    isActive: true,
  },
  {
    id: "STF002",
    name: "Nguyễn Thị Hoa",
    email: "hoa.nguyen@store.com",
    role: "staff",
    phone: "0900000002",
    createdAt: "2024-01-15T00:00:00Z",
    isActive: true,
  },
  {
    id: "STF003",
    name: "Trần Văn Khoa",
    email: "khoa.tran@store.com",
    role: "staff",
    phone: "0900000003",
    createdAt: "2024-02-01T00:00:00Z",
    isActive: true,
  },
  {
    id: "STF004",
    name: "Lê Thị Lan",
    email: "lan.le@store.com",
    role: "staff",
    phone: "0900000004",
    createdAt: "2024-03-01T00:00:00Z",
    isActive: false,
  },
]
