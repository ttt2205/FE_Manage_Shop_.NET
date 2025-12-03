"use client";

import React, { useEffect } from "react";
import { useState } from "react";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import {
  Container,
  Card,
  Button,
  Form,
  Table,
  Modal,
  Alert,
  Spinner,
} from "react-bootstrap";
import PaginationCustom from "@/components/admin/customer/components/PaginationCustom";
import {
  createCustomer,
  deleteCustomer,
  getPaginationCustomer,
  updateCustomer,
} from "@/service/customer-service";
import { toast } from "react-toastify";

function index() {
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [meta, setMeta] = useState({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPage: 1,
  });
  const [loading, setLoading] = useState(false);

  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    fetchCustomers();
  }, [page, size, debouncedSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500); // 500ms

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // ================================ Fectch Functions ================================

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await getPaginationCustomer({
        page,
        size,
        search: debouncedSearch ?? "",
      });
      setCustomers(res.result || []);
      setMeta(res.meta ?? meta);
    } catch (error) {
      setError("Unable to connect server");
    } finally {
      setLoading(false);
    }
  };

  // ================================ Handle Functions ================================
  const handleAdd = async () => {
    try {
      const data = { ...formData };
      const res = await createCustomer(data);
      if (res && res.status === 201) {
        setCustomers([...customers, res.data]);
        toast.success("Create customer successfully");
      } else {
        toast.error("Create customer unsuccessfully");
      }
      setIsAddDialogOpen(false);
      setFormData({ name: "", email: "", phone: "", address: "" });
    } catch (error) {
      toast.error("Create customer unsuccessfully");
      setIsAddDialogOpen(false);
      setFormData({ name: "", email: "", phone: "", address: "" });
    }
  };

  const handleEdit = async () => {
    if (!selectedCustomer) {
      toast.warning("Can't find customer to edit");
      return;
    }

    try {
      const id = selectedCustomer.id;
      const data = { ...formData };
      const res = await updateCustomer(id, data);
      if (res && res.status === 200) {
        fetchCustomers();
        toast.success("Update customer successfully");
      } else {
        toast.error("Update customer unsuccessfully");
      }
      setIsEditDialogOpen(false);
      setFormData({ name: "", email: "", phone: "", address: "" });
    } catch (error) {
      toast.error("Update customer unsuccessfully");
      setIsEditDialogOpen(false);
      setFormData({ name: "", email: "", phone: "", address: "" });
    }
  };

  const handleDelete = async () => {
    if (!selectedCustomer) {
      toast.warning("Can't find customer to delete");
      return;
    }
    try {
      const res = await deleteCustomer(selectedCustomer.id);
      if (res && res.status === 200) {
        toast.success("Delete customer successfully");
        setCustomers(customers.filter((c) => c.id !== selectedCustomer.id));
        setIsDeleteDialogOpen(false);
      } else {
        toast.error("Delete customer unsuccessfully");
        setIsDeleteDialogOpen(false);
        setSelectedCustomer(null);
      }
    } catch (error) {
      toast.error("Delete customer unsuccessfully");
      setIsDeleteDialogOpen(false);
      setSelectedCustomer(null);
    }
  };

  const openEditDialog = (customer) => {
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (customer) => {
    setSelectedCustomer(customer);
    setIsDeleteDialogOpen(true);
  };

  // ================================ Render UI ================================
  return (
    <>
      <Container fluid className="py-4">
        <div className="d-flex justify-content-between align-items-start mb-4">
          <div>
            <h1 className="display-6 fw-bold">Quản Lý Khách Hàng</h1>
            <p className="text-muted">Quản lý thông tin khách hàng</p>
          </div>
          <Button
            variant="primary"
            onClick={() => setIsAddDialogOpen(true)}
            className="d-flex align-items-center gap-2"
          >
            <Plus size={18} />
            Thêm khách hàng
          </Button>
        </div>

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Card className="mb-4">
          <Card.Header className="bg-light">
            <Card.Title className="mb-3">Danh sách khách hàng</Card.Title>
            <div className="d-flex justify-content-between align-items-center mb-3 gap-2">
              {/* Search */}
              <div className="input-group" style={{ maxWidth: "400px" }}>
                <span className="input-group-text">
                  <Search size={18} />
                </span>
                <Form.Control
                  placeholder="Tìm kiếm theo tên, email, số điện thoại..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Select Size */}
              <div className="d-flex align-items-center gap-2">
                <span className="text-muted small">Hiển thị</span>
                <Form.Select
                  style={{ width: "90px" }}
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </Form.Select>
                <span className="text-muted small">dòng</span>
              </div>
            </div>
          </Card.Header>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Đang tải...</span>
              </Spinner>
              <p className="mt-2 text-muted">Đang tải dữ liệu...</p>
            </div>
          ) : !customers && customers.length === 0 ? (
            <p style={{ display: "flex", justifyContent: "center" }}>
              Không có dữ liệu
            </p>
          ) : (
            <Card.Body className="p-0">
              <Table hover responsive className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Mã KH</th>
                    <th>Tên</th>
                    <th>Email</th>
                    <th>Số điện thoại</th>
                    <th>Địa chỉ</th>
                    {/* <th className="text-end">Tổng mua</th> */}
                    <th className="text-end">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id}>
                      <td className="fw-medium">{customer.id}</td>
                      <td>{customer.name}</td>
                      <td>{customer.email}</td>
                      <td>{customer.phone}</td>
                      <td
                        style={{
                          maxWidth: "200px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {customer.address}
                      </td>
                      {/* <td className="text-end">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(customer.totalPurchases)}
                      </td> */}
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
          )}
        </Card>

        <PaginationCustom
          page={page}
          totalPages={meta.totalPage}
          onChange={setPage}
        />

        {/* Add Modal */}
        <Modal show={isAddDialogOpen} onHide={() => setIsAddDialogOpen(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Thêm khách hàng mới</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Tên khách hàng</Form.Label>
              <Form.Control
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Số điện thoại</Form.Label>
              <Form.Control
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Địa chỉ</Form.Label>
              <Form.Control
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setIsAddDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button variant="primary" onClick={handleAdd}>
              Thêm
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Edit Modal */}
        <Modal
          show={isEditDialogOpen}
          onHide={() => setIsEditDialogOpen(false)}
        >
          <Modal.Header closeButton>
            <Modal.Title>Chỉnh sửa khách hàng</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Tên khách hàng</Form.Label>
              <Form.Control
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Số điện thoại</Form.Label>
              <Form.Control
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Địa chỉ</Form.Label>
              <Form.Control
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button variant="primary" onClick={handleEdit}>
              Lưu thay đổi
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Delete Modal */}
        <Modal
          show={isDeleteDialogOpen}
          onHide={() => setIsDeleteDialogOpen(false)}
        >
          <Modal.Header closeButton>
            <Modal.Title>Xác nhận xóa</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Bạn có chắc chắn muốn xóa khách hàng{" "}
            <strong>{selectedCustomer?.name}</strong>? Hành động này không thể
            hoàn tác.
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Xóa
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </>
  );
}

export default index;
