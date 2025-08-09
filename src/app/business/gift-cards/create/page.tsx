'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { PostgreSQLService } from '@/lib/postgresql';
import { FileUploadService } from '@/lib/file-upload';
import {
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  ClockIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  TagIcon
} from '@heroicons/react/24/outline';

interface Service {
  id: string;
  name: string;
  description: string;
  original_price: number;
  discount_price: number;
  discount_percentage: number;
  service_type: string;
}

interface TimeSlot {
  day_of_week: number;
  start_time: string;
  end_time: string;
}

export default function CreateGiftCard() {
  const router = useRouter();
  const { user } = useAuth();
  const [business, setBusiness] = useState<any>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    service_id: '',
    card_price: '',
    original_value: '',
    discount_value: '',
    card_type: 'dead_hour',
    validity_hours: 24,
    max_purchases: '',
    time_slots: [] as TimeSlot[]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      loadBusinessData();
    }
  }, [user]);

  const loadBusinessData = async () => {
    try {
      setLoading(true);
      
      // Load business profile
      const businessData = await PostgreSQLService.getBusinessByUserId(user?.uid);
      setBusiness(businessData);

      // Load services
      const servicesData = await PostgreSQLService.getBusinessServices(businessData?.id);
      setServices(servicesData || []);

    } catch (error) {
      console.error('Error loading business data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleServiceChange = (serviceId: string) => {
    const selectedService = services.find(s => s.id === serviceId);
    if (selectedService) {
      setFormData(prev => ({
        ...prev,
        service_id: serviceId,
        original_value: selectedService.original_price.toString(),
        discount_value: selectedService.discount_price.toString()
      }));
    }
  };

  const addTimeSlot = () => {
    setFormData(prev => ({
      ...prev,
      time_slots: [...prev.time_slots, {
        day_of_week: 1, // Monday
        start_time: '09:00',
        end_time: '17:00'
      }]
    }));
  };

  const removeTimeSlot = (index: number) => {
    setFormData(prev => ({
      ...prev,
      time_slots: prev.time_slots.filter((_, i) => i !== index)
    }));
  };

  const updateTimeSlot = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      time_slots: prev.time_slots.map((slot, i) => 
        i === index ? { ...slot, [field]: value } : slot
      )
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Gift card name is required';
    }

    if (!formData.service_id) {
      newErrors.service_id = 'Please select a service';
    }

    if (!formData.card_price || parseFloat(formData.card_price) <= 0) {
      newErrors.card_price = 'Card price must be greater than 0';
    }

    if (!formData.original_value || parseFloat(formData.original_value) <= 0) {
      newErrors.original_value = 'Original value must be greater than 0';
    }

    if (!formData.discount_value || parseFloat(formData.discount_value) <= 0) {
      newErrors.discount_value = 'Discount value must be greater than 0';
    }

    if (formData.time_slots.length === 0) {
      newErrors.time_slots = 'At least one time slot is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      // Create gift card
      const giftCardData = {
        business_id: business.id,
        service_id: formData.service_id,
        name: formData.name,
        description: formData.description,
        card_price: parseFloat(formData.card_price),
        original_value: parseFloat(formData.original_value),
        discount_value: parseFloat(formData.discount_value),
        card_type: formData.card_type,
        validity_hours: formData.validity_hours,
        max_purchases: formData.max_purchases ? parseInt(formData.max_purchases) : null,
        time_slots: formData.time_slots
      };

      await PostgreSQLService.createGiftCard(giftCardData);

      // Redirect to gift cards list
      router.push('/business/gift-cards');

    } catch (error) {
      console.error('Error creating gift card:', error);
      setErrors({ submit: 'Failed to create gift card. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Business Not Found</h2>
          <p className="text-gray-600 mb-4">Please set up your business profile first.</p>
          <button 
            onClick={() => router.push('/business-registration')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <button
              onClick={() => router.back()}
              className="mr-4 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create Gift Card</h1>
              <p className="text-gray-600">Design your perfect gift card offer</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gift Card Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Relaxation Special"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Type
                </label>
                <select
                  value={formData.card_type}
                  onChange={(e) => handleInputChange('card_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="dead_hour">Dead Hour Special</option>
                  <option value="regular">Regular Offer</option>
                  <option value="promotional">Promotional</option>
                </select>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe your gift card offer..."
              />
            </div>
          </div>

          {/* Service Selection */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Service Selection</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Service *
              </label>
              <select
                value={formData.service_id}
                onChange={(e) => handleServiceChange(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.service_id ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Choose a service...</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} - ${service.original_price} (${service.discount_price} with discount)
                  </option>
                ))}
              </select>
              {errors.service_id && (
                <p className="mt-1 text-sm text-red-600">{errors.service_id}</p>
              )}
            </div>

            {services.length === 0 && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  No services found. Please add services first.
                </p>
                <button
                  type="button"
                  onClick={() => router.push('/business/services/create')}
                  className="mt-2 text-sm text-yellow-800 underline hover:no-underline"
                >
                  Add Service
                </button>
              </div>
            )}
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Pricing</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Price (Customer Pays) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.card_price}
                    onChange={(e) => handleInputChange('card_price', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.card_price ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0.50"
                  />
                </div>
                {errors.card_price && (
                  <p className="mt-1 text-sm text-red-600">{errors.card_price}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Original Value *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.original_value}
                    onChange={(e) => handleInputChange('original_value', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.original_value ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="25.00"
                  />
                </div>
                {errors.original_value && (
                  <p className="mt-1 text-sm text-red-600">{errors.original_value}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Value *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.discount_value}
                    onChange={(e) => handleInputChange('discount_value', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.discount_value ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="20.00"
                  />
                </div>
                {errors.discount_value && (
                  <p className="mt-1 text-sm text-red-600">{errors.discount_value}</p>
                )}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Validity (Hours)
                </label>
                <input
                  type="number"
                  value={formData.validity_hours}
                  onChange={(e) => handleInputChange('validity_hours', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="24"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Purchases (Optional)
                </label>
                <input
                  type="number"
                  value={formData.max_purchases}
                  onChange={(e) => handleInputChange('max_purchases', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Unlimited"
                />
              </div>
            </div>
          </div>

          {/* Time Availability */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-gray-900">Time Availability</h2>
              <button
                type="button"
                onClick={addTimeSlot}
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                <PlusIcon className="h-5 w-5 mr-1" />
                Add Time Slot
              </button>
            </div>

            {formData.time_slots.length === 0 ? (
              <div className="text-center py-8">
                <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Time Slots</h3>
                <p className="text-gray-600 mb-4">Add time slots when your gift card is available.</p>
                <button
                  type="button"
                  onClick={addTimeSlot}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Add First Time Slot
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.time_slots.map((slot, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-medium text-gray-900">Time Slot {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeTimeSlot(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Day of Week
                        </label>
                        <select
                          value={slot.day_of_week}
                          onChange={(e) => updateTimeSlot(index, 'day_of_week', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value={0}>Sunday</option>
                          <option value={1}>Monday</option>
                          <option value={2}>Tuesday</option>
                          <option value={3}>Wednesday</option>
                          <option value={4}>Thursday</option>
                          <option value={5}>Friday</option>
                          <option value={6}>Saturday</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Start Time
                        </label>
                        <input
                          type="time"
                          value={slot.start_time}
                          onChange={(e) => updateTimeSlot(index, 'start_time', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          End Time
                        </label>
                        <input
                          type="time"
                          value={slot.end_time}
                          onChange={(e) => updateTimeSlot(index, 'end_time', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {errors.time_slots && (
              <p className="mt-2 text-sm text-red-600">{errors.time_slots}</p>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                'Create Gift Card'
              )}
            </button>
          </div>

          {errors.submit && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
