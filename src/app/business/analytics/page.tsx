'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import DashboardHeader from '@/components/DashboardHeader';
import { AnalyticsService } from '@/lib/supabase';
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  UsersIcon, 
  ShoppingBagIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface BusinessAnalytics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  customerCount: number;
  conversionRate: number;
  revenueGrowth: number;
  topProducts: Array<{
    name: string;
    sales: number;
    revenue: number;
  }>;
  recentOrders: Array<{
    id: string;
    customerName: string;
    amount: number;
    date: string;
    status: string;
  }>;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
    orders: number;
  }>;
}

export default function BusinessAnalyticsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<BusinessAnalytics | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth/login');
      } else if (user.role !== 'business') {
        router.push('/dashboard');
      } else {
        setIsAuthorized(true);
        loadBusinessAnalytics();
      }
    }
  }, [user, loading, router, dateRange]);

  const loadBusinessAnalytics = async () => {
    try {
      setLoadingAnalytics(true);
      
      // Get business metrics from Supabase
      const businessId = user?.businessProfile?.businessId || 'demo-business';
      const metrics = await AnalyticsService.getBusinessMetrics(businessId, dateRange);
      
      // For now, we'll use mock data since Supabase tables aren't set up yet
      // In production, this would come from Supabase
      const mockData: BusinessAnalytics = {
        totalRevenue: 12450,
        totalOrders: 89,
        averageOrderValue: 139.89,
        customerCount: 67,
        conversionRate: 23.5,
        revenueGrowth: 15.8,
        topProducts: [
          { name: 'Gift Card $50', sales: 45, revenue: 2250 },
          { name: 'Gift Card $100', sales: 32, revenue: 3200 },
          { name: 'Gift Card $25', sales: 28, revenue: 700 },
          { name: 'Custom Amount', sales: 15, revenue: 1800 }
        ],
        recentOrders: [
          { id: 'ORD-001', customerName: 'John Doe', amount: 150, date: '2024-01-15T10:30:00Z', status: 'completed' },
          { id: 'ORD-002', customerName: 'Jane Smith', amount: 75, date: '2024-01-15T09:15:00Z', status: 'pending' },
          { id: 'ORD-003', customerName: 'Mike Johnson', amount: 200, date: '2024-01-15T08:45:00Z', status: 'completed' },
          { id: 'ORD-004', customerName: 'Sarah Wilson', amount: 100, date: '2024-01-15T08:30:00Z', status: 'completed' }
        ],
        monthlyRevenue: [
          { month: 'Jan', revenue: 8900, orders: 45 },
          { month: 'Feb', revenue: 10200, orders: 52 },
          { month: 'Mar', revenue: 12450, orders: 89 },
          { month: 'Apr', revenue: 11800, orders: 78 },
          { month: 'May', revenue: 15600, orders: 95 },
          { month: 'Jun', revenue: 14200, orders: 88 }
        ]
      };

      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Error loading business analytics:', error);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  if (loading || !isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading business analytics...</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Business Analytics</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Track your performance and understand your business growth
                </p>
              </div>
              
              {/* Date Range Selector */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                  />
                </div>
              </div>
            </div>

            {loadingAnalytics ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : analyticsData ? (
              <>
                {/* Key Metrics */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <CurrencyDollarIcon className="h-6 w-6 text-green-400" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                            <dd className="text-lg font-medium text-gray-900">{formatCurrency(analyticsData.totalRevenue)}</dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <ShoppingBagIcon className="h-6 w-6 text-blue-400" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">Total Orders</dt>
                            <dd className="text-lg font-medium text-gray-900">{analyticsData.totalOrders}</dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <UsersIcon className="h-6 w-6 text-purple-400" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">Customers</dt>
                            <dd className="text-lg font-medium text-gray-900">{analyticsData.customerCount}</dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <ArrowTrendingUpIcon className="h-6 w-6 text-orange-400" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">Revenue Growth</dt>
                            <dd className={`text-lg font-medium ${analyticsData.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatPercentage(analyticsData.revenueGrowth)}
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed Metrics */}
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                  {/* Top Products */}
                  <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Top Products</h3>
                      <div className="space-y-3">
                        {analyticsData.topProducts.map((product, index) => (
                          <div key={product.name} className="flex items-center justify-between">
                            <div className="flex items-center">
                              <span className="text-sm font-medium text-gray-500 w-6">{index + 1}.</span>
                              <span className="text-sm font-medium text-gray-900">{product.name}</span>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-gray-900">{formatCurrency(product.revenue)}</div>
                              <div className="text-xs text-gray-500">{product.sales} sold</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Recent Orders */}
                  <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Orders</h3>
                      <div className="space-y-3">
                        {analyticsData.recentOrders.map((order) => (
                          <div key={order.id} className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className={`w-2 h-2 rounded-full mr-3 ${
                                order.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'
                              }`}></div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                                <div className="text-xs text-gray-500">
                                  {new Date(order.date).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-gray-900">{formatCurrency(order.amount)}</div>
                              <div className="text-xs text-gray-500">{order.id}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Monthly Revenue Chart */}
                <div className="bg-white shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Monthly Revenue</h3>
                    <div className="grid grid-cols-6 gap-4">
                      {analyticsData.monthlyRevenue.map((month) => (
                        <div key={month.month} className="text-center">
                          <div className="text-sm font-medium text-gray-900">{month.month}</div>
                          <div className="text-lg font-bold text-blue-600">{formatCurrency(month.revenue)}</div>
                          <div className="text-xs text-gray-500">{month.orders} orders</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Additional Metrics */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <ChartBarIcon className="h-6 w-6 text-indigo-400" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">Average Order Value</dt>
                            <dd className="text-lg font-medium text-gray-900">{formatCurrency(analyticsData.averageOrderValue)}</dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <EyeIcon className="h-6 w-6 text-teal-400" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">Conversion Rate</dt>
                            <dd className="text-lg font-medium text-gray-900">{formatPercentage(analyticsData.conversionRate)}</dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No analytics data</h3>
                <p className="mt-1 text-sm text-gray-500">Analytics data will appear here once you start receiving orders.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 