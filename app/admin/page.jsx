"use client"

import { Card, Container, Row, Col } from "react-bootstrap"
import { Users, Package, ShoppingCart, TrendingUp } from "lucide-react"
import { customersData } from "@/lib/data/customers"
import { productsData } from "@/lib/data/products"
import { ordersData } from "@/lib/data/orders"

export default function AdminDashboard() {
  const totalCustomers = customersData.length
  const totalProducts = productsData.length
  const totalOrders = ordersData.length
  const totalRevenue = ordersData.reduce((sum, order) => sum + order.total, 0)

  const stats = [
    {
      title: "Tổng khách hàng",
      value: totalCustomers,
      icon: Users,
      color: "text-primary",
    },
    {
      title: "Tổng sản phẩm",
      value: totalProducts,
      icon: Package,
      color: "text-success",
    },
    {
      title: "Tổng đơn hàng",
      value: totalOrders,
      icon: ShoppingCart,
      color: "text-warning",
    },
    {
      title: "Doanh thu",
      value: new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(totalRevenue),
      icon: TrendingUp,
      color: "text-info",
    },
  ]

  return (
    <Container fluid className="py-4">
      <div className="mb-4">
        <h1 className="display-6 fw-bold">Tổng Quan</h1>
        <p className="text-muted">Xem tổng quan về hoạt động cửa hàng</p>
      </div>

      <Row className="g-4 mb-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Col key={stat.title} xs={12} sm={6} lg={3}>
              <Card className="h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p className="text-muted small mb-2">{stat.title}</p>
                      <h3 className="fw-bold">{stat.value}</h3>
                    </div>
                    <Icon className={`${stat.color}`} size={24} />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          )
        })}
      </Row>

      <Row className="g-4">
        <Col lg={6}>
          <Card>
            <Card.Header className="bg-light">
              <Card.Title className="mb-0">Đơn hàng gần đây</Card.Title>
            </Card.Header>
            <Card.Body>
              <div className="space-y-4">
                {ordersData.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="d-flex justify-content-between align-items-start pb-3 border-bottom"
                    style={{ paddingBottom: "1rem" }}
                  >
                    <div>
                      <p className="fw-medium mb-1">{order.id}</p>
                      <p className="text-muted small">{order.customerName}</p>
                    </div>
                    <div className="text-end">
                      <p className="fw-medium mb-1">
                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(order.total)}
                      </p>
                      <p className="text-muted small">{new Date(order.createdAt).toLocaleDateString("vi-VN")}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card>
            <Card.Header className="bg-light">
              <Card.Title className="mb-0">Sản phẩm sắp hết hàng</Card.Title>
            </Card.Header>
            <Card.Body>
              <div className="space-y-4">
                {productsData
                  .filter((p) => p.stock < 50)
                  .slice(0, 5)
                  .map((product) => (
                    <div
                      key={product.id}
                      className="d-flex justify-content-between align-items-start pb-3 border-bottom"
                      style={{ paddingBottom: "1rem" }}
                    >
                      <div>
                        <p className="fw-medium mb-1">{product.name}</p>
                        <p className="text-muted small">{product.sku}</p>
                      </div>
                      <div className="text-end">
                        <p className="fw-medium text-warning">{product.stock} sản phẩm</p>
                      </div>
                    </div>
                  ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}
