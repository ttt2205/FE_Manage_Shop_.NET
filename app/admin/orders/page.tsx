"use client"

import { useState } from "react"
import { Search, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ordersData } from "@/lib/data/orders"
import type { Order } from "@/lib/types"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function OrdersPage() {
  const [orders] = useState<Order[]>(ordersData)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)

  const filteredOrders = orders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const openDetailDialog = (order: Order) => {
    setSelectedOrder(order)
    setIsDetailDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Quản Lý Đơn Hàng</h1>
        <p className="text-muted-foreground">Xem và quản lý đơn hàng</p>
      </div>

      <Card className="border-2 border-border">
        <CardHeader>
          <CardTitle>Danh sách đơn hàng</CardTitle>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo mã đơn, tên khách hàng..."
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
                <TableHead className="font-bold">Mã đơn</TableHead>
                <TableHead className="font-bold">Khách hàng</TableHead>
                <TableHead className="font-bold">Nhân viên</TableHead>
                <TableHead className="font-bold">Số lượng</TableHead>
                <TableHead className="font-bold text-right">Tổng tiền</TableHead>
                <TableHead className="font-bold">Trạng thái</TableHead>
                <TableHead className="font-bold">Ngày tạo</TableHead>
                <TableHead className="font-bold text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id} className="border-b border-border">
                  <TableCell className="font-medium font-mono">{order.id}</TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell>{order.staffName}</TableCell>
                  <TableCell>{order.items.length} sản phẩm</TableCell>
                  <TableCell className="text-right font-semibold">
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(order.total)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={order.status === "completed" ? "default" : "destructive"}
                      className="border-2 border-border"
                    >
                      {order.status === "completed" ? "Hoàn thành" : order.status === "refunded" ? "Đã hoàn" : "Hủy"}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(order.createdAt).toLocaleDateString("vi-VN")}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => openDetailDialog(order)}
                      className="border-2 border-border"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="border-2 border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết đơn hàng {selectedOrder?.id}</DialogTitle>
            <DialogDescription>Thông tin chi tiết về đơn hàng</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Khách hàng</p>
                  <p className="font-medium">{selectedOrder.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nhân viên</p>
                  <p className="font-medium">{selectedOrder.staffName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phương thức thanh toán</p>
                  <p className="font-medium capitalize">{selectedOrder.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ngày tạo</p>
                  <p className="font-medium">{new Date(selectedOrder.createdAt).toLocaleString("vi-VN")}</p>
                </div>
              </div>
              <div className="border-t-2 border-border pt-4">
                <p className="font-semibold mb-2">Sản phẩm</p>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center border-b border-border pb-2">
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(item.price)} x{" "}
                          {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold">
                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(item.subtotal)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t-2 border-border pt-4 space-y-2">
                <div className="flex justify-between">
                  <p>Tạm tính</p>
                  <p>
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                      selectedOrder.subtotal,
                    )}
                  </p>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <p>Giảm giá {selectedOrder.promotionCode && `(${selectedOrder.promotionCode})`}</p>
                    <p>
                      -
                      {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                        selectedOrder.discount,
                      )}
                    </p>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t-2 border-border pt-2">
                  <p>Tổng cộng</p>
                  <p>
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(selectedOrder.total)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
