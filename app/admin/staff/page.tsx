"use client"

import { useState } from "react"
import { Plus, Search, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { staffData } from "@/lib/data/staff"
import type { Staff } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>(staffData)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "staff" as "admin" | "staff",
    phone: "",
  })

  const filteredStaff = staff.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAdd = () => {
    const newStaff: Staff = {
      id: `STF${String(staff.length + 1).padStart(3, "0")}`,
      ...formData,
      createdAt: new Date().toISOString(),
      isActive: true,
    }
    setStaff([...staff, newStaff])
    setIsAddDialogOpen(false)
    setFormData({ name: "", email: "", role: "staff", phone: "" })
  }

  const handleEdit = () => {
    if (!selectedStaff) return
    setStaff(staff.map((s) => (s.id === selectedStaff.id ? { ...s, ...formData } : s)))
    setIsEditDialogOpen(false)
    setSelectedStaff(null)
    setFormData({ name: "", email: "", role: "staff", phone: "" })
  }

  const toggleActive = (staffMember: Staff) => {
    setStaff(staff.map((s) => (s.id === staffMember.id ? { ...s, isActive: !s.isActive } : s)))
  }

  const openEditDialog = (staffMember: Staff) => {
    setSelectedStaff(staffMember)
    setFormData({
      name: staffMember.name,
      email: staffMember.email,
      role: staffMember.role,
      phone: staffMember.phone,
    })
    setIsEditDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản Lý Nhân Viên</h1>
          <p className="text-muted-foreground">Quản lý tài khoản nhân viên</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Thêm nhân viên
        </Button>
      </div>

      <Card className="border-2 border-border">
        <CardHeader>
          <CardTitle>Danh sách nhân viên</CardTitle>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-2 border-border"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-b-2 border-border">
                <TableHead className="font-bold">Mã NV</TableHead>
                <TableHead className="font-bold">Tên</TableHead>
                <TableHead className="font-bold">Email</TableHead>
                <TableHead className="font-bold">Số điện thoại</TableHead>
                <TableHead className="font-bold">Vai trò</TableHead>
                <TableHead className="font-bold">Trạng thái</TableHead>
                <TableHead className="font-bold text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStaff.map((staffMember) => (
                <TableRow key={staffMember.id} className="border-b border-border">
                  <TableCell className="font-medium">{staffMember.id}</TableCell>
                  <TableCell>{staffMember.name}</TableCell>
                  <TableCell>{staffMember.email}</TableCell>
                  <TableCell>{staffMember.phone}</TableCell>
                  <TableCell>
                    <Badge
                      variant={staffMember.role === "admin" ? "default" : "outline"}
                      className="border-2 border-border"
                    >
                      {staffMember.role === "admin" ? "Quản trị" : "Nhân viên"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleActive(staffMember)}
                      className="border-2 border-border"
                    >
                      {staffMember.isActive ? (
                        <span className="text-green-600">Hoạt động</span>
                      ) : (
                        <span className="text-muted-foreground">Tắt</span>
                      )}
                    </Button>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => openEditDialog(staffMember)}
                      className="border-2 border-border"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog
        open={isAddDialogOpen || isEditDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddDialogOpen(false)
            setIsEditDialogOpen(false)
            setFormData({ name: "", email: "", role: "staff", phone: "" })
          }
        }}
      >
        <DialogContent className="border-2 border-border">
          <DialogHeader>
            <DialogTitle>{isAddDialogOpen ? "Thêm nhân viên mới" : "Chỉnh sửa nhân viên"}</DialogTitle>
            <DialogDescription>
              {isAddDialogOpen ? "Nhập thông tin nhân viên mới" : "Cập nhật thông tin nhân viên"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Tên nhân viên</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="border-2 border-border"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="border-2 border-border"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="border-2 border-border"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Vai trò</Label>
              <Select
                value={formData.role}
                onValueChange={(value: "admin" | "staff") => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger className="border-2 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-2 border-border">
                  <SelectItem value="staff">Nhân viên</SelectItem>
                  <SelectItem value="admin">Quản trị viên</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddDialogOpen(false)
                setIsEditDialogOpen(false)
                setFormData({ name: "", email: "", role: "staff", phone: "" })
              }}
              className="border-2 border-border"
            >
              Hủy
            </Button>
            <Button onClick={isAddDialogOpen ? handleAdd : handleEdit}>
              {isAddDialogOpen ? "Thêm" : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
