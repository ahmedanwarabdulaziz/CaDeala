'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PostgreSQLService } from '@/lib/postgresql';
import {
  GiftIcon,
  ChartBarIcon,
  UsersIcon,
  ClockIcon,
  CogIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import QRCodeGenerator from '@/components/QRCodeGenerator';

interface BusinessDashboardProps {
  // Add props if needed
}

export default function BusinessDashboard() {
  const { user } = useAuth();
  const [business, setBusiness] = useState<any>(null);
  const [giftCards, setGiftCards] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalCards: 0,
    activeCards: 0,
    totalSales: 0,
    totalCustomers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadBusinessData();
    }
  }, [user]);

  const loadBusinessData = async () => {
    try {
      setLoading(true);
      console.log('Starting to load business data for user:', user?.uid);
      
      if (!user?.uid) {
        console.log('No user UID available');
        return;
      }
      
      // Load business profile
      const businessData = await PostgreSQLService.getBusinessByUserId(user.uid);
      console.log('Business data result:', businessData);
      setBusiness(businessData);

      // Only load gift cards, services, and stats if business exists
      if (businessData && businessData.id) {
        console.log('Business found, loading gift cards for business ID:', businessData.id);
        
        // Load gift cards
        const cardsData = await PostgreSQLService.getBusinessGiftCards(businessData.id);
        console.log('Gift cards loaded:', cardsData);
        setGiftCards(cardsData || []);

        // Load services
        const servicesData = await PostgreSQLService.getBusinessServices(businessData.id);
        console.log('Services loaded:', servicesData);
        setServices(servicesData || []);

        // Load customers
        const customersData = await PostgreSQLService.getBusinessCustomers(businessData.id);
        console.log('Customers loaded:', customersData);
        setCustomers(customersData || []);

        // Load stats
        const statsData = await PostgreSQLService.getBusinessStats(businessData.id);
        console.log('Stats loaded:', statsData);
        setStats(statsData);
      } else {
        console.log('No business found, setting empty data');
        // Set empty arrays and default stats if no business found
        setGiftCards([]);
        setServices([]);
        setStats({
          totalCards: 0,
          activeCards: 0,
          totalSales: 0,
          totalCustomers: 0
        });
      }

    } catch (error) {
      console.error('Error loading business data:', error);
      // Set empty arrays and default stats on error
      setGiftCards([]);
      setServices([]);
      setStats({
        totalCards: 0,
        activeCards: 0,
        totalSales: 0,
        totalCustomers: 0
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your business dashboard...</p>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <GiftIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Business Not Found</h2>
          <p className="text-gray-600 mb-4">Your business profile hasn't been set up yet.</p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> If you're seeing this page, make sure you've run the gift card database schema in your Supabase SQL Editor.
            </p>
          </div>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            Set Up Business Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{business.business_name}</h1>
              <p className="text-gray-600">Business Dashboard</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
                <PlusIcon className="h-5 w-5 mr-2" />
                Create Gift Card
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <GiftIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Cards</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalCards}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Cards</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.activeCards}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <CurrencyDollarIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Sales</p>
                <p className="text-2xl font-semibold text-gray-900">${stats.totalSales}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <UsersIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Customers</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalCustomers}</p>
              </div>
            </div>
          </div>
        </div>

        {/* QR Code Generator */}
        <div className="mb-8">
          {business && (
            <QRCodeGenerator businessId={business.id} businessName={business.business_name} />
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Gift Cards Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Gift Cards</h3>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    View All
                  </button>
                </div>
              </div>
              <div className="p-6">
                {giftCards.length === 0 ? (
                  <div className="text-center py-8">
                    <GiftIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Gift Cards Yet</h3>
                    <p className="text-gray-600 mb-4">Create your first gift card to start attracting customers.</p>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                      Create First Card
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {giftCards.slice(0, 5).map((card) => (
                      <div key={card.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900">{card.name}</h4>
                            <p className="text-sm text-gray-600">{card.description}</p>
                            <div className="flex items-center mt-2 space-x-4">
                              <span className="text-sm text-gray-500">
                                Price: ${card.card_price}
                              </span>
                              <span className="text-sm text-gray-500">
                                Value: ${card.discount_value}
                              </span>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                card.is_active 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {card.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button className="text-blue-600 hover:text-blue-800">
                              <EyeIcon className="h-5 w-5" />
                            </button>
                            <button className="text-gray-600 hover:text-gray-800">
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            <button className="text-red-600 hover:text-red-800">
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center">
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Create Gift Card
                </button>
                <button className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 flex items-center justify-center">
                  <UsersIcon className="h-5 w-5 mr-2" />
                  Manage Services
                </button>
                <button className="w-full bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 flex items-center justify-center">
                  <ChartBarIcon className="h-5 w-5 mr-2" />
                  View Analytics
                </button>
                <button className="w-full bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 flex items-center justify-center">
                  <CogIcon className="h-5 w-5 mr-2" />
                  Settings
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="text-sm">
                  <p className="text-gray-900">New customer purchased card</p>
                  <p className="text-gray-500">2 hours ago</p>
                </div>
                <div className="text-sm">
                  <p className="text-gray-900">Gift card redeemed</p>
                  <p className="text-gray-500">1 day ago</p>
                </div>
                <div className="text-sm">
                  <p className="text-gray-900">New service added</p>
                  <p className="text-gray-500">2 days ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Customers Section - Full Width */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Registered Customers</h3>
                <span className="text-sm text-gray-500">{customers.length} customers</span>
              </div>
            </div>
            <div className="p-6">
              {customers.length === 0 ? (
                <div className="text-center py-8">
                  <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Customers Yet</h3>
                  <p className="text-gray-600 mb-4">Customers will appear here when they register through your QR code or link.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {customers.slice(0, 12).map((customerData) => (
                    <div key={customerData.registration.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">
                            {customerData.customer.display_name?.charAt(0) || customerData.customer.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {customerData.customer.display_name || 'Unknown Customer'}
                          </h4>
                          <p className="text-sm text-gray-600">{customerData.customer.email}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {customerData.customer.phone_number && (
                          <p className="text-sm text-gray-500">{customerData.customer.phone_number}</p>
                        )}
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-blue-600">
                            {customerData.points?.points || 0} Points
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            customerData.registration.welcome_gift_awarded 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {customerData.registration.welcome_gift_awarded ? 'Welcome Gift Given' : 'New Customer'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          Registered: {new Date(customerData.registration.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="mt-3 flex space-x-2">
                        <button className="flex-1 text-blue-600 hover:text-blue-800 text-sm font-medium">
                          View Details
                        </button>
                        <button className="flex-1 text-green-600 hover:text-green-800 text-sm font-medium">
                          Add Points
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {customers.length > 12 && (
                <div className="text-center pt-6">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    View All {customers.length} Customers
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
