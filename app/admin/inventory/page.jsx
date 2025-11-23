"use client"

import { useState, useRef, useEffect } from "react"
import { Plus, Search, Edit, FileUp, Download, FileText } from "lucide-react"
import { Container, Card, Button, Form, Table, Modal, Badge, Spinner, Alert } from "react-bootstrap"
import inventoryService from "@/service/inventoryService"
import { productsData } from "@/lib/data/products"
import { getCurrentUser } from "@/lib/auth"

export default function InventoryPage() {
  const currentUser = getCurrentUser()
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [editQuantity, setEditQuantity] = useState(0)
  const [importItems, setImportItems] = useState([{ productId: "", quantity: 0 }])
  const [reportStartDate, setReportStartDate] = useState("")
  const [reportEndDate, setReportEndDate] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [uploadingExcel, setUploadingExcel] = useState(false)
  const fileInputRef = useRef(null)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 50,
    totalPages: 1,
    totalItems: 0,
  })

  // Load inventory from API
  const loadInventory = async (page = 1) => {
    try {
      setLoading(true)
      setError(null)
      const response = await inventoryService.getInventory(page, pagination.pageSize)
      
      if (response.success) {
        setInventory(response.result || [])
        setPagination({
          currentPage: response.meta?.currentPage || 1,
          pageSize: response.meta?.pageSize || 50,
          totalPages: response.meta?.totalPage || 1,
          totalItems: response.meta?.totalItems || 0,
        })
      } else {
        setError(response.message || "Không thể tải danh sách tồn kho")
      }
    } catch (err) {
      console.error("Load inventory error:", err)
      setError("Lỗi kết nối đến server. Vui lòng thử lại.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInventory()
  }, [])

  const filteredInventory = inventory.filter(
    (item) =>
      item.productName?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEdit = async () => {
    if (!selectedItem) return

    try {
      setSubmitting(true)
      const response = await inventoryService.updateInventory({
        productId: selectedItem.productId,
        quantity: editQuantity,
      })
      
      if (response.success) {
        alert("Cập nhật tồn kho thành công!")
        setIsEditDialogOpen(false)
        setSelectedItem(null)
        setEditQuantity(0)
        loadInventory(pagination.currentPage)
      } else {
        alert(response.message || "Có lỗi xảy ra khi cập nhật tồn kho")
      }
    } catch (err) {
      console.error("Update inventory error:", err)
      alert("Lỗi kết nối đến server. Vui lòng thử lại.")
    } finally {
      setSubmitting(false)
    }
  }

  const openEditDialog = (item) => {
    setSelectedItem(item)
    setEditQuantity(item.quantity)
    setIsEditDialogOpen(true)
  }

  const handleImport = async () => {
    const validItems = importItems.filter((item) => item.productId && item.quantity > 0)
    if (validItems.length === 0) {
      alert("Vui lòng thêm ít nhất một sản phẩm hợp lệ!")
      return
    }

    try {
      setSubmitting(true)
      const response = await inventoryService.importInventory({
        userId: currentUser?.id || 1,
        items: validItems.map(item => ({
          productId: parseInt(item.productId.replace('PRD', '')),
          quantity: item.quantity
        })),
        note: "Nhập hàng thủ công"
      })

      if (response.success) {
        alert("Nhập hàng thành công!")
        setIsImportDialogOpen(false)
        setImportItems([{ productId: "", quantity: 0 }])
        loadInventory(pagination.currentPage)
      } else {
        alert(response.message || "Có lỗi xảy ra khi nhập hàng")
      }
    } catch (err) {
      console.error("Import inventory error:", err)
      alert("Lỗi kết nối đến server. Vui lòng thử lại.")
    } finally {
      setSubmitting(false)
    }
  }

  const addImportItem = () => {
    setImportItems([...importItems, { productId: "", quantity: 0 }])
  }

  const removeImportItem = (index) => {
    setImportItems(importItems.filter((_, i) => i !== index))
  }

  const updateImportItem = (index, field, value) => {
    const newItems = [...importItems]
    newItems[index] = { ...newItems[index], [field]: value }
    setImportItems(newItems)
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadingExcel(true)
      const response = await inventoryService.importFromExcel(file, currentUser?.id || 1)
      
      if (response.success) {
        alert("Import Excel thành công!")
        loadInventory(pagination.currentPage)
      } else {
        alert(response.message || "Có lỗi xảy ra khi import Excel")
      }
    } catch (err) {
      console.error("Import Excel error:", err)
      alert("Lỗi khi import Excel. Vui lòng kiểm tra định dạng file.")
    } finally {
      setUploadingExcel(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const downloadTemplate = () => {
    const headers = ["ProductId", "Quantity"]
    const sampleData = [
      ["1", "10"],
      ["2", "20"],
      ["3", "15"],
    ]
    const csv = [headers, ...sampleData].map((row) => row.join(",")).join("\n")

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "inventory_import_template.csv"
    a.click()
  }

  const exportReport = async () => {
    try {
      setSubmitting(true)
      const response = await inventoryService.getInventoryReport(
        reportStartDate || null,
        reportEndDate || null
      )

      if (response.success && response.data) {
        const data = response.data

        // Create CSV
        const headers = ["Mã SP", "Tên sản phẩm", "SKU", "Danh mục", "Số lượng", "Giá", "Cập nhật"]
        const rows = data.map((item) => [
          item.productId,
          item.productName,
          item.productSku || "",
          item.categoryName || "",
          item.quantity,
          item.price,
          new Date(item.updatedAt).toLocaleDateString("vi-VN"),
        ])
        const csv = [headers, ...rows].map((row) => row.join(",")).join("\n")

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `inventory_report_${new Date().toISOString().split("T")[0]}.csv`
        a.click()

        setIsReportDialogOpen(false)
        alert("Xuất báo cáo thành công!")
      } else {
        alert(response.message || "Không thể xuất báo cáo")
      }
    } catch (err) {
      console.error("Export report error:", err)
      alert("Lỗi khi xuất báo cáo. Vui lòng thử lại.")
    } finally {
      setSubmitting(false)
    }
  }

  const handlePageChange = (newPage) => {
    loadInventory(newPage)
  }

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h1 className="display-6 fw-bold">Quản Lý Tồn Kho</h1>
          <p className="text-muted">Quản lý và theo dõi tồn kho sản phẩm</p>
        </div>
        <div className="d-flex gap-2">
          <Button
            variant="outline-primary"
            onClick={() => setIsReportDialogOpen(true)}
            className="d-flex align-items-center gap-2"
          >
            <FileText size={18} />
            Xuất báo cáo
          </Button>
          <Button variant="primary" onClick={() => setIsImportDialogOpen(true)} className="d-flex align-items-center gap-2">
            <Plus size={18} />
            Nhập hàng
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card className="mb-4">
        <Card.Header className="bg-light">
          <Card.Title className="mb-3">Danh sách tồn kho</Card.Title>
          <div className="input-group">
            <span className="input-group-text">
              <Search size={18} />
            </span>
            <Form.Control
              placeholder="Tìm kiếm theo tên sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Đang tải...</span>
              </Spinner>
              <p className="mt-2 text-muted">Đang tải dữ liệu...</p>
            </div>
          ) : filteredInventory.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">Không có sản phẩm nào trong kho</p>
            </div>
          ) : (
            <Table hover responsive className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>Mã SP</th>
                  <th>Tên sản phẩm</th>
                  <th className="text-end">Số lượng</th>
                  <th>Trạng thái</th>
                  <th>Cập nhật</th>
                  <th className="text-end">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item) => (
                  <tr key={item.id}>
                    <td className="fw-medium">{item.productId}</td>
                    <td>{item.productName}</td>
                    <td className="text-end">
                      <span className={item.quantity < 50 ? "text-warning fw-semibold" : ""}>{item.quantity}</span>
                    </td>
                    <td>
                      {item.quantity === 0 ? (
                        <Badge bg="danger">Hết hàng</Badge>
                      ) : item.quantity < 50 ? (
                        <Badge bg="warning" text="dark">
                          Sắp hết
                        </Badge>
                      ) : (
                        <Badge bg="success">Đủ hàng</Badge>
                      )}
                    </td>
                    <td>{new Date(item.updatedAt).toLocaleDateString("vi-VN")}</td>
                    <td className="text-end">
                      <Button variant="outline-secondary" size="sm" onClick={() => openEditDialog(item)} className="p-2">
                        <Edit size={16} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
        {!loading && pagination.totalPages > 1 && (
          <Card.Footer className="bg-light">
            <div className="d-flex justify-content-between align-items-center">
              <span className="text-muted small">
                Hiển thị {filteredInventory.length} / {pagination.totalItems} sản phẩm
              </span>
              <div className="d-flex gap-2">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  disabled={pagination.currentPage === 1}
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                >
                  Trước
                </Button>
                <span className="px-3 py-1">
                  Trang {pagination.currentPage} / {pagination.totalPages}
                </span>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  disabled={pagination.currentPage === pagination.totalPages}
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                >
                  Sau
                </Button>
              </div>
            </div>
          </Card.Footer>
        )}
      </Card>

      {/* Edit Quantity Modal */}
      <Modal show={isEditDialogOpen} onHide={() => setIsEditDialogOpen(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Chỉnh sửa số lượng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-3">
            <strong>Sản phẩm:</strong> {selectedItem?.productName}
          </p>
          <Form.Group>
            <Form.Label>Số lượng hiện tại: {selectedItem?.quantity}</Form.Label>
            <Form.Control
              type="number"
              min="0"
              value={editQuantity}
              onChange={(e) => setEditQuantity(Number(e.target.value))}
              disabled={submitting}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setIsEditDialogOpen(false)} disabled={submitting}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleEdit} disabled={submitting}>
            {submitting ? <Spinner animation="border" size="sm" /> : "Lưu thay đổi"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Import Modal */}
      <Modal show={isImportDialogOpen} onHide={() => setIsImportDialogOpen(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Nhập hàng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-4">
            <h6 className="mb-3">Nhập từ file Excel</h6>
            <div className="d-flex gap-2 align-items-center">
              <Button variant="outline-secondary" size="sm" onClick={downloadTemplate}>
                <Download size={16} className="me-2" />
                Tải mẫu Excel
              </Button>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingExcel}
              >
                {uploadingExcel ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  <>
                    <FileUp size={16} className="me-2" />
                    Tải file lên
                  </>
                )}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                style={{ display: "none" }}
                onChange={handleFileUpload}
              />
            </div>
          </div>

          <hr />

          <h6 className="mb-3">Nhập thủ công</h6>
          {importItems.map((item, index) => (
            <div key={index} className="row g-2 mb-2">
              <div className="col-md-6">
                <Form.Select
                  value={item.productId}
                  onChange={(e) => updateImportItem(index, "productId", e.target.value)}
                  disabled={submitting}
                >
                  <option value="">Chọn sản phẩm</option>
                  {productsData.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku})
                    </option>
                  ))}
                </Form.Select>
              </div>
              <div className="col-md-4">
                <Form.Control
                  type="number"
                  min="1"
                  placeholder="Số lượng"
                  value={item.quantity || ""}
                  onChange={(e) => updateImportItem(index, "quantity", Number(e.target.value))}
                  disabled={submitting}
                />
              </div>
              <div className="col-md-2">
                {importItems.length > 1 && (
                  <Button 
                    variant="outline-danger" 
                    size="sm" 
                    onClick={() => removeImportItem(index)} 
                    className="w-100"
                    disabled={submitting}
                  >
                    Xóa
                  </Button>
                )}
              </div>
            </div>
          ))}
          <Button 
            variant="outline-primary" 
            size="sm" 
            onClick={addImportItem} 
            className="mt-2"
            disabled={submitting}
          >
            + Thêm sản phẩm
          </Button>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setIsImportDialogOpen(false)} disabled={submitting}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleImport} disabled={submitting}>
            {submitting ? <Spinner animation="border" size="sm" /> : "Nhập hàng"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Report Modal */}
      <Modal show={isReportDialogOpen} onHide={() => setIsReportDialogOpen(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Xuất báo cáo tồn kho</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Từ ngày</Form.Label>
            <Form.Control 
              type="date" 
              value={reportStartDate} 
              onChange={(e) => setReportStartDate(e.target.value)}
              disabled={submitting}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Đến ngày</Form.Label>
            <Form.Control 
              type="date" 
              value={reportEndDate} 
              onChange={(e) => setReportEndDate(e.target.value)}
              disabled={submitting}
            />
          </Form.Group>
          <p className="text-muted small">
            Báo cáo sẽ bao gồm tất cả sản phẩm được cập nhật trong khoảng thời gian đã chọn
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setIsReportDialogOpen(false)} disabled={submitting}>
            Hủy
          </Button>
          <Button variant="primary" onClick={exportReport} disabled={submitting}>
            {submitting ? <Spinner animation="border" size="sm" /> : "Xuất báo cáo (CSV)"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}