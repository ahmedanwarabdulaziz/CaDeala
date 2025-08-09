'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import { PostgreSQLService, DatabaseBusinessApplication } from '@/lib/postgresql';
import {
  BuildingOfficeIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

export default function AdminBusinessesPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<DatabaseBusinessApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<DatabaseBusinessApplication | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const applicationsData = await PostgreSQLService.getBusinessApplications();
      setApplications(applicationsData);
    } catch (error) {
      console.error('Error loading business applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewApplication = (application: DatabaseBusinessApplication) => {
    setSelectedApplication(application);
    setShowModal(true);
  };

  const handleApproveApplication = async (applicationId: string) => {
    try {
      // First, get the application details to find the user_id
      const application = applications.find(app => app.id === applicationId);
      if (!application) {
        throw new Error('Application not found');
      }

      // Update the business application status
      await PostgreSQLService.updateBusinessApplication(applicationId, { status: 'approved' });
      
      // Update the user's role to 'business'
      await PostgreSQLService.updateUser(application.user_id, { role: 'business' });
      
      // Create a business record for the approved application
      const businessData = {
        application_id: applicationId,
        business_name: application.business_name,
        category_id: application.primary_category,
        subcategory_id: application.subcategories?.[0] || null,
        description: application.description,
        logo: application.logo || '',
        banner_image: application.business_photos?.[0] || '',
        square_image: application.business_photos?.[0] || '',
        is_active: true,
        is_verified: true,
        verification_date: new Date().toISOString(),
        verified_by: user?.uid,
        owner_id: application.user_id
      };

      await PostgreSQLService.createBusiness(businessData);
      
      console.log(`User ${application.user_id} role updated to 'business' and business record created for approved application ${applicationId}`);
      
      await loadApplications(); // Reload the list
      setShowModal(false);
      alert('Application approved successfully!');
    } catch (error) {
      console.error('Error approving application:', error);
      alert('Error approving application. Please try again.');
    }
  };

  const handleRejectApplication = async (applicationId: string) => {
    try {
      await PostgreSQLService.updateBusinessApplication(applicationId, { status: 'rejected' });
      await loadApplications(); // Reload the list
      setShowModal(false);
      alert('Application rejected successfully!');
    } catch (error) {
      console.error('Error rejecting application:', error);
      alert('Error rejecting application. Please try again.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <ClockIcon className="h-3 w-3 mr-1" />
            Pending
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircleIcon className="h-3 w-3 mr-1" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircleIcon className="h-3 w-3 mr-1" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Unknown
          </span>
        );
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Business Applications</h1>
            <p className="mt-2 text-sm text-gray-700">
              Review and manage business registration applications
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Business
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Applied
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {applications.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                          No business applications found
                        </td>
                      </tr>
                    ) : (
                      applications.map((application) => (
                        <tr key={application.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {application.business_name}
                                </div>
                                                                 <div className="text-sm text-gray-500">
                                   {application.business_type} • {application.industry}
                                 </div>
                              </div>
                            </div>
                          </td>
                                                     <td className="px-6 py-4 whitespace-nowrap">
                             <div className="text-sm text-gray-900">{application.contact_name}</div>
                             <div className="text-sm text-gray-500">{application.contact_email}</div>
                             <div className="text-sm text-gray-500">{application.contact_phone}</div>
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap">
                             <div className="text-sm text-gray-900">
                               {application.city}, {application.state}
                             </div>
                             <div className="text-sm text-gray-500">{application.country}</div>
                           </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(new Date(application.applied_at))}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(application.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleViewApplication(application)}
                              className="text-blue-600 hover:text-blue-900 mr-4"
                            >
                              <EyeIcon className="h-5 w-5" />
                            </button>
                            {application.status === 'pending' && (
                              <div className="inline-flex space-x-2">
                                <button
                                  onClick={() => handleApproveApplication(application.id)}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  <CheckCircleIcon className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => handleRejectApplication(application.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <XCircleIcon className="h-5 w-5" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Application Detail Modal */}
      {showModal && selectedApplication && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Business Application Details</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6 max-h-96 overflow-y-auto">
                {/* Business Information */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Business Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Business Name</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedApplication.business_name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Business Type</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedApplication.business_type}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Industry</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedApplication.industry}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Year Established</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedApplication.year_established}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Business Phone</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedApplication.business_phone}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Business Email</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedApplication.business_email}</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedApplication.description}</p>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Contact Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Contact Name</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedApplication.contact_name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Position/Title</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedApplication.contact_title}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Contact Phone</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedApplication.contact_phone}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Contact Email</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedApplication.contact_email}</p>
                    </div>
                  </div>
                </div>

                {/* Location Information */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Location Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Street Address</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedApplication.street_address}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">City</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedApplication.city}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">State/Province</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedApplication.state}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">ZIP/Postal Code</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedApplication.zip_code}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Country</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedApplication.country}</p>
                    </div>
                  </div>
                </div>

                {/* Business Details */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Business Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Employee Count</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedApplication.employee_count}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Revenue Range</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedApplication.revenue_range}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">License Number</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedApplication.license_number}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tax ID</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedApplication.tax_id}</p>
                    </div>
                  </div>
                </div>

                {/* Application Status */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Application Status</h4>
                  <div className="flex items-center space-x-4">
                    {getStatusBadge(selectedApplication.status)}
                    <span className="text-sm text-gray-500">
                                             Applied on {formatDate(new Date(selectedApplication.applied_at))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {selectedApplication.status === 'pending' && (
                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleRejectApplication(selectedApplication.id)}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
                  >
                    Reject Application
                  </button>
                  <button
                    onClick={() => handleApproveApplication(selectedApplication.id)}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md"
                  >
                    Approve Application
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
} 