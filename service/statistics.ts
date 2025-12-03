import api from "./api";

export interface DashboardSummary {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  totalItemsSold: number;
}

export interface RevenueStatistics {
  period: string;
  revenue: number;
  orderCount: number;
  totalItemsSold: number;
}

export interface TopProduct {
  productId: number;
  productName: string;
  quantitySold: number;
  revenue: number;
}

export interface ApiResponse<T> {
  success: boolean;
  status: number;
  message: string;
  data: T;
}

export interface RevenueByDayResponse {
  data: RevenueStatistics[];
  totalDays: number;
  totalRevenue: number;
  totalOrders: number;
}

export interface RevenueByMonthResponse {
  data: RevenueStatistics[];
  totalMonths: number;
  totalRevenue: number;
  totalOrders: number;
  year?: number;
}

export interface RevenueByYearResponse {
  data: RevenueStatistics[];
  totalYears: number;
  totalRevenue: number;
  totalOrders: number;
}

export interface TopProductsResponse {
  data: TopProduct[];
  topCount: number;
  startDate?: string;
  endDate?: string;
  totalRevenue: number;
}

const API_BASE_URL = `/api/v1/statistic`;

const statisticsService = {
  getDashboardSummary: async () => {
    try {
      const res = await api.get(`/api/v1/statistic/dashboard-summary`);
      return res.data; // hoặc tuỳ thuộc vào response từ backend
    } catch (error) {
      console.error("Error getDashboardSummary: ", error);
    }
  },

  getRevenueByDay: async (
    startDate?: string,
    endDate?: string
  ): Promise<RevenueByDayResponse> => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    const url = `${API_BASE_URL}/revenue-by-day${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    const res = await api.get(url);
    return res.data;
  },

  getRevenueByMonth: async (
    year?: number,
    specificMonth?: number
  ): Promise<RevenueByMonthResponse> => {
    const params = new URLSearchParams();
    if (year) params.append("year", year.toString());
    if (specificMonth) params.append("specificMonth", specificMonth.toString());
    const url = `${API_BASE_URL}/revenue-by-month${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    const res = await api.get(url);
    return res.data;
  },

  getRevenueByYear: async (
    startYear?: number,
    endYear?: number
  ): Promise<RevenueByYearResponse> => {
    const params = new URLSearchParams();
    if (startYear) params.append("startYear", startYear.toString());
    if (endYear) params.append("endYear", endYear.toString());
    const url = `${API_BASE_URL}/revenue-by-year${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    const res = await api.get(url);
    return res.data;
  },

  getTopProducts: async (
    topCount: number = 5,
    startDate?: string,
    endDate?: string
  ): Promise<TopProductsResponse> => {
    const params = new URLSearchParams();
    params.append("topCount", topCount.toString());
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    const url = `${API_BASE_URL}/top-products?${params.toString()}`;
    const res = await api.get(url);
    return res.data;
  },
};

export default statisticsService;
