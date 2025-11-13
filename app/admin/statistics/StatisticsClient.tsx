"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { RevenueChart } from "@/components/charts/RevenueChart"
import { TopProductsChart } from "@/components/charts/TopProductsChart"
import { statisticsService } from "@/lib/api/statistics"
import { motion, AnimatePresence } from "framer-motion"
import { DatePicker } from "antd"
import { RotateCcw, Calendar, BarChart3 } from "lucide-react"

export default function StatisticsClient({
  initialDashboardSummary,
  initialRevenueByDay,
  initialTopProducts,
}: {
  initialDashboardSummary: any
  initialRevenueByDay: any
  initialTopProducts: any
}) {
  const [activeTab, setActiveTab] = useState<"day" | "month" | "year">("day")
  const [dashboardSummary, setDashboardSummary] = useState(initialDashboardSummary)
  const [revenueByDay, setRevenueByDay] = useState(initialRevenueByDay)
  const [topProducts, setTopProducts] = useState(initialTopProducts)
  const [revenueByMonth, setRevenueByMonth] = useState<any | null>(null)
  const [revenueByYear, setRevenueByYear] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState<[any, any] | null>(null)

  const handleTabChange = async (tab: "day" | "month" | "year") => {
    setActiveTab(tab)
    if (tab === "month" && !revenueByMonth) {
      setLoading(true)
      const data = await statisticsService.getRevenueByMonth(2025)
      setRevenueByMonth(data)
      setLoading(false)
    } else if (tab === "year" && !revenueByYear) {
      setLoading(true)
      const data = await statisticsService.getRevenueByYear(2023, 2025)
      setRevenueByYear(data)
      setLoading(false)
    }
  }

  const handleFilter = async () => {
    if (!dateRange) return
    const [start, end] = dateRange
    setLoading(true)
    const data = await statisticsService.getRevenueByDay(
      start.format("YYYY-MM-DD"),
      end.format("YYYY-MM-DD")
    )
    setRevenueByDay(data)
    setActiveTab("day")
    setLoading(false)
  }

  const handleRefresh = async () => {
    setLoading(true)
    setDateRange(null)
    setActiveTab("day")

    const dashboard = await statisticsService.getDashboardSummary()
    const revenue = await statisticsService.getRevenueByDay("2025-01-01", "2025-12-31")
    const top = await statisticsService.getTopProducts()

    setDashboardSummary(dashboard)
    setRevenueByDay(revenue)
    setTopProducts(top)
    setLoading(false)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-1">📈 Thống kê & Báo cáo</h1>
          <p className="text-muted-foreground">
            Tổng quan doanh thu, đơn hàng và sản phẩm bán chạy
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard title="Tổng doanh thu" value={dashboardSummary.totalRevenue} icon="💰" isMoney />
        <SummaryCard title="Tổng đơn hàng" value={dashboardSummary.totalOrders} icon="📦" />
        <SummaryCard title="Giá trị trung bình" value={dashboardSummary.averageOrderValue} icon="📊" isMoney />
        <SummaryCard title="Sản phẩm đã bán" value={dashboardSummary.totalItemsSold} icon="🛒" />
      </div>

      {/* Bộ lọc */}
      <div className="flex flex-wrap items-center gap-3 bg-muted/30 p-4 rounded-xl border">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-primary" />
          <DatePicker.RangePicker
            format="YYYY-MM-DD"
            value={dateRange as any}
            onChange={(range) => setDateRange(range as [any, any])}
          />
        </div>
        <Button
          onClick={handleFilter}
          disabled={!dateRange || loading}
          className="bg-primary text-white hover:bg-primary/90"
        >
          Lọc theo khoảng ngày
        </Button>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RotateCcw size={16} /> Làm mới
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 justify-start flex-wrap">
        {[
          { key: "day", label: "Theo ngày" },
          { key: "month", label: "Theo tháng" },
          { key: "year", label: "Theo năm" },
        ].map((tab) => (
          <Button
            key={tab.key}
            variant={activeTab === tab.key ? "default" : "outline"}
            onClick={() => handleTabChange(tab.key as any)}
            className={`transition-all duration-200 ${
              activeTab === tab.key ? "bg-primary text-white" : "hover:bg-muted"
            }`}
          >
            <BarChart3 size={16} className="mr-2" />
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Revenue Chart */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {loading && (
            <div className="col-span-3 flex justify-center items-center h-64 text-lg text-muted-foreground">
              Đang tải dữ liệu...
            </div>
          )}

          {!loading && activeTab === "day" && (
            revenueByDay.data?.length > 0 ? (
              <RevenueChart title="📅 Doanh thu theo ngày" data={revenueByDay.data} type="day" />
            ) : (
              <NoDataMessage />
            )
          )}

          {!loading && activeTab === "month" && (
            revenueByMonth?.data?.length > 0 ? (
              <RevenueChart title="🗓️ Doanh thu theo tháng" data={revenueByMonth.data} type="month" />
            ) : (
              <NoDataMessage />
            )
          )}

          {!loading && activeTab === "year" && (
            revenueByYear?.data?.length > 0 ? (
              <RevenueChart title="📆 Doanh thu theo năm" data={revenueByYear.data} type="year" />
            ) : (
              <NoDataMessage />
            )
          )}
        </motion.div>
      </AnimatePresence>

      {/* Top Products */}
      {topProducts.data?.length > 0 ? (
        <TopProductsChart data={topProducts.data} />
      ) : (
        <NoDataMessage title="Không có sản phẩm bán chạy nào" />
      )}
    </div>
  )
}

function SummaryCard({
  title,
  value,
  icon,
  isMoney,
}: {
  title: string
  value: number
  icon: string
  isMoney?: boolean
}) {
  return (
    <Card className="hover:shadow-lg transition-shadow border border-gray-200">
      <CardHeader className="flex justify-between items-center pb-1">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <span className="text-xl">{icon} </span>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-primary truncate">
          {isMoney
            ? new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
                maximumFractionDigits: 0,
              }).format(value)
            : value}
        </div>
      </CardContent>
    </Card>
  )
}

function NoDataMessage({ title = "Không có dữ liệu" }: { title?: string }) {
  return (
    <div className="col-span-3 flex justify-center items-center h-64 text-muted-foreground border rounded-xl bg-muted/20">
      {title}
    </div>
  )
}
