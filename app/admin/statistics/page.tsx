import StatisticsClient from "./StatisticsClient"
import { statisticsService } from "@/lib/api/statistics"

export default async function StatisticsPage() {

  const [dashboardSummary, revenueByDay, topProducts] = await Promise.all([
    statisticsService.getDashboardSummary(),
    statisticsService.getRevenueByDay("2025-01-01", "2025-01-31"),
    statisticsService.getTopProducts(5),
  ])

  return (
    <div className="p-6">
      <StatisticsClient
        initialDashboardSummary={dashboardSummary}
        initialRevenueByDay={revenueByDay}
        initialTopProducts={topProducts}
      />
    </div>
  )
}
