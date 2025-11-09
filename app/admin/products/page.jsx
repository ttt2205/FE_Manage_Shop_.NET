"use client";
import { useEffect, useState } from "react";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { Container, Card, Button, Form, Table, Badge, Modal } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import productService from "@/service/productService";
import categoryService from "@/service/categoryService";
import supplierService from "@/service/supplierService";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Tất cả");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);


  const [formData, setFormData] = useState({
    productName: "",
    barcode: "",
    price: "",
    unit: "",
    categoryId: "",
    supplierId: "",
  });

  // 🧩 Gọi API danh sách sản phẩm, danh mục, nhà cung cấp
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getProducts();
      setProducts(data);
    } catch {
      toast.error("❌ Lỗi khi tải danh sách sản phẩm!");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch {
      toast.error("❌ Lỗi khi tải danh mục!");
    }
  };

  const fetchSuppliers = async () => {
    try {
      const data = await supplierService.getSuppliers();
      setSuppliers(data);
    } catch {
      toast.error("❌ Lỗi khi tải nhà cung cấp!");
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchSuppliers();
  }, []);

  // 🧩 Lọc sản phẩm theo danh mục và tìm kiếm
  const filteredProducts = products.filter((product) => {
    const name = product.productName?.toLowerCase() || "";
    const barcode = product.barcode?.toLowerCase() || "";
    const matchesSearch =
      name.includes(searchTerm.toLowerCase()) || barcode.includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "Tất cả" ||
      (product.category?.categoryName && product.category.categoryName === categoryFilter);
    return matchesSearch && matchesCategory;
  });

  // 🧩 Validate form
  const validateForm = () => {
    const { productName, barcode, price, unit, categoryId, supplierId } = formData;
    if (!productName.trim()) return toast.warning("⚠️ Tên sản phẩm không được để trống!");
    if (!barcode.trim()) return toast.warning("⚠️ Mã vạch không được để trống!");
    if (!price || isNaN(price) || parseFloat(price) <= 0)
      return toast.warning("⚠️ Giá sản phẩm phải lớn hơn 0!");
    if (!unit.trim()) return toast.warning("⚠️ Vui lòng nhập đơn vị sản phẩm!");
    if (!categoryId) return toast.warning("⚠️ Vui lòng chọn danh mục!");
    if (!supplierId) return toast.warning("⚠️ Vui lòng chọn nhà cung cấp!");
    return true;
  };

  // 🧩 Xử lý thêm sản phẩm
  const handleAdd = async () => {
    if (!validateForm()) return;

    const payload = {
      ProductName: formData.productName,
      Barcode: formData.barcode,
      Price: parseFloat(formData.price),
      Unit: formData.unit,
      CategoryId: parseInt(formData.categoryId),
      SupplierId: parseInt(formData.supplierId),
    };

    try {
      setLoading(true);
      const res = await productService.createProduct(payload);

      if (res.statusCode === 200 || res.status === 201) {
        toast.success("🎉 Thêm sản phẩm thành công!");
        setIsAddDialogOpen(false);
        setFormData({
          productName: "",
          barcode: "",
          price: "",
          unit: "",
          categoryId: "",
          supplierId: "",
        });
        fetchProducts();
      } else {
        toast.error("❌ Thêm sản phẩm thất bại!");
      }
    } catch (err) {
      console.error("❌ Lỗi khi thêm sản phẩm:", err);
      toast.error("Lỗi server hoặc dữ liệu không hợp lệ!");
    } finally {
      setLoading(false);
    }
  };

  // 🧩 Mở modal Edit
  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      productName: product.productName,
      barcode: product.barcode,
      price: product.price,
      unit: product.unit,
      categoryId: product.category?.id || "",
      supplierId: product.supplier?.id || "",
    });
    setIsEditDialogOpen(true);
  };

  // 🧩 Xử lý cập nhật sản phẩm
  const handleEdit = async () => {
    if (!editingProduct) return;
    if (!validateForm()) return;

    const payload = {
      ProductName: formData.productName,
      Barcode: formData.barcode,
      Price: parseFloat(formData.price),
      Unit: formData.unit,
      CategoryId: parseInt(formData.categoryId),
      SupplierId: parseInt(formData.supplierId),
    };

    try {
      setLoading(true);
      const res = await productService.updateProduct(editingProduct.id, payload);
      if (res.statusCode === 200 || res.status === 200) {
        toast.success("✅ Cập nhật sản phẩm thành công!");
        setIsEditDialogOpen(false);
        fetchProducts();
      } else {
        toast.error("❌ Cập nhật thất bại!");
      }
    } catch (err) {
      toast.error("❌ Lỗi khi cập nhật sản phẩm!");
    }
    finally {
      setLoading(false);
    }
  };

  // 🧩 Mở modal delete
  const openDeleteModal = (product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };
  // 🧩 Xử lý xoá sản phẩm
  const handleDelete = async () => {
    if (!selectedProduct) return;
    try {
      setLoading(true);
      const res = await productService.deleteProduct(selectedProduct.id);
      if (res.statusCode === 200 || res.status === 200) {
        toast.success(`🗑️ Đã xoá sản phẩm "${selectedProduct.productName}"`);
        fetchProducts();
      } else {
        toast.error("❌ Xóa sản phẩm thất bại!");
      }
    } catch (error) {
      console.error("❌ Lỗi khi xóa:", error);
      toast.error("Lỗi server khi xóa sản phẩm!");
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedProduct(null);
      setLoading(false);
    }
  };

  const columns = ["Mã SP", "Tên Sản phẩm", "Mã vạch", "Danh mục", "Giá", "Đơn vị", "Thao tác"];

  return (
    <Container fluid className="py-4">
      <ToastContainer position="top-right" autoClose={2000} />

      {/* Header */}
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h1 className="display-6 fw-bold">Quản Lý Sản Phẩm</h1>
          <p className="text-muted">Quản lý kho hàng và sản phẩm</p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setFormData({
              productName: "",
              barcode: "",
              price: "",
              unit: "",
              categoryId: "",
              supplierId: "",
            });
            setIsAddDialogOpen(true);
          }}
          className="d-flex align-items-center gap-2"
        >
          <Plus size={18} />
          Thêm sản phẩm
        </Button>
      </div>

      {/* Bộ lọc */}
      <Card className="mb-4">
        <Card.Header className="bg-light">
          <Card.Title className="mb-3">Danh sách sản phẩm</Card.Title>
          <div className="row g-3">
            <div className="col-md-8">
              <div className="input-group">
                <span className="input-group-text">
                  <Search size={18} />
                </span>
                <Form.Control
                  placeholder="Tìm kiếm theo tên, mã vạch..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-4">
              <Form.Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <option value="Tất cả">Tất cả</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.categoryName}>
                    {cat.categoryName}
                  </option>
                ))}
              </Form.Select>
            </div>
          </div>
        </Card.Header>

        {/* Bảng sản phẩm */}
        <Card.Body className="p-0">
          <Table hover responsive className="mb-0">
            <thead className="table-light">
              <tr>
                {columns.map((item, index) => (
                  <th className="text-center" key={index}>
                    {item}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td className="fw-medium text-center">{product.id}</td>
                    <td className="text-center">{product.productName}</td>
                    <td className="text-center">{product.barcode}</td>
                    <td className="text-center">
                      <Badge bg="light" text="dark">
                        {product.category?.categoryName || "Không có"}
                      </Badge>
                    </td>
                    <td className="text-center">
                      {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                        product.price || 0
                      )}
                    </td>
                    <td className="text-center">{product.unit || "N/A"}</td>
                    <td className="text-center">
                      <div className="d-flex justify-content-center gap-2">
                        <Button variant="outline-secondary" size="sm" onClick={() => openEditModal(product)}>
                          <Edit size={16} />
                        </Button>
                        <Button variant="outline-danger" size="sm" className="p-2" onClick={() => openDeleteModal(product)}>
                          <Trash2 size={16} />
                        </Button>

                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center">
                    {loading ? "Đang tải..." : "Không có sản phẩm nào"}
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* 🔹 Modal thêm sản phẩm */}
      <ProductModal
        title="Thêm sản phẩm mới"
        show={isAddDialogOpen}
        onHide={() => setIsAddDialogOpen(false)}
        formData={formData}
        setFormData={setFormData}
        categories={categories}
        suppliers={suppliers}
        loading={loading}
        onSubmit={handleAdd}
        buttonLabel="Thêm sản phẩm"
      />

      {/* 🔹 Modal chỉnh sửa sản phẩm */}
      <ProductModal
        title="Chỉnh sửa sản phẩm"
        show={isEditDialogOpen}
        onHide={() => setIsEditDialogOpen(false)}
        formData={formData}
        setFormData={setFormData}
        categories={categories}
        suppliers={suppliers}
        loading={loading}
        onSubmit={handleEdit}
        buttonLabel="Lưu thay đổi"
      />
      <Modal show={isDeleteDialogOpen} onHide={() => setIsDeleteDialogOpen(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {selectedProduct ? (
            <>
              Bạn có chắc chắn muốn xóa sản phẩm{" "}
              <strong className="text-danger">{selectedProduct.productName}</strong>?
              <br />
              <small className="text-muted">Hành động này không thể hoàn tác.</small>
            </>
          ) : (
            "Không có sản phẩm nào được chọn."
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setIsDeleteDialogOpen(false)}>
            Hủy
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={loading}>
            {loading ? "Đang xóa..." : "Xóa"}
          </Button>
        </Modal.Footer>
      </Modal>

    </Container>
  );
}

function ProductModal({
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
}) {
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
              onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Mã vạch</Form.Label>
            <Form.Control
              value={formData.barcode}
              onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Giá</Form.Label>
            <Form.Control
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Đơn vị</Form.Label>
            <Form.Control
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Danh mục</Form.Label>
            <Form.Select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
            >
              <option value="">Chọn danh mục</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.categoryName}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Nhà cung cấp</Form.Label>
            <Form.Select
              value={formData.supplierId}
              onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
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
}
