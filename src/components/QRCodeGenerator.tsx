'use client';

import { useState, useEffect } from 'react';
import { PostgreSQLService, DatabaseBusinessRegistrationLink } from '@/lib/postgresql';
import { QrCodeIcon, DocumentDuplicateIcon, CheckIcon } from '@heroicons/react/24/outline';

interface QRCodeGeneratorProps {
  businessId: string;
  businessName: string;
}

export default function QRCodeGenerator({ businessId, businessName }: QRCodeGeneratorProps) {
  const [registrationLink, setRegistrationLink] = useState<DatabaseBusinessRegistrationLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadRegistrationLink();
  }, [businessId]);

  const loadRegistrationLink = async () => {
    try {
      setLoading(true);
      let link = await PostgreSQLService.getBusinessRegistrationLink(businessId);
      
      if (!link) {
        // Generate new registration link if none exists
        link = await PostgreSQLService.generateBusinessRegistrationLink(businessId);
      }
      
      setRegistrationLink(link);
    } catch (error) {
      console.error('Error loading registration link:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  const regenerateQRCode = async () => {
    try {
      setLoading(true);
      const newLink = await PostgreSQLService.generateBusinessRegistrationLink(businessId);
      setRegistrationLink(newLink);
    } catch (error) {
      console.error('Error regenerating QR code:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!registrationLink) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center">
          <p className="text-gray-500">Error loading QR code</p>
          <button
            onClick={loadRegistrationLink}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">QR Code for Customer Registration</h3>
        <button
          onClick={regenerateQRCode}
          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
        >
          Regenerate
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* QR Code Display */}
        <div className="text-center">
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            {registrationLink.qr_code_url ? (
              <img
                src={registrationLink.qr_code_url}
                alt="QR Code"
                className="mx-auto w-48 h-48 object-contain"
              />
            ) : (
              <div className="w-48 h-48 mx-auto bg-gray-200 rounded-lg flex items-center justify-center">
                <QrCodeIcon className="w-12 h-12 text-gray-400" />
              </div>
            )}
          </div>
          
          <p className="text-sm text-gray-600 mb-2">
            Scan this QR code to register customers
          </p>
          
          <div className="flex items-center justify-center space-x-2">
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {registrationLink.unique_code}
            </span>
            <button
              onClick={() => copyToClipboard(registrationLink.unique_code)}
              className="text-blue-600 hover:text-blue-800"
            >
              {copied ? (
                <CheckIcon className="w-4 h-4" />
              ) : (
                <DocumentDuplicateIcon className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Registration Link */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Registration Link</h4>
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <p className="text-sm text-gray-600 break-all">
              {registrationLink.landing_page_url}
            </p>
          </div>
          
          <button
            onClick={() => copyToClipboard(registrationLink.landing_page_url || '')}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {copied ? (
              <>
                <CheckIcon className="w-4 h-4" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <DocumentDuplicateIcon className="w-4 h-4" />
                <span>Copy Link</span>
              </>
            )}
          </button>

          <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
            <h5 className="font-medium text-yellow-800 mb-1">Instructions</h5>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Print this QR code and display it at your business</li>
              <li>• Customers scan the code after making a purchase</li>
              <li>• They'll get points and rewards for registering</li>
              <li>• You'll receive instant notifications</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
