"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Badge,
  Button,
  Card,
  Container,
  Form,
  Modal,
  Table,
  ButtonGroup,
  Spinner,
} from "react-bootstrap";
import { Plus, Search, FileDown } from "lucide-react";
import { toast } from "react-toastify";
import inventoryService from "@/service/inventoryService";
import categoryService from "@/service/categoryService";
import { startAuditSesstion } from "@/service/audit-service";

const API_URL = `${process.env.NEXT_PUBLIC_API_BACKEND_URL}`;

const index = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("Tất cả");
  const router = useRouter();

  // State cho Modal Kiểm kê
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [auditNote, setAuditNote] = useState("");

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // ================================ Fetch Functions ============================

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await inventoryService.getAllInventory();

      if (response && response.status === 200) {
        setInventory(response.data || []);
      }
    } catch (error) {
      toast.error("Lỗi kết nối khi lấy danh sách sản phẩm tồn kho!");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await categoryService.getCategories();
      if (res && res.status === 200) {
        setCategories(res.result || []);
      }
    } catch (error) {
      toast.error("Không tải được danh mục sản phẩm!");
    }
  };

  const filteredProducts = inventory.filter((item) => {
    if (!item.product) return false;

    const matchesSearch =
      item.product.productName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (item.product.barcode &&
        item.product.barcode.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      categoryFilter === "Tất cả" ||
      (item.product.category &&
        item.product.category.categoryName === categoryFilter);

    return matchesSearch && matchesCategory;
  });

  // ================================ Handle Functions ============================
  const handleExportPdf = () => {
    window.open(`${API_URL}/api/v1/inventory/export-pdf`, "_blank");
  };

  const handleStartAudit = async () => {
    try {
      const res = await startAuditSesstion({ userId: 1, auditNote });

      if (res && res.status === 201) {
        toast.success(`Đã bắt đầu phiên kiểm kê! ID: ${res.data.id}`);
        setIsAuditModalOpen(false);
        setAuditNote("");
        router.push(`/admin/audit_store/audit/${res.data.id}`);
      } else {
        toast.error(`Lỗi: ${res.data.message}`);
      }
    } catch (error) {
      toast.error("Lỗi kết nối khi bắt đầu kiểm kê.");
    }
  };

  // ================================ Render UI ============================
  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h1 className="display-6 fw-bold">Kiểm kê kho hàng</h1>
          <p className="text-muted">Quản lý kho hàng và tồn kho</p>
        </div>
        <ButtonGroup className="gap-2">
          <Button
            variant="outline-primary"
            onClick={handleExportPdf}
            className="d-flex align-items-center gap-2"
          >
            <FileDown size={18} />
            Xuất PDF kho
          </Button>
          <Button
            variant="primary"
            onClick={() => setIsAuditModalOpen(true)}
            className="d-flex align-items-center gap-2"
          >
            <Plus size={18} />
            Tạo Phiên Kiểm Kê
          </Button>
          <Button
            variant="warning"
            onClick={() => router.push("/admin/audit_store/audit/history")}
            className="d-flex align-items-center gap-2"
          >
            <Plus size={18} />
            Lịch sử kiểm kê
          </Button>
        </ButtonGroup>
      </div>

      <Card className="mb-4">
        <Card.Header className="bg-light">
          <Card.Title className="mb-3">Danh sách tồn kho</Card.Title>
          <div className="row g-3">
            <div className="col-md-8">
              <div className="input-group">
                <span className="input-group-text">
                  <Search size={18} />
                </span>
                <Form.Control
                  placeholder="Tìm kiếm theo tên, barcode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-4">
              <Form.Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="Tất cả">{"Tất cả"}</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.categoryName}>
                    {cat.categoryName}
                  </option>
                ))}
              </Form.Select>
            </div>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          <Table hover responsive className="mb-0">
            <thead className="table-light">
              <tr>
                <th>Mã SP</th>
                <th>Tên sản phẩm</th>
                <th>Barcode (SKU)</th>
                <th>Danh mục</th>
                <th className="text-end">Giá</th>
                <th className="text-end">Tồn kho</th>
                <th className="text-end">Cập nhật</th>
              </tr>
            </thead>
            {/* --- SỬA LẠI LOGIC HIỂN THỊ BẢNG --- */}
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center p-5">
                    <Spinner animation="border" role="status">
                      <span className="visually-hidden">Đang tải...</span>
                    </Spinner>
                  </td>
                </tr>
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((item) => (
                  <tr key={item.id}>
                    <td className="fw-medium">{item.productId}</td>
                    <td>{item.product?.productName ?? "N/A"}</td>
                    <td>{item.product?.barcode ?? "N/A"}</td>
                    <td>
                      <Badge bg="light" text="dark">
                        {item.product?.category?.categoryName ??
                          "Chưa phân loại"}
                      </Badge>
                    </td>
                    <td className="text-end">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(item.product?.price ?? 0)}
                    </td>
                    <td className="text-end">
                      <span
                        className={
                          item.quantity < 50 ? "text-warning fw-semibold" : ""
                        }
                      >
                        {item.quantity}
                      </span>
                    </td>
                    <td className="text-end text-muted small">
                      {new Date(item.updatedAt).toLocaleDateString("vi-VN")}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center p-4">
                    Không tìm thấy sản phẩm nào.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Modal show={isAuditModalOpen} onHide={() => setIsAuditModalOpen(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Bắt đầu Phiên Kiểm Kê</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Ghi chú (Tùy chọn)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Ví dụ: Kiểm kê định kỳ cuối tháng"
              value={auditNote}
              onChange={(e) => setAuditNote(e.target.value)}
            />
          </Form.Group>
          <p className="text-muted small">
            Một phiên kiểm kê mới sẽ được tạo. Bạn có thể bắt đầu thêm các sản
            phẩm đã đếm thực tế vào phiên này.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setIsAuditModalOpen(false)}
          >
            Hủy
          </Button>
          <Button variant="primary" onClick={handleStartAudit}>
            Bắt đầu
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default index;
