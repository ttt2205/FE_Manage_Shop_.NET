"use client"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { shortCurrency } from "@/lib/utils/format"
export function RevenueChart({ title, data, type }: { title: string; data: any[]; type: string }) {
  const key =
    type === "day" ? (data[0]?.date ? "date" : "period") :
    type === "month" ? (data[0]?.month ? "month" : "period") :
    type === "year" ? (data[0]?.year ? "year" : "period") : "period"

  return (
    <Card className="col-span-2 border border-gray-200">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barSize={40}>
              <defs>
                <linearGradient id="barColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9} />
                  <stop offset="95%" stopColor="#93c5fd" stopOpacity={0.7} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey={key} tick={{ fontSize: 12 }} />
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
              <Bar dataKey="revenue" fill="url(#barColor)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
