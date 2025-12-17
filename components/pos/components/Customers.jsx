"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Plus, Search, Edit, RotateCcw } from "lucide-react";
import { Card, Button, Form, Modal, Alert } from "react-bootstrap";
import {
  createCustomer,
  deleteCustomer,
  getPaginationCustomer,
  updateCustomer,
} from "@/service/customer-service";
import PaginationCustom from "./PaginationCustom";

export function Customers({
  isAddCustomerDialogOpen,
  setIsAddCustomerDialogOpen,
}) {
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
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [customers, setCustomers] = useState([]);

  // New Customer Form
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
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

  //============================= Fetch Functions ===============================
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

  // ===================== Handle Functions =====================
  const handleAddCustomer = async () => {
    if (!formData.name || !formData.phone) {
      toast.warning("Vui lòng nhập tên và số điện thoại khách hàng!");
      return;
    }

    try {
      const data = { ...formData };
      const res = await createCustomer(data);
      if (res && res.status === 201) {
        setCustomers([...customers, res.data]);
        toast.success("Create customer successfully");
      } else {
        toast.error("Create customer unsuccessfully");
      }
    } catch (error) {
      toast.error("Create customer unsuccessfully");
    } finally {
      setIsAddCustomerDialogOpen(false);
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
    } catch (error) {
      toast.error("Update customer unsuccessfully");
    } finally {
      setIsEditDialogOpen(false);
      setFormData({ name: "", email: "", phone: "", address: "" });
    }
  };

  // ===================== Dialog Functions =====================

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

  const closeEditDialog = () => {
    setIsEditDialogOpen(false);
    setSelectedCustomer(null);
    setFormData({ name: "", email: "", phone: "", address: "" });
  };

  //============================= Render UI ===============================
  return (
    <>
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card className="mb-4">
        <Card.Header className="bg-light d-flex justify-content-between align-items-center">
          <Card.Title className="mb-0">Danh sách khách hàng</Card.Title>
          <div className="d-flex justify-content-between align-items-center mb-3 gap-2">
            {/* Reset button */}
            <Button
              variant="primary"
              size="sm"
              onClick={() => fetchCustomers()}
              className="d-flex align-items-center gap-2"
            >
              <RotateCcw size={16} />
              Reset
            </Button>

            {/* Add Button */}
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddCustomerDialogOpen(true)}
              className="d-flex align-items-center gap-2"
            >
              <Plus size={16} />
              Add
            </Button>

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
        <Card.Body className="p-0">
          <div className="space-y-2 p-3">
            {customers.map((customer) => (
              <Card key={customer.id} className="mb-2">
                <Card.Body className="p-3">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p className="fw-medium small mb-1">{customer.name}</p>
                      <p className="text-muted small mb-1">{customer.phone}</p>
                      <p className="text-muted small mb-0">{customer.email}</p>
                    </div>
                    <div className="text-end">
                      <p className="text-muted small mb-1">Edit</p>
                      {/* <p className="fw-semibold small">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(customer.totalPurchases)}
                      </p> */}
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => openEditDialog(customer)}
                        className="p-2"
                      >
                        <Edit size={16} />
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>
        </Card.Body>
      </Card>

      <PaginationCustom page={page} totalPages={2} onChange={setPage} />

      {/* Add Customer Modal */}
      <Modal
        show={isAddCustomerDialogOpen}
        onHide={() => setIsAddCustomerDialogOpen(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Thêm khách hàng mới</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label className="small">
              Tên khách hàng <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Nhập tên khách hàng"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="small">
              Số điện thoại <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              value={formData.phone}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  phone: e.target.value,
                })
              }
              placeholder="Nhập số điện thoại"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="small">Email</Form.Label>
            <Form.Control
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  email: e.target.value,
                })
              }
              placeholder="Nhập email (tùy chọn)"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="small">Địa chỉ</Form.Label>
            <Form.Control
              value={formData.address}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  address: e.target.value,
                })
              }
              placeholder="Nhập địa chỉ (tùy chọn)"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setIsAddCustomerDialogOpen(false);
              setFormData({
                name: "",
                email: "",
                phone: "",
                address: "",
              });
            }}
          >
            Hủy
          </Button>
          <Button variant="primary" onClick={handleAddCustomer}>
            Thêm khách hàng
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Modal */}
      <Modal show={isEditDialogOpen} onHide={() => closeEditDialog()}>
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
          <Button variant="secondary" onClick={() => closeEditDialog()}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleEdit}>
            Lưu thay đổi
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default Customers;
