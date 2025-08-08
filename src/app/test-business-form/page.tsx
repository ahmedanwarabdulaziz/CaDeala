'use client';

import { useState } from 'react';
import BusinessRegistrationModal from '@/components/BusinessRegistrationModal';

export default function TestBusinessFormPage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Business Registration Test</h1>
        <p className="text-gray-600 mb-8">Test the business registration form with PostgreSQL</p>
        
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors"
        >
          Open Business Registration Form
        </button>
        
        <div className="mt-8 text-left max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">What to Test:</h2>
          <ul className="space-y-2 text-gray-600">
            <li>✅ Fill out the business registration form</li>
            <li>✅ Submit the application (it will save to PostgreSQL)</li>
            <li>✅ Check the admin panel at <code className="bg-gray-100 px-2 py-1 rounded">/admin/applications</code></li>
            <li>✅ Approve or reject the application</li>
          </ul>
        </div>
      </div>
      
      <BusinessRegistrationModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
}
