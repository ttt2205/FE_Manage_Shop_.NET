"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import {
  Container,
  Card,
  Button,
  Form,
  Table,
  Modal,
  Spinner,
  Alert,
} from "react-bootstrap";
import supplierService from "@/service/supplierService";
import { toast } from "react-toastify";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalPages: 1,
    totalItems: 0,
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // =================================== Fetch Functions ===============================
  // Load suppliers from API
  const fetchSuppliers = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await supplierService.getSuppliers(
        page,
        pagination.pageSize
      );

      if (response.success) {
        setSuppliers(response.result || []);
        setPagination({
          currentPage: response.meta?.currentPage || 1,
          pageSize: response.meta?.pageSize || 10,
          totalPages: response.meta?.totalPage || 1,
          totalItems: response.meta?.totalItems || 0,
        });
      } else {
        setError(response.message || "Không thể tải danh sách nhà cung cấp");
      }
    } catch (err) {
      console.error("Load suppliers error:", err);
      setError("Lỗi kết nối đến server. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // =================================== Filter Functions ===============================
  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (supplier.phone && supplier.phone.includes(searchTerm)) ||
      (supplier.email &&
        supplier.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // =================================== Handle Functions ===============================
  const handleAdd = async () => {
    if (!formData.name) {
      toast.warning("Vui lòng nhập tên nhà cung cấp!");
      return;
    }

    try {
      setSubmitting(true);
      const response = await supplierService.createSupplier(formData);

      if (response.success) {
        toast.success("Thêm nhà cung cấp thành công!");
        setIsAddDialogOpen(false);
        setFormData({ name: "", phone: "", email: "", address: "" });
        fetchSuppliers(pagination.currentPage);
      } else {
        toast.error(response.message || "Có lỗi xảy ra khi thêm nhà cung cấp");
      }
    } catch (err) {
      console.error("Create supplier error:", err);
      toast.error("Lỗi kết nối đến server. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedSupplier || !formData.name) {
      toast.warning("Vui lòng nhập tên nhà cung cấp!");
      return;
    }

    try {
      setSubmitting(true);
      const response = await supplierService.updateSupplier(
        selectedSupplier.id,
        formData
      );

      if (response.success) {
        toast.success("Cập nhật nhà cung cấp thành công!");
        setIsEditDialogOpen(false);
        setSelectedSupplier(null);
        setFormData({ name: "", phone: "", email: "", address: "" });
        fetchSuppliers(pagination.currentPage);
      } else {
        toast.error(
          response.message || "Có lỗi xảy ra khi cập nhật nhà cung cấp"
        );
      }
    } catch (err) {
      console.error("Update supplier error:", err);
      toast.error("Lỗi kết nối đến server. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedSupplier) return;

    try {
      setSubmitting(true);
      const response = await supplierService.deleteSupplier(
        selectedSupplier.id
      );

      if (response.success) {
        toast.success("Xóa nhà cung cấp thành công!");
        setIsDeleteDialogOpen(false);
        setSelectedSupplier(null);
        fetchSuppliers(pagination.currentPage);
      } else {
        toast.error(response.message || "Có lỗi xảy ra khi xóa nhà cung cấp");
      }
    } catch (err) {
      console.error("Delete supplier error:", err);
      toast.error("Lỗi kết nối đến server. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  const openEditDialog = (supplier) => {
    setSelectedSupplier(supplier);
    setFormData({
      name: supplier.name,
      phone: supplier.phone || "",
      email: supplier.email || "",
      address: supplier.address || "",
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (supplier) => {
    setSelectedSupplier(supplier);
    setIsDeleteDialogOpen(true);
  };

  const handlePageChange = (newPage) => {
    fetchSuppliers(newPage);
  };

  // =================================== Render UI ===============================
  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h1 className="display-6 fw-bold">Quản Lý Nhà Cung Cấp</h1>
          <p className="text-muted">Quản lý thông tin nhà cung cấp</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsAddDialogOpen(true)}
          className="d-flex align-items-center gap-2"
        >
          <Plus size={18} />
          Thêm nhà cung cấp
        </Button>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card className="mb-4">
        <Card.Header className="bg-light">
          <Card.Title className="mb-3">Danh sách nhà cung cấp</Card.Title>
          <div className="input-group">
            <span className="input-group-text">
              <Search size={18} />
            </span>
            <Form.Control
              placeholder="Tìm kiếm theo tên, email, số điện thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Đang tải...</span>
              </Spinner>
              <p className="mt-2 text-muted">Đang tải dữ liệu...</p>
            </div>
          ) : filteredSuppliers.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">Không có nhà cung cấp nào</p>
            </div>
          ) : (
            <Table hover responsive className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Tên nhà cung cấp</th>
                  <th>Số điện thoại</th>
                  <th>Email</th>
                  <th>Địa chỉ</th>
                  <th className="text-end">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredSuppliers.map((supplier) => (
                  <tr key={supplier.id}>
                    <td className="fw-medium">{supplier.id}</td>
                    <td>{supplier.name}</td>
                    <td>{supplier.phone || "—"}</td>
                    <td>{supplier.email || "—"}</td>
                    <td
                      style={{
                        maxWidth: "300px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {supplier.address || "—"}
                    </td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-2">
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => openEditDialog(supplier)}
                          className="p-2"
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => openDeleteDialog(supplier)}
                          className="p-2"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
        {!loading && pagination.totalPages > 1 && (
          <Card.Footer className="bg-light">
            <div className="d-flex justify-content-between align-items-center">
              <span className="text-muted small">
                Hiển thị {filteredSuppliers.length} / {pagination.totalItems}{" "}
                nhà cung cấp
              </span>
              <div className="d-flex gap-2">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  disabled={pagination.currentPage === 1}
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                >
                  Trước
                </Button>
                <span className="px-3 py-1">
                  Trang {pagination.currentPage} / {pagination.totalPages}
                </span>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  disabled={pagination.currentPage === pagination.totalPages}
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                >
                  Sau
                </Button>
              </div>
            </div>
          </Card.Footer>
        )}
      </Card>

      {/* Add Modal */}
      <Modal
        show={isAddDialogOpen}
        onHide={() => setIsAddDialogOpen(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Thêm nhà cung cấp mới</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>
              Tên nhà cung cấp <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              disabled={submitting}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Số điện thoại</Form.Label>
            <Form.Control
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              disabled={submitting}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              disabled={submitting}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Địa chỉ</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              disabled={submitting}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setIsAddDialogOpen(false)}
            disabled={submitting}
          >
            Hủy
          </Button>
          <Button variant="primary" onClick={handleAdd} disabled={submitting}>
            {submitting ? <Spinner animation="border" size="sm" /> : "Thêm"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Modal */}
      <Modal
        show={isEditDialogOpen}
        onHide={() => setIsEditDialogOpen(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Chỉnh sửa nhà cung cấp</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>
              Tên nhà cung cấp <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              disabled={submitting}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Số điện thoại</Form.Label>
            <Form.Control
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              disabled={submitting}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              disabled={submitting}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Địa chỉ</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              disabled={submitting}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setIsEditDialogOpen(false)}
            disabled={submitting}
          >
            Hủy
          </Button>
          <Button variant="primary" onClick={handleEdit} disabled={submitting}>
            {submitting ? (
              <Spinner animation="border" size="sm" />
            ) : (
              "Lưu thay đổi"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Modal */}
      <Modal
        show={isDeleteDialogOpen}
        onHide={() => setIsDeleteDialogOpen(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Bạn có chắc chắn muốn xóa nhà cung cấp{" "}
          <strong>{selectedSupplier?.name}</strong>? Hành động này không thể
          hoàn tác.
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setIsDeleteDialogOpen(false)}
            disabled={submitting}
          >
            Hủy
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={submitting}>
            {submitting ? <Spinner animation="border" size="sm" /> : "Xóa"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
