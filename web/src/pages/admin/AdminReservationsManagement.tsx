import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Alert from '../../components/ui/Alert';
import type { Reservation } from '../../types';

const AdminReservationsManagement: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'cancelled' | 'expired' | 'converted'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const queryClient = useQueryClient();

  // Fetch reservations
  const {
    data: reservations = [],
    isLoading: reservationsLoading,
    error: reservationsError,
  } = useQuery<Reservation[]>({
    queryKey: ['admin', 'reservations'],
    queryFn: () => apiService.getAllReservations(),
  });

  // Approve reservation mutation
  const approveMutation = useMutation({
    mutationFn: (id: number) => apiService.approveReservation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reservations'] });
    },
  });

  // Cancel reservation mutation
  const cancelMutation = useMutation({
    mutationFn: (id: number) => apiService.cancelReservation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reservations'] });
    },
  });

  // Convert to loan mutation
  const convertToLoanMutation = useMutation({
    mutationFn: (id: number) => apiService.convertReservationToLoan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reservations'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'loans'] });
    },
  });

  // Filter reservations
  const filteredReservations = reservations.filter(reservation => {
    const matchesStatus = statusFilter === 'all' || reservation.status === statusFilter;
    const matchesSearch = !searchTerm ||
      reservation.book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.user.email.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const handleApprove = (id: number) => {
    if (window.confirm('Are you sure you want to approve this reservation?')) {
      approveMutation.mutate(id);
    }
  };

  const handleCancel = (id: number) => {
    if (window.confirm('Are you sure you want to cancel this reservation?')) {
      cancelMutation.mutate(id);
    }
  };

  const handleConvertToLoan = (id: number) => {
    if (window.confirm('Are you sure you want to convert this reservation to a loan?')) {
      convertToLoanMutation.mutate(id);
    }
  };

  if (reservationsLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner />
      </div>
    );
  }

  if (reservationsError) {
    return (
      <Alert
        type="error"
        title="Error loading reservations"
        message="Failed to load reservations data. Please try again."
      />
    );
  }

  const stats = {
    total: reservations.length,
    active: reservations.filter(r => r.status === 'active').length,
    cancelled: reservations.filter(r => r.status === 'cancelled').length,
    expired: reservations.filter(r => r.status === 'expired').length,
    converted: reservations.filter(r => r.status === 'converted').length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'converted':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isExpired = (reservation: Reservation) => {
    return reservation.expires_at && new Date(reservation.expires_at) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reservations Management</h1>
        <p className="text-gray-600 mt-2">Manage book reservations and convert them to loans</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-500">Total</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <div className="text-sm text-green-600">Active</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.converted}</div>
            <div className="text-sm text-blue-600">Converted</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
            <div className="text-sm text-red-600">Expired</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">{stats.cancelled}</div>
            <div className="text-sm text-gray-600">Cancelled</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <input
              type="text"
              placeholder="Search by book title, user name or email..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="converted">Converted</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
            }}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Reservations Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Book
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reserved
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expires
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReservations.map((reservation) => (
                <tr
                  key={reservation.id}
                  className={`hover:bg-gray-50 ${
                    isExpired(reservation) && reservation.status === 'active' ? 'bg-red-50' : ''
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {reservation.book.cover_url && (
                        <img
                          src={reservation.book.cover_url}
                          alt={reservation.book.title}
                          className="w-10 h-12 object-cover rounded mr-3"
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {reservation.book.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          #{reservation.book.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {reservation.user.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {reservation.user.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(reservation.status)}`}>
                      {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                    </span>
                    {isExpired(reservation) && reservation.status === 'active' && (
                      <div className="text-xs text-red-600 mt-1">Expired</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(reservation.reserved_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {reservation.expires_at
                      ? new Date(reservation.expires_at).toLocaleDateString()
                      : 'No expiry'
                    }
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="flex justify-end items-center space-x-2">
                      {reservation.status === 'active' && (
                        <>
                          <button
                            onClick={() => handleConvertToLoan(reservation.id)}
                            disabled={convertToLoanMutation.isPending}
                            className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                          >
                            Convert to Loan
                          </button>
                          <button
                            onClick={() => handleCancel(reservation.id)}
                            disabled={cancelMutation.isPending}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {reservation.status === 'cancelled' && (
                        <span className="text-gray-400">No actions available</span>
                      )}
                      {reservation.status === 'converted' && (
                        <span className="text-blue-600">Converted to loan</span>
                      )}
                      {reservation.status === 'expired' && (
                        <span className="text-red-600">Expired</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredReservations.length === 0 && !reservationsLoading && (
        <div className="text-center py-12">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4M3 21h18v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No reservations found</h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'all'
              ? 'No reservations match your search criteria.'
              : 'There are no reservations in the system yet.'
            }
          </p>
        </div>
      )}

      {/* Quick Actions Panel */}
      {stats.active > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Active Reservations</h4>
                  <p className="text-sm text-gray-600">
                    {stats.active} reservations waiting for action
                  </p>
                </div>
                <div className="text-2xl font-bold text-blue-600">{stats.active}</div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Conversion Rate</h4>
                  <p className="text-sm text-gray-600">
                    Reservations converted to loans
                  </p>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {stats.total > 0 ? Math.round((stats.converted / stats.total) * 100) : 0}%
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReservationsManagement;