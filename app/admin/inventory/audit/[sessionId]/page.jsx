"use client";

import React, { useEffect, useState, useCallback, use } from 'react';
import { Container, Card, Form, Button, Table, Row, Col, Badge, Spinner, Alert, Modal } from "react-bootstrap";
import { useParams, useRouter } from 'next/navigation';
import { Save, CheckCircle, Package } from "lucide-react";

const API_URL = 'http://localhost:5052/api';

const AuditSessionDetail =  ({
                                params,
                            }) => {
    const { sessionId } = use(params)
    const router = useRouter();

    const [sessionDetails, setSessionDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [productIdInput, setProductIdInput] = useState("");
    const [quantityInput, setQuantityInput] = useState("");
    const [noteInput, setNoteInput] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [isFinalizeModalOpen, setIsFinalizeModalOpen] = useState(false);
    const [finalNote, setFinalNote] = useState("");

    const fetchSessionDetails = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/audit/${sessionId}`);
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || "Không thể tải phiên.");
            }
            const data = await response.json();
            setSessionDetails(data.data);
            setError("");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [sessionId]);

    useEffect(() => {
        fetchSessionDetails();
    }, [fetchSessionDetails]);

    const handleSubmitItem = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        try {
            const response = await fetch(`${API_URL}/audit/item`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: parseInt(sessionId, 10),
                    productId: parseInt(productIdInput, 10),
                    actualQuantity: parseInt(quantityInput, 10),
                    note: noteInput
                })
            });

            const result = await response.json();
            if (!result.success) {
                throw new Error(result.message || "Không thể thêm sản phẩm.");
            }

            setProductIdInput("");
            setQuantityInput("");
            setNoteInput("");
            await fetchSessionDetails();

        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFinalizeSession = async () => {
        setIsSubmitting(true);
        setError("");

        try {
            const response = await fetch(`${API_URL}/audit/finalize`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: parseInt(sessionId, 10),
                    finalNote: finalNote
                })
            });

            const result = await response.json();
            if (!result.success) {
                throw new Error(result.message || "Không thể chốt phiên.");
            }

            setIsFinalizeModalOpen(false);
            alert("Đã chốt phiên kiểm kê và cập nhật kho thành công!");
            router.push('/admin/inventory');

        } catch (err) {
            setError(err.message);
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <Container className="text-center p-5"><Spinner animation="border" /></Container>;
    }

    if (!sessionDetails && error) {
        return <Container><Alert variant="danger">{error}</Alert></Container>;
    }

    console.log(sessionDetails)

    return (
        <Container fluid className="py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="display-6 fw-bold">Phiên Kiểm Kê #{sessionId}</h1>
                    <p className="text-muted">
                        Trạng thái: <Badge bg="warning" text="dark">{sessionDetails.status}</Badge>
                    </p>
                </div>
                <Button
                    variant="success"
                    onClick={() => setIsFinalizeModalOpen(true)}
                    disabled={sessionDetails.status !== 'in_progress'}
                >
                    <CheckCircle size={18} className="me-2" />
                    Hoàn tất & Chốt Phiên
                </Button>
            </div>

            {error && <Alert variant="danger" onClose={() => setError("")} dismissible>{error}</Alert>}

            <Row>
                <Col lg={4}>
                    <Card className="mb-4">
                        <Card.Header>
                            <Card.Title className="mb-0">
                                <Package size={18} className="me-2" />
                                Thêm Sản Phẩm Đã Đếm
                            </Card.Title>
                        </Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleSubmitItem}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Mã sản phẩm (ProductID)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder="Nhập ID sản phẩm (hoặc scan barcode)"
                                        value={productIdInput}
                                        onChange={(e) => setProductIdInput(e.target.value)}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Số lượng thực tế (Đã đếm)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder="Nhập số lượng đếm được"
                                        value={quantityInput}
                                        onChange={(e) => setQuantityInput(e.target.value)}
                                        required
                                        min="0"
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Ghi chú (Tùy chọn)</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        placeholder="Ví dụ: Hàng hỏng, sai vị trí..."
                                        value={noteInput}
                                        onChange={(e) => setNoteInput(e.target.value)}
                                    />
                                </Form.Group>
                                <div className="d-grid">
                                    <Button type="submit" variant="primary" disabled={isSubmitting || sessionDetails.status !== 'in_progress'}>
                                        {isSubmitting ? <Spinner as="span" size="sm" /> : "Thêm vào phiên"}
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                    <Card>
                        <Card.Body>
                            <Card.Title>Thông tin phiên</Card.Title>
                            <p className="mb-1"><strong className="me-2">Người tạo:</strong> {sessionDetails.user?.username ?? `User ID: ${sessionDetails.user?.id}`}</p>
                            <p className="mb-1"><strong className="me-2">Bắt đầu:</strong> {new Date(sessionDetails.startDate).toLocaleString('vi-VN')}</p>
                            <p className="mb-0"><strong className="me-2">Ghi chú:</strong> {sessionDetails.note || "Không có"}</p>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={8}>
                    <Card>
                        <Card.Header>
                            <Card.Title className="mb-0">Các mục đã kiểm kê</Card.Title>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <Table hover responsive className="mb-0">
                                <thead className="table-light">
                                <tr>
                                    <th>Sản phẩm</th>
                                    <th className="text-end">SL Hệ Thống</th>
                                    <th className="text-end">SL Thực Tế</th>
                                    <th className="text-end">Chênh lệch</th>
                                    <th>Ghi chú</th>
                                </tr>
                                </thead>
                                <tbody>
                                {sessionDetails.auditItems && sessionDetails.auditItems.length > 0 ? (
                                    sessionDetails.auditItems.map(item => (
                                        <tr key={item.id}>
                                            <td>
                                                <div className="fw-medium">{item.product?.productName ?? `ProductID: ${item.productId}`}</div>
                                                <small className="text-muted">{item.product?.barcode}</small>
                                            </td>
                                            <td className="text-end">{item.systemQuantity}</td>
                                            <td className="text-end fw-bold">{item.actualQuantity}</td>
                                            <td className={`text-end fw-bold ${item.difference > 0 ? 'text-success' : item.difference < 0 ? 'text-danger' : ''}`}>
                                                {item.difference > 0 ? `+${item.difference}` : item.difference}
                                            </td>
                                            <td>{item.note}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center p-4">
                                            Chưa có sản phẩm nào trong phiên.
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Modal show={isFinalizeModalOpen} onHide={() => setIsFinalizeModalOpen(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Xác nhận Hoàn tất Phiên Kiểm Kê</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        Hành động này sẽ **chốt** phiên kiểm kê và **cập nhật tất cả số lượng tồn kho**
                        trong hệ thống theo số lượng thực tế bạn đã đếm.
                    </p>
                    <p className="fw-bold">Hành động này không thể hoàn tác.</p>
                    <Form.Group>
                        <Form.Label>Ghi chú cuối cùng (Tùy chọn)</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="Tóm tắt kết quả kiểm kê"
                            value={finalNote}
                            onChange={(e) => setFinalNote(e.target.value)}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setIsFinalizeModalOpen(false)}>
                        Hủy
                    </Button>
                    <Button variant="success" onClick={handleFinalizeSession} disabled={isSubmitting}>
                        {isSubmitting ? <Spinner as="span" size="sm" /> : "Xác nhận và Chốt"}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default AuditSessionDetail;