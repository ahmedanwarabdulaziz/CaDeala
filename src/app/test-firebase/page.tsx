'use client';

import { useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function TestFirebasePage() {
  const [status, setStatus] = useState<string>('Click "Test Firebase" to begin...');
  const [error, setError] = useState<string>('');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testFirebase = async () => {
    try {
      setStatus('Testing Firebase connection...');
      setError('');
      setLogs([]);
      addLog('Starting Firebase test...');

      // Test if auth is initialized
      if (auth) {
        addLog('✅ Auth initialized successfully');
        setStatus('Auth initialized successfully');
      } else {
        throw new Error('Auth not initialized');
      }

      // Test if Firestore is initialized
      if (db) {
        addLog('✅ Firestore initialized successfully');
        setStatus('Firestore initialized successfully');
      } else {
        throw new Error('Firestore not initialized');
      }

      // Test Firestore connection by trying to write a test document
      try {
        addLog('Testing Firestore write operation...');
        const testDocRef = doc(db, 'test', 'connection-test');
        await setDoc(testDocRef, {
          timestamp: new Date(),
          message: 'Firebase connection test'
        });
        addLog('✅ Firestore write successful');
        
        // Test read operation
        addLog('Testing Firestore read operation...');
        const testDoc = await getDoc(testDocRef);
        if (testDoc.exists()) {
          addLog('✅ Firestore read successful');
          setStatus('Firebase connection successful! All operations working.');
        } else {
          throw new Error('Test document not found after write');
        }
      } catch (firestoreError: any) {
        addLog(`❌ Firestore error: ${firestoreError.message}`);
        if (firestoreError.code === 'permission-denied') {
          setStatus('Firebase connected but Firestore rules are blocking access. Check security rules.');
          setError('Permission denied - check Firestore security rules');
        } else if (firestoreError.message.includes('offline')) {
          setStatus('Firebase client is offline. Check your internet connection and Firestore database setup.');
          setError('Client offline - enable Firestore database in Firebase Console');
        } else {
          throw firestoreError;
        }
      }

    } catch (err: any) {
      addLog(`❌ Error: ${err.message}`);
      setError(err.message);
      setStatus('Firebase test failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Firebase Test</h1>
        
        <button
          onClick={testFirebase}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 mb-4"
        >
          Test Firebase Connection
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

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <h2 className="font-semibold mb-2 text-yellow-800">If Test Fails:</h2>
          <ol className="text-sm text-yellow-700 space-y-1">
            <li>1. Go to <a href="https://console.firebase.google.com/" target="_blank" rel="noopener" className="underline">Firebase Console</a></li>
            <li>2. Select your project: <strong>gift-card-north-via-marketing</strong></li>
            <li>3. Go to <strong>Firestore Database</strong> and create database</li>
            <li>4. Go to <strong>Authentication</strong> and enable Email/Password</li>
            <li>5. Set Firestore rules to allow all access for testing</li>
          </ol>
        </div>
      </div>
    </div>
  );
} 