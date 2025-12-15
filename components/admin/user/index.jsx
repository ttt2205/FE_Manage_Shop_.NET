"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
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
import { staffData } from "@/lib/data/staff";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getPaginationUser,
  createUser,
  updateUser,
  deleteUser,
} from "@/service/userService";
import { toast } from "react-toastify";
import { Form, Alert, Spinner, Modal } from "react-bootstrap";
import PaginationCustom from "./components/PaginationCustom";

export default function StaffPage() {
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [meta, setMeta] = useState({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPage: 1,
  });
  const [loading, setLoading] = useState(false);

  const [staff, setStaff] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    password: "",
    role: "",
  });

  useEffect(() => {
    fetchUsers();
  }, [page, size, debouncedSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500); // 500ms

    return () => clearTimeout(timer);
  }, [searchTerm]);

  //============================= Fetch Functions ===================================

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getPaginationUser({
        page,
        size,
        search: debouncedSearch ?? "",
      });
      if (res && res.status === 200) {
        setStaff(res.result || []);
        setMeta(res.meta || meta);
      }
    } catch (error) {
      setError("Unable to connect server");
    } finally {
      setLoading(false);
    }
  };

  //============================= Handle Functions ===================================
  // Họ tên (có dấu tiếng Việt)
  const FULLNAME_REGEX = /^[A-Za-zÀ-ỹ]+(?:\s[A-Za-zÀ-ỹ]+)*$/;

  // Username
  const USERNAME_REGEX = /^[a-z0-9_]{4,20}$/;

  const isEmpty = (value) =>
    value === null || value === undefined || value.trim() === "";

  const isValidFullName = (name) => FULLNAME_REGEX.test(name.trim());

  const isValidUsername = (username) => USERNAME_REGEX.test(username);

  const handleAdd = async () => {
    try {
      const { fullName, username, password, role } = formData;

      if (isEmpty(fullName)) {
        toast.error("Full name is required");
        return;
      }

      if (!isValidFullName(fullName)) {
        toast.error("Full name must contain only letters and spaces");
        return;
      }

      if (isEmpty(username)) {
        toast.error("Username is required");
        return;
      }

      if (!isValidUsername(username)) {
        toast.error(
          "Username must be 4-20 characters, lowercase letters, numbers, underscore"
        );
        return;
      }

      if (isEmpty(password)) {
        toast.error("Password is required");
        return;
      }

      if (isEmpty(role)) {
        toast.error("Role is required");
        return;
      }

      const res = await createUser({
        ...formData,
        fullName: fullName.trim(),
        username: username.trim(),
      });

      if (res?.status === 201 && res?.data) {
        setStaff((prev) => [...prev, res.data]);
        toast.success("Create user successfully");
      } else {
        toast.error("Create user unsuccessfully");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.response?.data?.Message ||
          "Create user unsuccessfully"
      );
    } finally {
      setIsAddDialogOpen(false);
      setFormData({
        fullName: "",
        username: "",
        password: "",
        role: "staff",
      });
    }
  };

  const handleEdit = async () => {
    if (!selectedStaff) {
      toast.warning("Can't find user to edit");
      return;
    }

    try {
      const id = selectedStaff.id;
      const { fullName, username, password, role } = formData;

      if (isEmpty(fullName)) {
        toast.error("Full name is required");
        return;
      }

      if (!isValidFullName(fullName)) {
        toast.error("Full name must contain only letters and spaces");
        return;
      }

      if (isEmpty(username)) {
        toast.error("Username is required");
        return;
      }

      if (!isValidUsername(username)) {
        toast.error(
          "Username must be 4-20 characters, lowercase letters, numbers, underscore"
        );
        return;
      }

      if (isEmpty(role)) {
        toast.error("Role is required");
        return;
      }

      const res = await updateUser(id, formData);
      if (res && res.status === 200) {
        fetchUsers();
        toast.success("Update user successfully");
      } else {
        toast.error("Update user unsuccessfully");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.response?.data?.Message ||
          "Update user unsuccessfully"
      );
    } finally {
      setIsEditDialogOpen(false);
      setFormData({
        fullName: "",
        username: "",
        password: "",
        role: "staff",
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedStaff) {
      toast.warning("Can't find user to delete");
      return;
    }
    try {
      const id = selectedStaff.id;
      const res = await deleteUser(id);
      if (res && res.status === 200) {
        toast.success("Delete user successfully");
        setStaff(staff.filter((c) => c.id !== id));
        setIsDeleteDialogOpen(false);
      } else {
        // toast.error("Delete user unsuccessfully");
        setIsDeleteDialogOpen(false);
        setSelectedCustomer(null);
      }
    } catch (error) {
      toast.error("Delete user unsuccessfully");
      setIsDeleteDialogOpen(false);
      setSelectedCustomer(null);
    }
  };

  const toggleActive = (staffMember) => {
    setStaff(
      staff.map((s) =>
        s.id === staffMember.id ? { ...s, isActive: !s.isActive } : s
      )
    );
  };

  const openEditDialog = (staffMember) => {
    setSelectedStaff(staffMember);
    setFormData({
      fullName: staffMember.fullName,
      username: staffMember.username,
      role: staffMember.role,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (staff) => {
    setSelectedStaff(staff);
    setIsDeleteDialogOpen(true);
  };

  //============================= Render UI ===================================
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

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card className="border-2 border-border">
        <CardHeader>
          <CardTitle>Danh sách nhân viên</CardTitle>
          <div className="d-flex justify-content-between align-items-center mb-3 gap-2">
            {/* Search */}
            <div className="input-group" style={{ maxWidth: "400px" }}>
              <span className="input-group-text">
                <Search size={18} />
              </span>
              <Form.Control
                placeholder="Tìm kiếm theo tên, username, số điện thoại..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Select Size */}
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted small">Hiển thị</span>
              <Form.Select
                style={{ width: "90px" }}
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </Form.Select>
              <span className="text-muted small">dòng</span>
            </div>
          </div>
        </CardHeader>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </Spinner>
            <p className="mt-2 text-muted">Đang tải dữ liệu...</p>
          </div>
        ) : !staff && staff.length === 0 ? (
          <p style={{ display: "flex", justifyContent: "center" }}>
            Không có dữ liệu
          </p>
        ) : (
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-b-2 border-border">
                  <TableHead className="font-bold">Mã NV</TableHead>
                  <TableHead className="font-bold">Tên</TableHead>
                  <TableHead className="font-bold">Username</TableHead>
                  <TableHead className="font-bold">Vai trò</TableHead>
                  <TableHead className="font-bold text-right">
                    Thao tác
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staff.map((staffMember) => (
                  <TableRow
                    key={staffMember.id}
                    className="border-b border-border"
                  >
                    <TableCell className="font-medium">
                      {staffMember.id}
                    </TableCell>
                    <TableCell>{staffMember.fullName}</TableCell>
                    <TableCell>{staffMember.username}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          staffMember.role === "admin" ? "default" : "outline"
                        }
                        className="border-2 border-border"
                      >
                        {staffMember.role === "admin"
                          ? "Quản trị"
                          : staffMember.role === "manager"
                          ? "Quản lý"
                          : "Nhân viên"}
                      </Badge>
                    </TableCell>
                    {/* <TableCell>
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
                    </TableCell> */}
                    <TableCell className="text-left">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openEditDialog(staffMember)}
                        className="border-2 border-border"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => openDeleteDialog(staffMember)}
                        className="p-2"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        )}
      </Card>

      <PaginationCustom
        page={page}
        totalPages={meta.totalPage}
        onChange={setPage}
      />

      {/* Add/Edit Dialog */}
      <Dialog
        open={isAddDialogOpen || isEditDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddDialogOpen(false);
            setIsEditDialogOpen(false);
            setFormData({
              fullName: "",
              username: "",
              password: "",
              role: "staff",
            });
          }
        }}
      >
        <DialogContent className="border-2 border-border">
          <DialogHeader>
            <DialogTitle>
              {isAddDialogOpen ? "Thêm nhân viên mới" : "Chỉnh sửa nhân viên"}
            </DialogTitle>
            <DialogDescription>
              {isAddDialogOpen
                ? "Nhập thông tin nhân viên mới"
                : "Cập nhật thông tin nhân viên"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="fullName">Tên nhân viên</Label>
              <Input
                id="fullName"
                value={formData.fullName ?? ""}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                className="border-2 border-border"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username ?? ""}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="border-2 border-border"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                value={formData.password ?? ""}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="border-2 border-border"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Vai trò</Label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData({ ...formData, role: value })
                }
              >
                <SelectTrigger className="border-2 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-2 border-border">
                  <SelectItem value="staff">Nhân viên</SelectItem>
                  <SelectItem value="manager">Quản trị viên</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddDialogOpen(false);
                setIsEditDialogOpen(false);
                setFormData({
                  fullName: "",
                  username: "",
                  role: "staff",
                });
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

      {/* Delete Modal */}
      <Modal
        show={isDeleteDialogOpen}
        onHide={() => setIsDeleteDialogOpen(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Bạn có chắc chắn muốn xóa tài khoản{" "}
          <strong>{selectedStaff?.fullName}</strong>? Hành động này không thể
          hoàn tác.
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setIsDeleteDialogOpen(false)}
          >
            Hủy
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Xóa
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
