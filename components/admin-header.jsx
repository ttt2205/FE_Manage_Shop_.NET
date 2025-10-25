"use client"

import { UserMenu } from "./user-menu"

export function AdminHeader() {
  return (
    <header
      className="d-flex justify-content-between align-items-center"
      style={{
        height: "64px",
        borderBottom: "2px solid #dee2e6",
        backgroundColor: "#fff",
        paddingLeft: "1.5rem",
        paddingRight: "1.5rem",
      }}
    >
      <div className="d-flex align-items-center gap-3">
        <h2 className="fs-6 fw-semibold mb-0">Bảng Điều Khiển Quản Trị</h2>
      </div>
      <div className="d-flex align-items-center gap-3">
        <UserMenu />
      </div>
    </header>
  )
}
