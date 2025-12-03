"use client";

import { Button, Form, Modal } from "react-bootstrap";
import { toast } from "react-toastify";

const ProductModal = ({
  title,
  show,
  onHide,
  formData,
  setFormData,
  categories,
  suppliers,
  onSubmit,
  buttonLabel,
  loading,
}) => {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Tên sản phẩm</Form.Label>
            <Form.Control
              value={formData.productName}
              onChange={(e) =>
                setFormData({ ...formData, productName: e.target.value })
              }
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Mã vạch</Form.Label>
            <Form.Control
              value={formData.barcode}
              onChange={(e) =>
                setFormData({ ...formData, barcode: e.target.value })
              }
            />
          </Form.Group>
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
          <Form.Group className="mb-3">
            <Form.Label>Đơn vị</Form.Label>
            <Form.Control
              value={formData.unit}
              onChange={(e) =>
                setFormData({ ...formData, unit: e.target.value })
              }
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Danh mục</Form.Label>
            <Form.Select
              value={formData.categoryId}
              onChange={(e) =>
                setFormData({ ...formData, categoryId: e.target.value })
              }
            >
              <option value="">Chọn danh mục</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.categoryName}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Nhà cung cấp</Form.Label>
            <Form.Select
              value={formData.supplierId}
              onChange={(e) =>
                setFormData({ ...formData, supplierId: e.target.value })
              }
            >
              <option value="">Chọn nhà cung cấp</option>
              {suppliers?.length > 0 &&
                suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name || s.supplierName}
                  </option>
                ))}
            </Form.Select>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Hủy
        </Button>
        <Button variant="primary" onClick={onSubmit} disabled={loading}>
          {loading ? "Đang xử lý..." : buttonLabel}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ProductModal;
