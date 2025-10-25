"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Receipt } from "lucide-react"

export default function InvoicesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Quản Lý Hóa Đơn</h1>
        <p className="text-muted-foreground">Xem và quản lý hóa đơn</p>
      </div>

      <Card className="border-2 border-border">
        <CardHeader>
          <CardTitle>Hóa đơn</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Receipt className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">Chức năng đang phát triển</p>
          <p className="text-sm text-muted-foreground">Quản lý hóa đơn sẽ sớm được cập nhật</p>
        </CardContent>
      </Card>
    </div>
  )
}
