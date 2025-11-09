"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { shortCurrency } from "@/lib/utils/format"

export function TopProductsChart({ data }: { data: any[] }) {
  return (
    <Card className="border border-gray-200">
      <CardHeader>
        <CardTitle>🔥 Top 5 sản phẩm bán chạy</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[450px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              barSize={150}
              margin={{ top: 20, right: 30, left: 10, bottom: 50 }}
            >
              <defs>
                <linearGradient id="productColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.9} />
                  <stop offset="95%" stopColor="#6ee7b7" stopOpacity={0.7} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />

              <XAxis
                dataKey="productName"
                tick={{ fontSize: 13 }}
                angle={0}
                interval={0}
                height={60}
              />
              <YAxis width={100} tickFormatter={shortCurrency} />

              <Tooltip
                formatter={(value: number) =>
                  new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                    maximumFractionDigits: 0,
                  }).format(value)
                }
                contentStyle={{
                  backgroundColor: "white",
                  borderRadius: "8px",
                  border: "1px solid #eee",
                }}
              />

              <Bar dataKey="revenue" fill="url(#productColor)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
