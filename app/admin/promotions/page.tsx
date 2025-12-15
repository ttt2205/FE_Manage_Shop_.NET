"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import PromotionService from "@/service/promotionService";
import { Promotion, ApiListResponse } from "@/lib/types";

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(
    null
  );

  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "percentage" as "percentage" | "fixed",
    discountValue: "0",
    minPurchase: "0",
    startDate: "",
    endDate: "",
    usageLimit: "",
    status: "ACTIVE" as "ACTIVE" | "INACTIVE",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // ------------------ Fetch Promotions ------------------
  const fetchPromotion = async () => {
    try {
      setLoading(true);
      const res: any = await PromotionService.getAllPromotion();
      if (res && res.status === 200) {
        const result = res?.result || [];
        const formattedPromotions = res.result.map((item: any) => ({
          id: item.id,
          code: item.promoCode,
          description: item.description,
          discountType:
            item.discountType === "percent" ? "percentage" : "fixed",
          discountValue: item.discountValue,
          minPurchase: item.minOrderAmount,
          startDate: item.startDate,
          endDate: item.endDate,
          usageCount: item.usedCount,
          usageLimit: item.usageLimit,
          isActive: item.status === "active",
        }));
        setPromotions(formattedPromotions);
      }
    } catch (err) {
      toast.error("Lỗi khi tải danh sách khuyến mãi!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotion();
  }, []);

  const filteredPromotions = promotions.filter(
    (promo) =>
      promo.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      promo.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ------------------ Form ------------------
  const resetForm = () => {
    setFormData({
      code: "",
      description: "",
      discountType: "percentage",
      discountValue: "0",
      minPurchase: "0",
      startDate: "",
      endDate: "",
      usageLimit: "",
      status: "ACTIVE",
    });
    setErrors({});
  };

  const buildPayload = () => ({
    promoCode: formData.code.trim(),
    description: formData.description.trim(),
    discountType: formData.discountType === "percentage" ? "percent" : "fixed",
    discountValue: Number(formData.discountValue),
    minOrderAmount: Number(formData.minPurchase),
    startDate: formData.startDate || null,
    endDate: formData.endDate || null,
    usageLimit: formData.usageLimit ? Number(formData.usageLimit) : undefined,
    usedCount: 0,
    status: formData.status === "ACTIVE" ? "active" : "inactive",
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.code.trim()) newErrors.code = "Vui lòng nhập mã khuyến mãi";
    if (!formData.discountValue || Number(formData.discountValue) <= 0)
      newErrors.discountValue = "Giá trị giảm phải lớn hơn 0";
    if (!formData.minPurchase || Number(formData.minPurchase) < 0)
      newErrors.minPurchase = "Giá trị đơn tối thiểu không hợp lệ";
    if (
      formData.startDate &&
      formData.endDate &&
      formData.startDate > formData.endDate
    )
      newErrors.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
    if (formData.usageLimit && Number(formData.usageLimit) < 0)
      newErrors.usageLimit = "Giới hạn sử dụng không hợp lệ";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ------------------ Add/Edit/Delete ------------------
  const handleAdd = async () => {
    if (!validateForm()) return;
    const payload = buildPayload();

    console.log("Payload gửi lên:", payload);

    try {
      setLoading(true);
      const res: any = await PromotionService.createPromotion(payload);
      console.log("Response từ backend:", res);

      // Nếu backend trả về status thành công
      if (res.status === 200 || res.status === 201) {
        toast.success(res.message || "Thêm khuyến mãi thành công!");
        setIsAddDialogOpen(false);
        resetForm();
        fetchPromotion();
      } else {
        // Nếu backend trả về lỗi nhưng không throw
        toast.error(res.message || "Thêm khuyến mãi thất bại!");
      }
    } catch (err: any) {
      console.error("Lỗi khi thêm khuyến mãi:", err);

      // Nếu axios error có response từ backend
      if (err.response && err.response.data) {
        toast.error(
          err.response.data.Message || "Lỗi server hoặc dữ liệu không hợp lệ!"
        );
      } else {
        toast.error("Lỗi server hoặc dữ liệu không hợp lệ!");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedPromotion) return;
    if (!validateForm()) return;

    const payload = buildPayload();
    try {
      const res = await PromotionService.updatePromotion(
        selectedPromotion.id,
        payload
      );
      toast.success("💾 Cập nhật khuyến mãi thành công!");
      setIsEditDialogOpen(false);
      setSelectedPromotion(null);
      resetForm();
      fetchPromotion();
    } catch (err: any) {
      console.error("Lỗi khi thêm khuyến mãi:", err);

      // Nếu axios error có response từ backend
      if (err.response && err.response.data) {
        toast.error(
          err.response.data.Message || "Lỗi server hoặc dữ liệu không hợp lệ!"
        );
      } else {
        toast.error("Lỗi server hoặc dữ liệu không hợp lệ!");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPromotion) return;
    try {
      await PromotionService.deletePromotion(selectedPromotion.id);
      toast.success("Xóa khuyến mãi thành công!");
      setIsDeleteDialogOpen(false);
      setSelectedPromotion(null);
      fetchPromotion();
    } catch (err) {
      toast.error("Lỗi khi xóa khuyến mãi!");
      console.error(err);
    }
  };

  const toggleActive = async (promotion: Promotion) => {
    try {
      // build payload đầy đủ để tránh lỗi 400
      const payload = {
        promoCode: promotion.code,
        description: promotion.description,
        discountType:
          promotion.discountType === "percentage" ? "percent" : "fixed",
        discountValue: Number(promotion.discountValue),
        minOrderAmount: Number(promotion.minPurchase),
        startDate: promotion.startDate
          ? promotion.startDate.split("T")[0]
          : null,
        endDate: promotion.endDate ? promotion.endDate.split("T")[0] : null,
        usageLimit: promotion.usageLimit
          ? Number(promotion.usageLimit)
          : undefined,
        usedCount: promotion.usageCount,
        status: promotion.isActive ? "inactive" : "active",
      };

      const res: any = await PromotionService.updatePromotion(
        promotion.id,
        payload
      );

      toast.success(res?.message || "Cập nhật trạng thái thành công!");
      fetchPromotion();
    } catch (err: any) {
      console.error("Lỗi khi cập nhật trạng thái:", err);
      // hiển thị lỗi chi tiết từ backend
      const msg = err?.response?.data?.Message || err?.response?.data?.message;
      toast.error(msg || "Lỗi khi cập nhật trạng thái!");
    }
  };

  const openEditDialog = (promotion: Promotion) => {
    setSelectedPromotion(promotion);
    setFormData({
      code: promotion.code,
      description: promotion.description,
      discountType: promotion.discountType,
      discountValue: String(promotion.discountValue),
      minPurchase: String(promotion.minPurchase),
      startDate: promotion.startDate?.split("T")[0] || "",
      endDate: promotion.endDate?.split("T")[0] || "",
      usageLimit: promotion.usageLimit ? String(promotion.usageLimit) : "",
      status: promotion.isActive ? "ACTIVE" : "INACTIVE",
    });
    setErrors({});
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (promotion: Promotion) => {
    setSelectedPromotion(promotion);
    setIsDeleteDialogOpen(true);
  };

  // ------------------ Render ------------------
  return (
    <div className="space-y-6">
      <ToastContainer position="top-right" autoClose={2000} />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản Lý Khuyến Mãi</h1>
          <p className="text-muted-foreground">
            Quản lý mã giảm giá và chương trình khuyến mãi
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Thêm khuyến mãi
        </Button>
      </div>

      {/* Table */}
      <Card className="border-2 border-border">
        <CardHeader>
          <CardTitle>Danh sách khuyến mãi</CardTitle>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo mã hoặc mô tả..."
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
                <TableHead>Mã</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Giá trị</TableHead>
                <TableHead>Sử dụng</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-center">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    Đang tải dữ liệu...
                  </TableCell>
                </TableRow>
              ) : filteredPromotions.length > 0 ? (
                filteredPromotions.map((promotion) => (
                  <TableRow
                    key={promotion.id}
                    className="border-b border-border"
                  >
                    <TableCell className="font-mono font-semibold">
                      {promotion.code}
                    </TableCell>
                    <TableCell>{promotion.description}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {promotion.discountType === "percentage"
                          ? "Phần trăm"
                          : "Cố định"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {promotion.discountType === "percentage"
                        ? `${promotion.discountValue}%`
                        : new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(promotion.discountValue)}
                    </TableCell>
                    <TableCell>
                      {promotion.usageCount} / {promotion.usageLimit || "∞"}
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
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-destructive border-destructive hover:bg-destructive hover:text-white"
                          onClick={() => openDeleteDialog(promotion)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    Không có khuyến mãi nào
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog Add/Edit */}
      <Dialog
        open={isAddDialogOpen || isEditDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddDialogOpen(false);
            setIsEditDialogOpen(false);
            resetForm();
          }
        }}
      >
        <DialogContent className="border-2 border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isAddDialogOpen ? "Thêm khuyến mãi" : "Chỉnh sửa khuyến mãi"}
            </DialogTitle>
            <DialogDescription>
              {isAddDialogOpen
                ? "Nhập thông tin khuyến mãi mới"
                : "Cập nhật thông tin khuyến mãi hiện có"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Mã & Loại */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="code">Mã khuyến mãi</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="VD: SALE20"
                />
                {errors.code && (
                  <p className="text-red-500 text-sm mt-1">{errors.code}</p>
                )}
              </div>

              <div>
                <Label htmlFor="discountType">Loại giảm giá</Label>
                <Select
                  value={formData.discountType}
                  onValueChange={(v: "percentage" | "fixed") =>
                    setFormData({ ...formData, discountType: v })
                  }
                >
                  <SelectTrigger id="discountType">
                    <SelectValue placeholder="Chọn loại giảm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Phần trăm (%)</SelectItem>
                    <SelectItem value="fixed">Cố định (VNĐ)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Mô tả */}
            <div>
              <Label htmlFor="description">Mô tả</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="VD: Giảm 20% cho đơn hàng trên 500k"
              />
            </div>

            {/* Giá trị & Đơn tối thiểu */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="discountValue">Giá trị giảm</Label>
                <Input
                  id="discountValue"
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) =>
                    setFormData({ ...formData, discountValue: e.target.value })
                  }
                  placeholder="VD: 20"
                />
                {errors.discountValue && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.discountValue}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="minPurchase">Giá trị đơn tối thiểu</Label>
                <Input
                  id="minPurchase"
                  type="number"
                  value={formData.minPurchase}
                  onChange={(e) =>
                    setFormData({ ...formData, minPurchase: e.target.value })
                  }
                  placeholder="VD: 500000"
                />
                {errors.minPurchase && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.minPurchase}
                  </p>
                )}
              </div>
            </div>

            {/* Ngày bắt đầu & kết thúc */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Ngày bắt đầu</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="endDate">Ngày kết thúc</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                />
                {errors.endDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>
                )}
              </div>
            </div>

            {/* Giới hạn & Trạng thái */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="usageLimit">Giới hạn sử dụng</Label>
                <Input
                  id="usageLimit"
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) =>
                    setFormData({ ...formData, usageLimit: e.target.value })
                  }
                  placeholder="VD: 100"
                />
                {errors.usageLimit && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.usageLimit}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="status">Trạng thái</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v: "ACTIVE" | "INACTIVE") =>
                    setFormData({ ...formData, status: v })
                  }
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                    <SelectItem value="INACTIVE">Tắt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={isAddDialogOpen ? handleAdd : handleEdit}
              className="w-full"
            >
              {isAddDialogOpen ? "Thêm khuyến mãi" : "Cập nhật khuyến mãi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Delete */}
      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => !open && setIsDeleteDialogOpen(false)}
      >
        <DialogContent className="border-2 border-border max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa khuyến mãi{" "}
              <strong>{selectedPromotion?.code}</strong>? Hành động này không
              thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleDelete}
            >
              Xóa khuyến mãi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
