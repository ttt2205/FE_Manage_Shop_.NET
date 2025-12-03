"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Container, Card, Form, Button, Alert } from "react-bootstrap";
import { staffData } from "@/lib/data/staff";
import { login } from "@/service/auth-service";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await login(username, password);

      if (res && res.status === 200) {
        const role = res.data.user.role;
        // Redirect based on role
        if (role === "admin") {
          router.push("/admin");
        } else {
          router.push("/pos");
        }
      } else {
        setError("Username hoặc mật khẩu không đúng");
        setLoading(false);
        return;
      }
    } catch (error) {
      setError("Username hoặc mật khẩu không đúng");
      setLoading(false);
      return;
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center min-vh-100 py-4">
      <Card className="w-100" style={{ maxWidth: "400px" }}>
        <Card.Header className="bg-primary text-white text-center py-4">
          <Card.Title className="mb-0 fs-4 fw-bold">Đăng Nhập</Card.Title>
        </Card.Header>
        <Card.Body className="p-4">
          <p className="text-muted text-center mb-4">
            Nhập thông tin đăng nhập để tiếp tục
          </p>
          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Mật khẩu</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>
            {error && (
              <Alert variant="danger" className="mb-3">
                {error}
              </Alert>
            )}
            <Button
              variant="primary"
              type="submit"
              className="w-100 mb-3"
              disabled={loading}
            >
              {loading ? "Đang đăng nhập..." : "Đăng Nhập"}
            </Button>
            {/* <div className="bg-light p-3 rounded border">
              <p className="fw-bold mb-2 small">Tài khoản demo:</p>
              <p className="mb-1 small">Admin: admin@store.com</p>
              <p className="mb-1 small">Nhân viên: hoa.nguyen@store.com</p>
              <p className="mt-2 text-muted" style={{ fontSize: "0.75rem" }}>
                Mật khẩu: bất kỳ
              </p>
            </div> */}
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
