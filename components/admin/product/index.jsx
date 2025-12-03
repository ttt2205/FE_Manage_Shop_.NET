"use client";
import { useEffect, useState } from "react";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import {
  Container,
  Card,
  Button,
  Form,
  Table,
  Badge,
  Modal,
  Pagination,
} from "react-bootstrap";
import { toast } from "react-toastify";

import productService from "@/service/productService";
import categoryService from "@/service/categoryService";
import supplierService from "@/service/supplierService";
import PaginationCustom from "./components/PaginationCustom";
import ProductModal from "./components/ProductModal";

export default function index() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Tất cả");
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [formData, setFormData] = useState({
    productName: "",
    barcode: "",
    price: "",
    unit: "",
    categoryId: "",
    supplierId: "",
  });

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchProducts(currentPage, itemsPerPage);
  }, [currentPage, itemsPerPage, searchTerm, categoryFilter]);

  useEffect(() => {
    fetchCategories();
    fetchSuppliers();
  }, []);

  // ==================== FETCH DATA ====================
  const fetchProducts = async (page = 1, pageSize = itemsPerPage) => {
    try {
      setLoading(true);
      const res = await productService.getProducts({
        page,
        pageSize,
        search: searchTerm,
        category: categoryFilter !== "Tất cả" ? categoryFilter : undefined,
      });

      setProducts(res.result || []);
      setTotalPages(res.meta?.totalPage || 1);
      setCurrentPage(res.meta?.currentPage || page);
    } catch (err) {
      console.error("Lỗi khi tải danh sách sản phẩm:", err);
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
    } catch {
      console.error("Lỗi khi tải danh mục!");
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await supplierService.getSuppliers();
      if (res && res.status === 200) {
        setSuppliers(res.result || []);
      }
    } catch {
      console.error("Lỗi khi tải nhà cung cấp!");
    }
  };

  // ==================== VALIDATE FORM ====================
  const validateForm = () => {
    const { productName, barcode, price, unit, categoryId, supplierId } =
      formData;

    // Check tên sản phẩm
    if (!productName || !productName.trim()) {
      toast.warning("Tên sản phẩm không được để trống!");
      return false;
    }

    // Check mã vạch
    if (!barcode || !barcode.trim()) {
      toast.warning("Mã vạch không được để trống!");
      return false;
    }

    // Check giá sản phẩm
    const priceValue = parseFloat(price);
    if (!price || isNaN(priceValue) || priceValue <= 0) {
      toast.warning("Giá sản phẩm phải là số lớn hơn 0!");
      return false;
    }

    // Check đơn vị
    if (!unit || !unit.trim()) {
      toast.warning("Vui lòng nhập đơn vị sản phẩm!");
      return false;
    }

    // Check danh mục
    if (!categoryId) {
      toast.warning("Vui lòng chọn danh mục!");
      return false;
    }

    // Check nhà cung cấp
    if (!supplierId) {
      toast.warning("Vui lòng chọn nhà cung cấp!");
      return false;
    }

    // Nếu tất cả đều hợp lệ
    return true;
  };

  // ==================== HANDLERS ====================
  const handleAdd = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const res = await productService.createProduct({
        productName: formData.productName,
        barcode: formData.barcode,
        price: parseFloat(formData.price),
        unit: formData.unit,
        categoryId: parseInt(formData.categoryId),
        supplierId: parseInt(formData.supplierId),
      });

      if (res.status === 200 || res.status === 201) {
        toast.success("Thêm sản phẩm thành công!");
        setIsAddDialogOpen(false);
        setFormData({
          productName: "",
          barcode: "",
          price: "",
          unit: "",
          categoryId: "",
          supplierId: "",
        });
        fetchProducts(1, itemsPerPage); // reset về trang 1
      } else {
        toast.error("Thêm sản phẩm thất bại!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi server hoặc dữ liệu không hợp lệ!");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!editingProduct || !validateForm()) return;
    try {
      setLoading(true);
      const res = await productService.updateProduct(editingProduct.id, {
        ProductName: formData.productName,
        Barcode: formData.barcode,
        Price: parseFloat(formData.price),
        Unit: formData.unit,
        CategoryId: parseInt(formData.categoryId),
        SupplierId: parseInt(formData.supplierId),
      });
      if (res.status === 200) {
        toast.success("✅ Cập nhật sản phẩm thành công!");
        setIsEditDialogOpen(false);
        fetchProducts(currentPage, itemsPerPage);
      } else toast.error("Cập nhật thất bại!");
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi cập nhật sản phẩm!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;
    try {
      setLoading(true);
      const res = await productService.deleteProduct(selectedProduct.id);
      if (res.status === 200) {
        toast.success(`🗑️ Đã xoá sản phẩm "${selectedProduct.productName}"`);
        fetchProducts(currentPage, itemsPerPage);
      } else toast.error("Xóa sản phẩm thất bại!");
    } catch (err) {
      console.error(err);
      toast.error("Lỗi server khi xóa sản phẩm!");
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedProduct(null);
      setLoading(false);
    }
  };

  // ==================== RENDER ====================
  const columns = [
    "Mã SP",
    "Tên Sản phẩm",
    "Mã vạch",
    "Danh mục",
    "Giá",
    "Đơn vị",
    "Thao tác",
  ];

  return (
    <Container fluid className="py-4">
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
          <Plus size={18} /> Thêm sản phẩm
        </Button>
      </div>

      {/* Bộ lọc */}
      <Card className="mb-4">
        <Card.Header className="bg-light">
          <Card.Title className="mb-3">Danh sách sản phẩm</Card.Title>
          <div className="row g-3">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text">
                  <Search size={18} />
                </span>
                <Form.Control
                  placeholder="Tìm kiếm theo tên, mã vạch..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>
            <div className="col-md-3">
              <Form.Select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="Tất cả">Tất cả</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.categoryName}>
                    {cat.categoryName}
                  </option>
                ))}
              </Form.Select>
            </div>

            <div className="col-md-3 ms-auto">
              <Form.Select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                style={{ width: "120px" }}
              >
                {[5, 10, 20].map((n) => (
                  <option key={n} value={n}>
                    {n} / trang
                  </option>
                ))}
              </Form.Select>
            </div>
          </div>
        </Card.Header>

        {/* Bảng */}
        <Card.Body className="p-0">
          <Table hover responsive className="mb-0">
            <thead className="table-light">
              <tr>
                {columns.map((col, i) => (
                  <th key={i} className="text-center">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.length ? (
                products.map((p) => (
                  <tr key={p.id}>
                    <td className="fw-medium text-center">{p.id}</td>
                    <td className="text-center">{p.productName}</td>
                    <td className="text-center">{p.barcode}</td>
                    <td className="text-center">
                      <Badge bg="light" text="dark">
                        {p.category?.categoryName || "Không có"}
                      </Badge>
                    </td>
                    <td className="text-center">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(p.price || 0)}
                    </td>
                    <td className="text-center">{p.unit || "N/A"}</td>
                    <td className="text-center">
                      <div className="d-flex justify-content-center gap-2">
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => {
                            setEditingProduct(p);
                            setFormData({
                              productName: p.productName,
                              barcode: p.barcode,
                              price: p.price,
                              unit: p.unit,
                              categoryId: p.category?.id || "",
                              supplierId: p.supplier?.id || "",
                            });
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => {
                            setSelectedProduct(p);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
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

        {/* Pagination */}
        <div className="d-flex align-items-center justify-content-center mt-3 mb-3">
          {/* PaginationCustom ở giữa */}
          <PaginationCustom
            page={currentPage}
            totalPages={totalPages}
            onChange={setCurrentPage}
          />
        </div>
      </Card>

      {/* Modals */}
      <ProductModal
        title="Thêm sản phẩm mới"
        show={isAddDialogOpen}
        onHide={() => setIsAddDialogOpen(false)}
        formData={formData}
        setFormData={setFormData}
        categories={categories}
        suppliers={suppliers}
        onSubmit={handleAdd}
        loading={loading}
        buttonLabel="Thêm sản phẩm"
      />

      <ProductModal
        title="Chỉnh sửa sản phẩm"
        show={isEditDialogOpen}
        onHide={() => setIsEditDialogOpen(false)}
        formData={formData}
        setFormData={setFormData}
        categories={categories}
        suppliers={suppliers}
        onSubmit={handleEdit}
        loading={loading}
        buttonLabel="Lưu thay đổi"
      />

      <Modal
        show={isDeleteDialogOpen}
        onHide={() => setIsDeleteDialogOpen(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedProduct ? (
            <>
              Bạn có chắc chắn muốn xóa sản phẩm{" "}
              <strong className="text-danger">
                {selectedProduct.productName}
              </strong>
              ?<br />
              <small className="text-muted">
                Hành động này không thể hoàn tác.
              </small>
            </>
          ) : (
            "Không có sản phẩm nào được chọn."
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setIsDeleteDialogOpen(false)}
          >
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
