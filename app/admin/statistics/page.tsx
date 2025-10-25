"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ordersData } from "@/lib/data/orders"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"

export default function StatisticsPage() {
  const totalRevenue = ordersData.reduce((sum, order) => sum + order.total, 0)
  const totalOrders = ordersData.length
  const averageOrderValue = totalRevenue / totalOrders

  // Revenue by day
  const revenueByDay = ordersData.reduce(
    (acc, order) => {
      const date = new Date(order.createdAt).toLocaleDateString("vi-VN")
      const existing = acc.find((item) => item.date === date)
      if (existing) {
        existing.revenue += order.total
        existing.orders += 1
      } else {
        acc.push({ date, revenue: order.total, orders: 1 })
      }
      return acc
    },
    [] as Array<{ date: string; revenue: number; orders: number }>,
  )

  // Top products
  const productSales = ordersData.reduce(
    (acc, order) => {
      order.items.forEach((item) => {
        const existing = acc.find((p) => p.productId === item.productId)
        if (existing) {
          existing.quantity += item.quantity
          existing.revenue += item.subtotal
        } else {
          acc.push({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            revenue: item.subtotal,
          })
        }
      })
      return acc
    },
    [] as Array<{ productId: string; productName: string; quantity: number; revenue: number }>,
  )

  const topProducts = productSales.sort((a, b) => b.revenue - a.revenue).slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Thống Kê & Báo Cáo</h1>
        <p className="text-muted-foreground">Phân tích doanh thu và hiệu suất kinh doanh</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-2 border-border">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Tổng doanh thu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(totalRevenue)}
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-border">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Tổng đơn hàng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
          </CardContent>
        </Card>
        <Card className="border-2 border-border">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Giá trị đơn trung bình</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(averageOrderValue)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-2 border-border">
        <CardHeader>
          <CardTitle>Doanh thu theo ngày</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis dataKey="date" stroke="#000" />
              <YAxis stroke="#000" />
              <Tooltip
                contentStyle={{ border: "2px solid #000", borderRadius: "8px" }}
                formatter={(value: number) =>
                  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value)
                }
              />
              <Line type="monotone" dataKey="revenue" stroke="#000" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-2 border-border">
        <CardHeader>
          <CardTitle>Top 5 sản phẩm bán chạy</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProducts}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis dataKey="productName" stroke="#000" />
              <YAxis stroke="#000" />
              <Tooltip
                contentStyle={{ border: "2px solid #000", borderRadius: "8px" }}
                formatter={(value: number) =>
                  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value)
                }
              />
              <Bar dataKey="revenue" fill="#000" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
