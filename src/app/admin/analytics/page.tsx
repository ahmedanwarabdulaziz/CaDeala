'use client';

import { useEffect, useState } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import AdminLayout from '@/components/AdminLayout';
import { AnalyticsService } from '@/lib/supabase';
import { 
  ChartBarIcon, 
  UsersIcon, 
  BuildingStorefrontIcon, 
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

interface AnalyticsData {
  totalUsers: number;
  totalBusinesses: number;
  totalRevenue: number;
  activeUsers: number;
  newUsersThisMonth: number;
  newBusinessesThisMonth: number;
  revenueGrowth: number;
  userEngagement: number;
  topCategories: Array<{
    name: string;
    count: number;
    revenue: number;
  }>;
  recentActivity: Array<{
    type: string;
    description: string;
    timestamp: string;
    value: number;
  }>;
}

export default function AnalyticsPage() {
  const { user, isAdmin, loading } = useAdmin();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (isAdmin) {
      loadAnalytics();
    }
  }, [isAdmin, dateRange]);

  const loadAnalytics = async () => {
    try {
      setLoadingAnalytics(true);
      
      // Get platform analytics from Supabase
      const platformData = await AnalyticsService.getPlatformAnalytics(dateRange);
      
      // For now, we'll use mock data since Supabase tables aren't set up yet
      // In production, this would come from Supabase
      const mockData: AnalyticsData = {
        totalUsers: 1250,
        totalBusinesses: 89,
        totalRevenue: 45600,
        activeUsers: 342,
        newUsersThisMonth: 156,
        newBusinessesThisMonth: 12,
        revenueGrowth: 23.5,
        userEngagement: 78.2,
        topCategories: [
          { name: 'Restaurants', count: 45, revenue: 18900 },
          { name: 'Retail', count: 32, revenue: 12400 },
          { name: 'Entertainment', count: 18, revenue: 8900 },
          { name: 'Health & Wellness', count: 15, revenue: 5300 }
        ],
        recentActivity: [
          { type: 'new_user', description: 'New user registered', timestamp: '2024-01-15T10:30:00Z', value: 1 },
          { type: 'business_upgrade', description: 'Business upgrade approved', timestamp: '2024-01-15T09:15:00Z', value: 1 },
          { type: 'gift_card_purchase', description: 'Gift card purchased', timestamp: '2024-01-15T08:45:00Z', value: 50 },
          { type: 'new_business', description: 'New business registered', timestamp: '2024-01-15T08:30:00Z', value: 1 }
        ]
      };

      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics dashboard...</p>
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
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              Advanced insights and performance metrics powered by Supabase
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
                      <UsersIcon className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                        <dd className="text-lg font-medium text-gray-900">{analyticsData.totalUsers.toLocaleString()}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <BuildingStorefrontIcon className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Businesses</dt>
                        <dd className="text-lg font-medium text-gray-900">{analyticsData.totalBusinesses}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CurrencyDollarIcon className="h-6 w-6 text-gray-400" />
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
                      <ArrowTrendingUpIcon className="h-6 w-6 text-gray-400" />
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
              {/* Top Categories */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Top Categories by Revenue</h3>
                  <div className="space-y-3">
                    {analyticsData.topCategories.map((category, index) => (
                      <div key={category.name} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-500 w-6">{index + 1}.</span>
                          <span className="text-sm font-medium text-gray-900">{category.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">{formatCurrency(category.revenue)}</div>
                          <div className="text-xs text-gray-500">{category.count} businesses</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {analyticsData.recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{activity.description}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(activity.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {activity.value > 1 ? `+${activity.value}` : activity.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <UsersIcon className="h-6 w-6 text-green-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">New Users (This Month)</dt>
                        <dd className="text-lg font-medium text-gray-900">{analyticsData.newUsersThisMonth}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <BuildingStorefrontIcon className="h-6 w-6 text-blue-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">New Businesses (This Month)</dt>
                        <dd className="text-lg font-medium text-gray-900">{analyticsData.newBusinessesThisMonth}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ChartBarIcon className="h-6 w-6 text-purple-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">User Engagement</dt>
                        <dd className="text-lg font-medium text-gray-900">{analyticsData.userEngagement}%</dd>
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
            <p className="mt-1 text-sm text-gray-500">Analytics data will appear here once available.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
} 