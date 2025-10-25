import { AuthGuard } from "@/components/auth-guard"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminHeader } from "@/components/admin-header"

export default function AdminLayout({ children }) {
  return (
    <AuthGuard requireAdmin>
      <div className="d-flex" style={{ height: "100vh", overflow: "hidden", backgroundColor: "#f8f9fa" }}>
        <AdminSidebar />
        <div className="d-flex flex-column flex-grow-1" style={{ overflow: "hidden" }}>
          <AdminHeader />
          <main className="flex-grow-1" style={{ overflowY: "auto", padding: "1.5rem" }}>
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}
