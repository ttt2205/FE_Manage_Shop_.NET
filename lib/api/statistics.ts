const API_BASE_URL = 'http://localhost:5052/api/Statistics';

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

class StatisticsService {
  private async fetchApi<T>(url: string): Promise<T> {
    try {
      console.log('Fetching from:', url); 
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        
      });

      console.log('Response status:', response.status); 
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<T> = await response.json();
      console.log('API Response:', result); 
      
      if (!result.success) {
        throw new Error(result.message || 'API returned unsuccessful response');
      }
      
      return result.data;
    } catch (error) {
      console.error('Fetch error details:', {
        url,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }


  async getDashboardSummary(): Promise<DashboardSummary> {
    return this.fetchApi<DashboardSummary>(`${API_BASE_URL}/dashboard-summary`);
  }

  async getRevenueByDay(startDate?: string, endDate?: string): Promise<RevenueByDayResponse> {
    let url = `${API_BASE_URL}/revenue-by-day`;
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (params.toString()) url += `?${params.toString()}`;
    
    return this.fetchApi<RevenueByDayResponse>(url);
  }

  async getRevenueByMonth(year?: number, specificMonth?: number): Promise<RevenueByMonthResponse> {
    let url = `${API_BASE_URL}/revenue-by-month`;
    const params = new URLSearchParams();
    if (year) params.append('year', year.toString());
    if (specificMonth) params.append('specificMonth', specificMonth.toString());
    if (params.toString()) url += `?${params.toString()}`;
    
    return this.fetchApi<RevenueByMonthResponse>(url);
  }

  async getRevenueByYear(startYear?: number, endYear?: number): Promise<RevenueByYearResponse> {
    let url = `${API_BASE_URL}/revenue-by-year`;
    const params = new URLSearchParams();
    if (startYear) params.append('startYear', startYear.toString());
    if (endYear) params.append('endYear', endYear.toString());
    if (params.toString()) url += `?${params.toString()}`;
    
    return this.fetchApi<RevenueByYearResponse>(url);
  }

  async getTopProducts(topCount: number = 5, startDate?: string, endDate?: string): Promise<TopProductsResponse> {
    let url = `${API_BASE_URL}/top-products`;
    const params = new URLSearchParams();
    params.append('topCount', topCount.toString());
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    url += `?${params.toString()}`;
    
    return this.fetchApi<TopProductsResponse>(url);
  }
}

export const statisticsService = new StatisticsService();