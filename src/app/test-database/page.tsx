'use client';

import { useState, useEffect } from 'react';
import { PostgreSQLService, DatabaseCategory, DatabaseSubcategory } from '@/lib/postgresql';
import { DatabaseSetup } from '@/lib/setup-database';

export default function TestDatabasePage() {
  const [categories, setCategories] = useState<DatabaseCategory[]>([]);
  const [subcategories, setSubcategories] = useState<DatabaseSubcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const categoriesData = await PostgreSQLService.getCategories();
      setCategories(categoriesData);
      
      // Get subcategories for the first category if available
      if (categoriesData.length > 0) {
        const subcategoriesData = await PostgreSQLService.getSubcategories(categoriesData[0].id);
        setSubcategories(subcategoriesData);
      } else {
        setSubcategories([]);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInitializeDatabase = async () => {
    try {
      setInitializing(true);
      setError(null);
      
      await DatabaseSetup.setupDatabase();
      await loadData(); // Reload data after initialization
      
      alert('Database initialized successfully!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setInitializing(false);
    }
  };

  const handleCheckEmpty = async () => {
    try {
      const result = await DatabaseSetup.testConnection();
      alert(result.success ? 'Database has data' : 'Database is empty or not connected');
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading database data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Database Test Page</h1>
            
            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 font-medium">Error:</p>
                <p className="text-red-600">{error}</p>
              </div>
            )}
            
            {/* Database Actions */}
            <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h2 className="text-xl font-semibold text-blue-800 mb-4">Database Actions</h2>
              <div className="flex space-x-4">
                <button
                  onClick={handleCheckEmpty}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Check if Database is Empty
                </button>
                <button
                  onClick={handleInitializeDatabase}
                  disabled={initializing}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {initializing ? 'Initializing...' : 'Initialize Database'}
                </button>
                <button
                  onClick={loadData}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Reload Data
                </button>
              </div>
            </div>

            {/* Categories */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Categories ({categories.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                  <div key={category.id} className="bg-gray-50 p-4 rounded-lg border">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                    <div className="text-xs text-gray-500 space-y-1">
                      <p><strong>Slug:</strong> {category.slug}</p>
                      <p><strong>Order:</strong> {category.order}</p>
                      <p><strong>Featured:</strong> {category.isFeatured ? 'Yes' : 'No'}</p>
                      <p><strong>Active:</strong> {category.isActive ? 'Yes' : 'No'}</p>
                      <p><strong>SEO Title:</strong> {category.seoTitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Subcategories */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Subcategories ({subcategories.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subcategories.map((subcategory) => (
                  <div key={subcategory.id} className="bg-gray-50 p-4 rounded-lg border">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {subcategory.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{subcategory.description}</p>
                    <div className="text-xs text-gray-500 space-y-1">
                      <p><strong>Slug:</strong> {subcategory.slug}</p>
                      <p><strong>Category ID:</strong> {subcategory.categoryId}</p>
                      <p><strong>Order:</strong> {subcategory.order}</p>
                      <p><strong>Active:</strong> {subcategory.isActive ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Raw Data */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Raw Data</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Categories JSON</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="text-xs text-gray-700 overflow-x-auto">
                      {JSON.stringify(categories, null, 2)}
                    </pre>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Subcategories JSON</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="text-xs text-gray-700 overflow-x-auto">
                      {JSON.stringify(subcategories, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 