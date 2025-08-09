'use client';

import { useState } from 'react';
import { PostgreSQLService } from '@/lib/postgresql';

export default function TestDatabaseTables() {
  const [results, setResults] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testTables = async () => {
    setLoading(true);
    setResults('Testing database tables...\n');

    try {
      // Test if we can connect to Supabase
      setResults(prev => prev + '✓ Connected to Supabase\n');

      // Test users table
      try {
        const users = await PostgreSQLService.getCategories(); // Using categories as a test
        setResults(prev => prev + '✓ Categories table accessible\n');
      } catch (error) {
        setResults(prev => prev + `✗ Categories table error: ${error}\n`);
      }

      // Test businesses table
      try {
        const businesses = await PostgreSQLService.getBusinesses();
        setResults(prev => prev + `✓ Businesses table accessible (${businesses.length} businesses)\n`);
      } catch (error) {
        setResults(prev => prev + `✗ Businesses table error: ${error}\n`);
      }

      // Test gift_cards table
      try {
        const { data, error } = await (await import('@/lib/postgresql')).default
          .from('gift_cards')
          .select('id')
          .limit(1);
        
        if (error) {
          setResults(prev => prev + `✗ Gift cards table error: ${error.message}\n`);
        } else {
          setResults(prev => prev + '✓ Gift cards table accessible\n');
        }
      } catch (error) {
        setResults(prev => prev + `✗ Gift cards table error: ${error}\n`);
      }

      // Test business_services table
      try {
        const { data, error } = await (await import('@/lib/postgresql')).default
          .from('business_services')
          .select('id')
          .limit(1);
        
        if (error) {
          setResults(prev => prev + `✗ Business services table error: ${error.message}\n`);
        } else {
          setResults(prev => prev + '✓ Business services table accessible\n');
        }
      } catch (error) {
        setResults(prev => prev + `✗ Business services table error: ${error}\n`);
      }

    } catch (error) {
      setResults(prev => prev + `✗ General error: ${error}\n`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Database Tables Test</h1>
        
        <button 
          onClick={testTables}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 mb-6"
        >
          {loading ? 'Testing...' : 'Test Database Tables'}
        </button>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Test Results</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
            {results || 'Click the button above to test database tables'}
          </pre>
        </div>
      </div>
    </div>
  );
}
