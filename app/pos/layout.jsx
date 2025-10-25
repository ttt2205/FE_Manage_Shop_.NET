import { AuthGuard } from "@/components/auth-guard"

export default function POSLayout({ children }) {
  return <AuthGuard>{children}</AuthGuard>
}
