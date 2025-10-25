"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { Spinner } from "react-bootstrap"

export function AuthGuard({ children, requireAdmin = false }) {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const currentUser = getCurrentUser()

    if (!currentUser) {
      router.push("/login")
      return
    }

    if (requireAdmin && currentUser.role !== "admin") {
      router.push("/pos")
      return
    }

    setUser(currentUser)
    setLoading(false)
  }, [router, requireAdmin])

  if (loading) {
    return (
      <div
        className="d-flex align-items-center justify-content-center"
        style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}
      >
        <div className="text-center">
          <Spinner animation="border" role="status" className="mb-3">
            <span className="visually-hidden">Đang tải...</span>
          </Spinner>
          <p className="text-muted small">Đang tải...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}
