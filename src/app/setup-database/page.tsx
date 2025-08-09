'use client';

import { useState } from 'react';

export default function SetupDatabase() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const runSQL = async () => {
    setLoading(true);
    setResult('');

    try {
      const response = await fetch('/api/setup-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(`✅ ${data.message}\n\n${data.results?.map((r: any) => r.success ? '✅' : '❌' + ' ' + r.sql).join('\n') || ''}`);
      } else {
        setResult(`❌ Error: ${data.error}\n\n${data.note || ''}`);
      }
    } catch (error: any) {
      setResult(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Database Setup - Post-Purchase Registration System
          </h1>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-yellow-800 mb-2">⚠️ Important Note</h3>
            <p className="text-yellow-700 text-sm">
              The database tables need to be created manually in your Supabase dashboard. 
              Please follow the steps below:
            </p>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-blue-800 mb-2">📋 Manual Setup Instructions</h3>
            <ol className="text-blue-700 text-sm space-y-2">
              <li>1. Go to your <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline font-medium">Supabase Dashboard</a></li>
              <li>2. Select your project</li>
              <li>3. Navigate to <strong>SQL Editor</strong> in the left sidebar</li>
              <li>4. Copy the entire content from the <code className="bg-blue-100 px-1 rounded">setup-database.sql</code> file</li>
              <li>5. Paste it into the SQL Editor</li>
              <li>6. Click <strong>"Run"</strong> to execute the SQL</li>
              <li>7. Wait for all statements to complete successfully</li>
            </ol>
          </div>
          
          <p className="text-gray-600 mb-6">
            This will create the necessary database tables for the post-purchase registration system:
          </p>
          
          <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
            <li>customer_registrations - Track customer registrations through QR codes</li>
            <li>business_registration_links - Store QR codes and registration links for businesses</li>
            <li>business_reward_configs - Configure rewards and points for businesses</li>
            <li>customer_points - Track customer points and rewards</li>
            <li>points_transactions - Track points transactions</li>
          </ul>

          <button
            onClick={runSQL}
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Checking database status...
              </div>
            ) : (
              'Check Database Status'
            )}
          </button>

          {result && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Result:</h3>
              <pre className="text-sm text-gray-600 whitespace-pre-wrap">{result}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
