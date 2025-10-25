"use client"

import { useState } from "react"
import { Plus, Search, Edit, Trash2, ToggleLeft, ToggleRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { promotionsData } from "@/lib/data/promotions"
import type { Promotion } from "@/lib/types"

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>(promotionsData)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null)
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "percentage" as "percentage" | "fixed",
    discountValue: "",
    minPurchase: "",
    maxDiscount: "",
    startDate: "",
    endDate: "",
    usageLimit: "",
  })

  const filteredPromotions = promotions.filter(
    (promo) =>
      promo.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      promo.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAdd = () => {
    const newPromotion: Promotion = {
      id: `PROMO${String(promotions.length + 1).padStart(3, "0")}`,
      code: formData.code,
      description: formData.description,
      discountType: formData.discountType,
      discountValue: Number(formData.discountValue),
      minPurchase: Number(formData.minPurchase),
      maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : undefined,
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
      isActive: true,
      usageCount: 0,
      usageLimit: formData.usageLimit ? Number(formData.usageLimit) : undefined,
    }
    setPromotions([...promotions, newPromotion])
    setIsAddDialogOpen(false)
    resetForm()
  }

  const handleEdit = () => {
    if (!selectedPromotion) return
    setPromotions(
      promotions.map((p) =>
        p.id === selectedPromotion.id
          ? {
              ...p,
              code: formData.code,
              description: formData.description,
              discountType: formData.discountType,
              discountValue: Number(formData.discountValue),
              minPurchase: Number(formData.minPurchase),
              maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : undefined,
              startDate: new Date(formData.startDate).toISOString(),
              endDate: new Date(formData.endDate).toISOString(),
              usageLimit: formData.usageLimit ? Number(formData.usageLimit) : undefined,
            }
          : p,
      ),
    )
    setIsEditDialogOpen(false)
    setSelectedPromotion(null)
    resetForm()
  }

  const handleDelete = () => {
    if (!selectedPromotion) return
    setPromotions(promotions.filter((p) => p.id !== selectedPromotion.id))
    setIsDeleteDialogOpen(false)
    setSelectedPromotion(null)
  }

  const toggleActive = (promotion: Promotion) => {
    setPromotions(promotions.map((p) => (p.id === promotion.id ? { ...p, isActive: !p.isActive } : p)))
  }

  const resetForm = () => {
    setFormData({
      code: "",
      description: "",
      discountType: "percentage",
      discountValue: "",
      minPurchase: "",
      maxDiscount: "",
      startDate: "",
      endDate: "",
      usageLimit: "",
    })
  }

  const openEditDialog = (promotion: Promotion) => {
    setSelectedPromotion(promotion)
    setFormData({
      code: promotion.code,
      description: promotion.description,
      discountType: promotion.discountType,
      discountValue: String(promotion.discountValue),
      minPurchase: String(promotion.minPurchase),
      maxDiscount: promotion.maxDiscount ? String(promotion.maxDiscount) : "",
      startDate: new Date(promotion.startDate).toISOString().split("T")[0],
      endDate: new Date(promotion.endDate).toISOString().split("T")[0],
      usageLimit: promotion.usageLimit ? String(promotion.usageLimit) : "",
    })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (promotion: Promotion) => {
    setSelectedPromotion(promotion)
    setIsDeleteDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản Lý Khuyến Mãi</h1>
          <p className="text-muted-foreground">Quản lý mã giảm giá và chương trình khuyến mãi</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Thêm khuyến mãi
        </Button>
      </div>

      <Card className="border-2 border-border">
        <CardHeader>
          <CardTitle>Danh sách khuyến mãi</CardTitle>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo mã, mô tả..."
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
                <TableHead className="font-bold">Mã</TableHead>
                <TableHead className="font-bold">Mô tả</TableHead>
                <TableHead className="font-bold">Loại</TableHead>
                <TableHead className="font-bold">Giá trị</TableHead>
                <TableHead className="font-bold">Sử dụng</TableHead>
                <TableHead className="font-bold">Trạng thái</TableHead>
                <TableHead className="font-bold text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPromotions.map((promotion) => (
                <TableRow key={promotion.id} className="border-b border-border">
                  <TableCell className="font-medium font-mono">{promotion.code}</TableCell>
                  <TableCell className="max-w-xs truncate">{promotion.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-2 border-border">
                      {promotion.discountType === "percentage" ? "Phần trăm" : "Cố định"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {promotion.discountType === "percentage"
                      ? `${promotion.discountValue}%`
                      : new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                          promotion.discountValue,
                        )}
                  </TableCell>
                  <TableCell>
                    {promotion.usageCount}
                    {promotion.usageLimit ? ` / ${promotion.usageLimit}` : ""}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleActive(promotion)}
                      className="gap-2 border-2 border-border"
                    >
                      {promotion.isActive ? (
                        <>
                          <ToggleRight className="h-4 w-4 text-green-600" />
                          <span className="text-green-600">Hoạt động</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Tắt</span>
                        </>
                      )}
                    </Button>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openEditDialog(promotion)}
                        className="border-2 border-border"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openDeleteDialog(promotion)}
                        className="border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
            resetForm()
          }
        }}
      >
        <DialogContent className="border-2 border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isAddDialogOpen ? "Thêm khuyến mãi mới" : "Chỉnh sửa khuyến mãi"}</DialogTitle>
            <DialogDescription>
              {isAddDialogOpen ? "Nhập thông tin khuyến mãi mới" : "Cập nhật thông tin khuyến mãi"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="code">Mã khuyến mãi</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="border-2 border-border font-mono"
                  placeholder="SUMMER2024"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="discountType">Loại giảm giá</Label>
                <Select
                  value={formData.discountType}
                  onValueChange={(value: "percentage" | "fixed") => setFormData({ ...formData, discountType: value })}
                >
                  <SelectTrigger className="border-2 border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-2 border-border">
                    <SelectItem value="percentage">Phần trăm (%)</SelectItem>
                    <SelectItem value="fixed">Cố định (VND)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Mô tả</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="border-2 border-border"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="discountValue">
                  Giá trị giảm {formData.discountType === "percentage" ? "(%)" : "(VND)"}
                </Label>
                <Input
                  id="discountValue"
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                  className="border-2 border-border"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="minPurchase">Giá trị đơn tối thiểu (VND)</Label>
                <Input
                  id="minPurchase"
                  type="number"
                  value={formData.minPurchase}
                  onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                  className="border-2 border-border"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="maxDiscount">Giảm tối đa (VND) - Tùy chọn</Label>
                <Input
                  id="maxDiscount"
                  type="number"
                  value={formData.maxDiscount}
                  onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                  className="border-2 border-border"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="usageLimit">Giới hạn sử dụng - Tùy chọn</Label>
                <Input
                  id="usageLimit"
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                  className="border-2 border-border"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Ngày bắt đầu</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="border-2 border-border"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endDate">Ngày kết thúc</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="border-2 border-border"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddDialogOpen(false)
                setIsEditDialogOpen(false)
                resetForm()
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

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="border-2 border-border">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa khuyến mãi <strong>{selectedPromotion?.code}</strong>? Hành động này không thể
              hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="border-2 border-border">
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
