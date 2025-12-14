"use client";

import React, { useEffect, useState } from 'react';
import { Container, Card, Table, Spinner, Alert, Badge, Button } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import { Eye, RefreshCw } from 'lucide-react';

const API_URL = 'http://localhost:5052/api';

const getStatusBadge = (status) => {
    switch (status) {
        case 'completed':
            return <Badge bg="success">Đã hoàn tất</Badge>;
        case 'cancelled':
            return <Badge bg="danger">Đã hủy</Badge>;
        case 'in_progress':
            return <Badge bg="warning" text="dark">Đang tiến hành</Badge>;
        default:
            return <Badge bg="secondary">{status}</Badge>;
    }
};

const AuditHistory = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const router = useRouter();

    // Hàm fetch dữ liệu
    const fetchHistory = async () => {
        setLoading(true);
        setError("");
        try {
            const response = await fetch(`${API_URL}/audit`);
            const apiResponse = await response.json();

            if (apiResponse.success && apiResponse.data) {
                setSessions(apiResponse.data);
            } else {
                throw new Error(apiResponse.message || "Không thể tải lịch sử.");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchHistory();
    }, []);

    return (
        <Container fluid className="py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="display-6 fw-bold">Lịch sử Kiểm kê</h1>
                    <p className="text-muted">Xem lại tất cả các phiên kiểm kê đã thực hiện.</p>
                </div>
                <Button variant="outline-primary" onClick={fetchHistory} disabled={loading}>
                    <RefreshCw size={16} className="me-2" />
                    Tải lại
                </Button>
            </div>

            {/* Hiển thị lỗi */}
            {error && <Alert variant="danger" onClose={() => setError("")} dismissible>{error}</Alert>}

            <Card>
                <Card.Body className="p-0">
                    <Table hover responsive className="mb-0">
                        <thead className="table-light">
                        <tr>
                            <th>ID Phiên</th>
                            <th>Người thực hiện</th>
                            <th>Ngày bắt đầu</th>
                            <th>Ngày hoàn tất</th>
                            <th>Trạng thái</th>
                            <th>Ghi chú</th>
                            <th className="text-end">Chi tiết</th>
                        </tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="7" className="text-center p-5">
                                    <Spinner animation="border" />
                                </td>
                            </tr>
                        ) : sessions.length > 0 ? (
                            sessions.map(session => (
                                <tr key={session.id}>
                                    <td className="fw-medium">#{session.id}</td>
                                    <td>{session.user?.fullName ?? `User ID: ${session.userId}`}</td>
                                    <td>{new Date(session.startDate).toLocaleString('vi-VN')}</td>
                                    <td>{session.endDate ? new Date(session.endDate).toLocaleString('vi-VN') : "N/A"}</td>
                                    <td>{getStatusBadge(session.status)}</td>
                                    <td>{session.note}</td>
                                    <td className="text-end">
                                        <Button
                                            variant="outline-secondary"
                                            size="sm"
                                            onClick={() => router.push(`/admin/audit_store/audit/${session.id}`)}
                                        >
                                            <Eye size={16} />
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="text-center p-4">
                                    Không có lịch sử kiểm kê nào.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default AuditHistory;