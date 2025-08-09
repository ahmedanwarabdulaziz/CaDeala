'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/postgresql';

export default function TestTables() {
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkTables();
  }, []);

  const checkTables = async () => {
    const tables = [
      'customer_registrations',
      'business_registration_links',
      'business_reward_configs',
      'customer_points',
      'points_transactions'
    ];

    const results: any = {};

    for (const table of tables) {
      try {
        console.log(`Checking table: ${table}`);
        const { data, error } = await supabase
          .from(table)
          .select('id')
          .limit(1);
        
        if (error) {
          console.error(`Error checking ${table}:`, error);
          results[table] = { exists: false, error: error.message };
        } else {
          console.log(`Table ${table} exists, count:`, data?.length || 0);
          results[table] = { exists: true, count: data?.length || 0 };
        }
      } catch (err: any) {
        console.error(`Exception checking ${table}:`, err);
        results[table] = { exists: false, error: err.message };
      }
    }

    setResults(results);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Checking Tables...</h1>
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-2">
                {['customer_registrations', 'business_registration_links', 'business_reward_configs', 'customer_points', 'points_transactions'].map((table) => (
                  <div key={table} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Database Tables Status</h1>
          
          <div className="space-y-4">
            {Object.entries(results).map(([table, result]: [string, any]) => (
              <div key={table} className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-2">{table}</h3>
                {result.exists ? (
                  <div className="flex items-center text-green-600">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>✅ Table exists</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span>❌ Table does not exist</span>
                    {result.error && (
                      <div className="ml-4 text-sm text-gray-500">
                        Error: {result.error}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-medium text-yellow-800 mb-2">Next Steps</h3>
            <p className="text-yellow-700 text-sm">
              If any tables are missing, you need to run the SQL script from <code className="bg-yellow-100 px-1 rounded">setup-database.sql</code> in your Supabase SQL Editor.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
