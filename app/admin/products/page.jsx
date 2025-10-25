"use client"

import { useState } from "react"
import { Plus, Search, Edit, Trash2 } from "lucide-react"
import { Container, Card, Button, Form, Table, Modal, Badge } from "react-bootstrap"
import { productsData } from "@/lib/data/products"

const categories = ["Tất cả", "Áo Nam", "Quần Nữ", "Váy Nữ", "Giày Nam", "Phụ Kiện"]

export default function ProductsPage() {
  const [products, setProducts] = useState(productsData)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("Tất cả")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    price: "",
    stock: "",
    description: "",
  })

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "Tất cả" || product.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const handleAdd = () => {
    const newProduct = {
      id: `PRD${String(products.length + 1).padStart(3, "0")}`,
      name: formData.name,
      sku: formData.sku,
      category: formData.category,
      price: Number(formData.price),
      stock: Number(formData.stock),
      image: "/placeholder.svg?height=100&width=100",
      description: formData.description,
      createdAt: new Date().toISOString(),
    }
    setProducts([...products, newProduct])
    setIsAddDialogOpen(false)
    setFormData({ name: "", sku: "", category: "", price: "", stock: "", description: "" })
  }

  const handleEdit = () => {
    if (!selectedProduct) return
    setProducts(
      products.map((p) =>
        p.id === selectedProduct.id
          ? {
              ...p,
              name: formData.name,
              sku: formData.sku,
              category: formData.category,
              price: Number(formData.price),
              stock: Number(formData.stock),
              description: formData.description,
            }
          : p,
      ),
    )
    setIsEditDialogOpen(false)
    setSelectedProduct(null)
    setFormData({ name: "", sku: "", category: "", price: "", stock: "", description: "" })
  }

  const handleDelete = () => {
    if (!selectedProduct) return
    setProducts(products.filter((p) => p.id !== selectedProduct.id))
    setIsDeleteDialogOpen(false)
    setSelectedProduct(null)
  }

  const openEditDialog = (product) => {
    setSelectedProduct(product)
    setFormData({
      name: product.name,
      sku: product.sku,
      category: product.category,
      price: String(product.price),
      stock: String(product.stock),
      description: product.description,
    })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (product) => {
    setSelectedProduct(product)
    setIsDeleteDialogOpen(true)
  }

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h1 className="display-6 fw-bold">Quản Lý Sản Phẩm</h1>
          <p className="text-muted">Quản lý kho hàng và sản phẩm</p>
        </div>
        <Button variant="primary" onClick={() => setIsAddDialogOpen(true)} className="d-flex align-items-center gap-2">
          <Plus size={18} />
          Thêm sản phẩm
        </Button>
      </div>

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
                  placeholder="Tìm kiếm theo tên, SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-4">
              <Form.Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
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
                <th>SKU</th>
                <th>Danh mục</th>
                <th className="text-end">Giá</th>
                <th className="text-end">Tồn kho</th>
                <th className="text-end">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td className="fw-medium">{product.id}</td>
                  <td>{product.name}</td>
                  <td>{product.sku}</td>
                  <td>
                    <Badge bg="light" text="dark">
                      {product.category}
                    </Badge>
                  </td>
                  <td className="text-end">
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(product.price)}
                  </td>
                  <td className="text-end">
                    <span className={product.stock < 50 ? "text-warning fw-semibold" : ""}>{product.stock}</span>
                  </td>
                  <td className="text-end">
                    <div className="d-flex justify-content-end gap-2">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => openEditDialog(product)}
                        className="p-2"
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => openDeleteDialog(product)}
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
        </Card.Body>
      </Card>

      {/* Add Modal */}
      <Modal show={isAddDialogOpen} onHide={() => setIsAddDialogOpen(false)} size="lg">
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
          <Button variant="secondary" onClick={() => setIsAddDialogOpen(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleAdd}>
            Thêm
          </Button>
        </Modal.Footer>
      </Modal>

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
    </Container>
  )
}
