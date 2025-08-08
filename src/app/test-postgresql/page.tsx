'use client';

import { useState } from 'react';
import { supabase, PostgreSQLService } from '@/lib/postgresql';
import { DatabaseSetup } from '@/lib/setup-database';

export default function TestPostgreSQLPage() {
  const [status, setStatus] = useState<string>('');
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [envStatus, setEnvStatus] = useState<any>(null);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testEnvironmentVariables = async () => {
    const envStatus = await DatabaseSetup.testEnvironmentVariables();
    setEnvStatus(envStatus);
    addLog(`Environment check: URL=${envStatus.supabaseUrl}, Key=${envStatus.supabaseAnonKey}`);
  };

  const testConnection = async () => {
    setLoading(true);
    addLog('Testing PostgreSQL connection...');
    
    try {
      const result = await DatabaseSetup.testConnection();
      if (result.success) {
        setStatus('✅ PostgreSQL connection successful');
        addLog('✅ Connection test passed');
        addLog(`Retrieved ${result.data?.length || 0} records`);
      } else {
        setStatus('❌ PostgreSQL connection failed');
        addLog(`❌ Connection test failed: ${result.error}`);
      }
    } catch (error) {
      setStatus('❌ PostgreSQL connection error');
      addLog(`❌ Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testUserOperations = async () => {
    setLoading(true);
    addLog('Testing user operations...');
    
    try {
      // Test creating a user
      const testUser = {
        id: 'test-user-' + Date.now(),
        email: 'test@example.com',
        display_name: 'Test User',
        role: 'customer' as const,
        user_code: 'CA' + Math.floor(Math.random() * 100000).toString().padStart(5, '0'),
        is_email_verified: false
      };

      await PostgreSQLService.createUser(testUser);
      addLog('✅ User created successfully');

      // Test getting the user
      const retrievedUser = await PostgreSQLService.getUser(testUser.id);
      if (retrievedUser) {
        addLog('✅ User retrieved successfully');
        addLog(`User email: ${retrievedUser.email}`);
      } else {
        addLog('❌ User retrieval failed');
      }

    } catch (error: any) {
      addLog(`❌ User operations error: ${error.message || error}`);
      console.error('User operations error details:', error);
    } finally {
      setLoading(false);
    }
  };

  const testCategoryOperations = async () => {
    setLoading(true);
    addLog('Testing category operations...');
    
    try {
      const categories = await PostgreSQLService.getCategories();
      addLog(`✅ Retrieved ${categories.length} categories`);
      
      if (categories.length > 0) {
        addLog(`Sample category: ${categories[0].name}`);
      } else {
        addLog('No categories found - this is normal if no sample data was added');
      }
    } catch (error: any) {
      addLog(`❌ Category operations error: ${error.message || error}`);
      console.error('Category operations error details:', error);
    } finally {
      setLoading(false);
    }
  };

  const testSupabaseClient = async () => {
    setLoading(true);
    addLog('Testing Supabase client directly...');
    
    try {
      if (!supabase) {
        addLog('❌ Supabase client not initialized');
        return;
      }
      
      // Test basic Supabase client
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .limit(1);
      
      if (error) {
        addLog(`❌ Supabase client error: ${error.message}`);
        console.error('Supabase error details:', error);
      } else {
        addLog('✅ Supabase client working');
        addLog(`Data: ${JSON.stringify(data)}`);
      }
    } catch (error: any) {
      addLog(`❌ Supabase client error: ${error.message || error}`);
      console.error('Supabase client error details:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
    setStatus('');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            PostgreSQL Database Test
          </h1>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Status</h2>
            <div className={`p-4 rounded-md ${
              status.includes('✅') ? 'bg-green-50 text-green-800' : 
              status.includes('❌') ? 'bg-red-50 text-red-800' : 
              'bg-gray-50 text-gray-800'
            }`}>
              {status || 'No tests run yet'}
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Test Actions</h2>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={testEnvironmentVariables}
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
              >
                Check Environment
              </button>
              
              <button
                onClick={testSupabaseClient}
                disabled={loading}
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
              >
                Test Supabase Client
              </button>
              
              <button
                onClick={testConnection}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Test Connection
              </button>
              
              <button
                onClick={testUserOperations}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                Test User Operations
              </button>
              
              <button
                onClick={testCategoryOperations}
                disabled={loading}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
              >
                Test Category Operations
              </button>
              
              <button
                onClick={clearLogs}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Clear Logs
              </button>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Environment Variables</h2>
            <div className="bg-gray-100 p-4 rounded-md">
              <div className="text-sm font-mono">
                <div>SUPABASE_URL: {envStatus?.supabaseUrl || 'Checking...'}</div>
                <div>SUPABASE_ANON_KEY: {envStatus?.supabaseAnonKey || 'Checking...'}</div>
                <div className="mt-2">
                  <strong>Client Status:</strong> {envStatus?.hasUrl && envStatus?.hasKey ? '✅ Ready' : '❌ Not Ready'}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Test Logs</h2>
            <div className="bg-gray-900 text-green-400 p-4 rounded-md h-64 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-gray-500">No logs yet. Run a test to see results.</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="font-mono text-sm">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
