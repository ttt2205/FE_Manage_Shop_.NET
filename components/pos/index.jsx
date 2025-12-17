"use client";

import { useEffect, useState } from "react";
import {
  ShoppingCart,
  Users,
  Tag,
  History,
  Plus,
  Minus,
  Trash2,
  Search,
  Package,
  LogOut,
  User,
} from "lucide-react";
import {
  Row,
  Col,
  Card,
  Button,
  Form,
  Modal,
  Badge,
  Dropdown,
  Pagination,
} from "react-bootstrap";
import { customersData } from "@/lib/data/customers";
import jsPDF from "jspdf";
import "../../lib/fonts/roboto";
import { getCurrentUser, logout } from "@/lib/auth";
import { toast, ToastContainer } from "react-toastify";
import productService from "@/service/productService";
import categoryService from "@/service/categoryService";
import PromotionService from "@/service/promotionService";
import orderService from "@/service/orderService";
import paymentService from "@/service/paymentService";
import Customers from "./components/Customers";
import CustomerSectionModal from "./components/CustomerSectionModal";

export default function POSPage() {
  const currentUser = getCurrentUser();

  // Tab & Loading
  const [activeTab, setActiveTab] = useState("sell");
  const [loading, setLoading] = useState(false);

  // Products, Categories, Promotions, History
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectDate, setSelectDate] = useState(() => {
    const today = new Date();
    // chuyển sang định dạng YYYY-MM-DD
    return today.toISOString().split("T")[0];
  });

  // Cart & Customer & Promotion
  const [cart, setCart] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cash");

  // Dialogs
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [isAddCustomerDialogOpen, setIsAddCustomerDialogOpen] = useState(false);
  const [isPromotionDialogOpen, setIsPromotionDialogOpen] = useState(false);
  const [isCheckoutDialogOpen, setIsCheckoutDialogOpen] = useState(false);

  // Search & Category Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Tất cả");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // ===================== FETCH DATA =====================
  const fetchProducts = async (page = 1, pageSize = itemsPerPage) => {
    try {
      setLoading(true);
      const res = await productService.getProducts({
        page,
        pageSize,
        search: searchTerm,
        // category: categoryFilter !== "Tất cả" ? categoryFilter : undefined,
      });

      setProducts(res.result || []);
      setTotalPages(res.meta?.totalPage || 1);
      setCurrentPage(res.meta?.currentPage || page);
    } catch (err) {
      toast.error("Không có danh sách sản phẩm!");
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
      toast.error("Lỗi khi tải danh mục!");
    }
  };

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const res = await PromotionService.getAllPromotion();
      if (res && res.status === 200) {
        setPromotions(res.result || []);
      }
    } catch (err) {
      toast.error("Lỗi khi tải danh sách khuyến mãi!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await orderService.getOrdersByDate(selectDate);
      if (res && res.status === 200) {
        setOrders(res.result || []);
      }
    } catch {
      toast.error("Lỗi khi tải danh sách lịch sử mua hàng!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(currentPage, itemsPerPage);
  }, [currentPage, itemsPerPage, searchTerm, categoryFilter]);

  useEffect(() => {
    fetchCategories();
    fetchPromotions();
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [selectDate]);

  // ===================== CART LOGIC =====================
  const addToCart = (product) => {
    const existing = cart.find((item) => item.product.id === product.id);
    if (existing) {
      setCart(
        cart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId, delta) => {
    setCart(
      cart
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setSelectedCustomer(null);
    setSelectedPromotion(null);
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const calculateDiscount = () => {
    if (!selectedPromotion || selectedPromotion.status !== "active") return 0;
    if (subtotal < (selectedPromotion.minOrderAmount || 0)) return 0;

    let discount = 0;
    const type = selectedPromotion.discountType?.toLowerCase();

    if (type === "percent") {
      discount = (subtotal * selectedPromotion.discountValue) / 100;
    } else if (type === "fixed") {
      discount = selectedPromotion.discountValue || 0;
    }
    return discount;
  };

  const discount = calculateDiscount();
  const total = subtotal - discount;

  // ===================== CHECKOUT =====================
  const handleCheckout = async () => {
    // if (!selectedCustomer) {
    //   toast.warning("Vui lòng chọn khách hàng!");
    //   return;
    // }

    if (selectedPromotion!= null && selectedPromotion?.minOrderAmount > subtotal) {
      console.log("Invalid promotion:", selectedPromotion, subtotal);
      toast.warning("Khuyễn mãi không hợp lệ");
      return;
    }

    const orderData = {
      customerId: selectedCustomer ? selectedCustomer.id : null,
      userId: currentUser.id,
      promotionId: selectedPromotion ? selectedPromotion.id : null,
      status: "pending",
      totalAmount: total,
      discountAmount: discount,
      items: cart.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
        subtotal: item.product.price * item.quantity,
      })),
    };

    try {
      // Tạo order
      const response = await orderService.createOrder(orderData);
      const createdOrder = response.data; // backend trả data bên trong field "data"
      // console.log("Created Order:", createdOrder);
      if (!createdOrder?.id) {
        toast.error("Không tạo được đơn hàng!");
        return;
      }

      // Tạo payment
      await paymentService.createPayment({
        orderId: Number(createdOrder.id),
        PaymentMethod: paymentMethod,
      });
      const orderId = createdOrder.id;
      const orderDetails = await orderService.getById(orderId);
      generateInvoicePDF(orderDetails.data);
      toast.success("Tạo đơn hàng và thanh toán thành công!");
    } catch (error) {
      const backendMessage =
        error?.response?.data?.Message || error?.message || "Không thể tạo đơn hàng hoặc thanh toán.";
      toast.error(backendMessage);
    }
  };

  // ===================== FILTERED PRODUCTS =====================
  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      categoryFilter === "Tất cả" ||
      product.category?.categoryName === categoryFilter;
    return matchesCategory;
  });

  const generateInvoicePDF = (order) => {
    

    const doc = new jsPDF();
    doc.setFont("Roboto-Regular", "normal");
    console.log(doc.getFontList());
    doc.setFontSize(16);
    doc.text("HÓA ĐƠN THANH TOÁN", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.text(`Mã đơn hàng: ${order.id}`, 20, 40);
    doc.text(`Khách hàng: ${order.customer?.name || "Khách lẻ"}`, 20, 50);
    doc.text(`Ngày: ${new Date(order.orderDate).toLocaleString()}`, 20, 60);

    // Tiêu đề bảng
    doc.text("STT", 20, 80);
    doc.text("Sản phẩm", 40, 80);
    doc.text("SL", 120, 80);
    doc.text("Đơn giá", 140, 80);
    doc.text("Thành tiền", 180, 80);

    let y = 90;
    order.items.forEach((item, index) => {
      doc.text(`${index + 1}`, 20, y);
      doc.text(`${item.productName}`, 40, y);
      doc.text(`${item.quantity}`, 120, y);
      doc.text(`${item.price}`, 140, y);
      doc.text(`${item.subtotal}`, 180, y);
      y += 10;
    });

    doc.text(`Tổng: ${order.totalAmount + order.discountAmount}`, 140, y + 10);
    doc.text(`Giảm giá: ${order.discountAmount}`, 140, y + 20);
    doc.text(`Thanh toán: ${order.totalAmount}`, 140, y + 30);

    doc.save(`invoice_order_${order.id}.pdf`);
  };

  return (
    <div
      className="d-flex"
      style={{ height: "100vh", backgroundColor: "#f8f9fa" }}
    >
      <ToastContainer position="top-right" autoClose={2000} />
      {/* Sidebar */}
      <div
        className="d-flex flex-column align-items-center py-4 gap-3"
        style={{
          width: "80px",
          borderRight: "2px solid #dee2e6",
          backgroundColor: "#fff",
        }}
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
      <div
        className="d-flex flex-column flex-grow-1"
        style={{ overflow: "hidden" }}
      >
        {/* Header */}
        <header
          className="d-flex justify-content-between align-items-center px-4"
          style={{
            height: "64px",
            borderBottom: "2px solid #dee2e6",
            backgroundColor: "#fff",
          }}
        >
          <h1 className="fs-5 fw-bold mb-0">
            {activeTab === "sell" && "Bán Hàng"}
            {activeTab === "customers" && "Khách Hàng"}
            {activeTab === "promotions" && "Khuyến Mãi"}
            {activeTab === "history" && "Lịch Sử Bán Hàng"}
          </h1>
          {currentUser && (
            <div className="small text-muted">
              Nhân viên:{" "}
              <span className="fw-medium text-dark">{currentUser.name}</span>
            </div>
          )}
        </header>

        {/* Content Area */}
        <div className="d-flex flex-grow-1" style={{ overflow: "hidden" }}>
          {activeTab === "sell" && (
            <>
              {/* Products */}
              <div
                className="flex-grow-1"
                style={{ overflowY: "auto", padding: "1.5rem" }}
              >
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
                      <Form.Select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                      >
                        <option value="Tất cả">{"Tất cả"}</option>
                        {categories &&
                          categories.length > 0 &&
                          categories.map((cat) => (
                            <option key={cat.id} value={cat.categoryName}>
                              {cat.categoryName}
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
                              style={{
                                height: "120px",
                                border: "2px solid #dee2e6",
                              }}
                            >
                              <Package size={48} className="text-muted" />
                            </div>
                            <h6
                              className="card-title small mb-1"
                              style={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {product.productName}
                            </h6>
                            <p className="text-muted small mb-2">
                              {product.categoryName}
                            </p>
                            <div className="d-flex justify-content-between align-items-center">
                              <strong className="small">
                                {new Intl.NumberFormat("vi-VN", {
                                  style: "currency",
                                  currency: "VND",
                                }).format(product.price)}
                              </strong>
                              <Badge bg="light" text="dark" className="small">
                                {product.unit}
                              </Badge>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}

                    <div className="d-flex justify-content-end align-items-center mt-3">
                      <Form.Select
                        value={itemsPerPage}
                        onChange={(e) => {
                          setItemsPerPage(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        style={{ width: "120px", marginRight: "1rem" }}
                      >
                        {[5, 10, 20].map((n) => (
                          <option key={n} value={n}>
                            {n} / trang
                          </option>
                        ))}
                      </Form.Select>

                      <Pagination>
                        <Pagination.Prev
                          disabled={currentPage === 1}
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                          }
                        />
                        {[...Array(totalPages)].map((_, i) => (
                          <Pagination.Item
                            key={i + 1}
                            active={currentPage === i + 1}
                            onClick={() => setCurrentPage(i + 1)}
                          >
                            {i + 1}
                          </Pagination.Item>
                        ))}
                        <Pagination.Next
                          disabled={currentPage === totalPages}
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(prev + 1, totalPages)
                            )
                          }
                        />
                      </Pagination>
                    </div>
                  </Row>
                </div>
              </div>

              {/* Cart */}
              <div
                className="d-flex flex-column"
                style={{
                  width: "384px",
                  borderLeft: "2px solid #dee2e6",
                  backgroundColor: "#fff",
                }}
              >
                <div
                  className="p-3"
                  style={{ borderBottom: "2px solid #dee2e6" }}
                >
                  <h5 className="fw-bold mb-0">Giỏ hàng</h5>
                </div>

                <div
                  className="flex-grow-1"
                  style={{ overflowY: "auto", padding: "1rem" }}
                >
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
                          <p className="fw-medium mb-1">
                            {selectedCustomer.name}
                          </p>
                          <p className="text-muted mb-0">
                            {selectedCustomer.phone}
                          </p>
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
                          <p className="fw-medium mb-1 font-monospace">
                            {selectedPromotion.promoCode}
                          </p>
                          <p className="text-muted mb-1">
                            {selectedPromotion.description}
                          </p>
                          {subtotal <
                            (selectedPromotion.minOrderAmount || 0) && (
                              <p className="text-danger small mb-0">
                                Chưa đủ điều kiện (tối thiểu{" "}
                                {selectedPromotion.minOrderAmount}₫)
                              </p>
                            )}
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
                                <p className="fw-medium small mb-1">
                                  {item.product.productName}
                                </p>
                                <p className="text-muted small mb-0">
                                  {new Intl.NumberFormat("vi-VN", {
                                    style: "currency",
                                    currency: "VND",
                                  }).format(item.product.price)}
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
                              <div
                                className="input-group"
                                style={{ width: "auto" }}
                              >
                                <Button
                                  variant="outline-secondary"
                                  size="sm"
                                  className="px-2"
                                  onClick={() =>
                                    updateQuantity(item.product.id, -1)
                                  }
                                >
                                  <Minus size={14} />
                                </Button>
                                <span className="px-2 d-flex align-items-center small fw-medium">
                                  {item.quantity}
                                </span>
                                <Button
                                  variant="outline-secondary"
                                  size="sm"
                                  className="px-2"
                                  onClick={() =>
                                    updateQuantity(item.product.id, 1)
                                  }
                                >
                                  <Plus size={14} />
                                </Button>
                              </div>
                              <p className="fw-bold small mb-0">
                                {new Intl.NumberFormat("vi-VN", {
                                  style: "currency",
                                  currency: "VND",
                                }).format(item.product.price * item.quantity)}
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
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(subtotal)}
                      </span>
                    </div>
                    {discount > 0 && (
                      <div className="d-flex justify-content-between text-success mb-2">
                        <span>Giảm giá</span>
                        <span>
                          -
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(discount)}
                        </span>
                      </div>
                    )}
                    <div
                      className="d-flex justify-content-between fw-bold"
                      style={{
                        borderTop: "2px solid #dee2e6",
                        paddingTop: "0.5rem",
                      }}
                    >
                      <span>Tổng cộng</span>
                      <span>
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(total)}
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
            <div
              className="flex-grow-1"
              style={{ overflowY: "auto", padding: "1.5rem" }}
            >
              <Customers
                isAddCustomerDialogOpen={isAddCustomerDialogOpen}
                setIsAddCustomerDialogOpen={setIsAddCustomerDialogOpen}
              />
            </div>
          )}

          {activeTab === "promotions" && (
            <div
              className="flex-grow-1"
              style={{ overflowY: "auto", padding: "1.5rem" }}
            >
              <Card>
                <Card.Header className="bg-light">
                  <Card.Title className="mb-0">Danh sách khuyến mãi</Card.Title>
                </Card.Header>
                <Card.Body className="p-0">
                  <div className="space-y-2 p-3">
                    {promotions.length > 0 &&
                      promotions
                        .filter((p) => p.status)
                        .map((promotion) => (
                          <Card key={promotion.id} className="mb-2">
                            <Card.Body className="p-3">
                              <div className="d-flex justify-content-between align-items-start">
                                <div>
                                  <p className="fw-medium small font-monospace mb-1">
                                    {promotion.promoCode}
                                  </p>
                                  <p className="text-muted small mb-1">
                                    {promotion.description}
                                  </p>
                                  <p className="small mb-0">
                                    Giảm:{" "}
                                    {promotion.discountType === "percent"
                                      ? `${promotion.discountValue}%`
                                      : new Intl.NumberFormat("vi-VN", {
                                        style: "currency",
                                        currency: "VND",
                                      }).format(promotion.discountValue)}
                                  </p>
                                </div>
                                <Badge bg="light" text="dark" className="small">
                                  {promotion.usedCount}
                                  {promotion.usageLimit
                                    ? ` / ${promotion.usageLimit}`
                                    : ""}
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
            <div
              className="flex-grow-1"
              style={{ overflowY: "auto", padding: "1.5rem" }}
            >
              <Card>
                <Card.Header className="bg-light d-flex justify-content-between align-items-center">
                  <Card.Title className="mb-0">Lịch sử bán hàng</Card.Title>

                  <div className="d-flex align-items-center gap-2">
                    <span className="text-muted small">Ngày:</span>
                    <input
                      type="date"
                      value={selectDate}
                      onChange={(e) => setSelectDate(e.target.value)}
                      className="form-control form-control-sm"
                      style={{ width: "150px" }}
                    />
                  </div>
                </Card.Header>
                <Card.Body className="p-0">
                  <div className="space-y-2 p-3">
                    {orders &&
                      orders.length > 0 &&
                      orders.map((order) => (
                        <Card key={order.id} className="mb-2">
                          <Card.Body className="p-3">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <div>
                                <p className="fw-medium small font-monospace mb-1">
                                  {order.id}
                                </p>
                                <p className="text-muted small mb-1">
                                  {order.customer
                                    ? order.customer.name
                                    : "Khách lẻ"}
                                </p>
                                <p className="text-muted small mb-0">
                                  {new Date(order.orderDate).toLocaleString(
                                    "vi-VN"
                                  )}
                                </p>
                              </div>
                              <div className="text-end">
                                <p className="fw-bold small mb-1">
                                  {new Intl.NumberFormat("vi-VN", {
                                    style: "currency",
                                    currency: "VND",
                                  }).format(order.totalAmount)}
                                </p>
                                <Badge
                                  bg={
                                    order.status === "paid"
                                      ? "success"
                                      : order.status === "refunded"
                                        ? "info"
                                        : order.status === "pending"
                                          ? "warning"
                                          : "danger"
                                  }
                                  className="small"
                                >
                                  {order.status === "paid"
                                    ? "Hoàn thành"
                                    : order.status === "refunded"
                                      ? "Đã hoàn"
                                      : order.status === "pending"
                                        ? "Đang chờ"
                                        : "Hủy"}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-muted small mb-0">
                              {order.items.length} sản phẩm •{" "}
                              {order.paymentMethod}
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
      <CustomerSectionModal
        isCustomerDialogOpen={isCustomerDialogOpen}
        setIsCustomerDialogOpen={setIsCustomerDialogOpen}
        setSelectedCustomer={setSelectedCustomer}
      />

      {/* Promotion Selection Modal */}
      <Modal
        show={isPromotionDialogOpen}
        onHide={() => setIsPromotionDialogOpen(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Chọn khuyến mãi</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "400px", overflowY: "auto" }}>
          {promotions &&
            promotions.length > 0 &&
            promotions
              .filter((p) => p.status === "active")
              .map((promotion) => (
                <Card
                  key={promotion.id}
                  className="mb-2"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setSelectedPromotion(promotion);
                    setIsPromotionDialogOpen(false);
                  }}
                >
                  <Card.Body className="p-3">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <p className="fw-medium small font-monospace mb-1">
                          {promotion.promoCode}
                        </p>
                        <p className="text-muted small mb-1">
                          {promotion.description}
                        </p>
                        <p className="small mb-1">
                          Giảm:{" "}
                          {promotion.discountType === "percent"
                            ? `${promotion.discountValue}%`
                            : new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(promotion.discountValue)}
                        </p>
                        <p className="text-muted small mb-0">
                          Đơn tối thiểu:{" "}
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(promotion.minOrderAmount)}
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
              setSelectedPromotion(null);
              setIsPromotionDialogOpen(false);
            }}
          >
            Bỏ chọn
          </Button>
          <Button
            variant="secondary"
            onClick={() => setIsPromotionDialogOpen(false)}
          >
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Checkout Modal */}
      <Modal
        show={isCheckoutDialogOpen}
        onHide={() => setIsCheckoutDialogOpen(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận thanh toán</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label className="small">Phương thức thanh toán</Form.Label>
            <Form.Select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="cash">Tiền mặt</option>
              <option value="card">Thẻ</option>
              <option value="bank_transfer">Chuyển khoản</option>
            </Form.Select>
          </Form.Group>
          <Card className="mb-3">
            <Card.Body className="p-3">
              <div className="small">
                <div className="d-flex justify-content-between mb-2">
                  <span>Tạm tính</span>
                  <span>
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(subtotal)}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="d-flex justify-content-between text-success mb-2">
                    <span>Giảm giá</span>
                    <span>
                      -
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(discount)}
                    </span>
                  </div>
                )}
                <div
                  className="d-flex justify-content-between fw-bold"
                  style={{
                    borderTop: "2px solid #dee2e6",
                    paddingTop: "0.5rem",
                  }}
                >
                  <span>Tổng cộng</span>
                  <span>
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(total)}
                  </span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setIsCheckoutDialogOpen(false)}
          >
            Hủy
          </Button>
          <Button variant="primary" onClick={handleCheckout}>
            Xác nhận thanh toán
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
