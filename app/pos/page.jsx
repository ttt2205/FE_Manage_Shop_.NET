"use client"

import { useState } from "react"
import { ShoppingCart, Users, Tag, History, Plus, Minus, Trash2, Search, Package, LogOut, User } from "lucide-react"
import { Row, Col, Card, Button, Form, Modal, Badge, Dropdown } from "react-bootstrap"
import { productsData } from "@/lib/data/products"
import { customersData } from "@/lib/data/customers"
import { promotionsData } from "@/lib/data/promotions"
import { ordersData } from "@/lib/data/orders"
import { getCurrentUser, logout } from "@/lib/auth"

export default function POSPage() {
  const currentUser = getCurrentUser()
  const [activeTab, setActiveTab] = useState("sell")
  const [cart, setCart] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [selectedPromotion, setSelectedPromotion] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("Tất cả")
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false)
  const [isAddCustomerDialogOpen, setIsAddCustomerDialogOpen] = useState(false)
  const [isPromotionDialogOpen, setIsPromotionDialogOpen] = useState(false)
  const [isCheckoutDialogOpen, setIsCheckoutDialogOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [newCustomerData, setNewCustomerData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  })

  const categories = ["Tất cả", "Áo Nam", "Quần Nữ", "Váy Nữ", "Giày Nam", "Phụ Kiện"]

  const filteredProducts = productsData.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "Tất cả" || product.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const addToCart = (product) => {
    const existingItem = cart.find((item) => item.product.id === product.id)
    if (existingItem) {
      setCart(cart.map((item) => (item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)))
    } else {
      setCart([...cart, { product, quantity: 1 }])
    }
  }

  const updateQuantity = (productId, delta) => {
    setCart(
      cart
        .map((item) => (item.product.id === productId ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity > 0),
    )
  }

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.product.id !== productId))
  }

  const clearCart = () => {
    setCart([])
    setSelectedCustomer(null)
    setSelectedPromotion(null)
  }

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  const calculateDiscount = () => {
    if (!selectedPromotion || !selectedPromotion.isActive) return 0
    if (subtotal < selectedPromotion.minPurchase) return 0

    let discount = 0
    if (selectedPromotion.discountType === "percentage") {
      discount = (subtotal * selectedPromotion.discountValue) / 100
      if (selectedPromotion.maxDiscount) {
        discount = Math.min(discount, selectedPromotion.maxDiscount)
      }
    } else {
      discount = selectedPromotion.discountValue
    }
    return discount
  }

  const discount = calculateDiscount()
  const total = subtotal - discount

  const handleCheckout = () => {
    if (cart.length === 0) return
    console.log("[v0] Checkout:", {
      customer: selectedCustomer,
      promotion: selectedPromotion,
      cart,
      subtotal,
      discount,
      total,
      paymentMethod,
    })
    setIsCheckoutDialogOpen(false)
    clearCart()
    alert("Thanh toán thành công!")
  }

  const handleAddCustomer = () => {
    if (!newCustomerData.name || !newCustomerData.phone) {
      alert("Vui lòng nhập tên và số điện thoại khách hàng!")
      return
    }

    const newCustomer = {
      id: `CUS${String(customersData.length + 1).padStart(3, "0")}`,
      ...newCustomerData,
      totalPurchases: 0,
      createdAt: new Date().toISOString(),
    }
    customersData.push(newCustomer)
    setSelectedCustomer(newCustomer)
    setIsAddCustomerDialogOpen(false)
    setNewCustomerData({ name: "", email: "", phone: "", address: "" })
    alert("Thêm khách hàng thành công!")
  }

  return (
    <div className="d-flex" style={{ height: "100vh", backgroundColor: "#f8f9fa" }}>
      {/* Sidebar */}
      <div
        className="d-flex flex-column align-items-center py-4 gap-3"
        style={{ width: "80px", borderRight: "2px solid #dee2e6", backgroundColor: "#fff" }}
      >
        <Button
          variant={activeTab === "sell" ? "primary" : "outline"}
          className="p-3"
          onClick={() => setActiveTab("sell")}
          title="Bán hàng"
        >
          <ShoppingCart size={24} />
        </Button>
        <Button
          variant={activeTab === "customers" ? "primary" : "outline"}
          className="p-3"
          onClick={() => setActiveTab("customers")}
          title="Khách hàng"
        >
          <Users size={24} />
        </Button>
        <Button
          variant={activeTab === "promotions" ? "primary" : "outline"}
          className="p-3"
          onClick={() => setActiveTab("promotions")}
          title="Khuyến mãi"
        >
          <Tag size={24} />
        </Button>
        <Button
          variant={activeTab === "history" ? "primary" : "outline"}
          className="p-3"
          onClick={() => setActiveTab("history")}
          title="Lịch sử"
        >
          <History size={24} />
        </Button>
        <div className="flex-grow-1" />
        <Dropdown>
          <Dropdown.Toggle variant="outline" className="p-2" id="user-menu">
            <User size={20} />
          </Dropdown.Toggle>
          <Dropdown.Menu align="end">
            <Dropdown.Header>{currentUser?.name}</Dropdown.Header>
            <Dropdown.Divider />
            <Dropdown.Item onClick={logout} className="text-danger">
              <LogOut size={16} className="me-2" />
              Đăng xuất
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>

      {/* Main Content */}
      <div className="d-flex flex-column flex-grow-1" style={{ overflow: "hidden" }}>
        {/* Header */}
        <header
          className="d-flex justify-content-between align-items-center px-4"
          style={{ height: "64px", borderBottom: "2px solid #dee2e6", backgroundColor: "#fff" }}
        >
          <h1 className="fs-5 fw-bold mb-0">
            {activeTab === "sell" && "Bán Hàng"}
            {activeTab === "customers" && "Khách Hàng"}
            {activeTab === "promotions" && "Khuyến Mãi"}
            {activeTab === "history" && "Lịch Sử Bán Hàng"}
          </h1>
          {currentUser && (
            <div className="small text-muted">
              Nhân viên: <span className="fw-medium text-dark">{currentUser.name}</span>
            </div>
          )}
        </header>

        {/* Content Area */}
        <div className="d-flex flex-grow-1" style={{ overflow: "hidden" }}>
          {activeTab === "sell" && (
            <>
              {/* Products */}
              <div className="flex-grow-1" style={{ overflowY: "auto", padding: "1.5rem" }}>
                <div className="mb-4">
                  <Row className="g-3 mb-4">
                    <Col md={8}>
                      <div className="input-group">
                        <span className="input-group-text">
                          <Search size={18} />
                        </span>
                        <Form.Control
                          placeholder="Tìm sản phẩm..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </Col>
                    <Col md={4}>
                      <Form.Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </Form.Select>
                    </Col>
                  </Row>

                  <Row className="g-3">
                    {filteredProducts.map((product) => (
                      <Col key={product.id} xs={6} sm={4} lg={3}>
                        <Card
                          className="h-100 cursor-pointer"
                          style={{ cursor: "pointer" }}
                          onClick={() => addToCart(product)}
                        >
                          <Card.Body>
                            <div
                              className="bg-light rounded mb-3 d-flex align-items-center justify-content-center"
                              style={{ height: "120px", border: "2px solid #dee2e6" }}
                            >
                              <Package size={48} className="text-muted" />
                            </div>
                            <h6
                              className="card-title small mb-1"
                              style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                            >
                              {product.name}
                            </h6>
                            <p className="text-muted small mb-2">{product.category}</p>
                            <div className="d-flex justify-content-between align-items-center">
                              <strong className="small">
                                {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                                  product.price,
                                )}
                              </strong>
                              <Badge bg="light" text="dark" className="small">
                                {product.stock}
                              </Badge>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </div>
              </div>

              {/* Cart */}
              <div
                className="d-flex flex-column"
                style={{ width: "384px", borderLeft: "2px solid #dee2e6", backgroundColor: "#fff" }}
              >
                <div className="p-3" style={{ borderBottom: "2px solid #dee2e6" }}>
                  <h5 className="fw-bold mb-0">Giỏ hàng</h5>
                </div>

                <div className="flex-grow-1" style={{ overflowY: "auto", padding: "1rem" }}>
                  {/* Customer Selection */}
                  <Card className="mb-3">
                    <Card.Body className="p-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="small fw-medium">Khách hàng</span>
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0 text-decoration-none"
                          onClick={() => setIsCustomerDialogOpen(true)}
                        >
                          {selectedCustomer ? "Đổi" : "Chọn"}
                        </Button>
                      </div>
                      {selectedCustomer ? (
                        <div className="small">
                          <p className="fw-medium mb-1">{selectedCustomer.name}</p>
                          <p className="text-muted mb-0">{selectedCustomer.phone}</p>
                        </div>
                      ) : (
                        <p className="small text-muted mb-0">Khách lẻ</p>
                      )}
                    </Card.Body>
                  </Card>

                  {/* Promotion Selection */}
                  <Card className="mb-3">
                    <Card.Body className="p-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="small fw-medium">Khuyến mãi</span>
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0 text-decoration-none"
                          onClick={() => setIsPromotionDialogOpen(true)}
                        >
                          {selectedPromotion ? "Đổi" : "Chọn"}
                        </Button>
                      </div>
                      {selectedPromotion ? (
                        <div className="small">
                          <p className="fw-medium mb-1 font-monospace">{selectedPromotion.code}</p>
                          <p className="text-muted mb-0">{selectedPromotion.description}</p>
                        </div>
                      ) : (
                        <p className="small text-muted mb-0">Không có</p>
                      )}
                    </Card.Body>
                  </Card>

                  {/* Cart Items */}
                  {cart.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                      <ShoppingCart size={48} className="mb-2 opacity-50" />
                      <p className="small">Giỏ hàng trống</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {cart.map((item) => (
                        <Card key={item.product.id} className="mb-2">
                          <Card.Body className="p-3">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <div className="flex-grow-1">
                                <p className="fw-medium small mb-1">{item.product.name}</p>
                                <p className="text-muted small mb-0">
                                  {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                                    item.product.price,
                                  )}
                                </p>
                              </div>
                              <Button
                                variant="link"
                                size="sm"
                                className="p-0 text-danger"
                                onClick={() => removeFromCart(item.product.id)}
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                              <div className="input-group" style={{ width: "auto" }}>
                                <Button
                                  variant="outline-secondary"
                                  size="sm"
                                  className="px-2"
                                  onClick={() => updateQuantity(item.product.id, -1)}
                                >
                                  <Minus size={14} />
                                </Button>
                                <span className="px-2 d-flex align-items-center small fw-medium">{item.quantity}</span>
                                <Button
                                  variant="outline-secondary"
                                  size="sm"
                                  className="px-2"
                                  onClick={() => updateQuantity(item.product.id, 1)}
                                >
                                  <Plus size={14} />
                                </Button>
                              </div>
                              <p className="fw-bold small mb-0">
                                {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                                  item.product.price * item.quantity,
                                )}
                              </p>
                            </div>
                          </Card.Body>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                {/* Cart Summary */}
                <div className="p-3" style={{ borderTop: "2px solid #dee2e6" }}>
                  <div className="small mb-3">
                    <div className="d-flex justify-content-between mb-2">
                      <span>Tạm tính</span>
                      <span>
                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(subtotal)}
                      </span>
                    </div>
                    {discount > 0 && (
                      <div className="d-flex justify-content-between text-success mb-2">
                        <span>Giảm giá</span>
                        <span>
                          -{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(discount)}
                        </span>
                      </div>
                    )}
                    <div
                      className="d-flex justify-content-between fw-bold"
                      style={{ borderTop: "2px solid #dee2e6", paddingTop: "0.5rem" }}
                    >
                      <span>Tổng cộng</span>
                      <span>
                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(total)}
                      </span>
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <Button
                      variant="outline-secondary"
                      onClick={clearCart}
                      disabled={cart.length === 0}
                      className="flex-grow-1"
                    >
                      Hủy
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => setIsCheckoutDialogOpen(true)}
                      disabled={cart.length === 0}
                      className="flex-grow-1"
                    >
                      Thanh toán
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "customers" && (
            <div className="flex-grow-1" style={{ overflowY: "auto", padding: "1.5rem" }}>
              <Card className="mb-4">
                <Card.Header className="bg-light d-flex justify-content-between align-items-center">
                  <Card.Title className="mb-0">Danh sách khách hàng</Card.Title>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setIsAddCustomerDialogOpen(true)}
                    className="d-flex align-items-center gap-2"
                  >
                    <Plus size={16} />
                    Thêm
                  </Button>
                </Card.Header>
                <Card.Body className="p-0">
                  <div className="space-y-2 p-3">
                    {customersData.map((customer) => (
                      <Card key={customer.id} className="mb-2">
                        <Card.Body className="p-3">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <p className="fw-medium small mb-1">{customer.name}</p>
                              <p className="text-muted small mb-1">{customer.phone}</p>
                              <p className="text-muted small mb-0">{customer.email}</p>
                            </div>
                            <div className="text-end">
                              <p className="text-muted small mb-1">Tổng mua</p>
                              <p className="fw-semibold small">
                                {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                                  customer.totalPurchases,
                                )}
                              </p>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            </div>
          )}

          {activeTab === "promotions" && (
            <div className="flex-grow-1" style={{ overflowY: "auto", padding: "1.5rem" }}>
              <Card>
                <Card.Header className="bg-light">
                  <Card.Title className="mb-0">Danh sách khuyến mãi</Card.Title>
                </Card.Header>
                <Card.Body className="p-0">
                  <div className="space-y-2 p-3">
                    {promotionsData
                      .filter((p) => p.isActive)
                      .map((promotion) => (
                        <Card key={promotion.id} className="mb-2">
                          <Card.Body className="p-3">
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <p className="fw-medium small font-monospace mb-1">{promotion.code}</p>
                                <p className="text-muted small mb-1">{promotion.description}</p>
                                <p className="small mb-0">
                                  Giảm:{" "}
                                  {promotion.discountType === "percentage"
                                    ? `${promotion.discountValue}%`
                                    : new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                                        promotion.discountValue,
                                      )}
                                </p>
                              </div>
                              <Badge bg="light" text="dark" className="small">
                                {promotion.usageCount}
                                {promotion.usageLimit ? ` / ${promotion.usageLimit}` : ""}
                              </Badge>
                            </div>
                          </Card.Body>
                        </Card>
                      ))}
                  </div>
                </Card.Body>
              </Card>
            </div>
          )}

          {activeTab === "history" && (
            <div className="flex-grow-1" style={{ overflowY: "auto", padding: "1.5rem" }}>
              <Card>
                <Card.Header className="bg-light">
                  <Card.Title className="mb-0">Lịch sử bán hàng</Card.Title>
                </Card.Header>
                <Card.Body className="p-0">
                  <div className="space-y-2 p-3">
                    {ordersData.map((order) => (
                      <Card key={order.id} className="mb-2">
                        <Card.Body className="p-3">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                              <p className="fw-medium small font-monospace mb-1">{order.id}</p>
                              <p className="text-muted small mb-1">{order.customerName}</p>
                              <p className="text-muted small mb-0">
                                {new Date(order.createdAt).toLocaleString("vi-VN")}
                              </p>
                            </div>
                            <div className="text-end">
                              <p className="fw-bold small mb-1">
                                {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                                  order.total,
                                )}
                              </p>
                              <Badge bg={order.status === "completed" ? "success" : "danger"} className="small">
                                {order.status === "completed"
                                  ? "Hoàn thành"
                                  : order.status === "refunded"
                                    ? "Đã hoàn"
                                    : "Hủy"}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-muted small mb-0">
                            {order.items.length} sản phẩm • {order.paymentMethod}
                          </p>
                        </Card.Body>
                      </Card>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Customer Selection Modal */}
      <Modal show={isCustomerDialogOpen} onHide={() => setIsCustomerDialogOpen(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Chọn khách hàng</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "400px", overflowY: "auto" }}>
          {customersData.map((customer) => (
            <Card
              key={customer.id}
              className="mb-2"
              style={{ cursor: "pointer" }}
              onClick={() => {
                setSelectedCustomer(customer)
                setIsCustomerDialogOpen(false)
              }}
            >
              <Card.Body className="p-3">
                <p className="fw-medium small mb-1">{customer.name}</p>
                <p className="text-muted small mb-0">{customer.phone}</p>
              </Card.Body>
            </Card>
          ))}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setIsCustomerDialogOpen(false)}>
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setIsCustomerDialogOpen(false)
              setIsAddCustomerDialogOpen(true)
            }}
          >
            Thêm khách hàng mới
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Customer Modal */}
      <Modal show={isAddCustomerDialogOpen} onHide={() => setIsAddCustomerDialogOpen(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Thêm khách hàng mới</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label className="small">
              Tên khách hàng <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              value={newCustomerData.name}
              onChange={(e) => setNewCustomerData({ ...newCustomerData, name: e.target.value })}
              placeholder="Nhập tên khách hàng"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="small">
              Số điện thoại <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              value={newCustomerData.phone}
              onChange={(e) => setNewCustomerData({ ...newCustomerData, phone: e.target.value })}
              placeholder="Nhập số điện thoại"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="small">Email</Form.Label>
            <Form.Control
              type="email"
              value={newCustomerData.email}
              onChange={(e) => setNewCustomerData({ ...newCustomerData, email: e.target.value })}
              placeholder="Nhập email (tùy chọn)"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="small">Địa chỉ</Form.Label>
            <Form.Control
              value={newCustomerData.address}
              onChange={(e) => setNewCustomerData({ ...newCustomerData, address: e.target.value })}
              placeholder="Nhập địa chỉ (tùy chọn)"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setIsAddCustomerDialogOpen(false)
              setNewCustomerData({ name: "", email: "", phone: "", address: "" })
            }}
          >
            Hủy
          </Button>
          <Button variant="primary" onClick={handleAddCustomer}>
            Thêm khách hàng
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Promotion Selection Modal */}
      <Modal show={isPromotionDialogOpen} onHide={() => setIsPromotionDialogOpen(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Chọn khuyến mãi</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "400px", overflowY: "auto" }}>
          {promotionsData
            .filter((p) => p.isActive)
            .map((promotion) => (
              <Card
                key={promotion.id}
                className="mb-2"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setSelectedPromotion(promotion)
                  setIsPromotionDialogOpen(false)
                }}
              >
                <Card.Body className="p-3">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p className="fw-medium small font-monospace mb-1">{promotion.code}</p>
                      <p className="text-muted small mb-1">{promotion.description}</p>
                      <p className="small mb-1">
                        Giảm:{" "}
                        {promotion.discountType === "percentage"
                          ? `${promotion.discountValue}%`
                          : new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                              promotion.discountValue,
                            )}
                      </p>
                      <p className="text-muted small mb-0">
                        Đơn tối thiểu:{" "}
                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                          promotion.minPurchase,
                        )}
                      </p>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            ))}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setSelectedPromotion(null)
              setIsPromotionDialogOpen(false)
            }}
          >
            Bỏ chọn
          </Button>
          <Button variant="secondary" onClick={() => setIsPromotionDialogOpen(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Checkout Modal */}
      <Modal show={isCheckoutDialogOpen} onHide={() => setIsCheckoutDialogOpen(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận thanh toán</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label className="small">Phương thức thanh toán</Form.Label>
            <Form.Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
              <option value="cash">Tiền mặt</option>
              <option value="card">Thẻ</option>
              <option value="transfer">Chuyển khoản</option>
            </Form.Select>
          </Form.Group>
          <Card className="mb-3">
            <Card.Body className="p-3">
              <div className="small">
                <div className="d-flex justify-content-between mb-2">
                  <span>Tạm tính</span>
                  <span>{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="d-flex justify-content-between text-success mb-2">
                    <span>Giảm giá</span>
                    <span>
                      -{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(discount)}
                    </span>
                  </div>
                )}
                <div
                  className="d-flex justify-content-between fw-bold"
                  style={{ borderTop: "2px solid #dee2e6", paddingTop: "0.5rem" }}
                >
                  <span>Tổng cộng</span>
                  <span>{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(total)}</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setIsCheckoutDialogOpen(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleCheckout}>
            Xác nhận thanh toán
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
