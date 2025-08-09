'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { PostgreSQLService, DatabaseGiftCard } from '@/lib/postgresql';
import {
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  CurrencyDollarIcon,
  TagIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export default function GiftCardsList() {
  const router = useRouter();
  const { user } = useAuth();
  const [business, setBusiness] = useState<any>(null);
  const [giftCards, setGiftCards] = useState<DatabaseGiftCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<DatabaseGiftCard | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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

      if (businessData) {
        // Load gift cards
        const cardsData = await PostgreSQLService.getBusinessGiftCards(businessData.id);
        setGiftCards(cardsData || []);
      }

    } catch (error) {
      console.error('Error loading business data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    try {
      // TODO: Implement delete functionality
      console.log('Deleting card:', cardId);
      setShowDeleteModal(false);
      setSelectedCard(null);
      // Reload cards after deletion
      await loadBusinessData();
    } catch (error) {
      console.error('Error deleting card:', error);
    }
  };

  const getCardTypeIcon = (cardType: string) => {
    switch (cardType) {
      case 'dead_hour':
        return <ClockIcon className="h-5 w-5 text-orange-500" />;
      case 'regular':
        return <TagIcon className="h-5 w-5 text-blue-500" />;
      case 'promotional':
        return <CurrencyDollarIcon className="h-5 w-5 text-green-500" />;
      default:
        return <TagIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getCardTypeLabel = (cardType: string) => {
    switch (cardType) {
      case 'dead_hour':
        return 'Dead Hour';
      case 'regular':
        return 'Regular';
      case 'promotional':
        return 'Promotional';
      default:
        return cardType;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your gift cards...</p>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gift Cards</h1>
              <p className="text-gray-600">Manage your gift card offers</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/business/gift-cards/create')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Create Gift Card
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {giftCards.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Gift Cards Yet</h3>
            <p className="text-gray-600 mb-6">Create your first gift card to start attracting customers during your dead hours.</p>
            <button
              onClick={() => router.push('/business/gift-cards/create')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center mx-auto"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Your First Gift Card
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {giftCards.map((card) => (
              <div key={card.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* Card Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-2">
                      {getCardTypeIcon(card.card_type)}
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        card.card_type === 'dead_hour' 
                          ? 'bg-orange-100 text-orange-800'
                          : card.card_type === 'promotional'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {getCardTypeLabel(card.card_type)}
                      </span>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      card.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {card.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Card Content */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900">{card.name}</h3>
                    {card.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">{card.description}</p>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4 pt-3">
                      <div>
                        <p className="text-xs text-gray-500">Card Price</p>
                        <p className="text-lg font-semibold text-gray-900">${card.card_price}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Service Value</p>
                        <p className="text-lg font-semibold text-green-600">${card.discount_value}</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-100">
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Original: ${card.original_value}</span>
                        <span>Valid: {card.validity_hours}h</span>
                      </div>
                      {card.max_purchases && (
                        <div className="text-sm text-gray-500 mt-1">
                          Purchases: {card.current_purchases}/{card.max_purchases}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => router.push(`/business/gift-cards/${card.id}`)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="View Details"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => router.push(`/business/gift-cards/${card.id}/edit`)}
                        className="text-gray-600 hover:text-gray-800 p-1"
                        title="Edit"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCard(card);
                          setShowDeleteModal(true);
                        }}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Delete"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <button
                      onClick={() => {
                        // TODO: Implement toggle active/inactive
                        console.log('Toggle card status:', card.id);
                      }}
                      className={`px-3 py-1 text-xs rounded-full ${
                        card.is_active
                          ? 'bg-red-100 text-red-800 hover:bg-red-200'
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                    >
                      {card.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                  <XMarkIcon className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">Delete Gift Card</h3>
                <p className="text-sm text-gray-500">This action cannot be undone.</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete "{selectedCard.name}"? This will remove the gift card and all associated data.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedCard(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteCard(selectedCard.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
