"use client";

import { useState, useEffect } from "react";
import { Search, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import orderService from "@/service/orderService";

// ===== Kiểu dữ liệu =====
type OrderItem = {
  productName: string;
  price: number;
  quantity: number;
  subtotal: number;
};

type Order = {
  id: string;
  customerName: string;
  staffName: string;
  promotionCode?: string | null;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: string;
  createdAt: string;
  status: string;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  // ===== Lấy danh sách đơn hàng =====
  useEffect(() => {
    fetchOrders();
  }, []);

  // =================== Fetch Functions ========================
  const fetchOrders = async () => {
      try {
        const res: any = await orderService.getAll();
        if (res && res.result.length > 0) {
          const mapped: Order[] = res.result.map((o: any) => ({
            id: o.id.toString(),
            customerName: o.customer?.name || "Khách vãng lai",
            staffName: o.user?.fullName || "N/A",
            promotionCode: o.promotion?.promoCode || null,
            items: o.items?.map((i: any) => ({
              productName: i.product?.productName || `Sản phẩm #${i.productId}`,
              price: i.price,
              quantity: i.quantity,
              subtotal: i.price * i.quantity,
            })) ?? [],
            subtotal: o.totalAmount + o.discountAmount,
            discount: o.discountAmount,
            total: o.totalAmount,
            paymentMethod: "Tiền mặt",
            createdAt: o.orderDate,
            status: o.status,
          }));
          setOrders(mapped);
        }
      } catch (error) {
        console.error("Lấy danh sách đơn hàng thất bại:", error);
      }
    };

  // ===== Lọc đơn hàng theo tìm kiếm =====
  const filteredOrders = orders.filter(
    (o) =>
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ===== Mở modal chi tiết và gọi API getById =====
  const openDetailDialog = async (orderId: string) => {
    try {
      const res = await orderService.getById(orderId);
      if (res && res.data) {
        const o = res.data;
        const mappedOrder: Order = {
          id: o.id.toString(),
          customerName: o.customer?.name || "Khách vãng lai",
          staffName: o.user?.fullName || "N/A",
          promotionCode: o.promotion?.promoCode || null,
          items: o.items?.map((i: any) => ({
            productName: i.product?.productName || `Sản phẩm #${i.productId}`,
            price: i.price,
            quantity: i.quantity,
            subtotal: i.price * i.quantity,
          })) ?? [],
          subtotal: o.totalAmount + o.discountAmount,
          discount: o.discountAmount,
          total: o.totalAmount,
          paymentMethod: "Tiền mặt",
          createdAt: o.orderDate,
          status: o.status,
        };
        setSelectedOrder(mappedOrder);
        setIsDetailDialogOpen(true);
      }
    } catch (error) {
      console.error("Lấy chi tiết đơn hàng thất bại:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Quản Lý Đơn Hàng</h1>
        <p className="text-muted-foreground">Xem và quản lý danh sách đơn hàng</p>
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
                <TableHead>Mã đơn</TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Nhân viên</TableHead>
                <TableHead className="text-center">Số lượng</TableHead>
                <TableHead>Tổng tiền</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono">{o.id}</TableCell>
                    <TableCell>{o.customerName}</TableCell>
                    <TableCell>{o.staffName}</TableCell>
                    <TableCell className="text-center">{o.items.length}</TableCell>
                    <TableCell className="font-semibold">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(o.total)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          o.status === "paid"
                            ? "default"
                            : o.status === "pending"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {o.status === "paid"
                          ? "Đã thanh toán"
                          : o.status === "pending"
                          ? "Chờ xử lý"
                          : "Đã hủy"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(o.createdAt).toLocaleDateString("vi-VN")}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openDetailDialog(o.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-6">
                    Không có đơn hàng nào.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ===== Modal chi tiết ===== */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="border-2 border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết đơn hàng #{selectedOrder?.id}</DialogTitle>
            <DialogDescription>Thông tin chi tiết đơn hàng</DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              {/* Thông tin khách hàng & nhân viên */}
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
                  <p className="text-sm text-muted-foreground">Thanh toán</p>
                  <p className="font-medium">{selectedOrder.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ngày tạo</p>
                  <p className="font-medium">
                    {new Date(selectedOrder.createdAt).toLocaleString("vi-VN")}
                  </p>
                </div>
              </div>

              {/* Danh sách sản phẩm */}
              <div className="border-t border-border pt-4">
                <p className="font-semibold mb-2">Sản phẩm</p>
                {selectedOrder.items.map((i, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center border-b border-border py-2"
                  >
                    <div>
                      <p className="font-medium">{i.productName}</p>
                      <p className="text-sm text-muted-foreground">
                        {i.quantity} x{" "}
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(i.price)}
                      </p>
                    </div>
                    <p className="font-semibold">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(i.subtotal)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Tổng tiền */}
              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between">
                  <p>Tạm tính</p>
                  <p>
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(selectedOrder.total + selectedOrder.discount)}
                  </p>
                </div>

                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <p>
                      Giảm giá{" "}
                      {selectedOrder.promotionCode &&
                        `(${selectedOrder.promotionCode})`}
                    </p>
                    <p>
                      -
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(selectedOrder.discount)}
                    </p>
                  </div>
                )}

                <div className="flex justify-between font-bold border-t border-border pt-2 text-lg">
                  <p>Tổng cộng</p>
                  <p>
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(selectedOrder.total)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
