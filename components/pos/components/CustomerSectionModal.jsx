"use client";

import { useEffect, useState } from "react";
import { Card, Button, Modal, Form } from "react-bootstrap";
import PaginationCustom from "./PaginationCustom";
import { Search } from "lucide-react";
import {
  createCustomer,
  getPaginationCustomer,
} from "@/service/customer-service";
import { toast } from "react-toastify";

export function CustomerSectionModal({
  isCustomerDialogOpen,
  setIsCustomerDialogOpen,
  setSelectedCustomer,
}) {
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [meta, setMeta] = useState({
    currentPage: 1,
    pageSize: 20,
    totalItems: 0,
    totalPage: 1,
  });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [customerSection, setCustomerSection] = useState([]);

  const [isAddCustomerDialogOpen, setIsAddCustomerDialogOpen] = useState(false);
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

  // ================================= Fetch Functions ===========================
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await getPaginationCustomer({
        page,
        size,
        search: debouncedSearch ?? "",
      });
      setCustomerSection(res.result || []);
      setMeta(res.meta ?? meta);
    } catch (error) {
      setError("Unable to connect server");
    } finally {
      setLoading(false);
    }
  };

  // ================================= Handle Functions ==================================
  const handleAddCustomer = async () => {
    if (!formData.name || !formData.phone) {
      toast.warning("Vui lòng nhập tên và số điện thoại khách hàng!");
      return;
    }

    try {
      const data = { ...formData };
      const res = await createCustomer(data);
      if (res && res.status === 201) {
        setCustomerSection([...customerSection, res.data]);
        toast.success("Create customer successfully");
      } else {
        toast.error("Create customer unsuccessfully");
      }
    } catch (error) {
      toast.error("Create customer unsuccessfully");
    } finally {
      setIsAddCustomerDialogOpen(false);
      setFormData({ name: "", email: "", phone: "", address: "" });
      setIsCustomerDialogOpen(true);
    }
  };

  // ================================= Render UI ==================================
  return (
    <>
      <Modal
        show={isCustomerDialogOpen}
        onHide={() => setIsCustomerDialogOpen(false)}
        size="lg"
      >
        <Modal.Header
          closeButton
          className="d-flex justify-content-between align-items-center"
        >
          {/* Title */}
          <Modal.Title>Chọn khách hàng</Modal.Title>
        </Modal.Header>
        {/* Search */}
        <div
          className="input-group"
          style={{
            display: "flex",
            justifyContent: "center",
            width: "80%",
            marginLeft: "10px",
          }}
        >
          <span className="input-group-text">
            <Search size={18} />
          </span>
          <Form.Control
            placeholder="Tìm kiếm theo tên, email, số điện thoại..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Modal.Body style={{ maxHeight: "400px", overflowY: "auto" }}>
          {customerSection.map((customer) => (
            <Card
              key={customer.id}
              className="mb-2"
              style={{ cursor: "pointer" }}
              onClick={() => {
                setSelectedCustomer(customer);
                setIsCustomerDialogOpen(false);
              }}
            >
              <Card.Body className="p-3">
                <p className="fw-medium small mb-1">{customer.name}</p>
                <p className="text-muted small mb-0">{customer.phone}</p>
              </Card.Body>
            </Card>
          ))}
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-between align-items-center">
          {/* Pagination bên trái */}
          <div>
            <PaginationCustom
              page={page}
              totalPages={meta.totalPage}
              onChange={setPage}
            />
          </div>

          {/* Button bên phải */}
          <div className="d-flex gap-2">
            <Button
              variant="secondary"
              onClick={() => setIsCustomerDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setIsCustomerDialogOpen(false);
                setIsAddCustomerDialogOpen(true);
              }}
            >
              Thêm khách hàng mới
            </Button>
          </div>
        </Modal.Footer>
      </Modal>

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
              setIsCustomerDialogOpen(true);
            }}
          >
            Hủy
          </Button>
          <Button variant="primary" onClick={handleAddCustomer}>
            Thêm khách hàng
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default CustomerSectionModal;
