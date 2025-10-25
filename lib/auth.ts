import type { Staff } from "./types"

export function getCurrentUser(): Staff | null {
  if (typeof window === "undefined") return null
  const userStr = localStorage.getItem("currentUser")
  if (!userStr) return null
  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
}

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("currentUser")
    window.location.href = "/login"
  }
}

export function isAdmin(user: Staff | null): boolean {
  return user?.role === "admin"
}

export function isStaff(user: Staff | null): boolean {
  return user?.role === "staff"
}

export function requireAuth(): Staff {
  const user = getCurrentUser()
  if (!user) {
    if (typeof window !== "undefined") {
      window.location.href = "/login"
    }
    throw new Error("Not authenticated")
  }
  return user
}

export function requireAdmin(): Staff {
  const user = requireAuth()
  if (!isAdmin(user)) {
    if (typeof window !== "undefined") {
      window.location.href = "/pos"
    }
    throw new Error("Admin access required")
  }
  return user
}
