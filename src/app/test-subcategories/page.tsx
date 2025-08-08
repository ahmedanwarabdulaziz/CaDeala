'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { FirebaseService } from '@/lib/firebase-admin';
import { Category, Subcategory } from '@/types/admin';

export default function TestSubcategoriesPage() {
  const params = useParams();
  const categoryId = params.id as string;
  const [category, setCategory] = useState<Category | null>(null);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (categoryId) {
      testSubcategories();
    }
  }, [categoryId]);

  const testSubcategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Testing subcategories for categoryId:', categoryId);
      
      // Test getting category
      console.log('📋 Getting category...');
      const categoryData = await FirebaseService.getCategory(categoryId);
      console.log('✅ Category data:', categoryData);
      setCategory(categoryData);
      
      // Test getting subcategories
      console.log('📋 Getting subcategories...');
      const subcategoriesData = await FirebaseService.getSubcategories(categoryId);
      console.log('✅ Subcategories data:', subcategoriesData);
      setSubcategories(subcategoriesData);
      
    } catch (err) {
      console.error('❌ Error testing subcategories:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const initializeDatabase = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🚀 Initializing database...');
      const { initializeDatabase } = await import('@/lib/init-database');
      await initializeDatabase();
      console.log('✅ Database initialized');
      
      // Reload data
      await testSubcategories();
      
    } catch (err) {
      console.error('❌ Error initializing database:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Testing subcategories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Subcategories Test Page</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">Category ID: {categoryId}</p>
              <button
                onClick={testSubcategories}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Test Subcategories
              </button>
            </div>
            <div>
              <button
                onClick={initializeDatabase}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Initialize Database
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="text-red-800 font-semibold mb-2">Error</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {category && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Category Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium">{category.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Slug</p>
                <p className="font-medium">{category.slug}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Description</p>
                <p className="font-medium">{category.description}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="font-medium">{category.isActive ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Subcategories ({subcategories.length})</h2>
          {subcategories.length === 0 ? (
            <p className="text-gray-500">No subcategories found for this category.</p>
          ) : (
            <div className="space-y-4">
              {subcategories.map((subcategory) => (
                <div key={subcategory.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-medium">{subcategory.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Slug</p>
                      <p className="font-medium">{subcategory.slug}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Description</p>
                      <p className="font-medium">{subcategory.description}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Active</p>
                      <p className="font-medium">{subcategory.isActive ? 'Yes' : 'No'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Order</p>
                      <p className="font-medium">{subcategory.order}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Category ID</p>
                      <p className="font-medium">{subcategory.categoryId}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 