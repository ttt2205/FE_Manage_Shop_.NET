"use client"

import { getCurrentUser, logout } from "@/lib/auth"
import { useState } from "react"

export function UserMenu() {
  const user = getCurrentUser()
  const [showMenu, setShowMenu] = useState(false)

  if (!user) return null

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="position-relative">
      <button
        className="btn btn-outline-secondary btn-sm p-2"
        onClick={() => setShowMenu(!showMenu)}
        style={{ border: "2px solid #6c757d" }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      </button>

      {showMenu && (
        <div
          className="position-absolute bg-white border rounded shadow-lg p-3"
          style={{
            right: 0,
            top: "100%",
            minWidth: "224px",
            zIndex: 1000,
            marginTop: "0.5rem",
          }}
        >
          <div className="mb-2">
            <p className="small fw-medium mb-1">{user.name}</p>
            <p className="text-muted small mb-1">{user.email}</p>
            <p className="text-muted small mb-0">Vai trò: {user.role === "admin" ? "Quản trị viên" : "Nhân viên"}</p>
          </div>
          <hr className="my-2" />
          <button
            onClick={handleLogout}
            className="btn btn-danger btn-sm w-100 d-flex align-items-center justify-content-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  )
}
