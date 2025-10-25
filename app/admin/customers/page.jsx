"use client"

import { useState } from "react"
import { Plus, Search, Edit, Trash2 } from "lucide-react"
import { Container, Card, Button, Form, Table, Modal } from "react-bootstrap"
import { customersData } from "@/lib/data/customers"

export default function CustomersPage() {
  const [customers, setCustomers] = useState(customersData)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  })

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm),
  )

  const handleAdd = () => {
    const newCustomer = {
      id: `CUS${String(customers.length + 1).padStart(3, "0")}`,
      ...formData,
      totalPurchases: 0,
      createdAt: new Date().toISOString(),
    }
    setCustomers([...customers, newCustomer])
    setIsAddDialogOpen(false)
    setFormData({ name: "", email: "", phone: "", address: "" })
  }

  const handleEdit = () => {
    if (!selectedCustomer) return
    setCustomers(customers.map((c) => (c.id === selectedCustomer.id ? { ...c, ...formData } : c)))
    setIsEditDialogOpen(false)
    setSelectedCustomer(null)
    setFormData({ name: "", email: "", phone: "", address: "" })
  }

  const handleDelete = () => {
    if (!selectedCustomer) return
    setCustomers(customers.filter((c) => c.id !== selectedCustomer.id))
    setIsDeleteDialogOpen(false)
    setSelectedCustomer(null)
  }

  const openEditDialog = (customer) => {
    setSelectedCustomer(customer)
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
    })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (customer) => {
    setSelectedCustomer(customer)
    setIsDeleteDialogOpen(true)
  }

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h1 className="display-6 fw-bold">Quản Lý Khách Hàng</h1>
          <p className="text-muted">Quản lý thông tin khách hàng</p>
        </div>
        <Button variant="primary" onClick={() => setIsAddDialogOpen(true)} className="d-flex align-items-center gap-2">
          <Plus size={18} />
          Thêm khách hàng
        </Button>
      </div>

      <Card className="mb-4">
        <Card.Header className="bg-light">
          <Card.Title className="mb-3">Danh sách khách hàng</Card.Title>
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
          <Table hover responsive className="mb-0">
            <thead className="table-light">
              <tr>
                <th>Mã KH</th>
                <th>Tên</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Địa chỉ</th>
                <th className="text-end">Tổng mua</th>
                <th className="text-end">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.id}>
                  <td className="fw-medium">{customer.id}</td>
                  <td>{customer.name}</td>
                  <td>{customer.email}</td>
                  <td>{customer.phone}</td>
                  <td style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {customer.address}
                  </td>
                  <td className="text-end">
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                      customer.totalPurchases,
                    )}
                  </td>
                  <td className="text-end">
                    <div className="d-flex justify-content-end gap-2">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => openEditDialog(customer)}
                        className="p-2"
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => openDeleteDialog(customer)}
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
      <Modal show={isAddDialogOpen} onHide={() => setIsAddDialogOpen(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Thêm khách hàng mới</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Tên khách hàng</Form.Label>
            <Form.Control value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Số điện thoại</Form.Label>
            <Form.Control
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Địa chỉ</Form.Label>
            <Form.Control
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
      <Modal show={isEditDialogOpen} onHide={() => setIsEditDialogOpen(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Chỉnh sửa khách hàng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Tên khách hàng</Form.Label>
            <Form.Control value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Số điện thoại</Form.Label>
            <Form.Control
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Địa chỉ</Form.Label>
            <Form.Control
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
          Bạn có chắc chắn muốn xóa khách hàng <strong>{selectedCustomer?.name}</strong>? Hành động này không thể hoàn
          tác.
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
