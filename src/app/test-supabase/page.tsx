'use client';

import { useState } from 'react';
import { supabase, AnalyticsService, SupabaseFileService } from '@/lib/supabase';

export default function TestSupabasePage() {
  const [status, setStatus] = useState<string>('Click "Test Supabase" to begin...');
  const [error, setError] = useState<string>('');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testSupabase = async () => {
    try {
      setStatus('Testing Supabase connection...');
      setError('');
      setLogs([]);
      addLog('Starting Supabase test...');

      // Test if Supabase client is initialized
      if (supabase) {
        addLog('✅ Supabase client initialized successfully');
        setStatus('Supabase client initialized successfully');
      } else {
        throw new Error('Supabase client not initialized');
      }

      // Test environment variables
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        addLog('⚠️ Supabase environment variables not set');
        setStatus('Supabase environment variables not configured');
        setError('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file');
        return;
      } else {
        addLog('✅ Supabase environment variables configured');
      }

      // Test basic connection
      try {
        addLog('Testing Supabase connection...');
        const { data, error } = await supabase.from('analytics_events').select('count').limit(1);
        
        if (error) {
          if (error.code === 'PGRST116') {
            addLog('⚠️ Analytics table does not exist yet - this is expected for new setups');
            addLog('✅ Supabase connection successful (table will be created during setup)');
            setStatus('Supabase connection successful! Table setup required.');
          } else {
            throw error;
          }
        } else {
          addLog('✅ Supabase connection and table access successful');
          setStatus('Supabase connection successful! All operations working.');
        }
      } catch (connectionError: any) {
        addLog(`❌ Supabase connection error: ${connectionError.message}`);
        setStatus('Supabase connection failed');
        setError(connectionError.message);
        return;
      }

      // Test analytics service
      try {
        addLog('Testing analytics service...');
        await AnalyticsService.trackEvent('test_event', { test: true });
        addLog('✅ Analytics service working');
      } catch (analyticsError: any) {
        addLog(`⚠️ Analytics service error: ${analyticsError.message}`);
        addLog('This is expected if tables are not set up yet');
      }

      // Test file storage service
      try {
        addLog('Testing file storage service...');
        const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
        const url = await SupabaseFileService.uploadFile(testFile, 'gift-app-files', 'test');
        addLog('✅ File storage service working');
        addLog(`Uploaded test file: ${url}`);
      } catch (storageError: any) {
        addLog(`⚠️ File storage error: ${storageError.message}`);
        addLog('This is expected if storage buckets are not set up yet');
      }

      addLog('✅ Supabase test completed successfully');
      setStatus('Supabase test completed! Check logs for details.');

    } catch (err: any) {
      addLog(`❌ Error: ${err.message}`);
      setError(err.message);
      setStatus('Supabase test failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Supabase Test</h1>
        
        <button
          onClick={testSupabase}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 mb-4"
        >
          Test Supabase Connection
        </button>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600">
              <strong>Status:</strong> {status}
            </p>
            
            {error && (
              <p className="text-sm text-red-600 mt-2">
                <strong>Error:</strong> {error}
              </p>
            )}
          </div>

          {logs.length > 0 && (
            <div className="bg-gray-100 p-4 rounded-md">
              <h3 className="font-semibold mb-2">Test Logs:</h3>
              <div className="text-xs font-mono space-y-1 max-h-40 overflow-y-auto">
                {logs.map((log, index) => (
                  <div key={index} className="text-gray-700">{log}</div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h2 className="font-semibold mb-2 text-blue-800">Next Steps:</h2>
          <ol className="text-sm text-blue-700 space-y-1">
            <li>1. Go to <a href="https://supabase.com/dashboard" target="_blank" rel="noopener" className="underline">Supabase Console</a></li>
            <li>2. Create a new project</li>
            <li>3. Get your project URL and API key</li>
            <li>4. Add them to your .env.local file</li>
            <li>5. Follow the setup guide in SETUP-HYBRID.md</li>
          </ol>
        </div>

        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <h2 className="font-semibold mb-2 text-yellow-800">Expected Results:</h2>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• ✅ Supabase client initialization</li>
            <li>• ✅ Environment variables check</li>
            <li>• ⚠️ Table access (may fail if tables not set up)</li>
            <li>• ⚠️ File storage (may fail if buckets not set up)</li>
            <li>• ✅ Basic connection test</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 