'use client';
import { useEffect, useState } from 'react';
import StatisticsClient from './StatisticsClient';
import statisticsService, { DashboardSummary, RevenueByDayResponse, TopProductsResponse } from '@/service/statistics';

export default function StatisticsPage() {
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary | null>(null);
  const [revenueByDay, setRevenueByDay] = useState<RevenueByDayResponse | null>(null);
  const [topProducts, setTopProducts] = useState<TopProductsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [dashboard, revenue, top] = await Promise.all([
          statisticsService.getDashboardSummary(),
          statisticsService.getRevenueByDay("2025-01-01", "2025-01-31"),
          statisticsService.getTopProducts(5),
        ]);
        setDashboardSummary(dashboard);
        setRevenueByDay(revenue);
        setTopProducts(top);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <StatisticsClient
        initialDashboardSummary={dashboardSummary}
        initialRevenueByDay={revenueByDay}
        initialTopProducts={topProducts}
      />
    </div>
  );
}
