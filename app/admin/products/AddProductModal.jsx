"use client";
import { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import categoryService from "@/service/categoryService";
import supplierService from "@/service/supplierService";
import productService from "@/service/productService";

export default function AddProductModal({ show, onHide, onAddSuccess }) {
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    supplier: "",
    price: "",
    sku: "",
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryService.getCategories();
        setCategories(data);
      } catch (error) {
        toast.error("Không thể tải danh mục");
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.warning("Tên sản phẩm không được để trống!");
      return false;
    }
    if (!formData.description.trim()) {
      toast.warning("Đơn vị tính không được để trống!");
      return false;
    }
    if (!formData.category) {
      toast.warning("Vui lòng chọn danh mục!");
      return false;
    }
    if (!formData.supplier) {
      toast.warning("Vui lòng chọn nhà cung cấp!");
      return false;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.warning("Giá sản phẩm phải lớn hơn 0!");
      return false;
    }
    if (!formData.sku.trim()) {
      toast.warning("Mã vạch (Barcode) không được để trống!");
      return false;
    }
    return true;
  };

  const handleAdd = async () => {
    if (!validateForm()) return;

    const productData = {
      CategoryId: parseInt(formData.category),
      SupplierId: parseInt(formData.supplier),
      ProductName: formData.name,
      Barcode: formData.sku,
      Price: parseFloat(formData.price),
      Unit: formData.description,
    };

    try {
      setLoading(true);
      const res = await productService.createProduct(productData);

      // ✅ BE trả về dạng gì thì tùy chỉnh, ví dụ { statusCode: 200, message: "Thành công" }
      if (res.statusCode === 200 || res.status === 201 ) {
        toast.success("Thêm sản phẩm thành công!" ||  res.message);
        onAddSuccess?.();
        onHide();
      } else {
        toast.error("Thêm sản phẩm thất bại!" || res.message);
      }
    } catch (err) {
      console.error("❌ Lỗi khi thêm sản phẩm:", err);
      toast.error("Lỗi khi thêm sản phẩm!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} />
      <Modal show={show} onHide={onHide} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Thêm sản phẩm mới</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Tên sản phẩm</Form.Label>
                <Form.Control
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Đơn vị</Form.Label>
                <Form.Control
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </Form.Group>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Danh mục</Form.Label>
                <Form.Select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.categoryName}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>

            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Nhà cung cấp</Form.Label>
                <Form.Select
                  value={formData.supplier}
                  onChange={(e) =>
                    setFormData({ ...formData, supplier: e.target.value })
                  }
                >
                  <option value="">Chọn nhà cung cấp</option>
                  {[
                    { id: 1, name: "Công ty Vinamilk" },
                    { id: 2, name: "Công ty Trung Nguyên" },
                    { id: 3, name: "Công ty TH True Milk" },
                    { id: 4, name: "Công ty Nestlé Việt Nam" },
                  ].map((sup) => (
                    <option key={sup.id} value={sup.id}>
                      {sup.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Giá</Form.Label>
                <Form.Control
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                />
              </Form.Group>
            </div>

            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Mã vạch</Form.Label>
                <Form.Control
                  value={formData.sku}
                  onChange={(e) =>
                    setFormData({ ...formData, sku: e.target.value })
                  }
                />
              </Form.Group>
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={handleAdd}
            disabled={loading}
          >
            {loading ? "Đang thêm..." : "Thêm"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}





{/* Edit Modal */}
      <Modal show={isEditDialogOpen} onHide={() => setIsEditDialogOpen(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Chỉnh sửa sản phẩm</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Tên sản phẩm</Form.Label>
                <Form.Control
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>SKU</Form.Label>
                <Form.Control
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                />
              </Form.Group>
            </div>
          </div>
          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Danh mục</Form.Label>
                <Form.Select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="">Chọn danh mục</option>
                  {categories
                    .filter((c) => c !== "Tất cả")
                    .map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                </Form.Select>
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Giá</Form.Label>
                <Form.Control
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </Form.Group>
            </div>
          </div>
          <Form.Group className="mb-3">
            <Form.Label>Số lượng tồn kho</Form.Label>
            <Form.Control
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Mô tả</Form.Label>
            <Form.Control
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setIsEditDialogOpen(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleEdit}>
            Lưu thay đổi
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Modal */}
      <Modal show={isDeleteDialogOpen} onHide={() => setIsDeleteDialogOpen(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Bạn có chắc chắn muốn xóa sản phẩm <strong>{selectedProduct?.name}</strong>? Hành động này không thể hoàn tác.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setIsDeleteDialogOpen(false)}>
            Hủy
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Xóa
          </Button>
        </Modal.Footer>
      </Modal>