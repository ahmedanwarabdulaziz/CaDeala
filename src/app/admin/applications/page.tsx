'use client';

import { useState, useEffect } from 'react';
import { PostgreSQLService, DatabaseBusinessApplication } from '@/lib/postgresql';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/AdminLayout';
import {
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ClockIcon,
  CheckIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

export default function AdminApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<DatabaseBusinessApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<DatabaseBusinessApplication | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      loadApplications();
    }
  }, [user, filter]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const data = await PostgreSQLService.getBusinessApplications();
      setApplications(data);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (applicationId: string) => {
    try {
      await PostgreSQLService.updateBusinessApplication(applicationId, {
        status: 'approved',
        reviewed_by: user?.uid,
        reviewed_at: new Date().toISOString()
      });
      
      // Reload applications
      await loadApplications();
      setShowModal(false);
    } catch (error) {
      console.error('Error approving application:', error);
      alert('Error approving application. Please try again.');
    }
  };

  const handleReject = async (applicationId: string) => {
    try {
      await PostgreSQLService.updateBusinessApplication(applicationId, {
        status: 'rejected',
        reviewed_by: user?.uid,
        reviewed_at: new Date().toISOString()
      });
      
      // Reload applications
      await loadApplications();
      setShowModal(false);
    } catch (error) {
      console.error('Error rejecting application:', error);
      alert('Error rejecting application. Please try again.');
    }
  };

  const handleSetPending = async (applicationId: string) => {
    try {
      await PostgreSQLService.updateBusinessApplication(applicationId, {
        status: 'pending',
        reviewed_by: user?.uid,
        reviewed_at: new Date().toISOString()
      });
      
      // Reload applications
      await loadApplications();
      setShowModal(false);
    } catch (error) {
      console.error('Error setting application to pending:', error);
      alert('Error updating application status. Please try again.');
    }
  };

  const openApplicationDetails = (application: DatabaseBusinessApplication) => {
    setSelectedApplication(application);
    setShowModal(true);
  };

  const filteredApplications = applications.filter(app => {
    const matchesFilter = filter === 'all' || app.status === filter;
    const matchesSearch = app.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.user_email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You must be logged in to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Business Applications</h1>
          <p className="mt-1 text-sm text-gray-500">
            Review and manage business upgrade applications.
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by business name, user name, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({applications.length})
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'pending'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pending ({applications.filter(a => a.status === 'pending').length})
              </button>
              <button
                onClick={() => setFilter('approved')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'approved'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Approved ({applications.filter(a => a.status === 'approved').length})
              </button>
              <button
                onClick={() => setFilter('rejected')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'rejected'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Rejected ({applications.filter(a => a.status === 'rejected').length})
              </button>
            </div>
          </div>
        </div>

        {/* Applications List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading applications...</p>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">No applications found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Business
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applicant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applied
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredApplications.map((application) => (
                    <tr key={application.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {application.business_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {application.business_type} • {application.industry}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {application.user_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {application.user_email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(application.status)}
                          <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(application.status)}`}>
                            {application.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(application.applied_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => openApplicationDetails(application)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        {/* Status Control Buttons */}
                        <div className="flex items-center space-x-2">
                          {application.status !== 'approved' && (
                            <button
                              onClick={() => handleApprove(application.id)}
                              className="text-green-600 hover:text-green-900"
                              title="Approve"
                            >
                              <CheckIcon className="h-5 w-5" />
                            </button>
                          )}
                          {application.status !== 'rejected' && (
                            <button
                              onClick={() => handleReject(application.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Reject"
                            >
                              <XMarkIcon className="h-5 w-5" />
                            </button>
                          )}
                          {application.status !== 'pending' && (
                            <button
                              onClick={() => handleSetPending(application.id)}
                              className="text-yellow-600 hover:text-yellow-900"
                              title="Set to Pending"
                            >
                              <ClockIcon className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Application Details Modal */}
        {showModal && selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-8 border-0 w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3 shadow-2xl rounded-2xl bg-white">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Application Details
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Business Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Business Information</h3>
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium">Business Name:</span>
                        <p className="text-gray-700">{selectedApplication.business_name}</p>
                      </div>
                      <div>
                        <span className="font-medium">Business Type:</span>
                        <p className="text-gray-700">{selectedApplication.business_type}</p>
                      </div>
                      <div>
                        <span className="font-medium">Industry:</span>
                        <p className="text-gray-700">{selectedApplication.industry}</p>
                      </div>
                      <div>
                        <span className="font-medium">Description:</span>
                        <p className="text-gray-700">{selectedApplication.description}</p>
                      </div>
                      <div>
                        <span className="font-medium">Year Established:</span>
                        <p className="text-gray-700">{selectedApplication.year_established}</p>
                      </div>
                      <div>
                        <span className="font-medium">Website:</span>
                        <p className="text-gray-700">{selectedApplication.website || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium">Contact Name:</span>
                        <p className="text-gray-700">{selectedApplication.contact_name}</p>
                      </div>
                      <div>
                        <span className="font-medium">Position:</span>
                        <p className="text-gray-700">{selectedApplication.contact_title}</p>
                      </div>
                      <div>
                        <span className="font-medium">Phone:</span>
                        <p className="text-gray-700">{selectedApplication.contact_phone}</p>
                      </div>
                      <div>
                        <span className="font-medium">Email:</span>
                        <p className="text-gray-700">{selectedApplication.contact_email}</p>
                      </div>
                      <div>
                        <span className="font-medium">Business Phone:</span>
                        <p className="text-gray-700">{selectedApplication.business_phone}</p>
                      </div>
                      <div>
                        <span className="font-medium">Business Email:</span>
                        <p className="text-gray-700">{selectedApplication.business_email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Location Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Location Information</h3>
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium">Address:</span>
                        <p className="text-gray-700">
                          {selectedApplication.street_address}<br />
                          {selectedApplication.city}, {selectedApplication.state} {selectedApplication.zip_code}<br />
                          {selectedApplication.country}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Business Hours:</span>
                        <p className="text-gray-700">
                          {selectedApplication.business_hours?.open} - {selectedApplication.business_hours?.close}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Multiple Locations:</span>
                        <p className="text-gray-700">{selectedApplication.has_multiple_locations ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Business Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Business Details</h3>
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium">Employee Count:</span>
                        <p className="text-gray-700">{selectedApplication.employee_count}</p>
                      </div>
                      <div>
                        <span className="font-medium">Revenue Range:</span>
                        <p className="text-gray-700">{selectedApplication.revenue_range}</p>
                      </div>
                      <div>
                        <span className="font-medium">License Number:</span>
                        <p className="text-gray-700">{selectedApplication.license_number}</p>
                      </div>
                      <div>
                        <span className="font-medium">Tax ID:</span>
                        <p className="text-gray-700">{selectedApplication.tax_id}</p>
                      </div>
                      <div>
                        <span className="font-medium">Specializations:</span>
                        <p className="text-gray-700">{selectedApplication.specializations?.join(', ') || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Documents Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Documents & Media</h3>
                    <div className="space-y-4">
                      {/* Business Logo */}
                      {selectedApplication.logo && (
                        <div>
                          <span className="font-medium">Business Logo:</span>
                          <div className="mt-2">
                            <img 
                              src={selectedApplication.logo} 
                              alt="Business Logo" 
                              className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                            />
                          </div>
                        </div>
                      )}

                      {/* Business Photos */}
                      {selectedApplication.business_photos && selectedApplication.business_photos.length > 0 && (
                        <div>
                          <span className="font-medium">Business Photos:</span>
                          <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                            {selectedApplication.business_photos.map((photo, index) => (
                              <img 
                                key={index}
                                src={photo} 
                                alt={`Business Photo ${index + 1}`} 
                                className="w-full h-24 object-cover rounded-lg border border-gray-200"
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Legal Documents */}
                      {selectedApplication.documents && (
                        <div className="space-y-2">
                          <span className="font-medium">Legal Documents:</span>
                          <div className="space-y-2">
                            {selectedApplication.documents.registration_certificate && (
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-600">Registration Certificate:</span>
                                <a 
                                  href={selectedApplication.documents.registration_certificate} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 text-sm underline"
                                >
                                  View Document
                                </a>
                              </div>
                            )}
                            {selectedApplication.documents.business_license && (
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-600">Business License:</span>
                                <a 
                                  href={selectedApplication.documents.business_license} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 text-sm underline"
                                >
                                  View Document
                                </a>
                              </div>
                            )}
                            {selectedApplication.documents.tax_certificate && (
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-600">Tax Certificate:</span>
                                <a 
                                  href={selectedApplication.documents.tax_certificate} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 text-sm underline"
                                >
                                  View Document
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Social Media */}
                      {selectedApplication.social_media && (
                        <div>
                          <span className="font-medium">Social Media:</span>
                          <div className="mt-2 space-y-1 text-sm">
                            {selectedApplication.social_media.facebook && (
                              <div>Facebook: <a href={selectedApplication.social_media.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">View Profile</a></div>
                            )}
                            {selectedApplication.social_media.instagram && (
                              <div>Instagram: <a href={selectedApplication.social_media.instagram} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">View Profile</a></div>
                            )}
                            {selectedApplication.social_media.twitter && (
                              <div>Twitter: <a href={selectedApplication.social_media.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">View Profile</a></div>
                            )}
                            {selectedApplication.social_media.linkedin && (
                              <div>LinkedIn: <a href={selectedApplication.social_media.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">View Profile</a></div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex justify-end space-x-4">
                    {selectedApplication.status !== 'rejected' && (
                      <button
                        onClick={() => handleReject(selectedApplication.id)}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Reject Application
                      </button>
                    )}
                    {selectedApplication.status !== 'approved' && (
                      <button
                        onClick={() => handleApprove(selectedApplication.id)}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Approve Application
                      </button>
                    )}
                    {selectedApplication.status !== 'pending' && (
                      <button
                        onClick={() => handleSetPending(selectedApplication.id)}
                        className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                      >
                        Set to Pending
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
} 